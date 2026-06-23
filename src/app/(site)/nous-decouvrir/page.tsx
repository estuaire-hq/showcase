import type { Metadata } from "next";
import Image from "next/image";
import {
	BrandText,
	Button,
	PageHero,
	Pullquote,
	SectionTitle,
} from "@/design-system";
import { getAboutPageProps } from "@/lib/sanity/aboutPage";
import type { ResolvedImage } from "@/lib/sanity/mapImage";
import { cn } from "@/lib/utils";

// « Nous découvrir » is page-specific content (Principle VIII): this RSC is the
// connector — it fetches via `getAboutPageProps()` (mapping isolated in
// `@/lib/sanity/aboutPage.ts`) and composes the design-system components.
//
// MOTION: intentionally none for now — motion must be placed deliberately, not applied
// to every image (ADR 0012 §7). The page is fully static.
//
// IMAGE CLUSTERS: each "tall + overlapping" pair is built as a `relative` box whose
// aspect ratio is the maquette cluster bounding-box, with BOTH images `absolute`-placed
// at the exact left/top/width % read on the nodes (51:2699). This reproduces the
// maquette overlap precisely on desktop and scales coherently to tablet/mobile.
//
// Section order follows the maquette (CTA BEFORE the big-image statement — node y order).
// Mode-opératoire steps are STACKED on every breakpoint (maquette carousels them on
// tablet/mobile — deferred; same content, accessible no-JS baseline).

export async function generateMetadata(): Promise<Metadata> {
	const { seo } = await getAboutPageProps();
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

/** A content image. Positioning (relative/absolute + box) comes entirely from
 *  `className` so the same component serves standalone images and absolutely-placed
 *  cluster members. Graceful no-op when the slot is empty. */
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

/** Wrapper for an image cluster column cell: centred + capped on mobile, fills the
 *  grid column on tablet/desktop. `order` lets the cluster swap sides per breakpoint. */
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

/** Blue « phrase phare » panel — Pullquote (white) on the estuaire-blue surface. */
function HighlightPanel({
	children,
	className,
}: {
	children: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center bg-estuaire px-8 py-10 text-paper md:px-12 md:py-12 lg:px-[6%] lg:py-14",
				className,
			)}
		>
			<Pullquote size="lead">{children}</Pullquote>
		</div>
	);
}

const CONTAINER = "mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[7.29%]";

