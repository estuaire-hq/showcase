import type { ImageLoaderProps } from "next/image";
import { OVERSAMPLE_HINT, withoutOversampleHint } from "@/lib/images";

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
 *   would waste bytes and re-soften the image). CAVEAT: those filename dimensions
 *   are the UPLOAD's, not necessarily the stored file's — the « Nous découvrir »
 *   hero is named `-13252x8834` but the CDN origin is 8192px wide. The clamp is
 *   therefore an upper bound, not an exact intrinsic width.
 * - `auto=format` → AVIF where the browser supports it, else WebP. The AVIF encode
 *   is LAZY: a cold rendition answers in WebP and the same URL answers in AVIF once
 *   warm, so first-visitor bytes are higher than steady state. (`fm=avif` is rejected
 *   with a 400 — only `auto=format` negotiates it.)
 * - Existing params set upstream (e.g. `fit=crop` on the footer CTA) are kept.
 * - Oversampling: a `src` marked by `oversampled()` asks for ~2× the layout width so
 *   the browser, not the CDN, performs the last resize. See `@/lib/images` for why.
 */
const SANITY_CDN_PREFIX = "https://cdn.sanity.io/";
/** Single source of truth for Sanity delivery quality (single pass, no stacking). */
const DELIVERY_QUALITY = 80;
/** Oversampling factor and its 4K ceiling (the widest `deviceSizes` candidate). */
const OVERSAMPLE_FACTOR = 2;
const OVERSAMPLE_CEILING = 3840;
/** Below this candidate width, oversampling is not worth the bytes: those candidates
 *  serve phones, which are DPR 2+ — their pixel density already hides the CDN's soft
 *  resize, so they would pay ~3× the bytes for detail the eye cannot resolve. */
const OVERSAMPLE_FROM = 1024;
/** Oversampled renditions ship at a lower `q`: extra PIXELS buy back more perceived
 *  sharpness than extra per-pixel quality does. Measured on the « Nous découvrir » hero
 *  at 1920 DPR 1 (painted pixels, vs an achievable lanczos3 ceiling):
 *    w=1920 q=80 → 117 KB / 65%   ← before
 *    w=2560 q=80 → 190 KB / 71%
 *    w=3840 q=60 → 178 KB / 76%   ← chosen: +11 points for +61 KB
 *    w=3840 q=80 → 311 KB / 79% */
const OVERSAMPLE_QUALITY = 60;

export default function sanityImageLoader({
	src,
	width,
	quality,
}: ImageLoaderProps): string {
	const wantsOversample = src.includes(OVERSAMPLE_HINT);
	const cleanSrc = wantsOversample ? withoutOversampleHint(src) : src;
	if (!cleanSrc.startsWith(SANITY_CDN_PREFIX)) return cleanSrc;

	const url = new URL(cleanSrc);
	const dims = url.pathname.match(/-(\d+)x\d+\.\w+$/);
	const sourceWidth = dims ? Number(dims[1]) : Number.POSITIVE_INFINITY;

	const target =
		wantsOversample && width >= OVERSAMPLE_FROM
			? Math.min(width * OVERSAMPLE_FACTOR, OVERSAMPLE_CEILING)
			: width;
	const deliveredWidth = Math.min(target, sourceWidth);
	// Only drop `q` when the extra pixels actually materialised — a source too small to
	// oversample (the 551px « univers » bands) must keep the full per-pixel quality.
	const oversampling = deliveredWidth > width;

	url.searchParams.set("w", String(deliveredWidth));
	url.searchParams.set(
		"q",
		String(quality ?? (oversampling ? OVERSAMPLE_QUALITY : DELIVERY_QUALITY)),
	);
	url.searchParams.set("auto", "format");
	return url.toString();
}
