import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-to-top control (kit « BTN top »). A SOLID flat disc — paper fill, ink arrow —
 * never bicolour nor translucent (client review 2026-06: the kit's translucent white
 * disc (#fff @0.25) and the adaptive backdrop-filter "lens" both read as a half-tinted,
 * see-through blob over coloured bands; the client asked for a flat aplat). White pops
 * crisply over the dark footer (where scroll-to-top matters most); a subtle ring +
 * shadow delineate it over light sections. Hover deepens to estuaire with a paper arrow
 * (kit hover state), consistent with the rest of the button family.
 *
 * The consumer (`ScrollTopMount`) applies positioning + the scroll-in opacity fade via
 * `className`; scroll behaviour is wired through `onClick` (Lenis `scrollTo(0)`).
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
				"flex items-center justify-center rounded-full bg-paper text-ink shadow-[0_6px_24px_rgba(14,18,21,0.22)] ring-1 ring-ink/10 transition-[transform,background-color,color,opacity] duration-300 hover:scale-105 hover:bg-estuaire hover:text-paper focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
				className,
			)}
		>
			<svg
				viewBox="0 0 24 24"
				className="size-[38%]"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
				focusable="false"
			>
				<path d="M12 5V19M6 11L12 5L18 11" />
			</svg>
		</button>
	);
}
