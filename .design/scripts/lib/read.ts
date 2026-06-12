// read — lossless local node reader (the real MCP replacement). Resolves a node
// id (or, via the index, a business name — see resolveTarget) to its top-level
// frame through the manifest, opens that ONE frame file, extracts the requested
// subtree, and prints either a human digest (every field, no filtering — EF-001)
// or the raw JSON (`--raw`). 100% offline: never touches the network (EF-002).

import { flagString, type ParsedArgs } from "../figma";
import {
	findExistingAsset,
	findFrameForNode,
	readFrameFile,
	readIndex,
	readManifest,
} from "./cache";
import {
	formatCharOverrides,
	formatPaints,
	formatTextStyle,
	imageFillOf,
	isVisibleImageFill,
} from "./paints";
import { countNodes, findNode } from "./tree";
import type { BoundingBox, Breakpoint, FigmaNode } from "./types";

/** Parent-relative geometry `@(x,y) w×h` (one definition shared by digest + inventory). */
function relGeo(
	bb: BoundingBox | null | undefined,
	origin: BoundingBox | null | undefined,
): string {
	return bb && origin
		? `@(${Math.round(bb.x - origin.x)},${Math.round(bb.y - origin.y)}) ${Math.round(bb.width)}×${Math.round(bb.height)}`
		: "";
}

/**
 * The declared reference render for a node id — the page export linked in
 * index.image for the target whose node[bp] is this id. A reference render is
 * defined by the index (declarative), NOT inferred from a matching asset filename
 * (which would also match a placed bitmap that happens to share the id namespace).
 */
function referenceRenderFor(nodeId: string): string | null {
	const index = readIndex();
	if (!index) return null;
	for (const target of Object.values(index.targets)) {
		for (const [bp, id] of Object.entries(target.node)) {
			if (id !== nodeId) continue;
			const img = target.image?.[bp as Breakpoint];
			if (img) return img;
		}
	}
	return null;
}

/**
 * Render the lossless human digest of a subtree: header with total node count,
 * then an indented tree with parent-relative geometry, layer opacity, fills,
 * strokes (+weight/align), radii, auto-layout, effects, full TEXT style and
 * per-character overrides, plus the characters themselves.
 */
export function renderDigest(
	target: FigmaNode,
	maxDepth: number,
	leavesOnly: boolean,
): string {
	const origin = target.absoluteBoundingBox;
	const slotNotes = readIndex()?.slotNotes ?? {};
	const lines: string[] = [];

	const describe = (n: FigmaNode, depth: number) => {
		const pad = "  ".repeat(depth);
		const geo = relGeo(n.absoluteBoundingBox, origin);
		const bits: string[] = [];
		if (n.opacity != null && n.opacity < 1)
			bits.push(`opacity=${n.opacity.toFixed(3)}`);
		if (n.cornerRadius != null) bits.push(`radius=${n.cornerRadius}`);
		if (n.rectangleCornerRadii)
			bits.push(`radii=${n.rectangleCornerRadii.join("/")}`);
		const fill = formatPaints(n.fills);
		if (fill) bits.push(`fill=[${fill}]`);
		const stroke = formatPaints(n.strokes);
		if (stroke)
			bits.push(
				`stroke=[${stroke}] w=${n.strokeWeight ?? "?"} align=${n.strokeAlign ?? "?"}`,
			);
		if (n.layoutMode && n.layoutMode !== "NONE") {
			const padding = [
				n.paddingTop,
				n.paddingRight,
				n.paddingBottom,
				n.paddingLeft,
			]
				.map((v) => v ?? 0)
				.join("/");
			bits.push(
				`layout=${n.layoutMode} gap=${n.itemSpacing ?? 0} pad=${padding} align=${n.primaryAxisAlignItems ?? "-"}/${n.counterAxisAlignItems ?? "-"}`,
			);
		}
		if (Array.isArray(n.effects) && n.effects.length)
			bits.push(
				`effects=${n.effects
					.filter((e) => e.visible !== false)
					.map((e) => e.type)
					.join(",")}`,
			);
		if (n.type === "TEXT") {
			bits.push(formatTextStyle(n.style));
			for (const override of formatCharOverrides(n)) bits.push(override);
		}
		// Surface the cached bitmap for an image-bearing node (foolproof node↔image link),
		// or its semantic note (map / content-driven — not a static image to fetch).
		if ((n.fills ?? []).some(isVisibleImageFill)) {
			const note = slotNotes[n.id];
			if (note) bits.push(`${note.kind}: ${note.note}`);
			else {
				const asset = findExistingAsset(n.id);
				if (asset) bits.push(`asset=.design/figma-cache/${asset}`);
			}
		}
		lines.push(
			`${pad}- [${n.type}] "${n.name}" ${geo}${bits.length ? ` · ${bits.join(" · ")}` : ""}`,
		);
		if (n.type === "TEXT" && typeof n.characters === "string")
			lines.push(`${pad}    ::"${n.characters.replace(/\n/g, "⏎")}"`);
	};

	const walk = (n: FigmaNode, depth: number) => {
		const isLeaf = !n.children?.length;
		if (!leavesOnly || isLeaf) describe(n, depth);
		if (depth >= maxDepth) return;
		for (const child of n.children ?? []) walk(child, depth + 1);
	};

	const width = origin ? Math.round(origin.width) : 0;
	const height = origin ? Math.round(origin.height) : 0;
	lines.push(
		`# ${target.name} [${target.type}] ${width}×${height} — ${countNodes(target)} nodes total`,
	);
	const render = referenceRenderFor(target.id);
	if (render)
		lines.push(
			`# render: .design/figma-cache/${render}  (visual reference — diff against this)`,
		);
	lines.push(
		"# geometry is parent-relative to this node's top-left (0,0). All fields, no filtering.",
	);
	lines.push("");
	walk(target, 0);
	return lines.join("\n");
}

