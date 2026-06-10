import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Arrow } from "./Arrow";

/**
 * Carousel / slider navigation arrow (kit « left/right arrow » blanc/noir).
 * `tone` sets the colour for light vs dark backgrounds; `disabled` fades it
 * (paper → 25%, ink → the disabled grey) as the kit's "vide" state. Hover
 * nudges the arrow and tints it estuaire.
 *
 * NOTE: reuses the line-arrow glyph (square) rather than the kit's tall 35×61
 * solid arrow — refine if a closer match is needed.
 */
export function CarouselArrow({
	direction,
	tone = "noir",
	disabled = false,
	className,
	onClick,
	"aria-label": ariaLabel,
}: {
	direction: "left" | "right";
	tone?: "blanc" | "noir";
	disabled?: boolean;
	className?: string;
	onClick?: ComponentProps<"button">["onClick"];
	"aria-label"?: string;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			aria-label={ariaLabel ?? (direction === "left" ? "Précédent" : "Suivant")}
			className={cn(
				"inline-flex size-[61px] items-center justify-center transition-[color,transform] duration-300 focus-visible:outline-none",
				tone === "blanc" ? "text-paper" : "text-ink",
				disabled && "cursor-not-allowed",
				disabled && (tone === "blanc" ? "text-paper/25" : "text-disabled"),
				// estuaire accent only on light surfaces (noir); on dark (blanc) it
				// would be unreadable, so the nudge alone signals hover.
				!disabled &&
					tone === "noir" &&
					"hover:text-estuaire focus-visible:text-estuaire",
				!disabled &&
					(direction === "left"
						? "hover:-translate-x-1"
						: "hover:translate-x-1"),
				className,
			)}
		>
			<Arrow direction={direction} className="size-9" />
		</button>
	);
}
