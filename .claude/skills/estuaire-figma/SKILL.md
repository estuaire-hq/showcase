---
name: estuaire-figma
description: >-
  Use BEFORE building or implementing ANY Estuaire page, section, or component from the
  design (estuaire.fr). The pixel-perfect method: read the FULL Figma node losslessly
  (every field + exact geometry, never a summary or inference), build with @/design-system
  components + Tailwind @theme tokens (never hard-coded), reproduce exact positions, apply
  estuaire-motion, and screenshot-diff against a Figma render. Triggers: build/implement a
  page/section/component, "make it pixel-perfect", convert Figma to code, match the maquette.
---

# Estuaire — Figma → pixel-perfect build

## The one rule that prevents every failure
**Build from the FULL node JSON, read at build time.** Never from a hand-rolled
summary, never from memory, never by inference. If a value — position, size,
opacity, radius, font, spacing, count — is not in front of you, you *pull it*. You
do not guess. "Probably" / "≈" / "looks like" are bugs.

## Screenshot + node, together (neither alone is enough)
The node JSON gives **exact values**; a **render screenshot** gives the **visual
truth** — what the data buries. Hover/“survol” effects, blur, the actual feel of a
composition are invisible in a flat field-dump until you SEE them. So for any
component: get a render (Figma export, or ask the user for a screenshot of the
node) AND read the node. The screenshot tells you *what to look for*; the node
gives the *precise value*. Example (2026-06-10): the case-study/Notre-vision survol
looked like a zoom from geometry alone — the screenshot showed a **blur**, and the
node's `effects: [{type:"LAYER_BLUR", radius:15}]` gave the exact 15px. Always read
the **state nodes** (hover/survol/selected/active) and their `effects`.

## Failure modes (post-mortem 2026-06-10 — read these)
- **The lossy-digest trap.** A summary you generate (an "inventory") silently drops
  fields — positions, **layer opacity**, layout/padding, sub-children, instance counts.
  Build from that digest and you bake every omission in as a guess. *Real misses:*
  cas-study veil built at 45 % (Figma `opacity=0.253`); button arrow centred next to
  the label (Figma `arrow @x=650`, far right); footer address at 16 px (Figma 25 px);
  2 legal links shown (Figma has **4**). → **The inventory is a MAP of what exists; the
  build SPEC is the full node JSON, re-read per element.**
- **Premature "I have everything".** Reading depth-1 children and declaring the
  structure understood. You miss exact positions, true font sizes, real counts, and
  **sibling parts of the same node** (BIG FOOTER = CTA banner + FOOTER + BTN top). →
  Enumerate the WHOLE subtree before coding.
- **Inference instead of reading.** "Probably a pill", "overlay ~45 %", "arrow next to
  the text", "a responsive reflow is close enough". Each value existed exactly in Figma.
  → No inference of anything the source contains.
- **Wrong verification reference.** Diffing against your own showcase ("does it render?")
  instead of the Figma render ("does it match?"). Without the Figma image you cannot
  claim pixel-perfect.

## Source of truth
- Figma `Rv5HxXNkF6VkTke0ttdAbe` (*Webdesign-ESTUAIRE*). homepage `51:2221`, hero
  `51:2339`, footer/BIG FOOTER `51:2222`, KIT `75:2963`. Design files in `.design/`.
- Pull (REST API, **not** the rate-limited Dev Mode MCP):
  `node --env-file=.env.development .design/scripts/figma-pull.mjs <nodeId>` → `nodes.json`
  (+ image-fill renders). `FIGMA_TOKEN` is in `.env.development` (git-crypt).

## 1 — Read losslessly (this is the build spec)
`node .design/scripts/figma-node.mjs <nodeId|name> [--depth=N] [--leaves]`
→ the COMPLETE subtree, no field filtering: parent-relative geometry `@(x,y) w×h`,
**layer `opacity`**, fills (incl. per-paint opacity, gradients, IMAGE), `strokes` +
`strokeWeight` + `strokeAlign`, `cornerRadius`/`rectangleCornerRadii`, auto-layout
(mode/gap/padding/align), effects, full text `style` + per-character overrides.
- Run it for **every** element you build. Re-run per component. Never reuse an old digest.
- It prints "N nodes total" — that is your checklist length.

