import { sectorsPageContent } from "@/content/sectorsPage";
import type { SectorsPage } from "@/sanity.types";
import { defineSeed, image } from "../define";

// Text comes from the shared sectorsPageContent (single source — no duplication with the
// front fallback, Principle IX). Images live in seed-assets/sectorsPage/ (committed,
// outside public/ → never served, never in the build; ADR 0006) — maquette visuals for
// now. The runner uploads them and injects each asset reference + `_key`. The array
// member objects (sector / keyFigure) declare their `_type` discriminator the schema
// expects; image array members are upload intents the runner resolves.

const c = sectorsPageContent;

// Per-sector band visual, by index (matches the sectors[] order in the content).
const sectorImages = [
	image("seed-assets/sectorsPage/retail.jpg", "Estuaire — agencement retail"),
	image(
		"seed-assets/sectorsPage/bureau.jpg",
		"Estuaire — agencement de bureaux",
	),
	image(
		"seed-assets/sectorsPage/residentiel.jpg",
		"Estuaire — agencement résidentiel",
	),
	image("seed-assets/sectorsPage/scenographie.jpg", "Estuaire — scénographie"),
];

export default defineSeed<SectorsPage>({
	_id: "sectorsPage",
	_type: "sectorsPage",

	// — Hero —
	heroEyebrow: c.heroEyebrow,
	heroTitleOutline: c.heroTitleOutline,
	heroTitleFill: c.heroTitleFill,
	heroImage: image(
		"seed-assets/sectorsPage/hero.jpg",
		"Estuaire — agencement sur mesure, du retail à vos bureaux",
	),

	// — Intro —
	introStatement: c.introStatement,
	introText: c.introText,
	introImage: image(
		"seed-assets/sectorsPage/intro.jpg",
		"Estuaire — un périmètre d'intervention multisectoriel",
	),

	// — Secteurs —
	sectors: c.sectors.map((sec, i) => ({
		_type: "sector" as const,
		label: sec.label,
		promise: sec.promise,
		href: sec.href,
		image: sectorImages[i],
	})),

	// — Infos clés —
	keyFigures: c.keyFigures.map((kf) => ({
		_type: "keyFigure" as const,
		value: kf.value,
		support: kf.support,
	})),

	// — SEO —
	seoMetaTitle: c.seoMetaTitle,
	seoMetaDescription: c.seoMetaDescription,
	seoOgImage: image("seed-assets/sectorsPage/og.jpg", "Estuaire — Univers"),
});
