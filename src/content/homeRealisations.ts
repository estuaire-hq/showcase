/**
 * Home « Nos réalisations par secteur » — STATIC content (FR-005, ADR 0011).
 *
 * No "realisation" CMS model exists yet: it is designed in the future "Réalisations"
 * feature, which will replace this file with a Sanity fetch and rebind each link to
 * its detail page (`/realisations/[slug]`). Until then everything here is static and
 * every link points at the catalogue route `/realisations` (a key route guaranteed to
 * exist, SC-002) — so there is no permanent dead link despite the placeholder content.
 *
 * Card visuals are committed under `public/home/realisations/` (the only served
 * location for non-CMS images — exception to Principle II, bounded & documented).
 */

/** All realisation links resolve here for now (no per-item deep link — FR-005). */
export const REALISATIONS_HREF = "/realisations";

/**
 * Decorative images of the réalisations section header (maquette 51:2221 — the "TOP"
 * group): `feature` (674×700, top-right beside the title), `wide` (1027×625,
 * bottom-left beside the sector menu). Static like the cards (ADR 0011).
 */
export const homeRealisationImages = {
	feature: {
		src: "/home/realisations/feature.jpg",
		alt: "Réalisation Estuaire",
	},
	wide: { src: "/home/realisations/wide.jpg", alt: "Agencement Estuaire" },
};

/**
 * The "par secteur" sector list of the réalisations section (maquette 51:2221 — the
 * 13-row menu). These are realisation categories, distinct from the 4 univers; all
 * resolve to the catalogue for now (Pierre's clarification). Rebound with the
 * Réalisations feature.
 */
export const homeRealisationSectors = [
	"Banque & assurance",
	"Culture",
	"Hôtellerie & restauration",
	"Joaillerie",
	"Mode",
	"Optique",
	"Parfums",
	"Résidentiel",
	"Soin & cosmétique",
	"Spiritueux",
	"Sport & lifestyle",
	"Technologie & communication",
];

export type HomeRealisationCard = {
	/** `public/` path (e.g. `/home/realisations/realisation-1.jpg`). */
	image: string;
	/** Realisation title (also used as the image `alt`). */
	title: string;
	/** Rendered with tick separators by CaseStudyCard (lieu · année · superficie). */
	meta: string[];
};

/**
 * The featured realisation cards (maquette « CAS STUDY » bands, 1920×718). Placeholder
 * values standing in for the future CMS content — visuals from the maquette.
 */
export const homeRealisationCards: HomeRealisationCard[] = [
	{
		image: "/home/realisations/realisation-1.jpg",
		title: "Boutique Lumière",
		meta: ["Paris", "2024", "240 m²"],
	},
	{
		image: "/home/realisations/realisation-2.jpg",
		title: "Showroom Atelier",
		meta: ["Lyon", "2023", "320 m²"],
	},
	{
		image: "/home/realisations/realisation-3.jpg",
		title: "Résidence Horizon",
		meta: ["Nantes", "2024", "180 m²"],
	},
];
