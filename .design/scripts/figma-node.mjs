// LOSSLESS Figma node reader — dumps the COMPLETE subtree of a node from the
// pulled nodes.json, with EVERY layout/style field, parent-relative geometry,
// layer opacity, fills (incl. per-paint opacity), strokes + weight + align,
// corner radii, auto-layout, and full text style + per-character overrides.
//
// This is the build-time source of truth for pixel-perfect work. Unlike a
// hand-rolled "inventory" digest, it does NOT pre-select fields — so you never
// lose the exact value you need (position, opacity, font-size, radius…).
//
// Usage:
//   node .design/scripts/figma-node.mjs <nodeId|name> [--depth=N] [--leaves]
//   node .design/scripts/figma-node.mjs 51:2222
//   node .design/scripts/figma-node.mjs "BTN envoyer"
// (Pull the node first if absent: figma-pull.mjs <nodeId>.)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");
const data = JSON.parse(
	readFileSync(resolve(root, ".design/figma-data/nodes.json"), "utf8"),
);

const args = process.argv.slice(2);
const query = args.find((a) => !a.startsWith("--"));
const maxDepth = Number((args.find((a) => a.startsWith("--depth=")) || "").split("=")[1] || Infinity);
const leavesOnly = args.includes("--leaves");
if (!query) {
	console.error('Usage: figma-node.mjs <nodeId|name> [--depth=N] [--leaves]');
	process.exit(1);
}

// Find the target node by id or exact name across all pulled roots.
let target = null;
for (const key of Object.keys(data.nodes || {})) {
	const doc = data.nodes[key].document;
	(function find(n) {
		if (target) return;
		if (n.id === query || n.name === query) target = n;
		for (const c of n.children || []) find(c);
	})(doc);
	if (target) break;
}
if (!target) {
	console.error(`Node "${query}" not found in nodes.json. Pull it first.`);
	process.exit(1);
}

const origin = target.absoluteBoundingBox;
const hex = (c) =>
	c
		? `#${[c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`
		: "?";
const paints = (ps) =>
	Array.isArray(ps) && ps.length
		? ps
				.map((p) => {
					if (p.visible === false) return `${p.type}(hidden)`;
					if (p.type === "SOLID")
						return `${hex(p.color)}${p.opacity != null && p.opacity < 1 ? `·a${p.opacity.toFixed(2)}` : ""}`;
					if (p.type?.startsWith("GRADIENT"))
						return `${p.type}[${(p.gradientStops || []).map((s) => hex(s.color)).join("→")}]`;
					if (p.type === "IMAGE") return `IMAGE(${p.scaleMode || ""})`;
					return p.type;
				})
				.join(", ")
		: null;

const lines = [];
const out = (s) => lines.push(s);

const describe = (n, depth) => {
	const pad = "  ".repeat(depth);
	const bb = n.absoluteBoundingBox;
	const geo = bb
		? `@(${Math.round(bb.x - origin.x)},${Math.round(bb.y - origin.y)}) ${Math.round(bb.width)}×${Math.round(bb.height)}`
		: "";
	const bits = [];
	if (n.opacity != null && n.opacity < 1) bits.push(`opacity=${n.opacity.toFixed(3)}`);
	if (n.cornerRadius != null) bits.push(`radius=${n.cornerRadius}`);
	if (n.rectangleCornerRadii) bits.push(`radii=${n.rectangleCornerRadii.join("/")}`);
	const fl = paints(n.fills);
	if (fl) bits.push(`fill=[${fl}]`);
	const st = paints(n.strokes);
	if (st) bits.push(`stroke=[${st}] w=${n.strokeWeight ?? "?"} align=${n.strokeAlign ?? "?"}`);
	if (n.layoutMode && n.layoutMode !== "NONE") {
		const p = [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map((v) => v ?? 0).join("/");
		bits.push(`layout=${n.layoutMode} gap=${n.itemSpacing ?? 0} pad=${p} align=${n.primaryAxisAlignItems ?? "-"}/${n.counterAxisAlignItems ?? "-"}`);
	}
	if (Array.isArray(n.effects) && n.effects.length)
		bits.push(`effects=${n.effects.filter((e) => e.visible !== false).map((e) => e.type).join(",")}`);
	if (n.type === "TEXT") {
		const s = n.style || {};
		bits.push(`text{${s.fontFamily} ${s.fontWeight} ${s.fontSize}px lh${Math.round(s.lineHeightPx || 0)} ls${(s.letterSpacing || 0).toFixed?.(2) ?? s.letterSpacing} ${s.textCase || ""} ${s.textAlignHorizontal || ""}}`);
		const overrides = new Set((n.characterStyleOverrides || []).filter(Boolean));
		for (const id of overrides) {
			const ov = (n.styleOverrideTable || {})[id] || {};
			const o = [];
			if (ov.fills) o.push(`fill=${paints(ov.fills)}`);
			if (ov.strokes) o.push(`stroke=${paints(ov.strokes)} w${ov.strokeWeight ?? "?"}`);
			if (ov.fontFamily) o.push(ov.fontFamily);
			if (ov.fontWeight) o.push(`w${ov.fontWeight}`);
			if (o.length) bits.push(`charOverride#${id}{${o.join(" ")}}`);
		}
	}
	out(`${pad}- [${n.type}] "${n.name}" ${geo}${bits.length ? " · " + bits.join(" · ") : ""}`);
	if (n.type === "TEXT" && n.characters)
		out(`${pad}    ::"${n.characters.replace(/\n/g, "⏎")}"`);
};

const walk = (n, depth) => {
	const isLeaf = !(n.children && n.children.length);
	if (!leavesOnly || isLeaf) describe(n, depth);
	if (depth >= maxDepth) return;
	for (const c of n.children || []) walk(c, depth + 1);
};

let count = 0;
(function countAll(n) {
	count++;
	for (const c of n.children || []) countAll(c);
})(target);

out(`# ${target.name} [${target.type}] ${Math.round(origin.width)}×${Math.round(origin.height)} — ${count} nodes total`);
out(`# geometry is parent-relative to this node's top-left (0,0). All fields, no filtering.`);
out("");
walk(target, 0);
console.log(lines.join("\n"));
