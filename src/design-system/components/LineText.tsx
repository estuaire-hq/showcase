import { cn } from "@/lib/utils";

/**
 * LineText: the Estuaire "line" hover for bare text links (footer menu + legal links,
 * the contact e-mail…). A thin 1px underline that DRAWS IN left→right on hover (and
 * keyboard focus), STAYS as long as the pointer / focus is there, then RETRACTS toward
 * the right on leave. Introduced by #22, removed by #24, reintroduced on 2026-07-31 for
 * the links whose hover was a plain underline (see ADR 0021, D3 + its addenda).
 *
 * Technique: a single absolutely-positioned 1px bar scaled on X, switching
 * `transform-origin` between the two states: left while growing (0→1, draws from the
 * left), right at rest (so the 1→0 collapse on leave recedes to the right). Only the
 * scale is transitioned; `transform-origin` flips instantly, which is what makes the
 * unidirectional wipe read correctly. Pure CSS (no GSAP), no reflow (nothing animates a
 * layout property), and it responds to keyboard focus too.
 *
 * The bar uses `bg-current`, so it inherits the link's text colour (tone-adaptive:
 * paper on the dark footer, ink on a light surface). Presentational (props only).
 *
 * Placement contract: MUST sit inside an element carrying `group/line` (typically the
 * wrapping <Link>), so BOTH hover and focus-visible on that element drive the line.
 * `leading-none` keeps the box hugging the glyphs, so the line follows the TEXT and not
 * the link's line-height (the footer menu carries a 45px leading). Consequence: the
 * labels are expected to be SHORT: a wrapping label would get cramped lines and a bar
 * spanning the widest one. Every link in scope fits on one line (checked 390/768/1440).
 */
export function LineText({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	return (
		<span className={cn("relative inline-block leading-none", className)}>
			{text}
			{/* `-bottom-[0.15em]` and not a px offset: the gap has to scale with the type, or
			    the line cuts through the descenders on the bigger sizes (the 35px contact
			    e-mail). `duration-(--var)` and not `duration-line`: Tailwind v4 has no
			    `--duration-*` utility namespace, so a named `duration-*` class would NOT
			    resolve. Under `prefers-reduced-motion` the transition is dropped: the line
			    still appears on hover/focus (the affordance survives), it just no longer draws. */}
			<span
				aria-hidden="true"
				className="absolute inset-x-0 -bottom-[0.15em] h-px origin-right scale-x-0 bg-current transition-transform duration-(--duration-line) ease-expo group-hover/line:origin-left group-hover/line:scale-x-100 group-focus-visible/line:origin-left group-focus-visible/line:scale-x-100 motion-reduce:transition-none"
			/>
		</span>
	);
}
