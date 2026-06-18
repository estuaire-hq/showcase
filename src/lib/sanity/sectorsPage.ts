import { sectorsPageContent } from "@/content/sectorsPage";
import { sanityFetch } from "./live";
import { mapImage, type ResolvedImage } from "./mapImage";
import { SECTORS_PAGE_QUERY } from "./queries";

// Types derive from the schema via TypeGen (`sanity.types.ts`) — never hand-typed
// (constitution Principle IX). Mirror of `aboutPage.ts`: fetch the singleton, apply the
// maquette defaults (`sectorsPageContent`, single source with the seed), resolve images
// via the shared `mapImage` (`urlFor` + LQIP). « Univers » is page-specific content →
// fetched by the page connector, not a global `src/components/` wrapper (Principle VIII).

const DEFAULTS = sectorsPageContent;

export type SectorProps = {
	label: string;
	promise: string;
	href: string;
	image: ResolvedImage | undefined;
};

export type KeyFigureProps = { value: string; support: string };

/** Fetch the sectorsPage singleton and map it to the page's section props (Sanity → src). */
export async function getSectorsPageProps() {
	const { data: s } = await sanityFetch({ query: SECTORS_PAGE_QUERY });

	// Sectors: Sanity entries (with images) when present, else the maquette text sectors
	// as a fallback (image-less — each band degrades to its dark veil + text; images
	// arrive once the singleton is seeded). Filter on the required `label`, repli by index.
	const sanitySectors = (s?.sectors ?? [])
		.filter((sec): sec is typeof sec & { label: string } => Boolean(sec.label))
		.map((sec, i) => {
			const def = DEFAULTS.sectors[i];
			const label = sec.label;
			return {
				label,
				promise: sec.promise ?? def?.promise ?? "",
				href: sec.href ?? def?.href ?? "#",
				image: mapImage(sec.image, 1920, `Estuaire — ${label}`),
			};
		});
	const sectors: SectorProps[] = sanitySectors.length
		? sanitySectors
		: DEFAULTS.sectors.map((sec) => ({
				label: sec.label,
				promise: sec.promise,
				href: sec.href,
				image: undefined,
			}));

	// Key figures: same pattern, filtered on the required `value`.
	const sanityFigures = (s?.keyFigures ?? [])
		.filter((kf): kf is typeof kf & { value: string } => Boolean(kf.value))
		.map((kf, i) => ({
			value: kf.value,
			support: kf.support ?? DEFAULTS.keyFigures[i]?.support ?? "",
		}));
	const keyFigures: KeyFigureProps[] = sanityFigures.length
		? sanityFigures
		: DEFAULTS.keyFigures.map((kf) => ({
				value: kf.value,
				support: kf.support,
			}));

	return {
		hero: {
			eyebrow: s?.heroEyebrow ?? DEFAULTS.heroEyebrow,
			titleOutline: s?.heroTitleOutline ?? DEFAULTS.heroTitleOutline,
			titleFill: s?.heroTitleFill ?? DEFAULTS.heroTitleFill,
			image: mapImage(s?.heroImage, 1920, "Estuaire — agencement sur mesure"),
		},
		intro: {
			statement: s?.introStatement ?? DEFAULTS.introStatement,
			text: s?.introText ?? DEFAULTS.introText,
			image: mapImage(
				s?.introImage,
				1000,
				"Estuaire — univers multisectoriels",
			),
		},
		sectors,
		keyFigures,
		seo: {
			metaTitle: s?.seoMetaTitle ?? DEFAULTS.seoMetaTitle,
			metaDescription: s?.seoMetaDescription ?? DEFAULTS.seoMetaDescription,
			// OG image projects no `lqip` (no blur placeholder for a share image) — mapImage
			// handles its absence via the optional `lqip`.
			ogImage: mapImage(s?.seoOgImage, 1200, "Estuaire — Univers"),
		},
	};
}

export type SectorsPageProps = Awaited<ReturnType<typeof getSectorsPageProps>>;
