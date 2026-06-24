/**
 * Expertise sub-pages maquette content — the single home of the editorial copy of the three
 * sub-pages (constitution Principle IX: maquette values live in ONE place). Read losslessly
 * from the Figma nodes (agencement 51:3008 / 87:6762 / 87:6964 ; mobiliers 51:3134 ;
 * présentoirs 51:3259) — never guessed.
 *
 * Indexed by slug (= the dynamic route segment). Consumed "downward" by:
 *   - the seed (`@/sanity/seed/documents/expertiseSubpages.seed.ts`) → written to Sanity;
 *   - the front fallback (`@/lib/sanity/expertiseSubpage.ts` DEFAULTS) → rendered if Sanity is
 *     empty (text only — SC-007).
 *
 * Images are intentionally NOT here (text only): content images come from the seed
 * (seed-assets/expertiseSubpages/<slug>/, uploaded to Sanity), exactly like home/about (ADR 0004).
 *
 * `\n` is meaningful: title lines (outline/fill device) and paragraph breaks (`\n\n`) in body
 * copy — rendered with `whitespace-pre-line`. `introBlueHalf` is a per-expertise LAYOUT fact of
 * the maquette (desktop blue left-half behind the intro), not editorial content → kept here, not
 * in the CMS.
 */

export type ExpertiseSubpageContent = {
	breadcrumb: string;
	heroEyebrow: string;
	heroTitleOutline: string;
	heroTitleFill: string;
	introStatement: string;
	introText: string;
	/** Desktop blue left-half behind the intro (maquette layout fact, not CMS content). */
	introBlueHalf: boolean;
	responsableTitleOutline: string;
	responsableTitleFill: string;
	responsableText: string;
	engagementsTitleOutline: string;
	engagementsTitleFill: string;
	engagements: string[];
	caseStudyTitleOutline: string;
	caseStudyTitleFill: string;
	caseStudyProjectTitle: string;
	caseStudyMeta: string[];
	caseStudyCtaLabel: string;
	caseStudyCtaHref: string;
	seoMetaTitle: string;
	seoMetaDescription: string;
};

