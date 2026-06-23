import type { NextRequest } from "next/server";
import { sendContactEmail } from "@/lib/contact/mailer";
import {
	contactSchema,
	fieldErrors,
	validateAttachment,
} from "@/lib/contact/schema";
import { getContactRequestTypes } from "@/lib/sanity/contactPage";

// Contact form endpoint (contracts/contact-api.md). Node runtime (Buffer + Nodemailer);
// exempt from the coming-soon gate (proxy matcher excludes `api/*`). The recipient is
// resolved SERVER-SIDE from the CMS by the chosen request-type label — the client never
// sends the recipient address (anti-tamper).

export const runtime = "nodejs";

/** Minimum time a human takes to fill the form — faster ⇒ treated as a bot. */
const MIN_FILL_MS = 2500;

const str = (v: FormDataEntryValue | null): string =>
	typeof v === "string" ? v : "";

export async function POST(request: NextRequest) {
	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
	}

	// — Anti-spam (silent): honeypot filled, or submitted implausibly fast. Return a
	//   feigned 200 so a bot learns nothing (SC-007). —
	const honeypot = str(form.get("website")).trim();
	const ts = Number(str(form.get("_ts")));
	const tooFast =
		Number.isFinite(ts) && ts > 0 && Date.now() - ts < MIN_FILL_MS;
	if (honeypot || tooFast) {
		return Response.json({ ok: true }, { status: 200 });
	}

	// — Field validation (zod, shared with the client) —
	const parsed = contactSchema.safeParse({
		name: str(form.get("name")),
		company: str(form.get("company")),
		email: str(form.get("email")),
		requestType: str(form.get("requestType")),
		message: str(form.get("message")),
	});
	if (!parsed.success) {
		return Response.json(
			{ ok: false, errors: fieldErrors(parsed.error) },
			{ status: 400 },
		);
	}
	const fields = parsed.data;

	// — Attachment (optional): size + format —
	const file = form.get("attachment");
	const attachmentFile = file instanceof File ? file : null;
	const fileError = validateAttachment(attachmentFile);
	if (fileError) {
		return Response.json(
			{ ok: false, errors: { attachment: fileError } },
			{ status: 422 },
		);
	}

	// — Resolve the recipient from the CMS routing (label → recipient); never the client.
	//   Fallback: CONTACT_TO env, else the last routing entry (the « autre demande » box). —
	let to: string | undefined;
	try {
		const routing = await getContactRequestTypes();
		to =
			routing.find((r) => r.label === fields.requestType)?.recipient ??
			process.env.CONTACT_TO ??
			routing.at(-1)?.recipient;
	} catch {
		to = process.env.CONTACT_TO;
	}
	if (!to) {
		console.error(
			"[contact] no recipient could be resolved (CMS + CONTACT_TO empty)",
		);
		return Response.json(
			{ ok: false, error: "mail_unavailable" },
			{ status: 503 },
		);
	}

	// — Build the attachment buffer (if any) and send —
	try {
		const attachment =
			attachmentFile && attachmentFile.size > 0
				? {
						filename: attachmentFile.name,
						content: Buffer.from(await attachmentFile.arrayBuffer()),
						contentType: attachmentFile.type || undefined,
					}
				: null;

		await sendContactEmail({
			to,
			replyTo: fields.email,
			fields,
			attachment,
		});
	} catch (err) {
		// Log the failure cause WITHOUT the submission content (no PII).
		console.error(
			"[contact] send failed:",
			err instanceof Error ? err.message : "unknown error",
		);
		return Response.json(
			{ ok: false, error: "mail_unavailable" },
			{ status: 503 },
		);
	}

	return Response.json({ ok: true }, { status: 200 });
}
