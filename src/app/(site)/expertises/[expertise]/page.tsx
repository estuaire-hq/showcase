import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EXPERTISE_SLUGS } from "@/content/expertiseSubpages";
import {
	BrandText,
	Breadcrumb,
	Button,
	CaseStudyCard,
	EngagementsGrid,
	PageHero,
	SectionTitle,
} from "@/design-system";
import { getExpertiseSubpageProps } from "@/lib/sanity/expertiseSubpage";
import type { ResolvedImage } from "@/lib/sanity/mapImage";
import { cn, umamiAttrs } from "@/lib/utils";

// Expertise sub-pages are page-specific content (Principle VIII): this dynamic RSC is the
// connector — it resolves the content by slug via `getExpertiseSubpageProps(slug)` (mapping
// isolated in `@/lib/sanity/expertiseSubpage.ts`) and composes the design-system components.
// ONE route serves the three sub-pages (same gabarit, distinct content — Principle IV).
//
// Section order follows the maquette (agencement 51:3008): hero (02/ SLIDER, breadcrumb + dark
// cartouche) · intro (03/, phrase phare + text + visual, desktop blue left-half) · responsable
// (04/, outline/fill engagement title + rule + text + visuals) · engagements (05/, "Nos
// engagements" + 6 numbered) · cas study (06/, title + band + button). The « BIG FOOTER » (CTA +
// footer) is mounted by the (site) shell — NOT rendered here.
//
// MOTION: scroll cinematics are applied in a dedicated pass (estuaire-motion); the hero is static.

const CONTAINER = "mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[7.29%]";

