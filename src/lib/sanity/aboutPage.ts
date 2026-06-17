import { aboutPageContent } from "@/content/aboutPage";
import { sanityFetch } from "./live";
import { mapImage, type ResolvedImage } from "./mapImage";
import { ABOUT_PAGE_QUERY } from "./queries";

// Types derive from the schema via TypeGen (`sanity.types.ts`) — never hand-typed
// (constitution Principle IX). Mirror of `homePage.ts`: fetch the singleton, apply the
// maquette defaults (`aboutPageContent`, single source with the seed), resolve images
// via the shared `mapImage` (`urlFor` + LQIP). « Nous découvrir » is page-specific
// content → fetched by the page connector, not a global `src/components/` wrapper
// (Principle VIII).

const DEFAULTS = aboutPageContent;

/** Map a projected image array to resolved slots, PRESERVING index (the page places each
 *  slot by its maquette position). Missing slots stay `undefined` so the page degrades
 *  gracefully (cas limite « visuel manquant »). Empty when Sanity is unseeded → the page
 *  renders the text fallback (SC-006). */
function mapSlots(
	arr: ReadonlyArray<Parameters<typeof mapImage>[0]> | null | undefined,
	width: number,
	altBase: string,
): (ResolvedImage | undefined)[] {
	return (arr ?? []).map((img, i) =>
		mapImage(img, width, `${altBase} ${i + 1}`),
	);
}

/** Fetch the aboutPage singleton and map it to the page's section props (Sanity → src). */
export async function getAboutPageProps() {
	const { data: a } = await sanityFetch({ query: ABOUT_PAGE_QUERY });

	const heroTitleFill = a?.heroTitleFill ?? DEFAULTS.heroTitleFill;
	const heroAlt = `Estuaire — ${heroTitleFill}`;

	// Steps: Sanity steps (with images) when present, else the maquette text steps as a
	// fallback (image-less — the section degrades to its text; images arrive once seeded).
	const sanitySteps = (a?.processSteps ?? []).map((s, i) => {
		const def = DEFAULTS.processSteps[i];
		const title = s.title ?? def?.title ?? "";
		return {
			number: s.number ?? def?.number ?? "",
			title,
			text: s.text ?? def?.text ?? "",
			bullets: s.bullets ?? def?.bullets ?? [],
			images: mapSlots(s.images, 1300, `Estuaire — ${title}`),
		};
	});
	const steps = sanitySteps.length
		? sanitySteps
		: DEFAULTS.processSteps.map((s) => ({
				number: s.number,
				title: s.title,
				text: s.text,
				bullets: s.bullets,
				images: [] as (ResolvedImage | undefined)[],
			}));

	return {
		hero: {
			eyebrow: a?.heroEyebrow ?? DEFAULTS.heroEyebrow,
			titleOutline: a?.heroTitleOutline ?? DEFAULTS.heroTitleOutline,
			titleFill: heroTitleFill,
			image: mapImage(a?.heroImage, 1920, heroAlt),
		},
		intro: {
			statement: a?.introStatement ?? DEFAULTS.introStatement,
			text: a?.introText ?? DEFAULTS.introText,
			imagePrimary: mapImage(a?.introImagePrimary, 1100, "Atelier Estuaire"),
			imageSecondary: mapImage(
				a?.introImageSecondary,
				800,
				"Réalisation Estuaire",
			),
			highlight: a?.introHighlight ?? DEFAULTS.introHighlight,
		},
		vision: {
			titleOutline: a?.visionTitleOutline ?? DEFAULTS.visionTitleOutline,
			titleFill: a?.visionTitleFill ?? DEFAULTS.visionTitleFill,
			text: a?.visionText ?? DEFAULTS.visionText,
			images: mapSlots(a?.visionImages, 1000, "Vision Estuaire"),
		},
		atelier: {
			titleOutline: a?.atelierTitleOutline ?? DEFAULTS.atelierTitleOutline,
			titleFill: a?.atelierTitleFill ?? DEFAULTS.atelierTitleFill,
			text: a?.atelierText ?? DEFAULTS.atelierText,
			pillarsLead: a?.atelierPillarsLead ?? DEFAULTS.atelierPillarsLead,
			pillars: a?.atelierPillars?.length
				? a.atelierPillars
				: DEFAULTS.atelierPillars,
			capabilities: a?.atelierCapabilities?.length
				? a.atelierCapabilities
				: DEFAULTS.atelierCapabilities,
			images: mapSlots(a?.atelierImages, 1100, "Atelier Estuaire"),
			highlight: a?.atelierHighlight ?? DEFAULTS.atelierHighlight,
		},
		process: {
			titleOutline: a?.processTitleOutline ?? DEFAULTS.processTitleOutline,
			titleFill: a?.processTitleFill ?? DEFAULTS.processTitleFill,
			intro: a?.processIntro ?? DEFAULTS.processIntro,
			introImage: mapImage(
				a?.processIntroImage,
				1000,
				"Mode opératoire Estuaire",
			),
			steps,
		},
		statement: {
			image: mapImage(a?.statementImage, 1920, "Atelier Estuaire"),
			text: a?.statementText ?? DEFAULTS.statementText,
		},
		cta: {
			label: a?.ctaLabel ?? DEFAULTS.ctaLabel,
			href: a?.ctaHref ?? DEFAULTS.ctaHref,
		},
		seo: {
			metaTitle: a?.seoMetaTitle ?? DEFAULTS.seoMetaTitle,
			metaDescription: a?.seoMetaDescription ?? DEFAULTS.seoMetaDescription,
			// OG image projects no `lqip` (no blur placeholder for a share image) — mapImage
			// handles its absence via the optional `lqip`.
			ogImage: mapImage(a?.seoOgImage, 1200, "Estuaire — Nous découvrir"),
		},
	};
}

export type AboutPageProps = Awaited<ReturnType<typeof getAboutPageProps>>;
