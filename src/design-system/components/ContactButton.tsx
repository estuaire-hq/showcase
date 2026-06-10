import Link from "next/link";
import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";

/**
 * Nav "contact" CTA (kit « btn contact » bleu/noir). Small filled pill.
 * `tone` = rest colour: `bleu` (estuaire → ink on hover) or `noir` (ink →
 * estuaire on hover). `active` swaps to an ink outline. Renders a `<button>`,
 * or a Next `<Link>` when `href` is set.
 */
const contactButton = tv({
	base: "inline-flex h-10 items-center justify-center rounded-full px-[18px] font-display lowercase leading-none ring-inset transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
	variants: {
		tone: { bleu: "", noir: "" },
		// sm = nav (16px Regular) · lg = footer (25px ≈ text-body, SemiBold)
		size: { sm: "text-caption", lg: "text-body font-semibold" },
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
	tone?: "bleu" | "noir";
	size?: "sm" | "lg";
	active?: boolean;
	className?: string;
	onClick?: ComponentProps<"button">["onClick"];
}) {
	const cls = contactButton({ tone, size, active, class: className });
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
