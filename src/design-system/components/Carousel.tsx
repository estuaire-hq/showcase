"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { CarouselArrow } from "./CarouselArrow";

export type CarouselImage = { src: string; alt: string; blurDataURL?: string };

/**
 * Carrousel d'images présentationnel (intro « version fournie » d'une réalisation) : une grande
 * visuelle à la fois + navigation précédent/suivant (`CarouselArrow`) et un compteur. État d'index
 * interne — aucun fetch (Principe VIII). Pas d'autoplay (rien ne bouge sans action utilisateur, donc
 * `prefers-reduced-motion` est respecté nativement) ; la transition d'opacité est désactivée sous
 * reduced-motion via `motion-reduce:`.
 *
 * `tone` colore les flèches selon le fond ; `aspect` (utilitaire Tailwind) pilote le ratio du cadre.
 */
export function Carousel({
	images,
	className,
	aspect = "aspect-[3/2]",
	tone = "noir",
	sizes = "(min-width: 1024px) 60vw, 100vw",
}: {
	images: CarouselImage[];
	className?: string;
	aspect?: string;
	tone?: "blanc" | "noir";
	sizes?: string;
}) {
	const [index, setIndex] = useState(0);
	const labelId = useId();
	const count = images.length;
	if (count === 0) return null;

	const go = (dir: -1 | 1) => setIndex((i) => (i + dir + count) % count);

	return (
		<section
			aria-roledescription="carrousel"
			aria-label="Galerie du projet"
			className={cn("flex flex-col gap-4", className)}
		>
			<div className={cn("relative w-full overflow-hidden bg-cream", aspect)}>
				{images.map((image, i) => (
					<Image
						key={image.src}
						src={image.src}
						alt={image.alt}
						fill
						sizes={sizes}
						placeholder={image.blurDataURL ? "blur" : "empty"}
						blurDataURL={image.blurDataURL}
						aria-hidden={i !== index}
						className={cn(
							"object-cover transition-opacity duration-500 ease-out motion-reduce:transition-none",
							i === index ? "opacity-100" : "opacity-0",
						)}
					/>
				))}
			</div>

			{count > 1 && (
				<div className="flex items-center justify-between">
					<p
						id={labelId}
						className="font-display font-semibold text-body text-ink"
					>
						<span aria-live="polite">{index + 1}</span>
						<span className="text-ink/40"> / {count}</span>
					</p>
					<div className="flex items-center gap-2">
						<CarouselArrow
							direction="left"
							tone={tone}
							onClick={() => go(-1)}
							aria-label="Image précédente"
						/>
						<CarouselArrow
							direction="right"
							tone={tone}
							onClick={() => go(1)}
							aria-label="Image suivante"
						/>
					</div>
				</div>
			)}
		</section>
	);
}
