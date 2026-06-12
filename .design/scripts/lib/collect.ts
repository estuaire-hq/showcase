// collect — pull the designated page in a bounded number of REST calls, split it
// per top-level frame into self-contained lossless files, and download placed
// images. Phased cheapest→costliest (1 structure call, 1 image-fills call, then N
// batched renders), atomic per file, resumable on quota (skips existing assets,
// honors Retry-After). The structural cache is never left half-written.

import { writeFileSync } from "node:fs";
import { flagString, type ParsedArgs } from "../figma";
import {
	assetPath,
	findExistingAsset,
	frameFileExists,
	readConfig,
	readFrameFile,
	readIndex,
	readManifest,
	safeId,
	writeFrameFile,
	writeManifest,
} from "./cache";
import {
	extFromContentType,
	FigmaApiError,
	FigmaQuotaError,
	fetchBinary,
	getFileMeta,
	getImageFills,
	getNodes,
	type NodesResponse,
	renderImages,
} from "./figma-api";
import { imageFillOf, isVisibleImageFill } from "./paints";
import { countNodes, walk } from "./tree";
import type {
	Breakpoint,
	Config,
	FigmaNode,
	FrameEntry,
	FrameFile,
	Manifest,
} from "./types";

const RENDER_BATCH = 3;

const errMsg = (err: unknown): string =>
	err instanceof Error ? err.message : String(err);

/** Derive a frame's breakpoint from its name, then its width (commodity field). */
function deriveBreakpoint(
	name: string,
	width: number,
	breakpoints?: Config["breakpoints"],
): Breakpoint | null {
	if (/tablet/i.test(name)) return "tablet";
	if (/smartphone|mobile/i.test(name)) return "mobile";
	if (breakpoints) {
		for (const [bp, w] of Object.entries(breakpoints)) {
			if (Math.abs(width - w) <= Math.max(8, w * 0.05)) return bp as Breakpoint;
		}
	}
	return width >= 1000 ? "desktop" : null;
}

/** imageRefs of every visible IMAGE fill in a subtree. */
function collectImageRefs(node: FigmaNode): Set<string> {
	const refs = new Set<string>();
	walk(node, (n) => {
		for (const fill of n.fills ?? []) {
			if (isVisibleImageFill(fill) && fill.imageRef) refs.add(fill.imageRef);
		}
	});
	return refs;
}

interface ImageNode {
	id: string;
	frameId: string;
	imageRef?: string;
}

/**
 * Image-bearing nodes of a frame = nodes with a visible IMAGE fill (the bitmap holders).
 * Matches `read --images`. We do NOT match name=="image" wrapper groups: their child
 * rect carries the imageRef (already fetched), so counting the wrapper just produced
 * spurious "missing renders".
 */
function collectImageNodes(frame: FigmaNode, out: ImageNode[]): void {
	walk(frame, (n) => {
		const imageFill = imageFillOf(n);
		if (imageFill)
			out.push({ id: n.id, frameId: frame.id, imageRef: imageFill.imageRef });
	});
}

/** Style/component ids actually referenced inside a frame subtree. */
function collectReferences(frame: FigmaNode): {
	styleIds: Set<string>;
	componentIds: Set<string>;
} {
	const styleIds = new Set<string>();
	const componentIds = new Set<string>();
	walk(frame, (n) => {
		const styles = n.styles as Record<string, string> | undefined;
		if (styles)
			for (const v of Object.values(styles))
				if (typeof v === "string") styleIds.add(v);
		if (n.type === "INSTANCE" && typeof n.componentId === "string")
			componentIds.add(n.componentId);
	});
	return { styleIds, componentIds };
}

function pickSubset(
	table: Record<string, unknown>,
	ids: Set<string>,
): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const id of ids) if (id in table) out[id] = table[id];
	return out;
}

interface CanvasTables {
	styles: Record<string, unknown>;
	components: Record<string, unknown>;
	componentSets: Record<string, unknown>;
}

function buildFrameFile(
	frame: FigmaNode,
	tables: CanvasTables,
	version: string,
	collectedAt: string,
	breakpoints: Config["breakpoints"],
): FrameFile {
	const bb = frame.absoluteBoundingBox ?? { x: 0, y: 0, width: 0, height: 0 };
	const width = Math.round(bb.width);
	const height = Math.round(bb.height);
	const { styleIds, componentIds } = collectReferences(frame);
	const components = pickSubset(tables.components, componentIds);
	const setIds = new Set<string>();
	for (const cid of componentIds) {
		const comp = tables.components[cid] as
			| { componentSetId?: string }
			| undefined;
		if (comp?.componentSetId) setIds.add(comp.componentSetId);
	}
	return {
		meta: {
			id: frame.id,
			name: frame.name,
			breakpoint: deriveBreakpoint(frame.name, width, breakpoints),
			width,
			height,
			nodeCount: countNodes(frame),
			collectedAt,
			sourceVersion: version,
		},
		document: frame,
		styles: pickSubset(tables.styles, styleIds),
		components,
		componentSets: pickSubset(tables.componentSets, setIds),
	};
}

