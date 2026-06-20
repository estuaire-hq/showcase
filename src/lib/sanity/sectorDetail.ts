import {
	type ConstraintEmphasis,
	SECTOR_SLUGS,
	type SectorSlug,
	sectorDetailContent,
} from "@/content/sectorDetail";
import { sanityFetch } from "./live";
import { mapImage, type ResolvedImage } from "./mapImage";
import { SECTOR_DETAIL_QUERY } from "./queries";

// Types derive from the schema via TypeGen (`sanity.types.ts`) — never hand-typed
// (Principle IX). « Sector detail » is page-specific content → fetched by the page
// connector, not a global wrapper (Principle VIII). Per-slug: fetch the document, apply
// the maquette defaults (`sectorDetailContent`, single source with the seeds), resolve
// images via the shared `mapImage` (`urlFor` + LQIP). An unknown slug → `null` → the
// route calls `notFound()` (FR-009 / SC-008).

const EMPHASES: readonly ConstraintEmphasis[] = ["outline", "ink", "accent"];
const asEmphasis = (v: string | null | undefined): ConstraintEmphasis =>
	EMPHASES.includes(v as ConstraintEmphasis)
		? (v as ConstraintEmphasis)
		: "outline";

export type SectorConstraintProps = {
	label: string;
	emphasis: ConstraintEmphasis;
};
export type SectorTestimonialProps = {
	quote: string;
	attribution?: string;
	image: ResolvedImage | undefined;
};

/** True when the slug is one of the four known sectors. */
export function isSectorSlug(slug: string): slug is SectorSlug {
	return (SECTOR_SLUGS as readonly string[]).includes(slug);
}

/**
 * Fetch a sector detail document and map it to the page's section props (Sanity → src).
 * Returns `null` for an unknown slug → the route renders `notFound()`. For a known slug
 * with no Sanity document yet, falls back entirely to the maquette content (SC-007).
 */
export async function getSectorDetailProps(slug: string) {
	if (!isSectorSlug(slug)) return null;
	const defaults = sectorDetailContent[slug];

	const { data: s } = await sanityFetch({
		query: SECTOR_DETAIL_QUERY,
		params: { slug },
	});

	const title = s?.title ?? defaults.title;
	// Shared alt fallback for every content image of this sector.
	const alt = `Estuaire — ${title}`;

	// Constraints + citations: Sanity entries when present, else the maquette list.
	const sanityChips = (s?.contraintes ?? [])
		.filter((c): c is typeof c & { label: string } => Boolean(c.label))
		.map((c) => ({ label: c.label, emphasis: asEmphasis(c.emphasis) }));
	const contraintes: SectorConstraintProps[] = sanityChips.length
		? sanityChips
		: defaults.contraintes;

	const sanityCitations = (s?.citations ?? [])
		.filter((q): q is typeof q & { quote: string } => Boolean(q.quote))
		.map((q) => ({
			quote: q.quote,
			attribution: q.attribution ?? undefined,
			image: mapImage(q.image, 1920, alt),
		}));
	const citations: SectorTestimonialProps[] = sanityCitations.length
		? sanityCitations
		: defaults.citations.map((q) => ({
				quote: q.quote,
				attribution: q.attribution,
				image: undefined,
			}));

	const enjeux = (s?.enjeux ?? []).filter(Boolean);

	return {
		title,
		slug,
		hero: {
			eyebrow: s?.heroEyebrow ?? defaults.heroEyebrow,
			titleOutline: s?.heroTitleOutline ?? defaults.heroTitleOutline,
			titleFill: s?.heroTitleFill ?? defaults.heroTitleFill,
			image: mapImage(s?.heroImage, 1920, alt),
		},
		intro: {
			statement: s?.introStatement ?? defaults.introStatement,
			text: s?.introText ?? defaults.introText,
			imageMain: mapImage(s?.introImageMain, 1000, alt),
			imagePortrait: mapImage(s?.introImagePortrait, 800, alt),
			imageSquare: mapImage(s?.introImageSquare, 600, alt),
		},
		enjeux: {
			titleOutline: s?.enjeuxTitleOutline ?? defaults.enjeuxTitleOutline,
			titleFill: s?.enjeuxTitleFill ?? defaults.enjeuxTitleFill,
			items: enjeux.length ? enjeux : defaults.enjeux,
		},
		contraintes: {
			titleOutline:
				s?.contraintesTitleOutline ?? defaults.contraintesTitleOutline,
			titleFill: s?.contraintesTitleFill ?? defaults.contraintesTitleFill,
			chips: contraintes,
		},
		argument: s?.argument ?? defaults.argument,
		citations,
		seo: {
			metaTitle: s?.seoMetaTitle ?? defaults.seoMetaTitle,
			metaDescription: s?.seoMetaDescription ?? defaults.seoMetaDescription,
			ogImage: mapImage(s?.seoOgImage, 1200, alt),
		},
	};
}

export type SectorDetailProps = NonNullable<
	Awaited<ReturnType<typeof getSectorDetailProps>>
>;
