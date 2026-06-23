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
				"group relative isolate aspect-[1920/718] overflow-hidden bg-ink",
				className,
			)}
		>
			{/* Survol = LAYER_BLUR 15px on the image (kit), NOT a zoom. The base
			    scale-105 bleeds the image past the clip so the blur never reveals edges.
			    Guarded: a missing cover (dangling asset) degrades to the ink veil + title
			    rather than a broken `<Image src="">`. */}
			{image && (
				<Image
					src={image}
					alt={alt}
					fill
					sizes="(min-width: 1280px) 1200px, 100vw"
					className="scale-105 object-cover transition-[filter] duration-500 ease-out group-hover:blur-[15px]"
				/>
			)}
			<div className="absolute inset-0 bg-ink/25" />
			<div className="absolute inset-x-[6.8%] bottom-[9.7%] text-paper">
				<h3 className="font-display text-title font-semibold leading-none">
					<BrandText>{title}</BrandText>
				</h3>
				<div className="mt-[18px] border-paper border-t-[3px] pt-3">
					{meta && meta.length > 0 && (
						<p className="flex flex-wrap items-center gap-x-8 font-display text-body font-semibold">
							{meta.map((m, i) => (
								<span key={m} className="flex items-center gap-x-8">
									{i > 0 && (
										<span aria-hidden className="h-[26px] w-px bg-paper" />
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
