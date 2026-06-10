/**
 * Seed scaffolder — emits a typed `*.seed.ts` stub from the schema, so seed
 * authoring starts from the real field structure (never invented field names).
 *
 *   npm run seed:scaffold -- <documentName>     # e.g. footer, homePage
 *
 * Fill the TODO placeholders with the maquette values (read the Figma node via the
 * estuaire-figma skill; image fills land in public/figma/), then `npm run seed --
 * --check`. The npm script extracts the schema first. See ADR 0006.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const STRICT_SCHEMA = ".sanity/schema.strict.json";
// Server-managed fields are dropped from the stub; `_id`/`_type` are authored.
const DROP = new Set(["_createdAt", "_updatedAt", "_rev"]);

type Node = {
	type: string;
	value?: unknown;
	attributes?: Record<string, Attr>;
	of?: Node;
	dereferencesTo?: string;
};
type Attr = { value: Node; optional?: boolean };
type SchemaType = { name: string; attributes?: Record<string, Attr> };

const name = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!name) {
	console.error("Usage: npm run seed:scaffold -- <documentName>");
	process.exit(1);
}

const outPath = `src/sanity/seed/documents/${name}.seed.ts`;
if (existsSync(outPath)) {
	console.error(`Refusing to overwrite existing ${outPath}.`);
	process.exit(1);
}

const schema = JSON.parse(readFileSync(STRICT_SCHEMA, "utf8")) as SchemaType[];
const doc = schema.find((t) => t.name === name);
if (!doc?.attributes) {
	console.error(`No schema type "${name}" in ${STRICT_SCHEMA}.`);
	process.exit(1);
}

const isImage = (n: Node) =>
	n.type === "object" &&
	n.attributes?.asset?.value?.dereferencesTo === "sanity.imageAsset";
const isFile = (n: Node) =>
	n.type === "object" &&
	n.attributes?.asset?.value?.dereferencesTo === "sanity.fileAsset";

function stub(node: Node, depth: number, key?: string): string {
	if (key === "_id") return JSON.stringify(name); // singleton-friendly default
	if (isImage(node)) return 'image("public/figma/TODO.png", "TODO")';
	if (isFile(node)) return 'file("public/figma/TODO.pdf")';
	switch (node.type) {
		case "string":
			return typeof node.value === "string"
				? JSON.stringify(node.value)
				: '"TODO"';
		case "number":
			return node.value !== undefined ? String(node.value) : "0";
		case "boolean":
			return node.value !== undefined ? String(node.value) : "false";
		case "array":
			return node.of ? `[${stub(node.of, depth)}]` : "[]";
		case "object": {
			const pad = "\t".repeat(depth + 1);
			const lines = Object.entries(node.attributes ?? {})
				.filter(([k]) => !DROP.has(k))
				.map(([k, a]) => `${pad}${k}: ${stub(a.value, depth + 1, k)},`);
			return `{\n${lines.join("\n")}\n${"\t".repeat(depth)}}`;
		}
		default:
			return `undefined /* TODO: unsupported type "${node.type}" */`;
	}
}

const literal = stub({ type: "object", attributes: doc.attributes }, 0);

const typeName = name[0].toUpperCase() + name.slice(1);
const imports = ["defineSeed"];
if (literal.includes("file(")) imports.push("file");
if (literal.includes("image(")) imports.push("image");

const content = `import type { ${typeName} } from "@/sanity.types";
import { ${imports.sort().join(", ")} } from "../define";

// Scaffolded from the schema — fill the TODOs with the maquette values, then:
//   npm run seed -- --check   (validate)  ·  npm run seed   (write)
export default defineSeed<${typeName}>(${literal});
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, content);
console.log(`✓ scaffolded ${outPath}`);
console.log("  Next: fill the TODOs, then `npm run seed -- --check`.");
