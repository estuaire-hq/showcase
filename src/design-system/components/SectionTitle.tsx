import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { OutlineText } from "../typography/OutlineText";

/**
 * Section heading in the kit's signature contour/fill device: an outlined (stroked)
 * line on top, a solid brand-cased line below (e.g. « Nos » / « expertises », « Nous
 * sommes » / « agenceur… »). Used by every section title on the home (intro, expertises,
 * réalisations, vision), so the responsive type lives in ONE place: `text-title-sm`
 * (40px, mobile + tablet) → `text-title` (75px) at `lg`, matching the home frames.
 *
 * Colour is inherited (`currentColor`) so it adapts to light/dark sections — set the
 * colour on a parent (or via `className`). Presentational only (Principle VIII). `\n` in
 * either line is honoured (`whitespace-pre-line`) for the maquette's line breaks.
 */
export function SectionTitle({
	outline,
	fill,
	rule = false,
	className,
}: {
	/** Optional contour line above the fill. Omit for a single solid word (e.g. the case
	 *  study « contexte » / « enjeu », which the maquette draws WITHOUT an article prefix —
	 *  client review 2026-06, K1). */
	outline?: string;
	fill: string;
	/** Draw a 3px underline rule below the title (case study sections — client review K2). */
	rule?: boolean;
	className?: string;
}) {
	return (
		<h2
			data-reveal-fade
			className={cn(
				"font-display font-semibold text-title-sm leading-[1.1] lg:text-title lg:leading-[1.05]",
				className,
			)}
		>
			{outline && (
				<OutlineText tier="title" className="block whitespace-pre-line">
					{outline}
				</OutlineText>
			)}
			<span className="block whitespace-pre-line">
				<BrandText>{fill}</BrandText>
			</span>
			{rule && (
				<span
					aria-hidden
					className="mt-5 block border-current border-t-[3px] lg:mt-7"
				/>
			)}
		</h2>
	);
}
