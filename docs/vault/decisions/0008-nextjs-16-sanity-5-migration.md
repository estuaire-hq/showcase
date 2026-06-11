---
tags: [decision, migration, nextjs, sanity, build]
status: accepted
date: 2026-06-11
---
# 0008 — Migration to Next.js 16 + Sanity v5

## Context
The site shipped on **Next.js 15.3 + Sanity v4**. Next.js 16 is the new stable
line; it requires **React 19.2**. Sanity v5 *also* requires React 19.2 and is
the current stable major (v6 exists only as a `6.0.0-next` pre-release). Because
React 19.2 is the **shared pivot** that both upgrades demand, doing Next 16 alone
would still force the React bump — making the Sanity v4→v5 step nearly free to
fold into the same lot. (See spec/plan/research under
`specs/002-nextjs-16-migration/`.)

## Decision
Upgrade the technical socle to **Next.js 16.2.9 + Sanity 5.31.1** in one branch,
as a **lift migration** (mandatory breaking changes only — no behaviour change):

- **Version targets** (pinned, verified live on 2026-06-11): `next@16.2.9`,
  `react`/`react-dom@19.2.7`, `@types/react@19.2.17`, `@types/react-dom@19.2.3`
  (added), `sanity@5.31.1`, `@sanity/vision@5.31.1`, **`next-sanity@13.0.12`**
  (latest line — its peers accept `sanity ^5.29 || ^6`, so we take 13 while
  staying on Sanity **v5**), `@sanity/image-url@2.1.1`, `styled-components@6.3.12`.
  `@sanity/client@7.22.1` arrives transitively (no direct dependency).
- **Sanity v6 is excluded** — only a non-stable pre-release exists.
- **Out of scope** (deferred): optional v16 features — Cache Components, React
  Compiler, View Transitions.
- **Turbopack is adopted** as the default for both `dev` and `build` (v16
  default). The project declares no custom `webpack` config, so the documented
  fallback `next build --webpack` was **not needed**.
- **No new dependency** beyond `@types/react-dom` (typing only) — constitution
  Principle IV preserved.

## How
Executed in **two verifiable paliers** (lint + build green before advancing):

**Palier 1 — Next 16 core (Sanity stays v4 / `next-sanity@11`):**
- The official codemod's transforms were applied **manually** (the bash env is
  non-interactive), each reviewed individually:
  - `src/middleware.ts` → **`src/proxy.ts`**: function `middleware` → `proxy`,
    `runtime: "nodejs"` removed from `config` (a `proxy` always runs in Node;
    Edge is unsupported), header comment rewritten. Matcher + gate logic
    **strictly preserved** (see ADR 0007). Build confirms `ƒ Proxy (Middleware)`.
  - `revalidateTag("sanity")` → **`revalidateTag("sanity", "max")`** in
    `src/app/api/revalidate/route.ts` (v16 requires the two-argument form; `"max"`
    gives stale-while-revalidate, the right fit for a webhook on a showcase).
  - `package.json` `dev` script: dropped the now-redundant `--turbopack`.
- `next.config.ts` reviewed: already v16-conformant (no `images.domains`, PPR,
  `serverRuntimeConfig`/`publicRuntimeConfig`, `amp`, `eslint` option, or
  `experimental.turbopack`) → **no change**; `output: "standalone"` +
  `images.remotePatterns` intact.
- Scans confirmed **zero** removed-in-v16 APIs and exclusive use of the async
  request APIs (`await draftMode()` already in place).
- Next 16 rewrote `tsconfig.json` (mandatory `jsx: "react-jsx"` + suggested
  `.next/dev/types/**/*.ts` include); the whitespace was re-normalised to the
  project's tabs via Biome.

**Palier 2 — Sanity v5 stack:**
- Bumped the Sanity deps; **regenerated TypeGen** (`npm run typegen`) — the
  schema stays the single source of truth (Principle IX; ADR 0006). `seed:check`
  stayed green.
- Two breaking changes surfaced and were handled (the rest of the Studio API is
  unchanged v4→v5, as Sanity documents):
  - **TypeGen v5 renames query-result types** `*QUERYResult` → **`*QUERY_RESULT`**
    (e.g. `FOOTER_QUERYResult` → `FOOTER_QUERY_RESULT`). Consumer import in
    `src/lib/sanity/footer.ts` updated to the new generated name (no hand-typed
    shape introduced).
  - **`@sanity/image-url@2`** removed the `lib/types/types` subpath and
    deprecated the default export. `SanityImageSource` is now imported from the
    package root, and `image.ts` uses the named export **`createImageUrlBuilder`**
    instead of the default. `urlFor(...)` output was verified **byte-identical**
    to v1 (same `cdn.sanity.io` URL, size/fit/format) → no v1 fallback needed.
- `client.ts` / `live.ts` reviewed under `@sanity/client@7`: `useCdn: true`
  **without** a token (published content via cached CDN) + `serverToken` via
  `defineLive` (drafts live) — already the recommended v7 strategy, **no change**.

## Consequences
- Node ≥ 20.9 already satisfied everywhere (`node:22` in Dockerfile + both CI
  workflows) — no change.
- Build is faster (≈33 s Turbopack vs ≈78 s on v15) and still emits
  `.next/standalone` (the Dockerfile depends on it).
- `next-sanity@13` resolved instead of the `@12` written in spec.md — recorded as
  a resolved deviation (research §D1); we remain on Sanity **v5**.
- A transient React 19.2 ↔ Sanity v4 peer warning at palier 1 is lifted by
  palier 2; no peer conflicts in the final lockfile.
- Rollback is branch-confined: revert the palier commit(s) or drop the branch;
  Coolify keeps serving the last `main` (v15) untouched.
- Governance follow-ups: amend the constitution stack table (Next 15→16, Sanity
  v4→v5, lift `TODO(ANIMATION_LIB)` = GSAP) and this ADR pair (0007 updated for
  `proxy`).
