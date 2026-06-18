import { ThLargeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../fields";

/**
 * Sectors page (« Univers » — Webdesign-page-secteurs-ESTUAIRE-V1, node 51:3386
 * desktop; no tablet/mobile frame) — a singleton (enforced in structure.ts). Holds
 * the editorial content of `/univers`, organised in section groups (tabs):
 * Hero · Intro · Secteurs · Infos clés · SEO.
 *
 * The hero title uses the brand outline/fill device (read on `02/ SLIDER`: stroked
 * lines « Architectes / et designers, » + solid lines « nous concrétisons / vos
 * projets / avec soin. »), under an eyebrow + separator rule — same `PageHero` device
 * as the about page. The H1 is the outline + fill lines combined (Principle VII / X).
 *
 * Secteurs and infos clés are EMBEDDED ordered lists (objects `sector` / `keyFigure`),
 * not autonomous documents: on this page they are presentational ordered lists, and
 * the sector detail pages are distinct features with their own model (research §2).
 * All content is CMS-driven (Principle II); maquette values are the fallback.
 */

export const sectorsPage = defineType({
	name: "sectorsPage",
	title: "Univers",
	type: "document",
	icon: ThLargeIcon,
	groups: [
		{ name: "hero", title: "Hero", default: true },
		{ name: "intro", title: "Intro" },
		{ name: "sectors", title: "Secteurs" },
		{ name: "keyFigures", title: "Infos clés" },
		{ name: "seo", title: "SEO" },
	],
	fields: [
		// — Hero (02/ SLIDER) —
		defineField({
			name: "heroEyebrow",
			title: "Sur-titre (eyebrow)",
			type: "text",
			rows: 2,
			group: "hero",
			description:
				"Petit label au-dessus du titre, séparé par un trait (2 lignes). Ex. « Agencement sur mesure\ndu retail à vos bureaux ».",
		}),
		defineField({
			name: "heroTitleOutline",
			title: "Titre — contour",
			type: "text",
			rows: 2,
			group: "hero",
			description:
				"Lignes du H1 affichées en contour. Ex. « Architectes\net designers, »",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "heroTitleFill",
			title: "Titre — plein",
			type: "text",
			rows: 3,
			group: "hero",
			description:
				"Lignes du H1, pleines. Ex. « nous concrétisons\nvos projets\navec soin. »",
			validation: (rule) => rule.required(),
		}),
		imageField("heroImage", "Visuel du hero", "hero"),

		// — Intro (03/ INTRO) —
		defineField({
			name: "introStatement",
			title: "Phrase de positionnement",
			type: "text",
			rows: 3,
			group: "intro",
			description:
				"Phrase de positionnement multisectoriel. Ex. « Grâce à notre périmètre d'intervention multisectoriel… ».",
		}),
		defineField({
			name: "introText",
			title: "Texte d'introduction",
			type: "text",
			rows: 8,
			group: "intro",
		}),
		imageField("introImage", "Visuel d'appui", "intro"),

		// — Secteurs (04/ SECTEURS) —
		defineField({
			name: "sectors",
			title: "Secteurs",
			type: "array",
			group: "sectors",
			description:
				"Les secteurs adressés, dans l'ordre d'affichage (réordonnez par glisser-déposer). La maquette en décrit quatre : Retail, Bureau, Résidentiel, Scénographie.",
			of: [
				defineArrayMember({
					type: "object",
					name: "sector",
					title: "Secteur",
					fields: [
						defineField({
							name: "label",
							title: "Libellé",
							type: "string",
							description: "Ex. « Retail », « Bureau ».",
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: "promise",
							title: "Phrase de promesse",
							type: "text",
							rows: 3,
							description:
								"Phrase posée sous le trait de la bande. Ex. « Nous anticipons les cahiers des charges… ».",
						}),
						defineField({
							name: "href",
							title: "Lien « en savoir plus »",
							type: "string",
							description:
								"Route de la page de détail du secteur. Ex. « /univers/retail » (404 temporaire accepté tant que la page n'existe pas).",
						}),
						imageField("image", "Visuel plein-cadre"),
					],
					preview: {
						select: { title: "label", subtitle: "href", media: "image" },
						prepare: ({ title, subtitle, media }) => ({
							title: title || "Secteur",
							subtitle,
							media,
						}),
					},
				}),
			],
		}),

		// — Infos clés (05/ INFOS CLÉS) —
		defineField({
			name: "keyFigures",
			title: "Infos clés",
			type: "array",
			group: "keyFigures",
			description:
				"Chiffres / promesses, dans l'ordre d'affichage (grille 2×2). La maquette en décrit quatre.",
			of: [
				defineArrayMember({
					type: "object",
					name: "keyFigure",
					title: "Info clé",
					fields: [
						defineField({
							name: "value",
							title: "Intitulé fort",
							type: "string",
							description:
								"Ex. « 15 ans d'expérience », « +150 projets par an ».",
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: "support",
							title: "Phrase d'appui",
							type: "text",
							rows: 2,
							description:
								"Ex. « Une excellence acquise à l'occasion de projets exigeants. ».",
						}),
					],
					preview: {
						select: { title: "value", subtitle: "support" },
						prepare: ({ title, subtitle }) => ({
							title: title || "Info clé",
							subtitle,
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
				"Titre de l'onglet / résultat de recherche. Mis en forme par le template « %s | Estuaire ». Repli : « Univers ».",
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
		prepare: ({ media }) => ({
			title: "Univers",
			subtitle: "Page secteurs",
			media,
		}),
	},
});
