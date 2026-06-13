import type { Metadata } from "next";
import Image from "next/image";
import {
	homeRealisationCards,
	homeRealisationImages,
	homeRealisationSectors,
	REALISATIONS_HREF,
} from "@/content/homeRealisations";
import {
	BrandText,
	Button,
	CaseStudyCard,
	HeroSlideshow,
	OutlineText,
	SectorButton,
	SplitSection,
} from "@/design-system";
import { Reveal } from "@/lib/motion/Reveal";
import { getHomePageProps } from "@/lib/sanity/homePage";

// The home is page-specific content (Principle VIII): this RSC is the connector — it
// fetches via `getHomePageProps()` (mapping isolated in `@/lib/sanity/homePage.ts`)
// and composes the design-system components. No global `src/components/` wrapper.
// Section motion lives in `<Reveal>` (`@/lib/motion`), keeping the DS presentational.

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
			{/* 1 — Hero / slider */}
			<Reveal>
				<HeroSlideshow label={hero.label} slides={hero.slides} />
			</Reveal>

			{/* 2 — Intro de positionnement */}
			<Reveal>
				<section className="bg-paper">
					<div className="mx-auto max-w-[1920px] px-5 py-16 md:px-10 lg:px-[7.3%] lg:py-24">
						<div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-[3%]">
							{/* LEFT — title (top); wide image + sector pills grouped at the bottom,
							    clear of the secondary image at the top of the right panel */}
							<div className="flex flex-col gap-10">
								<h2
									data-reveal
									className="font-display font-semibold text-[2.5rem] text-ink leading-[1.08] tracking-[0.05em] md:text-[3.25rem] lg:text-title lg:leading-[1.05]"
								>
									<OutlineText tier="title">{intro.titleOutline}</OutlineText>
									<span className="block whitespace-pre-line">
										<BrandText>{intro.titleFill}</BrandText>
									</span>
								</h2>
								<div className="flex flex-col gap-10 lg:mt-auto">
									{intro.imagePrimary && (
										<div
											data-image-reveal
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
									<div
										data-image-reveal
										className="relative mb-8 aspect-[613/450] w-full overflow-hidden lg:absolute lg:top-[5%] lg:-left-[14%] lg:mb-0 lg:w-[78%]"
									>
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
			</Reveal>

			{/* 3 — Nos expertises */}
			<Reveal>
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
			</Reveal>

			{/* 4 — Nos univers / Réalisations (cards + sector list are static, FR-005) */}
			<Reveal>
				<section className="bg-paper">
					<div className="mx-auto max-w-[1920px] px-5 pt-16 md:px-10 lg:px-[7.3%] lg:pt-24">
						{/* Top row: title (left, bottom-aligned) + feature image (right) */}
						<div className="grid items-end gap-8 lg:grid-cols-[1fr_674px] lg:gap-16">
							<h2
								data-reveal
								className="font-display font-semibold text-[2.5rem] text-ink leading-[1.08] tracking-[0.05em] md:text-[3.25rem] lg:text-title lg:leading-[1.05]"
							>
								<OutlineText tier="title">
									{realisations.titleOutline}
								</OutlineText>
								<span className="block">
									<BrandText>{realisations.titleFill}</BrandText>
								</span>
							</h2>
							<div
								data-image-reveal
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
								data-image-reveal
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

					{/* Case-study bands (full-bleed, static) */}
					<div className="mt-12 flex flex-col lg:mt-20">
						{homeRealisationCards.map((card, i) => (
							<span
								key={card.image}
								data-umami-event="home_realisation_click"
								data-umami-event-card={String(i)}
							>
								<CaseStudyCard
									image={card.image}
									alt={card.title}
									title={card.title}
									meta={card.meta}
									href={REALISATIONS_HREF}
								/>
							</span>
						))}
					</div>

					<div className="flex justify-center px-5 py-14">
						<Button
							href={realisations.cta.href}
							tone="dark"
							className="w-full max-w-[536px]"
						>
							{realisations.cta.label}
						</Button>
					</div>
				</section>
			</Reveal>

			{/* 5 — Notre vision */}
			<Reveal>
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
			</Reveal>
		</main>
	);
}
