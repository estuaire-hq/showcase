import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(request: NextRequest) {
	try {
		const { isValidSignature, body } = await parseBody<{
			_type?: string;
			_id?: string;
		}>(request, process.env.REVALIDATION_SECRET, true);

		if (!isValidSignature) {
			return Response.json({ message: "Invalid signature" }, { status: 401 });
		}

		if (!body) {
			return Response.json(
				{ message: "Missing request body" },
				{ status: 400 },
			);
		}

		// Every `sanityFetch` tags its cache entries with a stable "sanity" tag (see
		// `@/lib/sanity/live`), on top of the per-result `sanity:<syncTag>` tags that
		// `defineLive` adds automatically. Revalidating that one tag invalidates every
		// Sanity-backed page at once — the simplest reliable model for a small showcase
		// site: any publish → all pages refetch ONCE on their next request, then re-cache
		// (no per-load fetching; Sanity request volume tracks editorial frequency, not
		// traffic). Next 16 requires the two-argument form; `{ expire: 0 }` = immediate
		// expiry, so the next request serves fresh content (vs a `cacheLife` profile like
		// "max", which would serve stale content once more before refreshing).
		revalidateTag("sanity", { expire: 0 });

		return Response.json({
			revalidated: true,
			type: body._type,
			id: body._id,
			now: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[revalidate]", error);
		return Response.json({ message: "Error revalidating" }, { status: 500 });
	}
}
