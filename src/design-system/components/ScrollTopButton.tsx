import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Arrow } from "./Arrow";

/**
 * Scroll-to-top control (kit « BTN top »). 105px circle, translucent paper fill
 * + paper ring at rest, estuaire on hover. The scroll behaviour is wired by the
 * consumer via `onClick` (e.g. Lenis `scrollTo(0)`).
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
				"inline-flex size-[105px] items-center justify-center rounded-full bg-paper/25 text-paper ring-2 ring-paper ring-inset transition-colors duration-300 hover:bg-estuaire hover:ring-estuaire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
				className,
			)}
		>
			<Arrow direction="up" className="size-7" />
		</button>
	);
}