## 2 — Completeness gate (before writing any code)
- Account for all N nodes. List every visible element: name, bbox, role.
- Confirm nothing is collapsed/truncated; check **sibling parts** under the node
  (banners, overlays, scroll-to-top, decorative ticks/rules).
- Note **multi-instance counts** (links, columns, ticks, slides) and build the real count.
- If anything is unclear or missing → pull/read more. Do not start until the list is complete.

## 3 — What "pixel-perfect" means
- **Intrinsic** (positions, sizes, font-size, letter-spacing, line-height, colours,
  radii, strokes, **opacity**, spacing, counts) → EXACT from the node. **Reproduce the
  layout and positions; do not reinvent them.**
- **Dynamic** (viewport-relative) may deviate — e.g. hero `min-h-[100svh]`, not a fixed height.
- **Responsive (breakpoints) is part of the component, not an afterthought.** The Figma
  has **3 frames**: mobile **390**, tablet **768**, desktop **1920**. DS convention
  (Tailwind defaults; `md`=768 = the tablet frame): **base → mobile · `md:` → tablet ·
  `lg:` → desktop** (≥1024). Author **mobile-first**. Pull all 3 frames
  (`figma-pull.mjs <desktop> <tablet> <mobile>`) and diff each width — a component is not
  done until its 3 frames match. **Never hard-fix a width on a fluid element** (button,
  card): use `w-full max-w-[…]` so it shrinks on small screens. (Footer frames: 51:2222 /
  77:3629 / 78:4371 — image right→below, nav right→centred, legal 4-col→stacked.) See
  `breakpoint` in tokens.ts.
- Geometry: read x/y/w/h parent-relative; `node.opacity` (overlays!); `strokeAlign`
  (Figma OUTSIDE ≠ CSS centred `-webkit-text-stroke` — note the approximation).

## 4 — Build
- Consume `@/design-system` components + `@theme` tokens — never hard-code colours/fonts/
  radii. Any missing component is built **in the DS**, never inline.
- Brand type rule via `BrandText` (UPPERCASE → Montserrat, lowercase → Alternates).
  Outlined first word/line → `OutlineText` (verify: node `fills=none` + `strokes` set).
- Position to the exact px / proportions from step 1.
- **Vectors you cannot export** (logos, custom icons): use a clearly-flagged placeholder —
  never fake the geometry and never claim pixel-perfect for it. Try `figma-render.mjs`.
- Apply motion with the **`estuaire-motion`** skill (load it).

## 5 — Verify (the gate for the words "pixel-perfect")
- Render the Figma node to PNG: `node --env-file=.env.development .design/scripts/figma-render.mjs <nodeId>`
  (→ `.design/figma-data/render-*.png`), or `figma-fills.mjs` for image-fill nodes.
  Overlay / compare side-by-side against the live page.
- If `/images` returns **429** → you have NO ground truth → say "pixel-perfect **UNVERIFIED**,
  pending Figma render". Never claim pixel-perfect from your own showcase.
- ⚠️ **Turbopack**: after changing the `@theme`, **restart `npm run dev`** (CSS not recompiled live).

## Checklist (per page/section/component)
1. `figma-node.mjs` the node → read the FULL subtree (every element, every field).
2. Completeness gate: enumerate all N nodes; confirm none missing; note counts + sibling parts.
3. Map to `@/design-system`; build any missing components in the DS.
4. Reproduce EXACT positions/sizes (intrinsic exact; dynamic may flex; responsive = later pass).
5. Render the Figma node → screenshot-diff. If the render is blocked, mark **UNVERIFIED**.
   Verify `prefers-reduced-motion`.
