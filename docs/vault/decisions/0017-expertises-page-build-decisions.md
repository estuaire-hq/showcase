---
tags: [decision, expertises-page, design-system, sanity, pixel-perfect]
status: accepted
date: 2026-06-17
---
# 0017 — « Expertises » build decisions & design-system extensions

## Context
Feature `008-expertises-page` builds `/expertises` from a new `expertisesPage` Sanity singleton.
Unlike `007-discover-us-page` (which added two DS primitives), this page reused the design system
**as-is** — `PageHero`, `SectionTitle`, `Pullquote`, `FeatureBlock`, `Button` — building from the
full Figma nodes (51:2893 desktop / 87:5600 tablet / 87:6290 mobile — Principle VII). The decisions
below record the model shape, the deliberate DS extensions, and the maquette-driven deviations.

## Decisions

### 1. `FeatureBlock` IS the « level card » — extended in place, not duplicated
The node confirmed the three « niveaux » cards are exactly `FeatureBlock` (full-bleed image, ink
veil @ 0.253, lower-left title in Montserrat 600, light « en savoir plus » pill with a trailing
arrow). `FeatureBlock` was used only by the disposable `(lab)` kit until now, so it was tuned to the
card spec rather than duplicating an ad-hoc card in the page (Principle X). Extensions applied:
- **Responsive aspect** read on the maquette: `aspect-square` (mobile 390×390) · `md:aspect-[768/718]`
  · `lg:aspect-[1920/718]` (was a fixed `1920/718`).
- **Responsive title** `text-title-sm lg:text-title` (40→75px) — the fixed `text-title` was too big
  on a mobile square card.
- **Lower-left content** (`justify-end` + per-bp `px`/`pb`) — the maquette anchors title+CTA toward
  the bottom-left, not centred.
- **`titleAs`** prop (default `h2`, the page passes `h3`) so the cards sit under the section `<h2>`
  « Nos 3 niveaux d'expertise » (semantic hierarchy — FR-014).
- **`cta.tracking`** (`Record<\`data-${string}\`, string>`) forwarded to the inner `Button` — the
  page passes `data-umami-event="expertise_level_click"` + `data-umami-event-level=<slug>` (Principle
  VI; the slug is the last segment of `ctaHref`, no PII).

### 2. `PageHero` gained an optional `cartoucheClassName`
The hero is `PageHero` reused as-is (eyebrow « Design d'espace, agencement et présentoirs »; outline
« Notre expertise : »; fill « réaliser vos projets de toutes / formes et de toutes tailles. »). But
the expertises cartouche is **78.2 %** wide (node `encart` 1502/1920) vs the about default `lg:w-[71%]`
— at 71 % the fill title wrapped to 3 lines instead of 2. Added an optional `cartoucheClassName`
(merged onto the cartouche box) so each content page can set its cartouche width without touching the
shared component; the page passes `lg:w-[78.2%]`. About is unchanged (no override → still 71 %).

### 3. New singleton `expertisesPage` (groups: hero · intro · levels · statement · seo)
Mirror of the `aboutPage` pattern. The three levels are a CMS-editable **ordered list** `levels[]`
(`expertiseLevel`: `title` required · `image` · `ctaLabel` · `ctaHref`) — not static cards
(Principle II) — pre-filled with the maquette's three (agencement / mobiliers / présentoirs). The
section header carries `levelsTitleOutline/Fill` + a decorative `levelsImage`. There is **no `cta`
group**: the maquette's « BIG FOOTER » (CTA block + footer) is the global shell footer, mounted by
`(site)/layout.tsx` — the page does not redefine it (FR-001/FR-010).

### 4. Reused about-page composition patterns
- **Intro** image cluster reuses the about `Figure`/`ClusterCell` helpers; the cluster is **portrait
  on mobile/tablet** (349×507 / 336×507) and **landscape on desktop** (751×689) — member geometry is
  per-breakpoint (a single desktop aspect left the mobile intro ~160 px too short).
- **Grand visuel** (`05/ BIG IMAGE`) mirrors the about statement band: inset image (`px-5 md:px-10
  lg:px-[3.2%]`, aspect `350/268 → 688/519 → 1798/958`) under `bg-ink/25`, centred `Pullquote`
  (`size="title"`, `text-paper`). Vertical padding `py-5 md:py-10 lg:py-16` matches the node insets.

### 5. `LevelsHeader` — single relative box, one `<h2>`
The « TOP TITRE » (blue `#003787` = `bg-estuaire` frame + white inset + a square visual bridging
blue→white + the section title bottom-left) is one relative aspect box scaled per breakpoint
(`390/530 → 768/415 → 1920/1040`) with absolutely-placed members read on the nodes. The
`SectionTitle` is rendered **once** (no duplicated md-hidden/desktop variants) to avoid a duplicate
heading for assistive tech.

## Motion — deferred (static), as on the about page
Per ADR 0012 §7, motion is placed deliberately, not on every image. The page ships **fully static**
(no scroll cinematics yet); `prefers-reduced-motion` is therefore trivially satisfied (FR-012). Scroll
reveals can be layered later with `@/lib/motion/Parallax`.

## Verified deviations (intended / minor — pixel review, 3 breakpoints)
- Section heights track the maquette closely (levels: dev 3194 vs node 3204 desktop; 1700 vs 1713
  mobile; statement and intro within a few px after the cluster/padding fixes).
- **Hero cartouche taller on tablet/mobile** (~+30 / +70 px) and on tablet the outline line « Notre
  expertise : » sits on its own line where the node flows it inline with « réaliser ». This is the
  `PageHero` two-block title model (outline block + fill block); refactoring it to one inline flow
  would risk the shared about hero — accepted as a minor deviation, not "fixed back".
- Centred statement / intro-statement line wrapping differs by a word at font-metric level — minor.

## Build / gates
`lint` ✓ · `typegen` ✓ (`ExpertisesPage` + `EXPERTISES_PAGE_QUERYResult`) · `seed:check` ✓ ·
`next build` **compiles + type-checks ✓**; static prerender needs the Sanity env (project id is
`placeholder` in local prod mode — same env-gated limitation as home/about; prod env lives in
Coolify). Dev project seeded (`npm run seed -- expertisesPage`, 9 visuals) and the page renders all
content from Sanity.
