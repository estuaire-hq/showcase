import type { SanityImageSource } from "@sanity/image-url";
import { homePageContent } from "@/content/homePage";
import type { SanityImageAssetReference } from "@/sanity.types";
import { urlFor } from "./image";
import { sanityFetch } from "./live";
import { HOME_PAGE_QUERY } from "./queries";

// Types derive from the schema via TypeGen (`sanity.types.ts`) — never hand-typed
// (constitution Principle IX). Mirror of `footer.ts`: fetch the singleton, apply the
// maquette defaults (`homePageContent`, single source with the seed), resolve images
// via `urlFor` + LQIP. Page-specific content → fetched by the page connector, not a
// global `src/components/` wrapper (Principle VIII).

/** The accessor shape `mapImage` needs across every projected image: full content images
 *  carry `lqip`, the OG image omits it (no blur placeholder needed). `asset` is the
 *  generated reference type — not `unknown` — so this is the canonical shape, not a loose
 *  duplicate of the schema. */
type QueryImage =
	| {
			asset: SanityImageAssetReference | null;
			alt?: string | null;
			lqip?: string | null;
	  }
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
	// Guards a missing asset, NOT a dangling ref (asset present but its document deleted):
	// urlFor would then build a URL that 404s. Acceptable — the common case is no asset.
	if (!img?.asset) return undefined;
	return {
		// Cast as in footer.ts: the projection is a valid image source at runtime, but its
		// generated type is not structurally `SanityImageSource`.
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
	const trunk = h?.heroTrunk ?? DEFAULTS.heroTrunk;

	// The slide alt doubles as the spoken title — `${label} ${trunk} ${keyword}` reads
	// as the full headline (e.g. "Estuaire, là où les idées prennent forme"), good a11y.
	const slideAlt = (keyword: string) => `${label} ${trunk} ${keyword}`.trim();

	// Hero slides: Sanity slides (with images) when present, else the maquette keyword
	// slides as a fallback (image-less — the hero degrades to its dark panel + title;
	// images arrive once the singleton is seeded). At least one slide always (FR-002).
	const sanitySlides = (h?.heroSlides ?? []).map((s, i) => {
		const keyword = s.keyword ?? DEFAULTS.heroSlides[i]?.keyword ?? "";
		const image = mapImage(s.image, 1600, slideAlt(keyword));
		return {
			keyword,
			src: image?.src,
			alt: image?.alt ?? slideAlt(keyword),
			blurDataURL: image?.blurDataURL,
		};
	});
	const slides = sanitySlides.length
		? sanitySlides
		: DEFAULTS.heroSlides.map((s) => ({
				keyword: s.keyword,
				src: undefined,
				alt: slideAlt(s.keyword),
				blurDataURL: undefined,
			}));

	// The type predicate already narrows each entry to `Sector` (non-null label + href),
	// so no extra `.map` is needed (mirrors `footer.ts`).
	const universSectors = (h?.universSectors ?? []).filter((s): s is Sector =>
		Boolean(s.label && s.href),
	);

	return {
		hero: { label, trunk, slides },
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
