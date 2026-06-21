import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";

/**
 * Portfolio grid card (kit « PORTFOLIO résultats » — node 51:4064). Distinct from
 * `CaseStudyCard` (the full-bleed overlay band used for « Dernières Réalisations »): here the
 * image sits on top in a near-square window, and the caption is rendered BELOW it — title
 * (BrandText) + a 3px ink rule + the meta line (lieu · année · superficie) with tick separators.
 * On hover the image blurs slightly (kit « survol »). Presentational only (Principle VIII).
 */
export function RealisationGridCard({
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
	/** e.g. ["Lyon", "2024", "320 m²"] — rendered with tick separators; omitted when empty. */
	meta?: string[];
	href?: string;
	className?: string;
}) {
	const inner = (
		<article className={cn("group flex flex-col gap-6", className)}>
			<div className="relative aspect-square w-full overflow-hidden bg-cream">
				{image && (
					<Image
						src={image}
						alt={alt}
						fill
						sizes="(min-width: 1024px) 42vw, 90vw"
						className="object-cover transition-[filter,transform] duration-500 ease-out group-hover:scale-105 group-hover:blur-[6px]"
					/>
				)}
			</div>
			<div className="flex flex-col gap-4 text-ink">
				<h3 className="font-display font-semibold text-title-sm leading-none lg:text-title">
					<BrandText>{title}</BrandText>
				</h3>
				<div className="border-ink border-t-[3px] pt-4">
					{meta && meta.length > 0 && (
						<p className="flex flex-wrap items-center gap-x-6 font-display font-semibold text-body-sm lg:text-body">
							{meta.map((m, i) => (
								<span key={m} className="flex items-center gap-x-6">
									{i > 0 && (
										<span aria-hidden className="h-[22px] w-px bg-ink/40" />
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
			{inner}
		</Link>
	) : (
		inner
	);
}
