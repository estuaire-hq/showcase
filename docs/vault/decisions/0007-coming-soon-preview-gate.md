---
tags: [decision, deployment, access-control]
status: accepted
date: 2026-06-10
---
# 0007 — "Coming soon" gate with a permanent preview link

## Context
The site must ship to production (Coolify/OVH) **before it is finished**, so the
public landing on `/` should see a "Site en construction…" placeholder. Yet the
owner and the client need to browse the **real** site to validate the rendering —
via a path that is not discoverable, known only to those who hold it.

## Decision
A single server-only variable, **`SITE_PREVIEW_TOKEN`**, drives a "coming soon"
gate:

- **Set** → the public sees the placeholder on every route + the whole site is
  `noindex`. The real site is unlocked by visiting the permanent link
  **`/v/<token>`** once: it drops a long-lived (30 d), `httpOnly` cookie and
  redirects to a clean `/`. Thereafter the holder browses normal URLs (`/`,
  `/projets`…). The link is shareable and works on any device/browser (it
  re-sets the cookie on every visit).
- **Absent/empty** → the gate is a no-op and the site is public. **Launch = remove
  the variable in Coolify** — no code change, no rebuild.

Rejected alternatives: a cookie set by a one-shot secret link (lost if cookies
cleared / other device), and a *permanent visible URL prefix* (`/v/SECRET/…` on
every page) — the latter breaks App Router internal links (`<Link href="/x">`
drops the prefix → falls back to the placeholder) and forces a heavy de-prefix
migration at launch.

## How
- `src/proxy.ts` — a Next.js **`proxy`** (the successor to `middleware`, renamed
  in Next 16 — see ADR 0008). The proxy **always runs in the Node.js runtime**
  (the Edge runtime is not supported for `proxy`), so no `config.runtime` is set.
  Node runtime is **required**: in the Edge runtime, non-public env vars are
  inlined at build time, which would freeze the token (and the on/off switch) at
  build — defeating the "change it in Coolify" goal. The proxy reads the token at
  request time, validates the `/v/<token>` link and the cookie with a
  constant-time SHA-256 comparison, and `rewrite`s everything else to
  `/coming-soon` (URL preserved → real routes never leak).
- `src/app/coming-soon/page.tsx` — self-contained placeholder (design-system
  tokens, no `/public` asset → the matcher can block everything but build
  assets), `robots: { index: false }`.
- `src/app/robots.ts` — `disallow: "/"` while the token is set (`force-dynamic`
  to read the flag at runtime).
- Matcher excludes `api`, `studio` (own auth), `coming-soon`, `_next`, metadata.
- Token lives in `.env.development` (git-crypt) for dev and Coolify for prod;
  documented in `.env.example`. Not `NEXT_PUBLIC_` (server-only).

## Consequences
- Toggling preview/launch is a Coolify env change, no redeploy of code.
- Security-by-obscurity, acceptable for a pre-launch showcase (no sensitive data);
  the token is a long random value, the cookie is `httpOnly` + `secure` in prod.
- Cleanup at launch: remove `SITE_PREVIEW_TOKEN`. The proxy/placeholder can
  stay dormant (no-op) or be deleted later.
- The `/v/` prefix is reserved; avoid a future real route under it.
