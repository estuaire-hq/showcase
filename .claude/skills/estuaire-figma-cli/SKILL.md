---
name: estuaire-figma-cli
description: >-
  Use the local Figma cache CLI (.design/scripts/figma.ts) for ANY research on the Estuaire maquettes
  (estuaire.fr). Trigger whenever you need a value, colour, position, geometry, text, structure, or
  image from the Figma design: read a node or a frame's full subtree (by id like 51:2339 or by business
  name — home, expertises, contact) with every field; list/discover the named targets in the index
  before coding; inventory a page's images and where they go; collect/refresh the cache or fetch
  missing images from Figma; check whether the cache is stale. read/list are 100% offline; collect/
  status hit Figma. The cache is the design source of truth — never guess a design value, query it
  with this CLI.
---

# Estuaire — Figma local-cache CLI

The maquette lives in a **versioned local cache** (`.design/figma-cache/`) so design values are
read **offline, instantly, with no Figma quota** — this replaced the rate-limited Dev Mode MCP.
Everything goes through one chain: **`.design/scripts/figma.ts`** with four sub-commands. See ADR 0010.

> **Why a cache, not the MCP/REST directly:** the Starter plan rate-limits Figma hard (10 req/min,
> multi-hour cooldowns). Reading from a local cache is unlimited and < 1s, so you can re-read a node
> as many times as you need while building — which the pixel-perfect method requires.

## How to run

```bash
# canonical
node [--env-file=.env.development] --import tsx .design/scripts/figma.ts <command> [args] [--flags]
# shortcut (wraps --import tsx)
npm run figma -- <command> [args]
```

`--env-file=.env.development` (the git-crypt'd `FIGMA_TOKEN`) is needed **only** for the network
commands (`collect`, and `status` freshness). **`read` and `list` are 100% offline** and read no
secret — drop `--env-file` for them.

**Exit codes**: `0` ok · `1` usage/input (node absent, cache empty, ambiguous name) · `2` network/
quota *suffered* (Figma unreachable when expected) · `3` cache incoherent (`status` gate). A
*partial* cache (some images missing) is signalled but stays `0` — geometry is still readable.

## `read` — the workhorse (offline, lossless)

```bash
npm run figma -- read <nodeId|name> [--depth=N] [--leaves] [--bp=desktop|tablet|mobile] [--raw] [--images]
```

Resolves a **raw Figma id** (`51:2339`) **or** a curated **business name** (`home`, `footer`,
`expertises/agencement-sur-mesure`) → its frame → extracts the subtree. Default output is a
**lossless digest** — every field, no filtering:

- header `# <name> [<type>] W×H — N nodes total` (the **N is your completeness checklist length**),
- `# render: .design/figma-cache/assets/<id>.png` when a reference render is cached (visual truth),
- per node: parent-relative geometry `@(x,y) w×h`, layer `opacity`, fills (per-paint opacity,
  gradients, IMAGE + `asset=<path>` of the cached bitmap), strokes + weight + align, radii,
  auto-layout, effects, full TEXT `style` + **per-character overrides**, `characters`.

Flags:
- `--bp=desktop|tablet|mobile` — pick a named target's responsive variant (default desktop, else the
  sole variant; ambiguous → error asking for `--bp`).
- `--raw` — emit the raw node JSON (integral lossless) instead of the digest.
- `--depth=N` / `--leaves` — bound the *display* without losing default exhaustiveness.
- `--images` — **image inventory** of the subtree: one line per image slot
  `id · @(x,y) w×h · fit · asset=<path>|MISSING|→ note`. This is the "which images & where" of a
  page (see *images* below). `FILL`→`object-cover`, `STRETCH`→`object-fill`, `FIT`→`object-contain`.

Errors are explicit (never a silent partial): id absent → `1` "collect first"; unknown name → `1`;
ambiguous/missing variant → `1`.

## `list` — discover the named targets (offline)

