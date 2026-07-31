/**
 * The ONE behaviour shared by every full-bleed « bandeau-lien » of the site — the
 * réalisations bands (home + portfolio), the sector bands (univers) and the level cards
 * (expertises) — plus the portfolio grid cards, which are not bands but carry the same
 * hover. Kept here, in one place, because the client's grievance was precisely that each
 * page did its own thing (revue 2026-07-31). Pages must never restate these values.
 *
 * HOVER (ADR 0021 addendum, « désaturation »): at rest the image is desaturated and sits
 * under a DEEPER veil than the maquette; on hover it returns to full colour and to the
 * maquette's own 25% ink veil. Two properties matter:
 *
 *  - No blur and no zoom. The Figma kit's survol is a LAYER_BLUR 15 on the image
 *    (nodes 75:3691 / 75:3703) and the code had also invented a `scale-105`. The client
 *    rejected both (« le flou plus le zoom, c'est vraiment pas beau »), so this is a
 *    deliberate, validated departure from the maquette.
 *  - It cannot cost sharpness. Nothing here scales the image, so the painted box never
 *    exceeds the width actually requested from the Sanity CDN — where the old static
 *    `scale-105` painted 2016px from a 1920px request, this paints 1920 (ADR 0027).
 *
 * CONTRAST: the hover state IS the maquette's 25% veil and the rest state is darker, so
 * the overlaid white title is never *less* readable than the maquette at any point of the
 * transition. The deviation sits at rest, where extra veil only helps.
 *
 * REDUCED MOTION is deliberately not neutralised here: a colour/filter cross-fade is not
 * vestibular motion (ADR 0021 treats `motion-reduce` as being about movement). The band's
 * scroll parallax IS motion and is switched off by the `Parallax` driver instead.
 */

/**
 * Rest → hover filter on the band image. Requires `group` on the band root.
 *
 * Deepened from `.3` to `.2` (Pierre, 2026-07-31: « il faut un petit truc en plus que la
 * désaturation […] pour marquer plus la différence ») — the gap between the two states was
 * reading too faintly.
 */
export const BAND_IMAGE_HOVER =
	"saturate-[.2] transition-[filter] duration-500 ease-out group-hover:saturate-100";

/** The maquette's constant ink veil (kit Rectangle 397 = ink @ 0.253). */
export const BAND_VEIL = "bg-ink/25";

/**
 * The extra veil carried at rest only, lifted on hover. Sits above `BAND_VEIL`, so the
 * composite at rest is `1 − 0.75 × (1 − a)`: with `a = 0.32` the band rests at ≈49% ink and
 * hovers back to the maquette's 25%. This is the second half of the same 2026-07-31 note —
 * the veil is what carries the « différence », the desaturation alone was too quiet.
 * Deepening the REST state (never the hover one) is also why the overlaid white title can
 * only gain contrast here.
 */
export const BAND_VEIL_REST =
	"bg-ink/32 transition-opacity duration-500 ease-out group-hover:opacity-0";

/**
 * Vertical bleed of the band's image layer, as a % of the band height, and the matching
 * `data-parallax` amplitude (a yPercent of the LAYER, which is `1 + 2×bleed` taller than
 * the band). The travel `amp × 1.16` stays under the bleed, so the drift can never expose
 * an edge. Kept at the value the home already shipped (Pierre, 2026-07-31: « actuelle,
 * 8% ») — now applied to EVERY band, where before only the home had any scroll motion.
 *
 * A taller layer costs no width: at `object-cover` on a wide band the image is sized by
 * the width, so the extra height is taken out of the source's vertical slack.
 */
export const BAND_BLEED = "-inset-y-[8%]";
export const BAND_PARALLAX = 6;
