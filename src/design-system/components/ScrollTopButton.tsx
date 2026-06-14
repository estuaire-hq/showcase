import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Arrow } from "./Arrow";

/**
 * Scroll-to-top control (kit « BTN top »). The disc is an ADAPTIVE GRAYSCALE LENS:
 * `backdrop-filter: grayscale + invert + contrast` desaturates, inverts and pushes
 * the contrast of whatever scrolls behind it, **per pixel** — so the button reads
 * dark over light sections, light over dark, and continuous greys (driven by the
 * local contrast) in between, with NO colour tint. This fixes the two weaknesses of
 * a raw `mix-blend-difference`: it would turn orange over the brand blue and
 * collapse to grey over a mid-grey backdrop. The arrow rides on top in white with
 * `mix-blend-difference`, so it auto-contrasts against the lens. On hover/focus the
 * lens switches off (`backdrop-filter-none`) and the brand estuaire disc fills in.
 *
 * IMPORTANT — `backdrop-filter` reads the page *behind* the element, so the element
 * carrying it must itself be the `fixed` (page-level) box; a `fixed` wrapper would
 * sample its own empty box instead. The consumer therefore applies positioning
 * directly to THIS element — no intermediate wrapper (see ScrollTopMount). The
 * `transition` also covers `opacity` for the consumer's scroll-in fade. Scroll
 * behaviour is wired via `onClick` (e.g. Lenis `scrollTo(0)`).
 *
 * NOTE: `backdrop-filter` does not render in headless screenshots — verify this
 * control's adaptation in a real browser.
 */
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
			className={cn(
				"group inline-flex size-[105px] items-center justify-center rounded-full backdrop-grayscale backdrop-invert backdrop-contrast-150 transition-[background-color,box-shadow,opacity] duration-300 hover:bg-estuaire hover:ring-2 hover:ring-estuaire hover:ring-inset hover:backdrop-filter-none focus-visible:bg-estuaire focus-visible:ring-2 focus-visible:ring-estuaire focus-visible:ring-inset focus-visible:outline-none focus-visible:backdrop-filter-none",
				className,
			)}
		>
			<Arrow
				direction="up"
				className="size-7 text-paper mix-blend-difference group-hover:mix-blend-normal group-focus-visible:mix-blend-normal"
			/>
		</button>
	);
}
