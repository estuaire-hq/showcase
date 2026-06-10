// Render arbitrary Figma nodes (incl. text/groups) to flat PNGs via the REST
// /images endpoint — for visual reference, not served assets. Output → .design/.
// Run: node --env-file=.env.development .design/scripts/figma-render.mjs 75:3599 [more ids…]

import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY ?? "Rv5HxXNkF6VkTke0ttdAbe";
const ids = process.argv.slice(2);
if (!TOKEN) {
	console.error("Missing FIGMA_TOKEN (run with --env-file=.env.development).");
	process.exit(1);
}
if (!ids.length) {
	console.error("Usage: figma-render.mjs <nodeId> [nodeId…]");
	process.exit(1);
}

const OUT = ".design/figma-data";
const url = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids.join(","))}&format=png&scale=2`;
const res = await fetch(url, { headers: { "X-Figma-Token": TOKEN } });
if (!res.ok) {
	console.error(`${res.status} ${res.statusText}\n${await res.text()}`);
	process.exit(1);
}
const { images } = await res.json();
await mkdir(OUT, { recursive: true });
for (const [id, src] of Object.entries(images)) {
	if (!src) {
		console.warn(`✗ no render for ${id}`);
		continue;
	}
	const dest = path.join(OUT, `render-${id.replace(/[:;]/g, "-")}.png`);
	const img = await fetch(src);
	await pipeline(img.body, createWriteStream(dest));
	console.log(`↓ ${id} → ${dest}`);
}
