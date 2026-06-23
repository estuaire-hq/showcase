import { EnvelopeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../fields";

/**
 * Contact page (kit « 07/Webdesign-page-contact ») — a singleton (enforced in
 * structure.ts). Holds the editorial content of /contact: hero title, the form's
 * accompanying visual + intro title, the ordered list of request types WITH their
 * routing email, and the coordinates block (address, email, map location).
 *
 * Request-type routing: each entry pairs a label (shown in the form's Select) with
 * the recipient email a submission of that type is routed to (editable — FR-007 /
 * FR-019). The recipient is resolved SERVER-SIDE from this list (the client only
 * sends the label) — see src/app/api/contact/route.ts. The 4 recipients are M365
 * Exchange shared mailboxes; sending is via OVH Email Pro (see ADR / research §2).
 */
export const contactPage = defineType({
	name: "contactPage",
	title: "Contact",
	type: "document",
	icon: EnvelopeIcon,
	groups: [
		{ name: "hero", title: "Hero", default: true },
		{ name: "form", title: "Formulaire" },
		{ name: "coordinates", title: "Coordonnées & carte" },
		{ name: "seo", title: "SEO" },
	],
	fields: [
		// — Hero —
		defineField({
			name: "heroTitleOutline",
			title: "Titre hero — contour",
			type: "string",
			group: "hero",
			description: "Affiché en contour. Ex. « Nous sommes »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "heroTitleFill",
			title: "Titre hero — plein",
			type: "string",
			group: "hero",
			description: "Affiché plein. Ex. « à votre écoute »",
			validation: (rule) => rule.required(),
		}),

		// — Formulaire —
		imageField("formImage", "Visuel du formulaire", "form"),
		defineField({
			name: "formTitleOutline",
			title: "Titre formulaire — contour",
			type: "string",
			group: "form",
			description: "Ex. « Une question, Un projet ? »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "formTitleFill",
			title: "Titre formulaire — plein",
			type: "string",
			group: "form",
			description: "Ex. « Tout commence ici. »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "requestTypes",
			title: "Types de demande (et routage email)",
			type: "array",
			group: "form",
			description:
				"Chaque entrée = un libellé proposé dans le formulaire + l'email destinataire vers lequel router la demande. Réordonnable.",
			of: [
				defineArrayMember({
					type: "object",
					name: "requestType",
					fields: [
						defineField({
							name: "label",
							title: "Libellé",
							type: "string",
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: "recipient",
							title: "Email destinataire",
							type: "string",
							description: "Boîte (partagée) qui reçoit ce type de demande.",
							validation: (rule) => rule.required().email(),
						}),
					],
					preview: { select: { title: "label", subtitle: "recipient" } },
				}),
			],
			validation: (rule) =>
				rule.min(1).error("Ajoutez au moins un type de demande."),
		}),

		// — Coordonnées & carte —
		defineField({
			name: "findTitleOutline",
			title: "Titre « trouver » — contour",
			type: "string",
			group: "coordinates",
			description: "Ex. « Nous »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "findTitleFill",
			title: "Titre « trouver » — plein",
			type: "string",
			group: "coordinates",
			description: "Ex. « trouver »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "address",
			title: "Adresse postale",
			type: "text",
			rows: 2,
			group: "coordinates",
			description: "Multi-lignes (sans la ligne copyright du pied de page).",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "contactTitleOutline",
			title: "Titre « contacter » — contour",
			type: "string",
			group: "coordinates",
			description: "Ex. « Nous »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "contactTitleFill",
			title: "Titre « contacter » — plein",
			type: "string",
			group: "coordinates",
			description: "Ex. « contacter »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "email",
			title: "Email affiché (mailto)",
			type: "string",
			group: "coordinates",
			description:
				"Affiché et cliquable. Distinct du destinataire des demandes.",
			validation: (rule) => rule.required().email(),
		}),
		defineField({
			name: "mapLocation",
			title: "Emplacement sur la carte",
			type: "geopoint",
			group: "coordinates",
			description: "Position du marqueur (latitude / longitude).",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "mapZoom",
			title: "Niveau de zoom de la carte",
			type: "number",
			group: "coordinates",
			initialValue: 15,
			validation: (rule) => rule.min(8).max(18),
		}),

		// — SEO —
		defineField({
			name: "seoMetaTitle",
			title: "Titre SEO",
			type: "string",
			group: "seo",
		}),
		defineField({
			name: "seoMetaDescription",
			title: "Description SEO",
			type: "text",
			rows: 2,
			group: "seo",
		}),
		imageField("seoOgImage", "Image Open Graph", "seo"),
	],
	preview: {
		prepare: () => ({ title: "Contact" }),
	},
});
