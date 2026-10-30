# CodeBloom

**Discover. Discuss. Build upon.**

CodeBloom is a project-centered developer community for discovering software, sharing work in progress, discussing technical decisions, and learning from other implementations.

## Run locally on Windows, macOS, or Linux

### Requirements

Install [Git](https://git-scm.com/downloads) and [Node.js 20.9 or later](https://nodejs.org/en/download). The project pins pnpm `12.11.2`; the setup script uses Corepack when available and otherwise requires that exact pnpm version. If you need to install pnpm yourself, run:

```sh
npm install --global pnpm@12.11.2
```

### One-command setup and start

Open Terminal on macOS/Linux or PowerShell on Windows, then run these same commands:

```sh
git clone https://github.com/Abhayrajput29/CodeBloom.git
cd CodeBloom
node scripts/install.mjs --start
```

The script installs the locked dependencies, creates `.env.local` from `.env.example` only when `.env.local` does not already exist, and starts the development server. It never overwrites an existing local environment file. When the server reports it is ready, open [http://localhost:3000](http://localhost:3000). Press **Ctrl+C** in the terminal to stop it.

After the first setup, start the server directly with `pnpm dev`. To install dependencies and prepare `.env.local` without starting the server, use `node scripts/install.mjs`. The first installation requires access to the package registry.

### Optional Supabase configuration

Public browsing and the local preview work without Supabase credentials. To use the service-backed authentication and database features, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local` (the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported). Configure Supabase Email Auth and allow the local callback URLs `http://localhost:3000/auth/callback` and `http://127.0.0.1:3000/auth/callback`.

Never expose a Supabase service-role key in browser code or in a variable prefixed with `NEXT_PUBLIC_`. Review [Setup and environment configuration](docs/setup.md) and [Security and privacy](docs/security.md) before connecting a Supabase project. Database-backed features require the appropriate migrations; the social migration and several live-service end-to-end checks are still pending. Do not treat the local preview fixtures as live community data.

## Development commands

Run these from the project directory on any supported platform:

```sh
pnpm dev        # start the local development server
pnpm typecheck  # TypeScript check
pnpm lint       # ESLint
pnpm test       # unit tests
pnpm build      # production build
```

GitHub Actions runs the type-check, lint, unit tests, and production build on Linux, macOS, and Windows for pushes, pull requests, and manual dispatch. It does not deploy the app and does not require secrets. See [Contributing](CONTRIBUTING.md) before opening a pull request.

## Project status

The application includes a public landing and project preview, Supabase email-auth flows, profile APIs and editing, project APIs, and feed/social code. Public preview content may be fixture data. Live behavior depends on correct Supabase configuration, migrations, RLS policies, and end-to-end verification. Community membership, private chat, notification delivery, media storage, and deployment are not implemented or verified as production services.

## Documentation

- [Setup and environment configuration](docs/setup.md)
- [Contributing](CONTRIBUTING.md)
- [Architecture](docs/architecture.md)
- [Database schema and RLS design](docs/database-schema.md)
- [Security and privacy](docs/security.md)
- [GitHub integration](docs/github-integration.md)
- [Design direction](docs/design-direction.md)
- [Development roadmap](docs/development-roadmap.md)
- [Progress and next steps](docs/progress.md)

## Stack

Next.js App Router, React, strict TypeScript, Tailwind CSS 4, Lucide, Supabase SSR/browser clients, and Zod.
