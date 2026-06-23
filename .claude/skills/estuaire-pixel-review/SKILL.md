---
name: estuaire-pixel-review
description: >-
  Run at the END of EVERY Estuaire feature built from a Figma maquette — the mandatory
  pixel-perfect + multi-resolution sign-off (estuaire.fr). VERIFY counterpart of the
  estuaire-pixel-perfect build skill. The site must stay sound on EVERY flagship resolution,
  not just the Figma breakpoint widths. Two regimes: where a Figma frame exists for that
  width → pixel-match (align reference render + dev screenshot at the same width, compare
  side-by-side + overlay + diff section by section with the Pillow helper); at an intermediate
  flagship resolution (no frame) → readability / layout-soundness via the probe (no horizontal
  scroll, no overflow/clip, legible type, undistorted images) + a visual scan. Capture every
  page at every flagship resolution, track page×resolution coverage, fix every gap, loop until
  zero. Triggers: pixel-perfect review/check, multi-resolution review, verify against the
  maquette, diff Figma vs dev, "is it pixel perfect", "does it work on all screen sizes",
  end-of-feature design verification.
---

# Estuaire — pixel-perfect + multi-resolution review (sign-off)

The build skill is **`estuaire-pixel-perfect`** (how to build). This is the **VERIFY** skill: how
to *prove* the build is sound — both pixel-faithful to the maquette AND readable on every
real-world resolution — before sign-off. **Mandatory at the end of every maquette-based feature.**

## Why this skill exists (the two failures it prevents)

1. **Eyeballing two full-page thumbnails hides differences.** Details vanish at thumbnail scale;
   you compare *structure* ("both have a hero") instead of *geometry* (position, size, spacing,
   proportion). *Post-mortem (homepage 005):* a first review called the page "faithful"; a real
   per-section alignment then found a full-bleed hero that should have been a contained window, a
   réalisations section missing two images, an over-wide split image. → **align the actual images,
   per section, at full resolution.**
2. **Reviewing only at the Figma breakpoint widths leaves the in-between untested.** Figma frames
   exist only at **1920 / 768 / 390**, but the layout switches at the **Tailwind breakpoints**
   (sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536) and the codebase mostly uses `base` / `md:` /
   `lg:` only. So the **desktop design (drawn at 1920) is actually served across 1024→1919** —
   every laptop at 1280/1366/1440/1536 renders a layout that was never drawn at that width, and
   fixed-px elements (`max-w-[536px]`, `max-w-[812px]`…) that don't shrink are where overflow and
   broken proportions appear. → **verify on the flagship resolutions in between, not just the
   frames.**

## The two rules

> **A.** Where a Figma frame exists for that width, **align the two images at the same width and
> compare ONE SECTION at a time, at full resolution** — side, overlay, diff. Never sign off from a
> whole-page thumbnail.
>
> **B.** At an intermediate flagship resolution there is **no pixel oracle** — the maquette reflows
> by breakpoint, it does not merely scale. The criterion is **layout soundness**, not a diff: no
> horizontal scroll, no overflow/clipping, legible type, undistorted images, nothing colliding,
> balanced spacing. Prove it with the **probe** (objective defects) + a **visual scan** (subjective).

## The flagship-resolution matrix

