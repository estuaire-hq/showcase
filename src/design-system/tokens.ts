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
	/** Form validation error affordance (not a brand identity colour) */
	danger: "#b42318",
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
