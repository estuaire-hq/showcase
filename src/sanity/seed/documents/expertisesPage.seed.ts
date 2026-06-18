import { expertisesPageContent } from "@/content/expertisesPage";
import type { ExpertisesPage } from "@/sanity.types";
import { defineSeed, image } from "../define";

// Text comes from the shared expertisesPageContent (single source — no duplication with the
// front fallback, Principle IX). Images live in seed-assets/expertisesPage/ (committed,
// outside public/ → never served, never in the build; ADR 0006) — maquette visuals for now.
// The runner uploads them and injects each asset reference + `_key`. The array member objects
// (expertiseLevel) declare their `_type` discriminator the schema expects; image array
// members are upload intents the runner resolves (no `_type` needed).

const c = expertisesPageContent;

// One visual per level, mirroring the maquette card order (03/ NOS NIVEAUX D'EXPERTISE).
const levelImages = [
	image(
		"seed-assets/expertisesPage/level-agencement.jpg",
		"Agencement sur mesure — Estuaire",
	),
	image(
		"seed-assets/expertisesPage/level-mobiliers.jpg",
		"Mobiliers sur mesure et en série — Estuaire",
	),
	image(
		"seed-assets/expertisesPage/level-presentoirs.jpg",
		"Présentoirs sur mesure — Estuaire",
	),
];

export default defineSeed<ExpertisesPage>({
	_id: "expertisesPage",
	_type: "expertisesPage",

	// — Hero —
	heroEyebrow: c.heroEyebrow,
	heroTitleOutline: c.heroTitleOutline,
	heroTitleFill: c.heroTitleFill,
	heroImage: image(
		"seed-assets/expertisesPage/hero.jpg",
		"Estuaire — design d'espace, agencement et présentoirs",
	),

	// — Intro —
	introStatement: c.introStatement,
	introText: c.introText,
	introImagePrimary: image(
		"seed-assets/expertisesPage/intro-primary.jpg",
		"Réalisation Estuaire — ouvrage multimatériaux",
	),
	introImageSecondary: image(
		"seed-assets/expertisesPage/intro-secondary.jpg",
		"Réalisation Estuaire — détail d'agencement",
	),

	// — Niveaux —
	levelsTitleOutline: c.levelsTitleOutline,
	levelsTitleFill: c.levelsTitleFill,
	levelsImage: image(
		"seed-assets/expertisesPage/levels-header.jpg",
		"Savoir-faire Estuaire — atelier",
	),
	levels: c.levels.map((l, i) => ({
		_type: "expertiseLevel" as const,
		title: l.title,
		ctaLabel: l.ctaLabel,
		ctaHref: l.ctaHref,
		image: levelImages[i],
	})),

	// — Grand visuel —
	statementImage: image(
		"seed-assets/expertisesPage/statement.jpg",
		"Atelier Estuaire — la précision du sur-mesure et la puissance de l'industrie",
	),
	statementText: c.statementText,

	// — SEO —
	seoMetaTitle: c.seoMetaTitle,
	seoMetaDescription: c.seoMetaDescription,
	seoOgImage: image(
		"seed-assets/expertisesPage/og.jpg",
		"Estuaire — expertises",
	),
});
