---
name: estuaire-pixel-perfect
description: >-
  Use BEFORE building or implementing ANY Estuaire page, section, or component from the design
  (estuaire.fr). The pixel-perfect build method: build from the FULL lossless Figma node (never a
  summary, never inference), reproduce exact intrinsic geometry, consume @/design-system + @theme
  tokens (never hard-coded values), handle responsive per breakpoint, route content images to
  Sanity, apply estuaire-motion, and verify by diffing against the Figma render. Triggers:
  build/implement a page/section/component, "make it pixel-perfect", convert Figma to code, match
  the maquette, recreate this screen. Read every design value via the estuaire-figma-cli skill.
---

# Estuaire — pixel-perfect build method

This is the **method**. To actually read design values (nodes, geometry, images, freshness), use
the **`estuaire-figma-cli`** skill — the local cache CLI (`figma.ts read/list/status`). To animate,
use **`estuaire-motion`**. Here we cover *how to turn what you read into a faithful build*.

## The one rule that prevents every failure
**Build from the FULL node, read at build time.** Never from a hand-rolled summary, never from
memory, never by inference. If a value — position, size, opacity, radius, font, spacing, count — is
not in front of you, you **read it** (`figma.ts read <node>`). You do not guess. "Probably" / "≈" /
"looks like" are bugs. The cache is offline and unlimited, so re-reading costs nothing — there is no
excuse to approximate.

## Screenshot + node, together (neither alone is enough)
The node digest gives **exact values**; a **render** gives the **visual truth** the data buries —
hover/"survol" effects, blur, the actual feel of a composition. `read <node|name>` prints
`# render: …assets/<id>.png` when a reference render is cached; open it. For state nodes
(hover/survol/selected/active) read the node AND its `effects`. *Example (2026-06-10):* the
case-study/Notre-vision survol looked like a zoom from geometry alone — the screenshot revealed a
**blur**, and the node's `effects:[{type:"LAYER_BLUR", radius:15}]` gave the exact 15px.

## Failure modes (post-mortems — internalize these)
- **The lossy-digest trap.** A summary you generate (an "inventory") silently drops fields —
  positions, **layer opacity**, layout/padding, sub-children, instance counts. Build from that and
  you bake every omission in as a guess. *Real misses:* cas-study veil at 45% (Figma `opacity=0.253`);
  button arrow centred (Figma `arrow @x=650`, far right); footer address 16px (Figma 25px); 2 legal
  links (Figma has **4**). → The cache's `list`/index is a MAP of what exists; the build SPEC is the
  full node, re-read per element.
- **Premature "I have everything".** Reading depth-1 children and declaring the structure understood.
  You miss exact positions, true font sizes, real counts, and **sibling parts of the same node**
  (BIG FOOTER = CTA banner + FOOTER + BTN-top). → Enumerate the WHOLE subtree before coding.
- **Inference instead of reading.** "Probably a pill", "overlay ~45%", "arrow next to the text", "a
  responsive reflow is close enough". Each value existed exactly in Figma. → No inference of anything
  the source contains. (See post-mortem 0004: even *which targets exist* must come from the source,
  never a name-guess.)
- **Wrong verification reference.** Diffing against your own showcase ("does it render?") instead of
  the Figma render ("does it match?"). Without the Figma image you cannot claim pixel-perfect.

## Step 1 — Read losslessly (the build spec)
Load **`estuaire-figma-cli`** and `read` the node (by id or business name). That digest — every
field, parent-relative geometry, opacity, fills/strokes, radii, auto-layout, effects, full TEXT
style + per-character overrides — **is the spec**. Re-read per component; never reuse an old digest.
The header's "N nodes total" is your checklist length.

## Step 2 — Completeness gate (before writing any code)
- Account for all N nodes. List every visible element: name, bbox, role.
- Confirm nothing is collapsed/truncated; check **sibling parts** under the node (banners, overlays,
  scroll-to-top, decorative ticks/rules).
