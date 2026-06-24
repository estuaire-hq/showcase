/**
 * Navigation maquette content — the single home of the navbar's content for this
 * version (FR-015). Pure module: no Sanity, no `"use client"`, no side effects.
 *
 * Lives in `src/content/` alongside `footer.ts` on purpose: it belongs to neither
 * the Studio/model side nor the runtime Sanity side, so consumers import it
 * "downward". The shape is intentionally Sanity-migration-friendly — a future
 * `getNavProps(): NavConfig` (à la `getFooterProps`) would return the same shape,
 * leaving the call sites and behaviour unchanged (plan §Complexity Tracking).
 *
 * Order note: the array order IS the display order, identical on desktop and in the
 * mobile panel (contract `navigation-config.md`). The Figma opened-panel frames
 * (77:3630 / 87:5893) happen to swap Univers/Expertises — treated as a maquette
 * inconsistency, NOT followed here (kept consistent with `footer.ts` desktop order;
 * flagged for Pierre). Slugs follow the labels (FR-014: target pages out of scope).
 */
export type NavItem = {
	/** Displayed label (FR copy, lowercase — the pills render lowercase). Non-empty. */
	label: string;
	/** Internal route. Absolute path starting with "/". May not exist yet (FR-014). */
	href: string;
	/**
	 * Optional sub-navigation (dropdown on desktop, indented links in the mobile panel).
	 * Added for the client request to surface expertises / univers sub-pages directly from
	 * the navbar (revue 2026-06, B2/B3). The parent stays a link to its hub page; the
	 * children deep-link the sub-pages.
	 */
	children?: NavItem[];
};

export type NavCta = {
	/** Defaults to "contact". */
	label: string;
	/** Internal route, e.g. "/contact". */
	href: string;
};

export type NavConfig = {
	/** Exactly 4 entries, desktop order (FR-002). */
	items: NavItem[];
	/** The highlighted "contact" CTA. */
	cta: NavCta;
	/** Brand/logo target — "/" (FR-003). */
	brandHref: string;
};

export const navigation: NavConfig = {
	items: [
		{ label: "nous découvrir", href: "/nous-decouvrir" },
		{
			label: "expertises",
			href: "/expertises",
			children: [
				{ label: "agencement", href: "/expertises/agencement-sur-mesure" },
				{ label: "mobilier", href: "/expertises/mobiliers-sur-mesure" },
				{ label: "présentoirs", href: "/expertises/presentoirs-sur-mesure" },
			],
		},
		{
			label: "univers",
			href: "/univers",
			// Slugs are the canonical sector slugs (singular « bureau » — see post-mortem 0018).
			children: [
				{ label: "retail", href: "/univers/retail" },
				{ label: "bureaux", href: "/univers/bureau" },
				{ label: "scénographie", href: "/univers/scenographie" },
				{ label: "résidentiel", href: "/univers/residentiel" },
			],
		},
		{ label: "réalisations", href: "/realisations" },
	],
	cta: { label: "contact", href: "/contact" },
	brandHref: "/",
};
