import { ThLargeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../fields";

/**
 * Expertises page (Webdesign-page-expertises-ESTUAIRE-V1, nodes 51:2893 desktop /
 * 87:5600 tablet / 87:6290 mobile) — a singleton (enforced in structure.ts). Holds the
 * editorial content of `/expertises`, organised in section groups (tabs): Hero · Intro ·
 * Niveaux · Grand visuel · SEO.
 *
 * Section + hero titles follow the brand outline/fill device (same precedent as the home
 * sections + the about page): an outline (OutlineText) part and a solid fill part, both run
 * through BrandText for the casse rule. The hero title device read on `012/ SLIDER`: an
 * outline line « Notre expertise : » + the solid lines « réaliser vos projets de toutes /
 * formes et de toutes tailles. », under an eyebrow + separator rule.
 *
 * The three expertise levels are a CMS-editable ordered list (`levels`), NOT static cards
 * (Principle II): each renders as a full-width FeatureBlock (darkened visual + title + a
 * « en savoir plus » CTA to its sub-page route). The « BIG FOOTER » of the maquette (CTA
 * block + footer) is the global shell footer — NOT modelled here.
 */

export const expertisesPage = defineType({
	name: "expertisesPage",
	title: "Expertises",
	type: "document",
	icon: ThLargeIcon,
	groups: [
		{ name: "hero", title: "Hero", default: true },
		{ name: "intro", title: "Intro" },
		{ name: "levels", title: "Niveaux" },
		{ name: "statement", title: "Grand visuel" },
		{ name: "seo", title: "SEO" },
	],
	fields: [
		// — Hero (012/ SLIDER) —
		defineField({
			name: "heroEyebrow",
			title: "Sur-titre (eyebrow)",
			type: "string",
			group: "hero",
			description:
				"Petit label au-dessus du titre, séparé par un trait. Ex. « Design d'espace, agencement et présentoirs ».",
		}),
		defineField({
			name: "heroTitleOutline",
			title: "Titre — contour",
			type: "text",
			rows: 2,
			group: "hero",
			description:
				"Lignes du H1 affichées en contour. Ex. « Notre expertise : ».",
		}),
		defineField({
			name: "heroTitleFill",
			title: "Titre — plein",
			type: "text",
			rows: 2,
			group: "hero",
			description:
				"Lignes du H1, pleines. Ex. « réaliser vos projets de toutes\nformes et de toutes tailles. ».",
			validation: (rule) => rule.required(),
		}),
		imageField("heroImage", "Visuel plein cadre", "hero"),

		// — Intro (02/ INTRO) —
		defineField({
			name: "introStatement",
			title: "Phrase phare",
			type: "text",
			rows: 3,
			group: "intro",
			description:
				"Énoncé de positionnement mis en avant. Ex. « À la frontière entre artisanat et industrie, entre design et fabrication. »",
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

		// — Niveaux (03/ NOS NIVEAUX D'EXPERTISE) —
		defineField({
			name: "levelsTitleOutline",
			title: "Titre de section — contour",
			type: "string",
			group: "levels",
			description: "Ex. « Nos 3 niveaux » (rendu en contour).",
		}),
		defineField({
			name: "levelsTitleFill",
			title: "Titre de section — plein",
			type: "string",
			group: "levels",
			description: "Ex. « d'expertise » (rendu plein).",
		}),
		imageField("levelsImage", "Visuel de l'entête de section", "levels"),
		defineField({
			name: "levels",
			title: "Niveaux d'expertise",
			type: "array",
			group: "levels",
			description:
				"Les niveaux d'expertise, dans l'ordre d'affichage. Chacun est rendu en carte pleine largeur (visuel assombri + intitulé + « en savoir plus »). La maquette en présente 3 ; la mise en page reste correcte si un niveau est masqué ou réordonné.",
			of: [
				defineArrayMember({
					type: "object",
					name: "expertiseLevel",
					title: "Niveau",
					fields: [
						defineField({
							name: "title",
							title: "Intitulé",
							type: "text",
							rows: 2,
							description:
								"Intitulé de la carte. Ex. « Notre vision\ndu métier d'agenceur ».",
							validation: (rule) => rule.required(),
						}),
						imageField("image", "Visuel"),
						defineField({
							name: "ctaLabel",
							title: "Libellé du CTA",
							type: "string",
							initialValue: "en savoir plus",
						}),
						defineField({
							name: "ctaHref",
							title: "Lien du CTA",
							type: "string",
							description:
								"Destination (sous-page d'expertise). Ex. « /expertises/agencement-sur-mesure ».",
						}),
					],
					preview: {
						select: { title: "title", media: "image" },
						prepare: ({ title, media }) => ({
							title: (title || "Niveau").replace(/\n/g, " "),
							media,
						}),
					},
				}),
			],
		}),

		// — Grand visuel (05/ BIG IMAGE) —
		imageField("statementImage", "Grand visuel", "statement"),
		defineField({
			name: "statementText",
			title: "Phrase en incrustation",
			type: "text",
			rows: 3,
			group: "statement",
			description:
				"Ex. « Nous concevons chaque projet avec la précision du sur-mesure et la puissance de l'industrie. ».",
		}),

		// — SEO —
		defineField({
			name: "seoMetaTitle",
			title: "Titre de page (SEO)",
			type: "string",
			group: "seo",
			description:
				"Titre de l'onglet / résultat de recherche. Mis en forme par le template « %s | Estuaire ». Repli : « Expertises ».",
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
			title: "Expertises",
			subtitle: title ? String(title).replace(/\n/g, " ") : undefined,
			media,
		}),
	},
});
