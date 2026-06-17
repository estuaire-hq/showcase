import { HomeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../fields";

/**
 * Home page (Webdesign-homepage-ESTUAIRE-V1) — a singleton (enforced in
 * structure.ts). Holds the editorial content of the public home `/`, organised
 * in section groups (tabs): Hero · Intro · Expertises · Univers · Réalisations ·
 * Vision · SEO.
 *
 * Section titles follow the brand outline/fill device (same precedent as the
 * footer's ctaTitleOutline/ctaTitleFill): the first part renders as a contour
 * (OutlineText) and the second as a solid fill — both run through BrandText for
 * the UPPERCASE→Montserrat / lowercase→Montserrat Alternates casse rule.
 *
 * Out of this model (deliberate, see spec 005 + ADR 0011):
 *  - the realisation case-study cards AND the 12-item "réalisations par secteur"
 *    list are STATIC for now (src/content/homeRealisations.ts), all linking to
 *    /realisations — rebound to the CMS with the future "Réalisations" feature;
 *  - the hero slideshow MECHANICS (autoplay, cross-fade) live in the component,
 *    not here — editors only configure the slides.
 */

export const homePage = defineType({
	name: "homePage",
	title: "Page d'accueil",
	type: "document",
	icon: HomeIcon,
	groups: [
		{ name: "hero", title: "Hero", default: true },
		{ name: "intro", title: "Intro" },
		{ name: "expertises", title: "Expertises" },
		{ name: "univers", title: "Univers" },
		{ name: "realisations", title: "Réalisations" },
		{ name: "vision", title: "Vision" },
		{ name: "seo", title: "SEO" },
	],
	fields: [
		// — Hero —
		defineField({
			name: "heroLabel",
			title: "Label (H1)",
			type: "string",
			group: "hero",
			description:
				"Petit label de marque rendu en H1 unique (ex. « Estuaire »), constant sur toutes les slides.",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "heroSlides",
			title: "Slides du hero",
			type: "array",
			group: "hero",
			description:
				"Carrousel automatique en fondu (visuel + titre changent ensemble, sans contrôle manuel). La mécanique est gérée par le code.",
			of: [
				defineArrayMember({
					type: "object",
					name: "heroSlide",
					title: "Slide",
					fields: [
						imageField("image", "Visuel"),
						defineField({
							name: "titleOutline",
							title: "Titre — contour",
							type: "text",
							rows: 2,
							description:
								"Lignes affichées en contour. Ex. « Là où les\nsavoir-faire »",
						}),
						defineField({
							name: "titleFill",
							title: "Titre — plein",
							type: "string",
							description:
								"Dernière ligne affichée pleine. Ex. « s'assemblent. »",
						}),
					],
					preview: {
						select: {
							title: "titleFill",
							subtitle: "titleOutline",
							media: "image",
						},
						prepare: ({ title, subtitle, media }) => ({
							title: title || "Slide",
							subtitle: subtitle?.replace(/\n/g, " "),
							media,
						}),
					},
				}),
			],
			validation: (rule) => rule.min(1).error("Ajoutez au moins une slide."),
		}),

		// — Intro —
		defineField({
			name: "introTitleOutline",
			title: "Titre intro — contour",
			type: "string",
			group: "intro",
			description: "Ex. « Nous sommes » (rendu en contour).",
		}),
		defineField({
			name: "introTitleFill",
			title: "Titre intro — plein",
			type: "text",
			rows: 3,
			group: "intro",
			description:
				"Suite du titre, pleine. Ex. « agenceur\nconcepteur\nengagé. »",
		}),
		defineField({
			name: "introText",
			title: "Texte de positionnement",
			type: "text",
			rows: 6,
			group: "intro",
		}),
		imageField("introImagePrimary", "Image principale", "intro"),
		imageField("introImageSecondary", "Image secondaire", "intro"),

		// — Expertises —
		defineField({
			name: "expertisesTitleOutline",
			title: "Titre — contour",
			type: "string",
			group: "expertises",
			description: "Ex. « Nos » (rendu en contour).",
		}),
		defineField({
			name: "expertisesTitleFill",
			title: "Titre — plein",
			type: "string",
			group: "expertises",
			description: "Ex. « expertises » (rendu plein).",
		}),
		defineField({
			name: "expertisesText",
			title: "Texte",
			type: "text",
			rows: 3,
			group: "expertises",
		}),
		imageField("expertisesImage", "Visuel", "expertises"),
		defineField({
			name: "expertisesCtaLabel",
			title: "Libellé CTA",
			type: "string",
			group: "expertises",
			initialValue: "en savoir plus",
		}),
		defineField({
			name: "expertisesCtaHref",
			title: "Lien CTA",
			type: "string",
			group: "expertises",
			initialValue: "/expertises",
		}),

		// — Univers —
		defineField({
			name: "universSectors",
			title: "Univers / secteurs",
			type: "array",
			group: "univers",
			description:
				"Les univers d'intervention, en liens actifs vers leur sous-page de secteur (/univers/[secteur]).",
			of: [
				defineArrayMember({
					type: "object",
					name: "sector",
					fields: [
						defineField({ name: "label", title: "Libellé", type: "string" }),
						defineField({ name: "href", title: "Lien", type: "string" }),
					],
					preview: { select: { title: "label", subtitle: "href" } },
				}),
			],
		}),

		// — Réalisations —
		// The case-study cards and the 12-item "par secteur" list are STATIC
		// (src/content/homeRealisations.ts) — only the section's editorial chrome
		// (title + CTA) is editable here. See ADR 0011.
		defineField({
			name: "realisationsTitleOutline",
			title: "Titre — contour",
			type: "string",
			group: "realisations",
			description: "Ex. « Nos réalisations » (rendu en contour).",
		}),
		defineField({
			name: "realisationsTitleFill",
			title: "Titre — plein",
			type: "string",
			group: "realisations",
			description: "Ex. « par secteur » (rendu plein).",
		}),
		defineField({
			name: "realisationsCtaLabel",
			title: "Libellé CTA",
			type: "string",
			group: "realisations",
			initialValue: "voir nos réalisations",
		}),
		defineField({
			name: "realisationsCtaHref",
			title: "Lien CTA",
			type: "string",
			group: "realisations",
			initialValue: "/realisations",
		}),

		// — Vision —
		defineField({
			name: "visionTitleOutline",
			title: "Titre — contour",
			type: "string",
			group: "vision",
			description: "Ex. « Découvrez » (rendu en contour).",
		}),
		defineField({
			name: "visionTitleFill",
			title: "Titre — plein",
			type: "string",
			group: "vision",
			description: "Ex. « notre vision » (rendu plein).",
		}),
		defineField({
			name: "visionText",
			title: "Texte",
			type: "text",
			rows: 6,
			group: "vision",
		}),
		imageField("visionImage", "Visuel", "vision"),
		defineField({
			name: "visionCtaLabel",
			title: "Libellé CTA",
			type: "string",
			group: "vision",
			initialValue: "en savoir plus",
		}),
		defineField({
			name: "visionCtaHref",
			title: "Lien CTA",
			type: "string",
			group: "vision",
			initialValue: "/nous-decouvrir",
		}),

		// — SEO —
		defineField({
			name: "seoMetaTitle",
			title: "Titre de page (SEO)",
			type: "string",
			group: "seo",
			description:
				"Titre de l'onglet / résultat de recherche. Repli : « Estuaire ».",
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
		select: { title: "heroLabel", media: "heroSlides.0.image" },
		prepare: ({ title, media }) => ({
			title: "Page d'accueil",
			subtitle: title,
			media,
		}),
	},
});
