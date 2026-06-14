---
tags: [decision, homepage, realisations, content, sanity, architecture]
status: accepted
date: 2026-06-13
---
# 0011 — Static homepage realisation cards (temporary, with a Sanity migration path)

## Context
The homepage section *Nos univers / Réalisations* (feature `005-homepage`) shows a set of
**realisation cards** (visuel + secteur + titre). Constitution **Principle II** ("CMS as the
single content source — no content media hard-coded in the repo") would normally push these
images and labels into Sanity.

But there is **no `réalisation` content model yet** — it is designed in the future *Réalisations*
feature (its short/long templates, ~20+ cases, filters, empty state, detail pages). The spec
settled the question explicitly: **FR-005 prescribes a fixed set of static cards** (maquette
visuals), non-editable for now, **all linking to the catalog `/realisations`** (a route guaranteed
to exist, SC-002) — no per-item deep-link, so **no permanent dead link** despite static content.
Modeling realisations in Sanity now would **duplicate** the future model and force rework
(Principle IV).

## Decision
Keep the realisation content **static**:
- **data** in `src/content/homeRealisations.ts` — the featured case-study cards typed
  `{ image, title, meta: string[] }[]` (`meta` = `lieu · année · superficie`), the static
  **12-item** "par secteur" list, and the section header images; the link `href` is the
  **constant** `/realisations` for every card and row ;
- **images** committed under `public/home/realisations/`.

The featured cards are mapped to the `CaseStudyPanel` design-system component, driven by
`PinnedCaseStudies` (full-viewport pinned panels — a motion deviation from the maquette band,
documented in the component); the "par secteur" rows render as `SectorButton`s. This is a
**conscious, bounded, time-boxed deviation from Principle II**, sanctioned by the spec (FR-005)
and tracked in the plan's *Complexity Tracking #1*.

Unlike navbar chrome ([[decisions/0009-static-navbar-content]]), these card images are genuine
**editorial content media** — exactly what Principle II ([[decisions/0004-content-images-in-sanity]])
keeps in Sanity. Hence this deviation is stronger than 0009 and warrants its own ratification here,
with an explicit lifting condition.

Card `meta` values (`lieu · année · superficie`) are **placeholder** maquette stand-ins for the
future CMS content (the maquette bands show « Lieu  année  superficie » / « Nom cas study »).

## Migration path (non-breaking — with the *Réalisations* feature)
When the realisation content model is designed:

1. Add the `réalisation` schema → `npm run typegen` (ADR 0006).
2. The home section fetches a **curated selection** from Sanity (via `getHomePageProps` or a
   dedicated mapping), with these static values as the front fallback during transition.
3. **Rebind each card's `href`** from the catalog `/realisations` to its detail
   `/realisations/[slug]`.
4. Delete `src/content/homeRealisations.ts` and `public/home/realisations/`.

The `CaseStudyPanel` contract (`image`/`title`/`meta`/`cta`) stays **identical** — only the
**data source** and the **href granularity** change. The deviation is reversible with no change to
the design system.

## Consequences
- ✅ The homepage ships now without a premature realisation schema/seed/wrapper.
- ✅ Every card links to `/realisations` (guaranteed route) → **no permanent dead link** despite
  static content (the hover affordance is kept).
- ⚠️ **Deviation from Principle II**: card content media live in `public/home/realisations/` +
  repo (not Sanity) until the *Réalisations* feature. **Time-boxed** — lifted when that feature
  lands (step 4 above).
- ⚠️ `public/home/realisations/` **ships to prod** (served, copied into the runtime image) —
  accepted for the temporary period; removed at migration.

## Lifting condition
This deviation is **closed** by the *Réalisations* feature: deleting the static data + images and
rebinding the cards to Sanity (detail pages). Until then, the cards are **not editor-editable** —
accepted, and the only home content excluded from the editable scope (FR-007).
