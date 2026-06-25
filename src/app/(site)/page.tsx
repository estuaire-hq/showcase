import type { Metadata } from "next";
import Image from "next/image";
import { UNIVERS } from "@/content/realisations";
import {
	Button,
	SectionTitle,
	SectorButton,
	SplitSection,
} from "@/design-system";
import { CaseStudies } from "@/lib/motion/CaseStudies";
import { Parallax } from "@/lib/motion/Parallax";
import { getHomePageProps } from "@/lib/sanity/homePage";
import { getLatestRealisations } from "@/lib/sanity/realisation";
import { cn } from "@/lib/utils";
import { HomeHero } from "./_components/HomeHero";

/** Deep-link to the portfolio filtered on a given univers (demock — FR-023). */
const universHref = (label: string) =>
	`/realisations?univers=${encodeURIComponent(label)}`;

// The home is page-specific content (Principle VIII): this RSC is the connector — it
// fetches via `getHomePageProps()` (mapping isolated in `@/lib/sanity/homePage.ts`)
// and composes the design-system components. No global `src/components/` wrapper.
// Section motion lives in `<Parallax>` (`@/lib/motion`, scroll-driven, nothing on first
// paint), keeping the DS presentational.

export async function generateMetadata(): Promise<Metadata> {
	const { seo } = await getHomePageProps();
	return {
		// Absolute → bypass the root "%s | Estuaire" template for the home (FR-014).
		title: { absolute: seo.metaTitle },
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

export default async function HomePage() {
	const [
		{ hero, intro, expertises, universSectors, realisations, vision },
		latest,
	] = await Promise.all([getHomePageProps(), getLatestRealisations(5)]);
	// Demock (FR-023) : 3 cartes = 3 plus récentes publiées ; visuels décoratifs = covers suivantes.
	const featuredCards = latest.slice(0, 3).map((r) => ({
		image: r.cover?.src ?? "",
		title: r.title,
		meta: r.meta,
		href: `/realisations/${r.slug}`,
	}));
	const featureImage = latest[3]?.cover ?? latest[0]?.cover;
	const wideImage = latest[4]?.cover ?? latest[1]?.cover;

	return (
		// Header tone over the hero (maquette 51:2221: dark-left / light-right): the
		// brand logo sits over the dark zone (onDark = white), the links over the white
		// zone (onLight = ink); the mobile toggle is over the dark zone (onDark).
		<main
			data-nav-logo-tone="onDark"
			data-nav-links-tone="onLight"
			data-nav-toggle-tone="onDark"
		>
			{/* 1 — Hero / slider, wrapped by the client `HomeHero` orchestrator: a fresh home
			    load plays the black site-entry intro (logomark trace → « Estuaire » →
			    bascule), then hands off to the slideshow. */}
			<HomeHero label={hero.label} slides={hero.slides} />

			{/* 2 — Intro de positionnement (depth parallax between the two images) */}
			<Parallax>
				<section className="bg-paper">
					<div className="mx-auto max-w-[1920px] px-5 py-16 md:px-10 lg:px-[7.3%] lg:py-24">
						<div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-[3%]">
							{/* LEFT — title (top); wide image + sector pills grouped at the bottom,
							    clear of the secondary image at the top of the right panel */}
							<div className="flex flex-col gap-10">
								<SectionTitle
									outline={intro.titleOutline}
									fill={intro.titleFill}
									className="text-ink"
								/>
								<div className="flex flex-col gap-10 lg:mt-auto">
									{intro.imagePrimary && (
										<div
											data-parallax="26"
											data-parallax-mode="rise"
											className="relative aspect-[950/500] w-full overflow-hidden"
										>
											<Image
												src={intro.imagePrimary.src}
												alt={intro.imagePrimary.alt}
												fill
												sizes="(min-width: 1024px) 45vw, 90vw"
												placeholder={
													intro.imagePrimary.blurDataURL ? "blur" : "empty"
												}
												blurDataURL={intro.imagePrimary.blurDataURL}
												className="object-cover"
											/>
										</div>
									)}
									{/* Univers / secteurs — active links → /univers/[secteur] (FR-004).
									    Maquette (home 51:2221 / 77:3149 / 77:3150): 1 column stacked on
									    mobile + tablet, 2×2 grid on desktop. « scénographie » (longest
									    label) overflowed because the grid stayed `grid-cols-2` at every
									    width — stacking to one column below `lg` fixes it. */}
									<ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:max-w-[812px]">
										{universSectors.map((sector, i) => {
											const slug =
												sector.href.split("/").filter(Boolean).pop() ?? "";
											const active = i === 0;
											return (
												<li key={sector.href}>
													<Button
														href={sector.href}
														tone={active ? "dark" : "light"}
														arrow={false}
														className={cn(
															// These univers pills are their OWN maquette element, not the CTA
															// Button (no arrow → drop its wide px-14). Maquette sizes: 44px·20px
															// (text-lead-sm) on mobile/tablet, 75px·35px (text-lead) at the 1920
															// desktop frame. The 35px « scénographie » (≈249px) needs a pill ≳297px
															// to clear its padding — in the 2-col grid that only holds from ~1470px,
															// so it would overflow the 1024–1279 band. Keep the compact 20px/44px
															// pill across the whole 2-col range and step up to 75px/35px only at 2xl
															// (1536), where the column is wide enough. Overrides apply at THIS
															// call-site only; Button stays the arrow CTA elsewhere.
															"w-full min-h-11 px-6 py-1 text-lead-sm 2xl:min-h-[75px] 2xl:text-lead",
															!active &&
																"bg-paper text-ink ring-1 ring-ink ring-inset",
														)}
														data-umami-event="home_sector_click"
														data-umami-event-sector={slug}
													>
														{sector.label}
													</Button>
												</li>
											);
										})}
									</ul>
								</div>
							</div>

							{/* RIGHT — tall blue panel: secondary image at top, text at bottom */}
							<div className="relative flex min-h-[480px] flex-col justify-end bg-estuaire p-8 md:p-12 lg:min-h-[1180px] lg:p-0">
								{intro.imageSecondary && (
									<div className="relative mb-8 aspect-[613/450] w-full overflow-hidden lg:absolute lg:top-[5%] lg:-left-[14%] lg:mb-0 lg:w-[78%]">
										<Image
											src={intro.imageSecondary.src}
											alt={intro.imageSecondary.alt}
											fill
											sizes="(min-width: 1024px) 36vw, 90vw"
											placeholder={
												intro.imageSecondary.blurDataURL ? "blur" : "empty"
											}
											blurDataURL={intro.imageSecondary.blurDataURL}
											className="object-cover"
										/>
									</div>
								)}
								<p
									data-reveal-fade
									className="max-w-[44ch] whitespace-pre-line text-body text-paper leading-relaxed lg:mr-[6%] lg:mb-[14%] lg:ml-[14%]"
								>
									{intro.text}
								</p>
							</div>
						</div>
					</div>
				</section>
			</Parallax>

			{/* 3 — Nos expertises */}
			<Parallax>
				<SplitSection
					variant="expertises"
					image={expertises.image}
					titleOutline={expertises.titleOutline}
					titleFill={expertises.titleFill}
					text={expertises.text}
					cta={expertises.cta}
					ctaUmamiEvent="home_cta_click"
					ctaUmamiData={{ section: "expertises" }}
				/>
			</Parallax>

			{/* 4 — Nos univers / Réalisations (cards + sector list are static, FR-005) */}
			<Parallax>
				<section className="relative bg-paper">
					<div className="mx-auto max-w-[1920px] px-5 pt-16 md:px-10 lg:px-[7.3%] lg:pt-24">
						{/* Top row: title (left, bottom-aligned) + feature image (right) */}
						{/* The image track was a FIXED 674px; in the 1024–1280 desktop band the title
						    column (its long word sets the 1fr min-content) + 674px + gap exceeded the
						    container, so the grid overflowed and pushed the image off-screen.
						    `minmax(0,674px)` lets the image shrink when space is tight (still 674px
						    from ~1366 up, incl. the 1920 anchor). ADR 0022. */}
						<div className="grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,674px)] lg:gap-16">
							<SectionTitle
								outline={realisations.titleOutline}
								fill={realisations.titleFill}
								className="text-ink"
							/>
							<div
								data-parallax="6"
								className="relative aspect-[674/700] w-full overflow-hidden bg-cream"
							>
								{featureImage && (
									<Image
										src={featureImage.src}
										alt={featureImage.alt}
										fill
										sizes="(min-width: 1024px) 36vw, 90vw"
										placeholder={featureImage.blurDataURL ? "blur" : "empty"}
										blurDataURL={featureImage.blurDataURL}
										className="object-cover"
									/>
								)}
							</div>
						</div>

						{/* Bottom row: wide image (left) + « par secteur » categories (right) */}
						<div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1fr_536px] lg:items-center lg:gap-16">
							<div
								data-parallax="6"
								className="relative aspect-[1027/625] w-full overflow-hidden bg-cream"
							>
								{wideImage && (
									<Image
										src={wideImage.src}
										alt={wideImage.alt}
										fill
										sizes="(min-width: 1024px) 53vw, 90vw"
										placeholder={wideImage.blurDataURL ? "blur" : "empty"}
										blurDataURL={wideImage.blurDataURL}
										className="object-cover"
									/>
								)}
							</div>
							{/* categories — each deep-links to the portfolio filtered on its univers (FR-023).
							    Each row carries its TOP rule; the container draws the final bottom rule so
							    every separator stays an exact 3px (no overlap doubling). */}
							<div className="flex flex-col border-ink border-b-[3px]">
								{UNIVERS.map((sector) => (
									<SectorButton
										key={sector}
										label={sector}
										href={universHref(sector)}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Full-bleed case-study bands (maquette « CAS STUDY »): each reveals its
					    title → rule → meta on entry while its image drifts in a light
					    parallax — natural scroll, no pin. One shared "voir nos réalisations"
					    pill sits below the bands. */}
					<div className="mt-16 pb-16 lg:mt-24 lg:pb-24">
						<CaseStudies cards={featuredCards} cta={realisations.cta} />
					</div>
				</section>
			</Parallax>

			{/* 5 — Notre vision */}
			<Parallax>
				<SplitSection
					variant="vision"
					image={vision.image}
					titleOutline={vision.titleOutline}
					titleFill={vision.titleFill}
					text={vision.text}
					cta={vision.cta}
					ctaUmamiEvent="home_cta_click"
					ctaUmamiData={{ section: "vision" }}
				/>
			</Parallax>
		</main>
	);
}