export default async function AboutPage() {
	const { hero, intro, vision, atelier, process, statement, cta } =
		await getAboutPageProps();

	return (
		<main
			data-nav-logo-tone="onDark"
			data-nav-links-tone="onLight"
			data-nav-toggle-tone="onDark"
			data-nav-toggle-tone-tablet="onDark"
			data-nav-cta-tone="noir"
		>
			{/* Hero per-slot navbar tones (maquette 51:2699 desktop / 78:4374 tablet /
			    78:4626 mobile): logo white over the visual; desktop links INK (over the
			    light right of the hero); CTA "contact" a black pill (not the default bleu);
			    the toggle stays white at BOTH mobile and tablet — hence the explicit tablet
			    override, since it would otherwise inherit the (now ink) links tone. */}

			{/* 1 — Hero (static) */}
			<PageHero
				eyebrow={hero.eyebrow}
				titleOutline={hero.titleOutline}
				titleFill={hero.titleFill}
				image={hero.image}
			/>

			{/* 2 — Intro */}
			<section className="bg-paper">
				<div className={cn(CONTAINER, "py-16 md:py-20 lg:py-24")}>
					<div className="flex flex-col gap-12 md:grid md:grid-cols-2 md:items-start md:gap-x-[5%]">
						{/* Images cluster (bbox 751×689): primary right-top, secondary left-lower */}
						<ClusterCell className="order-2 md:order-1">
							<div className="relative aspect-[751/689] w-full">
								<Figure
									image={intro.imagePrimary}
									className="absolute top-0 left-[31.3%] aspect-[516/600] w-[68.7%]"
									sizes="(min-width: 1024px) 26vw, 60vw"
								/>
								<Figure
									image={intro.imageSecondary}
									className="absolute top-[43.5%] left-0 aspect-[338/389] w-[45%]"
									sizes="(min-width: 1024px) 17vw, 40vw"
								/>
							</div>
						</ClusterCell>
						{/* Statement + body */}
						<div className="order-1 flex flex-col gap-8 md:order-2">
							<p className="font-display text-subtitle-sm leading-[1.18] text-ink lg:text-subtitle lg:leading-[1.3]">
								<BrandText>{intro.statement}</BrandText>
							</p>
							<p className="max-w-[52ch] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
								{intro.text}
							</p>
						</div>
					</div>
					{/* Phrase phare — offset right & not full-width (maquette: x≈554, w≈1088/1640) */}
					<HighlightPanel className="mx-auto mt-14 w-[72%] md:w-[89%] lg:mt-24 lg:mr-0 lg:ml-[24%] lg:w-[76%] lg:px-[6%]">
						{intro.highlight}
					</HighlightPanel>
				</div>
			</section>

			{/* 3 — Notre vision (cream frame around a white panel) */}
			<section className="bg-cream">
				<div className="mx-auto w-full max-w-[1920px] px-5 pt-12 pb-12 md:px-10 lg:px-[3.2%] lg:pt-16 lg:pb-16">
					<div className="bg-paper px-5 py-12 md:px-10 lg:px-[4.5%] lg:py-20">
						<div className="border-ink/80 border-t pt-10 lg:pt-14" />
						<div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-[6%]">
							{/* Images cluster (bbox 690×984): tall left-top, square right-lower */}
							<ClusterCell className="order-2 md:order-1">
								<div className="relative aspect-[690/984] w-full">
									<Figure
										image={vision.images[0]}
										className="absolute top-0 left-0 aspect-[475/811] w-[68.8%]"
										sizes="(min-width: 1024px) 25vw, 50vw"
									/>
									<Figure
										image={vision.images[1]}
										className="absolute top-[59.6%] left-[42.3%] aspect-square w-[57.7%]"
										sizes="(min-width: 1024px) 21vw, 45vw"
									/>
								</div>
							</ClusterCell>
							{/* Title + text (right) */}
							<div className="order-1 flex flex-col gap-8 md:order-2">
								<SectionTitle
									outline={vision.titleOutline}
									fill={vision.titleFill}
									className="text-ink"
								/>
								<div className="h-px w-full bg-ink lg:h-[3px]" />
								<p className="max-w-[60ch] whitespace-pre-line text-body-sm text-ink leading-relaxed">
									{vision.text}
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 4 — De notre atelier à votre chantier */}
			<section className="bg-cream">
				<div className={cn(CONTAINER, "py-16 lg:py-32")}>
					{/* Row A: title + text (left) | images (right, bbox 751×724) */}
					<div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:items-center md:gap-x-[6%]">
						<div className="flex flex-col gap-8">
							<SectionTitle
								outline={atelier.titleOutline}
								fill={atelier.titleFill}
								className="text-ink"
							/>
							<div className="h-px w-full bg-ink lg:h-[3px]" />
							<p className="max-w-[52ch] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
								{atelier.text}
							</p>
						</div>
						<ClusterCell>
							<div className="relative aspect-[751/724] w-full">
								<Figure
									image={atelier.images[0]}
									className="absolute top-0 left-[36.8%] aspect-[475/631] w-[63.2%]"
									sizes="(min-width: 1024px) 25vw, 60vw"
								/>
								<Figure
									image={atelier.images[1]}
									className="absolute top-[43.8%] left-0 aspect-[398/407] w-[53%]"
									sizes="(min-width: 1024px) 21vw, 45vw"
								/>
							</div>
						</ClusterCell>
					</div>

					{/* Row B: images (left, bbox 950×578) | pillars + capabilities (right) */}
					<div className="mt-14 flex flex-col gap-10 md:grid md:grid-cols-2 md:items-center md:gap-x-[6%] lg:mt-28">
						<ClusterCell className="order-2 md:order-1">
							<div className="relative aspect-[950/578] w-full">
								<Figure
									image={atelier.images[2]}
									className="absolute top-0 left-0 aspect-[398/578] w-[41.9%]"
									sizes="(min-width: 1024px) 21vw, 42vw"
								/>
								<Figure
									image={atelier.images[3]}
									className="absolute top-[10.6%] left-[50%] aspect-[475/456] w-[50%]"
									sizes="(min-width: 1024px) 25vw, 50vw"
								/>
							</div>
						</ClusterCell>
						<div className="order-1 flex flex-col gap-6 md:order-2">
							<p className="font-display font-semibold text-body-sm text-ink lg:text-body">
								{atelier.pillarsLead}
							</p>
							<ul className="flex flex-wrap gap-3">
								{atelier.pillars.map((pillar, i) => {
									const filled = i === atelier.pillars.length - 1;
									return (
										<li
											key={pillar}
											className={cn(
												"rounded-full px-6 py-2 font-display font-semibold text-body-sm lg:text-body",
												filled
													? "bg-estuaire text-paper"
													: "text-ink ring-1 ring-ink ring-inset",
											)}
										>
											<BrandText>{pillar}</BrandText>
										</li>
									);
								})}
							</ul>
							<ul className="flex flex-col">
								{atelier.capabilities.map((cap) => (
									<li
										key={cap}
										className="border-ink/60 border-t py-3 font-display font-semibold text-lead-sm text-ink leading-tight last:border-b lg:text-body"
									>
										{cap}
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Row C — maquette: the blue panel OVERLAPS the tall image (475×679).
					    Desktop: image right (x968-1443, ~29% wide), panel left (x217-1029,
					    ~49.5%) whose right edge laps over the image's left edge (~4% overlap),
					    vertically centred on the image. Mobile: image on top, panel pulled up
					    to overlap its bottom (frame: image y6056-6415, panel y6377-6630). */}
					<div className="relative mt-16 flex flex-col lg:mt-28">
						<Figure
							image={atelier.images[4]}
							className="relative z-0 mx-auto aspect-[475/679] w-[72%] max-w-[420px] md:mr-[20.5%] md:ml-auto md:w-[29%] md:max-w-none"
							sizes="(min-width: 1024px) 28vw, 72vw"
						/>
						<HighlightPanel className="relative z-10 -mt-[14%] mx-auto w-[88%] md:absolute md:top-1/2 md:left-[4.7%] md:mx-0 md:mt-0 md:w-[49.5%] md:-translate-y-1/2">
							{atelier.highlight}
						</HighlightPanel>
					</div>
				</div>
			</section>

			{/* 5 — Notre mode opératoire */}
			<section className="bg-paper">
				<div className={cn(CONTAINER, "py-16 lg:py-32")}>
					{/* Intro: title top-left, image top-right; below the title a rule + a 35px
					    lead paragraph spanning the left column. */}
					<div className="bg-cream p-8 md:p-10 lg:p-14">
						<div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_auto] lg:items-start lg:gap-x-12">
							<div className="flex flex-col gap-6">
								<SectionTitle
									outline={process.titleOutline}
									fill={process.titleFill}
									className="text-ink"
								/>
								<div className="h-px w-full bg-ink lg:h-[2px]" />
								<p className="whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-lead lg:leading-snug">
									{process.intro}
								</p>
							</div>
							<Figure
								image={process.introImage}
								className="relative aspect-[475/544] w-full max-w-[360px] lg:w-[420px]"
								sizes="(min-width: 1024px) 25vw, 90vw"
							/>
						</div>
					</div>

					{/* Steps (stacked; alternating sides on tablet/desktop) */}
					<div className="mt-16 flex flex-col gap-16 lg:mt-24 lg:gap-28">
						{process.steps.map((step, i) => {
							const textLeft = i % 2 === 0;
							return (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: positional step list; `number` may be empty under partial seed
									key={i}
									className="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-center md:gap-x-[6%]"
								>
									{/* Text block */}
									<div
										className={cn(
											"flex flex-col gap-5",
											textLeft ? "md:order-1" : "md:order-2",
										)}
									>
										<h3 className="font-display font-semibold text-subtitle-sm text-ink leading-tight lg:text-subtitle">
											{step.number && (
												<span className="font-sans">{step.number}/ </span>
											)}
											<BrandText>{step.title}</BrandText>
										</h3>
										{step.text && (
											<p className="max-w-[52ch] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
												{step.text}
											</p>
										)}
										{step.bullets.length > 0 && (
											<ul className="flex flex-col gap-3">
												{step.bullets.map((bullet) => (
													<li
														key={bullet}
														className="relative pl-6 text-body-sm text-ink leading-relaxed lg:text-body lg:leading-snug"
													>
														<span className="-translate-y-1/2 absolute top-[0.85em] left-0 size-[7px] rounded-full bg-ink" />
														{bullet}
													</li>
												))}
											</ul>
										)}
									</div>
									{/* Images cluster (per-step bbox) */}
									<ClusterCell
										className={textLeft ? "md:order-2" : "md:order-1"}
									>
										<StepImages index={i} images={step.images} />
									</ClusterCell>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* 6 — CTA « découvrir nos expertises » */}
			<section className="bg-paper pb-16 lg:pb-24">
				<div className={cn(CONTAINER, "flex justify-center")}>
					<Button
						tone="dark"
						href={cta.href}
						className="w-full max-w-[536px]"
						data-umami-event="about_cta_click"
						data-umami-event-section="expertises"
					>
						{cta.label}
					</Button>
				</div>
			</section>

			{/* 7 — Grand visuel + phrase en incrustation */}
			<section className="bg-cream py-0 lg:py-8">
				<div className="mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[3.2%]">
					<div className="relative isolate aspect-[390/308] w-full overflow-hidden md:aspect-[688/519] lg:aspect-[1798/958]">
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
								className="tracking-normal text-paper"
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

/** Per-step image cluster, positioned from the maquette node bounding-boxes.
 *  Steps 01/03/04 are two-image clusters; step 02 is a single image. */
function StepImages({
	index,
	images,
}: {
	index: number;
	images: (ResolvedImage | undefined)[];
}) {
	// Single-image step (02 / Co-conception): one tall image (608×774).
	if (images.length <= 1) {
		return (
			<Figure
				image={images[0]}
				className="relative aspect-[608/774] w-full"
				sizes="(min-width: 1024px) 40vw, 90vw"
			/>
		);
	}

	// Two-image clusters — bbox + per-image left/top/width read on the nodes. Keyed by
	// step index (01/03/04); index 1 (step 02) is the single-image branch above. `Partial`
	// so the lookup is `… | undefined` and the fallback below is type-enforced, not dead.
	const layouts: Partial<
		Record<number, { box: string; a: string; b: string }>
	> = {
		0: {
			// 01 Analyse — bbox 751×614
			box: "aspect-[751/614]",
			a: "absolute top-0 left-0 aspect-[398/614] w-[53%]",
			b: "absolute top-[19.9%] left-[44.9%] aspect-[414/370] w-[55.1%]",
		},
		2: {
			// 03 Co-construction — bbox 618×873
			box: "aspect-[618/873]",
			a: "absolute top-0 left-0 aspect-[557/398] w-[90.1%]",
			b: "absolute top-[31.6%] left-[35.6%] aspect-[398/597] w-[64.4%]",
		},
		3: {
			// 04 Installation — bbox 746×796
			box: "aspect-[746/796]",
			a: "absolute top-0 left-[25.3%] aspect-[557/398] w-[74.7%]",
			b: "absolute top-[25%] left-0 aspect-[398/597] w-[53.4%]",
		},
	};
	const l = layouts[index] ?? layouts[0];
	if (!l) return null; // unreachable (0 is always defined) — satisfies the type
	return (
		<div className={cn("relative w-full", l.box)}>
			<Figure
				image={images[0]}
				className={l.a}
				sizes="(min-width: 1024px) 30vw, 70vw"
			/>
			<Figure
				image={images[1]}
				className={l.b}
				sizes="(min-width: 1024px) 22vw, 50vw"
			/>
		</div>
	);
}
