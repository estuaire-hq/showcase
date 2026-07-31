import "server-only";
import sharp from "sharp";
import {
	BAND_COLUMNS,
	encodeHeaderBand,
	type HeaderBand,
} from "@/design-system/nav";

/**
 * Server-side luminance sampling of the strip a transparent navbar floats over.
 *
 * Why this exists: the navbar's per-slot tone used to be a CONSTANT copied off the
 * Figma frame (`data-nav-logo-tone="onDark"` etc.). That is only correct as long as the
 * hero image matches the one the maquette was drawn on. On « Nous découvrir » the
 * editorial image was replaced by a wider crop of the same shot, the dark timber rack
 * left the frame, and the white logo dropped to 1.44:1 against the white workshop wall
 * (WCAG 2.2 SC 1.4.11 asks 3:1). Measuring the actual content instead of trusting the
 * maquette is the fix, see ADR 0029.
 *
 * The measurement is free: every hero image is already fetched with its LQIP
 * (`metadata.lqip`, see `@/lib/sanity/mapImage`), a ~400-byte JPEG thumbnail that is a
 * blur of the full image. Decoding it costs no network request and no client JS, so the
 * resolved tone is server-rendered and never flashes. Validated against full-resolution
 * pixel measurements on six page/breakpoint cases: the LQIP lands within -15/+30 of the
 * truth and every binary verdict matched.
 *
 * `sharp` does the decode AND reproduces `object-cover` natively (`fit: "cover"`), so the
 * sampled region is exactly what the browser paints under the bar.
 */

/** Internal sampling width. 4 source pixels per emitted column, finer than the LQIP
 *  itself, which is a blur anyway, so the upscale invents nothing. */
const SAMPLE_WIDTH = 128;

/** Geometry of the strip to sample: the hero's aspect ratio and the bar over it. */
export type BandGeometry = {
	/** Hero container aspect ratio (width / height) at this breakpoint. */
	aspect: number;
	/** Navbar height in CSS px at this breakpoint. */
	barHeight: number;
	/** Viewport width the hero is measured at (the breakpoint's reference width). */
	referenceWidth: number;
	/** Opacity of the ink veil `PageHero` paints over the image at this breakpoint. It
	 *  darkens what the bar actually sits on, so the sample must composite it, measuring
	 *  the bare photo would resolve against a lighter strip than the one on screen. */
	veilAlpha?: number;
};

/** Ink veil opacity per breakpoint, mirroring `PageHero`'s `imageOverlayClassName`. */
export type HeroVeil = { sm: number; md: number; lg: number };

/** `PageHero`'s default veil: mobile only (`bg-ink/25 md:hidden`), « Nous découvrir »,
 *  « Expertises ». */
export const DEFAULT_HERO_VEIL: HeroVeil = { sm: 0.25, md: 0, lg: 0 };

/** The expertise sub-pages veil tablet and desktop instead (`bg-ink/25 hidden md:block`). */
export const TABLET_UP_HERO_VEIL: HeroVeil = { sm: 0, md: 0.25, lg: 0.25 };

/** Luminance of `--color-ink` (#0e1215), the veil's colour. */
const INK_LUMINANCE = 0.2126 * 14 + 0.7152 * 18 + 0.0722 * 21;

/**
 * The three breakpoints of a full-bleed `PageHero`, matching its Tailwind classes:
 * `aspect-[390/259] md:aspect-[768/377] lg:aspect-[1920/943]` and the bar's
 * `h-20 lg:h-28`.
 *
 * Each band is sampled at its breakpoint's REFERENCE width, not at every possible
 * viewport width: the hero is full-bleed, so the bar covers a taller fraction of it on a
 * narrow desktop (22% at 1024px, 12% at 1920px). Sampling one reference width per
 * breakpoint keeps the payload to three short strings, and the resulting imprecision is
 * smaller than the LQIP's own error, which the undecidable band already absorbs.
 */
export const PAGE_HERO_GEOMETRY: Record<"sm" | "md" | "lg", BandGeometry> = {
	sm: { aspect: 390 / 259, barHeight: 80, referenceWidth: 390 },
	md: { aspect: 768 / 377, barHeight: 80, referenceWidth: 768 },
	lg: { aspect: 1920 / 943, barHeight: 112, referenceWidth: 1920 },
};

/** ITU-R BT.709 relative luminance of an sRGB triplet, on the 0-255 scale. */
function luminance(r: number, g: number, b: number): number {
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Sample one header band from an LQIP data URI. Returns `undefined` when there is no
 * image to measure (unseeded content), so the caller falls back to its declared tone.
 */
export async function sampleHeaderBand(
	lqip: string | null | undefined,
	geometry: BandGeometry,
): Promise<HeaderBand | undefined> {
	const base64 = lqip?.split(",", 2)[1];
	if (!base64) return undefined;

	const height = Math.max(
		1,
		Math.round(SAMPLE_WIDTH / Math.max(geometry.aspect, 0.01)),
	);
	// `fit: "cover"` + centre position IS `object-fit: cover`, same crop the browser makes.
	const { data, info } = await sharp(Buffer.from(base64, "base64"))
		.resize(SAMPLE_WIDTH, height, { fit: "cover", position: "centre" })
		.removeAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	// The bar covers `barHeight / heroHeight` of the container, and the hero is full-bleed
	// so its height is `referenceWidth / aspect`.
	const heroHeight = geometry.referenceWidth / geometry.aspect;
	const bandRows = Math.max(
		1,
		Math.min(
			info.height,
			Math.round((geometry.barHeight / heroHeight) * info.height),
		),
	);
	const columnWidth = info.width / BAND_COLUMNS;
	const channels = info.channels;
	const veil = geometry.veilAlpha ?? 0;

	return Array.from({ length: BAND_COLUMNS }, (_, column) => {
		const from = Math.floor(column * columnWidth);
		const to = Math.max(from + 1, Math.floor((column + 1) * columnWidth));
		let total = 0;
		let count = 0;
		for (let y = 0; y < bandRows; y++) {
			for (let x = from; x < to; x++) {
				const i = (y * info.width + x) * channels;
				total += luminance(data[i], data[i + 1], data[i + 2]);
				count++;
			}
		}
		const mean = total / count;
		return Math.round(veil * INK_LUMINANCE + (1 - veil) * mean);
	});
}

/**
 * The `data-nav-band-*` attributes a page with a full-bleed `PageHero` spreads on the
 * element that declares its nav tones. Spread it, don't hand-write the attribute names:
 * they are the contract `useMeasuredTones` reads.
 *
 * A page whose hero image is unset emits nothing, and the navbar keeps that page's
 * declared tones, the same graceful degradation as the rest of the content pipeline.
 */
export async function pageHeroBandAttributes(
	lqip: string | null | undefined,
	veil: HeroVeil = DEFAULT_HERO_VEIL,
) {
	const [sm, md, lg] = await Promise.all([
		sampleHeaderBand(lqip, { ...PAGE_HERO_GEOMETRY.sm, veilAlpha: veil.sm }),
		sampleHeaderBand(lqip, { ...PAGE_HERO_GEOMETRY.md, veilAlpha: veil.md }),
		sampleHeaderBand(lqip, { ...PAGE_HERO_GEOMETRY.lg, veilAlpha: veil.lg }),
	]);
	return {
		"data-nav-band-sm": sm && encodeHeaderBand(sm),
		"data-nav-band-md": md && encodeHeaderBand(md),
		"data-nav-band-lg": lg && encodeHeaderBand(lg),
	};
}
