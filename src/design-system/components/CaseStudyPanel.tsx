import Image from "next/image";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";

export type CaseStudyPanelData = {
	image: string;
	title: string;
	/** lieu · année · superficie — revealed one by one. */
	meta: string[];
};

/**
 * Case-study BAND (home « CAS STUDY ») — a full-bleed cinematic strip whose height
 * follows the maquette aspect ratio per breakpoint (mobile/tablet ≈ 1.1:1, desktop
 * 2.67:1 — 1920×718). Full-bleed image under a 25% ink veil; title + a 3px rule +
 * tick-separated meta, low-left. Presentational only: the `data-cs-*` hooks let the
 * `CaseStudies` shell drive the scroll reveal (image parallax, then title, the rule
 * tracing in, then the meta one by one). The shared "voir nos réalisations" pill lives
 * once below all bands (in `CaseStudies`), per the maquette — not per band. The whole
 * band is wrapped in a link to its réalisation (by `CaseStudies`); on hover the image
 * zooms slightly (the cas-study motion signature) — `motion-safe` only, and on the
 * `<Image>` itself, NOT the GSAP-driven parallax layer (post-mortem 0015). Static &
 * readable without JS (reduced motion / no-JS): everything is visible at rest.
 */
export function CaseStudyPanel({
	image,
	title,
	meta,
	className,
}: CaseStudyPanelData & {
	className?: string;
}) {
	return (
		<article
			data-cs-panel
			className={cn(
				"group relative aspect-[78/71] w-full overflow-hidden bg-ink text-paper lg:aspect-[960/359]",
				className,
			)}
		>
			{/* Parallax layer — taller than the band (−inset-y-[8%] → 116% height) so the
			    scrubbed yPercent drift never exposes an edge (no black band). GSAP owns
			    this element's transform (CaseStudies animates yPercent), so it carries no
			    CSS transform of its own (post-mortem 0015). A missing image degrades to the
			    ink panel (`bg-ink`) rather than a broken `<Image src="">`. */}
			<div data-cs-image className="absolute inset-x-0 -inset-y-[8%]">
				{image && (
					<Image
						src={image}
						alt={title}
						fill
						sizes="100vw"
						className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
					/>
				)}
			</div>
			<div className="absolute inset-0 bg-ink/25" />

			{/* Title + rule + meta, low-left (maquette insets: 4.1% mobile / 11.2% tablet /
			    6.8% desktop; the block sits ~8% from the bottom). */}
			<div className="absolute inset-x-4 bottom-[8%] md:inset-x-[11.2%] lg:inset-x-[6.8%]">
				<h3
					data-cs-title
					className="max-w-[18ch] font-display font-semibold text-title-sm leading-[1.1] lg:text-title"
				>
					<BrandText>{title}</BrandText>
				</h3>
				<div
					data-cs-rule
					className="mt-4 h-[3px] w-full origin-right bg-paper"
				/>
				{meta.length > 0 && (
					<p className="mt-3 flex flex-wrap items-center gap-x-6 font-display font-semibold text-body-sm lg:gap-x-8 lg:text-body">
						{meta.map((m, i) => (
							<span
								key={m}
								data-cs-detail
								className="flex items-center gap-x-6 lg:gap-x-8"
							>
								{i > 0 && (
									<span
										aria-hidden
										className="h-5 w-px bg-paper/70 lg:h-[26px]"
									/>
								)}
								{m}
							</span>
						))}
					</p>
				)}
			</div>
		</article>
	);
}
