import { defineLive } from "next-sanity/live";
import { client } from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

const { sanityFetch: baseSanityFetch, SanityLive } = defineLive({
	client,
	serverToken: token,
});

// Every fetch carries a stable "sanity" cache tag ON TOP OF the per-result
// `sanity:<syncTag>` tags that `defineLive` adds automatically. The publish webhook
// (`/api/revalidate`) can then invalidate every Sanity-backed page at once with a single
// `revalidateTag("sanity", …)` — the simplest reliable model for a small showcase site.
//
// Without this, the webhook targets a tag that NO cache entry carries (`revalidateTag`
// matches exactly, and the auto tags are `sanity:<hash>`, never the literal `"sanity"`),
// so it returns 200 while revalidating nothing → published content only appears on a
// redeploy. Root cause of the cache-staleness bug (ADR 0026 / post-mortem 0019).
//
// The wrapper preserves the generic call signature (`as typeof baseSanityFetch`) so
// TypeGen result inference at call sites is unchanged.
export const sanityFetch = ((options: Parameters<typeof baseSanityFetch>[0]) =>
	baseSanityFetch({
		...options,
		tags: [...(options.tags ?? []), "sanity"],
	})) as typeof baseSanityFetch;

export { SanityLive };
