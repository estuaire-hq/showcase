---
tags: [post-mortem, pixel-perfect, design-system, method, about-page]
date: 2026-06-17
---
# 0008 — Pixel-review discipline: zero-tolerance, DS type tokens, and the cluster method

Lessons from the « Nous découvrir » pixel-review iteration (feedback from Pierre).

## 1. Zero tolerance on deviations — fix, don't flag
If you NOTICE any difference from the maquette, you FIX it — never list it as an "écart mineur"
and move on. The only allowed deviations are **explicitly documented** ones (e.g. the process-step
carousel→stack, ADR 0012 §4). "Minor" ≠ "leave it". Repeatedly flagging-without-fixing (the hero
image over the text block; the atelier blue panel not overlapping; the Pullquote 35px on mobile)
was treated as not doing the job — especially when the value was already known (no re-read needed).
→ During any pixel review, every observed difference is an action item: fix → recapture →
re-verify, at all 3 breakpoints, until the diff is clean. Deliberate deviation? Document it FIRST.

## 2. Never hardcode font sizes — use the DS type scale
Font sizes MUST come from the brand type tokens (`@theme` in `src/app/globals.css`, mirrored in
`tokens.ts`): `text-display/title/subtitle/lead/body/caption` + responsive `-sm` tiers. Do NOT
inline arbitrary sizes in a page/component (`text-[30px]`, `text-[18px]`, even Tailwind's
`text-base`). If a maquette size has no token, **add/adjust the token in the DS** — don't inline.
Type must be responsive per breakpoint (the maquette uses discrete sizes per frame, e.g. section
titles 40px mobile/tablet → 75px desktop; body 16→24): use `text-X-sm lg:text-X` pairs. ⚠️ restart
`npm run dev` after any `@theme` change (Turbopack).

## 3. The image-cluster method that works (Pierre: "c'est top")
For the recurring "tall image + overlapping smaller image" clusters, position pixel-perfectly AND
consistently across breakpoints by:
1. read both images' node coords `@(x,y) w×h`;
2. compute the cluster **bounding box**;
3. build a `relative` box `aspect-[bboxW/bboxH] w-full` (capped on mobile via a wrapper `max-w`);
4. place BOTH images `absolute` at `left/top/width` as **% of the bbox** + their own `aspect-[w/h]`.
Because positions are % of an aspect-locked box, the overlap is exact on desktop and scales with no
per-breakpoint drift. (`Figure` takes position via className; `StepImages` helper for the steps.)
This replaced ad-hoc per-image `%` that neither matched nor scaled.

## 4. The "tiny titles" bug — tailwind-merge dropped custom font-sizes (BOTH `cn` AND `tv`)
Section titles rendered at **16px on mobile/tablet** (should be 40px) — site-wide, home included.
Root cause: the brand type scale + palette are **custom `@theme` tokens** (`text-title-sm`,
`text-body`, `text-ink`…). Default **tailwind-merge** doesn't know them, so it grouped e.g.
`text-title-sm` and `text-ink` as the same `text-*` conflict and kept only the last (`text-ink`) →
the size was dropped → fell back to 16px. Desktop survived because `lg:text-title` is a separate
variant key. Two layers had the bug:
- `cn` → fixed with `extendTailwindMerge({ extend: { classGroups: { 'font-size': […custom names], 'text-color': […custom colours] } } })`.
- `tv` (**tailwind-variants** has its OWN internal tailwind-merge) → fixed with
  `createTV({ twMergeConfig })` using the SAME config, exported from `@/lib/utils`; all DS
  components now import `tv` from there, not from `tailwind-variants`.
→ Any custom design token used with `cn`/`tv` MUST be registered in the merge config, or it gets
silently dropped when a sibling class shares its prefix. Measure computed `font-size` per breakpoint
to catch it.

## 5. Pitfalls that caused the rework (verify by pixels, not vibes)
- `padding: N%` resolves against the **parent** width, not the element (hero cartouche px bug → title wrapped). See [[0007-percent-padding-and-thumbnail-signoff]].
- A **positioned** element paints OVER a static sibling → the hero image and the atelier image
  covered text/panels until `relative z-10` was added to the overlapping layer. A z-order bug is
  invisible to `getBoundingClientRect` (the occluded element keeps its box) — you must look at the pixels.
- `align=CENTER` in a node digest is **strokeAlign**, not text-align — read the `text{… LEFT}` block.
- Don't sign off from a whole-page thumbnail; align per section at full res + measure.
