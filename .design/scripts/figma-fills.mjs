// Download raw source images by imageRef via the Figma image-fills endpoint
// (/v1/files/:key/images). Render-free, so it sidesteps the /v1/images render
// rate limit. Maps target node ids -> their IMAGE fill imageRef -> source URL.
//
// Usage: node --env-file=.env.development scripts/figma-fills.mjs [nodeId ...]
//        (defaults to the slider blue image 51:2380)

import { readFileSync, writeFileSync } from "node:fs";

const TOKEN = process.env.FIGMA_TOKEN;
const KEY = process.env.FIGMA_FILE_KEY ?? "Rv5HxXNkF6VkTke0ttdAbe";
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ["51:2380"];

if (!TOKEN) {
	console.error("Missing FIGMA_TOKEN.");
	process.exit(1);
}

const doc = JSON.parse(readFileSync(".design/figma-data/nodes.json", "utf8"));
const refByNode = {};
function walk(n) {
	const im = (n.fills ?? []).find((f) => f.type === "IMAGE" && f.imageRef);
	if (im) refByNode[n.id] = im.imageRef;
	for (const c of n.children ?? []) walk(c);
}
for (const k of Object.keys(doc.nodes)) walk(doc.nodes[k].document);

const res = await fetch(`https://api.figma.com/v1/files/${KEY}/images`, {
	headers: { "X-Figma-Token": TOKEN },
});
console.log("image-fills endpoint:", res.status, res.statusText);
const map = (await res.json()).meta?.images ?? {};

for (const id of targets) {
	const ref = refByNode[id];
	if (!ref) {
		console.warn(`no imageRef for ${id}`);
		continue;
	}
	const url = map[ref];
	if (!url) {
		console.warn(`no url for ref ${ref} (${id})`);
		continue;
	}
	const img = await fetch(url);
	const ct = img.headers.get("content-type") ?? "";
	const ext = ct.includes("jpeg")
		? "jpg"
		: ct.includes("webp")
			? "webp"
			: "png";
	const buf = Buffer.from(await img.arrayBuffer());
	const safe = id.replace(/[:;]/g, "-");
	writeFileSync(`public/figma/${safe}.${ext}`, buf);
	console.log(`✓ public/figma/${safe}.${ext} (${buf.length} bytes, ref ${ref})`);
}
