import { homePageContent } from "@/content/homePage";
import { sanityFetch } from "./live";
import { mapImage } from "./mapImage";
import { HOME_PAGE_QUERY } from "./queries";

// Types derive from the schema via TypeGen (`sanity.types.ts`) — never hand-typed
// (constitution Principle IX). Mirror of `footer.ts`: fetch the singleton, apply the
// maquette defaults (`homePageContent`, single source with the seed), resolve images
// via the shared `mapImage` (`urlFor` + LQIP). Page-specific content → fetched by the
// page connector, not a global `src/components/` wrapper (Principle VIII).

/** Resolved image as the design-system components expect it. Re-exported for callers
 *  that imported it from here before `mapImage` was extracted. */
export type { ResolvedImage } from "./mapImage";

const DEFAULTS = homePageContent;

type Sector = { label: string; href: string };

/** Fetch the homePage singleton and map it to the page's section props (Sanity → src). */
export async function getHomePageProps() {
	const { data: h } = await sanityFetch({ query: HOME_PAGE_QUERY });

	const label = h?.heroLabel ?? DEFAULTS.heroLabel;

	// Hero slides: Sanity slides (with images) when present, else the maquette text
	// slides as a fallback (image-less — the hero degrades to its dark panel + title;
	// images arrive once the singleton is seeded). At least one slide always (FR-002).
	const sanitySlides = (h?.heroSlides ?? []).map((s, i) => {
		const fill = s.titleFill ?? DEFAULTS.heroSlides[i]?.titleFill ?? "";
		const image = mapImage(s.image, 1600, `${label} — ${fill}`);
		return {
			titleOutline:
				s.titleOutline ?? DEFAULTS.heroSlides[i]?.titleOutline ?? "",
			titleFill: fill,
			src: image?.src,
			alt: image?.alt ?? `${label} — ${fill}`,
			blurDataURL: image?.blurDataURL,
		};
	});
	const slides = sanitySlides.length
		? sanitySlides
		: DEFAULTS.heroSlides.map((s) => ({
				titleOutline: s.titleOutline,
				titleFill: s.titleFill,
				src: undefined,
				alt: `${label} — ${s.titleFill}`,
				blurDataURL: undefined,
			}));

	// The type predicate already narrows each entry to `Sector` (non-null label + href),
	// so no extra `.map` is needed (mirrors `footer.ts`).
	const universSectors = (h?.universSectors ?? []).filter((s): s is Sector =>
		Boolean(s.label && s.href),
	);

	return {
		hero: { label, slides },
		intro: {
			titleOutline: h?.introTitleOutline ?? DEFAULTS.introTitleOutline,
			titleFill: h?.introTitleFill ?? DEFAULTS.introTitleFill,
			text: h?.introText ?? DEFAULTS.introText,
			imagePrimary: mapImage(h?.introImagePrimary, 1200),
			imageSecondary: mapImage(h?.introImageSecondary, 900),
		},
		expertises: {
			titleOutline:
				h?.expertisesTitleOutline ?? DEFAULTS.expertisesTitleOutline,
			titleFill: h?.expertisesTitleFill ?? DEFAULTS.expertisesTitleFill,
			text: h?.expertisesText ?? DEFAULTS.expertisesText,
			image: mapImage(h?.expertisesImage, 900),
			cta: {
				label: h?.expertisesCtaLabel ?? DEFAULTS.expertisesCtaLabel,
				href: h?.expertisesCtaHref ?? DEFAULTS.expertisesCtaHref,
			},
		},
		universSectors: universSectors.length
			? universSectors
			: DEFAULTS.universSectors,
		realisations: {
			titleOutline:
				h?.realisationsTitleOutline ?? DEFAULTS.realisationsTitleOutline,
			titleFill: h?.realisationsTitleFill ?? DEFAULTS.realisationsTitleFill,
			cta: {
				label: h?.realisationsCtaLabel ?? DEFAULTS.realisationsCtaLabel,
				href: h?.realisationsCtaHref ?? DEFAULTS.realisationsCtaHref,
			},
		},
		vision: {
			titleOutline: h?.visionTitleOutline ?? DEFAULTS.visionTitleOutline,
			titleFill: h?.visionTitleFill ?? DEFAULTS.visionTitleFill,
			text: h?.visionText ?? DEFAULTS.visionText,
			image: mapImage(h?.visionImage, 900),
			cta: {
				label: h?.visionCtaLabel ?? DEFAULTS.visionCtaLabel,
				href: h?.visionCtaHref ?? DEFAULTS.visionCtaHref,
			},
		},
		seo: {
			metaTitle: h?.seoMetaTitle ?? DEFAULTS.seoMetaTitle,
			metaDescription: h?.seoMetaDescription ?? DEFAULTS.seoMetaDescription,
			// OG image projects no `lqip` (no blur placeholder for a share image) — mapImage
			// handles its absence via the optional `lqip`.
			ogImage: mapImage(h?.seoOgImage, 1200),
		},
	};
}

export type HomePageProps = Awaited<ReturnType<typeof getHomePageProps>>;
