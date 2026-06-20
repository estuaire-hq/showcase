import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
	BrandText,
	Breadcrumb,
	PageHero,
	Pill,
	SectionTitle,
	Testimonial,
} from "@/design-system";
import { Parallax } from "@/lib/motion/Parallax";
import { getSectorDetailProps } from "@/lib/sanity/sectorDetail";
import { cn } from "@/lib/utils";

// Sector detail page (« univers / <Secteur> ») — the generic template the four sectors
// share (FR-008); only content + visuals vary. Page-specific content (Principle VIII):
// this RSC is the connector — it fetches via `getSectorDetailProps(slug)` (mapping isolated
// in `@/lib/sanity/sectorDetail.ts`) and composes the design-system components. Source of
// truth: Figma desktop nodes 51:3520/3661/3797/3929 (responsive adapted per breakpoint).
//
// Dynamically rendered + ISR-cached via `sanityFetch` (cache tags, revalidated by the
// Sanity webhook) — same model as the other site pages (Principle I); an unknown slug
// resolves to `null` → `notFound()` at request time (FR-009). No `generateStaticParams`:
// `sanityFetch` reads the perspective cookie (dynamic), so a build-time prerender is
// neither possible nor needed — content edits reflect via revalidation, not a rebuild.

const CONTAINER = "mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[7.29%]";

type Params = { slug: string };

export async function generateMetadata(props: {
	params: Promise<Params>;
}): Promise<Metadata> {
	const { slug } = await props.params;
	const data = await getSectorDetailProps(slug);
	if (!data) return {};
	const { seo } = data;
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

export default async function SectorDetailPage(props: {
	params: Promise<Params>;
}) {
	const { slug } = await props.params;
	const data = await getSectorDetailProps(slug);
	if (!data) notFound();

	const { title, hero, intro, enjeux, contraintes, argument, citations } = data;

	return (
		<main
			data-nav-logo-tone="onDark"
			data-nav-links-tone="onLight"
			data-nav-toggle-tone="onDark"
		>
			{/* 1 — Hero (split: dark cartouche + breadcrumb + image), full screen height. */}
			<PageHero
				variant="split"
				breadcrumb={
					<Breadcrumb
						items={[{ label: "univers", href: "/univers" }, { label: title }]}
					/>
				}
				eyebrow={hero.eyebrow}
				titleOutline={hero.titleOutline}
				titleFill={hero.titleFill}
				image={hero.image}
			/>

			{/* 2 — Intro: cream panel + image cluster (left) · statement/body, enjeux,
			    contraintes (right). Maquette « 02/ INTRO » — desktop two-column. */}
			<section className="relative isolate overflow-hidden bg-paper">
				<div
					aria-hidden
					className="absolute inset-y-0 left-0 hidden w-[42.4%] bg-cream lg:block"
				/>
				<div className={cn(CONTAINER, "relative")}>
					<div className="flex flex-col gap-16 py-14 md:py-20 lg:gap-24 lg:py-[6%]">
						{/* Row A — image cluster + intro statement/body */}
						<div className="lg:grid lg:grid-cols-[42%_minmax(0,1fr)] lg:items-center lg:gap-x-[8%]">
							<div className="relative mb-12 lg:mb-0">
								<div className="relative aspect-[475/712] w-[78%] overflow-hidden bg-cream">
									{intro.imagePortrait && (
										<Image
											src={intro.imagePortrait.src}
											alt={intro.imagePortrait.alt}
											fill
											sizes="(min-width: 1024px) 26vw, 70vw"
											placeholder={
												intro.imagePortrait.blurDataURL ? "blur" : "empty"
											}
											blurDataURL={intro.imagePortrait.blurDataURL}
											className="object-cover"
										/>
									)}
								</div>
								<div className="-mt-[28%] relative ml-auto aspect-square w-[52%] overflow-hidden bg-cream">
									{intro.imageSquare && (
										<Image
											src={intro.imageSquare.src}
											alt={intro.imageSquare.alt}
											fill
											sizes="(min-width: 1024px) 18vw, 48vw"
											placeholder={
												intro.imageSquare.blurDataURL ? "blur" : "empty"
											}
											blurDataURL={intro.imageSquare.blurDataURL}
											className="object-cover"
										/>
									)}
								</div>
							</div>
							<div className="flex flex-col gap-8">
								<p className="font-display font-semibold text-subtitle-sm text-ink leading-[1.2] lg:text-subtitle lg:leading-tight">
									<BrandText>{intro.statement}</BrandText>
								</p>
								<p className="max-w-[52ch] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
									{intro.text}
								</p>
							</div>
						</div>

						{/* Row B — big visual + « Les enjeux » (ruled list) */}
						<div className="lg:grid lg:grid-cols-[42%_minmax(0,1fr)] lg:items-center lg:gap-x-[8%]">
							<div className="relative mb-12 aspect-[5/4] w-full overflow-hidden bg-cream lg:mb-0">
								{intro.imageMain && (
									<Image
										src={intro.imageMain.src}
										alt={intro.imageMain.alt}
										fill
										sizes="(min-width: 1024px) 40vw, 90vw"
										placeholder={intro.imageMain.blurDataURL ? "blur" : "empty"}
										blurDataURL={intro.imageMain.blurDataURL}
										className="object-cover"
									/>
								)}
							</div>
							<div className="flex flex-col gap-8 text-ink">
								<SectionTitle
									outline={enjeux.titleOutline}
									fill={enjeux.titleFill}
								/>
								<ul className="flex flex-col border-ink border-b-2 lg:border-b-[3px]">
									{enjeux.items.map((item) => (
										<li
											key={item}
											className="border-ink border-t-2 py-4 font-sans font-semibold text-body-sm leading-snug lg:border-t-[3px] lg:py-5 lg:text-body"
										>
											{item}
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Row C — « Les contraintes terrain » (chip cloud) */}
						<div className="lg:grid lg:grid-cols-[42%_minmax(0,1fr)] lg:gap-x-[8%]">
							<div aria-hidden className="hidden lg:block" />
							<div className="flex flex-col gap-8 text-ink">
								<SectionTitle
									outline={contraintes.titleOutline}
									fill={contraintes.titleFill}
								/>
								<div className="flex flex-wrap gap-3 lg:gap-4">
									{contraintes.chips.map((chip) => (
										<Pill key={chip.label} emphasis={chip.emphasis}>
											{chip.label}
										</Pill>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 3 — Argument: cream inset panel + centered positioning statement */}
			<section className="bg-paper py-12 md:py-16 lg:py-[3.2%]">
				<div className="mx-4 md:mx-8 lg:mx-[3.18%]">
					<div className="bg-cream px-6 py-16 md:px-12 md:py-20 lg:px-[8%] lg:py-[6.5%]">
						<p className="mx-auto max-w-[1640px] whitespace-pre-line text-center font-display font-semibold text-subtitle-sm text-ink leading-tight lg:text-subtitle lg:leading-[1.3]">
							<BrandText>{argument}</BrandText>
						</p>
					</div>
				</div>
			</section>

			{/* 4 — Citations: two testimonial bands (image + veil + quote + attribution).
			    The maquette labels these « image parallax fixe » → a restrained scrubbed
			    parallax on the background (estuaire-motion); inert under reduced motion. */}
			<Parallax className="flex flex-col">
				{citations.map((citation, i) => (
					<Testimonial
						key={citation.attribution ?? `citation-${i}`}
						quote={citation.quote}
						attribution={citation.attribution}
						image={citation.image}
					/>
				))}
			</Parallax>
		</main>
	);
}