**Source — verify live, do not hardcode from memory** (global "Verify Before Acting" rule). This
set was derived from **StatCounter Global Stats — France** (`gs.statcounter.com`, desktop + mobile,
captured 2026-06-23), the audience of a French site, intersected with the widths that *stress the
layout* (breakpoint boundaries + the extremes of each design's active range). Re-confirm the shares
when re-running; widths are **CSS px** (e.g. 1536 = a 1920 panel at 125 % OS scaling — the #2 real
desktop width). **Heights are the real device heights** (so a `100svh` hero reflects the real
device).

| Class | W×H | Regime | Why this width |
|---|---|---|---|
| Desktop | **1920×1080** | **anchor (pixel-match)** | #1 desktop FR (~21 %). Figma desktop frame. |
| Desktop | 1536×864 | flagship (readability) | #2 desktop FR (~9.5 %). `2xl` boundary; low end of the 1920 design. |
| Laptop | 1440×900 | flagship | Ubiquitous MacBook width (design/Mac audience). |
| Laptop | 1366×768 | flagship | #3 real desktop FR (~5.4 %). Budget-laptop classic. |
| Laptop | 1280×800 | flagship | `xl` boundary, common low desktop — **max compression** of the 1920 design. |
| Small/iPad-L | 1024×768 | flagship (spot-check) | `lg/md` boundary + iPad landscape: a 1920 design on a tablet-sized screen. |
| Tablet | 820×1180 | flagship | iPad Air portrait — most common tablet width. |
| Tablet | **768×1024** | **anchor (pixel-match)** | Figma tablet frame. iPad portrait. |
| Mobile | 414×896 | flagship | #1 mobile FR (~14 %). iPhone Plus / older. |
| Mobile | **390×844** | **anchor (pixel-match)** | Figma mobile frame. iPhone 12–15 (#2 mobile FR ~10 %). |
| Mobile | 360×800 | flagship | #3 mobile FR (~7 %). Narrowest common Android — **overflow stress test**. |

(Excluded: desktop 800×600 ~5 % = bots/crawlers, not real use; 393 mobile ≈ 390, folded onto the anchor.)

## Oracle-availability map — pixel-match applies ONLY where a frame exists

Pixel-match (Regime A) is valid for a (page, width) cell **only if a Figma frame exists for that page
at that width**. Everywhere else the cell is Regime B (readability). Per page, the frames are
(from `.design/figma-cache/index.json` — confirm with `estuaire-figma-cli`):

| Page | desktop 1920 | tablet 768 | mobile 390 | all other widths |
|---|---|---|---|---|
| `/` home | ✅ 51:2221 | ✅ 77:3149 | ✅ 77:3150 | Regime B |
| `/nous-decouvrir` | ✅ 51:2699 | ✅ 78:4374 | ✅ 78:4626 | Regime B |
| `/expertises` | ✅ 51:2893 | ✅ 87:5600 | ✅ 87:6290 | Regime B |
| `/expertises/[…]` (agencement) | ✅ 51:3008 | ✅ 87:6762 | ✅ 87:6964 | Regime B |
| `/univers` | ✅ 51:3386 | — | — | Regime B |
| `/univers/[slug]` (retail) | ✅ 51:3520 | — | — | Regime B |
| `/realisations` | ✅ 51:4064 | — | — | Regime B |
| `/realisations/[slug]` long | ☑️ 51:4386¹ | — | — | Regime B |
| `/realisations/[slug]` court | ☑️ 53:2745¹ | — | — | Regime B |
| `/mentions-legales`, `/confidentialite` | — | — | — | **Regime B everywhere** (no frame; static `src/content/legal/` + DS) |

¹ *Soft* pixel-match: the case-study frames are generic mocks, so the **content differs** from the
seeded realisation — match **structure / geometry / proportion**, not exact copy. `/coming-soon` is
**out of scope** (temporary launch gate, no frame).

## Inputs
- **Reference** = the cached Figma frame render: `.design/figma-cache/assets/<node>.png`
  (`estuaire-figma-cli`: `read <page> --bp=<bp>` prints `# render: …`). Full-frame export at the
  frame width.
- **Dev** = a full-page screenshot of the running page at each matrix width.
- **Section map** = each section's Y-range: reference from `figma.ts read <node>` (`@(x,y) w×h`),
  dev from `window.__estuaireSections()` (helper installed by `references/probe.js`).

## Procedure

### 0. Run the real page (gate off)
- Worktree dev servers force the gate OFF (named portless URL serves the real site). Otherwise
  `SITE_PREVIEW_TOKEN= npm run dev`. The CMS singleton must be **seeded** (images present) — an
  unseeded page can't be verified for image fidelity.
- Resolve dynamic detail slugs from the **dev** Sanity project (`wje1fhkq`, GROQ via the Sanity MCP).

### 1. Capture every page at every matrix width (automated)
Drive the **Playwright MCP**. Per page → `browser_navigate`, then install the probe once
(`browser_evaluate` with `() => { <contents of references/probe.js>; return 'installed' }`; globals
reset on navigation, so re-install per page). Then per width (W×H):
- `browser_resize({width:W, height:H})`
- `browser_evaluate({ function:"() => window.__estuaireProbe()", filename:".playwright-mcp/pp/probe-<page>-<W>.json" })`
  — the probe self-scrolls to settle `estuaire-motion` reveals, then measures and dumps JSON.
- `browser_take_screenshot({ type:"jpeg", fullPage:true, filename:".playwright-mcp/pp/<page>__<W>.jpg" })`

This is ~120 cells for the full site. Driving it with `browser_run_code_unsafe` (one Playwright
snippet looping all widths of a page: resize → settle → probe → screenshot) is far cheaper than one
MCP call per cell. A plain *fork* tends to over-think a long mechanical loop — prefer the snippet (or
a fresh general-purpose agent with an explicit step list). Files go to `.playwright-mcp/pp/`
(gitignored). Re-run a single page after a fix.

⚠️ **Pinned / scrubbed sections must be captured under reduced motion.** A GSAP `pin:true` section
(home `PinnedCaseStudies`) renders as an **empty white band** in a static full-page screenshot (the
pin spacer; the panels are transformed/absolute during the pin) and trips the probe's overflow check
with phantom offsets. Add a pass with `page.emulateMedia({reducedMotion:'reduce'})` for those pages:
the panels fall back to normal flow (FR-016), giving the authoritative read of their content/soundness
AND verifying the reduced-motion UX in one shot. Treat the no-reduced-motion white band / phantom
overflow on such a page as a **capture artifact, not a defect** (post-mortem 0016).

### 2. Regime A — pixel-match (cells with a Figma frame)
Build the section map (reference Y-ranges from `figma.ts read <node> --depth=2`; dev Y-ranges from
`window.__estuaireSections()`), then compare EACH section with the Pillow helper:
```bash
python3 .claude/skills/estuaire-pixel-review/references/compare.py \
  .design/figma-cache/assets/<node>.png .playwright-mcp/pp/<page>__<W>.jpg /tmp/cmp.png \
  --ref-rows <figY0>:<figY1> --dev-rows <devY0>:<devY1> --mode all
```
Whole-page overview first (omit `--rows`), then one image PER section. Open `cmp.png` and inspect at
full resolution: **side** (layout, proportion, content present/absent, order, alignment), **overlay**
(position & size drift — ghosting), **diff** (exact mismatches — bright bands). Apply the per-section
checklist below.

### 3. Regime B — readability / layout-soundness (intermediate flagship widths)
No diff. Pass = correctness. Two parts:

**Objective — the probe** (`references/probe.js`, run in step 1). A cell with `ok:true` and empty
`defects` passes the objective bar. Each defect is a candidate gap:
- **`h-overflow`** — content runs past the right viewport edge. **Always a bug** (except a
  deliberately scrollable element). ⚠️ The site sets **`overflow-x: clip` on `<html>`**, so an
  overflowing child does NOT grow `document.scrollWidth` (no scrollbar) — it is silently clipped
  while its content is cut off-screen. So the probe measures the **real element edges** (max
  `getBoundingClientRect().right`), ignoring deliberate crops (anything clipped by an overflow-hidden
  ancestor — full-bleed/`scale-1xx` cover images, carousels). The `offenders` locate it. A second,
  outside-the-page oracle for the same thing: a **fullPage screenshot wider than the viewport** =
  real horizontal overflow. (Both missed `univers@1024`'s 174px title overrun on the first pass —
  post-mortem 0016.)
- **`img-distortion`** — an `<img>` rendered at an aspect ≠ its natural aspect with `object-fit`
  ∉ {cover, contain, scale-down}, i.e. visibly squashed/stretched. Fix the box ratio or the fit.
- **`tiny-text`** — visible text below the 11px legibility floor. Bump the responsive size.
- **`text-clip`** — a leaf whose own text is horizontally cut by `overflow:hidden`. (Image/media
  crops are deliberate here and are NOT flagged.)

**Subjective — visual scan** of the full-page screenshot (the probe can't judge these):
- balanced spacing & vertical rhythm (no huge dead bands, no cramped collisions);
- a **fixed-px block marooned** in a too-wide container (e.g. a `max-w-[536px]` text column adrift
  at 1536 leaving a lopsided void) or **stretched** too wide to read comfortably;
- awkward line breaks / orphans in titles; CTA and pills still proportionate;
- the hero and section proportions still read well at this width;
- images cropping their subject badly at this aspect.
*Cost control:* the probe gives the objective signal at all widths; for the visual scan, always eye
the **most-compressed desktop (1280)** and **narrowest mobile (360)** plus any probe-flagged cell,
and spot-check the rest. A moderately-scaled full-page view is enough for these gross-scale defects
(unlike Regime A geometry).

### 4. Per-section checklist — Regime A (read the node for exact values, never infer)
- **Titles**: copy, contour/fill split (OutlineText/BrandText), font (Montserrat vs Alternates),
  size, weight, tracking, line-height, position.
- **Images**: present? position, box size, **aspect/crop**, fit (FILL→cover / STRETCH→fill).
  Full-bleed vs contained window? margins?
- **Bleed**: does an image deliberately **overflow its section's coloured band / frame** (expertises:
  image pokes out *below* the grey band; hero image straddles the dark/white seam)? If the node's
  image box extends past the background rect, the build must let it bleed — don't clip it flush.
- **Overlap / layering / z-order**: do elements overlap AS DESIGNED? Conversely, elements *separate*
  in the maquette must NOT collide (`justify-between`/`mt-auto` pulling one into a neighbour).
- **Layout**: column split %, image side per breakpoint (the maquette often SWAPS sides
  desktop↔tablet), stack order on mobile.
- **Spacing**: section padding, inter-element gaps, vertical rhythm. Compare each section's HEIGHT
  (dev DOM vs node) — a section >~10 % shorter usually means undersized images or padding.
- **Colour**: backgrounds, text, accents — against `@theme` tokens (ink/slate/estuaire/cream…).
- **Components & counts**: CTA tone/label/width, rules (3px), dividers, list-item COUNT, number of
  cards/slides/pills.
- **Anything present in one image and not the other.**

### 5. Deliberate gaps — record, don't "fix"
Some divergences from the frame are **intended** and must NOT be reverted:
- **Full-viewport-height heroes** (`min-h-[100svh]`) — dynamic height, deviates from the fixed frame
  height by design (`estuaire-pixel-perfect` §3: intrinsic dims exact, **dynamic dims flex**).
- panels narrowed for navbar legibility, and other approved out-of-maquette tweaks.
Log these as **intended deviations** (⚪️ in the tracker), confirm with the owner when unsure, and do
not diff them against the node as if they were bugs.

### 6. Track coverage — page × resolution (no silent skips)
Maintain a matrix: rows = pages, cols = the 11 widths. Each cell:
`✅ pass` · `🔧 fixed` (link the change) · `⚠️ UNVERIFIED + reason` · `⚪️ intended deviation`.
A silent cap reads as "all good" — **every cell gets a status**. Deliver the filled matrix with the
feature (PR body) so completeness is auditable.

### 7. Fix → recapture → re-diff → LOOP
Re-read the node's exact value (Regime A) or reason from the soundness criteria (Regime B); fix with
`@theme` tokens + Tailwind utilities (**no hardcoded design values**). Where a 1920 design compresses
badly mid-range, add `xl:`/`2xl:` steps or fluid `clamp()` tied to the token scale (justify any new
value). Then re-run step 1 for the affected page + re-diff the affected cells. **Repeat until** zero
material difference at every anchor and no readability defect at every flagship width.

### 8. Sign-off
- ✅ "verified" only when every page × every matrix width has a green status, with the comparison
  images (Regime A) and probe `ok:true` + scan (Regime B) as evidence.
- Otherwise name the exact remaining gaps as **UNVERIFIED** (never claim done on an unchecked or
  knowingly-divergent item — Principle VII).
- Re-check `prefers-reduced-motion` (full static content present) and keyboard reachability.

## Notes & gotchas
- Dev page height ≠ maquette frame height (responsive + dynamic dims) — expected; compare **per
  section**, not full-page heights.
- The helper width-normalises both inputs to the SAME width so coordinates line up even if the Figma
  render was exported at 2×.
- Tooling: **Pillow** (installed) via `compare.py`; the **probe** via `references/probe.js` injected
  through the Playwright MCP. The MCP only writes under the worktree root / `.playwright-mcp/`
  (gitignored) — save captures there.
- The maquette is the source of truth — if design and a written spec disagree, surface it (don't
  silently pick one). References: `estuaire-figma-cli` (read values), `estuaire-pixel-perfect`
  (build), `estuaire-motion` (the reveal behaviour the screenshots must account for).
