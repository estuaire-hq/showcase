// Cache contracts — TypeScript interfaces for every shape the local Figma cache
// writes and reads. The schema is documented once here (mirrors data-model.md /
// contracts/cache-files.md) so `collect` (writes), `read` (reads) and `status`
// (validates) cannot drift. Checked at type-check, guarded at runtime by `status`.

/** Responsive breakpoint keys used by the index and frame metadata. */
export type Breakpoint = "desktop" | "tablet" | "mobile";

// ── config.json — structural constants (rarely edited, versioned) ──────────────

export interface Config {
	/** Figma file key (Webdesign-ESTUAIRE). */
	fileKey: string;
	/** Designated canvas node id (a CANVAS node). */
	pageId: string;
	/** Canvas name — used to auto-detect the page if `pageId` drifts. */
	pageName: string;
	/** Breakpoint → reference width in px (used to derive a frame's breakpoint). */
	breakpoints?: Record<Breakpoint, number>;
}

// ── frames/<safe-id>.json — one self-contained, lossless top-level frame ───────

/**
 * A raw Figma node, preserved verbatim (lossless). The common fields read by the
 * digest are declared for convenience; the index signature keeps every other
 * field (no pre-selection — CS-001).
 */
export interface FigmaNode {
	id: string;
	name: string;
	type: string;
	children?: FigmaNode[];
	absoluteBoundingBox?: BoundingBox | null;
	opacity?: number;
	fills?: Paint[];
	strokes?: Paint[];
	strokeWeight?: number;
	strokeAlign?: string;
	cornerRadius?: number;
	rectangleCornerRadii?: number[];
	layoutMode?: string;
	paddingTop?: number;
	paddingRight?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	itemSpacing?: number;
	primaryAxisAlignItems?: string;
	counterAxisAlignItems?: string;
	effects?: Effect[];
	style?: TextStyle;
	characters?: string;
	characterStyleOverrides?: number[];
	styleOverrideTable?: Record<string, StyleOverride>;
	[key: string]: unknown;
}

export interface BoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface Color {
	r: number;
	g: number;
	b: number;
	a?: number;
}

export interface Paint {
	type: string;
	visible?: boolean;
	opacity?: number;
	color?: Color;
	gradientStops?: Array<{ color: Color }>;
	scaleMode?: string;
	imageRef?: string;
	[key: string]: unknown;
}

export interface TextStyle {
	fontFamily?: string;
	fontWeight?: number;
	fontSize?: number;
	lineHeightPx?: number;
	letterSpacing?: number;
	textCase?: string;
	textAlignHorizontal?: string;
	[key: string]: unknown;
}

export interface StyleOverride {
	fills?: Paint[];
	strokes?: Paint[];
	strokeWeight?: number;
	fontFamily?: string;
	fontWeight?: number;
	[key: string]: unknown;
}

export interface Effect {
	type: string;
	visible?: boolean;
	[key: string]: unknown;
}

/** Per-frame metadata block (a convenience digest over the raw `document`). */
export interface FrameMeta {
	id: string;
	name: string;
	breakpoint: Breakpoint | null;
	width: number;
	height: number;
	nodeCount: number;
	collectedAt: string;
	sourceVersion: string;
}

/** A single `frames/<safe-id>.json` file — self-sufficient, lossless subtree. */
export interface FrameFile {
	meta: FrameMeta;
	/** Raw Figma node, full subtree, every field preserved verbatim. */
	document: FigmaNode;
	/** Style/component tables referenced by this frame (may be empty). */
	styles: Record<string, unknown>;
	components: Record<string, unknown>;
	componentSets: Record<string, unknown>;
}

// ── manifest.json — auto-generated routing + collection metadata ───────────────

/** Collection metadata (spec entity "Métadonnées de collecte"). */
export interface SourceMeta {
	fileKey: string;
	pageId: string;
	pageName: string;
	/** ISO 8601, from the Figma file object (human display). */
	lastModified: string;
	/** Monotonic Figma version id — the freshness authority. */
	version: string;
	/** Local timestamp of this collect. */
	collectedAt: string;
}

/** One entry per `frames/<safe-id>.json` file. */
export interface FrameEntry {
	id: string;
	file: string;
	name: string;
	type: string;
	width: number;
	height: number;
	/** Total nodes in this frame's subtree — completeness checklist (EF-004). */
	nodeCount: number;
	/** Distinct imageRefs present in this frame's fills. */
	imageRefs: string[];
	/** Asset files actually downloaded for this frame. */
	assets: string[];
}

export interface Manifest {
	source: SourceMeta;
	frames: FrameEntry[];
	/** Exhaustive routing table: every node id → its top-level frame id. */
	nodeToFrame: Record<string, string>;
	/** Image-bearing node ids whose render failed (quota) — partial collect. */
	missingAssets: string[];
}

// ── index.json — curated named targets (dev + agent) ───────────────────────────

export interface IndexEntry {
	/** Non-empty business description (CS-007 — no anonymous target). */
	description: string;
	/** 1–3 responsive variants → raw Figma node id. */
	node: Partial<Record<Breakpoint, string>>;
	/**
	 * Optional per-breakpoint reference render (repo-relative path under the cache,
	 * e.g. `assets/51-2221.png`) — the visual ground truth for pixel-perfect verify.
	 * Same breakpoints as `node`; the file is the frame's full-page export.
	 */
	image?: Partial<Record<Breakpoint, string>>;
}

/**
 * Per-slot semantic note for an image-bearing node that must NOT be fetched as a
 * static asset: `map` (integrate an interactive map, not an image) or `content`
 * (the image is Sanity content — e.g. a case-study band, often repeated). Keyed by
 * raw node id. `collect` skips these (no render, no "missing"); `read` shows the note.
 */
export interface SlotNote {
	kind: "map" | "content";
	note: string;
}

export interface IndexFile {
	targets: Record<string, IndexEntry>;
	/** node id → semantic note for slots that are not static images to fetch. */
	slotNotes?: Record<string, SlotNote>;
}
