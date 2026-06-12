// list + status — discovery and the cache quality gate.
//   list   : print the curated named index (name · description · nodes/bp) so an
//            AI picks the right unit in one step, without opening files (offline).
//   status : freshness (1 light call: remote `version` vs local) + index↔cache
//            consistency (offline). The cache's analogue to `seed --check`.

import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ParsedArgs } from "../figma";
import { cacheDir, frameFileExists, readConfig, readIndex, readManifest } from "./cache";
import { FigmaApiError, FigmaNetworkError, FigmaQuotaError, getFileMeta } from "./figma-api";
import type { Breakpoint, IndexFile, Manifest } from "./types";

const BREAKPOINTS: Breakpoint[] = ["desktop", "tablet", "mobile"];

/** Format a target's responsive variants as `desktop <id> · mobile <id>`. */
function formatVariants(node: Partial<Record<Breakpoint, string>>): string {
	return BREAKPOINTS.filter((bp) => node[bp])
		.map((bp) => `${bp} ${node[bp]}`)
		.join(" · ");
}

// ── list ───────────────────────────────────────────────────────────────────────

export function runList(args: ParsedArgs): number {
	const index = readIndex();
	const manifest = readManifest();
	const asJson = args.flags.has("json");
	const targets = index?.targets ?? {};
	const names = Object.keys(targets).sort();

	const collected = (id: string) => Boolean(manifest && id in manifest.nodeToFrame);

	if (asJson) {
		const out = names.map((name) => {
			const t = targets[name];
			const nodes = Object.fromEntries(
				BREAKPOINTS.filter((bp) => t.node[bp]).map((bp) => [bp, { id: t.node[bp], collected: collected(t.node[bp] as string) }]),
			);
			return { name, description: t.description, nodes, warn: !t.description || Object.values(nodes).some((n) => !n.collected) };
		});
		console.log(JSON.stringify(out, null, 2));
		return 0;
	}

	if (!names.length) {
		console.log("No named targets yet — add entries to .design/figma-cache/index.json (see data-model.md §4).");
		return 0;
	}
	for (const name of names) {
		const t = targets[name];
		const missing = BREAKPOINTS.some((bp) => t.node[bp] && !collected(t.node[bp] as string));
		const warn = !t.description || missing ? " ⚠" : "";
		console.log(`${name}${warn}`);
		console.log(`  ${t.description || "(no description)"}`);
		console.log(`  [${formatVariants(t.node)}]`);
	}
	if (!manifest) console.log("\n(no manifest — run `figma collect`; collected-status unknown)");
	return 0;
}

// ── status: consistency (offline) ───────────────────────────────────────────────

interface Coherence {
	errors: string[];
	warnings: string[];
}

function checkCoherence(manifest: Manifest, index: IndexFile | null): Coherence {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Index targets ↔ cache.
	for (const [name, target] of Object.entries(index?.targets ?? {})) {
		if (!target.description || !target.description.trim())
			errors.push(`index "${name}": missing description (no anonymous target — CS-007).`);
		const present = BREAKPOINTS.filter((bp) => target.node[bp]);
		for (const bp of present) {
			const id = target.node[bp] as string;
			const frameId = manifest.nodeToFrame[id];
			if (!frameId) {
				errors.push(`index "${name}" (${bp} ${id}): node not collected — run \`figma collect\`.`);
			} else if (!frameFileExists(frameId)) {
				errors.push(`index "${name}" (${bp} ${id}): routed to frame ${frameId} but its file is missing.`);
			}
		}
		if (present.length >= 2) {
			for (const bp of BREAKPOINTS)
				if (!target.node[bp]) warnings.push(`index "${name}": responsive but missing ${bp} variant.`);
		}
		// Reference renders: a declared image must exist on disk; a node without one is noted.
		for (const bp of present) {
			const img = target.image?.[bp];
			if (!img) warnings.push(`index "${name}" (${bp}): no reference render linked.`);
			else if (!existsSync(join(cacheDir(), img)))
				warnings.push(`index "${name}" (${bp}): render ${img} declared but file is missing.`);
		}
	}

	// Manifest frames ↔ frame files (orphans / missing files).
	for (const frame of manifest.frames) {
		if (!frameFileExists(frame.id)) errors.push(`manifest frame ${frame.id}: file ${frame.file} is missing.`);
	}

	// Slot annotations must point at collected nodes.
	for (const id of Object.keys(index?.slotNotes ?? {})) {
		if (!manifest.nodeToFrame[id]) warnings.push(`slotNote "${id}": node not in cache (stale annotation?).`);
	}

	return { errors, warnings };
}

