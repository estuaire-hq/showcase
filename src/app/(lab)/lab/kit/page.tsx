import {
	Arrow,
	BrandText,
	Button,
	CarouselArrow,
	CaseStudyCard,
	ContactButton,
	color,
	FeatureBlock,
	FileInput,
	Filter,
	NavButton,
	OutlineText,
	ScrollTopButton,
	SectorButton,
	Select,
	SiteFooter,
	SubFilter,
} from "@/design-system";

// Design-system showcase (lab only, noindex). Renders the built KIT components
// in their states so the foundation can be validated pixel-perfect against
// Figma node 75:2963 before pages consume them. Hover/active states are CSS —
// hover the live elements to check them.

function Section({
	title,
	hint,
	dark = false,
	children,
}: {
	title: string;
	hint?: string;
	dark?: boolean;
	children?: React.ReactNode;
}) {
	return (
		<section
			className={
				dark
					? "rounded-lg bg-ink p-10 text-paper"
					: "rounded-lg bg-paper p-10 text-ink ring-1 ring-ink/10"
			}
		>
			<header className="mb-8">
				<h2 className="font-display text-2xl font-semibold">{title}</h2>
				{hint && (
					<p className={dark ? "mt-1 text-paper/60" : "mt-1 text-ink/50"}>
						{hint}
					</p>
				)}
			</header>
			{children}
		</section>
	);
}

