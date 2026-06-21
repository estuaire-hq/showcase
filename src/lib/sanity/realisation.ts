import type {
	REALISATION_SLUGS_QUERY_RESULT,
	REALISATIONS_LIST_QUERY_RESULT,
} from "@/sanity.types";
import { sanityFetch } from "./live";
import { mapImage } from "./mapImage";
import {
	EXPERTISE_LATEST_REALISATION_QUERY,
	LATEST_REALISATIONS_QUERY,
	REALISATION_QUERY,
	REALISATION_SLUGS_QUERY,
	REALISATIONS_LIST_QUERY,
} from "./queries";

// Connecteur « réalisation » (collection) — Sanity → props des composants DS (Principe VIII).
// Types dérivés des résultats GROQ via TypeGen (jamais tapés — Principe IX). Réutilise `mapImage`
// (urlFor + LQIP). Pattern : `sectorDetail.ts`, étendu pour une collection (liste + détail + nav).

/** Méta « lieu · année · superficie » : uniquement les valeurs renseignées (FR-004). */
function buildMeta(item: {
	location?: string | null;
	year?: string | null;
	area?: string | null;
}): string[] {
	return [item.location, item.year, item.area].filter(
		(v): v is string => typeof v === "string" && v.trim().length > 0,
	);
}

export type RealisationListItem = {
	slug: string;
	title: string;
	client: string;
	status: NonNullable<REALISATIONS_LIST_QUERY_RESULT[number]["status"]>;
	univers: string | null;
	expertises: string[];
	meta: string[];
	cover: ReturnType<typeof mapImage>;
	/** `/realisations/<slug>` si publiée ; `undefined` si « à venir » (non cliquable). */
	href?: string;
};

/** Toutes les réalisations non-brouillon (liste), mappées pour `RealisationsBrowser`. */
export async function getRealisationListProps(): Promise<
	RealisationListItem[]
> {
	const { data } = await sanityFetch({ query: REALISATIONS_LIST_QUERY });
	return (data ?? []).map((r) => {
		const title = r.title ?? "Réalisation";
		const published = r.status === "published";
		return {
			slug: r.slug ?? "",
			title,
			client: r.client ?? "",
			status: r.status ?? "draft",
			univers: r.univers ?? null,
			expertises: (r.expertises ?? []).filter(Boolean),
			meta: buildMeta(r),
			cover: mapImage(r.cover, 1920, `Estuaire — ${title}`),
			href: published && r.slug ? `/realisations/${r.slug}` : undefined,
		};
	});
}

/** Cartes « plus récentes » (home / Dernières Réalisations) : publiées uniquement. */
export type RealisationCardData = {
	slug: string;
	title: string;
	meta: string[];
	cover: ReturnType<typeof mapImage>;
};

export type RealisationNeighbor = { slug: string; title: string };

/**
 * Détail d'une réalisation publiée + ses voisins précédent/suivant (bornés, research D8).
 * Renvoie `null` pour un slug absent / non publié → la route fait `notFound()`.
 */
export async function getRealisationProps(slug: string) {
	const [{ data: r }, { data: slugList }] = await Promise.all([
		sanityFetch({ query: REALISATION_QUERY, params: { slug } }),
		sanityFetch({ query: REALISATION_SLUGS_QUERY }),
	]);
	if (!r) return null;

	const title = r.title ?? "Réalisation";
	const alt = `Estuaire — ${title}`;

	const ordered: REALISATION_SLUGS_QUERY_RESULT = slugList ?? [];
	const i = ordered.findIndex((s) => s.slug === r.slug);
	const toNeighbor = (
		n: REALISATION_SLUGS_QUERY_RESULT[number] | undefined,
	): RealisationNeighbor | undefined =>
		n?.slug ? { slug: n.slug, title: n.title ?? "Réalisation" } : undefined;

	const gallery = (r.gallery ?? [])
		.map((g) => mapImage(g, 1600, alt))
		.filter((g): g is NonNullable<typeof g> => Boolean(g));

	return {
		slug: r.slug ?? slug,
		title,
		client: r.client ?? "",
		univers: r.univers ?? null,
		expertises: (r.expertises ?? []).filter(Boolean),
		layout: r.layout ?? "legere",
		meta: buildMeta(r),
		context: r.context ?? "",
		enjeu: r.enjeu ?? "",
		interventions: (r.interventions ?? []).filter(Boolean),
		challenges: (r.challenges ?? [])
			.filter((c): c is typeof c & { title: string; body: string } =>
				Boolean(c.title && c.body),
			)
			.map((c) => ({ title: c.title, body: c.body })),
		skills: (r.skills ?? []).filter(Boolean),
		photoCredit: r.photoCredit ?? undefined,
		cover: mapImage(r.cover, 1920, alt),
		gallery,
		neighbors: {
			// `prev` = plus récente (avant dans la liste desc), `next` = plus ancienne.
			prev: i > 0 ? toNeighbor(ordered[i - 1]) : undefined,
			next:
				i >= 0 && i < ordered.length - 1
					? toNeighbor(ordered[i + 1])
					: undefined,
		},
		seo: {
			metaTitle: r.seoMetaTitle ?? title,
			metaDescription: r.seoMetaDescription ?? undefined,
			ogImage:
				mapImage(r.seoOgImage, 1200, alt) ?? mapImage(r.cover, 1200, alt),
		},
	};
}

export type RealisationDetailProps = NonNullable<
	Awaited<ReturnType<typeof getRealisationProps>>
>;

// — Demock (US3) — réalisations « plus récentes » pour la home + les sous-pages d'expertises.

/** Les `limit` réalisations publiées les plus récentes (home : cartes + visuels — FR-023). */
export async function getLatestRealisations(
	limit = 3,
): Promise<RealisationCardData[]> {
	const { data } = await sanityFetch({ query: LATEST_REALISATIONS_QUERY });
	return (data ?? []).slice(0, limit).map((r) => {
		const title = r.title ?? "Réalisation";
		return {
			slug: r.slug ?? "",
			title,
			meta: buildMeta(r),
			cover: mapImage(r.cover, 1920, `Estuaire — ${title}`),
		};
	});
}

/**
 * La réalisation publiée la plus récente rattachée à une expertise (demock sous-pages, FR-024),
 * ou `null` → la sous-page conserve son contenu « cas study » par défaut (repli dégradé propre).
 */
export async function getLatestRealisationForExpertise(
	expertise: string,
): Promise<RealisationCardData | null> {
	const { data: r } = await sanityFetch({
		query: EXPERTISE_LATEST_REALISATION_QUERY,
		params: { expertise },
	});
	if (!r) return null;
	const title = r.title ?? "Réalisation";
	return {
		slug: r.slug ?? "",
		title,
		meta: buildMeta(r),
		cover: mapImage(r.cover, 1920, `Estuaire — ${title}`),
	};
}
