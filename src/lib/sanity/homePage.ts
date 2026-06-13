import type { SanityImageSource } from "@sanity/image-url";
import { homePageContent } from "@/content/homePage";
import { urlFor } from "./image";
import { sanityFetch } from "./live";
import { HOME_PAGE_QUERY } from "./queries";

// Types derive from the schema via TypeGen (`sanity.types.ts`) — never hand-typed
// (constitution Principle IX). Mirror of `footer.ts`: fetch the singleton, apply the
// maquette defaults (`homePageContent`, single source with the seed), resolve images
// via `urlFor` + LQIP. Page-specific content → fetched by the page connector, not a
// global `src/components/` wrapper (Principle VIII).

/** Structural shape of a projected image (asset/hotspot/crop/alt/lqip). */
type QueryImage =
	| { asset?: unknown; alt?: string | null; lqip?: string | null }
	| null
	| undefined;

/** Resolved image as the design-system components expect it. */
export type ResolvedImage = { src: string; alt: string; blurDataURL?: string };

const DEFAULTS = homePageContent;

/** Map a projected Sanity image to `{ src, alt, blurDataURL }`, or undefined if no asset. */
function mapImage(
	img: QueryImage,
	width: number,
	fallbackAlt = "",
): ResolvedImage | undefined {
	if (!img?.asset) return undefined;
	return {
		src: urlFor(img as SanityImageSource)
			.width(width)
			.auto("format")
			.url(),
		alt: img.alt ?? fallbackAlt,
		blurDataURL: img.lqip ?? undefined,
	};
}

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

	const universSectors: Sector[] = (h?.universSectors ?? [])
		.filter((s): s is Sector => Boolean(s.label && s.href))
		.map((s) => ({ label: s.label, href: s.href }));

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
			ogImage: mapImage(h?.seoOgImage, 1200),
		},
	};
}

export type HomePageProps = Awaited<ReturnType<typeof getHomePageProps>>;
