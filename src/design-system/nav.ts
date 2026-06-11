// Shared navigation vocabulary for the nav design-system components (SiteHeader,
// MenuToggle, NavPanel) and the sticky hook. Kept in its own leaf module (no imports)
// so both the DS components and `@/lib/motion/useStickyNav` can reference one source of
// truth without a circular import — `SiteHeader` renders `MenuToggle`, so a runtime
// value (the tone→class map) could not live in `SiteHeader` and be imported back.

/** Contrast axis for the "ghost" slots (logo, links, toggle) over the transparent header. */
export type NavTone = "onLight" | "onDark";

/** Visual state machine of the sticky bar (data-model §2). */
export type NavState = "top" | "hidden" | "pinned";

/** Tone → text colour for the ghost slots; the icons/logo paint in `currentColor`. */
export const TONE_TEXT_CLASS: Record<NavTone, string> = {
	onLight: "text-ink",
	onDark: "text-paper",
};
