import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export default defineCliConfig({
	api: { projectId, dataset },
	// TypeGen: the schema is the single source of truth; content types are
	// generated from it (never hand-written). Driven manually via `npm run
	// typegen` (we run next dev/build, not sanity dev/build). See ADR 0006.
	typegen: {
		// Where queries (defineQuery / groq) live, to type their results.
		path: "./src/**/*.{ts,tsx}",
		// Intermediate schema representation produced by `sanity schema extract`.
		schema: "schema.json",
		// Generated output (committed; consumed by the front and the seed tool).
		// In src/ so the `@/sanity.types` alias (@/* → ./src/*) resolves.
		generates: "./src/sanity.types.ts",
		// Auto-type client.fetch()/sanityFetch() from defineQuery results.
		overloadClientMethods: true,
	},
});
