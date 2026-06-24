"use client";

import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { HeroIntro, type HeroSlide, HeroSlideshow } from "@/design-system";
import { useScrollLock } from "@/lib/a11y/useScrollLock";
import { navState } from "@/lib/motion/navigationState";
import { prefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

/**
 * HomeHero — client orchestrator for the home hero entrance (brief header-entry-animation).
 *
 * Decides whether to play the black site-entry intro (`HeroIntro`) over the presentational
 * `HeroSlideshow`, and hands off when it completes. Keeps `HeroSlideshow` purely
 * presentational (Principle VIII): the page (RSC) fetches and passes `label` + `slides`;
 * this client wrapper owns only the entrance behaviour.
 *
 * When the intro plays:
 *  - on a fresh home load only (`playedThisDocument` is module-scoped → not on SPA
 *    re-visits, matching « à chaque chargement »);
 *  - never under `prefers-reduced-motion` (the hero renders in its final static state);
 *  - never when the navigation was carried by the `PageTransition` curtain (it already
 *    writes the logomark — avoids a double logomark moment), see `navState.viaCurtain`.
 */

// One play per document load (survives SPA re-visits of "/" without replaying).
let playedThisDocument = false;

export function HomeHero({
	label,
	slides,
}: {
	label: string;
	slides: HeroSlide[];
}) {
	// "none" = no intro (reduced motion / curtain arrival / SPA re-visit) → normal hero.
	// "hold" = intro overlay up, hero visuals held hidden. "play" = intro done → the hero
	// title types in + the first image unfolds, then autoplay resumes.
	const [phase, setPhase] = useState<"none" | "hold" | "play">("none");
	const lenis = useLenis();
	// Lock scroll while the intro overlay is up: the hero must play from the top, and the
	// user shouldn't scroll the page behind the cover. Released when it hands off ("play").
	useScrollLock(phase === "hold");

	useEffect(() => {
		if (playedThisDocument) return;
		playedThisDocument = true;
		if (prefersReducedMotion()) return; // hero stays in its final static state
		if (navState.viaCurtain) return; // curtain already wrote the logomark
		// The intro is choreographed from the top (the FLIP targets are measured in viewport
		// space) — always start at scroll 0, regardless of the browser's restored position.
		window.scrollTo(0, 0);
		lenis?.scrollTo(0, { immediate: true });
		setPhase("hold");
	}, [lenis]);

	return (
		<>
			<HeroSlideshow label={label} slides={slides} entry={phase} />
			{phase === "hold" && (
				<HeroIntro label={label} onComplete={() => setPhase("play")} />
			)}
		</>
	);
}
