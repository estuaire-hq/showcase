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
			{/* The band grows with the quote (min-height + padding, content-driven) instead of
			    being clipped. The fixed maquette ratio (1798/958) is re-locked only at 2xl
			    (≥1536) where the band is wide enough that the ratio's height always clears the
			    quote; in the 1024–1535 compression band the aspect would be too short, so the
			    band stays content-driven there (multi-resolution review, ADR 0022). */}
			<figure className="relative isolate flex min-h-[480px] items-center justify-center overflow-hidden bg-ink py-16 md:min-h-[600px] lg:py-20 2xl:aspect-[1798/958] 2xl:py-0">
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

				<blockquote className="relative z-10 mx-auto flex w-full max-w-[1640px] flex-col items-center px-4 text-center text-paper lg:px-8">
					{/* Decorative quote marks (maquette « quotes » Tracé 8982 ≈ 172×124px): large,
					    disproportionate, pinned to the content corners (client review 2026-06, H2 —
					    « les guillemets doivent être plus grosses/disproportionnées »). The arbitrary
					    glyph size is an ornament, NOT brand type — the justified arbitrary-value
					    exception to Principle X (not the type scale). */}
					<span
						aria-hidden
						className="-top-4 lg:-top-6 pointer-events-none absolute left-0 font-display font-semibold text-[96px] leading-none lg:text-[180px]"
					>
						“
					</span>
					{/* Text inset well within the marks' span so it never runs edge-to-edge (client
					    H2: « trop bord à bord »). */}
					<div className="mx-auto flex max-w-[1180px] flex-col items-center gap-8 py-14 lg:py-20">
						<p className="whitespace-pre-line font-display font-semibold text-subtitle-sm leading-tight lg:text-subtitle lg:leading-[1.1]">
							<BrandText>{quote}</BrandText>
						</p>
						{attribution && (
							<figcaption className="font-sans text-body-sm lg:text-body">
								{attribution}
							</figcaption>
						)}
					</div>
					<span
						aria-hidden
						className="-bottom-6 lg:-bottom-10 pointer-events-none absolute right-0 rotate-180 font-display font-semibold text-[96px] leading-none lg:text-[180px]"
					>
						“
					</span>
				</blockquote>
			</figure>
		</section>
	);
}
