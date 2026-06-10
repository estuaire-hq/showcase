/**
 * Seed authoring surface — the typed bridge between a generated document type
 * (from `@/sanity.types`, itself derived from the schema) and a writeable seed.
 *
 * The schema is the single source of truth (constitution Principle IX): a seed is
 * type-checked against the generated document type, so a renamed/removed field is
 * a compile error here. Required-field coverage (which the generated types leave
 * optional) is enforced at runtime by the seed runner's `--check`. See ADR 0006.
 */

/** Server-managed system fields — present on read, never authored in a seed. */
type ServerManaged = "_createdAt" | "_updatedAt" | "_rev";

/**
 * An image to seed. The runner uploads `src` (a path on disk, e.g. a Figma fill
 * under `public/figma/`) and injects the resolved asset reference + an `_key`.
 */
export type SeedImage = { _seedImage: string; alt?: string };

/** A file to seed (e.g. a PDF). The runner uploads it and injects the reference. */
export type SeedFile = { _seedFile: string };

/**
 * Transforms a generated document type into its writeable "seed" shape:
 * - image / file objects become upload intents (`SeedImage` / `SeedFile`);
 * - array members drop `_key` (the runner generates a stable one);
 * - top-level server-managed fields are dropped (`Seed`, below).
 *
 * `_id` and `_type` are preserved (and stay required) — a seed must declare them.
 */
type SeedValue<T> = T extends { _type: "image" }
	? SeedImage
	: T extends { _type: "file" }
		? SeedFile
		: T extends Array<infer U>
			? Array<Omit<SeedValue<U>, "_key">>
			: T extends object
				? { [K in keyof T]: SeedValue<T[K]> }
				: T;

/** The writeable shape of a generated document type `T`. */
export type Seed<T> = Omit<SeedValue<T>, ServerManaged>;

/**
 * Type-checks a seed against its generated document type and returns it unchanged.
 * Usage: `export default defineSeed<Footer>({ _id: "footer", _type: "footer", … })`.
 */
export const defineSeed = <T>(doc: Seed<T>): Seed<T> => doc;

/** Declare an image to upload (resolved + referenced by the runner). */
export const image = (src: string, alt?: string): SeedImage =>
	alt === undefined ? { _seedImage: src } : { _seedImage: src, alt };

/** Declare a file (PDF, …) to upload (resolved + referenced by the runner). */
export const file = (src: string): SeedFile => ({ _seedFile: src });

/** Narrowing guards used by the runner when walking a seed object. */
export const isSeedImage = (v: unknown): v is SeedImage =>
	typeof v === "object" && v !== null && "_seedImage" in v;

export const isSeedFile = (v: unknown): v is SeedFile =>
	typeof v === "object" && v !== null && "_seedFile" in v;
