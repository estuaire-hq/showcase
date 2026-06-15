import { HomeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

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
 *  - the hero slideshow MECHANICS (autoplay, cross-fade) + the full-screen intro live
 *    in the component, not here — editors configure the fixed title trunk + each slide's
 *    image and keyword.
 */

/**
 * Image field shared by every content image: hotspot crop + required-ish alt.
 * `group` is omitted for images nested inside an object type (e.g. heroSlide), which
 * has no field groups of its own — a `group` may only reference a group defined on the
 * same type, so passing one there crashes the Studio editor.
 */
const imageField = (name: string, title: string, group?: string) =>
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
			title: "Titre — 1ʳᵉ ligne (plein)",
			type: "string",
			group: "hero",
			description:
				"Première ligne du titre, pleine et constante. Ex. « Estuaire, ». Rendue aussi en H1 unique de la page.",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "heroTrunk",
			title: "Titre — 2ᵉ ligne (contour)",
			type: "string",
			group: "hero",
			description:
				"Tronc fixe rendu en contour, constant sur toutes les slides. Ex. « là où les ». Le mot-clé de chaque slide le complète.",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "heroSlides",
			title: "Slides du hero",
			type: "array",
			group: "hero",
			description:
				"Carrousel automatique en fondu : 1 visuel = 1 mot-clé. Le mot-clé change en synchro avec l'image active et complète « [1ʳᵉ ligne] [2ᵉ ligne] … ». Mécanique gérée par le code (sans contrôle manuel).",
			of: [
				defineArrayMember({
					type: "object",
					name: "heroSlide",
					title: "Slide",
					fields: [
						imageField("image", "Visuel"),
						defineField({
							name: "keyword",
							title: "Mot-clé du titre",
							type: "string",
							description:
								"Complète le tronc « Estuaire, là où les … ». Ex. « idées prennent forme ».",
							validation: (rule) =>
								rule.required().error("Le mot-clé du titre est requis."),
						}),
					],
					preview: {
						select: { title: "keyword", media: "image" },
						prepare: ({ title, media }) => ({
							title: title || "Slide",
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
