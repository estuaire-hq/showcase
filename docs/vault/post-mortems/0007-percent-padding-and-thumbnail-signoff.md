---
tags: [post-mortem, pixel-perfect, css, method, about-page]
date: 2026-06-16
---
# 0007 — `%` padding resolves against the PARENT, and a hero signed off from a thumbnail

## What happened
On `/nous-decouvrir`, the hero (`PageHero`) title cartouche looked wrong vs the maquette — the
title `« Nous sommes / agenceurs et concepteurs. / Nous sommes engagés. »` rendered on **4 lines**
instead of 3, the dark box was **758px** tall (node: 647) and the text started at **x=330**
(node: 275). I had reviewed the hero earlier and called it "acceptable" from a whole-page
side-by-side **thumbnail**. Pierre caught it.

## Root cause (two compounding mistakes)
1. **`%` padding is relative to the containing block's width, not the element's own.** I set the
   cartouche horizontal padding to `lg:px-[9.9%]` *intending* ~135px (≈ 9.9% of the 1364px
   cartouche, to reproduce the node's 275−140 inset). But CSS resolves percentage padding against
   the **parent** width (the 1920 section) → `9.9% × 1920 = 190px`. That shrank the content width
   from the node's 1095px to 983px, so the line `« agenceurs et concepteurs. »` (75px,
   letter-spacing 0.05em) no longer fit → it wrapped → +1 line → cartouche too tall, everything
   shifted.
2. **Signed off pixel-perfect from a thumbnail.** The `estuaire-pixel-review` skill's ONE rule is
   "align at full resolution, measure per element." I eyeballed a downscaled whole-page image where
   a 4-vs-3 line title and a +111px box are invisible — the exact failure mode the skill exists to
   prevent (cf. post-mortem 0001).

A third, related detail: the maquette itself fits that line by using **per-line tracking**
(`ls3.75` on line 1 but `ls2.63 ≈ 0.035em` on `« agenceurs et concepteurs. »`) — a value I'd
flattened to a uniform 0.05em.

## Fix
- `lg:px-[9.9%]` → **`lg:px-[7%]`** (7% × 1920 = 134px ✓, and because both the cartouche width
  and its padding are % of the same viewport, the content-to-box ratio holds at any desktop width).
- Hero h1 **`tracking-[0.02em]`** (≈ the maquette's tightened line) so the line fits on one line.
- Nudged the internal `gap` to land the cartouche at 633px and the h1 at y=885 (node: 647 / 885).
- **Verified by measuring** `getBoundingClientRect()` per element against the node, all breakpoints:
  encart 140,620 1363×633 (node 1364×647), eyebrow x274 (node 275), h1 y885 (node 885); tablet/mobile
  cartouche 277/357 (node 290/360), no horizontal overflow.

## Second defect — the image painted OVER the cartouche (z-order)
Even after the padding fix, Pierre pointed out the **image was covering the top of the text
block** — the eyebrow, the rule and the first title line `« Nous sommes »` were hidden behind the
photo. And on the re-capture I *still* misread it as "faint stroked text on dark" instead of "the
image is on top."

Root cause: the image wrapper is `position: relative` (a **positioned** box) and the cartouche is a
**static** sibling pulled up with a negative margin. Per CSS paint order, a positioned element
paints **above** a static sibling — so the image's bottom strip covered the overlapping top of the
cartouche. Only the cartouche portion *below* the image bottom (y>943: `« agenceurs… »`,
`« Nous sommes engagés. »`) showed; the rest was occluded.

Fix: `relative z-10` on the cartouche so it stacks above the image. (Verify overlap visually AND by
checking which elements are actually painted — an occluded element still has correct
`getBoundingClientRect`, so geometry alone won't reveal a z-order bug; look at the pixels.)

## Lessons
- **`padding: N%` ≠ N% of the element.** It's N% of the parent's *width* (even vertical padding).
  To inset content as a fraction of an element's *own* box, don't use `%` padding — match the
  reference of the value you pick, or use a wrapper/`max-w`/grid, then verify the px.
- **Never sign off pixel-perfect from a whole-page thumbnail.** Per section: screenshot-diff at full
  res AND read `getBoundingClientRect()` vs the node's `@(x,y) w×h` for the key elements (box,
  title baseline, content inset). Numbers, not vibes.
- **Letter-spacing can be per-line in the maquette** — read each text node's `ls`, don't assume the
  token's uniform tracking fits a line the designer hand-tuned.
