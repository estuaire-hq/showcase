/**
 * Seed runner — resolves typed seed definitions and writes them to Sanity.
 *
 *   npm run seed              # createIfNotExists — never clobbers editor edits
 *   npm run seed -- --reset   # createOrReplace — reset documents to the maquette
 *   npm run seed -- --check   # dry-run: validate, write nothing (offline, no token)
 *   npm run seed -- footer    # restrict to one document type
 *
 * The npm script runs `sanity schema extract --enforce-required-fields` first, so
 * `.sanity/schema.strict.json` carries which fields are required (a field without
 * `optional: true`). `--check` enforces that coverage — the generated TS types leave
 * everything optional, so this runtime gate is what guarantees required fields and
 * that every referenced asset exists on disk. See ADR 0006 / constitution IX.
 */

import { createHash } from "node:crypto";
import {
	createReadStream,
	existsSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { basename, resolve } from "node:path";
import { isSeedFile, isSeedImage } from "./define";
import { seeds } from "./registry";

const API_VERSION = "2026-03-01";
const STRICT_SCHEMA = ".sanity/schema.strict.json";
const ASSET_MANIFEST = ".sanity/asset-manifest.json";
const SYSTEM_FIELDS = new Set([
	"_id",
	"_type",
	"_createdAt",
	"_updatedAt",
	"_rev",
]);

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const RESET = args.includes("--reset");
const ONLY = args.find((a) => !a.startsWith("--"));

type SeedDoc = { _id: string; _type: string } & Record<string, unknown>;

// ── Required-field detection (from the enforced schema) ──────────────────────

type SchemaAttr = { optional?: boolean };
type SchemaType = { name: string; attributes?: Record<string, SchemaAttr> };

function requiredFields(typeName: string): string[] {
	if (!existsSync(STRICT_SCHEMA)) {
		throw new Error(
			`Missing ${STRICT_SCHEMA}. Run via \`npm run seed\` (it extracts the schema first).`,
		);
	}
	const schema = JSON.parse(
		readFileSync(STRICT_SCHEMA, "utf8"),
	) as SchemaType[];
	const type = schema.find((t) => t.name === typeName);
	if (!type?.attributes) return [];
	return Object.entries(type.attributes)
		.filter(([name, attr]) => !SYSTEM_FIELDS.has(name) && !attr.optional)
		.map(([name]) => name);
}

// ── Asset collection (for --check, offline) ──────────────────────────────────

function collectAssets(
	value: unknown,
	out: { kind: string; src: string }[] = [],
) {
	if (isSeedImage(value)) out.push({ kind: "image", src: value._seedImage });
	else if (isSeedFile(value)) out.push({ kind: "file", src: value._seedFile });
	else if (Array.isArray(value)) for (const v of value) collectAssets(v, out);
	else if (value && typeof value === "object")
		for (const v of Object.values(value)) collectAssets(v, out);
	return out;
}

function checkSeed(doc: SeedDoc): string[] {
	const errors: string[] = [];
	for (const field of requiredFields(doc._type)) {
		if (doc[field] === undefined)
			errors.push(`required field "${field}" is missing`);
	}
	for (const { src } of collectAssets(doc)) {
		if (!existsSync(resolve(src)))
			errors.push(`asset not found on disk: ${src}`);
	}
	return errors;
}

// ── Write path (lazy client + asset upload, only when actually writing) ───────

type SanityClient = import("@sanity/client").SanityClient;

async function makeClient(): Promise<SanityClient> {
	const { createClient } = await import("@sanity/client");
	const token = process.env.SANITY_API_WRITE_TOKEN;
	if (!token) {
		throw new Error(
			"Missing SANITY_API_WRITE_TOKEN (Editor role). Add it to .env.development.",
		);
	}
	return createClient({
		projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
		dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
		apiVersion: API_VERSION,
		token,
		useCdn: false,
	});
}

const manifest: Record<string, string> = existsSync(ASSET_MANIFEST)
	? JSON.parse(readFileSync(ASSET_MANIFEST, "utf8"))
	: {};

async function uploadAsset(
	client: SanityClient,
	kind: "image" | "file",
	src: string,
): Promise<string> {
	const abs = resolve(src);
	const sha1 = createHash("sha1").update(readFileSync(abs)).digest("hex");
	const cacheKey = `${kind}:${sha1}`;
	// Sanity is content-addressed (same bytes → same asset id); the manifest just
	// skips the upload round-trip on re-runs.
	if (manifest[cacheKey]) return manifest[cacheKey];
	const asset = await client.assets.upload(kind, createReadStream(abs), {
		filename: basename(abs),
	});
	manifest[cacheKey] = asset._id;
	console.log(`  ↑ uploaded ${src} → ${asset._id}`);
	return asset._id;
}

/** Walk a seed: upload asset intents, inject `_key` into array object members. */
async function resolveSeed(
	client: SanityClient,
	value: unknown,
): Promise<unknown> {
	if (isSeedImage(value)) {
		const ref = await uploadAsset(client, "image", value._seedImage);
		return {
			_type: "image",
			asset: { _type: "reference", _ref: ref },
			...(value.alt !== undefined ? { alt: value.alt } : {}),
		};
	}
	if (isSeedFile(value)) {
		const ref = await uploadAsset(client, "file", value._seedFile);
		return { _type: "file", asset: { _type: "reference", _ref: ref } };
	}
	if (Array.isArray(value)) {
		const out: unknown[] = [];
		for (let i = 0; i < value.length; i++) {
			const item = await resolveSeed(client, value[i]);
			out.push(
				item && typeof item === "object" && !Array.isArray(item)
					? { ...(item as object), _key: `k${i}` }
					: item,
			);
		}
		return out;
	}
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value))
			out[k] = await resolveSeed(client, v);
		return out;
	}
	return value;
}

// ── Orchestration ────────────────────────────────────────────────────────────

async function main() {
	const selected = (seeds as SeedDoc[]).filter(
		(d) => !ONLY || d._type === ONLY,
	);
	if (selected.length === 0) {
		console.error(
			ONLY ? `No seed for type "${ONLY}".` : "No seeds registered.",
		);
		process.exit(1);
	}

	// Validate every selected seed first — write nothing until all pass.
	let failed = false;
	for (const doc of selected) {
		const errors = checkSeed(doc);
		if (errors.length) {
			failed = true;
			console.error(`✗ ${doc._type} (${doc._id}):`);
			for (const e of errors) console.error(`    - ${e}`);
		} else {
			console.log(`✓ ${doc._type} (${doc._id}) — valid`);
		}
	}
	if (failed) process.exit(1);

	if (CHECK) {
		console.log("\n✓ check passed — no documents written (dry-run).");
		return;
	}

	const client = await makeClient();
	for (const doc of selected) {
		const resolved = (await resolveSeed(client, doc)) as SeedDoc;
		if (RESET) {
			await client.createOrReplace(resolved);
			console.log(`✓ ${doc._type} (${doc._id}) — replaced (--reset)`);
		} else {
			await client.createIfNotExists(resolved);
			console.log(`✓ ${doc._type} (${doc._id}) — created if absent`);
		}
	}
	writeFileSync(ASSET_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
