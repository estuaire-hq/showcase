import type { Metadata } from "next";
import Image from "next/image";
import {
	BrandText,
	FeatureBlock,
	PageHero,
	Pullquote,
	SectionTitle,
} from "@/design-system";
import { getExpertisesPageProps } from "@/lib/sanity/expertisesPage";
import type { ResolvedImage } from "@/lib/sanity/mapImage";
import { cn } from "@/lib/utils";

// « Expertises » is page-specific content (Principle VIII): this RSC is the connector — it
// fetches via `getExpertisesPageProps()` (mapping isolated in `@/lib/sanity/expertisesPage.ts`)
// and composes the design-system components.
//
// MOTION: intentionally none for now — motion must be placed deliberately, not applied to
// every image (ADR 0012 §7). The page is fully static; scroll cinematics land in a later pass.
//
// Section order follows the maquette (51:2893): hero · intro · « Nos 3 niveaux d'expertise »
// (a framed section header + 3 full-width FeatureBlock cards) · big-image statement. The
// « BIG FOOTER » (CTA block + footer) is mounted by the (site) shell — NOT rendered here.

export async function generateMetadata(): Promise<Metadata> {
	const { seo } = await getExpertisesPageProps();
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

/** A content image. Positioning (relative/absolute + box) comes entirely from `className`
 *  so the same component serves standalone images and absolutely-placed cluster members.
 *  Graceful no-op when the slot is empty. */
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

/** Wrapper for an image cluster column cell: centred + capped on mobile, fills the grid
 *  column on tablet/desktop. */
function ClusterCell({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"mx-auto w-full max-w-[440px] md:mx-0 md:max-w-none",
				className,
			)}
		>
			{children}
		</div>
	);
}

const CONTAINER = "mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[7.29%]";

