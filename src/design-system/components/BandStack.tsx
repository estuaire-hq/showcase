import { cn } from "@/lib/utils";

/**
 * A vertical stack of full-bleed « bandeaux-liens », with the ONE separation the maquette
 * asks for: **5px**. Measured on every frame — home 5228/5951/6674, univers secteurs
 * 1951/2674/3397/4120, expertises niveaux 3227/3950/4673, portfolio 1558/2281/3004, all
 * 718 tall — and identical on tablet and mobile. The home already shipped it; univers,
 * expertises and the portfolio were jointive, which is exactly the inconsistency the
 * client pointed at (revue 2026-07-31).
 *
 * `bg-paper` is what shows THROUGH the 5px (the maquette's white page background), so the
 * separation reads even when the stack sits on a coloured section.
 *
 * Pages must not restate the gap. Wrap this in `<Parallax>` (`@/lib/motion`) to arm the
 * bands' scroll drift — the amplitude itself is baked into `BandMedia`.
 */
export function BandStack({
	children,
	className,
	ref,
}: {
	children: React.ReactNode;
	className?: string;
	/** The home's `CaseStudies` needs the stack element to drive the navbar tone. */
	ref?: React.Ref<HTMLDivElement>;
}) {
	return (
		<div
			ref={ref}
			className={cn(
				"mx-auto flex w-full max-w-[1920px] flex-col gap-[5px] bg-paper",
				className,
			)}
		>
			{children}
		</div>
	);
}
