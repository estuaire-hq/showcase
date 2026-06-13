---
name: estuaire-pixel-review
description: >-
  Run at the END of EVERY Estuaire feature built from a Figma maquette — the mandatory
  pixel-perfect sign-off (estuaire.fr). This is the VERIFY counterpart of the
  estuaire-pixel-perfect build skill. Method: capture the dev page per breakpoint, then
  for EACH section align the two images (Figma reference render + dev screenshot) at the
  SAME width and compare side-by-side + overlay + diff with a Pillow helper, inspecting
  every section against a checklist — never eyeball whole-page thumbnails. Find every
  difference, fix, recapture, loop until zero gap. Triggers: pixel-perfect review/check,
  verify against the maquette, diff Figma vs dev, "compare to the design", final visual
  sign-off, "is it pixel perfect", end-of-feature design verification.
---

# Estuaire — pixel-perfect review (sign-off)

The build skill is **`estuaire-pixel-perfect`** (how to build). This is the **VERIFY** skill:
how to *prove* the build matches the maquette, section by section, before claiming
pixel-perfect. **Mandatory at the end of every maquette-based feature** (see CLAUDE.md).

## Why this skill exists (the failure it prevents)

Eyeballing two full-page thumbnails side by side **hides differences** — details vanish at
thumbnail scale and you compare *structure* ("both have a hero") instead of *geometry*
(position, size, spacing, proportion). Post-mortem (homepage 005): a first review called
the page "faithful"; a real per-section image alignment then found a full-bleed hero image
that should have been a contained window, a réalisations section missing two images, and an
over-wide split-section image. **The fix is method: align the actual images, per section, at
full resolution.**

## The one rule

> **Align the two images at the same width and compare ONE SECTION at a time, at full
> resolution — side-by-side, then overlay, then diff. Never sign off from a whole-page
> thumbnail.** A difference you cannot see at thumbnail scale is still a bug.

## Inputs

- **Reference** = the cached Figma frame render, per breakpoint:
  `.design/figma-cache/assets/<node>.png` (`estuaire-figma-cli`: `read <page>` prints
  `# render: …`). Full-frame export at the frame width (1920 / 768 / 390).
- **Dev** = a full-page screenshot of the running page at each breakpoint width.
- **Section map** = each section's Y-range, from `figma.ts read <node>` (`@(x,y) w×h`) for
  the reference, and `el.getBoundingClientRect()` for the dev DOM.

## Procedure

### 0. Run the real page
- Disable the coming-soon gate: `SITE_PREVIEW_TOKEN= npm run dev` (else `/` → `/coming-soon`).
- The CMS singleton must be **seeded** (images present) — an unseeded page can't be verified
  for image fidelity. Seed dev first if needed (`npm run seed -- --reset <doc>`).

### 1. Capture the dev page per breakpoint
For each width **W ∈ {1920 desktop, 768 tablet, 390 mobile}** (DS convention: lg / md / base):
- Set the viewport to width W (a browser MCP: Playwright/charlotte).
- Navigate, then **scroll through the whole page and back to top** — this triggers the
  `estuaire-motion` reveals so the screenshot captures the FINAL (revealed) state, matching
  the static Figma render. (A raw full-page screenshot leaves below-the-fold reveals hidden.)
- Full-page screenshot → `/tmp/pp/dev-<bp>.png`.

### 2. Build the section map
- Reference Y-ranges: `figma.ts read <node|name> --depth=2` → each top-level section group's
  `@(x,y) w×h` → `[y, y+h]`.
- Dev Y-ranges: in the browser, evaluate per `<section>`:
  `Math.round(r.top + scrollY)` and `+ Math.round(r.height)`.