export interface SplitResult {
	frames: FrameEntry[];
	nodeToFrame: Record<string, string>;
	frameFiles: Array<{ id: string; file: FrameFile }>;
	collectedNodeIds: Set<string>;
}

/**
 * Pure structure split: turn the designated frames + canvas-level tables into
 * per-frame files, manifest frame entries and the node→frame routing table.
 * No I/O — the caller persists `frameFiles` (kept pure so it is testable offline,
 * which matters while the live `collect` path is gated by the Figma quota).
 */
export function splitFrames(
	frameNodes: FigmaNode[],
	tables: CanvasTables,
	version: string,
	collectedAt: string,
	breakpoints: Config["breakpoints"],
): SplitResult {
	const frames: FrameEntry[] = [];
	const nodeToFrame: Record<string, string> = {};
	const frameFiles: Array<{ id: string; file: FrameFile }> = [];
	const collectedNodeIds = new Set<string>();
	for (const frame of frameNodes) {
		const frameFile = buildFrameFile(
			frame,
			tables,
			version,
			collectedAt,
			breakpoints,
		);
		frameFiles.push({ id: frame.id, file: frameFile });
		frames.push({
			id: frame.id,
			file: `frames/${safeId(frame.id)}.json`,
			name: frame.name,
			type: frame.type,
			width: frameFile.meta.width,
			height: frameFile.meta.height,
			nodeCount: frameFile.meta.nodeCount,
			imageRefs: [...collectImageRefs(frame)],
			assets: [],
		});
		walk(frame, (n) => {
			nodeToFrame[n.id] = frame.id;
			collectedNodeIds.add(n.id);
		});
	}
	return { frames, nodeToFrame, frameFiles, collectedNodeIds };
}

interface CollectSummary {
	page: string;
	frames: number;
	nodes: number;
	assetsDownloaded: number;
	assetsSkipped: number;
	missing: number;
	quotaHit: boolean;
}

/** Resolve the designated page id, auto-detecting by name if none is configured. */
async function resolvePageId(
	fileKey: string,
	config: Config,
	override: string | undefined,
): Promise<string | null> {
	const pageId = override || process.env.FIGMA_PAGE_ID || config.pageId;
	if (pageId) return pageId;
	const meta = await getFileMeta(fileKey);
	const page = meta.document?.children?.find((p) => p.name === config.pageName);
	return page?.id ?? null;
}

/**
 * Image phase: download placed-image sources (image-fills — 1 call → free S3 fetches),
 * render the rest in batches (Retry-After-aware), then reconcile assets/missing from disk.
 * Mutates `manifest` (frames[].assets + missingAssets) and persists it. Pure of structure
 * pulls, so `--images-only` can resume images without re-pulling the 6k-node structure.
 */
