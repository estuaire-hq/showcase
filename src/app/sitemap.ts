import type { MetadataRoute } from "next";
import { EXPERTISE_SLUGS } from "@/content/expertiseSubpages";
import { SECTOR_SLUGS } from "@/content/sectorDetail";
import { sanityFetch } from "@/lib/sanity/live";
import { REALISATION_SLUGS_QUERY } from "@/lib/sanity/queries";
import { absoluteUrl } from "@/lib/seo/config";

// Full sitemap: the static routes + every dynamic route (expertise sub-pages, univers sectors,
// published réalisations). URLs are absolute via `absoluteUrl` (same origin as `metadataBase`).
// Query-filtered views (`/realisations?univers=…`) are intentionally omitted — they are the
// same page and canonicalise to `/realisations`. Réalisations come from Sanity via `sanityFetch`
// so the sitemap revalidates through the same webhook tags as the pages.

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

const STATIC_ROUTES: {
	path: string;
	changeFrequency: ChangeFrequency;
	priority: number;
}[] = [
	{ path: "/", changeFrequency: "monthly", priority: 1 },
	{ path: "/nous-decouvrir", changeFrequency: "monthly", priority: 0.8 },
	{ path: "/expertises", changeFrequency: "monthly", priority: 0.9 },
	{ path: "/univers", changeFrequency: "monthly", priority: 0.9 },
	{ path: "/realisations", changeFrequency: "weekly", priority: 0.9 },
	{ path: "/contact", changeFrequency: "yearly", priority: 0.7 },
	{ path: "/mentions-legales", changeFrequency: "yearly", priority: 0.2 },
	{ path: "/confidentialite", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();

	const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
		url: absoluteUrl(r.path),
		lastModified: now,
		changeFrequency: r.changeFrequency,
		priority: r.priority,
	}));

	const expertiseEntries: MetadataRoute.Sitemap = EXPERTISE_SLUGS.map(
		(slug) => ({
			url: absoluteUrl(`/expertises/${slug}`),
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.8,
		}),
	);

	const sectorEntries: MetadataRoute.Sitemap = SECTOR_SLUGS.map((slug) => ({
		url: absoluteUrl(`/univers/${slug}`),
		lastModified: now,
		changeFrequency: "monthly",
		priority: 0.8,
	}));

	const { data: realisations } = await sanityFetch({
		query: REALISATION_SLUGS_QUERY,
	});
	const realisationEntries: MetadataRoute.Sitemap = (realisations ?? [])
		.filter((r): r is typeof r & { slug: string } => Boolean(r.slug))
		.map((r) => ({
			url: absoluteUrl(`/realisations/${r.slug}`),
			lastModified: new Date(r._updatedAt),
			changeFrequency: "monthly",
			priority: 0.7,
		}));

	return [
		...staticEntries,
		...expertiseEntries,
		...sectorEntries,
		...realisationEntries,
	];
}