- Note **multi-instance counts** (links, columns, ticks, slides) and build the real count.
- Unclear or missing → read more. Do not start until the list is complete.

## Step 3 — What "pixel-perfect" means
- **Intrinsic** (positions, sizes, font-size, letter-spacing, line-height, colours, radii, strokes,
  **opacity**, spacing, counts) → EXACT from the node. **Reproduce the layout and positions; do not
  reinvent them.**
- **Dynamic** (viewport-relative) may deviate — e.g. hero `min-h-[100svh]`, not a fixed height.
- **Responsive is part of the component, not an afterthought.** Figma has **3 frames**: mobile
  **390**, tablet **768**, desktop **1920**. DS convention (Tailwind defaults; `md`=768=tablet):
  **base→mobile · `md:`→tablet · `lg:`→desktop** (≥1024). Author **mobile-first**. The cache holds
  all breakpoint frames — `read <name> --bp=desktop|tablet|mobile` and diff each width; a component
  isn't done until its frames match. **Never hard-fix a width on a fluid element** (button, card):
  `w-full max-w-[…]` so it shrinks. (Footer: `read footer --bp=…` — image right→below, nav
  right→centred, legal 4-col→stacked.) See `breakpoint` in tokens.ts.
- Geometry: x/y/w/h parent-relative; `node.opacity` (overlays!); `strokeAlign` (Figma OUTSIDE ≠ CSS
  centred `-webkit-text-stroke` — note the approximation).

## Step 4 — Build
- **Consume `@/design-system` + `@theme` tokens** — never hard-code colours/fonts/radii. Any missing
  component is built **in the DS**, never inline (constitution X).
- **Brand type**: `BrandText` (UPPERCASE→Montserrat, lowercase→Alternates). Outlined first word/line →
  `OutlineText` (verify: node `fills=none` + `strokes` set).
- Position to the exact px / proportions from step 1.
- **Images of the page** (`read <page> --images`): each slot has geometry + fit (`FILL`→`object-cover`,
  `STRETCH`→`object-fill`, `FIT`→`object-contain`) + a cached bitmap, or a **note**:
  - `→ MAP`: integrate an **interactive map**, not an image (e.g. contact).
  - `→ CONTENT`: the image is **Sanity content** (often a repeated/case-study-driven band) — build the
    content-fed component, don't bake a static asset.
  - otherwise: a content image → **route to Sanity** (ADR 0004): build the DS image component, add the
    Sanity field + connected wrapper, and seed the cached bitmap (copy into `seed-assets/<doc>/`).
    Never hard-code a content image.
- **Vectors you cannot export** (logos, custom icons): a clearly-flagged placeholder — never fake the
  geometry, never claim pixel-perfect for it. Ask the user for a PNG export if needed.
- **Motion**: apply via the **`estuaire-motion`** skill (load it).
- ⚠️ **Turbopack**: after changing the `@theme`, **restart `npm run dev`** (CSS not recompiled live).

## Step 5 — Verify (the gate for the words "pixel-perfect")
- The reference render is in the cache: `read <node|name>` prints `# render: …assets/<id>.png`
  (and `index.json.image` maps each target/breakpoint to it). Open that PNG and compare
  side-by-side against the live page. These are full-page exports provided manually; if a target has
  none, ask the user for a PNG.
- No reference image → you have NO ground truth → say "pixel-perfect **UNVERIFIED**, pending Figma
  render". Never claim pixel-perfect from your own showcase.
- Verify `prefers-reduced-motion`.

## Checklist (per page/section/component)
1. `read <node|name>` (via `estuaire-figma-cli`) → the FULL subtree, every element, every field, offline.
2. Completeness gate: enumerate all N nodes; confirm none missing; note counts + sibling parts.
3. Map to `@/design-system`; build any missing components in the DS; route content images to Sanity.
4. Reproduce EXACT positions/sizes (intrinsic exact; dynamic may flex; responsive per breakpoint).
5. Screenshot-diff against the cached Figma render. No reference → **UNVERIFIED**. Verify reduced-motion.