export default async function ExpertisesPage() {
	const { hero, intro, levels, statement } = await getExpertisesPageProps();

	return (
		<main
			data-nav-logo-tone="onDark"
			data-nav-links-tone="onDark"
			data-nav-toggle-tone="onDark"
		>
			{/* 1 — Hero (static) */}
			<PageHero
				eyebrow={hero.eyebrow}
				titleOutline={hero.titleOutline}
				titleFill={hero.titleFill}
				image={hero.image}
				cartoucheClassName="lg:w-[78.2%]"
			/>

			{/* 2 — Intro: statement + body (left) · image cluster (right) */}
			<section className="bg-paper">
				<div className={cn(CONTAINER, "py-16 md:py-20 lg:py-24")}>
					<div className="flex flex-col gap-12 md:grid md:grid-cols-2 md:items-start md:gap-x-[5%]">
						{/* Statement + body (left) */}
						<div className="flex flex-col gap-8">
							<p className="font-display text-subtitle-sm leading-[1.18] text-ink lg:text-subtitle lg:leading-[1.3]">
								<BrandText>{intro.statement}</BrandText>
							</p>
							<p className="max-w-[52ch] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
								{intro.text}
							</p>
						</div>
						{/* Images cluster — primary upper, secondary lower-left overlapping. The
						    maquette cluster is portrait on mobile/tablet (349×507 / 336×507) and
						    landscape on desktop (751×689), so box + member geometry are per-bp. */}
						<ClusterCell>
							<div className="relative aspect-[349/507] w-full md:aspect-[336/507] lg:aspect-[751/689]">
								<Figure
									image={intro.imagePrimary}
									className="absolute top-0 left-[25.8%] aspect-[259/331] w-[74.2%] md:left-[15.2%] md:aspect-[285/331] md:w-[84.8%] lg:left-[31.3%] lg:aspect-[516/600] lg:w-[68.7%]"
									sizes="(min-width: 1024px) 26vw, 60vw"
								/>
								<Figure
									image={intro.imageSecondary}
									className="absolute top-[55.4%] left-0 aspect-[219/226] w-[62.8%] md:w-[65.2%] lg:top-[43.5%] lg:aspect-[338/389] lg:w-[45%]"
									sizes="(min-width: 1024px) 17vw, 40vw"
								/>
							</div>
						</ClusterCell>
					</div>
				</div>
			</section>

			{/* 3 — Nos 3 niveaux d'expertise */}
			<section className="bg-paper">
				{/* Section header (TOP TITRE): blue-framed panel with a square visual + title */}
				<LevelsHeader
					titleOutline={levels.titleOutline}
					titleFill={levels.titleFill}
					image={levels.image}
				/>
				{/* The 3 full-width level cards (FeatureBlock). Aspect is square on mobile →
				    768·718 tablet → 1920·718 desktop; content anchored lower-left (maquette). */}
				{levels.items.map((level) => (
					<FeatureBlock
						key={level.ctaHref || level.title}
						image={level.image?.src}
						alt={level.image?.alt ?? level.title.replace(/\n/g, " ")}
						blurDataURL={level.image?.blurDataURL}
						title={level.title}
						titleAs="h3"
						cta={{ label: level.ctaLabel, href: level.ctaHref }}
						ctaUmamiEvent="expertise_level_click"
						ctaUmamiData={{ level: level.slug }}
						className="aspect-square md:aspect-[768/718] lg:aspect-[1920/718]"
						contentClassName="justify-end gap-6 pb-9 md:px-[11.7%] md:pb-[13%] lg:px-[6.8%] lg:pb-[9.5%]"
					/>
				))}
			</section>

			{/* 4 — Grand visuel + phrase en incrustation */}
			<section className="bg-paper py-5 md:py-10 lg:py-16">
				<div className="mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[3.2%]">
					<div className="relative isolate aspect-[350/268] w-full overflow-hidden md:aspect-[688/519] lg:aspect-[1798/958]">
						{statement.image && (
							<Image
								src={statement.image.src}
								alt={statement.image.alt}
								fill
								sizes="100vw"
								placeholder={statement.image.blurDataURL ? "blur" : "empty"}
								blurDataURL={statement.image.blurDataURL}
								className="object-cover"
							/>
						)}
						<div className="absolute inset-0 bg-ink/25" />
						<div className="absolute inset-0 z-10 flex items-center justify-center px-6 lg:px-[4.4%]">
							<Pullquote
								size="title"
								align="center"
								className="max-w-[16ch] tracking-normal text-paper md:max-w-[22ch] lg:max-w-[24ch]"
							>
								{statement.text}
							</Pullquote>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

/**
 * Levels section header (« 03/ NOS NIVEAUX D'EXPERTISE » TOP TITRE, node @(0,2187)
 * 1920×1040): a blue (`bg-estuaire`) frame — a 61px border on top/left/bottom and a wide
 * blue right panel — around a white inset that carries the section title (bottom-left,
 * outline/fill device) while a square visual bridges the white→blue boundary (top-right).
 * Built as a relative aspect box so the maquette composition scales per breakpoint; on
 * mobile it collapses to a simpler stacked layout.
 */
function LevelsHeader({
	titleOutline,
	titleFill,
	image,
}: {
	titleOutline: string;
	titleFill: string;
	image: ResolvedImage | undefined;
}) {
	// Single relative box scaled per breakpoint (aspect read on the maquette: mobile
	// 390×530 · tablet 768×415 · desktop 1920×1040). The blue frame is the box background
	// (`bg-estuaire`); a white inset is absolutely placed to leave the frame + the wide blue
	// right panel; the square visual bridges blue→white; the title (rendered ONCE — single
	// h2) sits lower-left in the white area. Percentages read on nodes 87:6290 / 87:5600 /
	// 51:2893.
	return (
		<div className="bg-estuaire">
			<div className="relative aspect-[390/530] w-full md:aspect-[768/415] lg:aspect-[1920/1040]">
				{/* White inset */}
				<div className="absolute top-[26.4%] left-[5.4%] h-[69.8%] w-[89.2%] bg-paper md:top-[9.6%] md:left-[5.2%] md:h-[80.7%] md:w-[61.1%] lg:top-[5.9%] lg:left-[3.2%] lg:h-[88.2%] lg:w-[54.4%]" />
				{/* Square visual bridging blue → white */}
				<Figure
					image={image}
					className="absolute top-[7.2%] left-[15.6%] aspect-square w-[69%] md:top-[21.7%] md:left-[57.7%] md:w-[30.6%] lg:top-[17.6%] lg:left-[50.4%] lg:w-[35.1%]"
					sizes="(min-width: 1024px) 35vw, 70vw"
				/>
				{/* Section title, lower-left in the white area */}
				<div className="absolute top-[62%] right-[6%] left-[15.1%] md:top-[52.5%] md:right-auto md:left-[11.3%] lg:top-[64%] lg:left-[6.8%]">
					<SectionTitle
						outline={titleOutline}
						fill={titleFill}
						className="text-ink"
					/>
				</div>
			</div>
		</div>
	);
}
