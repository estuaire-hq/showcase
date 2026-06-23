// Estuaire design tokens — the single source of numeric/string values for
// programmatic use (GSAP/JS). MIRRORS the @theme tokens in src/app/globals.css
// (the canonical source) — keep in sync, do not let it diverge. For styling,
// prefer the Tailwind utilities (bg-estuaire, font-display, text-title, …).
// Extracted from the Figma KIT (node 75:2963).

export const color = {
	estuaire: "#003787",
	ink: "#0e1215",
	slate: "#3b3e43",
	warm: "#98958f",
	cream: "#eee6dc",
	paper: "#ffffff",
	/** Disabled / empty affordance (e.g. carousel arrow "vide") */
	disabled: "#dddddd",
} as const;

export const font = {
	/** UPPERCASE glyphs + the few Montserrat (non-Alternates) titles (see BrandText) */
	sans: "var(--font-montserrat)",
	/** lowercase / display glyphs (see BrandText) */
	display: "var(--font-montserrat-alternates)",
} as const;

/**
 * Brand type scale (px at the 16px root) — mirrors the `--text-*` tokens.
 * The three display tiers carry 5% tracking ("espacement 5%" in the kit).
 * Font family is a separate axis — pair with font.display or font.sans.
 */
export const type = {
	display: { size: 100, lineHeight: 100, letterSpacing: 0.05 },
	title: { size: 75, lineHeight: 100, letterSpacing: 0.05 },
	subtitle: { size: 50, lineHeight: 65, letterSpacing: 0.05 },
	lead: { size: 35, lineHeight: 45, letterSpacing: 0 },
	body: { size: 24, lineHeight: 28, letterSpacing: 0 },
	caption: { size: 16, lineHeight: 24, letterSpacing: 0 },
} as const;

/** Pill CTAs are fully rounded (rounded-full); filters/inputs are square (rounded-none). */
export const radius = { pill: 9999, square: 0 } as const;
/** CTA pill height from the kit (Rectangle 348 = 61px tall). */
export const size = { ctaHeight: 61 } as const;

/**
 * Outline (contour) text — the signature title device. The kit specimen
 * documents the text-stroke width per display tier (fill: none, strokeAlign:
 * OUTSIDE in Figma; CSS `-webkit-text-stroke` is centred, a close approximation).
 * See the OutlineText component.
 */
export const outlineStroke = { display: 2, title: 2, subtitle: 1 } as const;

export const strokeWidth = { rule: 3, control: 1 } as const;

/**
 * Responsive breakpoints — the Figma design has 3 frames. Tailwind's default
 * `md` (768px) matches the tablet frame exactly; `lg` (1024px) is the desktop
 * cutover. CONVENTION across the DS:
 *   - base (no prefix) → MOBILE   (Figma 390px frame) — mobile-first
 *   - `md:`            → TABLET   (Figma 768px frame)
 *   - `lg:`            → DESKTOP  (Figma 1920px frame; layout applies ≥1024)
 * Author components mobile-first, then layer `md:` and `lg:`. The px values
 * below are for JS use (matchMedia in motion); CSS uses the Tailwind prefixes.
 */
export const breakpoint = { mobile: 390, tablet: 768, desktop: 1024 } as const;

/**
 * Motion tokens — MIRRORS the `--ease-*` vars in the `@theme` block of
 * globals.css (the canonical source). CSS reads those vars directly; GSAP/JS reads the
 * values here. Keep the two in sync. See the `estuaire-motion` skill for the grammar.
 *
 *  - `easeExpo` is the signature ease. In GSAP it is the registered `"expo.out"`; in CSS
 *    the equivalent is `--ease-expo` (`cubic-bezier(.16,1,.3,1)`) — treated as the same ease.
 */
export const motion = {
	easeExpo: "expo.out",
	/**
	 * Content scroll-reveal: each element marked `data-reveal-fade` fades in (opacity only,
	 * no transform — text stays the anchor) the first time it enters the viewport, then
	 * stays. Per element & independent (Pierre, 2026-06-23). Tune the fade length here.
	 */
	revealDuration: 0.9,
	/**
	 * Page transition "curtain" (PageTransition): a full-screen paper panel that rises from
	 * the bottom to cover, then drops back down to reveal the next page (Pierre, 2026-06-23).
	 * This is the duration of ONE leg (cover, then uncover) — total ≈ 2× this.
	 */
	curtainDuration: 0.8,
	/**
	 * Curtain loader intro delay (PageTransition): a mini beat after the cover starts
	 * before the logomark begins tracing, so the curtain establishes first and the trace
	 * reads as intentional (Pierre, 2026-06-23). One-time (the loop keeps `repeatDelay`).
	 */
	curtainLogoDelay: 0.15,
	/**
	 * Curtain loader hold (PageTransition): the MINIMUM time the logomark loader stays
	 * visible, measured from when the cover starts, so the mark writes itself in full
	 * once (intro delay 0.15s + trace 1.0s ⇒ complete at ~1.15s) before the curtain
	 * reveals the next page. On a slow route the reveal naturally waits for the route to
	 * commit instead, so this is a floor, not a fixed delay (Pierre, 2026-06-23).
	 */
	curtainLogoHold: 1.35,
	/**
	 * Overlapping image clusters: the FRONT (overlapping) image rises faster than the
	 * static back image on scroll (`data-parallax` amplitude, `rise` mode) → depth
	 * (Pierre, 2026-06-23). One value tunes all cluster fronts (expertises + nous-découvrir).
	 */
	clusterParallax: 30,
} as const;
