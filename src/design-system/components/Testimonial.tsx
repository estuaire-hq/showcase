import Image from "next/image";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";

/**
 * Testimonial — a citation band (maquette: sector « 04/ CITATIONS », node 51:3520): a
 * full-bleed image inset by the page gutter, under a ~25% ink veil, with a large centered
 * quote (the kit's display type, brand-cased) framed by decorative quote marks, and an
 * optional attribution below. Presentational only (Principle VIII); tokens only
 * (Principle X). The image carries `data-parallax` for the maquette's « parallax fixe »
 * (the page wraps the band in the motion <Parallax>; inert under reduced motion).
 *
 * Edge cases: no `attribution` → no empty block; no `image` → the band keeps its ink
 * backdrop (dominant colour, anti-CLS). Quote contrast is guaranteed by the veil (FR-016).
 */
export type TestimonialImage = {
	src: string;
	alt: string;
	blurDataURL?: string;
};

export function Testimonial({
	quote,
	attribution,
	image,
	className,
}: {
	quote: string;
	attribution?: string;
	image?: TestimonialImage;
	className?: string;
}) {
	return (
		<section
			className={cn("bg-paper px-4 py-0 md:px-8 lg:px-[3.18%]", className)}
		>
			{/* Mobile/tablet: min-height + vertical padding so a long quote grows the band
			    instead of being clipped (the image still fills via inset-0). Desktop: the
			    wide maquette ratio (the quote always fits). */}
			<figure className="relative isolate flex min-h-[480px] items-center justify-center overflow-hidden bg-ink py-16 md:min-h-[600px] lg:aspect-[1798/958] lg:min-h-0 lg:py-0">
				{image && (
					<Image
						src={image.src}
						alt={image.alt}
						fill
						sizes="(min-width: 1024px) 94vw, 100vw"
						placeholder={image.blurDataURL ? "blur" : "empty"}
						blurDataURL={image.blurDataURL}
						// Slightly oversized so the parallax drift never exposes the ink
						// backdrop at the edges; `data-parallax` is inert unless an ancestor
						// <Parallax> processes it (and under prefers-reduced-motion).
						className="scale-[1.12] object-cover"
						data-parallax="6"
					/>
				)}
				{/* Kit « BG opaque » veil = ink @ 0.25 — guarantees quote contrast (FR-016). */}
				<div aria-hidden className="absolute inset-0 bg-ink/25" />

				<blockquote className="relative z-10 mx-auto flex max-w-[85.4%] flex-col items-center gap-8 px-6 text-center text-paper lg:max-w-[1640px]">
					{/* Decorative quote marks (maquette « quotes » Tracé 8982). The arbitrary
					    text-[64px]/[120px] are an ornament glyph size, NOT brand type — the
					    justified arbitrary-value exception to Principle X (not the type scale). */}
					<span
						aria-hidden
						className="-top-2 lg:-top-8 -left-1 pointer-events-none absolute font-display text-[64px] leading-none lg:left-0 lg:text-[120px]"
					>
						“
					</span>
					<p className="whitespace-pre-line font-display font-semibold text-subtitle-sm leading-tight lg:text-subtitle lg:leading-[1.1]">
						<BrandText>{quote}</BrandText>
					</p>
					{attribution && (
						<figcaption className="font-sans text-body-sm lg:text-body">
							{attribution}
						</figcaption>
					)}
					<span
						aria-hidden
						className="-bottom-8 lg:-bottom-16 -right-1 pointer-events-none absolute rotate-180 font-display text-[64px] leading-none lg:right-0 lg:text-[120px]"
					>
						“
					</span>
				</blockquote>
			</figure>
		</section>
	);
}
