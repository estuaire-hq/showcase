import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { OutlineText } from "../typography/OutlineText";

/**
 * Hero title lockup — the three-line headline shared by the hero and the full-screen
 * intro, so the intro's FLIP hand-off lands pixel-exact on the real hero title (same
 * typography, same line structure):
 *
 *   Estuaire,            ← label   (solid, display)
 *   là où les            ← trunk   (outline / -webkit-text-stroke, title)
 *   <keyword>            ← keyword (solid, rolls in a masked odometer — the only part
 *                          that changes; one keyword per hero slide)
 *
 * Presentational only (props, no Sanity — Principle VIII). Motion is driven by the
 * parent via the data hooks it exposes — this component never animates by itself:
 *   - `[data-line]`  on each masked line  → the intro's staggered line-mask entrance.
 *   - `[data-kw]`    on each keyword span → the odometer roll (hero: synced to the
 *                     active slide; intro: driven by its timeline). At rest only
 *                     `activeIndex` is shown; the parent's GSAP parks the others.
 *
 * Casing follows the brand rule via `BrandText` (UPPERCASE → Montserrat, lowercase →
 * Montserrat Alternates). The lower two lines use `tracking-normal` (Figma "Là où les"
 * / keyword are ls 0, unlike the 5% of the display token).
 */
export function HeroTitle({
	label,
	trunk,
	keywords,
	activeIndex = 0,
	className,
}: {
	label: string;
	trunk: string;
	keywords: string[];
	/** Keyword shown at rest (SSR + reduced motion). */
	activeIndex?: number;
	className?: string;
}) {
	return (
		<div className={cn("font-display font-semibold text-paper", className)}>
			{/* line 1 — solid */}
			<div data-line className="overflow-hidden">
				<span className="block text-display-sm leading-none lg:text-display">
					<BrandText>{label}</BrandText>
				</span>
			</div>

			{/* line 2 — outline (DS OutlineText: -webkit-text-stroke ≈ Figma stroke CENTER) */}
			<div data-line className="mt-1 overflow-hidden lg:mt-2">
				<OutlineText
					tier="title"
					className="block text-title-sm leading-tight tracking-normal lg:text-title lg:leading-none"
				>
					{trunk}
				</OutlineText>
			</div>

			{/* line 3 — keyword odometer (overflow-hidden ribbon; height = 2 lines so a long
			    keyword that wraps fits without clipping). Items are TOP-aligned (not centred)
			    so 1-line and 2-line keywords share the same top → no vertical jump between
			    phrases. */}
			<div
				data-line
				className="relative mt-1 h-[2.5em] overflow-hidden text-title-sm leading-tight tracking-normal lg:mt-2 lg:text-subtitle"
			>
				{keywords.map((kw, i) => (
					<span
						key={kw}
						data-kw
						data-kw-index={i}
						className="absolute inset-x-0 top-0 flex items-start"
						// At rest only the active keyword is visible; GSAP takes over on mount.
						style={{ opacity: i === activeIndex ? 1 : 0 }}
					>
						<BrandText>{kw}</BrandText>
					</span>
				))}
			</div>
		</div>
	);
}
