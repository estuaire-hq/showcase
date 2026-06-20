import { DocumentsIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../fields";

/**
 * Expertise sub-page — a SINGLE parameterised document type, instantiated THREE times
 * (agencement / mobiliers / présentoirs), served by the dynamic route
 * `(site)/expertises/[expertise]`. NOT a singleton: the three pages share one gabarit and
 * differ only by content (constitution Principle IV). Maquettes: agencement 51:3008 desktop /
 * 87:6762 tablet / 87:6964 mobile; mobiliers 51:3134, présentoirs 51:3259 (desktop only —
 * responsive derived from agencement).
 *
 * The gabarit (6 sections, scroll order): hero (02/ SLIDER, breadcrumb + dark cartouche),
 * intro (03/, phrase phare + text + visual), responsable (04/, outline/fill engagement title +
 * rule + text + visuals), engagements (05/, "Nos engagements" + 6 numbered engagements 01/…06/),
 * caseStudy (06/, "Découvrez notre dernier projet …" + visual band + button), then the global
 * shell « BIG FOOTER » (NOT modelled here). Section/hero titles use the brand outline/fill
 * device (OutlineText + BrandText).
 *
 * The 6 engagements are a CMS-editable ordered list (Principle II); their `01/`…`06/` numbering
 * is DERIVED from the order at render (never stored). The case-study button routes to a
 * réalisation (string href; 404 temporaire accepted until those pages exist).
 */

export const expertiseSubpage = defineType({
	name: "expertiseSubpage",
	title: "Sous-page d'expertise",
	type: "document",
	icon: DocumentsIcon,
	groups: [
		{ name: "hero", title: "Hero", default: true },
		{ name: "intro", title: "Intro" },
		{ name: "responsable", title: "Responsable" },
		{ name: "engagements", title: "Engagements" },
		{ name: "caseStudy", title: "Cas study" },
		{ name: "seo", title: "SEO" },
	],
	fields: [
		// — Identité / routage —
		defineField({
			name: "title",
			title: "Nom (administration)",
			type: "string",
			group: "hero",
			description:
				"Libellé interne de l'expertise. Ex. « Agencement sur mesure ».",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug (route)",
			type: "slug",
			group: "hero",
			options: { source: "title", maxLength: 96 },
			description:
				"Clé de l'URL : /expertises/<slug>. Ex. « agencement-sur-mesure ». À ne pas renommer (les liens de la page Expertises en dépendent).",
			validation: (rule) => rule.required(),
		}),

		// — Hero (02/ SLIDER) —
		defineField({
			name: "breadcrumb",
			title: "Fil d'Ariane",
			type: "string",
			group: "hero",
			description:
				"Segments séparés par « / ». Ex. « univers / agencement sur-mesure ». Le premier segment renvoie à la page « Expertises ».",
		}),
		defineField({
			name: "heroEyebrow",
			title: "Sur-titre (eyebrow)",
			type: "string",
			group: "hero",
			description:
				"Petit label au-dessus du titre, séparé par un trait. Ex. « Agencement sur-mesure ».",
		}),
		defineField({
			name: "heroTitleOutline",
			title: "Titre — contour",
			type: "text",
			rows: 2,
			group: "hero",
			description: "Lignes du H1 affichées en contour. Ex. « Notre vision ».",
		}),
		defineField({
			name: "heroTitleFill",
			title: "Titre — plein",
			type: "text",
			rows: 2,
			group: "hero",
			description: "Lignes du H1, pleines. Ex. « du métier d'agenceur. ».",
			validation: (rule) => rule.required(),
		}),
		imageField("heroImage", "Visuel plein cadre", "hero"),

		// — Intro (03/ INTRO) —
		defineField({
			name: "introStatement",
			title: "Phrase phare",
			type: "text",
			rows: 3,
			group: "intro",
			description:
				"Énoncé mis en avant. Ex. « Des espaces conçus dans leur ensemble et jusque dans les moindres détails. »",
		}),
		defineField({
			name: "introText",
			title: "Texte d'introduction",
			type: "text",
			rows: 10,
			group: "intro",
		}),
		imageField("introImage", "Visuel d'appui", "intro"),

		// — Responsable (04/ RESPONSABLE) —
		defineField({
			name: "responsableTitleOutline",
			title: "Phrase d'engagement — contour",
			type: "text",
			rows: 2,
			group: "responsable",
			description: "Lignes en contour. Ex. « Un seul\net même ».",
		}),
		defineField({
			name: "responsableTitleFill",
			title: "Phrase d'engagement — plein",
			type: "text",
			rows: 2,
			group: "responsable",
			description: "Lignes pleines. Ex. « responsable\nde A à Z ».",
		}),
		defineField({
			name: "responsableText",
			title: "Texte",
			type: "text",
			rows: 6,
			group: "responsable",
		}),
		defineField({
			name: "responsableImages",
			title: "Visuels",
			type: "array",
			group: "responsable",
			of: [imageField("image", "Visuel")],
			description: "Visuels d'appui du bloc (la maquette en présente 3).",
		}),

		// — Engagements (05/ NOS ENGAGEMENTS) —
		defineField({
			name: "engagementsTitleOutline",
			title: "Titre de section — contour",
			type: "string",
			group: "engagements",
			description: "Ex. « Nos » (rendu en contour).",
		}),
		defineField({
			name: "engagementsTitleFill",
			title: "Titre de section — plein",
			type: "string",
			group: "engagements",
			description: "Ex. « engagements » (rendu plein).",
		}),
		defineField({
			name: "engagements",
			title: "Engagements",
			type: "array",
			group: "engagements",
			description:
				"Les engagements, dans l'ordre d'affichage. La numérotation « 01/ »…« 06/ » est dérivée de l'ordre. La maquette en présente 6 ; la grille reste correcte si un engagement est masqué ou réordonné.",
			of: [
				defineArrayMember({
					type: "object",
					name: "engagement",
					title: "Engagement",
					fields: [
						defineField({
							name: "title",
							title: "Intitulé",
							type: "text",
							rows: 3,
							validation: (rule) => rule.required(),
						}),
					],
					preview: {
						select: { title: "title" },
						prepare: ({ title }) => ({
							title: (title || "Engagement").replace(/\n/g, " "),
						}),
					},
				}),
			],
		}),

		// — Cas study (06/ CAS STUDY) —
		defineField({
			name: "caseStudyTitleOutline",
			title: "Titre de section — contour",
			type: "text",
			rows: 2,
			group: "caseStudy",
			description: "Ex. « Découvrez notre dernier » (rendu en contour).",
		}),
		defineField({
			name: "caseStudyTitleFill",
			title: "Titre de section — plein",
			type: "text",
			rows: 2,
			group: "caseStudy",
			description: "Ex. « projet d'agencement » (rendu plein).",
		}),
		imageField("caseStudyImage", "Bande visuelle", "caseStudy"),
		defineField({
			name: "caseStudyProjectTitle",
			title: "Titre du projet",
			type: "string",
			group: "caseStudy",
			description: "Titre en incrustation. Ex. « L'artisan parfumeur ».",
		}),
		defineField({
			name: "caseStudyMeta",
			title: "Méta (lieu · année · superficie)",
			type: "array",
			of: [defineArrayMember({ type: "string" })],
			group: "caseStudy",
			description:
				"Lignes affichées séparées par des tirets. Ex. « Lieu », « année », « superficie ».",
		}),
		defineField({
			name: "caseStudyCtaLabel",
			title: "Libellé du bouton",
			type: "string",
			group: "caseStudy",
			initialValue: "découvrir nos réalisations",
		}),
		defineField({
			name: "caseStudyCtaHref",
			title: "Lien du bouton",
			type: "string",
			group: "caseStudy",
			description:
				"Destination (réalisation). Ex. « /realisations ». 404 temporaire accepté tant que les réalisations ne sont pas livrées.",
		}),

		// — SEO —
		defineField({
			name: "seoMetaTitle",
			title: "Titre de page (SEO)",
			type: "string",
			group: "seo",
			description:
				"Titre de l'onglet / résultat de recherche. Mis en forme par « %s | Estuaire ».",
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
		select: { title: "title", subtitle: "slug.current", media: "heroImage" },
		prepare: ({ title, subtitle, media }) => ({
			title: title || "Sous-page d'expertise",
			subtitle: subtitle ? `/expertises/${subtitle}` : undefined,
			media,
		}),
	},
});