### 3. Compare EACH section (the helper)
After width-normalisation the reference's section rows equal the node Y-range and the dev's
equal the DOM Y-range (see the helper's header):

```bash
python3 .claude/skills/estuaire-pixel-review/references/compare.py \
  .design/figma-cache/assets/<node>.png /tmp/pp/dev-<bp>.png /tmp/pp/cmp-<bp>-<section>.png \
  --ref-rows <figY0>:<figY1> --dev-rows <devY0>:<devY1> --mode all
```

Open `cmp-…png` (Read tool renders it) and inspect at full resolution:
- **side** — layout, proportion, content present/absent, order, alignment;
- **overlay** — position & size drift (ghosting), vertical rhythm;
- **diff** — exact mismatches (bright bands).

Whole-page overview first (omit `--rows`), then one image PER section.

### 4. Per-section checklist (read the node for exact values — never infer)
- **Titles**: copy, contour/fill split (OutlineText/BrandText), font (Montserrat vs
  Alternates), size, weight, tracking, line-height, position.
- **Images**: present? position, box size, **aspect/crop**, fit (FILL→cover / STRETCH→fill).
  Full-bleed vs contained window? margins?
- **Bleed**: does an image deliberately **overflow / break out of its section's coloured
  band or frame** (e.g. expertises: the image pokes out *below* the grey band; the hero image
  straddles the dark/white seam)? If the node's image box extends past the background rect, the
  build must let it bleed — do NOT clip it flush inside the band's padding. Check the band/frame
  rect height vs the image box: a band shorter than the image ⇒ bleed.
- **Overlap / layering / z-order**: do elements overlap AS DESIGNED (image over a panel, image
  straddling a seam)? Conversely, elements that are *separate* in the maquette (e.g. two intro
  images at different Y) must NOT collide — watch `justify-between`/`mt-auto` pulling an element
  into a neighbour. Verify the gap the node shows between them is preserved.
- **Layout**: column split %, image side per breakpoint (the maquette often SWAPS sides
  desktop↔tablet), stack order on mobile.
- **Spacing**: section padding, inter-element gaps, the vertical rhythm between sections.
  Compare each section's HEIGHT (dev DOM vs node) — a section >~10% shorter usually means
  undersized images or padding.
- **Colour**: backgrounds, text, accents — against `@theme` tokens (ink/slate/estuaire/cream…).
- **Components & counts**: CTA tone/label/width, rules (3px), dividers, list item COUNT,
  number of cards/slides/pills.
- **Deliberate out-of-maquette tweaks**: some adjustments intentionally diverge from the frame
  (e.g. a full-viewport-height hero, a narrower dark panel for navbar legibility). Record them as
  intended deviations — don't "fix" them back to the node, and confirm with the user when unsure.
- **Anything present in one image and not the other.**

### 5. Fix → recapture → re-diff → LOOP
For each discrepancy, re-read the node's exact value and fix to the proportion (intrinsic
exact; dynamic dims like full-bleed height may flex — `estuaire-pixel-perfect` §3). Then
redo steps 1+3 for the affected section. **Repeat until the comparison shows no material
difference**, at every breakpoint.

### 6. Sign-off
- ✅ "pixel-perfect verified" only when every section aligns at all three breakpoints, with
  the comparison images as evidence.
- Otherwise name the exact remaining gaps and mark them **UNVERIFIED** (never claim
  pixel-perfect on an unchecked or known-divergent item — Principle VII).
- Re-check `prefers-reduced-motion` (full static content) and keyboard reachability.

## Notes & gotchas
- The dev page height ≠ the maquette frame height (responsive + dynamic dims) — that's
  expected; compare **per section**, not full-page heights.
- Width-normalise to the SAME width (the helper does this) so coordinates line up even if the
  Figma render was exported at 2×.
- Tooling: **Pillow** (installed) via `compare.py`; no ImageMagick needed. Browser screenshots
  via the Playwright/charlotte MCP.
- The maquette is the source of truth — if the design and a written spec disagree, surface it
  (don't silently pick one). Reference: `estuaire-figma-cli` to read values, `estuaire-pixel-perfect`
  to build, `estuaire-motion` for the reveal behaviour the screenshots must account for.
