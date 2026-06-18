import Image from "next/image";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { OutlineText } from "../typography/OutlineText";

/** Resolved hero image (page builds it from Sanity via urlFor + LQIP). */
export type PageHeroImage = { src: string; alt: string; blurDataURL?: string };

/**
 * Hero of a content page. Two layouts (same dark title cartouche — eyebrow, separator
 * rule, H1 in the kit outline/fill device, brand casse via BrandText):
 *
 *  - `overlay` (default, « Nous découvrir » node 51:2699): a full-bleed visual with the
 *    cartouche overlapping its bottom-left.
 *  - `split` (« Univers » node 51:3386): a dark cartouche panel beside a clean image —
 *    panel left / image right on desktop, cartouche on top / image below on mobile (so
 *    the transparent navbar's logo + toggle sit over the dark cartouche → `onDark`, while
 *    the desktop links sit over the paper half → `onLight`).
 *
 * STATIC — no autoplay, no controls (distinct from the home `HeroSlideshow`). Reusable
 * by every content page. Per-breakpoint geometry is read on the maquette (Principle VII).
 */
export function PageHero({
	eyebrow,
	titleOutline,
	titleFill,
	image,
	variant = "overlay",
	className,
}: {
	eyebrow?: string;
	/** Stroked H1 lines (may contain \n). */
	titleOutline?: string;
	/** Solid H1 line(s) (may contain \n). */
	titleFill: string;
	image?: PageHeroImage;
	variant?: "overlay" | "split";
	className?: string;
}) {
	// Shared cartouche content (eyebrow + rule + H1) — each variant wraps it in its own
	// positioned dark panel. Single H1 (FR-014): outline lines (stroked) + the solid line.
	const cartouche = (
		<div className="flex flex-col gap-5 lg:gap-12">
			{eyebrow && (
				<p className="whitespace-pre-line font-display font-semibold text-caption lg:text-lead">
					<BrandText>{eyebrow}</BrandText>
				</p>
			)}
			<div className="h-px w-full bg-paper lg:h-[3px]" />
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
	);

	if (variant === "split") {
		return (
			<section className={cn("relative bg-paper", className)}>
				<div className="flex flex-col lg:grid lg:min-h-[49vw] lg:grid-cols-[1090fr_830fr] lg:items-stretch">
					{/* Dark cartouche panel — top (mobile) / left (desktop). The navbar overlays it. */}
					<div className="bg-ink px-[22px] py-12 text-paper md:px-[50px] md:py-16 lg:flex lg:flex-col lg:justify-center lg:px-[7.29%] lg:py-[6%]">
						{cartouche}
					</div>
					{/* Clean image — below (mobile) / right (desktop), inset on the paper panel. */}
					<div className="bg-paper lg:flex lg:items-center lg:justify-center lg:py-[3.6%] lg:pr-[7.29%] lg:pl-[4%]">
						<div className="relative aspect-[751/603] w-full overflow-hidden bg-cream">
							{image && (
								<Image
									src={image.src}
									alt={image.alt}
									fill
									priority
									sizes="(min-width: 1024px) 43vw, 100vw"
									placeholder={image.blurDataURL ? "blur" : "empty"}
									blurDataURL={image.blurDataURL}
									className="object-cover"
								/>
							)}
						</div>
					</div>
				</div>
			</section>
		);
	}

	// overlay (default)
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
			<div className="relative z-10 bg-ink px-[22px] py-9 text-paper md:-mt-[21%] md:ml-[5.2%] md:w-[89.6%] md:px-[50px] md:py-10 lg:-mt-[16.8%] lg:ml-[7.29%] lg:w-[71%] lg:px-[7%] lg:py-[6.3%]">
				{cartouche}
			</div>
		</section>
	);
}
