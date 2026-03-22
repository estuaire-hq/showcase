import type { QueryParams } from "next-sanity";
import { client } from "./client";

/**
 * Wrapper around client.fetch with ISR cache tags.
 * The generic T is a trust-based assertion — the caller is responsible
 * for matching T to the GROQ query's actual return shape.
 * Consider sanity-typegen for compile-time query safety.
 */
export async function sanityFetch<T>({
	query,
	params = {},
	tags = [],
}: {
	query: string;
	params?: QueryParams;
	tags?: string[];
}): Promise<T> {
	return client.fetch<T>(query, params, {
		next: {
			// When tags are provided, rely on on-demand revalidation (webhook);
			// otherwise fall back to time-based revalidation every 60s
			revalidate: tags.length > 0 ? false : 60,
			tags,
		},
	});
}
