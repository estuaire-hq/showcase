import type { Metadata } from "next";
import Image from "next/image";
import {
	BrandText,
	CaseStudyCard,
	OutlineText,
	SectionTitle,
} from "@/design-system";
import { getRealisationListProps } from "@/lib/sanity/realisation";
import { umamiAttrs } from "@/lib/utils";
import { RealisationsBrowser } from "./RealisationsBrowser";

// Page liste « Réalisations » — RSC connecteur (Principe VIII) : `getRealisationListProps()`
// (mapping isolé dans `@/lib/sanity/realisation.ts`). Source de vérité : Figma desktop `portfolio`
// 51:4064 (hero → derniers projets → filtres + grille → logos clients). Hero + « Dernières
// Réalisations » (3 plus récentes) rendus côté serveur ; la grille filtrable est déléguée au
// composant client `RealisationsBrowser` (filtrage en mémoire, perçu instantané — SC-004).
// Revue pixel-perfect desktop faite (T030) ; responsive tablette/mobile UNVERIFIED (maquettes
// desktop only).

const CONTAINER = "mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[7.29%]";

export const metadata: Metadata = {
	title: "Réalisations",
	description:
		"Le portfolio d'Estuaire : agencement, mobilier et présentoirs sur mesure pour la banque, la culture, la mode, la beauté, les spiritueux et plus.",
};

type SearchParams = {
	univers?: string | string[];
	expertise?: string | string[];
};

/** Next resolves a query value as string | string[] (duplicated param) — take the first. */
const firstParam = (v: string | string[] | undefined) =>
	Array.isArray(v) ? v[0] : v;

export default async function RealisationsPage(props: {
	searchParams: Promise<SearchParams>;
}) {
	const [sp, items] = await Promise.all([
		props.searchParams,
		getRealisationListProps(),
	]);
	const univers = firstParam(sp.univers);
	const expertise = firstParam(sp.expertise);
	const latest = items.filter((i) => i.status === "published").slice(0, 3);

	return (
		<main
			data-nav-logo-tone="onDark"
			data-nav-links-tone="onLight"
			data-nav-toggle-tone="onDark"
		>
			{/* 1 — Hero (02/ SLIDER) : panneau bleu (gauche) + titre/eyebrow blancs + image contenue
			    (droite) débordant la couture bleu/blanc. Maquette 51:4064 « 02/ SLIDER ». */}
			<section className="relative isolate overflow-hidden bg-paper">
				<div aria-hidden className="absolute inset-0 bg-estuaire lg:hidden" />
				<div
					aria-hidden
					className="absolute inset-y-0 left-0 hidden w-[56.77%] bg-estuaire lg:block"
				/>
				{/* Desktop: symmetric py reserves navbar clearance. With min-h-[860px] dominant the
				    1920 composition is unchanged (centred content sits at the same Y), but at
				    short/narrow desktop viewports the taller wrapped content can no longer rise
				    under the fixed navbar — the eyebrow stopped colliding with it (≡ the mobile
				    pt-32 clearance). ADR 0022. */}
				<div className="relative mx-auto flex min-h-[560px] max-w-[1920px] flex-col gap-12 px-5 pt-32 pb-16 md:px-10 lg:min-h-[860px] lg:flex-row lg:items-center lg:px-[7.29%] lg:py-[128px]">
					<div className="flex flex-col gap-8 text-paper lg:w-[52%]">
						<p className="font-display font-semibold text-lead leading-tight lg:text-subtitle">
							Agencement & Mobilier
						</p>
						<div className="h-[3px] w-full max-w-[812px] bg-paper" />
						<h1 className="font-display font-semibold text-title-sm leading-[1.1] lg:text-title lg:leading-[1.05]">
							<OutlineText tier="title" className="block whitespace-pre-line">
								{"Des projets\noù se rencontrent"}
							</OutlineText>
							<span className="block whitespace-pre-line">
								<BrandText>
									{"créativité, matières\net savoir-faire."}
								</BrandText>
							</span>
						</h1>
					</div>
					<div className="lg:relative lg:w-[48%]">
						{latest[0]?.cover && (
							<div className="relative aspect-[536/603] w-full max-w-[536px] overflow-hidden bg-cream lg:absolute lg:top-1/2 lg:-left-[8%] lg:-translate-y-1/2">
								<Image
									src={latest[0].cover.src}
									alt={latest[0].cover.alt}
									fill
									sizes="(min-width: 1024px) 28vw, 90vw"
									placeholder={latest[0].cover.blurDataURL ? "blur" : "empty"}
									blurDataURL={latest[0].cover.blurDataURL}
									className="object-cover"
								/>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* 2 — Dernières Réalisations (03/ derniers projets) : 3 plus récentes en bandes. */}
			{latest.length > 0 && (
				<section className="bg-paper py-14 md:py-20 lg:py-[5vw]">
					<div className={CONTAINER}>
						<SectionTitle
							outline="Dernières"
							fill="réalisations"
							className="text-ink"
						/>
						<p className="mt-6 max-w-[60ch] text-body-sm text-ink leading-relaxed lg:text-body">
							Découvrez les projets que nous avons conçus, fabriqués et déployés
							aux côtés de nos partenaires.
						</p>
						<div className="mt-6 h-[3px] w-full bg-ink lg:mt-8" />
					</div>
					<div className="mt-8 flex flex-col gap-6 lg:mt-12 lg:gap-8">
						{latest.map((item) => (
							<div key={item.slug} className={CONTAINER}>
								<div
									{...umamiAttrs("realisation_card_open", { slug: item.slug })}
								>
									<CaseStudyCard
										image={item.cover?.src ?? ""}
										alt={item.cover?.alt ?? item.title}
										title={item.title}
										meta={item.meta}
										href={item.href}
									/>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{/* 3 — Portfolio (05/) : filtres (Univers · Expertises · Clients) + grille progressive. */}
			<section className="bg-cream py-14 md:py-20 lg:py-[5vw]">
				<div className={CONTAINER}>
					<SectionTitle
						outline="Toutes nos"
						fill="réalisations"
						className="text-ink"
					/>
					<div className="mt-6 h-[3px] w-full bg-ink lg:mt-8" />
					<div className="mt-8 lg:mt-12">
						<RealisationsBrowser
							items={items}
							initialUnivers={univers}
							initialExpertise={expertise}
						/>
					</div>
				</div>
			</section>

			{/* 4 — Ils nous font confiance (06/ CLIENTS, maquette 51:4064) — DÉSACTIVÉ pour
			    l'instant (revue 2026-06, I7) : pas encore de logos clients. Le composant
			    `ClientsCarousel` (@/design-system) est conservé, prêt à réactiver dès qu'un modèle
			    Sanity de logos clients existe. Pour réactiver : dériver les clients (status != draft,
			    hors « Particulier ») ou lire les logos Sanity, puis rendre :
			    <ClientsCarousel clients={clients} />. */}
		</main>
	);
}
