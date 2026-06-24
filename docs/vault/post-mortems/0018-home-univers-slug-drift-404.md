---
tags: [post-mortem, home, routing, sanity, content, app-router, 404]
status: actioned
date: 2026-06-24
---
# 0018 — Home « univers » link 404: slug drift between the home and the sector route

Reported by the client: on the home, the links to the **univers** "are not accessible".
The hrefs *looked* correct (a prior pass had confirmed every univers pill renders a real
`<Link>` with a sensible `/univers/...` URL), so the suspicion was the motion layer
(overlay capturing clicks, a stuck reveal after the recent #21/#22 animation work).
Reproduced in-browser with instrumentation **before** touching anything.

## What it was NOT (ruled out by measurement, not assumption)
- `elementFromPoint` at the center of all 16 univers links (4 intro pills + 12 sector
  links), on first load, after a soft-nav, and after a tab switch: every link is
  **reachable**, `pointer-events: auto`, `opacity: 1`, `blocked: []`. No overlay, no
  stuck reveal, no motion interception.
- Clicking `retail` / `scenographie` / `residentiel` navigates fine.

## Root cause — a slug mismatch (a data/route drift, not markup)
The four univers pills come from `homePageContent.universSectors` (`src/content/homePage.ts`,
also the seed source → the Sanity `homePage` doc). One href was **`/univers/bureaux`**
(plural). The sector detail pages are validated against `SECTOR_SLUGS`
(`src/content/sectorDetail.ts`) = `retail · bureau · residentiel · scenographie` — slug
**`bureau`** (singular; the Figma node is "bureau", title "Bureau"). So
`isSectorSlug("bureaux")` is **false** → `src/app/(site)/univers/[slug]/page.tsx` calls
`notFound()` → **HTTP 404**.

Decisive test — direct fetches:
`/univers/retail` 200 · `/univers/bureau` 200 · **`/univers/bureaux` 404** ·
`/univers/scenographie` 200 · `/univers/residentiel` 200. Only `bureaux` was broken; the
client generalised to "the links" after hitting one 404.

Two subtleties that hid it:
- `getSectorDetailProps` falls back **entirely to the maquette content** for a *known*
  slug with no Sanity doc, so a known slug never 404s regardless of seeding. The 404 is
  therefore purely the slug not being in `SECTOR_SLUGS` — **environment-independent** (it
  hit dev *and* prod), not a dev-seeding artifact.
- The home reads `universSectors` from Sanity when present (`universSectors.length ? … :
  DEFAULTS`), so the **Sanity value overrides the code default**. The bad slug had been
  seeded into the `homePage` doc on **both** projects (dev `wje1fhkq`, prod `vbuzs69z`).
  Fixing only the code would not have fixed the running site.

## Fix
1. **Code (drift-proof):** in `homePage.ts`, build each href via
   `universLink(label, slug: SectorSlug)` — the display label stays editorial
   (plural/accents per the maquette), but the **href slug is typed against the canonical
   `SectorSlug` union**. A future `/univers/bureaux` is now a **compile error**, not a
   runtime 404. `bureaux → bureau`.
2. **Data:** patched + published `homePage.universSectors[bureaux].href = /univers/bureau`
   on dev and (owner-authorized) prod via the Sanity MCP. Label unchanged → no visual
   change → no pixel-review needed.

Verified in-browser on all three reported conditions (fresh load, post soft-nav, post
tab switch): the pill lands on `/univers/bureau` ("Bureau | Estuaire"), 200.

## Lessons
- **A "correct-looking" href can still be wrong.** "The links point at `/univers/…`" is
  not the same as "the slug resolves a page". Always verify the **destination status**,
  not just that an anchor exists.
- **Tie cross-boundary identifiers to one source of truth at the type level.** The home
  and the sector route shared an implicit contract (the slug) with nothing enforcing it.
  A typed helper makes drift impossible to commit.
- **Reproduce before theorising.** The recent motion work made "motion overlay" the
  attractive hypothesis; one `elementFromPoint` sweep killed it in seconds and pointed at
  the route.

## Process note (cache, again — see 0010 & 0013)
While verifying the dev server I re-lived two already-documented traps: the patched value
didn't show because of the Sanity **API CDN + Next `defineLive` fetch cache** (post-mortem
**0010**), and purging **`.next/cache`** mid-run left Turbopack 404-ing **every** route
(post-mortem **0013** — the fix is a full `.next` removal + clean restart, not a partial
cache purge). Consult 0010/0013 first next time instead of rediscovering them.
