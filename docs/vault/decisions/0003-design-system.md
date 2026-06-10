---
tags: [decision, design-system]
status: accepted
date: 2026-06-09
---
# 0003 — Isolated design-system module + tailwind-variants

## Context
The lab used ad-hoc inline styles. We need one reusable source for the visual language,
with a clear boundary so it is obvious when code *consumes* vs *changes* it.

## Decision
- **`src/design-system/`** isolated module, imported via **`@/design-system`**. Importing =
  consuming; editing in here = a design change.
- Tokens live in the **Tailwind v4 `@theme`** (`src/app/globals.css`) — the source of truth
  (palette + full type scale `text-display/title/subtitle/lead/body/caption`). `tokens.ts` is a
  thin TS mirror for JS/GSAP.
- Component variants use **`tailwind-variants` (`tv`)** — chosen over CVA (more maintained,
  org-backed, slots for multi-part components). `cn` in `src/lib/utils.ts`.
- Components are built by reading the **full Figma node** at build time
  (`.design/scripts/figma-node.mjs`), NOT from the `kit-inventory.md` digest (a MAP of
  what exists, not a pixel-perfect spec — see [[0001-pixel-perfect-lossy-extraction]]).

## Consequences
- Pages never hardcode colors / fonts / radii — they consume `@/design-system`.
- Brand type rule: UPPERCASE → Montserrat, lowercase → Montserrat Alternates (`BrandText`);
  title first-word often **outlined** (text stroke). See [[motion-cinematics]].
- ⚠️ Turbopack pitfall: **restart `npm run dev` after `@theme` changes** (CSS not recompiled live).
