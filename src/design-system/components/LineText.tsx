import { cn } from "@/lib/utils";

/**
 * LineText — the Estuaire "line" hover for secondary links (footer legal links,
 * « voir nos réalisations »…). A thin 1px underline that DRAWS IN left→right on hover
 * (and keyboard focus), then RETRACTS toward the right on leave.
 *
 * Technique: a single absolutely-positioned 1px bar animated with `scaleX`, switching
 * `transform-origin` between the two states — left while growing (0→1, draws from the
 * left), right at rest (so the 1→0 collapse on leave recedes to the right). Only the
 * `transform` is transitioned; `transform-origin` flips instantly, which is what makes
 * the unidirectional wipe read correctly. Pure CSS — no GSAP, and it responds to
 * keyboard focus too.
 *
 * The bar uses `bg-current`, so it inherits the link's text colour (tone-adaptive:
 * paper on the dark footer, ink on a light surface). Presentational (props only).
 *
 * Placement contract: MUST sit inside an element carrying `group/line` (typically the
 * wrapping <Link>), so BOTH hover and focus-visible on that element drive the line.
 */
export function LineText({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	return (
		<span className={cn("relative inline-block", className)}>
			{text}
			<span
				aria-hidden="true"
				className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-current transition-transform duration-[var(--duration-line)] ease-[var(--ease-expo)] group-hover/line:origin-left group-hover/line:scale-x-100 group-focus-visible/line:origin-left group-focus-visible/line:scale-x-100 motion-reduce:transition-none"
			/>
		</span>
	);
}
