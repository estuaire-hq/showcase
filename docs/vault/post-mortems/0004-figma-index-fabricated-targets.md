---
tags: [post-mortem, figma, figma-cache, pixel-perfect, method]
status: actioned
date: 2026-06-12
---
# 0004 — Figma cache: fabricated index targets + merged instead of replaced a canonical list

## What happened
Building the named index (`.design/figma-cache/index.json`, feature 004) I created
targets — `home/hero`, `home/header-menu` (with desktop/tablet/mobile variants),
`home/intro`, `home/slider`, `footer` — by **grepping the cached frames for plausible
node names** and wiring the ids I found. Then, when Pierre handed me the **complete,
authoritative list** of every page/section reference (node ids per breakpoint), I
**added it on top** of my invented entries instead of treating his list as the whole
truth. Pierre caught it: an entry like *"En-tête sticky … logo + menu (nous découvrir,
expertises, univers, réalisations, contact)"* sat in the index at 3 breakpoints "alors
que ce n'est pas présent dans la maquette" — the target and its variants were invented,
not designated.

## Root cause
1. **Inference instead of reading the source** — the exact failure the `estuaire-pixel-perfect`
   skill and Principle VII forbid. A node *named* "HEADER sticky menu" inside a frame is
   not the same as a maquette reference the designer designated; finding an id by
   name-search is a guess dressed up as data. I also invented breakpoint variants
   (tablet/mobile ids) the maquette never declared as that target.
2. **Merge, not replace** — when given a canonical/complete list, I unioned it with my
   prior guesses. A "complete list" is **exhaustive**: it defines the entire set, so it
   must *replace* anything not in it, not extend it.

## Fix
Rebuilt `index.json` to contain **exactly** the references Pierre gave (19 targets),
each grounded in one provided node id per stated breakpoint, with no invented entries
and no invented variants. Verified: the 5 fabricated targets are gone; `list` shows 19.

## Prevention
- **Index targets are designations, not discoveries.** Only add a target whose id +
  breakpoints come from an explicit source (a Figma reference the user gave, or a node
  the user named) — never from a name-search heuristic over the cache.
- **A canonical/complete list REPLACES, it does not merge.** When the user says "voici la
  liste complète", rebuild the artifact from that list as the full set; drop anything not
  in it. Confirm the count matches.
- **No invented breakpoint variants.** A target carries only the variants the source
  actually provides (e.g. `nav/open` = tablet+mobile only; most pages = desktop only).
- Echoes [[0001-pixel-perfect-lossy-extraction]]: if a value (or here, a target) is not
  in front of you in the source, you do not invent it.
