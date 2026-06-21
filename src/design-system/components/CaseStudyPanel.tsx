import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { Arrow } from "./Arrow";

export type CaseStudyPanelData = {
	image: string;
	title: string;
	/** lieu · année · superficie — revealed one by one. */
	meta: string[];
};

/**
 * Full-viewport case-study panel (home « CAS STUDY », deviated from the maquette band
 * to a 100svh pinned panel — see PinnedCaseStudies). Full-bleed image under an ink
 * veil; title + a 3px rule + meta (tick-separated) low-left; a subtle "voir nos
 * réalisations" link low-right. Presentational only: the `data-cs-*` hooks let
 * PinnedCaseStudies drive the scrubbed reveal (image parallax, then title, then the
 * rule tracing right→left, then the details one by one, then the CTA). Static &
 * readable without JS (reduced motion / no-JS — FR-016): everything is visible at rest.
 */
export function CaseStudyPanel({
	image,
	title,
	meta,
	cta,
	className,
}: CaseStudyPanelData & {
	cta: { label: string; href: string };
	className?: string;
}) {
	return (
		<article
			data-cs-panel
			className={cn(
				"relative h-svh w-full overflow-hidden bg-ink text-paper",
				className,
			)}
		>
			{/* Oversized so the background parallax never reveals an edge (no black band).
			    Guarded: a missing image degrades to the ink panel (the article is `bg-ink`)
			    rather than a broken `<Image src="">`. */}
			<div data-cs-image className="absolute inset-0 scale-125">
				{image && (
					<Image
						src={image}
						alt={title}
						fill
						sizes="100vw"
						className="object-cover"
					/>
				)}
			</div>
			<div className="absolute inset-0 bg-ink/35" />

			{/* Title + rule + meta, low-left — with the CTA. On mobile/tablet the CTA
			    flows below the meta (it would otherwise overlap the full-width title +
			    wrapped meta, both anchored to bottom-[10%]); from lg it breaks out to the
			    low-right corner of this block (≡ the maquette right-[6.8%] bottom-[10%]). */}
			<div className="absolute inset-x-5 bottom-[10%] md:inset-x-10 lg:inset-x-[6.8%]">
				<h3
					data-cs-title
					className="max-w-[20ch] font-display font-semibold text-title-sm leading-none lg:text-title"
				>
					<BrandText>{title}</BrandText>
				</h3>
				<div
					data-cs-rule
					className="mt-5 h-[3px] w-full origin-right bg-paper"
				/>
				{meta.length > 0 && (
					<p className="mt-4 flex flex-wrap items-center gap-x-8 font-display font-semibold text-body">
						{meta.map((m, i) => (
							<span
								key={m}
								data-cs-detail
								className="flex items-center gap-x-8"
							>
								{i > 0 && (
									<span aria-hidden className="h-[26px] w-px bg-paper/70" />
								)}
								{m}
							</span>
						))}
					</p>
				)}

				{/* Subtle CTA (a worked-up link, not the big pill). */}
				<Link
					data-cs-cta
					href={cta.href}
					className="group mt-8 inline-flex items-center gap-3 font-display font-semibold text-body lg:absolute lg:right-0 lg:bottom-0 lg:mt-0"
				>
					<span className="relative">
						{cta.label}
						<span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-paper transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
					</span>
					<Arrow className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
				</Link>
			</div>
		</article>
	);
}