type Resolution = { ok: true; id: string } | { ok: false; message: string };

/**
 * Compact image inventory of a subtree — one line per image-bearing slot: id, name,
 * parent-relative geometry, fit (scaleMode) and the cached bitmap path (or MISSING).
 * The agent's "which images & where" manifest for a page (EF — `read --images`).
 */
export function renderImageInventory(target: FigmaNode): string {
	const origin = target.absoluteBoundingBox;
	const slotNotes = readIndex()?.slotNotes ?? {};
	const slots: string[] = [];
	const visit = (n: FigmaNode) => {
		const fill = imageFillOf(n);
		if (fill) {
			const geo = relGeo(n.absoluteBoundingBox, origin);
			const note = slotNotes[n.id];
			const asset = findExistingAsset(n.id);
			const tail = note
				? `→ ${note.kind.toUpperCase()}: ${note.note}`
				: asset
					? `asset=.design/figma-cache/${asset}`
					: "asset=MISSING (run `figma collect --images-only`)";
			slots.push(
				`- ${n.id}  "${n.name}"  ${geo}  ${fill.scaleMode ?? "?"}  ${tail}`,
			);
		}
		for (const child of n.children ?? []) visit(child);
	};
	visit(target);
	return [
		`# ${slots.length} image slot(s) in ${target.name} [${target.type}]`,
		"# fit: FILL→object-cover · FIT→object-contain · STRETCH→object-fill · TILE→repeat",
		"",
		...slots,
	].join("\n");
}

/**
 * Resolve a `read` query to a raw Figma node id. A query containing `:` is a raw
 * Figma id and is used as-is; otherwise it is a named index target resolved via
 * index.json (+ `--bp`, defaulting to desktop, else the sole variant). Reports
 * unknown name, ambiguous (responsive, no `--bp`) and missing-variant explicitly.
 */
function resolveQuery(query: string, bp: string | undefined): Resolution {
	if (query.includes(":")) return { ok: true, id: query };

	const index = readIndex();
	const entry = index?.targets[query];
	if (!entry)
		return {
			ok: false,
			message: `Unknown index name "${query}" — run \`figma list\` to see targets.`,
		};

	const variants = entry.node;
	if (bp) {
		const id = variants[bp as Breakpoint];
		if (!id)
			return {
				ok: false,
				message: `Target "${query}" has no "${bp}" variant.`,
			};
		return { ok: true, id };
	}
	if (variants.desktop) return { ok: true, id: variants.desktop };
	const present = Object.entries(variants).filter((e): e is [string, string] =>
		Boolean(e[1]),
	);
	const sole = present.length === 1 ? present[0] : undefined;
	if (sole) return { ok: true, id: sole[1] };
	return {
		ok: false,
		message: `Target "${query}" is responsive (${present.map(([k]) => k).join(", ")}) — specify --bp=desktop|tablet|mobile.`,
	};
}

export async function runRead(args: ParsedArgs): Promise<number> {
	const query = args.positionals[0];
	if (!query) {
		console.error(
			"Usage: figma read <nodeId|name> [--depth=N] [--leaves] [--bp=desktop|tablet|mobile] [--raw] [--images]",
		);
		return 1;
	}
	const raw = args.flags.has("raw");
	const leavesOnly = args.flags.has("leaves");
	const depthFlag = flagString(args, "depth");
	let maxDepth = Number.POSITIVE_INFINITY;
	if (depthFlag !== undefined) {
		const n = Number(depthFlag);
		if (!Number.isInteger(n) || n < 0) {
			console.error(
				`--depth must be a non-negative integer (got "${depthFlag}").`,
			);
			return 1;
		}
		maxDepth = n;
	}
	const bp = flagString(args, "bp");

	const resolution = resolveQuery(query, bp);
	if (!resolution.ok) {
		console.error(resolution.message);
		return 1;
	}
	const nodeId = resolution.id;

	const manifest = readManifest();
	if (!manifest) {
		console.error(
			"Cache is empty (no manifest.json) — run `figma collect` first.",
		);
		return 1;
	}

	const frameId = findFrameForNode(manifest, nodeId);
	if (!frameId) {
		console.error(
			`Node ${nodeId} is not in the cache — run \`figma collect\` first.`,
		);
		return 1;
	}

	const frame = readFrameFile(frameId);
	const target = findNode(frame.document, nodeId);
	if (!target) {
		console.error(
			`Node ${nodeId} is routed to frame ${frameId} but absent from it (stale manifest — re-run \`figma collect\`).`,
		);
		return 1;
	}

	if (args.flags.has("images")) {
		console.log(renderImageInventory(target));
		return 0;
	}
	console.log(
		raw
			? JSON.stringify(target, null, 2)
			: renderDigest(target, maxDepth, leavesOnly),
	);
	return 0;
}
