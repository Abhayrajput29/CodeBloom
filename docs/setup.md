# CodeBloom Setup and Environment Guide

## Current repository status

The repository contains a Next.js App Router application, strict TypeScript configuration, Tailwind CSS 4 styling, a responsive Phase 2 interface, a browser-local preview-data provider, Supabase SSR/browser helpers, one project API route, and one SQL migration for profiles/projects/tags/bookmarks. The fixture-driven UI can run without service credentials. The existence of `.env.local` or a Supabase project does not mean Auth, schema, RLS, Storage, Realtime, GitHub OAuth, or deployment have been verified.

## Clone and install

Use Node.js 20.9 or later. From a terminal, replace `YOUR-OWNER/YOUR-REPOSITORY` with the actual GitHub path:

```sh
git clone https://github.com/YOUR-OWNER/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
node scripts/install.mjs
pnpm dev
```

The Node bootstrap prefers Corepack and the exact pnpm version in `package.json`; otherwise it accepts only a matching pnpm version. It runs `pnpm install --frozen-lockfile`, then creates `.env.local` from the safe template only if that file does not exist. Existing local credentials are preserved. It does not install Node/pnpm globally or run a deployment. The first dependency installation needs access to the package registry; no Supabase/GitHub credentials are needed to browse local fixtures.

The GitHub Actions workflow in `.github/workflows/ci.yml` automatically installs locked dependencies and runs type-check, lint, unit tests and the production build on pushes and pull requests. It requires no secrets and does not deploy. GitHub runs it after the repository is pushed to GitHub; local setup does not execute the workflow.

## Environment variables

Copy `.env.example` to `.env.local` only when you need service-backed features. Keep `.env.local` untracked and do not paste its values into issues or chat. Use separate configuration for local, test, preview, and production environments.

| Variable | Required when | Visibility / notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Using the partial Supabase client/project API | Public URL; browser-visible. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Using Supabase | Preferred browser-safe key for new projects; safe only with correct RLS. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy Supabase projects only | Backward-compatible public client key; prefer the publishable key above for new projects. |
| `SUPABASE_SERVICE_ROLE_KEY` | Only for a narrowly justified trusted server task | Privileged; server-only; not needed for normal user-scoped reads/writes. |
| `GITHUB_TOKEN` | Optional future GitHub API adapter | Server-only; public repository reads work without it under conservative rate limits. |
| `PLAYWRIGHT_BASE_URL` | Optional browser tests against a running app | Non-secret URL. |

The normal UI, local fixtures, theme choice, and unit tests do not require Supabase or GitHub credentials. GitHub OAuth is not needed to initialize or browse the preview. If selected later, configure OAuth credentials in Supabase Auth provider settings and keep the provider secret there—not in browser code.

## Partial Supabase setup

The migration at `supabase/migrations/0001_profiles_projects.sql` creates profiles, projects, tags, and bookmarks, enables RLS, limits project mutations to the owner, and creates a profile when a Supabase Auth user is created. It does not implement votes, posts, comments, notifications, follows, accepted-request messaging, or media storage. Review this migration and apply it to a non-production project before using the partial publish API. Verify each policy and database behavior independently; never infer production security from the presence of a publishable key.

The project form uses `POST /api/projects` when Supabase URL configuration is present and requires an authenticated account. The API is a partial implementation; no live submission was validated during the Phase 2 interface work. Without Supabase configuration, the form and bookmarks use local browser preview state. Account creation, password recovery, OAuth callbacks, complete session handling, and user-profile screens remain for Phase 3.

## Validation

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The production build script uses `next build --webpack`. On the current tree, typecheck, lint, tests (13 tests across 4 files), and the production build all passed. Run a local dev server with `pnpm dev`; `GET /manus-routes.json` should return the current page route inventory. Do not include API endpoints or assets in that UI route inventory.

`node scripts/install.mjs` completed in the current checkout and preserved the existing `.env.local`; pnpm reused 438 cached packages and downloaded none. This verifies the bootstrap path against the current frozen lockfile but is not a clean-clone or new-package download test. `pnpm-workspace.yaml` continues to deny the `unrs-resolver` build script. The GitHub Actions workflow has been added but cannot run until the repository exists on GitHub.

## Configuration required before production use

Create and apply reviewed migrations in a non-production Supabase project, verify RLS with anonymous/user/owner negative tests, configure Supabase Auth URL allowlists and password/email policies, implement the complete session and account lifecycle, and configure Storage buckets/policies only when media is implemented. Before deployment, set encrypted provider environment variables, verify callback/redirect hosts, run security and accessibility tests, and test the production build on the intended Vercel/Supabase projects. This repository has not been deployed or verified against live Supabase services.
