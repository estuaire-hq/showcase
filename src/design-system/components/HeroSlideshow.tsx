"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { OutlineText } from "../typography/OutlineText";

export type HeroSlide = {
	/** Resolved image URL (page builds it from Sanity via urlFor). Optional: the
	 *  hero degrades to its dark panel + title when no image is configured yet. */
	src?: string;
	alt: string;
	/** Contour lines (may contain \n). Rendered with OutlineText. */
	titleOutline: string;
	/** Solid last line. Rendered filled. */
	titleFill: string;
	blurDataURL?: string;
};

/**
 * Hero slideshow (maquette « 02/SLIDER v1 », nodes 51:2420 + 51:2221 / 77:3149 /
 * 77:3150). Cross-fades the IMAGE and the TITLE together on a timer — no manual
 * control (FR-002). The `label` is the constant brand H1 (FR-014) above the rotating
 * title; each slide's title is a contour part (OutlineText) + a solid part.
 *
 * Geometry reproduced per breakpoint (proportions of each Figma frame):
 *  - desktop: dark panel left 56.8%; image is a CONTAINED window straddling the
 *    dark/white seam (left 43.2%, top 23.4%, height 63.6%, right margin 7.3%);
 *  - tablet:  dark panel left 64.2%; image window right (left 51%, top 30.6%, h 51.3%);
 *  - mobile:  full dark; text top, image a band at the bottom.
 *
 * Honors `prefers-reduced-motion`: no autoplay, the first slide stays frozen.
 */
export function HeroSlideshow({
	label,
	slides,
	interval = 6000,
	className,
}: {
	label: string;
	slides: HeroSlide[];
	/** ms between slides (default 6000). */
	interval?: number;
	className?: string;
}) {
	const [active, setActive] = useState(0);

	useEffect(() => {
		if (slides.length < 2) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const id = setInterval(
			() => setActive((i) => (i + 1) % slides.length),
			interval,
		);
		return () => clearInterval(id);
	}, [slides.length, interval]);

	if (slides.length === 0) return null;

	return (
		<section
			data-hero
			className={cn(
				"relative isolate flex min-h-[611px] flex-col overflow-hidden bg-ink text-paper md:block md:min-h-0 md:h-[72.4vw] md:max-h-[760px] md:bg-paper lg:h-svh lg:max-h-none",
				className,
			)}
		>
			{/* Dark panel: full on mobile, left 64.2% (md) / 56.8% (lg). */}
			<div
				aria-hidden
				className="absolute inset-0 -z-10 bg-ink md:right-[35.8%] lg:right-[48%]"
			/>

			{/* Text column — in the dark zone. */}
			<div className="z-10 flex flex-col justify-start px-5 pt-28 pb-8 md:absolute md:inset-0 md:w-[64.2%] md:justify-center md:px-10 md:pt-0 md:pb-0 lg:w-[52%] lg:justify-end lg:px-[7%] lg:pb-[15%]">
				<h1 className="font-display font-semibold text-[2.5rem] leading-none tracking-[0.05em] md:text-[clamp(2.5rem,7vw,6.25rem)] lg:text-display lg:leading-none">
					<BrandText>{label}</BrandText>
				</h1>
				{/* Rotating titles: only the active one is visible / exposed. */}
				<div className="relative mt-3 md:mt-5">
					{slides.map((slide, i) => (
						<p
							key={`${slide.titleOutline}-${slide.titleFill}`}
							aria-hidden={i !== active}
							className={cn(
								"font-display font-semibold text-[1.75rem] leading-[1.08] tracking-[0.02em] transition-opacity duration-1000 ease-out md:text-[clamp(1.75rem,5.2vw,4.6875rem)] lg:leading-none",
								i === active
									? "relative opacity-100"
									: "pointer-events-none absolute inset-0 opacity-0",
							)}
						>
							<OutlineText tier="title" className="block whitespace-pre-line">
								{slide.titleOutline}
							</OutlineText>
							<span className="block">
								<BrandText>{slide.titleFill}</BrandText>
							</span>
						</p>
					))}
				</div>
			</div>

			{/* Image window — band at the bottom (mobile), contained window (md/lg). */}
			<div
				data-image-reveal
				className="relative mx-5 mt-auto mb-8 h-[228px] overflow-hidden md:absolute md:mx-0 md:my-0 md:left-[51%] md:right-[5.2%] md:top-[30.6%] md:h-[51.3%] lg:left-[43.2%] lg:right-[7.3%] lg:top-[23.4%] lg:h-[63.6%]"
			>
				{slides.map((slide, i) =>
					slide.src ? (
						<Image
							key={slide.src}
							src={slide.src}
							alt={slide.alt}
							fill
							sizes="(min-width: 1024px) 50vw, (min-width: 768px) 44vw, 90vw"
							priority={i === 0}
							placeholder={slide.blurDataURL ? "blur" : "empty"}
							blurDataURL={slide.blurDataURL}
							aria-hidden={i !== active}
							className={cn(
								"object-cover transition-opacity duration-1000 ease-out",
								i === active ? "opacity-100" : "opacity-0",
							)}
						/>
					) : null,
				)}
			</div>
		</section>
	);
}
