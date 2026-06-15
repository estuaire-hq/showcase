---
tags: [post-mortem, nextjs, next-image, proxy, coming-soon, prod, method]
status: actioned
date: 2026-06-14
---
# 0005 — Coming-soon gate broke next/image for local public assets (and a misdiagnosis)

## What happened
After seeding prod, the homepage réalisations images (static `public/home/realisations/*.jpg`,
ADR 0011) showed **nothing in prod** while they rendered fine **locally**. The Studio also
crashed on the `homePage` doc (separate bug — see [[0006-sanity-field-group-on-nested-object]]).
I first attributed the missing images to the seed reset and lumped them with the crash, asserting
causes I had not verified. Pierre pushed back twice ("le seed n'a pas fonctionné ?", "je les vois
en local") — which forced the actual investigation.

The data was fine all along: the prod `homePage` doc (`vbuzs69z`/production) held valid image
asset refs and the CDN served them (200). The real failure was at render:
- **Sanity images** (remote `cdn.sanity.io`) optimized fine in prod — the optimizer fetches the
  CDN directly.
- **Local `public/` images** returned **400** from `/_next/image`. Next's image optimizer fetches
  a *local* source image via an **internal, cookie-less HTTP request**. The coming-soon gate
  (`src/proxy.ts`, [[0007-coming-soon-preview-gate]]) matched those paths and rewrote the fetch to
  `/coming-soon` (HTML) → optimizer received non-image → 400. It also **poisoned the full-route
  cache**: uncookied asset requests cached the `/coming-soon` rewrite under the asset URL.

Locally `SITE_PREVIEW_TOKEN` is unset → the gate is a no-op → the optimizer's fetch succeeds.
That is exactly why it was local-OK / prod-KO.

## Root cause
1. **Gate ran on static-asset paths.** The proxy matcher excluded `_next/static` / `_next/image`
   but not `public/` files (`/home/...`, `/lab/...`). The image optimizer's server-side fetch of a
   local image therefore traversed the gate and got the placeholder HTML.
2. **Misdiagnosis discipline.** "Broke right after the reset" ≠ "caused by the reset". I conflated
   two symptoms, asserted unverified causes, and only separated them under pushback. Remote-image
   vs local-image behaviour, and local-OK / prod-KO, both pointed at runtime/gate — not data.

## Fix
- `src/proxy.ts` matcher now also excludes any path with a file extension (`.*\.`), so static
  assets bypass the gate; page routes (no extension) stay gated. Verified in prod: réalisation
  optimizer 200, Sanity optimizer 200, `/` and `/contact` still "Site en construction" (no leak).
- Tradeoff accepted (pre-launch): a raw asset URL is reachable without the preview cookie, but the
  page HTML stays gated, so assets can't be enumerated.

## Prevention
- **Any middleware/proxy gate must exempt static assets**, or `next/image` on local images 400s in
  every gated environment. The optimizer's source fetch is cookie-less and server-initiated — it
  cannot carry the user's preview cookie.
- **Verify the artifact before attributing cause.** Query the actual prod data / hit the actual
  endpoint; don't infer from "what I just changed". Here the prod doc + a direct CDN/optimizer
  curl disproved the seed theory in minutes.
- **Separate symptoms.** A schema-only error message (Studio crash) cannot be a data problem; a
  local-OK/prod-KO image is a runtime/build/gate problem, not a content problem. Split them before
  theorising.
- **Remote vs local images differ under a gate.** Remote (CDN) optimization survives a gate; local
  optimization does not. A contrast test (`/_next/image` on a Sanity URL vs a `public/` URL) is the
  fastest way to localise this class of bug.
