---
tags: [moc]
---
# Estuaire Vault — Map of Content

Project knowledge (the *why*). See [[README]] for how this vault works and the
project-vs-local frontier rule.

## Decisions (ADRs)
- [[0001-figma-source-of-truth]] — Figma is the design source of truth
- [[0002-animation-stack]] — GSAP + Lenis
- [[0003-design-system]] — isolated `@/design-system` module + tailwind-variants
- [[0004-content-images-in-sanity]] — content images live in Sanity; Figma images are regenerable refs; DS takes a resolved `src`
- [[0005-connected-components-for-global-sanity-content]] — DS stays presentational; global/singleton content loaded by connected Server Components in `src/components/`

## Design
- [[motion-cinematics]] — the deliberate animation pattern (→ `estuaire-motion` skill)

## Content
- [[homepage-requirements]] — sitemap, case studies, contact routing, footer

## Post-mortems
- [[0001-pixel-perfect-lossy-extraction]] — why pixel-perfect was missed (lossy digest + premature closure) and the methodology fix

## Research
- _to migrate: ocitocine decode, good-parallax craft_