export function generateStaticParams() {
	return EXPERTISE_SLUGS.map((expertise) => ({ expertise }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ expertise: string }>;
}): Promise<Metadata> {
	const { expertise } = await params;
	const props = await getExpertiseSubpageProps(expertise);
	if (!props) return {};
	const { seo } = props;
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

/** A content image. Positioning (relative/absolute + box) comes from `className`. Graceful
 *  no-op when the slot is empty. */
function Figure({
	image,
	className,
	sizes = "(min-width: 1024px) 45vw, 90vw",
}: {
	image: ResolvedImage | undefined;
	className?: string;
	sizes?: string;
}) {
	if (!image) return null;
	return (
		<div className={cn("overflow-hidden", className)}>
			<Image
				src={image.src}
				alt={image.alt}
				fill
				sizes={sizes}
				placeholder={image.blurDataURL ? "blur" : "empty"}
				blurDataURL={image.blurDataURL}
				className="object-cover"
			/>
		</div>
	);
}

export default async function ExpertiseSubpage({
	params,
}: {
	params: Promise<{ expertise: string }>;
}) {
	const { expertise } = await params;
	const props = await getExpertiseSubpageProps(expertise);
	if (!props) notFound();

	const { breadcrumb, hero, intro, responsable, engagements, caseStudy, slug } =
		props;
	const caseStudyUmami = umamiAttrs("case_study_click", { expertise: slug });

	return (
		<main
			data-nav-logo-tone="onDark"
			data-nav-links-tone="onDark"
			data-nav-toggle-tone="onDark"
		>
			{/* 1 — Hero (02/ SLIDER): full-bleed visual + breadcrumb + dark title cartouche */}
			<PageHero
				eyebrow={hero.eyebrow}
				titleOutline={hero.titleOutline}
				titleFill={hero.titleFill}
				image={hero.image}
				cartoucheClassName="lg:w-[78.2%]"
				imageOverlayClassName="bg-ink/25 hidden md:block"
				breadcrumb={
					<Breadcrumb items={breadcrumb.items} className="hidden lg:block" />
				}
			/>

			{/* 2 — Intro (03/): phrase phare + body (right on desktop) · visual (left on desktop,
			    over the blue half) — flips per breakpoint (read on the maquette). */}
			<section className="relative isolate overflow-hidden bg-paper">
				{intro.blueHalf && (
					<div
						aria-hidden
						className="absolute inset-y-0 left-0 z-0 hidden w-[42.4%] bg-estuaire lg:block"
					/>
				)}
				<div
					className={cn(CONTAINER, "relative z-10 py-14 md:py-20 lg:py-[7vw]")}
				>
					<div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:items-center md:gap-x-[6%]">
						{/* Text */}
						<div className="flex flex-col gap-8 md:order-1 lg:order-2">
							<p className="font-display font-normal text-subtitle-sm leading-[1.2] text-ink lg:text-subtitle">
								<BrandText>{intro.statement}</BrandText>
							</p>
							<p className="max-w-[52ch] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
								{intro.text}
							</p>
						</div>
						{/* Visual */}
						<div className="md:order-2 lg:order-1">
							<Figure
								image={intro.image}
								className="relative aspect-[752/751] w-full"
								sizes="(min-width: 1024px) 40vw, (min-width: 768px) 38vw, 85vw"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* 3 — Responsable (04/): blue frame around a white inset card; engagement title
			    (outline/fill) + rule + text · images cluster. Stacks on mobile, 2-col from lg. */}
			<section className="bg-estuaire px-5 pt-5 md:px-10 md:pt-10 lg:px-[3.2%] lg:pt-[3.2%]">
				<div className="bg-paper">
					<div className={cn(CONTAINER, "py-12 md:py-16 lg:py-[6vw]")}>
						<div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-[8%]">
							{/* Text */}
							<div className="flex flex-col gap-8 md:order-2 lg:order-1">
								<SectionTitle
									outline={responsable.titleOutline}
									fill={responsable.titleFill}
									className="text-ink"
								/>
								<div className="h-[3px] w-full max-w-[536px] bg-ink" />
								<p className="max-w-[536px] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
									{responsable.text}
								</p>
							</div>
							{/* Images cluster (tall + two squares). */}
							<div className="md:order-1 lg:order-2">
								<div className="relative mx-auto aspect-[950/934] w-full max-w-[600px] lg:max-w-none">
									<Figure
										image={responsable.images[0]}
										className="absolute top-0 left-[35.5%] aspect-[475/735] w-[50%]"
										sizes="(min-width: 1024px) 25vw, 45vw"
									/>
									<Figure
										image={responsable.images[1]}
										className="absolute top-[44.3%] left-0 aspect-square w-[41.9%]"
										sizes="(min-width: 1024px) 21vw, 38vw"
									/>
									<Figure
										image={responsable.images[2]}
										className="absolute top-[57.4%] left-[58.1%] aspect-square w-[41.9%]"
										sizes="(min-width: 1024px) 21vw, 38vw"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 4 — Nos engagements (05/): blue panel, section title + 3×2 numbered grid */}
			<section className="bg-estuaire text-paper">
				<div className={cn(CONTAINER, "py-14 md:py-20 lg:py-[5.2vw]")}>
					<SectionTitle
						outline={engagements.titleOutline}
						fill={engagements.titleFill}
					/>
					<EngagementsGrid
						items={engagements.items}
						className="mt-10 lg:mt-20"
					/>
				</div>
			</section>

			{/* 5 — Cas study (06/): section title + visual band + button to the réalisation */}
			<section className="bg-paper py-14 md:py-20 lg:py-[6vw]">
				<div className={CONTAINER}>
					<SectionTitle
						outline={caseStudy.titleOutline}
						fill={caseStudy.titleFill}
						className="text-ink"
					/>
				</div>
				{/* Band: full-bleed on mobile, container-width from md (maquette). */}
				<div className="mx-auto mt-8 w-full max-w-[1920px] px-0 md:mt-10 md:px-10 lg:px-[7.29%]">
					{caseStudy.image ? (
						<CaseStudyCard
							image={caseStudy.image.src}
							alt={caseStudy.image.alt}
							title={caseStudy.projectTitle}
							meta={caseStudy.meta}
							className="aspect-[390/355] md:aspect-[686/300] lg:aspect-[1640/718]"
						/>
					) : (
						<div className="flex aspect-[390/355] items-center justify-center bg-ink text-paper md:aspect-[686/300] lg:aspect-[1640/718]">
							<span className="font-display font-semibold text-title-sm">
								<BrandText>{caseStudy.projectTitle}</BrandText>
							</span>
						</div>
					)}
				</div>
				<div className={cn(CONTAINER, "mt-10 lg:mt-12")}>
					<div className="flex justify-center">
						<Button
							tone="dark"
							href={caseStudy.ctaHref}
							className="w-full max-w-[536px]"
							{...caseStudyUmami}
						>
							{caseStudy.ctaLabel}
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