export const expertiseSubpagesContent: Record<string, ExpertiseSubpageContent> =
	{
		"agencement-sur-mesure": {
			// — Hero (02/ SLIDER) —
			breadcrumb: "expertises / agencement sur-mesure",
			heroEyebrow: "Agencement sur-mesure",
			heroTitleOutline: "Notre vision",
			heroTitleFill: "du métier d’agenceur.",

			// — Intro (03/ INTRO) —
			introStatement:
				"Des espaces conçus dans leur ensemble et jusque dans les moindres détails.",
			introText:
				"Agencer un espace, c’est entrevoir, au-delà des volumes, l’ensemble des enjeux : respect des normes, circulation des personnes, interactions avec le mobilier et transformation de l’espace en expérience cohérente.\n\nDu concept unique à la série, notre méthode est identique : nous décodons vos plans et vos ambitions pour anticiper chaque contrainte, imaginer des solutions techniques sur mesure et ainsi, co-créer des espaces fonctionnels.\n\nQu’il s’agisse de lieux de vie, de bureaux ou de points de vente, nous apprenons à maitriser vos concepts dans le moindre détail et les déployons avec maîtrise et ingéniosité, sans compromis sur votre vision.",
			introBlueHalf: true,

			// — Responsable (04/ RESPONSABLE) —
			responsableTitleOutline: "Un seul\net même",
			responsableTitleFill: "responsable\nde A à Z",
			responsableText:
				"Être votre interlocuteur privilégié pour piloter l’ensemble de votre projet : du mobilier simple aux espaces techniquement exigeants.\n\nNotre expertise du sur-mesure et la performance de notre outil industriel garantissent un déploiement homogène, efficace et optimal.",

			// — Engagements (05/ NOS ENGAGEMENTS) — order = 01/…06/
			engagementsTitleOutline: "Nos",
			engagementsTitleFill: "engagements",
			engagements: [
				"Co-concevoir avec l’architecte et optimiser les espaces pour allier usage et esthétique.",
				"Anticiper les contraintes multifactorielles.",
				"Gérer la complexité des déploiements multisites avec fiabilité.",
				"Proposer des solutions techniques et matériaux innovantes.",
				"Respecter vos délais, budgets et contraintes logistiques.",
				"Assurer la pérennité et la maintenance de vos installations.",
			],

			// — Cas study (06/ CAS STUDY) —
			caseStudyTitleOutline: "Découvrez notre dernier",
			caseStudyTitleFill: "projet d’agencement",
			caseStudyProjectTitle: "L’artisan parfumeur",
			caseStudyMeta: ["Lieu", "année", "superficie"],
			caseStudyCtaLabel: "découvrir nos réalisations",
			caseStudyCtaHref: "/realisations",

			// — SEO (defaults; editable in Studio) —
			seoMetaTitle: "Agencement sur mesure",
			seoMetaDescription:
				"Estuaire conçoit et réalise vos espaces dans leur ensemble et jusque dans les moindres détails : un seul et même responsable de A à Z, du concept unique à la série. Découvrez notre vision du métier d’agenceur.",
		},

		"mobiliers-sur-mesure": {
			// — Hero (02/ SLIDER) — breadcrumb dérivé du gabarit (frame desktop sans fil d'Ariane)
			breadcrumb: "expertises / mobiliers sur-mesure",
			heroEyebrow: "Mobiliers sur mesure et en série",
			heroTitleOutline: "Notre savoir-faire",
			heroTitleFill: "appliqué aux mobiliers.",

			// — Intro (03/ INTRO) —
			introStatement: "Des mobiliers\npour tous les goûts",
			introText:
				"Fixe ou mobile, seul ou faisant partie d’un ensemble, à l’unité ou en série, le mobilier est l’élément clé qui compose et organise l’espace. Comptoirs, banques d’accueil, tables, assises, muraux… sont les points de départ d’une interaction entre l’utilisateur et son environnement. Chaque mobilier sert ainsi un double objectif de design et d’utilité. Il crée un moment de vie en incarnant de façon cohérente l’atmosphère du lieu.\n\nChaque dessin prend forme dans nos logiciels de CAO/DAO sous l’œil expert de nos concepteurs. Au sein du bureau d’étude, l’idée est modélisée, les matériaux optimisés, les détails finalisés.\n\nLes décisions sont guidées par le respect du cahier des charges, la conformité avec les normes en vigueur, l’ergonomie, la robustesse et la durabilité de la fabrication.",
			introBlueHalf: false,

			// — Responsable (04/ RESPONSABLE) —
			responsableTitleOutline: "Garantir\nla cohérence",
			responsableTitleFill: "du prototype\nà la production",
			responsableText:
				"Donner vie à des mobiliers sur-mesure ou reproductibles en mini-série, capables de susciter une émotion durable, sans compromis sur l’intention initiale.",

			// — Engagements (05/ NOS ENGAGEMENTS) — order = 01/…06/
			engagementsTitleOutline: "Nos",
			engagementsTitleFill: "engagements",
			engagements: [
				"Traduire l’intention créative en solution techniquement viable et industrialisable.",
				"Co-concevoir des mobiliers alliant esthétique, usage et conformité.",
				"Prototyper, tester et ajuster avant tout lancement en production.",
				"Optimiser les choix matériaux et procédés pour garantir qualité et compétitivité.",
				"Anticiper les contraintes logistiques, d’installation et d’exploitation.",
				"Garantir précision, homogénéité et qualité constante à chaque exemplaire.",
			],

			// — Cas study (06/ CAS STUDY) —
			caseStudyTitleOutline: "Découvrez notre dernier",
			caseStudyTitleFill: "projet de mobilier",
			caseStudyProjectTitle: "Citadium",
			caseStudyMeta: ["Paris", "2025", "140 m²"],
			caseStudyCtaLabel: "découvrir nos réalisations",
			caseStudyCtaHref: "/realisations",

			// — SEO —
			seoMetaTitle: "Mobiliers sur mesure et en série",
			seoMetaDescription:
				"Estuaire donne vie à des mobiliers sur-mesure ou reproductibles en mini-série : du prototype à la production, des comptoirs aux assises, avec une cohérence garantie. Découvrez notre savoir-faire appliqué aux mobiliers.",
		},

		"presentoirs-sur-mesure": {
			// — Hero (02/ SLIDER) — breadcrumb dérivé du gabarit (frame desktop sans fil d'Ariane)
			breadcrumb: "expertises / présentoirs sur-mesure",
			heroEyebrow: "Présentoirs sur mesure et en série",
			heroTitleOutline: "Notre exigence",
			heroTitleFill: "au service des présentoirs.",

			// — Intro (03/ INTRO) —
			introStatement: "Asseoir vos produits\net bien plus",
			introText:
				"Un présentoir capte le regard, met en valeur un produit, une information et projette l’utilisateur dans l’expérience qu’il s’apprête à vivre.\n\nPrésentoir sur pied ou à poser sur un comptoir, minimaliste ou imposant, modulable ou statique, composé d’un seul matériau ou de plusieurs, tout est permis. L’imagination ne connaît pas de limite, tout comme notre maitrise multimatériaux qui offre une infinité de possibilité.\n\nChez nous, vos présentoirs sont bien plus que de simples accessoires. Nous les concevons comme des écrins qui élèvent vos produits en épousant leurs formes et en les éclairant.",
			introBlueHalf: false,

			// — Responsable (04/ RESPONSABLE) —
			responsableTitleOutline: "Conception\nsur-mesure",
			responsableTitleFill: "et optimisation",
			responsableText:
				"Chaque présentoir est prototypé et approuvé en conditions réelles. Aucun détail n’est laissé au hasard, de la coupe aux finitions.\n\nNotre outil industriel garantit précision d’usinage, homogénéité et répétabilité impeccable, du prototype à la série.",

			// — Engagements (05/ NOS ENGAGEMENTS) — order = 01/…06/
			engagementsTitleOutline: "Nos",
			engagementsTitleFill: "engagements",
			engagements: [
				"Concevoir des dispositifs qui valorisent le produit et renforcent l’expérience de marque.",
				"Maîtriser le multimatériaux pour créer contraste, légèreté ou impact visuel.",
				"Garantir précision d’usinage et qualité des finitions, du prototype à la série.",
				"Prototyper et tester en conditions réelles avant validation.",
				"Optimiser transport, montage et durabilité en exploitation.",
				"Assurer homogénéité et répétabilité pour les déploiements multi-points de vente.",
			],

			// — Cas study (06/ CAS STUDY) —
			caseStudyTitleOutline: "Découvrez notre dernier",
			caseStudyTitleFill: "projet de présentoir",
			caseStudyProjectTitle: "La Distillerie Générale",
			caseStudyMeta: ["International", "2019"],
			caseStudyCtaLabel: "découvrir nos réalisations",
			caseStudyCtaHref: "/realisations",

			// — SEO —
			seoMetaTitle: "Présentoirs sur mesure",
			seoMetaDescription:
				"Estuaire conçoit des présentoirs sur-mesure qui captent le regard et valorisent vos produits : maîtrise multimatériaux, précision d’usinage et répétabilité, du prototype à la série. Découvrez notre exigence au service des présentoirs.",
		},
	};

/** Known sub-page slugs (route segments) — drives `generateStaticParams`. */
export const EXPERTISE_SLUGS = Object.keys(expertiseSubpagesContent);
