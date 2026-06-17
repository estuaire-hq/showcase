import { tv } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";

/**
 * « Phrase phare » — the recurring brand statement (maquette: intro + atelier highlight
 * panels, and the big-image incrustation). A brand-cased statement (BrandText) in the
 * kit's display type. Colour is inherited (`currentColor`) so it adapts to its
 * surface — set it on the parent (white on the blue panels, paper on the veiled image).
 * Presentational only (Principle VIII). `\n` is honoured (`whitespace-pre-line`).
 *
 * Sizes from the maquette: `lead` (the blue panel phrases — 20px mobile/tablet → 35px
 * desktop) · `title` (the big-image incrustation — 40px → 75px desktop).
 */
const pullquote = tv({
	base: "whitespace-pre-line font-display font-semibold",
	variants: {
		size: {
			lead: "text-lead-sm lg:text-lead lg:leading-[1.3]",
			title: "text-title-sm leading-[1.1] lg:text-title lg:leading-[1.0]",
		},
		align: { left: "text-left", center: "text-center" },
	},
	defaultVariants: { size: "lead", align: "left" },
});

export function Pullquote({
	children,
	size,
	align,
	className,
}: {
	children: string;
	size?: "lead" | "title";
	align?: "left" | "center";
	className?: string;
}) {
	return (
		<p className={pullquote({ size, align, class: className })}>
			<BrandText>{children}</BrandText>
		</p>
	);
}
