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

		// defineLive attaches a parent "sanity" tag to every sanityFetch call.
		// Revalidating it invalidates all Sanity-backed caches at once — simplest
		// and safest approach for a small site.
		//
		// Next 16 requires the two-argument form. The "max" profile gives
		// stale-while-revalidate semantics (published content may be served stale
		// for a brief moment while it refreshes) — the right fit for a webhook on a
		// showcase site (vs "updateTag", which is for read-your-writes Server Actions).
		revalidateTag("sanity", "max");

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