```bash
npm run figma -- list [--json]
```

Prints each curated target: `name · description · node(s) per breakpoint`. Use it to find the right
unit **in one step** without opening files. `⚠` marks a target with no description or an uncollected
node (→ run `status`). The targets are the site map (home, about, expertises[/…], secteurs[/…],
portfolio[/case-study], contact, kit, nav/…) — read by name, e.g. `read expertises --bp=tablet`.

## `status` — freshness + consistency (network unless `--offline`)

```bash
npm run figma -- status [--offline] [--json]
```

- **Freshness** (1 light call): remote `version` vs local → `up to date` / `stale (run collect)` /
  `unknown` (Figma unreachable, exit 2). `--offline` skips it (not an error).
- **Consistency** (offline): index ↔ frames ↔ manifest. **Errors** (exit 3): target with no
  description, target node not collected, frame file missing. **Warnings** (`⚠`, exit 0): a target
  legitimately missing a breakpoint (e.g. `nav/open` has no desktop), a missing reference render, a
  stale `slotNote`.
- Reports: `Reference renders H/T`, `Placed-image assets collected/uncollected`, `Annotated slots`.

It's the cache's quality gate (analogue to `seed --check`).

## `collect` — (re)build the cache (network)

```bash
npm run figma -- collect [--page=<id>] [--no-images] [--only=<frameId>] [--images-only] [--json]
```

One `collect` pulls the whole designated page (1 structure call), splits it **per top-level frame**
into self-contained lossless files, writes the manifest, then downloads placed images (1 image-fills
call + batched renders). Atomic (temp→rename), **resumable on quota** (skips assets already on disk,
honors `Retry-After`, capped → exits `2` and leaves the cache intact). Never touches `index.json`.

- `--no-images` — structure only.
- `--only=<frameId>` — recollect a single frame.
- `--images-only` — fetch placed images for the **already-cached** frames **without re-pulling the
  6k-node structure** (the efficient way to resume images under quota). Skips slot-annotated nodes.

## What's in the cache (`.design/figma-cache/`)

- `config.json` — fileKey + designated `pageId` (`51:2220`).
- `manifest.json` (auto) — `nodeToFrame` routing, `frames[]`, `source.version` (freshness), `missingAssets`.
- `index.json` (curated) — business `targets` → `{description, node{bp}, image{bp}}` + **`slotNotes`**:
  `nodeId → {kind: map|content, note}` for image slots that are **not** static assets to fetch
  (`map` = integrate an interactive map; `content` = the image is Sanity content, e.g. a repeated
  case-study band). `read` surfaces these notes inline.
- `frames/<safe-id>.json` — one lossless top-level frame (raw `document` + referenced style tables).
- `assets/<safe-id>.png|jpg` — page renders + placed-image sources, named by node id, **git-lfs**.

`<safe-id>` = the raw id with `:`/`;` → `-` (in file names only; JSON keys keep the raw `:`).

## Images of a page

`read <page> --images` is the entry point: it lists every image slot with geometry, fit, and either
the cached bitmap path, `MISSING` (run `collect --images-only`), or a **note** (`→ MAP` / `→ CONTENT`
— don't fetch, see `slotNotes`). Placed-image bitmaps live in `assets/<node-id>.png|jpg`.

## Gotchas

- **Temporary source = a Figma COPY.** `config.fileKey` currently points at a copy
  (`FE2OuSaCNV74ZqenKZy8gh`), a quota workaround; the canonical original is `Rv5HxXNkF6VkTke0ttdAbe`.
  Node ids are preserved across the copy, so reads are valid. Rebase `fileKey` + recollect when the
  original's quota recovers.
- `read`/`list` must **never** need the network. If a value isn't in the cache, `collect` it — don't
  guess and don't reach for the MCP.
- For the build method that *consumes* these reads, load the **`estuaire-pixel-perfect`** skill.
