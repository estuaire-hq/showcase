import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(request: NextRequest) {
	try {
		const { isValidSignature, body } = await parseBody<{
			_type?: string;
			_id?: string;
		}>(request, process.env.REVALIDATION_SECRET);

		if (!isValidSignature) {
			return NextResponse.json(
				{ message: "Invalid signature" },
				{ status: 401 },
			);
		}

		if (!body) {
			return NextResponse.json(
				{ message: "Missing request body" },
				{ status: 400 },
			);
		}

		if (body._type) {
			revalidateTag(body._type);
		}

		return NextResponse.json({
			revalidated: true,
			now: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[revalidate]", error);
		return NextResponse.json(
			{ message: "Error revalidating" },
			{ status: 500 },
		);
	}
}
