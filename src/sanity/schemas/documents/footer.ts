import { InlineIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Site footer (kit BIG FOOTER) — a singleton (enforced in structure.ts).
 * Holds the editorial content of the global footer. The CTA banner image is a
 * SLIDESHOW: editors configure the list of images here; the slideshow mechanics
 * (autoplay, transitions) live in the component, not in Sanity.
 */
export const footer = defineType({
	name: "footer",
	title: "Pied de page",
	type: "document",
	icon: InlineIcon,
	groups: [
		{ name: "cta", title: "Bandeau CTA", default: true },
		{ name: "identity", title: "Identité" },
		{ name: "contact", title: "Coordonnées" },
		{ name: "menus", title: "Menus" },
	],
	fields: [
		// — Bandeau CTA —
		defineField({
			name: "ctaTitleOutline",
			title: "Titre — 1re ligne (contour)",
			type: "string",
			group: "cta",
			description: "Affichée en contour. Ex. « Une question, »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "ctaTitleFill",
			title: "Titre — 2e ligne (plein)",
			type: "string",
			group: "cta",
			description: "Affichée pleine. Ex. « un projet ? »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "ctaButtonLabel",
			title: "Libellé du bouton",
			type: "string",
			group: "cta",
			initialValue: "tout commence ici",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "ctaButtonHref",
			title: "Lien du bouton",
			type: "string",
			group: "cta",
			description: "Chemin interne (/contact) ou URL.",
		}),
		defineField({
			name: "ctaImages",
			title: "Diaporama — images",
			type: "array",
			group: "cta",
			description:
				"Plusieurs images défilant dans le bandeau CTA. (La mécanique du diaporama est gérée par le code, pas ici.)",
			of: [
				defineArrayMember({
					type: "image",
					options: { hotspot: true },
					fields: [
						defineField({
							name: "alt",
							type: "string",
							title: "Texte alternatif",
							validation: (rule) =>
								rule
									.required()
									.warning("Important pour l'accessibilité et le SEO"),
						}),
					],
				}),
			],
			validation: (rule) => rule.min(1).error("Ajoutez au moins une image."),
		}),

		// — Identité —
		defineField({
			name: "tagline",
			title: "Signature",
			type: "string",
			group: "identity",
			initialValue: "agenceur-concepteur engagé.",
			description: "Affichée sous le logo « Estuaire ».",
		}),

		// — Coordonnées —
		defineField({
			name: "address",
			title: "Adresse",
			type: "text",
			rows: 3,
			group: "contact",
			description: "Multi-lignes (copyright + adresse).",
		}),
		defineField({
			name: "contactHref",
			title: "Lien « contact »",
			type: "string",
			group: "contact",
			initialValue: "/contact",
		}),
		defineField({
			name: "linkedInUrl",
			title: "URL LinkedIn",
			type: "url",
			group: "contact",
		}),
		defineField({
			name: "plaquetteLabel",
			title: "Libellé du bouton plaquette",
			type: "string",
			group: "contact",
			initialValue:
				"pour prolonger votre visite, téléchargez notre plaquette ici",
		}),
		defineField({
			name: "plaquetteFile",
			title: "Plaquette (PDF)",
			type: "file",
			group: "contact",
			options: { accept: ".pdf" },
		}),

		// — Menus —
		defineField({
			name: "navLinks",
			title: "Menu principal",
			type: "array",
			group: "menus",
			of: [
				defineArrayMember({
					type: "object",
					name: "link",
					fields: [
						defineField({ name: "label", title: "Libellé", type: "string" }),
						defineField({ name: "href", title: "Lien", type: "string" }),
					],
					preview: {
						select: { title: "label", subtitle: "href" },
					},
				}),
			],
		}),
		defineField({
			name: "legalLinks",
			title: "Liens légaux",
			type: "array",
			group: "menus",
			of: [
				defineArrayMember({
					type: "object",
					name: "link",
					fields: [
						defineField({ name: "label", title: "Libellé", type: "string" }),
						defineField({ name: "href", title: "Lien", type: "string" }),
					],
					preview: {
						select: { title: "label", subtitle: "href" },
					},
				}),
			],
		}),
	],
	preview: {
		select: { images: "ctaImages" },
		prepare({ images }) {
			const count = Array.isArray(images) ? images.length : 0;
			return {
				title: "Pied de page",
				subtitle: `${count} image${count > 1 ? "s" : ""} dans le diaporama`,
				media: Array.isArray(images) ? images[0] : undefined,
			};
		},
	},
});
