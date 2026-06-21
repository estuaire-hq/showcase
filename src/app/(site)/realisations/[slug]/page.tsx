import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	Arrow,
	BrandText,
	Breadcrumb,
	Carousel,
	type CarouselImage,
	Pill,
	SectionTitle,
} from "@/design-system";
import { getRealisationProps } from "@/lib/sanity/realisation";
import { cn, umamiAttrs } from "@/lib/utils";

// Page détail d'une réalisation (« réalisations / <projet> ») — RSC connecteur (Principe VIII) :
// `getRealisationProps(slug)` (mapping isolé dans `@/lib/sanity/realisation.ts`) → null → notFound().
// Source de vérité : Figma desktop `case-study` 51:4386 (version fournie, avec carrousel d'intro) /
// `case-study-court` 53:2745 (version légère). Sections (FR-019) : hero → intro (contexte + enjeu,
// + carrousel si `fournie`) → nos missions → défis relevés (1→3) → [crédit photo] → savoir-faire,
// puis navigation précédent/suivant entre réalisations (bornée).
//
// Dynamiquement rendu + ISR via `sanityFetch` (tags), pas de `generateStaticParams` (perspective
// cookie dynamique) — comme `univers/[slug]`. Revue pixel-perfect : hero détail OK (T030) ;
// reste la composition éditoriale de l'intro + responsive tablette/mobile (UNVERIFIED).

const CONTAINER = "mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[7.29%]";

type Params = { slug: string };

