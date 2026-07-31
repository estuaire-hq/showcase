/**
 * Delivery hint carried inside an image `src` and consumed by the Sanity image loader.
 *
 * WHY: measured on prod, Sanity's CDN resampler yields ~25% less high-frequency detail
 * than a lanczos3 downscale of the SAME source at the same width, codec and byte budget
 * (72–77% across four assets and reduction factors from /1.6 to /4.3). The CDN exposes no
 * sharpening lever — `sharpen` is silently ignored, byte-for-byte. The only way to recover
 * that detail is to ask the CDN for MORE pixels than the layout needs, so the LAST resize
 * before the screen is the browser's (which is sharp) instead of Sanity's. See ADR 0027.
 *
 * Full-bleed visuals opt in per component: `<Image src={oversampled(src)} …>`. It stays a
 * plain query param, deliberately Sanity-agnostic, so a design-system component can mark a
 * visual without importing anything from `@/lib/sanity` (Principle VIII). The loader reads
 * it and strips it, so it never reaches the network.
 */
const OVERSAMPLE_PARAM = "x-oversample";

/** The exact hint `oversampled` appends — matched and removed by the loader. */
export const OVERSAMPLE_HINT = `${OVERSAMPLE_PARAM}=1`;

/** Mark `src` so the loader requests ~2× the pixels the layout asks for. */
export function oversampled(src: string): string {
	return `${src}${src.includes("?") ? "&" : "?"}${OVERSAMPLE_HINT}`;
}

/** Drop the hint again (it is a client-side marker, never a CDN parameter). */
export function withoutOversampleHint(src: string): string {
	return src
		.replace(`?${OVERSAMPLE_HINT}`, "")
		.replace(`&${OVERSAMPLE_HINT}`, "");
}
