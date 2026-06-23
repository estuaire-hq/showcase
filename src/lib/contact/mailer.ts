import nodemailer from "nodemailer";
import type { ContactInput } from "./schema";

// Email transport for the contact form. Decision (research §2): send via OVH Email Pro
// SMTP (`pro1.mail.ovh.net`), authenticated by a real mailbox; the per-type recipient
// (an M365 Exchange shared mailbox) is resolved server-side from Sanity. This module is
// transport-agnostic — only the env vars below change if the relay ever changes.
//
// Dev fallback: when SMTP_HOST is empty (e.g. a worktree without secrets), use
// nodemailer's jsonTransport — the message is serialized + logged instead of sent, so the
// whole submit flow is testable without credentials and nothing leaves the machine.

type Attachment = {
	filename: string;
	content: Buffer;
	contentType?: string;
};

let cached: nodemailer.Transporter | null = null;

function isDevFallback() {
	return !process.env.SMTP_HOST;
}

function getTransport(): nodemailer.Transporter {
	if (cached) return cached;
	if (isDevFallback()) {
		cached = nodemailer.createTransport({ jsonTransport: true });
		return cached;
	}
	cached = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT ?? 587),
		secure: process.env.SMTP_SECURE === "true", // true → 465, false → 587 (STARTTLS)
		auth: process.env.SMTP_USER
			? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
			: undefined,
	});
	return cached;
}

const escapeHtml = (s: string) =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

export type ContactEmail = {
	/** Resolved recipient (per request type, from the CMS) — never from the client. */
	to: string;
	/** The visitor's email → Reply-To, so "Reply" goes straight to them. */
	replyTo: string;
	fields: ContactInput;
	attachment?: Attachment | null;
};

/**
 * Send a contact submission. From = SMTP_FROM (an @estuaire.fr mailbox, SPF-aligned);
 * Reply-To = the visitor. Throws on transport failure (the route maps that to 503).
 */
export async function sendContactEmail({
	to,
	replyTo,
	fields,
	attachment,
}: ContactEmail) {
	const transport = getTransport();
	const from = process.env.SMTP_FROM || "Estuaire <noreply@estuaire.fr>";
	const subject = `[Contact estuaire.fr] ${fields.requestType || "Demande"} — ${fields.name}`;

	const rows: Array<[string, string]> = [
		["Nom & prénom", fields.name],
		...(fields.company
			? [["Société", fields.company] as [string, string]]
			: []),
		["Email", fields.email],
		...(fields.requestType
			? [["Type de demande", fields.requestType] as [string, string]]
			: []),
	];

	const text = [
		...rows.map(([k, v]) => `${k} : ${v}`),
		"",
		"Message :",
		fields.message,
	].join("\n");

	const html = `
		<div style="font-family:Arial,sans-serif;font-size:14px;color:#0e1215">
			${rows
				.map(
					([k, v]) =>
						`<p style="margin:0 0 4px"><strong>${escapeHtml(k)} :</strong> ${escapeHtml(v)}</p>`,
				)
				.join("")}
			<p style="margin:16px 0 4px"><strong>Message :</strong></p>
			<p style="margin:0;white-space:pre-line">${escapeHtml(fields.message)}</p>
		</div>`;

	const info = await transport.sendMail({
		from,
		to,
		replyTo,
		subject,
		text,
		html,
		attachments: attachment
			? [
					{
						filename: attachment.filename,
						content: attachment.content,
						contentType: attachment.contentType,
					},
				]
			: undefined,
	});

	// Dev (jsonTransport): surface the serialized message in the server logs so the
	// success path is verifiable without real SMTP credentials.
	if (isDevFallback()) {
		const message = (info as { message?: Buffer | string }).message;
		console.info(
			`[contact] dev jsonTransport — email NOT sent (to=${to}):\n${message?.toString() ?? "(no payload)"}`,
		);
	}

	return info;
}
