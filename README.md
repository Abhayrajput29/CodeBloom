# CodeBloom

**Discover. Discuss. Build upon.**

CodeBloom is a project-centered developer community for discovering software, sharing work in progress, discussing technical decisions, and learning from other implementations.

## Current state

The repository contains a polished, responsive Next.js App Router interface with dark and light themes, a desktop navigation/feed/context layout, mobile navigation, project discovery and detail previews, community/profile/settings pages, feed sorting and search over sample projects, and browser-local bookmark/demo-vote interactions.

This completes the Phase 2 interface foundation—not a production-ready community service. Seeded project, profile, community, activity, and request data is synthetic; projects created without Supabase remain local to that browser. Votes, comments, follows, notifications, and messages are not persisted. The Following feed and private conversations are not connected. One migration currently covers profiles, projects, tags, and bookmarks; the remaining social/messaging schema, security tests, and deployment are not complete. Supabase credentials in `.env.local` do not prove that migrations, Auth, RLS, Storage, Realtime, or production domains are configured or verified.

## Install from GitHub

Replace `YOUR-OWNER/YOUR-REPOSITORY` with the repository's actual GitHub path, then run:

```sh
git clone https://github.com/YOUR-OWNER/YOUR-REPOSITORY.git
cd YOUR-REPOSITORY
node scripts/install.mjs
pnpm dev
```

The bootstrap requires Node.js 20.9 or later. It uses Corepack to select the exact pnpm version pinned in `package.json`, installs only from the committed lockfile, and creates `.env.local` from `.env.example` only if a local file does not already exist. It never installs Node or pnpm globally and never overwrites existing credentials. First-time setup may need package-registry network access. Fixture-driven browsing needs no Supabase or GitHub credentials. Open [http://localhost:3000](http://localhost:3000).

The same bootstrap can be run from the root of an existing checkout with `node scripts/install.mjs`. Alternatively, if dependencies are already installed, start the site with `pnpm dev`. `.env.local` is ignored by Git; keep privileged keys out of `NEXT_PUBLIC_` variables. Before using project publishing, review `supabase/migrations/0001_profiles_projects.sql`, apply it to a non-production Supabase project, and configure Auth and its allowed URLs. A live publish/auth flow has not been verified.

## GitHub automation

`.github/workflows/ci.yml` runs on pushes, pull requests, and manual dispatch. It sets up Node.js 22 and pnpm 12.11.2, performs a frozen-lockfile install, then runs type-check, lint, unit tests, and the production build. It requires no secrets and does not deploy. GitHub runs the workflow after the repository is pushed to GitHub.

## Validation

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

On the current tree, `pnpm typecheck`, `pnpm lint`, `pnpm test` (13 tests across 4 files), and `pnpm build` all passed; the build uses `next build --webpack`. `node scripts/install.mjs` also completed and preserved the existing `.env.local`; it reused the current package cache (zero downloads), so a fresh clone/new-package download remains unverified. Manual browser/device visual review and live Supabase operations need separate verification.

## Documentation

- [Architecture](docs/architecture.md)
- [Database schema and RLS design](docs/database-schema.md)
- [Security and privacy](docs/security.md)
- [GitHub integration plan](docs/github-integration.md)
- [Setup and environment configuration](docs/setup.md)
- [Design direction](docs/design-direction.md)
- [Development roadmap](docs/development-roadmap.md)
- [Progress and next phase](docs/progress.md)
- [Phase 2 plan](plan.md)
- [Phase 2 checklist](TODO.md)

## Stack and boundaries

The application uses Next.js App Router, React, strict TypeScript, Tailwind CSS 4, Lucide, Supabase client helpers, and Zod input validation. Continue to follow the documented PostgreSQL/RLS architecture. Do not claim GitHub OAuth, production feeds/ranking, private messaging, Supabase service behavior, or deployment is functional until actually configured and tested.
