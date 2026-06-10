"use client";

import { type LenisRef, ReactLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

/**
 * App-wide smooth-scroll provider: Lenis driven by the GSAP ticker, synced with
 * ScrollTrigger. Honors prefers-reduced-motion by falling back to native scroll
 * (no Lenis, no rAF hijack) — a deliberate accessibility choice.
 *
 * Promoted out of the lab: wrap the public site (`(site)/layout.tsx`) and the lab
 * (`(lab)/layout.tsx`) with it. The Studio (`/studio`) is intentionally NOT wrapped
 * — it has its own scroll/UX and must keep native behaviour.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
	const lenisRef = useRef<LenisRef>(null);
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(mq.matches);
		const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		if (reduced) return;

		// Drive Lenis from the GSAP ticker. The callback reads the ref live each
		// frame, so it works regardless of when ReactLenis populates it — adding
		// the ticker unconditionally is what prevents the "wheel captured but no
		// scroll" freeze.
		const update = (time: number) => {
			lenisRef.current?.lenis?.raf(time * 1000);
		};
		gsap.ticker.add(update);
		gsap.ticker.lagSmoothing(0);

		// Keep ScrollTrigger synced when Lenis is available (native scroll events
		// cover the rest, so a missed attach never freezes the page).
		const lenis = lenisRef.current?.lenis;
		lenis?.on("scroll", ScrollTrigger.update);

		return () => {
			gsap.ticker.remove(update);
			lenis?.off("scroll", ScrollTrigger.update);
		};
	}, [reduced]);

	if (reduced) return <>{children}</>;

	return (
		<ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
			{children}
		</ReactLenis>
	);
}
