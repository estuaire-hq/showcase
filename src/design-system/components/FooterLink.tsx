import Link from "next/link";
import { tv } from "tailwind-variants";

/**
 * Footer link. `nav` (kit « Menu footer » — Montserrat Alternates, ~24px) for
 * the main footer menu; `legal` (kit « mini menu footer » — Montserrat 16px)
 * for legal links. Paper at rest, estuaire on hover.
 */
const footerLink = tv({
	// Dark footer surface: keep the text white and underline on hover/focus —
	// estuaire (#003787) on ink (#0e1215) fails contrast (≈1.4:1), so no colour shift.
	base: "inline-block w-fit text-paper underline-offset-4 decoration-2 hover:underline focus-visible:underline focus-visible:outline-none",
	variants: {
		variant: {
			// nav: Montserrat Alternates SemiBold ~25px (text-body) · legal: Montserrat 16px
			nav: "font-display text-body font-semibold",
			legal: "font-sans text-caption",
		},
	},
	defaultVariants: { variant: "nav" },
});

export function FooterLink({
	label,
	href,
	variant,
	className,
}: {
	label: string;
	href: string;
	variant?: "nav" | "legal";
	className?: string;
}) {
	return (
		<Link href={href} className={footerLink({ variant, class: className })}>
			{label}
		</Link>
	);
}
