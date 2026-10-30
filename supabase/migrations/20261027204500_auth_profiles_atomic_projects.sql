-- Phase 3 follow-up: make generated profiles resilient and restrict editable columns.
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  raw_username text;
  base_username text;
  raw_display_name text;
BEGIN
  raw_username := coalesce(
    new.raw_user_meta_data ->> 'user_name',
    split_part(coalesce(new.email, ''), '@', 1),
    'member'
  );
  base_username := lower(regexp_replace(raw_username, '[^a-z0-9_-]+', '-', 'g'));
  base_username := trim(both '-' from base_username);
  IF base_username !~ '^[a-z0-9]' THEN
    base_username := 'member';
  END IF;
  base_username := left(base_username, 9);

  raw_display_name := nullif(trim(coalesce(
    new.raw_user_meta_data ->> 'full_name',
    split_part(coalesce(new.email, ''), '@', 1)
  )), '');

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    new.id,
    base_username || '-' || left(replace(new.id::text, '-', ''), 20),
    left(coalesce(raw_display_name, 'Developer'), 80)
  );
  RETURN new;
END;
$$;

-- Backfill users created before the profile trigger was installed.
WITH user_rows AS (
  SELECT
    u.id,
    lower(regexp_replace(
      coalesce(u.raw_user_meta_data ->> 'user_name', split_part(coalesce(u.email, ''), '@', 1), 'member'),
      '[^a-z0-9_-]+', '-', 'g'
    )) AS clean_username,
    nullif(btrim(coalesce(
      u.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(u.email, ''), '@', 1)
    )), '') AS raw_display_name
  FROM auth.users AS u
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = u.id)
), normalized AS (
  SELECT
    id,
    CASE WHEN clean_username !~ '^[a-z0-9]' THEN 'member' ELSE left(trim(both '-' FROM clean_username), 9) END AS base_username,
    coalesce(raw_display_name, 'Developer') AS display_name
  FROM user_rows
)
INSERT INTO public.profiles (id, username, display_name)
SELECT
  id,
  base_username || '-' || left(replace(id::text, '-', ''), 20),
  left(display_name, 80)
FROM normalized
ON CONFLICT DO NOTHING;

-- Do not let direct browser clients mutate profile IDs/timestamps or future columns.
REVOKE UPDATE ON TABLE public.profiles FROM anon, authenticated;
GRANT UPDATE (username, display_name, bio) ON TABLE public.profiles TO authenticated;

-- Keep link safety consistent even when an authenticated client bypasses the API.
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_repository_url_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_repository_url_https_check
  CHECK (repository_url ~ '^https://github[.]com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?$') NOT VALID;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_demo_url_https_check
  CHECK (demo_url IS NULL OR (demo_url ~ '^https://[^[:space:]]+$' AND demo_url !~ '^https://[^/@]+@')) NOT VALID;

-- Create a project and all its tags as one transaction under the caller's identity/RLS.
CREATE OR REPLACE FUNCTION public.create_project_with_tags(
  p_name text,
  p_slug text,
  p_tagline text,
  p_description text,
  p_repository_url text,
  p_demo_url text,
  p_tags text[]
)
RETURNS TABLE (id uuid, slug text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  created_project_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.projects AS inserted_project
    (owner_id, slug, name, tagline, description, repository_url, demo_url)
  VALUES
    (auth.uid(), p_slug, p_name, p_tagline, p_description, p_repository_url, p_demo_url)
  RETURNING inserted_project.id INTO created_project_id;

  INSERT INTO public.project_tags (project_id, tag)
  SELECT created_project_id, lower(btrim(raw_tag))
  FROM unnest(p_tags) AS raw_tags(raw_tag);

  RETURN QUERY SELECT created_project_id, p_slug;
END;
$$;

REVOKE ALL ON FUNCTION public.create_project_with_tags(text, text, text, text, text, text, text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_project_with_tags(text, text, text, text, text, text, text[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_project_with_tags(text, text, text, text, text, text, text[]) TO authenticated;
