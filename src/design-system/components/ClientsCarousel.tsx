"use client";

import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { CarouselArrow } from "./CarouselArrow";
import { ImageIcon } from "./ImageIcon";
import { SectionTitle } from "./SectionTitle";

export type ClientLogo = { src: string; alt: string };
/** A client cell: a brand name, optionally with a logo image (editorial Sanity asset). */
export type ClientEntry = { name: string; logo?: ClientLogo };

/**
 * « Ils nous font confiance » — client band (maquette portfolio « 06/ CLIENTS », node
 * 51:4064): an estuaire-blue frame around a white card holding the outline/fill title, a 3px
 * rule, then a row of square client cells flanked by prev/next arrows. Built for the client
 * review 2026-06 (I7: « rubrique manquante »).
 *
 * Each cell shows the client's LOGO when one is provided (editorial Sanity asset), otherwise
 * the brand NAME (brand-cased) — so the section shows the real client roster immediately and
 * upgrades to logos once the editor uploads them, instead of sitting empty. With no clients at
 * all it degrades to the maquette's placeholder frames. Presentational only (Principle VIII).
 *
 * The row is a scroll-snap track (touch + arrow driven, no autoplay → reduced-motion safe):
 * 4 cells per view on desktop, 2 on tablet, 1 on mobile; the arrows scroll it by one view.
 */
export function ClientsCarousel({
	clients = [],
	placeholderCount = 6,
	className,
}: {
	clients?: ClientEntry[];
	/** Placeholder cells shown when no client is available (maquette empty frames). */
	placeholderCount?: number;
	className?: string;
}) {
	const trackRef = useRef<HTMLUListElement>(null);
	const cells: (ClientEntry | null)[] =
		clients.length > 0
			? clients
			: Array.from({ length: placeholderCount }, () => null);

	const scrollByView = (dir: -1 | 1) => {
		const track = trackRef.current;
		if (!track) return;
		// One "view" = the visible width; smooth unless the user prefers reduced motion.
		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		track.scrollBy({
			left: dir * track.clientWidth,
			behavior: reduce ? "auto" : "smooth",
		});
	};

	const hasArrows = cells.length > 4;

	return (
		<section
			aria-label="Ils nous font confiance"
			className={cn("bg-estuaire px-5 py-5 md:px-10 lg:px-[3.18%]", className)}
		>
			<div className="bg-paper px-6 py-10 md:px-10 md:py-12 lg:px-[4.2%] lg:py-16">
				<SectionTitle
					outline="Ils nous font"
					fill="confiance"
					rule
					className="text-ink"
				/>

				<div className="mt-10 flex items-center gap-3 lg:mt-14 lg:gap-6">
					{hasArrows && (
						<CarouselArrow
							direction="left"
							tone="noir"
							onClick={() => scrollByView(-1)}
							aria-label="Clients précédents"
							className="shrink-0"
						/>
					)}
					<ul
						ref={trackRef}
						className="flex min-w-0 flex-1 snap-x gap-4 overflow-x-auto scroll-smooth lg:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						{cells.map((client, i) => (
							<li
								key={client?.name ?? `placeholder-${i}`}
								className="flex aspect-square w-[calc((100%-1rem)/2)] shrink-0 snap-start items-center justify-center border border-ink p-4 lg:w-[calc((100%-4.5rem)/4)]"
							>
								{client?.logo ? (
									<div className="relative h-full w-full">
										<Image
											src={client.logo.src}
											alt={client.logo.alt}
											fill
											sizes="(min-width: 1024px) 22vw, 45vw"
											className="object-contain p-2"
										/>
									</div>
								) : client ? (
									<span className="text-center font-display font-semibold text-body-sm text-ink leading-tight lg:text-body">
										<BrandText>{client.name}</BrandText>
									</span>
								) : (
									<span
										aria-hidden
										className="flex items-center justify-center text-ink"
									>
										<ImageIcon className="size-10" />
									</span>
								)}
							</li>
						))}
					</ul>
					{hasArrows && (
						<CarouselArrow
							direction="right"
							tone="noir"
							onClick={() => scrollByView(1)}
							aria-label="Clients suivants"
							className="shrink-0"
						/>
					)}
				</div>
			</div>
		</section>
	);
}
