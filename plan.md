# CodeBloom Phase 2 Implementation Plan

## Goal and boundaries

Deliver the next roadmap phase: a polished, responsive developer-community interface with a coherent dark/light design system, accessible shell, useful page states, and clearly disclosed preview interactions. Preserve the plain-local Next.js App Router project and existing architecture. Do not begin Phase 3 authentication/profile implementation or claim that project publishing, votes, comments, notifications, messaging, GitHub metadata, or deployment are production-ready.

The current tree includes Supabase browser/server helpers and one migration covering profiles, projects, tags, and bookmarks. These remain a partial foundation; no UI claim will imply that unimplemented domains have database policies. Keep `.env.local` private, never print its values, and do not test live credentials as a substitute for implementation evidence.

## Implementation approach

- Reuse the existing Next.js 16 App Router routes, strict TypeScript, Tailwind CSS 4 entry point, Lucide, Zod, and existing Supabase client helpers.
- Keep route-specific content in `components/feed-view.tsx` and shared navigation/theme in `components/app-shell.tsx` and `components/theme-provider.tsx`.
- Keep demo records in `lib/demo-data.ts`; keep preview-only votes/bookmarks clearly labeled. Shared bookmarks may use the existing browser-local `CommunityProvider` storage. Do not present browser-local state as synced data.
- Use `app/globals.css` as the single Tailwind/global styling entry point and organize semantic dark/light tokens, component patterns, responsive behavior, focus states, and reduced-motion support there.
- Correct route manifest and catch-all route behavior as route coverage is made explicit. Ensure unknown paths produce a not-found page rather than silently showing the home feed.
- Add only focused tests for stable Phase 2 contracts. Run typecheck, lint, Vitest, production build, and route/HTTP smoke checks where the local environment permits.

## Design direction

Reuse `docs/design-direction.md`: a calm, product-first developer-community aesthetic, dark-first with a fully usable light theme, neutral surfaces, restrained violet/blue accents, readable project content, and minimal decoration. Use a desktop navigation rail, central reading column, and optional context rail; collapse to a single-column/mobile navigation without horizontal overflow. Keep focus visible, labels semantic, empty/error/success states explicit, and respect reduced motion. Brand essence: an open workshop for developers sharing work and useful feedback; curious, practical, welcoming. The existing CodeBloom wordmark and four-petal mark remain the identity; accents and card artwork should support project content rather than dominate it.

## Project structure in scope

```text
app/
  layout.tsx                 # metadata, providers, shared app shell
  page.tsx                   # community home/feed
  [...slug]/page.tsx         # project and community preview routes
  api/projects/route.ts      # existing server handler; not expanded in this UI phase
  globals.css                # global tokens, components and breakpoints
components/
  app-shell.tsx              # responsive shared navigation and context panel
  theme-provider.tsx         # stored/system theme preference
  feed-view.tsx              # feed, explore, project detail and preview pages
  project-card.tsx           # project card and showcase presentation
  community-provider.tsx     # browser-local preview state only
  ui/                        # shared controls, headings and state notices
lib/
  demo-data.ts               # explicitly synthetic presentation records
  supabase/                  # existing browser/server/config helpers
  validation/                # existing Zod project input schema
public/manus-routes.json     # route inventory for preview tooling
supabase/migrations/         # existing first migration; no new domain schema in this phase
tests/unit/                  # route and input tests, plus focused Phase 2 tests
docs/                        # architecture, security, design, roadmap, setup, progress
```

Use kebab-case filenames, PascalCase React components, camelCase TypeScript, and keep component logic local unless it is clearly reusable.

## Explicitly deferred

Phase 3 auth/session/profile lifecycle; Phase 4 project/media management and production publishing; Phase 5 server-backed posts/comments/votes/ranking/moderation; Phase 6 GitHub API metadata; Phase 7 acceptance-gated messaging; Phase 8 search/follows/notifications/relationships; Phase 9 security/performance audit; Phase 10 deployment/release. Supabase URL/key presence alone does not establish any of these capabilities.
