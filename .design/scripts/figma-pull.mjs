// Pull the Estuaire Figma design locally via the REST API.
//
// This bypasses the Figma Dev Mode MCP entirely (and its Starter-plan call
// limit): the REST API is available to any user with a personal access token.
// It saves exact node geometry/styles/text as JSON and downloads the real
// placed images as PNG @2x — everything needed to build pixel-perfect offline.
//
// Setup (one-time):
//   1. Figma → Settings → Security → Personal access tokens → generate one
//      with READ access to "File content".
//   2. Add it to .env.development (git-crypt):  FIGMA_TOKEN=figd_xxx
//
// Run:
//   node --env-file=.env.development scripts/figma-pull.mjs            # homepage
//   node --env-file=.env.development scripts/figma-pull.mjs 51:2339    # a node
//
// (Node < 20.6: prefix with FIGMA_TOKEN=figd_xxx instead of --env-file.)

import { createWriteStream, existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY ?? "Rv5HxXNkF6VkTke0ttdAbe";
const rawArgs = process.argv.slice(2);
const noImages = rawArgs.includes("--no-images");
const argNodes = rawArgs.filter((a) => !a.startsWith("--"));
const ROOT_NODES = argNodes.length ? argNodes : ["51:2221"]; // homepage frame

if (!TOKEN) {
	console.error(
		"Missing FIGMA_TOKEN. Run: node --env-file=.env.development scripts/figma-pull.mjs",
	);
	process.exit(1);
}

const API = "https://api.figma.com/v1";
const headers = { "X-Figma-Token": TOKEN };
const DATA_DIR = ".design/figma-data";
const IMG_DIR = "public/figma";

async function api(url, attempt = 0) {
	const res = await fetch(url, { headers });
	if (res.status === 429 && attempt < 4) {
		const wait = 15000 * (attempt + 1);
		console.warn(`  429 rate-limited — waiting ${wait / 1000}s…`);
		await new Promise((r) => setTimeout(r, wait));
		return api(url, attempt + 1);
	}
	if (!res.ok) {
		throw new Error(`${url} -> ${res.status} ${res.statusText}\n${await res.text()}`);
	}
	return res.json();
}

function walk(node, fn) {
	fn(node);
	for (const child of node.children ?? []) walk(child, fn);
}

async function download(url, dest) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`download ${url} -> ${res.status}`);
	await pipeline(res.body, createWriteStream(dest));
}

async function main() {
	await mkdir(DATA_DIR, { recursive: true });
	await mkdir(IMG_DIR, { recursive: true });

	// 1) Exact node JSON (positions, sizes, text, fills, typography, radii).
	const ids = ROOT_NODES.join(",");
	const file = await api(
		`${API}/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(ids)}`,
	);
	await writeFile(path.join(DATA_DIR, "nodes.json"), JSON.stringify(file, null, 2));
	console.log(`✓ geometry/text JSON → ${DATA_DIR}/nodes.json`);

	// 2) Collect image-bearing nodes (named "image" or carrying an IMAGE fill).
	const imageNodeIds = new Set();
	for (const root of ROOT_NODES) {
		const doc = file.nodes?.[root]?.document;
		if (!doc) continue;
		walk(doc, (n) => {
			const hasImageFill =
				Array.isArray(n.fills) &&
				n.fills.some((f) => f.type === "IMAGE" && f.visible !== false);
			if (hasImageFill || n.name?.toLowerCase() === "image") imageNodeIds.add(n.id);
		});
	}
	console.log(`✓ ${imageNodeIds.size} image nodes to render`);

	if (noImages) {
		console.log("  (--no-images: skipped rendering)");
		return;
	}

	// 3) Render to downloadable PNGs. Figma's renderer times out on big batches
	//    of large nodes, so use small batches with a per-id (then scale-1) fallback.
	const renderBatch = async (batchIds, scale) => {
		const r = await api(
			`${API}/images/${FILE_KEY}?ids=${encodeURIComponent(batchIds.join(","))}&format=png&scale=${scale}`,
		);
		return r.images ?? {};
	};

	const idList = [...imageNodeIds].filter(
		(id) => !existsSync(path.join(IMG_DIR, `${id.replace(/[:;]/g, "-")}.png`)),
	);
	const skipped = imageNodeIds.size - idList.length;
	if (skipped) console.log(`  (${skipped} already downloaded — skipping)`);
	const manifest = [];
	const BATCH = 3;
	for (let i = 0; i < idList.length; i += BATCH) {
		const batch = idList.slice(i, i + BATCH);
		if (!batch.length) break;
		let images = {};
		try {
			images = await renderBatch(batch, 2);
		} catch {
			console.warn("  batch timed out, retrying one by one…");
			for (const id of batch) {
				try {
					Object.assign(images, await renderBatch([id], 2));
				} catch {
					try {
						Object.assign(images, await renderBatch([id], 1));
					} catch (err) {
						console.warn(`  ✗ skip ${id}: ${String(err).split("\n")[0]}`);
					}
				}
			}
		}
		for (const [nodeId, url] of Object.entries(images)) {
			if (!url) continue;
			const safe = nodeId.replace(/[:;]/g, "-");
			const dest = path.join(IMG_DIR, `${safe}.png`);
			await download(url, dest);
			manifest.push({ nodeId, file: `/figma/${safe}.png` });
			console.log(`  ↓ ${nodeId} → ${dest}`);
		}
	}
	await writeFile(path.join(DATA_DIR, "images.json"), JSON.stringify(manifest, null, 2));
	console.log(
		`✓ done — ${manifest.length} images in ${IMG_DIR}/, manifest → ${DATA_DIR}/images.json`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
