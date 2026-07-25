import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";

/**
 * Case-study card (kit « CAS STUDY » + survol). Full-bleed image under a ~25%
 * ink veil. The text block sits low-left (kit margins ≈6.8%): the title (Title
 * 75, BrandText) on top, then a 3px white rule, then the meta line (lieu · année
 * · superficie) with tick separators. On hover the image zooms and the veil
 * deepens (the kit's "survol").
 */
export function CaseStudyCard({
	image,
	alt,
	title,
	meta,
	href,
	className,
}: {
	image: string;
	alt: string;
	title: string;
	/** e.g. ["Lyon", "2024", "320 m²"] — rendered with tick separators. */
	meta?: string[];
	href?: string;
	className?: string;
}) {
	const card = (
		<article
			className={cn(
				// Mobile/tablet get a taller band so the bottom-anchored overlay title + meta
				// fit without clipping at the top (the flat 1920/718 ratio left only ~131px at
				// 360px → the 40px title was cut off, mobile review). Desktop keeps the kit ratio.
				"group relative isolate aspect-[390/224] overflow-hidden bg-ink md:aspect-[768/384] lg:aspect-[1920/718]",
				className,
			)}
		>
			{/* Survol = LAYER_BLUR on the image (kit 15px), NOT a zoom. Softened to 8px at
			    the client's request (revue 2026-06: hover blur trop fort). The base
			    scale-105 bleeds the image past the clip so the blur never reveals edges.
			    Guarded: a missing cover (dangling asset) degrades to the ink veil + title
			    rather than a broken `<Image src="">`. */}
			{image && (
				<Image
					src={image}
					alt={alt}
					fill
					sizes="(min-width: 1280px) 1200px, 100vw"
					className="scale-105 object-cover transition-[filter] duration-500 ease-out group-hover:blur-[8px]"
				/>
			)}
			<div className="absolute inset-0 bg-ink/25" />
			<div className="absolute inset-x-[6.8%] bottom-[9.7%] text-paper">
				{/* Responsive title scale (DS convention, globals.css): the fixed 75px
				    `text-title` clipped the overlaid title in the narrow card on mobile —
				    step down through `text-subtitle-sm` (30px, mobile) / `text-title-sm`
				    (40px, tablet) until lg where the card is wide enough for 75px
				    (multi-resolution review, ADR 0022 + mobile review). */}
				<h3 className="font-display text-subtitle-sm leading-none md:text-title-sm lg:text-title">
					<BrandText>{title}</BrandText>
				</h3>
				<div className="mt-[18px] border-paper border-t-[3px] pt-3">
					{meta && meta.length > 0 && (
						<p className="flex flex-wrap items-center gap-x-4 font-display text-body-sm font-semibold lg:gap-x-8 lg:text-body">
							{meta.map((m, i) => (
								<span key={m} className="flex items-center gap-x-4 lg:gap-x-8">
									{i > 0 && (
										<span
											aria-hidden
											className="h-4 w-px bg-paper lg:h-[26px]"
										/>
									)}
									{m}
								</span>
							))}
						</p>
					)}
				</div>
			</div>
		</article>
	);

	return href ? (
		<Link href={href} className="block">
			{card}
		</Link>
	) : (
		card
	);
}
