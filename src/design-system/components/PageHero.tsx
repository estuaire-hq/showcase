import Image from "next/image";
import type { ReactNode } from "react";
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
 *    cartouche overlapping its bottom-left. An optional breadcrumb sits top-left over the
 *    visual, below the navbar (expertise sub-pages).
 *  - `split` (« Univers » node 51:3386): a dark cartouche panel beside a clean image —
 *    panel left / image right on desktop, cartouche on top / image below on mobile (so
 *    the transparent navbar's logo + toggle sit over the dark cartouche → `onDark`, while
 *    the desktop links sit over the paper half → `onLight`). An optional breadcrumb sits
 *    inside the cartouche, above the eyebrow (sector pages).
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
	breadcrumb,
	className,
	cartoucheClassName,
	imageOverlayClassName = "bg-ink/25 md:hidden",
}: {
	eyebrow?: string;
	/** Stroked H1 lines (may contain \n). */
	titleOutline?: string;
	/** Solid H1 line(s) (may contain \n). */
	titleFill: string;
	image?: PageHeroImage;
	variant?: "overlay" | "split";
	/** Optional breadcrumb. In `split` it renders inside the cartouche, above the eyebrow
	 *  (sector pages: « univers / <Secteur> »). In `overlay` it renders top-left over the
	 *  visual, below the navbar (expertise sub-pages); the caller sets colour + per-breakpoint
	 *  visibility. Colour is inherited (paper on the dark hero). */
	breadcrumb?: ReactNode;
	className?: string;
	/** Override the dark title cartouche box (e.g. its width) per page — the default
	 *  geometry is tuned to « Nous découvrir »; other pages may need a wider cartouche. */
	cartoucheClassName?: string;
	/** Veil over the hero image (overlay variant). Default `bg-ink/25 md:hidden` (mobile only,
	 *  « Nous découvrir »); the expertise sub-pages veil tablet+desktop (`bg-ink/25 hidden md:block`). */
	imageOverlayClassName?: string;
}) {
	// Shared cartouche content (eyebrow + rule + H1). `withBreadcrumb` includes the breadcrumb
	// inside it (split variant); the overlay variant places the breadcrumb over the visual
	// instead. Single H1 (FR-014): outline lines (stroked) + the solid line.
	const cartouche = (withBreadcrumb: boolean) => (
		<div className="flex flex-col gap-5 lg:gap-12">
			{withBreadcrumb && breadcrumb && (
				<div className="-mb-1 lg:-mb-6">{breadcrumb}</div>
			)}
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
			<section className={cn("relative isolate bg-paper", className)}>
				{/* Full-bleed ink panel (desktop) — WIDER than the cartouche column so the image
				    column overlaps its right edge (maquette: ink 0→1090, image 1029→1780, ~61px
				    overlap). Behind the content (z-0); the image (z-10) paints over it. On mobile
				    the cartouche carries its own bg-ink (full-bleed, stacked). */}
				<div
					aria-hidden
					className="absolute inset-y-0 left-0 z-0 hidden w-[56.8%] bg-ink lg:block"
				/>
				{/* Full screen-height hero. Content TOP-aligns below the fixed navbar (transparent,
				    112px desktop / 80px mobile) — `items-start` + a top padding that clears the navbar
				    on short viewports and centres the block on tall ones (`max(7.5rem,14vh)`). Both
				    the cartouche and the image start at the same Y (maquette: eyebrow + image top at
				    220). Without this the centred content slid under the navbar on laptops. */}
				<div className="relative z-10 flex min-h-svh flex-col lg:grid lg:grid-cols-[1029fr_891fr] lg:items-start lg:pb-[8vh] lg:pt-[max(7.5rem,14vh)]">
					{/* Dark cartouche panel — top (mobile) / left (desktop). The transparent navbar
					    overlays it, so it carries its own navbar clearance on mobile/tablet
					    (pt-28 / md:pt-32 > the 80–112px navbar). Inline padding matches the page
					    container (px-5 / md:px-10 / lg 7.29vw = the same content edge as
					    `lg:px-[7.29%]` of a full-width container) so the title aligns with the rest of
					    the page; `lg:pl` is viewport-relative (vw), NOT column-relative. On desktop the
					    cartouche is transparent — the absolute ink panel above provides the black. */}
					<div className="bg-ink px-5 pt-28 pb-12 text-paper md:px-10 md:pt-32 md:pb-16 lg:bg-transparent lg:py-0 lg:pr-[6%] lg:pl-[7.29vw]">
						{cartouche(true)}
					</div>
					{/* Clean image — below (mobile) / right (desktop). Inline padding matches the
					    page container so the image's right edge aligns with the page content edge
					    (lg:pr 7.29vw). `flex-1` fills the remaining height on mobile (full-height hero);
					    `lg:items-start` top-aligns it with the cartouche on desktop. NO background:
					    the cell is transparent so the ink panel behind shows through above/below the
					    image — that's what makes the image overlap the ink (maquette: ink right edge
					    1090, image left 1029 → ~61px overlap, ink visible around it). */}
					<div className="flex flex-1 items-center justify-center px-5 pb-12 md:px-10 lg:flex-none lg:items-start lg:px-0 lg:py-0 lg:pr-[7.29vw] lg:pl-0">
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
		<section className={cn("relative isolate bg-paper", className)}>
			{/* Full-bleed visual. Veil is configurable per page (default: mobile only — « Nous
			    découvrir »; expertise sub-pages veil tablet+desktop). `bg-ink` is the degraded
			    backdrop when no image is configured yet. */}
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
				<div className={cn("absolute inset-0", imageOverlayClassName)} />
			</div>

			{/* Breadcrumb over the visual, top-left, clearing the fixed navbar. Caller sets
			    colour + per-breakpoint visibility. */}
			{breadcrumb && (
				<div className="absolute inset-x-0 top-[104px] z-20 mx-auto w-full max-w-[1920px] px-5 text-paper md:top-[120px] md:px-10 lg:px-[7.29%]">
					{breadcrumb}
				</div>
			)}

			{/* Dark title cartouche. Full-width below the image on mobile; overlapping the
			    image bottom-left on tablet/desktop (negative margin = maquette overlap). */}
			<div
				className={cn(
					"relative z-10 bg-ink px-[22px] py-9 text-paper md:-mt-[21%] md:ml-[5.2%] md:w-[89.6%] md:px-[50px] md:py-10 lg:-mt-[16.8%] lg:ml-[7.29%] lg:w-[71%] lg:px-[7%] lg:py-[6.3%]",
					cartoucheClassName,
				)}
			>
				{cartouche(false)}
			</div>
		</section>
	);
}
