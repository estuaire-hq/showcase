import Link from "next/link";
import { tv } from "@/lib/utils";
import { LineText } from "./LineText";

/**
 * Footer link. `nav` (kit « Menu footer » — Montserrat Alternates, ~24px) for
 * the main footer menu; `legal` (kit « mini menu footer » — Montserrat 16px)
 * for legal links. Paper at rest; the hover affordance is the drawn line
 * (`LineText`, ADR 0021 D3) instead of the former `hover:underline`.
 */
const footerLink = tv({
	// Dark footer surface: keep the text white, estuaire (#003787) on ink (#0e1215)
	// fails contrast (≈1.4:1), so no colour shift; the line inherits `currentColor`.
	// `group/line` drives LineText on BOTH hover and keyboard focus. The line alone is a
	// 1px indicator, so keyboard focus also gets the DS ring used on dark surfaces.
	base: "group/line inline-block w-fit rounded-sm text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper",
	variants: {
		variant: {
			// nav: Montserrat Alternates SemiBold ~25px (text-body) · legal: Montserrat 16px
			nav: "font-display text-body-sm font-semibold lg:text-body",
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
			<LineText text={label} />
		</Link>
	);
}
