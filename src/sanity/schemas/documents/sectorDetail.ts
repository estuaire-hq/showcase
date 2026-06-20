import { ThLargeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../fields";

/**
 * Sector detail page (« univers / <Secteur> ») — a NON-singleton document, one per
 * sector, distinguished by `slug` (retail / bureau / residentiel / scenographie). These
 * are the destinations of the « en savoir plus » buttons on the Univers page (feature
 * 009); a distinct model from the embedded `sector` objects of `sectorsPage` (research
 * §D1). Source of truth: Figma desktop nodes 51:3520 (retail) / 51:3661 (bureau) /
 * 51:3797 (residentiel) / 51:3929 (scenographie). All content is CMS-driven (Principle
 * II); maquette values (`src/content/sectorDetail.ts`) are the fallback.
 *
 * Section groups (tabs): Hero · Intro · Enjeux · Contraintes · Argument · Citations · SEO.
 * The hero/section titles use the brand outline/fill device (Principle VII / X). The H1
 * is the hero title (outline + fill combined) — unique per page (FR-017).
 */

export const sectorDetail = defineType({
	name: "sectorDetail",
	title: "Univers — secteur",
	type: "document",
	icon: ThLargeIcon,
	groups: [
		{ name: "hero", title: "Hero", default: true },
		{ name: "intro", title: "Intro" },
		{ name: "enjeux", title: "Enjeux" },
		{ name: "contraintes", title: "Contraintes terrain" },
		{ name: "argument", title: "Argument" },
		{ name: "citations", title: "Citations" },
		{ name: "seo", title: "SEO" },
	],
	fields: [
		// — Identity —
		defineField({
			name: "title",
			title: "Libellé du secteur",
			type: "string",
			group: "hero",
			description:
				"Nom du secteur, affiché dans le fil d'ariane et le titre. Ex. « Retail », « Bureau ».",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug (URL)",
			type: "slug",
			group: "hero",
			description:
				"Dernier segment de l'URL : retail / bureau / residentiel / scenographie (sans accent).",
			options: { source: "title", maxLength: 96 },
			validation: (rule) => rule.required(),
		}),

		// — Hero (01/ HEADER + SLIDER) —
		defineField({
			name: "heroEyebrow",
			title: "Sur-titre (eyebrow)",
			type: "text",
			rows: 2,
			group: "hero",
			description:
				"Petit label au-dessus du titre, séparé par un trait (2 lignes). Ex. « Retail design & agencement\nde boutiques sur-mesure ».",
		}),
		defineField({
			name: "heroTitleOutline",
			title: "Titre — contour",
			type: "text",
			rows: 2,
			group: "hero",
			description:
				"Lignes du H1 affichées en contour. Ex. « Des points\nde vente à ».",
		}),
		defineField({
			name: "heroTitleFill",
			title: "Titre — plein",
			type: "text",
			rows: 2,
			group: "hero",
			description: "Ligne(s) du H1, pleines. Ex. « votre image. ».",
			validation: (rule) => rule.required(),
		}),
		imageField("heroImage", "Visuel du hero", "hero"),

		// — Intro (02/ INTRO) —
		defineField({
			name: "introStatement",
			title: "Énoncé d'intro",
			type: "text",
			rows: 3,
			group: "intro",
			description:
				"Phrase d'introduction (grand corps). Ex. « Le lien avec une marque se vit d'abord à travers ses points de vente… ».",
		}),
		defineField({
			name: "introText",
			title: "Texte d'introduction",
			type: "text",
			rows: 8,
			group: "intro",
			description: "Paragraphe(s) d'intro (séparés par une ligne vide).",
		}),
		imageField("introImageMain", "Visuel principal (grand)", "intro"),
		imageField("introImagePortrait", "Visuel portrait", "intro"),
		imageField("introImageSquare", "Visuel carré (petit)", "intro"),

		// — Enjeux —
		defineField({
			name: "enjeuxTitleOutline",
			title: "Titre enjeux — contour",
			type: "string",
			group: "enjeux",
			description: "Ex. « Les enjeux ».",
		}),
		defineField({
			name: "enjeuxTitleFill",
			title: "Titre enjeux — plein",
			type: "string",
			group: "enjeux",
			description: "Ex. « du retail ».",
		}),
		defineField({
			name: "enjeux",
			title: "Liste des enjeux",
			type: "array",
			group: "enjeux",
			of: [defineArrayMember({ type: "string" })],
			description:
				"Items affichés en liste, séparés par des filets. Ex. « Garantir une ouverture à date fixe ».",
		}),

		// — Contraintes terrain —
		defineField({
			name: "contraintesTitleOutline",
			title: "Titre contraintes — contour",
			type: "string",
			group: "contraintes",
			description: "Ex. « Les contraintes ».",
		}),
		defineField({
			name: "contraintesTitleFill",
			title: "Titre contraintes — plein",
			type: "text",
			rows: 2,
			group: "contraintes",
			description: "Ex. « terrain\nà anticiper ».",
		}),
		defineField({
			name: "contraintes",
			title: "Contraintes (étiquettes)",
			type: "array",
			group: "contraintes",
			description:
				"Nuage d'étiquettes. L'emphase pilote le rythme visuel de la maquette (contour / fond sombre / fond accent).",
			of: [
				defineArrayMember({
					type: "object",
					name: "constraintChip",
					title: "Étiquette",
					fields: [
						defineField({
							name: "label",
							title: "Libellé",
							type: "string",
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: "emphasis",
							title: "Emphase",
							type: "string",
							initialValue: "outline",
							options: {
								list: [
									{ title: "Contour (défaut)", value: "outline" },
									{ title: "Fond sombre", value: "ink" },
									{ title: "Fond accent (bleu)", value: "accent" },
								],
								layout: "radio",
							},
						}),
					],
					preview: {
						select: { title: "label", subtitle: "emphasis" },
						prepare: ({ title, subtitle }) => ({
							title: title || "Étiquette",
							subtitle,
						}),
					},
				}),
			],
		}),

		// — Argument —
		defineField({
			name: "argument",
			title: "Texte de positionnement",
			type: "text",
			rows: 4,
			group: "argument",
			description:
				"Bloc de positionnement fort, décliné par secteur (centré sur panneau crème).",
		}),

		// — Citations —
		defineField({
			name: "citations",
			title: "Citations / témoignages",
			type: "array",
			group: "citations",
			description: "Deux citations, conformément à la maquette.",
			validation: (rule) => rule.max(2),
			of: [
				defineArrayMember({
					type: "object",
					name: "testimonial",
					title: "Citation",
					fields: [
						defineField({
							name: "quote",
							title: "Texte de la citation",
							type: "text",
							rows: 4,
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: "attribution",
							title: "Attribution (optionnelle)",
							type: "string",
							description:
								"Auteur, rôle, entreprise. Ex. « Delphine Tipré, architecte d'intérieur, Clarins ». Laisser vide si non communiqué.",
						}),
						imageField("image", "Visuel de fond"),
					],
					preview: {
						select: { title: "attribution", subtitle: "quote", media: "image" },
						prepare: ({ title, subtitle, media }) => ({
							title: title || "Citation",
							subtitle,
							media,
						}),
					},
				}),
			],
		}),

		// — SEO —
		defineField({
			name: "seoMetaTitle",
			title: "Titre de page (SEO)",
			type: "string",
			group: "seo",
			description:
				"Titre de l'onglet / résultat de recherche. Mis en forme par le template « %s | Estuaire ». Repli : le libellé du secteur.",
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
			title: title || "Secteur",
			subtitle: subtitle ? `/univers/${subtitle}` : "Page secteur",
			media,
		}),
	},
});
