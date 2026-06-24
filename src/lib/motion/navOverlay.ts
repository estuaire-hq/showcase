"use client";

import { useSyncExternalStore } from "react";

/**
 * Cross-component "nav overlay" signal: a full-bleed dark section (the case-study
 * bands) asks the sticky navbar to drop its solid background and switch to the
 * `onDark` tone, so the bar floats transparently and the whole image shows through
 * (otherwise the sticky bar paints a white band over the top of the photo).
 *
 * Kept as a leaf module-level store (no React Context threading): the producer lives
 * deep in the page (`CaseStudies`) while the consumer is the `Navbar` in the layout —
 * siblings whose only shared truth is one boolean. This matches the motion
 * architecture (independent ScrollTrigger subscribers), without coupling the DOM.
 */

let overlay = false;
const listeners = new Set<() => void>();

/** Producer side — call from a section's ScrollTrigger lifecycle. Idempotent. */
export function setNavOverlay(active: boolean): void {
	if (overlay === active) return;
	overlay = active;
	for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot(): boolean {
	return overlay;
}

/** Consumer side — the navbar subscribes. SSR snapshot is `false` (no hydration drift). */
export function useNavOverlay(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
