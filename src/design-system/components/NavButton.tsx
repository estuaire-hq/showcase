import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import { RollText } from "./RollText";

/**
 * Nav link — text-only with the signature hover "text-roll" (estuaire-motion DA).
 * No pill: at rest the label is tone-coloured; on hover each letter rolls up to reveal
 * an accent copy (RollText). The current page (`active`) is shown statically in the
 * accent colour + semibold (a non-colour cue too), with no roll. `tone` adapts to the
 * surrounding surface — `onLight` (ink → estuaire) or `onDark` (paper → cream). Renders
 * a `<Link>` when `href` is set, else a `<button>`.
 *
 * Note: this REPLACES the kit's ghost-pill hover (node 51:2699) per the Motion DA —
 * a unified text-hover grammar across nav + footer (Pierre, 2026-06-20).
 */
const ACTIVE_TONE = { onLight: "text-estuaire", onDark: "text-cream" } as const;

const BASE =
	"inline-flex items-center rounded-sm font-display text-caption lowercase leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire";

export function NavButton({
	label,
	href,
	tone = "onLight",
	active = false,
	className,
	onClick,
}: {
	label: string;
	href?: string;
	tone?: "onLight" | "onDark";
	active?: boolean;
	className?: string;
	onClick?: MouseEventHandler<HTMLElement>;
}) {
	// Active = current page: static accent text (no roll), with semibold as a non-colour
	// cue. Inactive = the RollText hover; its glyphs carry the rest colour, so the wrapper
	// stays colourless.
	const cls = cn(
		BASE,
		active && cn(ACTIVE_TONE[tone], "font-semibold"),
		className,
	);
	const content = active ? label : <RollText text={label} tone={tone} />;

	if (href != null) {
		return (
			<Link
				href={href}
				className={cls}
				aria-current={active ? "page" : undefined}
				onClick={onClick}
			>
				{content}
			</Link>
		);
	}
	return (
		<button
			type="button"
			className={cls}
			aria-pressed={active}
			onClick={onClick}
		>
			{content}
		</button>
	);
}
