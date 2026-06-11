"use client";

import { useEffect, useState } from "react";

/**
 * Subscribe to `(prefers-reduced-motion: reduce)`. Returns `true` when the user
 * asked for reduced motion. Mirrors the SmoothScroll detection so the navbar
 * (sticky show/hide, panel open/close) can switch to instant state changes
 * (FR-012, SC-005). Starts `false` so SSR and the first client paint agree (no
 * hydration mismatch); the effect corrects it on mount.
 */
export function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(mq.matches);
		const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	return reduced;
}
