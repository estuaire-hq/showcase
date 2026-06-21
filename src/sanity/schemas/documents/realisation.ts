import { ImagesIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
	EXPERTISE_LABELS,
	EXPERTISE_SLUGS,
	UNIVERS,
} from "@/content/realisations";
import { imageField } from "../fields";

/**
 * Réalisation (étude de cas) — le PREMIER type de nature *collection* du projet : plusieurs
 * documents éditeur-créés, chacun avec une URL propre `/realisations/<slug>` (FR-001). Pattern
 * copié sur `sectorDetail` (multi-instance, slug-based, `_id` = `realisation-<slug>` sans point —
 * post-mortem 0010), étendu pour une collection ouverte.
 *
 * Source de vérité du modèle (Principe IX) : les types sont générés par TypeGen, jamais tapés.
 * Tout le contenu est piloté par le CMS (Principe II) ; pré-rempli par seed depuis le dossier
 * client. Maquettes : Figma desktop `portfolio` 51:4064 (liste), `case-study` 51:4386 (fournie),
 * `case-study-court` 53:2745 (légère) — responsive interprété par breakpoint.
 *
 * Groups (onglets) : Identité · Classement · Infos · Récit · Médias · SEO.
 */

const UNIVERS_OPTIONS = UNIVERS.map((u) => ({ title: u, value: u }));
const EXPERTISE_OPTIONS = EXPERTISE_SLUGS.map((slug) => ({
	title: EXPERTISE_LABELS[slug],
	value: slug,
}));

