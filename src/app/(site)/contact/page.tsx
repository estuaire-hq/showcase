import type { Metadata } from "next";
import Image from "next/image";
import { BrandText, OutlineText } from "@/design-system";
import { getContactPageProps } from "@/lib/sanity/contactPage";
import { cn, umamiAttrs } from "@/lib/utils";
import { ContactForm } from "./ContactForm";
import { ContactMap } from "./ContactMap";

// /contact is page-specific content (Principle VIII): this RSC is the connector — it
// fetches via `getContactPageProps()` (mapping isolated in `@/lib/sanity/contactPage.ts`)
// and composes the sections. Navbar + footer come from the (site) layout (not threaded
// here). The form and map are client islands (`ContactForm`, `ContactMap`); everything
// else is server-rendered (Principle I) — the address text is the map's no-JS fallback.
//
// Maquette: node 51:4548 (desktop) — hero (white), form + visual (cream panel),
// coordinates + interactive map, then the shared footer.

export async function generateMetadata(): Promise<Metadata> {
	const { seo } = await getContactPageProps();
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

const CONTAINER = "mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[7.29%]";

/** Subtitle-sized contour/fill title (50px), the kit device at the section scale used by
 *  the form + coordinates blocks. Composes the DS primitives `OutlineText` + `BrandText`
 *  (the 75px `SectionTitle` is too large here). `\n` honoured for the maquette breaks. */
function OutlineFillTitle({
	outline,
	fill,
	className,
}: {
	outline: string;
	fill: string;
	className?: string;
}) {
	return (
		<h2
			className={cn(
				"font-display font-semibold text-subtitle-sm text-ink leading-[1.15] lg:text-subtitle",
				className,
			)}
		>
			<OutlineText tier="subtitle" className="block whitespace-pre-line">
				{outline}
			</OutlineText>
			<span className="block whitespace-pre-line">
				<BrandText>{fill}</BrandText>
			</span>
		</h2>
	);
}

export default async function ContactPage() {
	const { hero, form, coordinates } = await getContactPageProps();

	return (
		<main>
			{/* 1 — Hero (white) : « Nous sommes » (contour) / « à votre écoute » (plein) */}
			<section className="bg-paper">
				<div
					className={cn(
						CONTAINER,
						"pt-32 pb-12 md:pt-40 lg:pt-[250px] lg:pb-[100px]",
					)}
				>
					<h1 className="font-display font-semibold text-title-sm text-ink leading-[1.1] lg:text-title lg:leading-[1.13]">
						<OutlineText tier="title" className="block whitespace-pre-line">
							{hero.titleOutline}
						</OutlineText>
						<span className="block whitespace-pre-line">
							<BrandText>{hero.titleFill}</BrandText>
						</span>
					</h1>
				</div>
			</section>

			{/* 2 — Formulaire + visuel : visuel à gauche, panneau cream (formulaire) à droite,
			    qui se chevauchent sur desktop (maquette node « 03/ FORMULAIRE + MAP »). */}
			<section className="bg-paper pb-16 lg:pb-24">
				<div className="relative mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-0">
					{/* Visuel — en flux sur mobile/tablette, en absolu (chevauchant) sur desktop */}
					<div className="relative mx-auto mb-8 aspect-[753/1097] w-full max-w-[480px] overflow-hidden md:mb-10 lg:absolute lg:top-[5%] lg:left-[3.2%] lg:z-10 lg:mx-0 lg:mb-0 lg:w-[39.2%] lg:max-w-none">
						{form.image && (
							<Image
								src={form.image.src}
								alt={form.image.alt}
								fill
								sizes="(min-width: 1024px) 39vw, 90vw"
								placeholder={form.image.blurDataURL ? "blur" : "empty"}
								blurDataURL={form.image.blurDataURL}
								className="object-cover"
							/>
						)}
					</div>

					{/* Panneau cream — formulaire. Le contenu (titre + form, 674px maquette) est
					    un bloc centré dans le panneau ; le ~22% gauche est la zone de chevauchement
					    du visuel. (NB : padding en `%` se calcule sur le conteneur, pas le panneau →
					    on centre un max-w fixe plutôt que `px-[22.5%]`.) */}
					<div className="bg-cream px-6 py-10 md:px-10 md:py-14 lg:ml-[36%] lg:w-[64%] lg:px-0 lg:pt-[90px] lg:pb-[110px]">
						<div className="lg:mx-auto lg:max-w-[674px]">
							<OutlineFillTitle
								outline={form.titleOutline}
								fill={form.titleFill}
								className="mb-8 lg:mb-12"
							/>
							<ContactForm
								requestTypeOptions={form.requestTypes.map((r) => r.label)}
								directEmail={coordinates.email}
							/>
						</div>
					</div>
				</div>
			</section>

			{/* 3 — Coordonnées + carte : « Nous trouver » (adresse) + « Nous contacter »
			    (email mailto) à gauche, carte interactive à droite (maquette « 04/ COORDONNÉES »). */}
			<section className="bg-paper pb-20 lg:pt-[100px] lg:pb-28">
				<div
					className={cn(
						CONTAINER,
						"grid gap-10 lg:grid-cols-[674fr_894fr] lg:items-start lg:gap-x-[3.5%]",
					)}
				>
					{/* Gauche : trouver (adresse) + contacter (email) */}
					<div className="flex flex-col gap-8 lg:gap-12">
						<div className="flex flex-col gap-4">
							<OutlineFillTitle
								outline={coordinates.find.titleOutline}
								fill={coordinates.find.titleFill}
							/>
							<p className="whitespace-pre-line font-sans text-lead-sm text-ink leading-snug lg:text-lead">
								{coordinates.address}
							</p>
						</div>
						<div className="h-px w-full bg-ink lg:h-[3px]" />
						<div className="flex flex-col gap-4">
							<OutlineFillTitle
								outline={coordinates.contact.titleOutline}
								fill={coordinates.contact.titleFill}
							/>
							<a
								href={`mailto:${coordinates.email}`}
								className="font-sans text-lead-sm text-ink underline-offset-4 hover:underline lg:text-lead"
								{...umamiAttrs("contact_email_click")}
							>
								{coordinates.email}
							</a>
						</div>
					</div>

					{/* Droite : carte interactive (repli = l'adresse texte ci-contre, FR-018) */}
					<div className="relative aspect-[894/536] w-full overflow-hidden">
						<ContactMap
							lat={coordinates.map.lat}
							lng={coordinates.map.lng}
							zoom={coordinates.map.zoom}
							markerLabel={coordinates.map.markerLabel}
						/>
					</div>
				</div>
			</section>
		</main>
	);
}
