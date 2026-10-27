# CodeBloom Progress

## Current checkpoint

**Phase 2 — Design system, responsive application shell, and UI components.** The Phase 2 interface is implemented locally and the available automated checks pass. It is a preview-oriented frontend, not a production-ready community service or deployed website.

## Delivered

- Responsive shared shell: desktop navigation, central reading column, contextual discovery rail, mobile menu and bottom navigation, active-route states, keyboard skip link and focus-visible treatment.
- Dark/light tokens and theme selection: follows OS preference until an explicit choice is saved in browser storage.
- Feed/explore previews: synthetic projects, featured and detailed project pages, search, explainable client-side fixture sorting, profile/community previews, browser-local bookmarks, and demo-only votes.
- Preview screens for publishing, sign-in, notifications, messages, communities, and settings. Pending requests do not open ordinary conversations; private messaging remains unavailable.
- Accessible loading, error, success, empty and not-found treatments; reduced-motion styles; external link parsing restricted to HTTPS and GitHub repository URLs.
- Route manifest and focused tests for routes, preview sorting, project input validation, and external URLs.
- Cross-platform `scripts/install.mjs` bootstrap uses pinned pnpm and frozen-lockfile installation, preserves `.env.local`, and initializes it from the safe template only when absent. `.github/workflows/ci.yml` automates validation on pushes and pull requests.

## Automated validation (current tree, 2026-10-27)

- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm test` — passed: 4 files, 13 tests.
- `pnpm build` — passed using `next build --webpack`; `/` is statically prerendered, the catch-all route and `/api/projects` are dynamic.

Headless Chrome verified the home feed, light/dark switch, explore query search, mobile layout (no horizontal overflow at 390px), and pending-message boundary. `node scripts/install.mjs` also completed and preserved `.env.local`, reusing 438 cached packages with zero downloads; a clean clone/new-package download remains unverified. GitHub Actions on a remote repository, live Supabase operation, external OAuth setup, and Vercel deployment were not run. Manual review at physical desktop/tablet/mobile widths and both themes is still recommended.

## Data and security boundary

- Sample projects, profiles, memberships, activity and messages are invented preview fixtures. Demo votes are component-local; bookmarks may persist only in this browser. None is a live community record.
- A reviewed migration exists for profiles, projects, tags and bookmarks only. No vote/comment/notification/follow/chat/media schema has been implemented here.
- Supabase helpers and a partial project API route exist. `.env.local` is Git-ignored; its values were not printed. The configured URL/key, migration application, Auth, RLS behavior, storage, and Realtime have not been remotely verified.
- GitHub API/OAuth integration, accepted-request messaging, production ranking, moderation, comprehensive security tests and deployment remain outstanding.

## Manual setup before using service-backed actions

Review and apply `supabase/migrations/0001_profiles_projects.sql` to a non-production Supabase project; configure Auth redirect/allowed URLs; exercise anonymous and signed-in RLS behavior and negative cases; complete registration, recovery, cookie/session and callback flows; validate project API atomicity and error behavior; then add migrations/policies/tests for each enabled domain. Store deployment secrets only in provider-managed environment settings. No production data or deployment was changed.

## Next phase

Phase 3 is Auth sessions and developer profiles, with callback/session tests and profile ownership/RLS tests. Do not start automatically; wait for explicit authorization. See [`TODO.md`](../TODO.md) for Phase 2 review items and [`plan.md`](../plan.md) for its scope.