export const realisation = defineType({
	name: "realisation",
	title: "Réalisation",
	type: "document",
	icon: ImagesIcon,
	groups: [
		{ name: "identity", title: "Identité", default: true },
		{ name: "classification", title: "Classement" },
		{ name: "infos", title: "Infos" },
		{ name: "narrative", title: "Récit" },
		{ name: "media", title: "Médias" },
		{ name: "seo", title: "SEO" },
	],
	fields: [
		// — Identité —
		defineField({
			name: "title",
			title: "Nom du projet",
			type: "string",
			group: "identity",
			description:
				"Nom du projet, affiché en titre, sur la carte et dans le fil d'ariane. Distinct du client.",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug (URL)",
			type: "slug",
			group: "identity",
			description: "Dernier segment de l'URL : /realisations/<slug>.",
			options: { source: "title", maxLength: 96 },
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "client",
			title: "Client",
			type: "string",
			group: "identity",
			description:
				"Nom du client (≠ nom du projet ; parfois identiques). Utilisé pour le filtre « Clients ».",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "status",
			title: "Statut",
			type: "string",
			group: "identity",
			initialValue: "draft",
			options: {
				list: [
					{ title: "Publié", value: "published" },
					{ title: "À venir", value: "upcoming" },
					{ title: "Brouillon", value: "draft" },
				],
				layout: "radio",
			},
			description:
				"Publié : visible + page détail. À venir : aperçu grisé non cliquable, pas de détail. Brouillon : invisible.",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "order",
			title: "Ordre (récence)",
			type: "number",
			group: "identity",
			description:
				"Pilote « les plus récentes » (tri décroissant). Plus le nombre est grand, plus la réalisation est mise en avant.",
		}),
		defineField({
			name: "publishedAt",
			title: "Date de publication",
			type: "datetime",
			group: "identity",
			description: "Optionnel — départage les réalisations à ordre égal.",
		}),

		// — Classement —
		defineField({
			name: "univers",
			title: "Univers (secteur-client)",
			type: "string",
			group: "classification",
			options: { list: UNIVERS_OPTIONS },
			description: "Exactement un univers parmi les 12 (filtre du portfolio).",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "expertises",
			title: "Expertises",
			type: "array",
			group: "classification",
			of: [defineArrayMember({ type: "string" })],
			options: { list: EXPERTISE_OPTIONS },
			description:
				"Une ou plusieurs expertises (rattachement + filtre). Pré-rempli par estimation, corrigeable.",
			validation: (rule) => rule.required().min(1),
		}),

		// — Infos complémentaires (affichées uniquement si renseignées) —
		defineField({
			name: "location",
			title: "Lieu",
			type: "string",
			group: "infos",
			description: "Ex. « Paris ». Masqué si vide.",
		}),
		defineField({
			name: "year",
			title: "Année",
			type: "string",
			group: "infos",
			description: "Ex. « 2024 ». Masqué si vide.",
		}),
		defineField({
			name: "area",
			title: "Superficie",
			type: "string",
			group: "infos",
			description: "Ex. « 320 m² ». Masqué si vide.",
		}),

		// — Récit —
		// Récit requis UNIQUEMENT pour une réalisation publiée : les états « à venir » et
		// « brouillon » sont volontairement incomplets. Validation conditionnelle (pas
		// `.required()` brut) → le champ reste structurellement optionnel, donc le dry-run
		// `--check` du seed les tolère, tandis que le Studio signale un document publié incomplet.
		defineField({
			name: "context",
			title: "Contexte",
			type: "text",
			rows: 5,
			group: "narrative",
			validation: (rule) =>
				rule.custom((value, ctx) => {
					const status = (ctx.document as { status?: string } | undefined)
						?.status;
					return status === "published" && !value?.toString().trim()
						? "Requis pour une réalisation publiée"
						: true;
				}),
		}),
		defineField({
			name: "enjeu",
			title: "Enjeu",
			type: "text",
			rows: 4,
			group: "narrative",
			validation: (rule) =>
				rule.custom((value, ctx) => {
					const status = (ctx.document as { status?: string } | undefined)
						?.status;
					return status === "published" && !value?.toString().trim()
						? "Requis pour une réalisation publiée"
						: true;
				}),
		}),
		defineField({
			name: "interventions",
			title: "Nos missions (interventions)",
			type: "array",
			group: "narrative",
			of: [defineArrayMember({ type: "string" })],
			description: "Liste des interventions, dans l'ordre.",
		}),
		defineField({
			name: "challenges",
			title: "Défis relevés",
			type: "array",
			group: "narrative",
			description: "1 à 3 défis ; la section s'adapte au nombre réel.",
			validation: (rule) => rule.max(3),
			of: [
				defineArrayMember({
					type: "object",
					name: "challenge",
					title: "Défi",
					fields: [
						defineField({
							name: "title",
							title: "Titre du défi",
							type: "string",
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: "body",
							title: "Corps du défi",
							type: "text",
							rows: 4,
							validation: (rule) => rule.required(),
						}),
					],
					preview: {
						select: { title: "title", subtitle: "body" },
						prepare: ({ title, subtitle }) => ({
							title: title || "Défi",
							subtitle,
						}),
					},
				}),
			],
		}),
		defineField({
			name: "photoCredit",
			title: "Crédit photo",
			type: "string",
			group: "narrative",
			description:
				"Optionnel. Rendu entre le dernier défi et les savoir-faire. Masqué si vide.",
		}),
		defineField({
			name: "skills",
			title: "Savoir-faire & engagements",
			type: "array",
			group: "narrative",
			of: [defineArrayMember({ type: "string" })],
			description: "Pastilles affichées en fin de page.",
		}),

		// — Médias —
		defineField({
			name: "layout",
			title: "Variante d'affichage",
			type: "string",
			group: "media",
			initialValue: "legere",
			options: {
				list: [
					{ title: "Fournie (avec carrousel d'intro)", value: "fournie" },
					{ title: "Légère (intro compacte)", value: "legere" },
				],
				layout: "radio",
			},
			description:
				"« Fournie » quand assez de photos (≈ ≥ 9) pour remplir la composition + un carrousel ; « légère » sinon.",
			validation: (rule) => rule.required(),
		}),
		imageField("cover", "Image de couverture", "media"),
		defineField({
			name: "gallery",
			title: "Galerie (ordonnée)",
			type: "array",
			group: "media",
			description: "Images du projet, dans l'ordre. Gère de 2 à 26 photos.",
			of: [
				defineArrayMember({
					type: "image",
					options: { hotspot: true },
					fields: [
						defineField({
							name: "alt",
							title: "Texte alternatif",
							type: "string",
							validation: (rule) =>
								rule
									.required()
									.warning("Important pour l'accessibilité et le SEO"),
						}),
					],
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
				"Repli : le nom du projet. Mis en forme par « %s | Estuaire ».",
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
	orderings: [
		{
			title: "Récence (récent → ancien)",
			name: "orderDesc",
			by: [
				{ field: "order", direction: "desc" },
				{ field: "publishedAt", direction: "desc" },
			],
		},
	],
	preview: {
		select: {
			title: "title",
			client: "client",
			status: "status",
			slug: "slug.current",
			media: "cover",
		},
		prepare: ({ title, client, status, slug, media }) => {
			const statusLabel =
				status === "published"
					? "Publié"
					: status === "upcoming"
						? "À venir"
						: "Brouillon";
			return {
				title: title || "Réalisation",
				subtitle: `${statusLabel} · ${client ?? ""}${slug ? ` · /realisations/${slug}` : ""}`,
				media,
			};
		},
	},
});
