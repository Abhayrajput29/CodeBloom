# Phase 3: Authenticated Profiles and Trustworthy Writes

## Goal

Move the foundation from auth screens to a testable identity/profile workflow. Preserve public discovery, keep account and profile mutations owner-only, and avoid enabling the social/chat systems before their data policies exist.

## Implemented in this checkpoint

- Next.js 16 `proxy.ts` refreshes Supabase SSR cookies for page requests and provides a pre-render redirect for configured signed-out requests to protected pages. Each protected server page and each API mutation still verifies the Supabase user itself; Route Handlers independently authenticate rather than trusting the Proxy.
- `/settings/profile` provides an authenticated profile editor for `username`, `display_name`, and `bio`; `GET/PATCH /api/profile` validates the session, constrains fields, checks request origin on writes, and leaves RLS in force.
- Public `/u/:handle` profiles read actual profile records when Supabase is configured; synthetic preview identities remain explicitly preview-only.
- Signup profile generation is repaired for non-ASCII/empty/long email local parts and generates a longer UUID-derived suffix. The migration also backfills users who predate the profile trigger. Self-service profile update privileges are column-limited.
- Project repository/demo URLs are HTTPS-only. Tags are normalized/deduplicated, and project-plus-tag writes use one authenticated, `SECURITY INVOKER` Postgres function so failures roll back atomically.
- Anonymous project creation remains denied; API errors no longer return raw database messages.

## Database changes not yet applied

Review and apply migrations in order in a development Supabase project:

1. `supabase/migrations/20261027153000_profiles_projects.sql`
2. `supabase/migrations/20261027204500_auth_profiles_atomic_projects.sql`

The second migration modifies the signup profile trigger, backfills missing profiles, narrows direct profile update privileges, adds `NOT VALID` HTTPS URL constraints (new/updated rows are checked immediately), and adds `create_project_with_tags`. Before validating either URL constraint, inspect and remediate any legacy rows that do not satisfy it; the migration does not silently rewrite existing URLs. It is code in this repository only until deliberately applied. No remote schema was changed by this task.

## Validation still required with Supabase

Use a test account to exercise email verification, sign-in, expired-cookie refresh, profile load/edit, username conflict, profile ownership, and project create rollback. Test the profile/project API as anonymous and as an unrelated authenticated account. Confirm Auth Site URL and the callback allowlist. Verify the exact migration SQL in a disposable Supabase project before any production application.

## Deferred

OAuth/GitHub identity linking, avatar upload/Storage, project edits/deletion/media, live project-feed queries, votes/comments/follows, notifications, private chat, moderation, Vercel deployment, and full browser/accessibility QA remain later work. This checkpoint does not assert end-to-end production readiness.
