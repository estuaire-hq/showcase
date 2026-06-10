// List the Figma file's pages and their top-level frames (name + width) to
// discover the responsive breakpoint frames (desktop / tablet / mobile).
// Run: node --env-file=.env.development .design/scripts/figma-frames.mjs

const TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY ?? "Rv5HxXNkF6VkTke0ttdAbe";
if (!TOKEN) {
	console.error("Missing FIGMA_TOKEN (--env-file=.env.development).");
	process.exit(1);
}
const res = await fetch(
	`https://api.figma.com/v1/files/${FILE_KEY}?depth=2&geometry=paths`,
	{ headers: { "X-Figma-Token": TOKEN } },
);
if (!res.ok) {
	console.error(`${res.status} ${res.statusText}\n${await res.text()}`);
	process.exit(1);
}
const { document } = await res.json();
for (const page of document.children ?? []) {
	console.log(`\n## PAGE "${page.name}"`);
	for (const f of page.children ?? []) {
		const bb = f.absoluteBoundingBox;
		console.log(
			`  - [${f.type}] "${f.name}" ${bb ? `${Math.round(bb.width)}×${Math.round(bb.height)}` : ""} (${f.id})`,
		);
	}
}
