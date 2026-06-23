import type { Metadata } from "next";
import Image from "next/image";
import { BrandText, FeatureBlock, PageHero } from "@/design-system";
import { getSectorsPageProps } from "@/lib/sanity/sectorsPage";
import { cn } from "@/lib/utils";

// « Univers » is page-specific content (Principle VIII): this RSC is the connector — it
// fetches via `getSectorsPageProps()` (mapping isolated in `@/lib/sanity/sectorsPage.ts`)
// and composes the design-system components. Source of truth: Figma node 51:3386 (desktop
// only — no tablet/mobile frame; responsive is adapted per breakpoint).
//
// MOTION: the page is static — no scroll/appearance animations on the images (removed at
// the owner's request). The full-height hero is also static (first-screen readability).

const CONTAINER = "mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[7.29%]";

/** Generic « en savoir plus » control label (a UI affordance, not editorial content). */
const SECTOR_CTA_LABEL = "en savoir plus";

/** Slug for Umami tracking — last segment of the sector href (e.g. /univers/retail → retail). */
function sectorSlug(href: string, label: string): string {
	const seg = href.split("/").filter(Boolean).pop();
	return seg || label.toLowerCase();
}

export async function generateMetadata(): Promise<Metadata> {
	const { seo } = await getSectorsPageProps();
	return {
		title: seo.metaTitle,
		description: seo.metaDescription,
		openGraph: {
			title: seo.metaTitle,
			description: seo.metaDescription,
			images: seo.ogImage
				? [{ url: seo.ogImage.src, alt: seo.ogImage.alt }]
				: undefined,
		},
	};
}

export default async function UniversPage() {
	const { hero, intro, sectors, keyFigures } = await getSectorsPageProps();

	return (
		<main
			data-nav-logo-tone="onDark"
			data-nav-links-tone="onLight"
			data-nav-toggle-tone="onDark"
		>
			{/* 1 — Hero (split: dark cartouche + image), full screen height. Static. */}
			<PageHero
				variant="split"
				eyebrow={hero.eyebrow}
				titleOutline={hero.titleOutline}
				titleFill={hero.titleFill}
				image={hero.image}
			/>

			{/* 2 — Intro: cream panel + visual (left) · positioning statement + body (right) */}
			<section className="relative isolate overflow-hidden bg-paper">
				{/* Cream panel behind the visual (desktop), maquette: left ~35% of the frame */}
				<div
					aria-hidden
					className="absolute inset-y-0 left-0 hidden w-[35.2%] bg-cream lg:block"
				/>
				<div className={cn(CONTAINER, "relative")}>
					<div className="flex flex-col gap-10 py-14 md:py-20 lg:grid lg:grid-cols-[36%_minmax(0,1fr)] lg:items-center lg:gap-x-[8%] lg:py-[7%]">
						<div className="relative aspect-[613/764] w-full overflow-hidden bg-cream">
							{intro.image && (
								<Image
									src={intro.image.src}
									alt={intro.image.alt}
									fill
									sizes="(min-width: 1024px) 32vw, 90vw"
									placeholder={intro.image.blurDataURL ? "blur" : "empty"}
									blurDataURL={intro.image.blurDataURL}
									className="object-cover"
								/>
							)}
						</div>
						<div className="flex flex-col gap-8">
							<p className="font-display text-subtitle-sm text-ink leading-[1.2] lg:text-subtitle lg:leading-tight">
								<BrandText>{intro.statement}</BrandText>
							</p>
							<p className="max-w-[52ch] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
								{intro.text}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* 3 — Secteurs: four full-bleed bands (image + veil + title + rule + promise + CTA) */}
			<div className="flex flex-col">
				{sectors.map((sector) => (
					<FeatureBlock
						key={sector.href || sector.label}
						display
						image={sector.image?.src}
						alt={sector.image?.alt ?? `Estuaire — ${sector.label}`}
						blurDataURL={sector.image?.blurDataURL}
						title={sector.label}
						body={sector.promise}
						rule
						cta={{ label: SECTOR_CTA_LABEL, href: sector.href }}
						ctaUmamiEvent="sector_cta_click"
						ctaUmamiData={{ sector: sectorSlug(sector.href, sector.label) }}
						className="aspect-[390/470] md:aspect-[768/520] lg:aspect-[1920/718]"
					/>
				))}
			</div>

			{/* 4 — Infos clés: 2×2 grid of figures with cross dividers (static — text anchor) */}
			<section className="bg-cream">
				<div className={cn(CONTAINER, "py-16 md:py-20 lg:py-[5.2%]")}>
					<div className="grid grid-cols-1 md:grid-cols-2">
						{keyFigures.map((fig, i) => (
							<div
								key={fig.value}
								className={cn(
									"flex flex-col gap-6 py-10 md:py-16 lg:gap-8 lg:py-28",
									// Mobile: subtle separator between stacked figures
									i > 0 && "border-ink/15 border-t md:border-t-0",
									// Desktop cross dividers (2×2): vertical on left cells, horizontal on top cells
									"md:px-[5%]",
									i % 2 === 0 &&
										"md:border-ink md:border-r-[2px] lg:border-r-[3px]",
									i < 2 && "md:border-ink md:border-b-[2px] lg:border-b-[3px]",
								)}
							>
								{/* In the 2-col grid the half-column is too narrow for a long figure
								    value (e.g. « Atelier multimatériaux ») at the fixed 75px `text-title`
								    across the 1024–1440 desktop band → it overran the centre divider /
								    clipped at the edge. Scale the desktop value FLUIDLY between the
								    `text-title-sm` (2.5rem) and `text-title` (4.6875rem) token values so
								    it fits every width (75px preserved at the 1920 anchor). ADR 0022. */}
								<p className="font-display font-semibold text-[clamp(2.2rem,10vw,2.5rem)] text-ink leading-[1.13] tracking-[0.05em] lg:text-[clamp(2.5rem,4.4vw,4.6875rem)] lg:leading-[1.13]">
									<BrandText>{fig.value}</BrandText>
								</p>
								<p className="max-w-[34ch] font-sans font-semibold text-lead-sm text-ink leading-snug lg:text-lead">
									{fig.support}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