async function collectImages(
	fileKey: string,
	frameNodes: FigmaNode[],
	manifest: Manifest,
	priorMissing: string[],
): Promise<{ downloaded: number; skipped: number; quotaHit: boolean }> {
	let quotaHit = false;
	let downloaded = 0;
	let skipped = 0;
	// Slots annotated in index.json (map / content-driven) are not static images to
	// fetch — skip them entirely (no render, never counted "missing").
	const ignore = new Set(Object.keys(readIndex()?.slotNotes ?? {}));
	const allImageNodes: ImageNode[] = [];
	for (const frame of frameNodes) collectImageNodes(frame, allImageNodes);
	const imageNodes = allImageNodes.filter((n) => !ignore.has(n.id));
	if (!imageNodes.length) return { downloaded, skipped, quotaHit };

	const annotated = allImageNodes.length - imageNodes.length;
	console.error(
		`  ${imageNodes.length} image nodes — fetching sources (image-fills)…${annotated ? ` (${annotated} annotated slots skipped)` : ""}`,
	);
	let fillsMap: Record<string, string> = {};
	try {
		fillsMap = (await getImageFills(fileKey)).meta?.images ?? {};
	} catch (err) {
		if (err instanceof FigmaQuotaError) quotaHit = true;
		else throw err;
	}

	const needRender: ImageNode[] = [];
	for (const node of imageNodes) {
		if (findExistingAsset(node.id)) {
			skipped++;
			continue;
		}
		const url = node.imageRef ? fillsMap[node.imageRef] : undefined;
		if (!url) {
			needRender.push(node);
			continue;
		}
		try {
			const { data, contentType } = await fetchBinary(url);
			writeFileSync(assetPath(node.id, extFromContentType(contentType)), data);
			downloaded++;
			if (downloaded % 25 === 0) console.error(`  …${downloaded} downloaded`);
		} catch (err) {
			// Don't swallow: a fetch error (expired S3 url) may recover via render, but a
			// write error (disk/permission) won't — surface the cause either way.
			console.error(
				`  ⚠ ${node.id} source fetch/write failed (${errMsg(err)}) → trying render`,
			);
			needRender.push(node);
		}
	}
	if (needRender.length)
		console.error(`  ${needRender.length} nodes without a source → rendering…`);

	for (let i = 0; i < needRender.length && !quotaHit; i += RENDER_BATCH) {
		const batch = needRender.slice(i, i + RENDER_BATCH);
		let images: Record<string, string | null> = {};
		try {
			const resp = await renderImages(
				fileKey,
				batch.map((n) => n.id),
				2,
			);
			if (resp.err)
				console.error(`  ⚠ Figma render error (batch): ${resp.err}`);
			images = resp.images ?? {};
		} catch (err) {
			if (err instanceof FigmaQuotaError) {
				quotaHit = true;
				break;
			}
			// A batch timeout (not quota) → retry one by one, then at scale 1.
			for (const node of batch) {
				try {
					const r = await renderImages(fileKey, [node.id], 2);
					if (r.err)
						console.error(`  ⚠ Figma render error (${node.id}): ${r.err}`);
					Object.assign(images, r.images);
				} catch (err2) {
					if (err2 instanceof FigmaQuotaError) {
						quotaHit = true;
						break;
					}
					try {
						Object.assign(
							images,
							(await renderImages(fileKey, [node.id], 1)).images,
						);
					} catch (err3) {
						console.error(
							`  ⚠ ${node.id} render failed at every scale (${errMsg(err3)}) — recording missing`,
						);
					}
				}
			}
		}
		for (const node of batch) {
			const url = images[node.id];
			if (!url) continue;
			try {
				const { data } = await fetchBinary(url);
				writeFileSync(assetPath(node.id, "png"), data);
				downloaded++;
			} catch (err) {
				console.error(
					`  ⚠ ${node.id} render download/write failed (${errMsg(err)}) — recording missing`,
				);
			}
		}
	}

	// Reconcile assets & missing from disk truth (resumable & accurate).
	const missing = new Set<string>(priorMissing);
	const assetsByFrame = new Map<string, string[]>();
	for (const node of imageNodes) {
		const asset = findExistingAsset(node.id);
		if (asset) {
			const list = assetsByFrame.get(node.frameId) ?? [];
			list.push(asset);
			assetsByFrame.set(node.frameId, list);
		} else {
			missing.add(node.id);
		}
	}
	for (const frame of manifest.frames) {
		const assets = assetsByFrame.get(frame.id);
		if (assets) frame.assets = assets;
	}
	manifest.missingAssets = [...missing];
	writeManifest(manifest);
	return { downloaded, skipped, quotaHit };
}

