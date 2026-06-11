"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";

/**
 * Lock background scroll while `locked` is true (mobile panel open). Lenis "hijacks"
 * the wheel, so `overflow: hidden` alone is not enough — we `lenis.stop()` and add
 * `overflow: hidden` as a belt-and-braces fallback (and the only mechanism under
 * reduced motion, where there is no Lenis). On unlock, `lenis.start()` and restore.
 *
 * Reuses lenis/react's official `useLenis()` (the SmoothScroll provider wraps the
 * app) instead of a bespoke context — returns `undefined` under reduced motion /
 * native scroll, so the calls are safely optional. The scrollbar is already hidden
 * site-wide (globals.css), so no width compensation is needed (research §3).
 *
 * Single consumer (the navbar): it captures and restores the prior `overflow` directly.
 * If a second consumer ever locks concurrently, add a lock-depth counter so the second
 * doesn't restore to a stale `"hidden"`. Not added now (YAGNI — Principle IV).
 */
export function useScrollLock(locked: boolean) {
	const lenis = useLenis();

	useEffect(() => {
		if (!locked) return;
		const docEl = document.documentElement;
		const previousOverflow = docEl.style.overflow;

		lenis?.stop();
		docEl.style.overflow = "hidden";

		return () => {
			lenis?.start();
			docEl.style.overflow = previousOverflow;
		};
	}, [locked, lenis]);
}
