import { cn } from "@/lib/utils";

/**
 * « Nos engagements » grid (expertise sub-pages « 05/ NOS ENGAGEMENTS », nodes 51:3008 /
 * 87:6762 / 87:6964). An ordered list of engagements rendered as a grid — **1 column** on
 * mobile, **3 columns** from `md` (so 6 items = 3×2). Each cell carries a number DERIVED from
 * its order (`01/`…, never stored — stays coherent if an item is hidden/reordered) above its
 * label, and the cells are separated by 3px rules (internal only, no outer border) drawn with
 * `border-current` so they follow the text colour.
 *
 * Colour is inherited (`currentColor`): set `text-paper` on the parent (the maquette sits on a
 * blue `bg-estuaire` panel). Numbers use Montserrat Alternates (brand display); labels use
 * Montserrat (font-sans). Labels render as `<h3>` so they sit under the section `<h2>` (semantic
 * hierarchy — FR-014). Presentational only (Principle VIII).
 */
export function EngagementsGrid({
	items,
	className,
}: {
	/** Engagement labels, in display order (numbering is derived from the index). */
	items: string[];
	className?: string;
}) {
	return (
		<ol className={cn("grid grid-cols-1 md:grid-cols-3", className)}>
			{items.map((title, i) => {
				const number = `${String(i + 1).padStart(2, "0")}/`;
				// Internal-only 3px rules: a top rule on every item but the first (mobile,
				// single column); from md the top rule applies to the second row (i ≥ 3) and a
				// left rule to every item not in the first column (i % 3 ≠ 0).
				const rules = cn(
					i > 0 && "border-current border-t-[3px]",
					i < 3 ? "md:border-t-0" : "md:border-t-[3px]",
					i % 3 !== 0 && "md:border-l-[3px]",
				);
				return (
					<li
						key={`${number}-${title}`}
						className={cn(
							"flex flex-col gap-3 py-7 md:gap-4 md:px-[6%] md:py-9 lg:gap-5 lg:px-[3.2%] lg:py-12",
							rules,
						)}
					>
						<span className="font-display font-semibold text-title-sm leading-none lg:text-display lg:leading-[1.0]">
							{number}
						</span>
						<h3 className="max-w-[24ch] font-sans font-semibold text-body-sm leading-snug lg:text-lead lg:leading-[1.28]">
							{title}
						</h3>
					</li>
				);
			})}
		</ol>
	);
}
