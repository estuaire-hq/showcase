import type { Metadata } from "next";
import Image from "next/image";
import {
	homeRealisationCards,
	homeRealisationImages,
	homeRealisationSectors,
	REALISATIONS_HREF,
} from "@/content/homeRealisations";
import {
	Button,
	HeroSlideshow,
	SectionTitle,
	SectorButton,
	SplitSection,
} from "@/design-system";
import { Parallax } from "@/lib/motion/Parallax";
import { PinnedCaseStudies } from "@/lib/motion/PinnedCaseStudies";
import { getHomePageProps } from "@/lib/sanity/homePage";

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
	const { hero, intro, expertises, universSectors, realisations, vision } =
		await getHomePageProps();

	return (
		// Header tone over the hero (maquette 51:2221: dark-left / light-right): the
		// brand logo sits over the dark zone (onDark = white), the links over the white
		// zone (onLight = ink); the mobile toggle is over the dark zone (onDark).
		<main
			data-nav-logo-tone="onDark"
			data-nav-links-tone="onLight"
			data-nav-toggle-tone="onDark"
		>
			{/* 1 — Hero / slider (no entrance animation — the title reconstructs on slide
			    change; nothing fires on first paint) */}
			<HeroSlideshow label={hero.label} slides={hero.slides} />

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
									{/* Univers / secteurs — active links → /univers/[secteur] (FR-004), 2×2 */}
									<ul className="grid grid-cols-2 gap-4 lg:max-w-[812px]">
										{universSectors.map((sector, i) => {
											const slug =
												sector.href.split("/").filter(Boolean).pop() ?? "";
											return (
												<li key={sector.href}>
													<Button
														href={sector.href}
														tone={i === 0 ? "dark" : "light"}
														arrow={false}
														className={
															i === 0
																? "w-full"
																: "w-full bg-paper text-ink ring-1 ring-ink ring-inset"
														}
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
								<p className="max-w-[44ch] whitespace-pre-line text-body text-paper leading-relaxed lg:mr-[6%] lg:mb-[14%] lg:ml-[14%]">
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
						<div className="grid items-end gap-8 lg:grid-cols-[1fr_674px] lg:gap-16">
							<SectionTitle
								outline={realisations.titleOutline}
								fill={realisations.titleFill}
								className="text-ink"
							/>
							<div
								data-parallax="6"
								className="relative aspect-[674/700] w-full overflow-hidden"
							>
								<Image
									src={homeRealisationImages.feature.src}
									alt={homeRealisationImages.feature.alt}
									fill
									sizes="(min-width: 1024px) 36vw, 90vw"
									className="object-cover"
								/>
							</div>
						</div>

						{/* Bottom row: wide image (left) + « par secteur » categories (right) */}
						<div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1fr_536px] lg:items-center lg:gap-16">
							<div
								data-parallax="6"
								className="relative aspect-[1027/625] w-full overflow-hidden"
							>
								<Image
									src={homeRealisationImages.wide.src}
									alt={homeRealisationImages.wide.alt}
									fill
									sizes="(min-width: 1024px) 53vw, 90vw"
									className="object-cover"
								/>
							</div>
							{/* categories — all to the catalogue for now (FR-005) */}
							<div className="flex flex-col [&>a:first-child]:mt-0 [&>a]:-mt-[3px]">
								{homeRealisationSectors.map((sector) => (
									<SectorButton
										key={sector}
										label={sector}
										href={REALISATIONS_HREF}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Full-viewport pinned case studies (deviation from the maquette band):
					    each pins and reveals title → rule → details → CTA on scroll, with the
					    "voir nos réalisations" link integrated per panel. */}
					<div className="mt-16 lg:mt-24">
						<PinnedCaseStudies
							cards={homeRealisationCards}
							cta={realisations.cta}
						/>
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
