/**
 * Sectors page (« Univers ») maquette content — the single home of the editorial copy
 * (constitution Principle IX: maquette values live in ONE place). Read losslessly from
 * the Figma node `51:3386` (desktop only — no tablet/mobile frame) — never guessed.
 *
 * Lives in `src/content/` like `homePage.ts`/`aboutPage.ts`/`footer.ts`: it belongs to
 * neither the Studio/model side (`src/sanity/`) nor the runtime consumption side
 * (`src/lib/sanity/`), so both import it "downward". Consumed by:
 *   - the seed (`@/sanity/seed/documents/sectorsPage.seed.ts`) → written to Sanity;
 *   - the front fallback (`@/lib/sanity/sectorsPage.ts` DEFAULTS) → rendered if Sanity
 *     is empty (text only — SC-006).
 *
 * Images are intentionally NOT here (text only): content images come from the seed
 * (seed-assets/sectorsPage/, uploaded to Sanity), exactly like the home/about (ADR 0004).
 *
 * `\n` is meaningful only where the maquette uses a deliberate break: title lines
 * (outline/fill device) and paragraph breaks (`\n\n`) in body copy — rendered with
 * `whitespace-pre-line`. Soft wraps inside a Figma text box are NOT preserved.
 */
export const sectorsPageContent = {
	// — Hero (02/ SLIDER) —
	heroEyebrow: "Agencement sur mesure\ndu retail à vos bureaux",
	heroTitleOutline: "Architectes\net designers,",
	heroTitleFill: "nous concrétisons\nvos projets\navec soin.",

	// — Intro (03/ INTRO) —
	introStatement:
		"Grâce à notre périmètre d'intervention multisectoriel, nous faisons preuve d'agilité et savons appréhender des univers variés.",
	// L'« introStatement » ci-dessus sert déjà de phrase phare (titre) ; le paragraphe ne la
	// répète plus (revue client 2026-06 : « supprimer la phrase en double »).
	introText:
		"Chaque projet est unique et présente des enjeux spécifiques.\n\nDu retail aux espaces de travail, de la scénographie aux projets résidentiels, nous adaptons nos méthodes avec le même engagement.",

	// — Secteurs (04/ SECTEURS) — ordered list; array order = display order —
	sectors: [
		{
			label: "Retail",
			promise:
				"Nous anticipons les cahiers des charges et nous adaptons aux contraintes opérationnelles de chaque point de vente.",
			href: "/univers/retail",
		},
		{
			label: "Bureau",
			promise:
				"Nous mettons en place des solutions innovantes visant à faciliter la collaboration au travail.",
			href: "/univers/bureau",
		},
		{
			label: "Résidentiel",
			promise:
				"Nous accompagnons chaque particulier avec une attention particulière pour répondre au mieux à leurs envies.",
			href: "/univers/residentiel",
		},
		{
			label: "Scénographie",
			promise:
				"Nous trouvons des solutions de montage et démontage efficientes et assurons le stockage d'une année à l'autre.",
			href: "/univers/scenographie",
		},
	],

	// — Infos clés (05/ INFOS CLÉS) — 2×2 grid; array order = TL, TR, BL, BR —
	keyFigures: [
		{
			value: "15 ans d'expérience",
			support: "Une excellence acquise à l'occasion de projets exigeants.",
		},
		{
			value: "+150 projets par an",
			support: "Une organisation capable de garantir qualité et réactivité.",
		},
		{
			value: "Partenaires locaux",
			support: "Un réseau de partenaires fiables à moins de 100 km.",
		},
		{
			value: "Atelier multimatériaux",
			support:
				"Une maîtrise technique complète, du prototype à la réalisation finale.",
		},
	],

	// — SEO (defaults; editable in Studio) —
	seoMetaTitle: "Univers",
	seoMetaDescription:
		"Du retail aux bureaux, du résidentiel à la scénographie : découvrez les univers dans lesquels Estuaire intervient. Un périmètre d'intervention multisectoriel, 15 ans d'expérience et plus de 150 projets par an.",
};
