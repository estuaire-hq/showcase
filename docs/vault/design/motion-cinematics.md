---
tags: [design, animation, cinematics]
status: accepted
---
# Motion cinematics

The deliberate animation pattern for Estuaire (designed with Pierre *before* coding).
Codified as the **`estuaire-motion`** skill (`.claude/skills/estuaire-motion/`).

## Golden rule
**Text is the anchor — it stays static.** Titles reveal once on entry (by line, mask), then
never move. The **visuals** (images, panels) and the **transitions between sections** carry
the motion.

## Rules
- One focal motion at a time; every motion has a purpose; **restraint > accumulation**.
- Good parallax = **depth via different speeds + staggered arrival + slow rise & settle**
  (subtle); never on text.
- Signatures are **contextual** (cas-study hover zoom+blur; Flip where it fits) — not the same
  effect mechanically everywhere. Two constants: line-mask title reveal + image clip-reveal.

## Beats (page-level)
Load (hero title line reveal → static; image clip) → hero **recedes gently** → each section
reveals its title + key image on enter → contextual signature. Stack: [[0002-animation-stack]].
