---
tags: [decision, design, figma]
status: accepted
date: 2026-06-09
---
# 0001 — Figma is the design source of truth

> **Tooling superseded by [[0010-figma-local-cache]]** (2026-06-12): Figma remains the
> source of truth, but the `figma-pull.mjs` / `figma-fills.mjs` commands below are
> replaced by the `figma.ts collect` / `read` chain reading a versioned local cache.
> The *decision* (Figma = truth) stands; only the operational commands changed.

## Context
The design existed in a Pencil `.pen` file, but it was a botched paste from Figma —
coordinates were mostly right, images and some details wrong/mismatched.

## Decision
**Figma** (`Rv5HxXNkF6VkTke0ttdAbe`, *Webdesign-ESTUAIRE*) is the single source of truth.
The `.pen` is deprecated (kept in `.design/` for reference only).

## How
Figma **REST API** — not the Dev Mode MCP (rate-limited on the Starter plan):
`node --env-file=.env.development .design/scripts/figma-pull.mjs [nodeId]` → exact node
JSON in `.design/figma-data/`; raw source images via `figma-fills.mjs`. Build pixel-perfect
from that. Method codified in the **`estuaire-figma`** skill — see [[0003-design-system]].

## Consequences
- Pixel-perfect = exact **intrinsic** dims; **dynamic** dims (full-height hero = 100svh) may
  deviate; responsive **per breakpoint** (Figma frames desktop/tablet/mobile).
- `FIGMA_TOKEN` lives in `.env.development` (git-crypt).
- Key nodes: homepage `51:2221`, hero `51:2339`, KIT `75:2963`.
