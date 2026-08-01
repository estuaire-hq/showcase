// Shared navigation vocabulary for the nav design-system components (SiteHeader,
// MenuToggle, NavPanel) and the sticky hook. Kept in its own leaf module (no imports)
// so both the DS components and `@/lib/motion/useStickyNav` can reference one source of
// truth without a circular import — `SiteHeader` renders `MenuToggle`, so a runtime
// value (the tone→class map) could not live in `SiteHeader` and be imported back.

/** Contrast axis for the "ghost" slots (logo, links, toggle) over the transparent header. */
export type NavTone = "onLight" | "onDark";

/** Visual state machine of the sticky bar (data-model §2). */
export type NavState = "top" | "hidden" | "pinned";

/** Rest colour of the filled "contact" pill. `paper` is the measured-dark case only
 *  (both kit tones are dark). See `ContactButton`. */
export type CtaTone = "bleu" | "noir" | "paper";

/** Tone → text colour for the ghost slots; the icons/logo paint in `currentColor`. */
export const TONE_TEXT_CLASS: Record<NavTone, string> = {
	onLight: "text-ink",
	onDark: "text-paper",
};

// ---------------------------------------------------------------------------
// Measured tone (ADR 0029): the strip a transparent bar floats over is sampled
// server-side from the hero's LQIP (`@/lib/nav/luminance`), emitted on the page as
// `data-nav-band-*`, and each slot resolves its own tone from the columns it covers.
// These helpers are pure so both sides can use them: the page for its server-rendered
// initial value, the `Navbar` wrapper for the per-slot refinement after hydration.
// ---------------------------------------------------------------------------

/** Columns a sampled header band is divided into, left → right across the viewport. */
export const BAND_COLUMNS = 32;

/** Sampled luminances (0-255, BT.709) of the header strip, one per column. */
export type HeaderBand = number[];

/**
 * Luminance where `paper` and `ink` contrast EQUALLY against the background (WCAG 2.1
 * relative luminance, treating the sampled value as a neutral sRGB grey). Picking the
 * side the measure falls on therefore guarantees at least 4.34:1, well over the
 * 3:1 that SC 1.4.11 asks of graphical objects, and effectively at the 4.5:1 of text.
 *
 * It is a derived constant, not a taste setting: it is the fixed point of
 * `contrast(paper, L) === contrast(ink, L)` for `--color-paper` #ffffff and
 * `--color-ink` #0e1215. Recompute it if either token changes.
 */
export const TONE_THRESHOLD = 121;

/** Serialise a band for a `data-` attribute (plain CSV, stays readable when debugging). */
export function encodeHeaderBand(band: HeaderBand): string {
	return band.join(",");
}

/** Parse a `data-nav-band-*` attribute; `undefined` for absent or malformed input. */
export function decodeHeaderBand(
	value: string | null | undefined,
): HeaderBand | undefined {
	if (!value) return undefined;
	const band = value.split(",").map(Number);
	if (band.length !== BAND_COLUMNS || band.some((n) => !Number.isFinite(n))) {
		return undefined;
	}
	return band;
}

/**
 * Decide a slot's tone from luminances sampled across its box, whatever their source: the
 * hero's sampled band (a photo) or the painted page background (a solid panel).
 *
 * The mean is the criterion, since it is what maximises contrast over the whole box. Nothing
 * else is added: an opaque fill and a drop-shadow halo were both tried for the boxes whose
 * strip is not uniform, and both were REMOVED on the owner's call (they read as a button and
 * as a shadow). The bar therefore carries the bare-text look of « Nous découvrir » on every
 * page, and where a label straddles a hard ink/paper seam the fraction on the wrong side
 * stays weak: no text colour can serve both halves. Removing that case means keeping the
 * pills clear of the seam, which is a layout change (ADR 0029).
 */
export function resolveToneFromSamples(samples: number[]): NavTone {
	const mean = samples.reduce((sum, n) => sum + n, 0) / samples.length;
	return mean > TONE_THRESHOLD ? "onLight" : "onDark";
}

/**
 * Resolve the tone for the horizontal span `[from, to]` (fractions of the viewport width)
 * of a sampled band.
 */
export function resolveToneFromBand(
	band: HeaderBand,
	from: number,
	to: number,
): NavTone {
	const first = Math.max(
		0,
		Math.min(band.length - 1, Math.floor(from * band.length)),
	);
	const last = Math.max(
		first,
		Math.min(band.length - 1, Math.ceil(to * band.length) - 1),
	);
	return resolveToneFromSamples(band.slice(first, last + 1));
}
