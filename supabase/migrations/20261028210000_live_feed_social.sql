-- Live dashboard feed social features. Additive only; does not modify existing project/profile rows.
CREATE TABLE public.project_votes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  value smallint NOT NULL CHECK (value IN (-1, 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

CREATE TABLE public.creator_follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followed_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id <> followed_id)
);

CREATE TABLE public.project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX project_votes_project_idx ON public.project_votes (project_id);
CREATE INDEX creator_follows_followed_idx ON public.creator_follows (followed_id, follower_id);
CREATE INDEX project_comments_project_created_idx ON public.project_comments (project_id, created_at DESC, id DESC);

-- Expose aggregate counts without making individual voter identities public.
CREATE VIEW public.project_vote_totals AS
SELECT project_id,
       count(*) FILTER (WHERE value = 1)::bigint AS upvotes,
       count(*) FILTER (WHERE value = -1)::bigint AS downvotes,
       coalesce(sum(value), 0)::bigint AS score
FROM public.project_votes
JOIN public.projects p ON p.id = project_votes.project_id
WHERE p.visibility = 'public' AND p.status = 'published'
GROUP BY project_id;

CREATE VIEW public.project_comment_totals AS
SELECT project_comments.project_id, count(*)::bigint AS comment_count
FROM public.project_comments
JOIN public.projects p ON p.id = project_comments.project_id
WHERE p.visibility = 'public' AND p.status = 'published'
GROUP BY project_comments.project_id;

ALTER TABLE public.project_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read their own project vote" ON public.project_votes FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "users create their own project vote" ON public.project_votes FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "users update their own project vote" ON public.project_votes FOR UPDATE USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "users remove their own project vote" ON public.project_votes FOR DELETE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users read their own follows" ON public.creator_follows FOR SELECT USING (follower_id = (SELECT auth.uid()));
CREATE POLICY "users follow creators as themselves" ON public.creator_follows FOR INSERT WITH CHECK (follower_id = (SELECT auth.uid()));
CREATE POLICY "users unfollow creators as themselves" ON public.creator_follows FOR DELETE USING (follower_id = (SELECT auth.uid()));

CREATE POLICY "comments on public projects are readable" ON public.project_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.visibility = 'public' AND p.status = 'published')
  OR author_id = (SELECT auth.uid())
);
CREATE POLICY "users comment as themselves on public projects" ON public.project_comments FOR INSERT WITH CHECK (
  author_id = (SELECT auth.uid())
  AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.visibility = 'public' AND p.status = 'published')
);
CREATE POLICY "authors delete their own comments" ON public.project_comments FOR DELETE USING (author_id = (SELECT auth.uid()));

REVOKE ALL ON TABLE public.project_votes, public.creator_follows, public.project_comments, public.project_vote_totals, public.project_comment_totals FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.project_vote_totals, public.project_comment_totals TO anon, authenticated;
GRANT SELECT ON TABLE public.project_comments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_votes TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.creator_follows TO authenticated;
GRANT INSERT, DELETE ON TABLE public.project_comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.bookmarks TO authenticated;
