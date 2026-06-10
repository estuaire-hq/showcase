import { cn } from "@/lib/utils";

type Direction = "right" | "left" | "up" | "down";

const ROTATION: Record<Direction, string> = {
	right: "rotate-0",
	left: "rotate-180",
	up: "-rotate-90",
	down: "rotate-90",
};

/**
 * Brand arrow glyph (the kit's "arrow-right-1" / dropdown chevron). A thin
 * line-arrow drawn with `currentColor`, so it inherits — and animates with —
 * the surrounding text/icon color (e.g. inside a Button on hover). Sizes to the
 * surrounding font via `1em` unless overridden through `className`.
 *
 * NOTE: approximates the kit vector (exact path not exported yet) — adjust if
 * the validated design needs the precise geometry.
 */
export function Arrow({
	direction = "right",
	className,
}: {
	direction?: Direction;
	className?: string;
}) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: decorative glyph, hidden from assistive tech via aria-hidden
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
			className={cn("size-[1em] shrink-0", ROTATION[direction], className)}
		>
			<path d="M4 12h15M13 6l6 6-6 6" />
		</svg>
	);
}
