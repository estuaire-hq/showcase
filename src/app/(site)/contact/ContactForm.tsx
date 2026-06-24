"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
	Button,
	Field,
	FileInput,
	Select,
	TextArea,
	TextField,
} from "@/design-system";
import {
	ATTACHMENT_ACCEPT,
	contactSchema,
	fieldErrors,
	validateAttachment,
} from "@/lib/contact/schema";
import { cn, trackEvent, umamiAttrs } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";
type Errors = Record<string, string>;

/**
 * Contact form (client island). Uncontrolled fields (the DOM keeps the user's input on
 * error — FR-011), validated on submit with the SHARED zod schema (FR-002/006), posted
 * as multipart to `/api/contact`. Anti-spam: a hidden honeypot + a render-time stamp
 * (`_ts`) the route time-traps. Fires `contact_form_submit` (success/error) — Principle VI.
 * Only request-type LABELS are sent; the recipient is resolved server-side from the CMS.
 */
export function ContactForm({
	requestTypeOptions,
	directEmail,
}: {
	requestTypeOptions: string[];
	directEmail: string;
}) {
	const [status, setStatus] = useState<Status>("idle");
	const [errors, setErrors] = useState<Errors>({});
	const [ts, setTs] = useState(0);
	const [formKey, setFormKey] = useState(0);

	// Render-time stamp (client only → no SSR hydration mismatch on a hidden field).
	useEffect(() => setTs(Date.now()), []);

	const errId = (id: string) => `${id}-error`;

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formEl = e.currentTarget;
		const fd = new FormData(formEl);

		// Client-side validation (mirror of the server) — saisie conservée si invalide.
		const parsed = contactSchema.safeParse({
			name: String(fd.get("name") ?? ""),
			company: String(fd.get("company") ?? ""),
			email: String(fd.get("email") ?? ""),
			requestType: String(fd.get("requestType") ?? ""),
			message: String(fd.get("message") ?? ""),
		});
		const fileEntry = fd.get("attachment");
		const fileError = validateAttachment(
			fileEntry instanceof File ? fileEntry : null,
		);
		if (!parsed.success || fileError) {
			const next: Errors = parsed.success ? {} : fieldErrors(parsed.error);
			if (fileError) next.attachment = fileError;
			setErrors(next);
			return;
		}

		setErrors({});
		setStatus("submitting");
		try {
			const res = await fetch("/api/contact", { method: "POST", body: fd });
			const data = (await res.json().catch(() => ({}))) as {
				ok?: boolean;
				errors?: Errors;
			};
			if (res.ok && data.ok) {
				formEl.reset();
				setStatus("success");
				trackEvent("contact_form_submit", { status: "success" });
			} else if (res.status === 400 || res.status === 422) {
				setErrors(data.errors ?? {});
				setStatus("idle");
				trackEvent("contact_form_submit", { status: "error" });
			} else {
				setStatus("error");
				trackEvent("contact_form_submit", { status: "error" });
			}
		} catch {
			setStatus("error");
			trackEvent("contact_form_submit", { status: "error" });
		}
	}

	if (status === "success") {
		return (
			<div className="flex flex-col items-start gap-5" aria-live="polite">
				<p className="font-display text-subtitle-sm text-ink lg:text-subtitle">
					Merci, votre message a bien été transmis.
				</p>
				<p className="text-body-sm text-ink lg:text-body">
					Nous revenons vers vous au plus vite.
				</p>
				<Button
					tone="send"
					arrow={false}
					onClick={() => {
						setStatus("idle");
						setTs(Date.now());
						setFormKey((k) => k + 1);
					}}
				>
					Envoyer un autre message
				</Button>
			</div>
		);
	}

	return (
		<form
			key={formKey}
			onSubmit={onSubmit}
			noValidate
			className="flex flex-col gap-7"
		>
			{/* Honeypot — off-screen, hidden from AT + tab order. A filled value ⇒ bot. */}
			<div aria-hidden className="absolute h-0 w-0 overflow-hidden">
				<label htmlFor="contact-website">Ne pas remplir</label>
				<input
					id="contact-website"
					type="text"
					name="website"
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>
			<input type="hidden" name="_ts" value={ts} readOnly />

			<Field
				label="Nom & prénom"
				htmlFor="contact-name"
				required
				error={errors.name}
			>
				<TextField
					id="contact-name"
					name="name"
					placeholder="Nom & prénom*"
					autoComplete="name"
					invalid={!!errors.name}
					aria-describedby={errors.name ? errId("contact-name") : undefined}
				/>
			</Field>

			<Field label="Société" htmlFor="contact-company" error={errors.company}>
				<TextField
					id="contact-company"
					name="company"
					placeholder="Société"
					autoComplete="organization"
					invalid={!!errors.company}
					aria-describedby={
						errors.company ? errId("contact-company") : undefined
					}
				/>
			</Field>

			<Field
				label="Email"
				htmlFor="contact-email"
				required
				error={errors.email}
			>
				<TextField
					id="contact-email"
					name="email"
					type="email"
					placeholder="Email"
					autoComplete="email"
					invalid={!!errors.email}
					aria-describedby={errors.email ? errId("contact-email") : undefined}
				/>
			</Field>

			<Field
				label="Type de demande"
				htmlFor="contact-requestType"
				error={errors.requestType}
			>
				<Select
					id="contact-requestType"
					name="requestType"
					options={requestTypeOptions}
					placeholder="Type de demande"
					invalid={!!errors.requestType}
					describedBy={
						errors.requestType ? errId("contact-requestType") : undefined
					}
				/>
			</Field>

			<Field
				label="Message"
				htmlFor="contact-message"
				required
				error={errors.message}
			>
				<TextArea
					id="contact-message"
					name="message"
					rows={5}
					placeholder="Message"
					className="min-h-[180px] lg:min-h-[254px]"
					invalid={!!errors.message}
					aria-describedby={
						errors.message ? errId("contact-message") : undefined
					}
				/>
			</Field>

			{/* Attachment (optional): label left, file picker right (maquette). */}
			<div className="flex flex-col gap-1.5">
				<div className="flex flex-wrap items-center gap-4">
					<span className="shrink-0 font-sans text-body text-ink">
						Pièce jointe :
					</span>
					<FileInput
						name="attachment"
						accept={ATTACHMENT_ACCEPT}
						className="w-full max-w-[332px]"
					/>
				</div>
				{errors.attachment && (
					<p role="alert" className="font-sans text-caption text-danger">
						{errors.attachment}
					</p>
				)}
			</div>

			{status === "error" && (
				<p role="alert" className="font-sans text-body-sm text-danger">
					Une erreur est survenue lors de l'envoi. Réessayez, ou écrivez-nous
					directement à{" "}
					<a
						className="underline"
						href={`mailto:${directEmail}`}
						{...umamiAttrs("contact_email_click")}
					>
						{directEmail}
					</a>
					.
				</p>
			)}

			<Button
				tone="send"
				type="submit"
				block
				disabled={status === "submitting"}
				className={cn(status === "submitting" && "cursor-wait")}
			>
				{status === "submitting" ? "Envoi…" : "envoyer"}
			</Button>
		</form>
	);
}
