/**
 * Footer maquette content — the single home of the footer's design copy
 * (constitution Principle IX: maquette values live in ONE place).
 *
 * Lives in `src/content/` on purpose: it belongs to neither the Studio/model side
 * (`src/sanity/`) nor the runtime consumption side (`src/lib/sanity/`), so both
 * import it "downward" — no sideways dependency between the two trees. Consumed by:
 *   - the seed (`@/sanity/seed/documents/footer.seed.ts`) → written to Sanity;
 *   - the front fallback (`@/lib/sanity/footer.ts` DEFAULTS) → rendered if Sanity is empty.
 *
 * Images are intentionally NOT here: content images come only from Sanity (ADR
 * 0004) — the seed uploads them and the front has no image fallback. Links are the
 * front-facing `{ label, href }` shape; the seed adds the `_type` discriminator.
 */
export const footerContent = {
	ctaTitleOutline: "Une question,",
	ctaTitleFill: "un projet ?",
	ctaButtonLabel: "tout commence ici",
	ctaButtonHref: "/contact",
	tagline: "agenceur-concepteur engagé.",
	address:
		"2026 estuaire©\nZi la seiglerie 3, 2 rue Henri Giffard\n44270 machecoul",
	contactHref: "/contact",
	linkedInUrl: "https://www.linkedin.com",
	plaquetteLabel:
		"pour prolonger votre visite, téléchargez notre plaquette ici",
	navLinks: [
		{ label: "nous découvrir", href: "/nous-decouvrir" },
		{ label: "expertises", href: "/expertises" },
		{ label: "univers", href: "/univers" },
		{ label: "réalisations", href: "/realisations" },
	],
	legalLinks: [
		{ label: "Conditions générales d'utilisation", href: "/cgu" },
		{ label: "Mentions légales", href: "/mentions-legales" },
		{ label: "Politique de confidentialité", href: "/confidentialite" },
		{ label: "Politique en matière de cookies", href: "/cookies" },
	],
};
