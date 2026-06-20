import {
	type ExpertiseSubpageContent,
	expertiseSubpagesContent,
} from "@/content/expertiseSubpages";
import type { ExpertiseSubpage } from "@/sanity.types";
import { defineSeed, image, type SeedImage } from "../define";

// Three documents of ONE type (agencement / mobiliers / présentoirs) — the same gabarit, three
// distinct contents (Principle IV). Text comes from the shared `expertiseSubpagesContent` (single
// source — no duplication with the front fallback, Principle IX). Images live in
// seed-assets/expertiseSubpages/<slug>/ (committed, outside public/ → never served; ADR 0006) —
// maquette visuals for now. The runner uploads them and injects each asset reference + `_key`.

type SubpageImages = {
	hero: SeedImage;
	intro: SeedImage;
	responsable: SeedImage[];
	caseStudy: SeedImage;
	og: SeedImage;
};

/** Build one expertiseSubpage seed from its shared content + its image set. */
function subpageSeed(slug: string, images: SubpageImages) {
	const c: ExpertiseSubpageContent = expertiseSubpagesContent[slug];
	return defineSeed<ExpertiseSubpage>({
		_id: `expertiseSubpage.${slug}`,
		_type: "expertiseSubpage",
		title: c.seoMetaTitle,
		slug: { _type: "slug", current: slug },

		// — Hero —
		breadcrumb: c.breadcrumb,
		heroEyebrow: c.heroEyebrow,
		heroTitleOutline: c.heroTitleOutline,
		heroTitleFill: c.heroTitleFill,
		heroImage: images.hero,

		// — Intro —
		introStatement: c.introStatement,
		introText: c.introText,
		introImage: images.intro,

		// — Responsable —
		responsableTitleOutline: c.responsableTitleOutline,
		responsableTitleFill: c.responsableTitleFill,
		responsableText: c.responsableText,
		responsableImages: images.responsable,

		// — Engagements —
		engagementsTitleOutline: c.engagementsTitleOutline,
		engagementsTitleFill: c.engagementsTitleFill,
		engagements: c.engagements.map((title) => ({
			_type: "engagement" as const,
			title,
		})),

		// — Cas study —
		caseStudyTitleOutline: c.caseStudyTitleOutline,
		caseStudyTitleFill: c.caseStudyTitleFill,
		caseStudyImage: images.caseStudy,
		caseStudyProjectTitle: c.caseStudyProjectTitle,
		caseStudyMeta: c.caseStudyMeta,
		caseStudyCtaLabel: c.caseStudyCtaLabel,
		caseStudyCtaHref: c.caseStudyCtaHref,

		// — SEO —
		seoMetaTitle: c.seoMetaTitle,
		seoMetaDescription: c.seoMetaDescription,
		seoOgImage: images.og,
	});
}

const dir = "seed-assets/expertiseSubpages";

const expertiseSubpages = [
	subpageSeed("agencement-sur-mesure", {
		hero: image(
			`${dir}/agencement-sur-mesure/hero.jpg`,
			"Agencement sur mesure — Estuaire",
		),
		intro: image(
			`${dir}/agencement-sur-mesure/intro.jpg`,
			"Réalisation d’agencement Estuaire",
		),
		responsable: [
			image(
				`${dir}/agencement-sur-mesure/responsable-1.jpg`,
				"Atelier Estuaire — agencement",
			),
			image(
				`${dir}/agencement-sur-mesure/responsable-2.jpg`,
				"Détail d’agencement Estuaire",
			),
			image(
				`${dir}/agencement-sur-mesure/responsable-3.jpg`,
				"Réalisation d’agencement Estuaire",
			),
		],
		caseStudy: image(
			`${dir}/agencement-sur-mesure/case-study.jpg`,
			"L’artisan parfumeur — réalisation Estuaire",
		),
		og: image(
			`${dir}/agencement-sur-mesure/og.jpg`,
			"Estuaire — agencement sur mesure",
		),
	}),
	subpageSeed("mobiliers-sur-mesure", {
		hero: image(
			`${dir}/mobiliers-sur-mesure/hero.jpg`,
			"Mobiliers sur mesure et en série — Estuaire",
		),
		intro: image(
			`${dir}/mobiliers-sur-mesure/intro.jpg`,
			"Mobilier sur mesure Estuaire",
		),
		responsable: [
			image(
				`${dir}/mobiliers-sur-mesure/responsable-1.jpg`,
				"Atelier Estuaire — mobilier",
			),
			image(
				`${dir}/mobiliers-sur-mesure/responsable-2.jpg`,
				"Détail de mobilier Estuaire",
			),
			image(
				`${dir}/mobiliers-sur-mesure/responsable-3.jpg`,
				"Mobilier sur mesure Estuaire",
			),
		],
		caseStudy: image(
			`${dir}/mobiliers-sur-mesure/case-study.jpg`,
			"Citadium — réalisation Estuaire",
		),
		og: image(
			`${dir}/mobiliers-sur-mesure/og.jpg`,
			"Estuaire — mobiliers sur mesure et en série",
		),
	}),
	subpageSeed("presentoirs-sur-mesure", {
		hero: image(
			`${dir}/presentoirs-sur-mesure/hero.jpg`,
			"Présentoirs sur mesure — Estuaire",
		),
		intro: image(
			`${dir}/presentoirs-sur-mesure/intro.jpg`,
			"Présentoir sur mesure Estuaire",
		),
		responsable: [
			image(
				`${dir}/presentoirs-sur-mesure/responsable-1.jpg`,
				"Atelier Estuaire — présentoir",
			),
			image(
				`${dir}/presentoirs-sur-mesure/responsable-2.jpg`,
				"Détail de présentoir Estuaire",
			),
			image(
				`${dir}/presentoirs-sur-mesure/responsable-3.jpg`,
				"Présentoir sur mesure Estuaire",
			),
		],
		caseStudy: image(
			`${dir}/presentoirs-sur-mesure/case-study.jpg`,
			"La Distillerie Générale — réalisation Estuaire",
		),
		og: image(
			`${dir}/presentoirs-sur-mesure/og.jpg`,
			"Estuaire — présentoirs sur mesure",
		),
	}),
];

export default expertiseSubpages;
