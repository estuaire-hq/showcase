---
tags: [decision, sanity, images, design-system]
status: accepted
date: 2026-06-10
---
# 0004 — Content images live in Sanity; Figma images are regenerable references

> **Tooling superseded by [[0010-figma-local-cache]]** (2026-06-12): the decision stands,
> but Figma image references are now fetched by `figma.ts collect` into the gitignored
> `.design/figma-cache/assets/` (no longer `public/figma/` via `figma-pull.mjs`/`figma-fills.mjs`).

## Context
The Figma maquettes place specific photos in specific slots (case studies, hero/CTA,
sectors…). We deleted the bulk of `public/lab/images`, `public/figma`, and gitignored
`.design/images` (the 80M `.fig` + source exports). Two questions followed: how do we
still know which image goes where, and where should images actually live?

## Decision
- **Content images live in Sanity** (constitution Principle II — CMS as single content
  source). They are fetched server-side via GROQ + `urlFor()` (`@sanity/image-url`,
  already wired) and passed to components as a resolved `src`. They are NEVER hard-coded
  in `public/`.
- **Figma images are design references, not assets.** Each image slot is an `IMAGE` fill
  on a Figma node. The mapping image ↔ location is recoverable any time from the Figma
  cloud file via the pull scripts:
  - `figma-node.mjs <node>` → which nodes have `IMAGE` fills and where (positions);
  - `figma-pull.mjs` / `figma-fills.mjs` → download each image-fill node → `public/figma/<id>.png`
    + a manifest (`figma-data/images.json`, nodeId → file).
  So nothing is lost by deleting them — they regenerate from the source of truth.
- **DS components stay image-source-agnostic**: they take `image: { src, alt }` (a resolved
  URL), not a Sanity object. The *page* resolves the Sanity image → URL (`urlFor(img).width(w).url()`)
  and passes `src`. This keeps the design system decoupled from the CMS.

## Consequences
- Already in place: `urlFor` helper, `cdn.sanity.io` in `next.config` `images.remotePatterns`,
  decoupled DS components.
- The lab's `/lab/images/...` paths are **placeholders** (lab-only); they go when the lab does.
- **To build (with page modelling / the home redo)**: Sanity schemas gain image fields —
  homepage hero/CTA image, caseStudy photos (court = 3 / long = 5 per [[homepage-requirements]]),
  sector images, etc. — and the GROQ queries fetch them.
- Workflow: **Figma (reference, regenerable) → Sanity (content, uploaded) → GROQ + urlFor → `src` → DS component.**
- See [[0001-figma-source-of-truth]] (design truth) and [[0003-design-system]] (DS boundary).