// ── status: freshness (network) ──────────────────────────────────────────────────

type Freshness = "up-to-date" | "stale" | "unknown" | "not-evaluated";

export async function runStatus(args: ParsedArgs): Promise<number> {
	const asJson = args.flags.has("json");
	const offline = args.flags.has("offline");

	const manifest = readManifest();
	if (!manifest) {
		console.error("Cache is empty (no manifest.json) — run `figma collect` first.");
		return 1;
	}
	const index = readIndex();
	const config = readConfig();

	const coherence = checkCoherence(manifest, index);
	let exit = coherence.errors.length ? 3 : 0;

	let freshness: Freshness = "not-evaluated";
	if (!offline) {
		const fileKey = process.env.FIGMA_FILE_KEY || config.fileKey;
		try {
			const remote = await getFileMeta(fileKey);
			freshness = remote.version === manifest.source.version ? "up-to-date" : "stale";
		} catch (err) {
			if (err instanceof FigmaNetworkError || err instanceof FigmaQuotaError || err instanceof FigmaApiError) {
				freshness = "unknown";
				if (exit !== 3) exit = 2; // network failure subi; coherence (3) takes precedence
			} else {
				throw err;
			}
		}
	}

	const placedMissing = manifest.missingAssets.length;
	const targetCount = index ? Object.keys(index.targets).length : 0;
	const placedCollected = manifest.frames.reduce((n, f) => n + f.assets.length, 0);
	const annotatedSlots = index?.slotNotes ? Object.keys(index.slotNotes).length : 0;
	// Reference-render coverage (index.image — the manual page exports).
	let renderHave = 0;
	let renderTotal = 0;
	for (const t of Object.values(index?.targets ?? {})) {
		for (const bp of BREAKPOINTS) {
			if (!t.node[bp]) continue;
			renderTotal++;
			const img = t.image?.[bp];
			if (img && existsSync(join(cacheDir(), img))) renderHave++;
		}
	}

	if (asJson) {
		console.log(
			JSON.stringify(
				{
					freshness,
					localVersion: manifest.source.version,
					lastModified: manifest.source.lastModified,
					collectedAt: manifest.source.collectedAt,
					coherence,
					summary: {
					frames: manifest.frames.length,
					targets: targetCount,
					referenceRenders: { have: renderHave, total: renderTotal },
					placedImageAssets: { collected: placedCollected, uncollected: placedMissing },
					annotatedSlots,
				},
					exit,
				},
				null,
				2,
			),
		);
		return exit;
	}

	const freshnessLabel: Record<Freshness, string> = {
		"up-to-date": "✓ up to date",
		stale: "⚠ stale — run `figma collect`",
		unknown: "? unknown (Figma unreachable)",
		"not-evaluated": "— not evaluated (--offline)",
	};
	console.log(`Freshness: ${freshnessLabel[freshness]}`);
	console.log(`  local version ${manifest.source.version} · modified ${manifest.source.lastModified} · collected ${manifest.source.collectedAt}`);
	console.log(`Cache: ${manifest.frames.length} frames, ${targetCount} targets`);
	console.log(`Reference renders: ${renderHave}/${renderTotal} present (index.image — page exports for visual diff)`);
	if (placedCollected || placedMissing)
		console.log(
			`Placed-image assets: ${placedCollected} collected${placedMissing ? `, ${placedMissing} uncollected — run \`figma collect\`` : ""}`,
		);
	if (annotatedSlots)
		console.log(`Annotated slots: ${annotatedSlots} (map / content-driven — not fetched, see index.json slotNotes)`);
	if (coherence.errors.length) {
		console.log(`Consistency: ${coherence.errors.length} error(s)`);
		for (const e of coherence.errors) console.log(`  ✗ ${e}`);
	} else {
		console.log("Consistency: ✓ index ↔ cache consistent");
	}
	for (const w of coherence.warnings) console.log(`  ⚠ ${w}`);
	return exit;
}
