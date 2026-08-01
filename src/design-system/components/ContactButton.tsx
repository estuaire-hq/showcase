import Link from "next/link";
import type { MouseEventHandler } from "react";
import { tv } from "@/lib/utils";
import type { CtaTone } from "../nav";

/**
 * Nav "contact" CTA (kit « btn contact » bleu/noir). Small filled pill.
 * `tone` = rest colour: `bleu` (estuaire → ink on hover), `noir` (ink →
 * estuaire on hover) or `paper` (see below). `active` swaps to an ink outline.
 * Renders a `<button>`, or a Next `<Link>` when `href` is set.
 *
 * `paper` is NOT in the maquette: it exists because both kit tones are dark
 * (estuaire #003787 luminance 49, ink 17), so over a dark hero the pill measured
 * 1.35:1 against its background and its shape vanished. Choosing between two dark fills
 * cannot fix that. A light fill is the only variant that lets the CTA react to
 * a dark strip the way the ghost slots do (ADR 0029). The brand blue is preferred
 * wherever the background allows it, so this tone is only ever selected on a
 * measured-dark strip.
 */
const contactButton = tv({
	base: "inline-flex h-10 items-center justify-center rounded-full px-[18px] font-display lowercase leading-none ring-inset transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
	variants: {
		tone: { bleu: "", noir: "", paper: "" },
		// sm = nav (16px Regular) · lg = footer (25px ≈ text-body, SemiBold)
		size: { sm: "text-caption", lg: "text-body-sm font-semibold lg:text-body" },
		active: { true: "", false: "" },
	},
	compoundVariants: [
		{
			tone: "bleu",
			active: false,
			class: "bg-estuaire text-paper hover:bg-ink",
		},
		{
			tone: "noir",
			active: false,
			class: "bg-ink text-paper hover:bg-estuaire",
		},
		{
			tone: "paper",
			active: false,
			class: "bg-paper text-ink hover:bg-estuaire hover:text-paper",
		},
		{ active: true, class: "bg-transparent text-ink ring-1 ring-ink" },
	],
	defaultVariants: { tone: "bleu", size: "sm", active: false },
});

export function ContactButton({
	label = "contact",
	href,
	tone,
	size,
	active,
	className,
	onClick,
}: {
	label?: string;
	href?: string;
	tone?: CtaTone;
	size?: "sm" | "lg";
	active?: boolean;
	className?: string;
	onClick?: MouseEventHandler<HTMLElement>;
}) {
	const cls = contactButton({ tone, size, active, class: className });
	if (href != null) {
		return (
			<Link
				href={href}
				className={cls}
				aria-current={active ? "page" : undefined}
				onClick={onClick}
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
