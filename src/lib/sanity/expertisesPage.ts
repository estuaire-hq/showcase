import { expertisesPageContent } from "@/content/expertisesPage";
import { sanityFetch } from "./live";
import { mapImage, type ResolvedImage } from "./mapImage";
import { EXPERTISES_PAGE_QUERY } from "./queries";

// Types derive from the schema via TypeGen (`sanity.types.ts`) — never hand-typed
// (constitution Principle IX). Mirror of `aboutPage.ts`: fetch the singleton, apply the
// maquette defaults (`expertisesPageContent`, single source with the seed), resolve images
// via the shared `mapImage` (`urlFor` + LQIP). « Expertises » is page-specific content →
// fetched by the page connector, not a global `src/components/` wrapper (Principle VIII).

const DEFAULTS = expertisesPageContent;

/** Last path segment of a CTA href, used as a non-PII Umami tracking dimension
 *  (e.g. `/expertises/agencement-sur-mesure` → `agencement-sur-mesure`). */
function slugFromHref(href: string | null | undefined): string {
	if (!href) return "";
	return href.split("/").filter(Boolean).pop() ?? "";
}

/** Fetch the expertisesPage singleton and map it to the page's section props (Sanity → src). */
export async function getExpertisesPageProps() {
	const { data: e } = await sanityFetch({ query: EXPERTISES_PAGE_QUERY });

	const heroTitleFill = e?.heroTitleFill ?? DEFAULTS.heroTitleFill;
	const heroAlt = "Estuaire — design d'espace, agencement et présentoirs";

	// Levels: Sanity levels (with images) when present, else the maquette levels as a
	// fallback (image-less — the cards degrade to their text + link; images arrive once
	// seeded). Each level exposes a `slug` derived from its href for non-PII tracking.
	const sanityLevels = (e?.levels ?? []).map((l, i) => {
		const def = DEFAULTS.levels[i];
		const title = l.title ?? def?.title ?? "";
		const ctaHref = l.ctaHref ?? def?.ctaHref ?? "";
		return {
			title,
			ctaLabel: l.ctaLabel ?? def?.ctaLabel ?? "en savoir plus",
			ctaHref,
			slug: slugFromHref(ctaHref),
			image: mapImage(l.image, 1920, `Estuaire — ${title.replace(/\n/g, " ")}`),
		};
	});
	const levels = sanityLevels.length
		? sanityLevels
		: DEFAULTS.levels.map((l) => ({
				title: l.title,
				ctaLabel: l.ctaLabel,
				ctaHref: l.ctaHref,
				slug: slugFromHref(l.ctaHref),
				image: undefined as ResolvedImage | undefined,
			}));

	return {
		hero: {
			eyebrow: e?.heroEyebrow ?? DEFAULTS.heroEyebrow,
			titleOutline: e?.heroTitleOutline ?? DEFAULTS.heroTitleOutline,
			titleFill: heroTitleFill,
			image: mapImage(e?.heroImage, 1920, heroAlt),
		},
		intro: {
			statement: e?.introStatement ?? DEFAULTS.introStatement,
			text: e?.introText ?? DEFAULTS.introText,
			imagePrimary: mapImage(
				e?.introImagePrimary,
				1100,
				"Réalisation Estuaire",
			),
			imageSecondary: mapImage(
				e?.introImageSecondary,
				800,
				"Réalisation Estuaire",
			),
		},
		levels: {
			titleOutline: e?.levelsTitleOutline ?? DEFAULTS.levelsTitleOutline,
			titleFill: e?.levelsTitleFill ?? DEFAULTS.levelsTitleFill,
			image: mapImage(e?.levelsImage, 900, "Savoir-faire Estuaire"),
			items: levels,
		},
		statement: {
			image: mapImage(e?.statementImage, 1920, "Atelier Estuaire"),
			text: e?.statementText ?? DEFAULTS.statementText,
		},
		seo: {
			metaTitle: e?.seoMetaTitle ?? DEFAULTS.seoMetaTitle,
			metaDescription: e?.seoMetaDescription ?? DEFAULTS.seoMetaDescription,
			// OG image projects no `lqip` (no blur placeholder for a share image) — mapImage
			// handles its absence via the optional `lqip`.
			ogImage: mapImage(e?.seoOgImage, 1200, "Estuaire — Expertises"),
		},
	};
}

export type ExpertisesPageProps = Awaited<
	ReturnType<typeof getExpertisesPageProps>
>;
