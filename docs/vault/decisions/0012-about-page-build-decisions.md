---
tags: [decision, about-page, nous-decouvrir, design-system, sanity, pixel-perfect]
status: accepted
date: 2026-06-16
---
# 0012 — « Nous découvrir » build decisions & maquette-driven deviations

## Context
Feature `007-discover-us-page` builds `/nous-decouvrir` from a new `aboutPage` Sanity singleton +
two design-system primitives (`PageHero`, `Pullquote`). While building from the **full** Figma
nodes (51:2699 desktop / 78:4374 tablet / 78:4626 mobile — Principle VII), several details on the
node diverged from the planning docs (`data-model.md`, `contracts/`, which explicitly describe the
*target shape* and defer detail to the build). The decisions below are the reconciliations.

## Decisions

### 1. Hero title — outline/fill device + eyebrow (not a single `heroTitle`)
The data-model listed one `heroTitle` (`text`) "rendered via BrandText". The node shows the kit's
**contour/fill device**: an eyebrow (« Menuiserie et agencement sur-mesure »), a separator rule,
then two **stroked** lines (« Nous sommes / agenceurs et concepteurs. ») + one **solid** line
(« Nous sommes engagés. »). Modeled as `heroEyebrow` + `heroTitleOutline` + `heroTitleFill` —
consistent with the home hero slides and `SectionTitle` (Principle X), faithful to the node
(Principle VII), and still editable. The **H1** is the outline + fill lines combined (FR-016).

### 2. Section order — CTA **before** the big-image statement
`contracts/section-contracts.md` stated `FeatureBlock → CTA`. The node has the reverse on **all
three** breakpoints (desktop: CTA y=10503 < big image y=10754; tablet/mobile nest the CTA *inside*
the mode-opératoire group, before BIG IMAGE). Built per the maquette: … mode opératoire → **CTA →
big-image statement** → footer.

### 3. Big-image statement — composed inline with `Pullquote`, not `FeatureBlock`
Research §5 suggested `FeatureBlock` (or a variant). The node's treatment differs materially:
**centered** 75px statement, **no CTA**, image under a 25% ink veil. `FeatureBlock` is left-aligned
with a CTA. Rather than bend `FeatureBlock`, the band is composed **inline** from the existing DS
`Pullquote` (`size="title" align="center"`) + a veiled `next/image` — the "compose in-line from DS
primitives" altitude (Principle IV), same as the process steps. No new DS component, no forced
variant.

### 4. Process steps — **stacked** on every breakpoint (maquette uses a carousel on tablet/mobile)
On tablet/mobile the node turns the 4 steps into a **swipe carousel** (`SLIDER` with a 4-bullet
nav). Building an interactive responsive carousel was out of the plan's explicit scope (research §6
specified in-line composition). The steps are **stacked vertically on all breakpoints** — the
accessible, no-JS baseline with identical content. **Deferred enhancement**: the small-screen
carousel. Flagged in `page.tsx` and at pixel-review as a known small-screen structural deviation.

### 5. Image set refinements vs the data-model list
Read on the node, beyond the data-model's approximate lists: a `processIntroImage` (the feature
image beside the mode-opératoire intro, 51:2876); `atelierImages` carries **5** slots (the 5th,
51:2812, is the image beside the atelier highlight panel); `atelierCapabilities` is **4** items
(parc machines / postes de montage / cabine de peinture / organisation agile), separated by rules —
the data-model approximated 3.

### 7. Motion — removed, deferred to deliberate placement (2026-06-16)
The first build wrapped every image in `<Parallax>` with a `data-parallax` drift/rise. Feedback
(Pierre): animating *all* images mechanically is not "animating the site" — some visuals don't lend
themselves to it and the cumulative effect is too much. Motion must be **placed where it serves the
narrative** — a human judgement for now. So **all image motion was removed**; the page is fully
static (RSC, no `Parallax`, less client JS — Principle I) until specific beats are chosen with
intent. `estuaire-motion` primitives remain available for that later pass.

### 6. Shared extractions (reuse before duplicate — Principle IV)
- `imageField` factory → `src/sanity/schemas/fields.ts`, imported by `homePage` **and** `aboutPage`
  (the data-model's "réutilise le helper" intent; was a local copy in `homePage.ts`).
- `mapImage` + `ResolvedImage`/`QueryImage` → `src/lib/sanity/mapImage.ts`, imported by
  `homePage.ts` **and** `aboutPage.ts` (content-model contract §4). `homePage.ts` re-exports
  `ResolvedImage` for back-compat.

## Consequences
- ✅ The page is faithful to the node where the docs were approximate; all content CMS-driven
  (Principle II — no static exception, unlike the home).
- ✅ Two reusable DS primitives added (`PageHero`, `Pullquote`) — available to future content pages.
- ⚠️ Tablet/mobile process steps **stack** instead of a carousel — deferred; revisit if the
  carousel is wanted (a DS `Carousel`/`Slideshow` already exists to build on).
- ✅ Dev project seeded (`npm run seed -- aboutPage --reset`, 19 visuals) and the
  `estuaire-pixel-review` loop run against the cached renders at the 3 breakpoints. Hero geometry
  corrected (see post-mortem 0007: a `%`-padding bug had wrapped the title); tablet grids promoted
  `lg:`→`md:` for 2-col parity with the 768 frame.

## Lifting / follow-ups
- Seed the dev project (T027, write token) → run the full `estuaire-pixel-review` loop (T020/26/33).
- Optional: extract a DS `ProcessStep` only if a strictly-repeated shape proves out (research §6) —
  not done now (the per-step layouts vary).
- Optional: small-screen process-step carousel.
