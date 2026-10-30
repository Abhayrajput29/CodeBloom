# CodeBloom Progress

## Current checkpoint

**Phase 4 implementation checkpoint: live dashboard feed and project social actions.** The authenticated dashboard now reads public published projects and account-specific vote/bookmark/follow state from `/api/feed`; project cards support database-backed votes, bookmarks, creator follows, and comments via `/api/social`, and live project details/bookmarks resolve from the database. New migration `20261028210000_live_feed_social.sql` and a guarded runner are ready but **not applied**. Remote social writes cannot work until the migration is applied to the non-production project. Existing Phase 3 profile editing, public profile lookup, pre-render auth redirects, and atomic project creation remain wired; authenticated profile/project writes and production behavior remain unverified.

## Delivered

- Responsive shared shell: desktop navigation, central reading column, contextual discovery rail, mobile menu and bottom navigation, active-route states, keyboard skip link and focus-visible treatment.
- Dark/light tokens and theme selection: follows OS preference until an explicit choice is saved in browser storage.
- Guest Explore retains synthetic project fixtures, search, preview sorting, profile/community previews, browser-local bookmarks, and demo-only votes. The signed-in dashboard now uses the authenticated live feed and live action endpoints.
- Preview screens for publishing, notifications, messages, communities, and settings. Pending requests do not open ordinary conversations; private messaging remains unavailable.
- Accessible loading, error, success, empty and not-found treatments; reduced-motion styles; external link parsing restricted to HTTPS and GitHub repository URLs.
- Route manifest and focused tests for routes, preview sorting, project input validation, and external URLs.
- Cross-platform `scripts/install.mjs` bootstrap uses pinned pnpm and frozen-lockfile installation, preserves `.env.local`, and initializes it from the safe template only when absent. `.github/workflows/ci.yml` automates validation on pushes and pull requests.
- Public root landing with project previews, topic links, How-it-works section, CTA, theme support and responsive motion-reduced layout; signed-in visits route to the dashboard while guest Explore/project/profile pages remain open. Signup/login use a shared responsive story/form layout, matching-password validation, safe return destinations, and a first-run dashboard guide after signup or email confirmation.
- Supabase email sign-in/sign-up, confirmation callback, recovery/reset, safe return paths, client session subscription and sign-out; server `auth.getUser()` guards dashboard, publish, personal pages, and an authenticated project-creation API.
- Guest social controls keep the accessible sign-in/create-account prompt. Signed-in project votes, bookmarks, creator follows, and comments now have validated API contracts and RLS-backed storage in the pending social migration; the live mutations have not yet been exercised against Supabase. Community membership and chat remain unimplemented.
- `/settings/profile` is linked from the signed-in account menu and shell; `GET/PATCH /api/profile` verifies the server user, restricts writable profile fields, and the public `/u/:username` route prefers allowlisted live Supabase fields over clearly labelled preview fixtures.
- A follow-up migration hardens profile creation, backfills accounts predating the trigger, limits profile column updates, enforces HTTPS GitHub/demo URLs for new/updated project rows, and adds `create_project_with_tags` as an authenticated `SECURITY INVOKER` transaction. On 2026-10-28 the user ran it against the configured non-production project through `scripts/apply_phase3_followup.py`; their terminal reported successful commit and postconditions. Direct SQL did not add a Supabase CLI migration-history entry. The runner uses dry-run default, test-project-ref checks, TLS, one transaction, and postconditions.

## Automated validation (current tree, 2026-10-30)

- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm test` — 12 files, 49 tests passed, including live feed mapping, feed/action API authorization, social mutation payloads, auth journey, and safe redirect coverage.
- `pnpm build` — passed with the Webpack production builder; Next detected `/api/feed`, `/api/social`, and `/api/projects/[slug]`.

Earlier frontend smoke checks against a built preview passed for landing/signup, confirmation and password mismatch handling, signed-out dashboard redirect, and 390px layouts. The browser smoke pass for this live-feed change could not run: local policy denied loopback bind/connect to port 3000. No signup or live social action was submitted, and no new database row was created. The prior real test-account email-confirmation/callback/session check remains valid. `node scripts/install.mjs` previously completed from cache; clean clone, GitHub Actions, and Vercel deployment remain unverified. The temporary preview is stopped.

`scripts/apply_phase3_followup.py`: Python syntax/help, migration-boundary, direct/pooler project-ref, and refusal guards passed. `psycopg` 3.3.6 is installed in the ignored `.work/tools/phase3-db-venv`. On 2026-10-28 the user ran the hidden-prompt preflight and then the apply command. Their terminal reported “Migration applied and committed successfully; all post-apply checks passed.” The connection URI/password was not saved in the repository. This was direct SQL execution and did not add a Supabase CLI migration-history entry.

## Data and security boundary

- Preview projects and community/activity/message content remain synthetic. The `/dashboard` feed now returns database-backed project rows only (never silently falls back to sample feed content); guest `/explore` remains the explicitly labelled fixture preview.
- Migrations `20261027153000_profiles_projects.sql` and `20261027204500_auth_profiles_atomic_projects.sql` define the verified base project/profile tables, bookmarks, profile hardening/backfill, and atomic project-write RPC. The new `20261028210000_live_feed_social.sql` adds project votes, creator follows, comments, aggregate views and RLS/grants; it is **not applied**. Its direct runner must be explicitly confirmed for the non-production project. No production schema or records were changed.
- `.env.local` remains Git-ignored and secret values were not printed. Test-project base schema/RLS, Phase 3 follow-up postconditions, signup confirmation, email delivery, callback exchange, and test-account login were previously verified. New live-feed/action behavior has unit/API-mock coverage only; remote project reads/actions and authenticated profile/project writes remain unverified.
- GitHub API/OAuth integration, accepted-request messaging, production ranking, moderation, comprehensive security tests and deployment remain outstanding.

## Manual setup before using service-backed actions

The base and Phase 3 follow-up migrations have been applied to the configured non-production project; do not rerun either migration. The social migration is pending, and its guarded runner `scripts/apply_live_social.py` must only be run after explicitly confirming the same non-production project; it has dry-run default, hidden URI input, exact project-ref guard, one SQL transaction, and schema/RLS/grant postconditions. Neither prior direct runner registered its migration in Supabase CLI history, so reconcile migration history before any `supabase db push`. After approval/application, test live feed reads and each social action with a disposable/test project and account, remove test votes/bookmarks/follows/comments, and verify anonymous/unrelated-user RLS denial. Signup confirmation/session login are verified; profile save, project/tag creation, recovery, logout/relogin, and production behavior remain outstanding. Before deployment, configure production Auth URLs and provider-managed secrets. No production data or deployment was changed.

## Next phase

Next: explicitly confirm/apply the additive social migration on the non-production project, then use a disposable published project/test account to verify the live dashboard feed, vote/unvote, save/unsave, follow/unfollow, comment, following feed, and Bookmarks page end-to-end with cleanup and RLS negative tests. Restore local browser smoke capability, then test profile-save and authenticated project-plus-tags flows, recovery, sign-out/relogin, and accessibility. Reconcile migration history before any future Supabase CLI push; no production deployment/data changes are authorized.
