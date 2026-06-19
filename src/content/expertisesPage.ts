/**
 * Expertises page maquette content — the single home of the « Expertises » editorial copy
 * (constitution Principle IX: maquette values live in ONE place). Read losslessly from the
 * Figma expertises nodes (51:2893 desktop / 87:5600 tablet / 87:6290 mobile) — never guessed.
 *
 * Lives in `src/content/` like `homePage.ts`/`aboutPage.ts`/`footer.ts`: it belongs to
 * neither the Studio/model side (`src/sanity/`) nor the runtime consumption side
 * (`src/lib/sanity/`), so both import it "downward". Consumed by:
 *   - the seed (`@/sanity/seed/documents/expertisesPage.seed.ts`) → written to Sanity;
 *   - the front fallback (`@/lib/sanity/expertisesPage.ts` DEFAULTS) → rendered if Sanity
 *     is empty (text only — SC-006).
 *
 * Images are intentionally NOT here (text only): content images come from the seed
 * (seed-assets/expertisesPage/, uploaded to Sanity), exactly like the home/about (ADR 0004).
 *
 * `\n` is meaningful only where the maquette uses a deliberate break: title lines
 * (outline/fill device, card titles) and paragraph breaks (`\n\n`) in body copy — rendered
 * with `whitespace-pre-line`. Section/hero titles use the brand outline/fill device.
 */
export const expertisesPageContent = {
	// — Hero (012/ SLIDER) —
	heroEyebrow: "Design d'espace, agencement et présentoirs",
	heroTitleOutline: "Notre expertise :",
	heroTitleFill: "réaliser vos projets de toutes\nformes et de toutes tailles.",

	// — Intro (02/ INTRO) —
	introStatement:
		"À la frontière entre artisanat et industrie, entre design et fabrication.",
	introText:
		"Notre bureau d'études soutenu par notre atelier, conçoit et réalise des ouvrages et objets multimatériaux variés avec maitrise et ingéniosité.\n\nQu'il s'agisse d'espaces commerciaux, de bureaux, d'hôtels particuliers ou d'installations éphémères, nous réalisons tous types de projets.",

	// — Niveaux (03/ NOS NIVEAUX D'EXPERTISE) —
	levelsTitleOutline: "Nos 3 niveaux",
	levelsTitleFill: "d'expertise",
	levels: [
		{
			title: "Notre vision\ndu métier d'agenceur",
			ctaLabel: "en savoir plus",
			ctaHref: "/expertises/agencement-sur-mesure",
		},
		{
			title: "Notre savoir-faire\nappliqué aux mobiliers",
			ctaLabel: "en savoir plus",
			ctaHref: "/expertises/mobiliers-sur-mesure",
		},
		{
			title: "Notre exigence\nau service des présentoirs",
			ctaLabel: "en savoir plus",
			ctaHref: "/expertises/presentoirs-sur-mesure",
		},
	],

	// — Grand visuel (05/ BIG IMAGE) —
	statementText:
		"Nous concevons chaque projet avec la précision du sur-mesure et la puissance de l'industrie.",

	// — SEO (defaults; editable in Studio) —
	seoMetaTitle: "Expertises",
	seoMetaDescription:
		"Agenceur-concepteur, Estuaire réalise vos projets de toutes formes et de toutes tailles : agencement sur mesure, mobiliers uniques ou en série, et présentoirs. Découvrez nos trois niveaux d'expertise, à la frontière entre artisanat et industrie.",
};
