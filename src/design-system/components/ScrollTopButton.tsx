import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-to-top control (kit « BTN top »). The disc is an ADAPTIVE GRAYSCALE LENS:
 * `backdrop-filter: grayscale + invert + contrast` desaturates, inverts and pushes
 * the contrast of whatever scrolls behind it, **per pixel** — dark over light
 * sections, light over dark, continuous greys in between, with NO colour tint.
 *
 * The ARROW is a knockout WINDOW, not ink: an alpha mask punches the arrow shape out
 * of the disc, so that region shows the RAW page while the disc shows the page
 * INVERTED. Being literal inverses, arrow and disc can never share a tone — the arrow
 * stays legible over ANY uniform backdrop (a solid-coloured arrow can't: white
 * vanishes on the white disc over dark sections, black vanishes on the black disc over
 * light ones, because `backdrop-filter` isolates the disc and kills a child glyph's
 * blend). The mask uses an inner SVG `<mask>` so it works in plain alpha mode (no
 * `mask-mode`), i.e. cross-browser incl. Safari `-webkit-mask`.
 *
 * IMPORTANT — `backdrop-filter` reads the page *behind* the element, so the element
 * carrying it must itself be the `fixed` (page-level) box; a `fixed` wrapper, or
 * putting it on a nested child, would sample an empty box instead. The consumer
 * applies positioning directly to THIS element (see ScrollTopMount). The `transition`
 * covers `opacity` for the consumer's scroll-in fade. Hover is a restrained scale
 * (the brand estuaire-fill hover is incompatible with a single masked element — the
 * mask would knock the white arrow out too; it would need a second overlay layer).
 * Scroll behaviour is wired via `onClick` (e.g. Lenis `scrollTo(0)`).
 *
 * NOTE: neither `backdrop-filter` nor the knockout render in headless screenshots —
 * verify this control's adaptation in a real browser.
 */

// Knockout mask: an opaque disc with the up-arrow shape cut out (transparent). The
// inner <mask> (white = keep, black = cut) yields real alpha, so the default alpha
// mask mode applies it cross-browser. `#` only appears in `url(#a)` and survives
// encodeURIComponent (decoded back before the SVG is parsed).
// The arrow is the design-system glyph's thin line geometry (24-unit chevron + shaft,
// ~2px stroke), scaled to ~28px and centred in the 90-unit disc — same weight/size as
// the brand `Arrow` so the window reads as the kit glyph, not a heavy blob.
const KNOCKOUT_SVG =
	"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 90 90'>" +
	"<defs><mask id='a'>" +
	"<rect width='90' height='90' fill='white'/>" +
	"<path transform='translate(31 31) scale(1.1667)' d='M12 5V19M6 11L12 5L18 11' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>" +
	"</mask></defs>" +
	"<rect width='90' height='90' fill='white' mask='url(#a)'/>" +
	"</svg>";
const KNOCKOUT_MASK = `url("data:image/svg+xml,${encodeURIComponent(KNOCKOUT_SVG)}")`;

export function ScrollTopButton({
	className,
	onClick,
	"aria-label": ariaLabel = "Revenir en haut",
}: {
	className?: string;
	onClick?: ComponentProps<"button">["onClick"];
	"aria-label"?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={ariaLabel}
			style={{
				maskImage: KNOCKOUT_MASK,
				WebkitMaskImage: KNOCKOUT_MASK,
				maskSize: "100% 100%",
				WebkitMaskSize: "100% 100%",
				maskRepeat: "no-repeat",
				WebkitMaskRepeat: "no-repeat",
			}}
			className={cn(
				"size-[105px] rounded-full backdrop-grayscale backdrop-invert backdrop-contrast-150 transition-[transform,opacity] duration-300 hover:scale-105 focus-visible:scale-105 focus-visible:outline-none",
				className,
			)}
		/>
	);
}