export async function generateMetadata(props: {
	params: Promise<Params>;
}): Promise<Metadata> {
	const { slug } = await props.params;
	const data = await getRealisationProps(slug);
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

export default async function RealisationDetailPage(props: {
	params: Promise<Params>;
}) {
	const { slug } = await props.params;
	const data = await getRealisationProps(slug);
	if (!data) notFound();

	const {
		title,
		meta,
		layout,
		cover,
		gallery,
		context,
		enjeu,
		interventions,
		challenges,
		skills,
		photoCredit,
		neighbors,
	} = data;

	// Carousel of the gallery for the « fournie » variant (intro). Falls back to the cover.
	const carouselImages: CarouselImage[] = (
		gallery.length ? gallery : cover ? [cover] : []
	).map((g) => ({ src: g.src, alt: g.alt, blurDataURL: g.blurDataURL }));
	// Défi visuals: gallery images after the first (cover-ish), cycled, so each challenge has a band.
	const challengeImage = (i: number) =>
		gallery.length ? gallery[(i + 1) % gallery.length] : cover;

	return (
		<main
			data-nav-logo-tone="onLight"
			data-nav-links-tone="onLight"
			data-nav-toggle-tone="onLight"
		>
			{/* 1 — Hero (02/ SLIDER) : fil d'ariane (sur blanc) + image quasi pleine largeur (marges
			    ~3.2%) avec voile 25% + titre/méta blancs superposés en bas-gauche. Maquette 51:4386. */}
			<section className="bg-paper pt-28 lg:pt-[160px]">
				<div className={CONTAINER}>
					<Breadcrumb
						items={[
							{ label: "réalisations", href: "/realisations" },
							{ label: title },
						]}
					/>
				</div>
				<div className="mx-auto mt-4 w-full max-w-[1920px] px-3 md:px-6 lg:px-[3.2%]">
					<div className="relative aspect-[390/440] w-full overflow-hidden bg-cream md:aspect-[1798/958]">
						{cover && (
							<Image
								src={cover.src}
								alt={cover.alt}
								fill
								priority
								sizes="(min-width: 1024px) 94vw, 100vw"
								placeholder={cover.blurDataURL ? "blur" : "empty"}
								blurDataURL={cover.blurDataURL}
								className="object-cover"
							/>
						)}
						<div aria-hidden className="absolute inset-0 bg-ink/25" />
						<div className="absolute inset-x-[6%] bottom-[8%] flex flex-col gap-5 text-paper lg:inset-x-[7%]">
							<h1 className="font-display font-semibold text-title-sm leading-none lg:text-title">
								<BrandText>{title}</BrandText>
							</h1>
							{meta.length > 0 && (
								<div className="border-paper border-t-[3px] pt-4">
									<p className="flex flex-wrap items-center gap-x-8 font-display font-semibold text-body-sm lg:text-body">
										{meta.map((m, i) => (
											<span key={m} className="flex items-center gap-x-8">
												{i > 0 && (
													<span
														aria-hidden
														className="h-[26px] w-px bg-paper"
													/>
												)}
												{m}
											</span>
										))}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* 2 — Intro (03/): contexte + enjeu (texte) · visuels — carrousel si « fournie ». */}
			<section className="bg-paper">
				<div className={cn(CONTAINER, "py-14 md:py-20 lg:py-[6vw]")}>
					<div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-x-[8%]">
						<div className="flex flex-col gap-10">
							<div className="flex flex-col gap-4">
								<SectionTitle
									outline="Le"
									fill="contexte"
									className="text-ink"
								/>
								<p className="max-w-[52ch] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
									{context}
								</p>
							</div>
							<div className="flex flex-col gap-4">
								<SectionTitle outline="L’" fill="enjeu" className="text-ink" />
								<p className="max-w-[52ch] whitespace-pre-line text-body-sm text-ink leading-relaxed lg:text-body lg:leading-normal">
									{enjeu}
								</p>
							</div>
						</div>

						{layout === "fournie" && carouselImages.length > 0 ? (
							<Carousel images={carouselImages} aspect="aspect-[3/2]" />
						) : (
							cover && (
								<div className="relative aspect-[3/2] w-full overflow-hidden bg-cream">
									<Image
										src={cover.src}
										alt={cover.alt}
										fill
										sizes="(min-width: 1024px) 45vw, 90vw"
										placeholder={cover.blurDataURL ? "blur" : "empty"}
										blurDataURL={cover.blurDataURL}
										className="object-cover"
									/>
								</div>
							)
						)}
					</div>
				</div>
			</section>

			{/* 3 — Nos missions (04/) */}
			{interventions.length > 0 && (
				<section className="bg-paper pb-14 md:pb-20 lg:pb-[5vw]">
					<div className={CONTAINER}>
						<SectionTitle outline="Nos" fill="missions" className="text-ink" />
						<ol className="mt-8 flex flex-col border-ink border-b-2 lg:mt-12 lg:border-b-[3px]">
							{interventions.map((item, i) => (
								<li
									key={item}
									className="flex gap-5 border-ink border-t-2 py-4 text-ink lg:border-t-[3px] lg:py-5"
								>
									<span className="font-display font-semibold text-body-sm tabular-nums text-ink/50 lg:text-body">
										{String(i + 1).padStart(2, "0")}
									</span>
									<span className="font-sans font-semibold text-body-sm leading-snug lg:text-body">
										{item}
									</span>
								</li>
							))}
						</ol>
					</div>
				</section>
			)}

			{/* 4 — Défis relevés (05/) : 1 à 3 blocs (image + titre + corps), alternés. */}
			{challenges.length > 0 && (
				<section className="bg-paper pb-14 md:pb-20 lg:pb-[5vw]">
					<div className={CONTAINER}>
						<SectionTitle outline="Défis" fill="relevés" className="text-ink" />
					</div>
					<div className="mt-10 flex flex-col gap-16 lg:mt-16 lg:gap-24">
						{challenges.map((challenge, i) => {
							const img = challengeImage(i);
							const reverse = i % 2 === 1;
							return (
								<div key={challenge.title} className={CONTAINER}>
									<div
										className={cn(
											"grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-x-[8%]",
											reverse && "lg:[&>*:first-child]:order-2",
										)}
									>
										{img && (
											<div className="relative aspect-[613/492] w-full overflow-hidden bg-cream lg:aspect-[613/613]">
												<Image
													src={img.src}
													alt={img.alt}
													fill
													sizes="(min-width: 1024px) 45vw, 90vw"
													placeholder={img.blurDataURL ? "blur" : "empty"}
													blurDataURL={img.blurDataURL}
													className="object-cover"
												/>
											</div>
										)}
										<div className="flex flex-col gap-5 text-ink">
											<h3 className="font-display font-semibold text-subtitle-sm leading-tight lg:text-subtitle">
												<BrandText>{challenge.title}</BrandText>
											</h3>
											<p className="max-w-[52ch] whitespace-pre-line text-body-sm leading-relaxed lg:text-body lg:leading-normal">
												{challenge.body}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>
			)}

			{/* Crédit photo — entre le dernier défi et les savoir-faire (FR-019), si présent. */}
			{photoCredit && (
				<div className={cn(CONTAINER, "pb-10 lg:pb-12")}>
					<p className="text-caption text-ink/60">
						Crédit photo : {photoCredit}
					</p>
				</div>
			)}

			{/* 5 — Savoir-faire mobilisés (06/) : pastilles. */}
			{skills.length > 0 && (
				<section className="bg-cream py-14 md:py-20 lg:py-[5vw]">
					<div className={CONTAINER}>
						<SectionTitle
							outline="Savoir-faire"
							fill="mobilisés"
							className="text-ink"
						/>
						<div className="mt-8 flex flex-wrap gap-3 lg:mt-12 lg:gap-4">
							{skills.map((skill) => (
								<Pill key={skill} emphasis="outline">
									{skill}
								</Pill>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Navigation précédent / suivant entre réalisations (bornée, D8). */}
			{(neighbors.prev || neighbors.next) && (
				<nav
					aria-label="Navigation entre réalisations"
					className="bg-paper py-10 lg:py-14"
				>
					<div
						className={cn(CONTAINER, "flex items-center justify-between gap-4")}
					>
						{neighbors.prev ? (
							<Link
								href={`/realisations/${neighbors.prev.slug}`}
								className="group flex items-center gap-4 text-ink"
								{...umamiAttrs("realisation_nav", {
									direction: "prev",
									from: slug,
								})}
							>
								<Arrow
									direction="left"
									className="size-9 transition-transform group-hover:-translate-x-1"
								/>
								<span className="font-display font-semibold text-body-sm lg:text-body">
									<span className="block text-caption text-ink/50">
										Précédent
									</span>
									<BrandText>{neighbors.prev.title}</BrandText>
								</span>
							</Link>
						) : (
							<span />
						)}
						{neighbors.next ? (
							<Link
								href={`/realisations/${neighbors.next.slug}`}
								className="group flex items-center gap-4 text-right text-ink"
								{...umamiAttrs("realisation_nav", {
									direction: "next",
									from: slug,
								})}
							>
								<span className="font-display font-semibold text-body-sm lg:text-body">
									<span className="block text-caption text-ink/50">
										Suivant
									</span>
									<BrandText>{neighbors.next.title}</BrandText>
								</span>
								<Arrow
									direction="right"
									className="size-9 transition-transform group-hover:translate-x-1"
								/>
							</Link>
						) : (
							<span />
						)}
					</div>
				</nav>
			)}
		</main>
	);
}
