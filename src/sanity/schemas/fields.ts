import { defineField } from "sanity";

/**
 * Image field shared by every content image: hotspot crop + required-ish alt.
 * Extracted so every document schema reuses ONE definition (constitution Principle
 * IV — reuse before duplicate; the about page model explicitly mirrors the home).
 *
 * `group` is omitted for images nested inside an object type (e.g. heroSlide /
 * processStep), which has no field groups of its own — a `group` may only reference
 * a group defined on the same type, so passing one there crashes the Studio editor.
 */
export const imageField = (name: string, title: string, group?: string) =>
	defineField({
		name,
		title,
		type: "image",
		...(group ? { group } : {}),
		options: { hotspot: true },
		fields: [
			defineField({
				name: "alt",
				title: "Texte alternatif",
				type: "string",
				validation: (rule) =>
					rule.required().warning("Important pour l'accessibilité et le SEO"),
			}),
		],
	});