export default function KitPage() {
	return (
		<main className="min-h-svh bg-cream/40 font-sans text-ink">
			<div className="mx-auto max-w-5xl space-y-10 px-6 py-16">
				<header>
					<p className="font-display text-sm uppercase tracking-[0.25em] text-ink/50">
						Estuaire · design system
					</p>
					<h1 className="mt-2 font-display text-5xl font-semibold">
						KIT — composants
					</h1>
					<p className="mt-3 max-w-2xl text-ink/60">
						Lot 1 du socle : typographie, couleurs, boutons, filtres, lien
						secteur. Survolez les éléments pour vérifier les états hover.
					</p>
				</header>

				{/* Typefaces */}
				<Section
					title="Polices"
					hint="deux familles Montserrat — la distinction est volontaire (règle de casse)"
				>
					<div className="grid gap-10 sm:grid-cols-2">
						<div>
							<p className="text-ink/40 text-sm">font-sans</p>
							<p className="font-sans text-4xl font-semibold">Montserrat</p>
							<p className="mt-1 text-ink/60 text-sm">
								MAJUSCULES · corps · titre « Notre vision »
							</p>
							<p className="mt-5 font-sans text-3xl leading-tight">
								Aa Gg Qq Rr
							</p>
							<p className="font-sans text-3xl leading-tight">0123456789</p>
							<div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-sans text-lg">
								<span className="font-normal">Regular</span>
								<span className="font-medium">Medium</span>
								<span className="font-semibold">SemiBold</span>
								<span className="font-bold">Bold</span>
							</div>
						</div>
						<div>
							<p className="text-ink/40 text-sm">font-display</p>
							<p className="font-display text-4xl font-semibold">
								Montserrat Alternates
							</p>
							<p className="mt-1 text-ink/60 text-sm">
								minuscules · titres · boutons · nav
							</p>
							<p className="mt-5 font-display text-3xl leading-tight">
								Aa Gg Qq Rr
							</p>
							<p className="font-display text-3xl leading-tight">0123456789</p>
							<div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-display text-lg">
								<span className="font-normal">Regular</span>
								<span className="font-medium">Medium</span>
								<span className="font-semibold">SemiBold</span>
								<span className="italic">Italic</span>
							</div>
						</div>
					</div>
					<div className="mt-10 border-ink/10 border-t pt-6">
						<p className="mb-3 text-ink/50 text-sm">
							Même mot, deux familles — regardez le « a » et le « g » :
						</p>
						<div className="flex flex-wrap items-baseline gap-x-12 gap-y-2">
							<span className="font-sans text-subtitle">agenceur</span>
							<span className="font-display text-subtitle">agenceur</span>
						</div>
					</div>
				</Section>

				{/* Type scale */}
				<Section
					title="Échelle typographique"
					hint="plein + contour · SemiBold (600) + Regular (400) · tracking 5% sur display/title/subtitle"
				>
					<div className="space-y-5">
						<p className="font-display text-display font-semibold leading-none">
							Display 100
						</p>

						<div className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
							<span className="font-display text-title font-semibold leading-none">
								Title 75
							</span>
							<OutlineText
								tier="title"
								className="font-display text-title font-semibold leading-none"
							>
								Title 75
							</OutlineText>
							<span className="text-ink/40 text-sm">contour 2px</span>
						</div>

						<div className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
							<span className="font-display text-subtitle font-semibold leading-none">
								Subtitle 50
							</span>
							<OutlineText
								tier="subtitle"
								className="font-display text-subtitle font-semibold leading-none"
							>
								Subtitle 50
							</OutlineText>
							<span className="text-ink/40 text-sm">contour 1px</span>
							<span className="font-display text-subtitle font-normal leading-none tracking-normal">
								Regular 0%
							</span>
						</div>

						<p className="font-sans text-title font-semibold leading-none">
							Notre vision (Montserrat 75)
						</p>

						<div className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
							<span className="font-display text-lead font-semibold">
								Lead 35
							</span>
							<span className="font-display text-lead font-normal">
								Regular 35
							</span>
						</div>
						<div className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
							<span className="font-display text-body font-semibold">
								Body 24
							</span>
							<span className="font-display text-body font-normal">
								Regular 24
							</span>
						</div>
						<div className="flex flex-wrap items-baseline gap-x-10 gap-y-2">
							<span className="font-display text-caption font-semibold">
								Caption 16
							</span>
							<span className="font-display text-caption font-normal italic">
								Italic 16
							</span>
						</div>
					</div>

					{/* Contour device — realistic title usage, light + dark */}
					<div className="mt-8 border-ink/10 border-t pt-6">
						<p className="mb-3 text-ink/50 text-sm">
							Device contour : 1er mot/ligne en contour, le reste en plein (ici
							en Title 75, stroke 2px) — s'adapte clair / sombre :
						</p>
						<p className="font-display text-title font-semibold leading-tight">
							<OutlineText tier="title">Là où les</OutlineText>{" "}
							<BrandText>idées prennent</BrandText>
						</p>
						<div className="mt-4 rounded-md bg-ink p-6 text-paper">
							<p className="font-display text-title font-semibold leading-tight">
								<OutlineText tier="title">Là où les</OutlineText>{" "}
								<BrandText>idées prennent</BrandText>
							</p>
						</div>
					</div>

					{/* Casse rule */}
					<div className="mt-8 border-ink/10 border-t pt-6">
						<p className="mb-2 text-ink/50 text-sm">
							BrandText (MAJ → Montserrat, min → Alternates) :
						</p>
						<p className="font-display font-semibold text-subtitle">
							<BrandText>Univers · Expertises · Estuaire</BrandText>
						</p>
					</div>
				</Section>

				{/* Colors */}
				<Section title="Palette">
					<div className="flex flex-wrap gap-4">
						{Object.entries(color).map(([name, hex]) => (
							<div key={name} className="w-28">
								<div
									className="h-20 w-full rounded-md ring-1 ring-ink/10"
									style={{ backgroundColor: hex }}
								/>
								<p className="mt-2 font-medium text-sm">{name}</p>
								<p className="text-ink/50 text-xs">{hex}</p>
							</div>
						))}
					</div>
				</Section>

				{/* Buttons on light */}
				<Section
					title="Boutons (CTA pill)"
					hint="fond clair — survolez pour le hover"
				>
					<div className="flex flex-wrap items-center gap-5">
						<Button tone="light">en savoir plus</Button>
						<Button tone="dark">voir nos réalisations</Button>
						<Button tone="send">envoyer</Button>
						<Button tone="primary">contactez-nous</Button>
						<Button tone="light" arrow={false}>
							sans flèche
						</Button>
					</div>
				</Section>

				{/* Buttons on dark (outline) */}
				<Section title="Bouton outline + plaquette" hint="fond sombre" dark>
					<div className="flex flex-col gap-5">
						<Button tone="outline" block>
							pour prolonger votre visite, téléchargez notre plaquette ici
						</Button>
						<div className="flex gap-5">
							<Button tone="light">en savoir plus</Button>
							<Button tone="outline">nous découvrir</Button>
						</div>
					</div>
				</Section>

				{/* Filters */}
				<Section
					title="Filtres portfolio"
					hint="défaut · sélectionné · (survol = estuaire)"
				>
					<div className="grid max-w-3xl grid-cols-2 gap-5">
						<Filter label="Univers" />
						<Filter label="Expertises" selected />
					</div>
					<div className="mt-5 grid max-w-3xl grid-cols-3 gap-5">
						<SubFilter label="Banque & assurance" />
						<SubFilter label="Mode" selected />
						<SubFilter label="Optique" />
					</div>
				</Section>

				{/* Sector list */}
				<Section title="Liste secteurs (BTN secteur)" hint="survol = estuaire">
					<div className="max-w-md border-ink border-b-[3px]">
						{["Banque & assurance", "Mode & luxe", "Optique", "Parfumerie"].map(
							(s) => (
								<SectorButton key={s} label={s} />
							),
						)}
					</div>
				</Section>

				{/* Arrows */}
				<Section
					title="Flèches"
					hint="currentColor, héritent de la couleur du texte"
				>
					<div className="flex items-center gap-8 text-3xl text-ink">
						<Arrow direction="left" />
						<Arrow direction="right" />
						<Arrow direction="up" />
						<Arrow direction="down" />
					</div>
				</Section>

				{/* Nav buttons */}
				<Section
					title="Boutons nav"
					hint="nous découvrir (ghost) + contact (filled) · défaut / actif / survol"
				>
					<div className="flex flex-wrap items-center gap-5">
						<NavButton label="nous découvrir" tone="onLight" />
						<NavButton label="nous découvrir" tone="onLight" active />
						<ContactButton tone="bleu" />
						<ContactButton tone="noir" />
						<ContactButton tone="bleu" active />
					</div>
				</Section>

				<Section title="Boutons nav (fond sombre)" dark>
					<div className="flex flex-wrap items-center gap-5">
						<NavButton label="nous découvrir" tone="onDark" />
						<NavButton label="nous découvrir" tone="onDark" active />
						<ContactButton tone="bleu" />
						<ContactButton tone="noir" />
					</div>
				</Section>

				{/* Carousel arrows + scroll-to-top */}
				<Section
					title="Flèches carrousel + scroll-to-top"
					hint="blanc (fond sombre) · défaut / désactivé · survol = estuaire"
					dark
				>
					<div className="flex flex-wrap items-center gap-10">
						<div className="flex items-center gap-4">
							<CarouselArrow direction="left" tone="blanc" disabled />
							<CarouselArrow direction="right" tone="blanc" />
						</div>
						<ScrollTopButton />
					</div>
				</Section>

				<Section
					title="Flèches carrousel (fond clair)"
					hint="noir · défaut / désactivé"
				>
					<div className="flex items-center gap-4">
						<CarouselArrow direction="left" tone="noir" disabled />
						<CarouselArrow direction="right" tone="noir" />
					</div>
				</Section>

				{/* Form */}
				<Section
					title="Formulaire"
					hint="select « Type de demande » (cliquez) · fichier · envoyer"
				>
					<div className="max-w-2xl space-y-5">
						<Select
							options={["Demande 1", "Demande 2", "Demande 3", "Demande 4"]}
						/>
						<FileInput />
						<Button tone="send" block>
							envoyer
						</Button>
					</div>
				</Section>

				{/* Case study card */}
				<Section
					title="Carte cas study"
					hint="survol = flou 15px + voile (survolez)"
				>
					<CaseStudyCard
						image="/lab/images/image-import-8.jpg"
						alt="Flagship mode — Paris"
						title="Nom cas study"
						meta={["Paris", "2024", "320 m²"]}
						href="#"
					/>
				</Section>

				{/* Feature block */}
				<Section
					title="Bloc image + CTA (Notre vision)"
					hint="titre Montserrat · survol = flou + bouton crème"
				>
					<FeatureBlock
						image="/lab/images/image-import-40.jpg"
						alt="Notre vision du métier d'agenceur"
						title={"Notre vision\ndu métier d'agenceur"}
						cta={{ label: "en savoir plus", href: "#" }}
					/>
				</Section>

				<Section
					title="Footer (assemblé — BIG FOOTER 51:2222)"
					hint="CTA + lockup + chrome — rendu pleine largeur ci-dessous"
				/>
			</div>

			{/* Full-bleed assembled footer */}
			<SiteFooter
				cta={{
					titleOutline: "Une question,",
					titleFill: "un projet ?",
					label: "tout commence ici",
					href: "#",
					images: [
						{
							src: "/lab/images/image-import-1.jpg",
							alt: "L'atelier Estuaire",
						},
						{
							src: "/lab/images/image-import-8.jpg",
							alt: "Réalisation Estuaire",
						},
						{
							src: "/lab/images/image-import-40.jpg",
							alt: "Agencement Estuaire",
						},
					],
				}}
				address={
					"2026 estuaire©\nZi la seiglerie 3, 2 rue Henri Giffard\n44270 machecoul"
				}
				navLinks={[
					{ label: "nous découvrir", href: "#" },
					{ label: "expertises", href: "#" },
					{ label: "univers", href: "#" },
					{ label: "réalisations", href: "#" },
				]}
				legalLinks={[
					{ label: "Conditions générales d'utilisation", href: "#" },
					{ label: "Mentions légales", href: "#" },
					{ label: "Politique de confidentialité", href: "#" },
					{ label: "Politique en matière de cookies", href: "#" },
				]}
				contactHref="#"
			/>
		</main>
	);
}
