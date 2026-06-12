// Runtime schemas — zod validators for every cache file the toolchain reads back.
// `types.ts` stays the documented source of truth for the SHAPES; these schemas are
// the runtime GUARD at the JSON boundary, so a corrupt or hand-edited cache file
// (index.json especially) fails fast with a located error instead of flowing in as
// a fully-typed lie and blowing up later (review finding: "guarded at runtime").
//
// The frame `document` is validated shallowly (id/name/type) and otherwise left
// loose — the cache is intentionally lossless (CS-001), so we must NOT reject the
// arbitrary fields Figma sends. Depth-validating it would defeat the cache.

import { z } from "zod";

const BreakpointSchema = z.enum(["desktop", "tablet", "mobile"]);

/** A 1–3 entry responsive map (`Partial<Record<Breakpoint, string>>`). */
const ResponsiveIdsSchema = z.object({
	desktop: z.string().optional(),
	tablet: z.string().optional(),
	mobile: z.string().optional(),
});

// ── config.json ────────────────────────────────────────────────────────────────

export const ConfigSchema = z.object({
	fileKey: z.string(),
	pageId: z.string(),
	pageName: z.string(),
	breakpoints: z
		.object({ desktop: z.number(), tablet: z.number(), mobile: z.number() })
		.optional(),
});

// ── manifest.json ────────────────────────────────────────────────────────────────

const SourceMetaSchema = z.object({
	fileKey: z.string(),
	pageId: z.string(),
	pageName: z.string(),
	lastModified: z.string(),
	version: z.string(),
	collectedAt: z.string(),
});

const FrameEntrySchema = z.object({
	id: z.string(),
	file: z.string(),
	name: z.string(),
	type: z.string(),
	width: z.number(),
	height: z.number(),
	nodeCount: z.number(),
	imageRefs: z.array(z.string()),
	assets: z.array(z.string()),
});

export const ManifestSchema = z.object({
	source: SourceMetaSchema,
	frames: z.array(FrameEntrySchema),
	nodeToFrame: z.record(z.string(), z.string()),
	missingAssets: z.array(z.string()),
});

// ── index.json (hand-edited — the highest-value file to validate) ────────────────

const IndexEntrySchema = z.object({
	description: z.string(),
	node: ResponsiveIdsSchema,
	image: ResponsiveIdsSchema.optional(),
});

const SlotNoteSchema = z.object({
	kind: z.enum(["map", "content"]),
	note: z.string(),
});

export const IndexFileSchema = z.object({
	targets: z.record(z.string(), IndexEntrySchema),
	slotNotes: z.record(z.string(), SlotNoteSchema).optional(),
});

// ── frames/<safe-id>.json ────────────────────────────────────────────────────────

const FrameMetaSchema = z.object({
	id: z.string(),
	name: z.string(),
	breakpoint: BreakpointSchema.nullable(),
	width: z.number(),
	height: z.number(),
	nodeCount: z.number(),
	collectedAt: z.string(),
	sourceVersion: z.string(),
});

/** Shallow node guard — verifies the lossless `document` is a node, keeps the rest. */
const ShallowNodeSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
	type: z.string(),
});

export const FrameFileSchema = z.object({
	meta: FrameMetaSchema,
	document: ShallowNodeSchema,
	styles: z.record(z.string(), z.unknown()),
	components: z.record(z.string(), z.unknown()),
	componentSets: z.record(z.string(), z.unknown()),
});
