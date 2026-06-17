import { aboutPageContent } from "@/content/aboutPage";
import type { AboutPage } from "@/sanity.types";
import { defineSeed, image } from "../define";

// Text comes from the shared aboutPageContent (single source — no duplication with the
// front fallback, Principle IX). Images live in seed-assets/aboutPage/ (committed,
// outside public/ → never served, never in the build; ADR 0006) — maquette visuals for
// now. The runner uploads them and injects each asset reference + `_key`. The array
// member objects (processStep) declare their `_type` discriminator the schema expects;
// image array members are upload intents the runner resolves (no `_type` needed).

const c = aboutPageContent;

// Step images by index — mirrors the maquette slot order per step (06/ MODE OPÉRATOIRE).
const stepImages = [
	[
		image(
			"seed-assets/aboutPage/process-01-1.jpg",
			"Atelier Estuaire — analyse",
		),
		image(
			"seed-assets/aboutPage/process-01-2.jpg",
			"Atelier Estuaire — analyse",
		),
	],
	[
		image(
			"seed-assets/aboutPage/process-02-1.jpg",
			"Atelier Estuaire — co-conception",
		),
	],
	[
		image(
			"seed-assets/aboutPage/process-03-1.jpg",
			"Atelier Estuaire — co-construction",
		),
		image(
			"seed-assets/aboutPage/process-03-2.jpg",
			"Atelier Estuaire — co-construction",
		),
	],
	[
		image(
			"seed-assets/aboutPage/process-04-1.jpg",
			"Estuaire — installation et déploiement",
		),
		image(
			"seed-assets/aboutPage/process-04-2.jpg",
			"Estuaire — installation et déploiement",
		),
	],
];

export default defineSeed<AboutPage>({
	_id: "aboutPage",
	_type: "aboutPage",

	// — Hero —
	heroEyebrow: c.heroEyebrow,
	heroTitleOutline: c.heroTitleOutline,
	heroTitleFill: c.heroTitleFill,
	heroImage: image(
		"seed-assets/aboutPage/hero.jpg",
		"Estuaire — menuiserie et agencement sur-mesure",
	),

	// — Intro —
	introStatement: c.introStatement,
	introText: c.introText,
	introImagePrimary: image(
		"seed-assets/aboutPage/intro-primary.jpg",
		"Atelier Estuaire — savoir-faire multimatériaux",
	),
	introImageSecondary: image(
		"seed-assets/aboutPage/intro-secondary.jpg",
		"Réalisation Estuaire — détail d'agencement",
	),
	introHighlight: c.introHighlight,

	// — Vision —
	visionTitleOutline: c.visionTitleOutline,
	visionTitleFill: c.visionTitleFill,
	visionText: c.visionText,
	visionImages: [
		image("seed-assets/aboutPage/vision-1.jpg", "Vision Estuaire — confluence"),
		image(
			"seed-assets/aboutPage/vision-2.jpg",
			"Vision Estuaire — espaces singuliers",
		),
	],

	// — Atelier —
	atelierTitleOutline: c.atelierTitleOutline,
	atelierTitleFill: c.atelierTitleFill,
	atelierText: c.atelierText,
	atelierPillarsLead: c.atelierPillarsLead,
	atelierPillars: c.atelierPillars,
	atelierCapabilities: c.atelierCapabilities,
	atelierImages: [
		image(
			"seed-assets/aboutPage/atelier-1.jpg",
			"Atelier Estuaire — Machecoul",
		),
		image(
			"seed-assets/aboutPage/atelier-2.jpg",
			"Atelier Estuaire — fabrication",
		),
		image(
			"seed-assets/aboutPage/atelier-3.jpg",
			"Atelier Estuaire — production",
		),
		image(
			"seed-assets/aboutPage/atelier-4.jpg",
			"Atelier Estuaire — finitions",
		),
		image(
			"seed-assets/aboutPage/atelier-5.jpg",
			"Atelier Estuaire — installation et déploiement",
		),
	],
	atelierHighlight: c.atelierHighlight,

	// — Mode opératoire —
	processTitleOutline: c.processTitleOutline,
	processTitleFill: c.processTitleFill,
	processIntro: c.processIntro,
	processIntroImage: image(
		"seed-assets/aboutPage/process-intro.jpg",
		"Estuaire — pilotage de proximité",
	),
	processSteps: c.processSteps.map((s, i) => ({
		_type: "processStep" as const,
		number: s.number,
		title: s.title,
		text: s.text,
		bullets: s.bullets,
		images: stepImages[i],
	})),

	// — Grand visuel —
	statementImage: image(
		"seed-assets/aboutPage/statement.jpg",
		"Atelier Estuaire — un cadre pour expérimenter et innover",
	),
	statementText: c.statementText,

	// — CTA —
	ctaLabel: c.ctaLabel,
	ctaHref: c.ctaHref,

	// — SEO —
	seoMetaTitle: c.seoMetaTitle,
	seoMetaDescription: c.seoMetaDescription,
	seoOgImage: image(
		"seed-assets/aboutPage/og.jpg",
		"Estuaire — agenceur-concepteur engagé",
	),
});
