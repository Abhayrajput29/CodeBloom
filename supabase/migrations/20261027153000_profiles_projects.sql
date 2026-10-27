create extension if not exists pgcrypto;

create type public.project_visibility as enum ('public', 'unlisted', 'private');
create type public.project_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  bio text check (char_length(bio) <= 500),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*-[a-z0-9]{8}$'),
  name text not null check (char_length(name) between 2 and 80),
  tagline text not null check (char_length(tagline) between 8 and 140),
  description text not null check (char_length(description) between 20 and 2000),
  repository_url text not null check (repository_url ~ '^https?://github\\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?$'),
  demo_url text,
  visibility public.project_visibility not null default 'public',
  status public.project_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_tags (
  project_id uuid not null references public.projects(id) on delete cascade,
  tag text not null check (tag ~ '^[a-z0-9][a-z0-9 +#.-]{0,31}$'),
  primary key (project_id, tag)
);

create table public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create index projects_public_created_idx on public.projects (created_at desc, id desc) where visibility = 'public' and status = 'published';
create index project_tags_tag_idx on public.project_tags (tag, project_id);

create function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function public.set_updated_at();

create function public.create_profile_for_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare base_username text;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1), 'member'), '[^a-z0-9_-]', '-', 'g'));
  base_username := left(trim(both '-' from base_username), 24);
  insert into public.profiles (id, username, display_name)
  values (new.id, base_username || '-' || substr(new.id::text, 1, 5), coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), base_username));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_tags enable row level security;
alter table public.bookmarks enable row level security;

create policy "public profiles are readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "published public projects are readable" on public.projects for select using ((visibility = 'public' and status = 'published') or owner_id = auth.uid());
create policy "users create their projects" on public.projects for insert with check (owner_id = auth.uid());
create policy "owners manage their projects" on public.projects for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners delete their projects" on public.projects for delete using (owner_id = auth.uid());
create policy "visible project tags are readable" on public.project_tags for select using (exists (select 1 from public.projects p where p.id = project_id and ((p.visibility = 'public' and p.status = 'published') or p.owner_id = auth.uid())));
create policy "owners manage project tags" on public.project_tags for all using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())) with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "users manage their bookmarks" on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on function public.create_profile_for_new_user() from public;
grant execute on function public.set_updated_at() to authenticated;
