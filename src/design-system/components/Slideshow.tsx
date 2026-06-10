"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Slide = { src: string; alt: string; blurDataURL?: string };

/**
 * Image slideshow — cross-fades through a list of images on a timer. The IMAGES
 * are content (configured in Sanity); this component owns only the MECHANICS
 * (autoplay + cross-fade). Decoupled: takes resolved `{ src, alt }` (the page
 * builds them from Sanity via `urlFor`). Honors `prefers-reduced-motion` (no
 * autoplay — shows the first image). Fills its parent, so give it a sized box.
 */
export function Slideshow({
	images,
	interval = 5000,
	sizes = "100vw",
	className,
}: {
	images: Slide[];
	/** ms between slides (default 5000). */
	interval?: number;
	sizes?: string;
	className?: string;
}) {
	const [active, setActive] = useState(0);

	useEffect(() => {
		if (images.length < 2) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const id = setInterval(
			() => setActive((i) => (i + 1) % images.length),
			interval,
		);
		return () => clearInterval(id);
	}, [images.length, interval]);

	if (images.length === 0) return null;

	return (
		<div className={cn("relative overflow-hidden", className)}>
			{images.map((img, i) => (
				<Image
					key={img.src}
					src={img.src}
					alt={img.alt}
					fill
					sizes={sizes}
					priority={i === 0}
					placeholder={img.blurDataURL ? "blur" : "empty"}
					blurDataURL={img.blurDataURL}
					aria-hidden={i !== active}
					className={cn(
						"object-cover transition-opacity duration-1000 ease-out",
						i === active ? "opacity-100" : "opacity-0",
					)}
				/>
			))}
		</div>
	);
}
