/**
 * Home page maquette content — the single home of the home page's editorial copy
 * (constitution Principle IX: maquette values live in ONE place). Read losslessly
 * from the Figma home nodes (51:2221 desktop / 77:3149 tablet / 77:3150 mobile,
 * slider 51:2420) — never guessed.
 *
 * Lives in `src/content/` like `footer.ts`: it belongs to neither the Studio/model
 * side (`src/sanity/`) nor the runtime consumption side (`src/lib/sanity/`), so both
 * import it "downward". Consumed by:
 *   - the seed (`@/sanity/seed/documents/homePage.seed.ts`) → written to Sanity;
 *   - the front fallback (`@/lib/sanity/homePage.ts` DEFAULTS) → rendered if Sanity
 *     is empty (text only — SC-006).
 *
 * Images are intentionally NOT here (text only): content images come from the seed
 * (seed-assets/homePage/, uploaded to Sanity), exactly like the footer (ADR 0004).
 * Hero slides therefore carry their titles here and their image in the seed.
 *
 * `\n` is meaningful in titles/text (line breaks of the maquette) — the front renders
 * them with `whitespace-pre-line`. Section titles use the brand outline/fill device.
 */
export const homePageContent = {
	// — Hero (slider 51:2420 + home 51:2221) —
	// Title = fixed trunk « Estuaire, / là où les » + a per-slide keyword that changes
	// (text odometer) in sync with the cross-fading image. The full-screen intro reuses
	// these keywords; its last phrase = the first slide's keyword (continuity).
	heroLabel: "Estuaire,",
	heroTrunk: "là où les",
	heroSlides: [
		{ keyword: "idées prennent forme" },
		{ keyword: "savoir-faire s'assemblent" },
		{ keyword: "talents se rencontrent" },
		{ keyword: "matériaux se transforment" },
	],

	// — Intro « Nous sommes agenceur concepteur engagé. » —
	introTitleOutline: "Nous sommes",
	introTitleFill: "agenceur\nconcepteur\nengagé.",
	introText:
		"Nous nous investissons, à chaque étape, aux côtés des designers et architectes pour transformer leurs ambitions créatives en réalisations concrètes et fidèles à leur vision.\n\nJusqu'à l'installation et au déploiement, notre engagement est constant, car pour nous, la réussite d'un agencement repose autant sur la justesse de sa conception que sur la rigueur de son exécution.",

	// — Nos expertises —
	expertisesTitleOutline: "Nos",
	expertisesTitleFill: "expertises",
	expertisesText:
		"Une même exigence de l'agencement d'espaces à la réalisation de présentoirs.",
	expertisesCtaLabel: "en savoir plus",
	expertisesCtaHref: "/expertises",

	// — Nos univers / secteurs (liens actifs → /univers/[secteur]) —
	universSectors: [
		{ label: "retail", href: "/univers/retail" },
		{ label: "bureaux", href: "/univers/bureaux" },
		{ label: "scénographie", href: "/univers/scenographie" },
		{ label: "résidentiel", href: "/univers/residentiel" },
	],

	// — Nos réalisations par secteur (cards + 12-sector list are STATIC, see
	//   homeRealisations.ts; only the section chrome is editable) —
	realisationsTitleOutline: "Nos réalisations",
	realisationsTitleFill: "par secteur",
	realisationsCtaLabel: "voir nos réalisations",
	realisationsCtaHref: "/realisations",

	// — Découvrez notre vision —
	visionTitleOutline: "Découvrez",
	visionTitleFill: "notre vision",
	visionText:
		"Chez Estuaire, nous sommes le fruit de mondes qui se rencontrent et s'enrichissent. Nourri par l'ingéniosité de nos concepteurs, la créativité de nos clients ainsi que par le savoir-faire de nos partenaires, chaque projet devient une synergie fertile.\n\nEstuaire est un lieu de confluence où naissent des espaces singuliers.",
	visionCtaLabel: "en savoir plus",
	visionCtaHref: "/nous-decouvrir",

	// — SEO (defaults; editable in Studio) —
	seoMetaTitle: "Estuaire — agenceur-concepteur engagé",
	seoMetaDescription:
		"Estuaire, agenceur-concepteur engagé : de l'agencement d'espaces à la réalisation de présentoirs, nous transformons les ambitions des designers et architectes en réalisations concrètes.",
};
