import Link from "next/link";
import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";

/**
 * Nav "nous découvrir" button (kit « btn nous découvrir » noir/blanc). Small
 * ghost pill: transparent at rest, fills on hover, outlines when `active` (the
 * current section). `tone` picks the colour for the surrounding background —
 * `onLight` (ink text, white hover fill) or `onDark` (paper text, ink hover
 * fill). Renders a `<button>`, or a Next `<Link>` when `href` is set.
 */
const navButton = tv({
	// Kit: Montserrat Alternates Regular (400) 16px, textCase LOWER, ~18px h-padding.
	base: "inline-flex h-10 items-center justify-center rounded-full px-[18px] font-display text-caption lowercase leading-none ring-inset transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
	variants: {
		tone: { onLight: "text-ink", onDark: "text-paper" },
		active: { true: "ring-1", false: "" },
	},
	compoundVariants: [
		{
			tone: "onLight",
			active: false,
			class: "hover:bg-paper hover:ring-1 hover:ring-paper",
		},
		{
			tone: "onDark",
			active: false,
			class: "hover:bg-ink hover:ring-1 hover:ring-ink",
		},
		{ tone: "onLight", active: true, class: "ring-ink" },
		{ tone: "onDark", active: true, class: "ring-paper" },
	],
	defaultVariants: { tone: "onLight", active: false },
});

export function NavButton({
	label,
	href,
	tone,
	active,
	className,
	onClick,
}: {
	label: string;
	href?: string;
	tone?: "onLight" | "onDark";
	active?: boolean;
	className?: string;
	onClick?: ComponentProps<"button">["onClick"];
}) {
	const cls = navButton({ tone, active, class: className });
	if (href != null) {
		return (
			<Link
				href={href}
				className={cls}
				aria-current={active ? "page" : undefined}
			>
				{label}
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
			{label}
		</button>
	);
}
