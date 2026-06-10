---
tags: [post-mortem, pixel-perfect, design-system, figma]
status: actioned
date: 2026-06-10
---
# 0001 — Pixel-perfect missed: lossy extraction + premature closure

## What happened
Building the design system (Lot 1 & 2) from Figma, several components were **not
pixel-perfect** and shipped with guessed values. Pierre caught them one by one
(button arrow placement, select open state, case-study card, footer). The footer
was the worst: a loose responsive reflow instead of the real composition.

## Symptoms (guessed value → Figma truth)
| Component | I built | Figma said |
|---|---|---|
| Case-study veil | `bg-ink/45` (guess) | layer `opacity = 0.253` |
| Button arrow | centred next to the label | `arrow @x=650` — far right, y-centred |
| Footer address | Montserrat 16px | Montserrat **25px** |
| Footer legal links | 2 | **4**, evenly spaced every 414px |
| Footer | invented 2-col reflow | exact geometry; node `51:2222` is **3 parts**: CTA banner + FOOTER + BTN top |

## Root causes
1. **Lossy-digest trap.** I generated `kit-inventory.md` (via `kit-inventory.mjs`),
   a hand-rolled summary keeping *name/font/fills/strokes/radius* and **dropping
   geometry (x/y), layer opacity, layout, instance counts, sibling nodes**. Then I
   built every component from that digest. The source (`nodes.json`) had everything;
   the digest didn't. **Every field the digest filtered out became a guess.**
2. **Premature closure.** I read depth-1 children, saw "2 columns", and coded —
   without enumerating the full subtree, so I missed exact positions, the real font
   sizes, the link count, and that `51:2222` has a CTA banner + BTN top.
3. **Inference over reading.** "Probably a pill", "veil ~45%", "arrow next to the
   text" — each value existed exactly in Figma; I deduced instead of pulling it.
4. **Wrong verification reference.** I screenshot-diffed against my own lab showcase
   ("does it render?") instead of a Figma render ("does it match?"). The Figma image
   endpoint was rate-limited (429), so I had no ground truth — and still claimed
   "pixel-perfect". Pierre became the diff tool.

## Why it happened (deeper)
The digest *felt* like a deliverable, so I trusted it as the build spec. Each
extraction step that selects fields is a place to lose the exact value you'll later
need. For pixel-perfect, the safe default is to read the **full** node, **per
element, at build time** — never a summary, never from memory.

## What we changed (actioned)
- **Lossless reader**: `.design/scripts/figma-node.mjs <id|name>` dumps the complete
  subtree — relative geometry, layer opacity, fills+opacity, strokes+weight+align,
  radii, auto-layout, per-char overrides. No field filtering.
- **Skill `estuaire-figma` rewritten**: "build from the FULL node JSON, read at build
  time — never a summary, never inference"; a *Failure modes* section (this); a
  *completeness gate* (enumerate all N nodes, check sibling parts + counts); verify
  against a Figma render or state **UNVERIFIED**.
- `kit-inventory.md` re-labelled **"MAP, not a build spec"** (see [[0003-design-system]]).
- **Constitution** Principle VII strengthened (read full source, no inference, verify
  or mark unverified); knowledge architecture now requires post-mortems in the vault.

## Prevention
- Before building any Figma element: `figma-node.mjs` it, enumerate every node, build
  from that — see the `estuaire-figma` skill.
- Never claim "pixel-perfect" without a Figma-render diff.
- Record post-mortems and methodology lessons here in the vault (not just decisions).
