# GitHub Integration Design

**Status:** Planned integration. No GitHub credentials are needed to initialize or run the basic application. CodeBloom links to GitHub and reads repository metadata; it does not replicate Git, host repositories, or implement clone/fork/pull-request infrastructure.

## Boundary and data authority

GitHub is authoritative for repositories, source code, README content, branch state, releases, topics, language statistics, and repository availability. CodeBloom stores a validated repository reference plus a refreshable metadata snapshot for display and discovery. Cached external data is always considered potentially stale and must never determine authorization or project ownership.

## Repository URL validation

Accept only HTTPS URLs on an explicit GitHub host allowlist (`github.com` for repositories; add `www.github.com` only after canonicalization if required). Parse with the URL parser, reject credentials, non-default ports, fragments, query parameters, encoded path separators, unexpected path segments, and non-HTTPS schemes. Normalize host and path; accept `/owner/repository` with an optional trailing slash and optional `.git` suffix, then store canonical `https://github.com/{owner}/{repo}`. Validate owner/repository syntax and reject reserved or malformed values. Do not use substring checks such as `url.includes("github.com")`.

Never fetch an arbitrary submitted URL from the server. Build REST API URLs only from validated owner/repository identifiers against the fixed `https://api.github.com` origin. This prevents SSRF and redirects to arbitrary destinations. On redirects, validate the final host and treat rename redirects as metadata reconciliation, not permission to fetch a new arbitrary origin.

## Stored identity and metadata

Store canonical `repository_url`, normalized `github_owner`, normalized `github_repo`, and GitHub's stable repository node ID when available. The node ID is the best key for identifying the same repository after a rename; owner/repo remains necessary for readable links and API routes. Add cache timestamps and optional ETag/Last-Modified fields if conditional requests are implemented.

Recommended cached display fields are repository description, default branch, primary language, topics, stars, forks, open issue count only if clearly labeled, visibility, archived flag, pushed/updated time, README content or a bounded excerpt, and the latest release tag/name/published time. Do not store duplicate data that the application can compute reliably. Avoid copying full README data indefinitely: prefer a bounded sanitized excerpt and a refresh timestamp, or fetch on demand with a short cache. Store topics as a text array or normalized child table only if they need independent filtering. Store one or a small bounded set of release summaries rather than full release assets.

`github_metadata_fetched_at` indicates when the snapshot was last successfully refreshed. Add separate error/attempt timestamps only if needed to manage retries; do not overwrite good cached values with empty fields on transient failure. Display a subtle “metadata last checked” indicator where staleness matters.

## Fetch behavior and rate limits

Fetch metadata in server-side code only. Use GitHub REST API with an explicit API version and `Accept` header. For public repository reads, an unauthenticated request can work without any credentials but has lower rate limits. An optional server-only `GITHUB_TOKEN` (fine-grained token, read-only public repository metadata scopes when applicable) may raise limits. Do not make a token necessary for app startup or the basic project directory.

Cache successful responses in PostgreSQL fields and use conditional requests with ETag/Last-Modified when supported. Deduplicate concurrent refreshes per repository, impose a bounded refresh frequency, honor `Retry-After` and rate-limit reset headers, use exponential backoff with jitter for transient failures, and distinguish 404/403/rate-limit/5xx errors. Do not repeatedly call GitHub on every render. Provide a user-triggered refresh only with a cooldown and server-side authorization/rate checks. Never let refresh failure block project creation or project-page rendering; show the submitted URL and last cached values gracefully.

README retrieval should be size-bounded, UTF-8 decoded, and sanitized before rendering. GitHub may return README content encoded as Base64; decode safely and limit payload size. Render Markdown with raw HTML disabled or sanitize it with a trusted sanitizer. Treat embedded images and links as untrusted; do not server-fetch their destinations. If README fetch is not configured or rate-limited, show a normal repository link.

Release information may be fetched from the latest-release endpoint; repositories without releases are a normal case. Topics can be returned by repository metadata endpoints when the relevant headers/API support them. Languages may require a separate languages endpoint. Only request endpoints whose fields are actually used and cache each data class with its own freshness if refresh cadences differ.

## OAuth and credential handling

GitHub OAuth is optional and not required to initialize the project, browse public repository details, or create public project records. If used for sign-in, prefer configuring GitHub as a provider in Supabase Auth; store the OAuth Client ID/Secret in Supabase's provider settings, not source code. No separate `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET` application variables are needed in that Supabase-managed setup.

If a future feature needs GitHub account linking or private repository access, define a separate user-consented OAuth flow and request minimum scopes. Do not request repository write, organization, or workflow permissions unless a concrete feature requires them. Store access/refresh tokens encrypted and server-side, associate them with the correct user, support revocation/deletion, and never expose them to browser code. Public metadata access should remain available without GitHub OAuth.

Any optional `GITHUB_TOKEN` is server-only, read-only, least-privilege, and kept out of `NEXT_PUBLIC_*`, logs, error responses, client bundles, and database metadata. A public repository URL itself is not a credential.

## Renamed, deleted, private, and inaccessible repositories

- **Renamed/transferred:** Use stable repository node ID when available to recognize identity; update canonical owner/repo URL only after a trusted API response confirms it. Keep prior URL only if a product audit/history requirement justifies it. A redirect without a verified matching GitHub identity must not silently rewrite the record.
- **Deleted or 404:** GitHub often uses 404 for both deleted and private/inaccessible repositories. Mark the cache state as unavailable/unknown; do not immediately erase project content or cached metadata. Preserve the submitted link and allow owner correction/removal. Confirm on a later bounded refresh before changing public UI state.
- **Private/inaccessible:** Never attempt to bypass repository visibility. A public CodeBloom project may link to a private repository, but disclose that it may be inaccessible to visitors. Do not cache private README or metadata unless a future authenticated, user-consented integration explicitly supports it; then access control and retention must be designed first.
- **Rate-limited/forbidden/network error:** Preserve the last good cache, show the last successful refresh time if useful, and retry only after headers/backoff permit.
- **Archived repository:** Display archived status if available; do not assume archived means invalid.
- **Owner removes link:** Clear cached metadata according to retention policy and preserve only what is required for CodeBloom content/audit history.

## Testing plan

Unit-test URL canonicalization and rejection cases (lookalike domains, credentials, ports, encoded paths, query strings, schemes, malformed owner/repo). Mock GitHub API responses for success, ETag 304, rename redirect, 404, 403/rate limit, 5xx, malformed JSON, oversized README, unsafe README HTML, no topics, and no releases. Integration tests verify refresh cooldown, stale-cache fallback, no external calls during page render, and that no OAuth or API credential is required for startup/public project rendering.
