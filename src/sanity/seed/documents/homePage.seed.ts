import { homePageContent } from "@/content/homePage";
import type { HomePage } from "@/sanity.types";
import { defineSeed, image } from "../define";

// Text comes from the shared homePageContent (single source — no duplication with the
// front fallback, Principle IX). Images live in seed-assets/homePage/ (committed,
// outside public/ → never served, never in the build; ADR 0006) — maquette visuals for
// now. The runner uploads them and injects each asset reference + `_key`. The object
// members (heroSlide / sector) declare their `_type` discriminator the schema expects.

const c = homePageContent;

const heroImages = [
	image(
		"seed-assets/homePage/hero-1.jpg",
		"Estuaire — là où les idées prennent forme",
	),
	image(
		"seed-assets/homePage/hero-2.jpg",
		"Estuaire — là où les savoir-faire s'assemblent",
	),
	image(
		"seed-assets/homePage/hero-3.jpg",
		"Estuaire — là où les talents se rencontrent",
	),
	image(
		"seed-assets/homePage/hero-4.jpg",
		"Estuaire — là où les matériaux se transforment",
	),
];

export default defineSeed<HomePage>({
	_id: "homePage",
	_type: "homePage",

	// — Hero —
	heroLabel: c.heroLabel,
	heroTrunk: c.heroTrunk,
	heroSlides: c.heroSlides.map((s, i) => ({
		_type: "heroSlide" as const,
		image: heroImages[i],
		keyword: s.keyword,
	})),

	// — Intro —
	introTitleOutline: c.introTitleOutline,
	introTitleFill: c.introTitleFill,
	introText: c.introText,
	introImagePrimary: image(
		"seed-assets/homePage/intro-primary.jpg",
		"Atelier Estuaire — agencement sur mesure",
	),
	introImageSecondary: image(
		"seed-assets/homePage/intro-secondary.jpg",
		"Réalisation Estuaire en cours d'installation",
	),

	// — Expertises —
	expertisesTitleOutline: c.expertisesTitleOutline,
	expertisesTitleFill: c.expertisesTitleFill,
	expertisesText: c.expertisesText,
	expertisesImage: image(
		"seed-assets/homePage/expertises.jpg",
		"Savoir-faire Estuaire — agencement et présentoirs",
	),
	expertisesCtaLabel: c.expertisesCtaLabel,
	expertisesCtaHref: c.expertisesCtaHref,

	// — Univers / secteurs —
	universSectors: c.universSectors.map((s) => ({
		...s,
		_type: "sector" as const,
	})),

	// — Réalisations (chrome only — cards + sector list are static) —
	realisationsTitleOutline: c.realisationsTitleOutline,
	realisationsTitleFill: c.realisationsTitleFill,
	realisationsCtaLabel: c.realisationsCtaLabel,
	realisationsCtaHref: c.realisationsCtaHref,

	// — Vision —
	visionTitleOutline: c.visionTitleOutline,
	visionTitleFill: c.visionTitleFill,
	visionText: c.visionText,
	visionImage: image(
		"seed-assets/homePage/vision.jpg",
		"Vision Estuaire — espaces singuliers",
	),
	visionCtaLabel: c.visionCtaLabel,
	visionCtaHref: c.visionCtaHref,

	// — SEO —
	seoMetaTitle: c.seoMetaTitle,
	seoMetaDescription: c.seoMetaDescription,
	seoOgImage: image(
		"seed-assets/homePage/og.jpg",
		"Estuaire — agenceur-concepteur engagé",
	),
});
