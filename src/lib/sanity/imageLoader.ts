import type { ImageLoaderProps } from "next/image";

/**
 * Custom next/image loader that lets the Sanity image CDN be the optimizer.
 *
 * A `loader: "custom"` in next.config makes next/image build its `srcset`
 * candidates from THIS function instead of proxying through `/_next/image`.
 * The browser then fetches `cdn.sanity.io` directly at the exact width it needs
 * (no double re-encode, no work on the VPS). next/image keeps owning the
 * responsive `srcset` / `sizes` / `priority` / LQIP logic.
 *
 * Why not the built-in optimizer: it re-encoded an already-capped `?w=1920`
 * Sanity URL, so every hero was starved to ≤1920px and softened by a second
 * lossy pass — blurry on wide/retina screens even though the uploaded sources
 * are 2048–7008px wide. See the hero-image-quality investigation.
 *
 * - Non-Sanity `src` (e.g. the temporary /lab static images) → served as-is.
 * - `w` is clamped to the source's intrinsic width, read from the Sanity URL
 *   filename (`…-<W>x<H>.<ext>`), so a small source is never upscaled (which
 *   would waste bytes and re-soften the image).
 * - `auto=format` → WebP where the browser supports it (Sanity has no AVIF).
 * - Existing params set upstream (e.g. `fit=crop` on the footer CTA) are kept.
 */
const SANITY_CDN_PREFIX = "https://cdn.sanity.io/";
/** Single source of truth for Sanity delivery quality (single pass, no stacking). */
const DELIVERY_QUALITY = 80;

export default function sanityImageLoader({
	src,
	width,
	quality,
}: ImageLoaderProps): string {
	if (!src.startsWith(SANITY_CDN_PREFIX)) return src;

	const url = new URL(src);
	const dims = url.pathname.match(/-(\d+)x\d+\.\w+$/);
	const sourceWidth = dims ? Number(dims[1]) : Number.POSITIVE_INFINITY;

	url.searchParams.set("w", String(Math.min(width, sourceWidth)));
	url.searchParams.set("q", String(quality ?? DELIVERY_QUALITY));
	url.searchParams.set("auto", "format");
	return url.toString();
}
