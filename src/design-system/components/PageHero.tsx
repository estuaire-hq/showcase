import Image from "next/image";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { OutlineText } from "../typography/OutlineText";

/** Resolved hero image (page builds it from Sanity via urlFor + LQIP). */
export type PageHeroImage = { src: string; alt: string; blurDataURL?: string };

/**
 * Hero of a content page (maquette « 02/ SLIDER », nodes 51:2699 / 78:4374 / 78:4626):
 * a full-bleed visual with a dark title cartouche overlapping its bottom-left. The
 * cartouche carries an eyebrow, a separator rule, and the page H1 in the kit's
 * outline/fill device (stroked lines + one solid line, brand casse via BrandText).
 *
 * STATIC — no autoplay, no controls (distinct from the home `HeroSlideshow`, whose
 * letter-by-letter reconstruction is home-specific). Reusable by future content pages.
 *
 * Per-breakpoint geometry (read on the maquette):
 *  - mobile (390): image (aspect 390/259) under a 25% ink veil, then a FULL-WIDTH
 *    cartouche below (no overlap);
 *  - tablet (768) / desktop (1920): clean image (aspect ~2.04), cartouche pulled up to
 *    overlap the image bottom (negative margin = the maquette overlap, proportional to
 *    width so it holds at any viewport), left-inset, ~90% / 71% wide.
 */
export function PageHero({
	eyebrow,
	titleOutline,
	titleFill,
	image,
	className,
	cartoucheClassName,
}: {
	eyebrow?: string;
	/** Stroked H1 lines (may contain \n). */
	titleOutline?: string;
	/** Solid H1 line. */
	titleFill: string;
	image?: PageHeroImage;
	className?: string;
	/** Override the dark title cartouche box (e.g. its width) per page — the default
	 *  geometry is tuned to « Nous découvrir »; other pages may need a wider cartouche. */
	cartoucheClassName?: string;
}) {
	return (
		<section className={cn("relative bg-paper", className)}>
			{/* Full-bleed visual. Mobile carries a 25% ink veil (maquette); tablet/desktop
			    are clean. `bg-ink` is the degraded backdrop when no image is configured yet. */}
			<div className="relative aspect-[390/259] w-full overflow-hidden bg-ink md:aspect-[768/377] lg:aspect-[1920/943]">
				{image && (
					<Image
						src={image.src}
						alt={image.alt}
						fill
						priority
						sizes="100vw"
						placeholder={image.blurDataURL ? "blur" : "empty"}
						blurDataURL={image.blurDataURL}
						className="object-cover"
					/>
				)}
				<div className="absolute inset-0 bg-ink/25 md:hidden" />
			</div>

			{/* Dark title cartouche. Full-width below the image on mobile; overlapping the
			    image bottom-left on tablet/desktop (negative margin = maquette overlap). */}
			<div
				className={cn(
					"relative z-10 bg-ink px-[22px] py-9 text-paper md:-mt-[21%] md:ml-[5.2%] md:w-[89.6%] md:px-[50px] md:py-10 lg:-mt-[16.8%] lg:ml-[7.29%] lg:w-[71%] lg:px-[7%] lg:py-[6.3%]",
					cartoucheClassName,
				)}
			>
				<div className="flex flex-col gap-5 lg:gap-12">
					{eyebrow && (
						<p className="font-display font-semibold text-caption lg:text-lead">
							<BrandText>{eyebrow}</BrandText>
						</p>
					)}
					<div className="h-px w-full bg-paper lg:h-[3px]" />
					{/* Single H1 (FR-016): outline lines (stroked) + the solid fill line. */}
					<h1 className="font-display font-semibold text-title-sm leading-[1.1] tracking-[0.02em] lg:text-title lg:leading-[1.1]">
						{titleOutline && (
							<OutlineText tier="title" className="block whitespace-pre-line">
								{titleOutline}
							</OutlineText>
						)}
						<span className="block whitespace-pre-line">
							<BrandText>{titleFill}</BrandText>
						</span>
					</h1>
				</div>
			</div>
		</section>
	);
}
