import { InfoOutlineIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../fields";

/**
 * About page (Webdesign-page-nous-découvrir-ESTUAIRE-V1, nodes 51:2699 desktop /
 * 78:4374 tablet / 78:4626 mobile) — a singleton (enforced in structure.ts). Holds
 * the editorial content of `/nous-decouvrir`, organised in section groups (tabs):
 * Hero · Intro · Vision · Atelier · Mode opératoire · Grand visuel · CTA · SEO.
 *
 * Section titles follow the brand outline/fill device (same precedent as the home
 * sections + footer CTA): the first part renders as a contour (OutlineText) and the
 * second as a solid fill — both run through BrandText for the casse rule. The hero
 * title uses the same device (read on the maquette `02/ SLIDER`: two stroked lines
 * « Nous sommes / agenceurs et concepteurs. » + a solid line « Nous sommes
 * engagés. », under an eyebrow + separator rule). This refines the data-model's
 * single `heroTitle` to match the full node (Principle VII) and the kit device
 * (Principle X) — the H1 is the outline + fill lines combined.
 *
 * Unlike the home, ALL content here is CMS-driven (no static exception, Principle II).
 */

export const aboutPage = defineType({
	name: "aboutPage",
	title: "Nous découvrir",
	type: "document",
	icon: InfoOutlineIcon,
	groups: [
		{ name: "hero", title: "Hero", default: true },
		{ name: "intro", title: "Intro" },
		{ name: "vision", title: "Vision" },
		{ name: "atelier", title: "Atelier" },
		{ name: "process", title: "Mode opératoire" },
		{ name: "statement", title: "Grand visuel" },
		{ name: "cta", title: "CTA" },
		{ name: "seo", title: "SEO" },
	],
	fields: [
		// — Hero (02/ SLIDER) —
		defineField({
			name: "heroEyebrow",
			title: "Sur-titre (eyebrow)",
			type: "string",
			group: "hero",
			description:
				"Petit label au-dessus du titre, séparé par un trait. Ex. « Menuiserie et agencement sur-mesure ».",
		}),
		defineField({
			name: "heroTitleOutline",
			title: "Titre — contour",
			type: "text",
			rows: 2,
			group: "hero",
			description:
				"Lignes du H1 affichées en contour. Ex. « Nous sommes\nagenceurs et concepteurs. »",
		}),
		defineField({
			name: "heroTitleFill",
			title: "Titre — plein",
			type: "string",
			group: "hero",
			description: "Dernière ligne du H1, pleine. Ex. « Nous sommes engagés. »",
			validation: (rule) => rule.required(),
		}),
		imageField("heroImage", "Visuel plein cadre", "hero"),

		// — Intro (03/ INTRO) —
		defineField({
			name: "introStatement",
			title: "Phrase de positionnement",
			type: "text",
			rows: 3,
			group: "intro",
			description:
				"Ex. « La réussite d'un agencement tient à la justesse de sa conception. »",
		}),
		defineField({
			name: "introText",
			title: "Texte d'introduction",
			type: "text",
			rows: 8,
			group: "intro",
		}),
		imageField("introImagePrimary", "Visuel principal", "intro"),
		imageField("introImageSecondary", "Visuel secondaire", "intro"),
		defineField({
			name: "introHighlight",
			title: "Phrase phare",
			type: "text",
			rows: 2,
			group: "intro",
			description:
				"Énoncé mis en avant (rendu Pullquote). Ex. « Nous faisons dialoguer créativité, faisabilité technique et maîtrise industrielle. »",
		}),

		// — Vision (04/ VISION) —
		defineField({
			name: "visionTitleOutline",
			title: "Titre — contour",
			type: "string",
			group: "vision",
			description: "Ex. « Notre » (rendu en contour).",
		}),
		defineField({
			name: "visionTitleFill",
			title: "Titre — plein",
			type: "string",
			group: "vision",
			description: "Ex. « vision » (rendu plein).",
		}),
		defineField({
			name: "visionText",
			title: "Texte",
			type: "text",
			rows: 12,
			group: "vision",
		}),
		defineField({
			name: "visionImages",
			title: "Visuels",
			type: "array",
			group: "vision",
			description: "Visuels de la section, placés par ordre (slots par index).",
			of: [defineArrayMember(imageField("image", "Visuel"))],
		}),

		// — Atelier (05/ ATELIER) —
		defineField({
			name: "atelierTitleOutline",
			title: "Titre — contour",
			type: "string",
			group: "atelier",
			description: "Ex. « De notre atelier » (rendu en contour).",
		}),
		defineField({
			name: "atelierTitleFill",
			title: "Titre — plein",
			type: "string",
			group: "atelier",
			description: "Ex. « à votre chantier » (rendu plein).",
		}),
		defineField({
			name: "atelierText",
			title: "Texte",
			type: "text",
			rows: 6,
			group: "atelier",
		}),
		defineField({
			name: "atelierPillarsLead",
			title: "Intro des piliers",
			type: "string",
			group: "atelier",
			description: "Ex. « Un atelier de 3000 m2 pour garantir : ».",
		}),
		defineField({
			name: "atelierPillars",
			title: "Piliers (pills)",
			type: "array",
			group: "atelier",
			description:
				"Les promesses de l'atelier, en pills. Le dernier est mis en avant (rempli).",
			of: [defineArrayMember({ type: "string" })],
		}),
		defineField({
			name: "atelierCapabilities",
			title: "Capacités (liste)",
			type: "array",
			group: "atelier",
			description: "Points de capacité, rendus en liste séparée de filets.",
			of: [defineArrayMember({ type: "string" })],
		}),
		defineField({
			name: "atelierImages",
			title: "Visuels",
			type: "array",
			group: "atelier",
			description: "Visuels de la section, placés par ordre (slots par index).",
			of: [defineArrayMember(imageField("image", "Visuel"))],
		}),
		defineField({
			name: "atelierHighlight",
			title: "Phrase phare",
			type: "text",
			rows: 3,
			group: "atelier",
			description:
				"Énoncé mis en avant (rendu Pullquote). Ex. « Installation et déploiements partout en France et en Europe… ».",
		}),

		// — Mode opératoire (06/ MODE OPÉRATOIRE) —
		defineField({
			name: "processTitleOutline",
			title: "Titre — contour",
			type: "string",
			group: "process",
			description: "Ex. « Notre mode » (rendu en contour).",
		}),
		defineField({
			name: "processTitleFill",
			title: "Titre — plein",
			type: "string",
			group: "process",
			description: "Ex. « opératoire » (rendu plein).",
		}),
		defineField({
			name: "processIntro",
			title: "Intro",
			type: "text",
			rows: 5,
			group: "process",
		}),
		imageField("processIntroImage", "Visuel de l'intro", "process"),
		defineField({
			name: "processSteps",
			title: "Étapes",
			type: "array",
			group: "process",
			description:
				"Étapes du mode opératoire, dans l'ordre d'affichage (la numérotation suit le champ « Numéro », pas l'index — réordonnez sans casser les libellés).",
			of: [
				defineArrayMember({
					type: "object",
					name: "processStep",
					title: "Étape",
					fields: [
						defineField({
							name: "number",
							title: "Numéro",
							type: "string",
							description: "Numéro d'ordre affiché. Ex. « 01 », « 02 ».",
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: "title",
							title: "Titre",
							type: "string",
							description: "Ex. « Analyse », « Co-conception ».",
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: "text",
							title: "Texte",
							type: "text",
							rows: 5,
						}),
						defineField({
							name: "bullets",
							title: "Puces",
							type: "array",
							description: "Liste de points (optionnelle).",
							of: [defineArrayMember({ type: "string" })],
						}),
						defineField({
							name: "images",
							title: "Visuels",
							type: "array",
							description:
								"Visuels de l'étape, placés par ordre (slots par index).",
							of: [defineArrayMember(imageField("image", "Visuel"))],
						}),
					],
					preview: {
						select: {
							title: "title",
							subtitle: "number",
							media: "images.0",
						},
						prepare: ({ title, subtitle, media }) => ({
							title: title || "Étape",
							subtitle: subtitle ? `${subtitle}/` : undefined,
							media,
						}),
					},
				}),
			],
		}),

		// — Grand visuel (07/ BIG IMAGE) —
		imageField("statementImage", "Grand visuel", "statement"),
		defineField({
			name: "statementText",
			title: "Phrase en incrustation",
			type: "text",
			rows: 3,
			group: "statement",
			description:
				"Ex. « Nous ne sommes pas contraints par notre outil de production… ».",
		}),

		// — CTA (08/ CTA expertises) —
		defineField({
			name: "ctaLabel",
			title: "Libellé du CTA",
			type: "string",
			group: "cta",
			initialValue: "découvrir nos expertises",
		}),
		defineField({
			name: "ctaHref",
			title: "Lien du CTA",
			type: "string",
			group: "cta",
			initialValue: "/expertises",
		}),

		// — SEO —
		defineField({
			name: "seoMetaTitle",
			title: "Titre de page (SEO)",
			type: "string",
			group: "seo",
			description:
				"Titre de l'onglet / résultat de recherche. Mis en forme par le template « %s | Estuaire ». Repli : « Nous découvrir ».",
		}),
		defineField({
			name: "seoMetaDescription",
			title: "Meta-description (SEO)",
			type: "text",
			rows: 3,
			group: "seo",
		}),
		imageField("seoOgImage", "Image de partage (Open Graph)", "seo"),
	],
	preview: {
		select: { title: "heroTitleFill", media: "heroImage" },
		prepare: ({ title, media }) => ({
			title: "Nous découvrir",
			subtitle: title,
			media,
		}),
	},
});
