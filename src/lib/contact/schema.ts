import { z } from "zod";

// Shared contact-form validation — imported by BOTH the client form (validate on submit,
// FR-002/006) and the server route (re-validate, never trust the client). One schema =
// client/server alignment (DRY). zod is a runtime dependency (see package.json).

/** Email regex — also imported by lib/sanity/contactPage.ts for routing-recipient validation. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contactSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Indiquez vos nom et prénom.")
		.max(120, "Nom trop long (120 caractères max)."),
	// Optional fields accept an empty string (FormData yields "" when left blank).
	company: z.string().trim().max(160, "Nom de société trop long."),
	email: z
		.string()
		.trim()
		.min(1, "L'adresse email est obligatoire.")
		.max(200, "Email trop long.")
		.refine((v) => EMAIL_RE.test(v), "Adresse email invalide."),
	requestType: z.string().trim().max(120),
	message: z
		.string()
		.trim()
		.min(10, "Votre message doit faire au moins 10 caractères.")
		.max(5000, "Message trop long (5000 caractères max)."),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Reduce a ZodError to a `{ field: firstMessage }` map (works on zod 3 & 4). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
	const out: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = String(issue.path[0] ?? "");
		if (key && !(key in out)) out[key] = issue.message;
	}
	return out;
}

// — Attachment constraints (validated client AND server — FR-008) —

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 Mo

export const ALLOWED_ATTACHMENT_EXTENSIONS = [
	"pdf",
	"png",
	"jpg",
	"jpeg",
	"webp",
	"doc",
	"docx",
	"xls",
	"xlsx",
	"ppt",
	"pptx",
] as const;

const ALLOWED_ATTACHMENT_MIME = new Set([
	"application/pdf",
	"image/png",
	"image/jpeg",
	"image/webp",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

/** `accept` attribute for the file input (extensions, comma-separated). */
export const ATTACHMENT_ACCEPT = ALLOWED_ATTACHMENT_EXTENSIONS.map(
	(e) => `.${e}`,
).join(",");

/**
 * Validate an optional attachment (size + extension + MIME). Returns a French error
 * message, or `null` when valid / absent. Same logic runs client- and server-side.
 */
export function validateAttachment(
	file: File | null | undefined,
): string | null {
	if (!file || file.size === 0) return null; // attachment is optional
	if (file.size > MAX_ATTACHMENT_BYTES)
		return "Le fichier dépasse la taille maximale de 10 Mo.";
	const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
	const extOk = (ALLOWED_ATTACHMENT_EXTENSIONS as readonly string[]).includes(
		ext,
	);
	// MIME is best-effort (browsers/servers vary); the extension is authoritative.
	const mimeOk = !file.type || ALLOWED_ATTACHMENT_MIME.has(file.type);
	if (!extOk || !mimeOk)
		return "Format de fichier non autorisé (PDF, image ou document bureautique).";
	return null;
}