export async function runCollect(args: ParsedArgs): Promise<number> {
	const config = readConfig();
	const fileKey = process.env.FIGMA_FILE_KEY || config.fileKey;
	const only = flagString(args, "only") ?? null;
	const noImages = args.flags.has("no-images");
	const asJson = args.flags.has("json");
	const imagesOnly = args.flags.has("images-only");
	const pageOverride = flagString(args, "page");

	// --images-only: fetch placed images for the already-cached frames, no structure pull.
	if (imagesOnly) {
		const manifest = readManifest();
		if (!manifest) {
			console.error(
				"Cache is empty — run `figma collect` first, then `--images-only`.",
			);
			return 1;
		}
		const missingFrame = manifest.frames.find((f) => !frameFileExists(f.id));
		if (missingFrame) {
			console.error(
				`Frame file ${missingFrame.file} is missing (stale manifest) — re-run \`figma collect\`.`,
			);
			return 3;
		}
		const frameNodes = manifest.frames.map((f) => readFrameFile(f.id).document);
		const { downloaded, skipped, quotaHit } = await collectImages(
			fileKey,
			frameNodes,
			manifest,
			[],
		);
		const missing = manifest.missingAssets.length;
		if (asJson) {
			console.log(
				JSON.stringify(
					{ mode: "images-only", downloaded, skipped, missing, quotaHit },
					null,
					2,
				),
			);
		} else {
			console.log(
				`✓ images-only — ${downloaded} placed images downloaded (${skipped} skipped)`,
			);
			if (missing)
				console.log(
					`⚠ ${missing} not fetched${quotaHit ? " (quota)" : ""} — re-run to resume`,
				);
		}
		return quotaHit ? 2 : 0;
	}

	const pageId = await resolvePageId(fileKey, config, pageOverride);
	if (!pageId) {
		console.error(
			`Cannot resolve a page: no pageId and no page named "${config.pageName}" in the file.`,
		);
		return 1;
	}

	// ── Structure phase (1 request) ─────────────────────────────────────────────
	const rootIds = only ? [only] : [pageId];
	let resp: NodesResponse;
	try {
		resp = await getNodes(fileKey, rootIds);
	} catch (err) {
		if (err instanceof FigmaApiError && err.status === 404) {
			console.error(
				`Page/node ${rootIds.join(",")} not found in file ${fileKey}.`,
			);
			return 1;
		}
		if (err instanceof FigmaQuotaError) {
			console.error(
				"Rate limit hit before any data could be pulled — retry later.",
			);
			return 2;
		}
		throw err;
	}

	const collectedAt = new Date().toISOString();
	const { version, lastModified } = resp;

	let frameNodes: FigmaNode[];
	let tables: CanvasTables;
	if (only) {
		const entry = resp.nodes[only];
		if (!entry) {
			console.error(`Node ${only} not found.`);
			return 1;
		}
		frameNodes = [entry.document];
		tables = {
			styles: entry.styles,
			components: entry.components,
			componentSets: entry.componentSets,
		};
	} else {
		const entry = resp.nodes[pageId];
		if (!entry) {
			console.error(`Page ${pageId} not found.`);
			return 1;
		}
		frameNodes = entry.document.children ?? [];
		tables = {
			styles: entry.styles,
			components: entry.components,
			componentSets: entry.componentSets,
		};
	}

	const { frames, nodeToFrame, frameFiles, collectedNodeIds } = splitFrames(
		frameNodes,
		tables,
		version,
		collectedAt,
		config.breakpoints,
	);
	for (const { id, file } of frameFiles) writeFrameFile(id, file);

	// Merge with an existing manifest when recollecting a single frame (--only).
	// NOTE: `source` (version/pageId/collectedAt) below is rewritten to THIS run's values,
	// so after an --only refresh it describes the refreshed frame; the kept frames may
	// predate it. A full `collect` realigns the whole manifest.
	const existing = readManifest();
	let allFrames = frames;
	let allNodeToFrame = nodeToFrame;
	let keptMissing: string[] = [];
	if (only && existing) {
		allFrames = existing.frames.filter((f) => f.id !== only).concat(frames);
		allNodeToFrame = {
			...Object.fromEntries(
				Object.entries(existing.nodeToFrame).filter(([, f]) => f !== only),
			),
			...nodeToFrame,
		};
		keptMissing = existing.missingAssets.filter(
			(id) => !collectedNodeIds.has(id),
		);
	}

	const manifest: Manifest = {
		source: {
			fileKey,
			pageId,
			pageName: config.pageName,
			lastModified,
			version,
			collectedAt,
		},
		frames: allFrames,
		nodeToFrame: allNodeToFrame,
		missingAssets: keptMissing,
	};
	writeManifest(manifest); // structural cache complete & atomic, even if images fail next

	// ── Image phase (image-fills map + batched renders) ──────────────────────────
	const { downloaded, skipped, quotaHit } = noImages
		? { downloaded: 0, skipped: 0, quotaHit: false }
		: await collectImages(fileKey, frameNodes, manifest, keptMissing);

	const summary: CollectSummary = {
		page: pageId,
		frames: manifest.frames.length,
		nodes: Object.keys(manifest.nodeToFrame).length,
		assetsDownloaded: downloaded,
		assetsSkipped: skipped,
		missing: manifest.missingAssets.length,
		quotaHit,
	};

	if (asJson) {
		console.log(JSON.stringify(summary, null, 2));
	} else {
		console.log(
			`✓ page ${pageId} → ${summary.frames} frames, ${summary.nodes} nodes`,
		);
		if (!noImages)
			console.log(
				`✓ ${summary.assetsDownloaded} placed images downloaded (${summary.assetsSkipped} skipped)`,
			);
		else console.log("  (--no-images: image sources skipped)");
		if (summary.missing)
			console.log(
				`⚠ ${summary.missing} placed images not fetched${quotaHit ? " (quota)" : ""} — re-run \`figma collect\` to resume`,
			);
	}
	return quotaHit ? 2 : 0;
}
