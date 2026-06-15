"use client";

import { useEffect, useState } from "react";
import { type HeroSlide, HeroSlideshow, IntroScreen } from "@/design-system";
import { prefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";

/**
 * Home hero orchestrator (route-local client glue — not a Sanity-connected wrapper, so
 * it lives here, not in `src/components/`). The page (RSC) fetches and passes the props;
 * this component wires the full-screen intro to the real hero:
 *
 *  - renders the hero underneath from the first paint (SSR → LCP image, SEO);
 *  - overlays `IntroScreen`, which hands off onto the hero (`[data-hero-title]`) then
 *    calls `onDone` → the intro unmounts and the slideshow starts (`paused` → false);
 *  - the hero starts on the LAST keyword the intro shows (continuity — invisible swap);
 *  - locks page scroll while the intro is up (a scroll gesture skips it via IntroScreen);
 *  - reduced motion → no intro (CSS hides the overlay; we finish it immediately).
 *
 * Intro plays on every load (no persistence — product decision).
 */
export function HomeHero({
	label,
	trunk,
	slides,
}: {
	label: string;
	trunk: string;
	slides: HeroSlide[];
}) {
	// Starts shown so the SSR HTML already covers the hero (no flash); reduced-motion
	// users have it hidden by CSS and we finish it on mount.
	const [introActive, setIntroActive] = useState(true);

	const keywords = slides.map((s) => s.keyword).filter(Boolean);
	// Hero's first slide = the intro's last phrase → seamless hand-off.
	const startIndex = Math.max(0, keywords.length - 1);

	useEffect(() => {
		if (prefersReducedMotion()) setIntroActive(false);
	}, []);

	useEffect(() => {
		if (!introActive) return;
		const root = document.documentElement;
		const prev = root.style.overflow;
		root.style.overflow = "hidden";
		return () => {
			root.style.overflow = prev;
		};
	}, [introActive]);

	return (
		<>
			<HeroSlideshow
				label={label}
				trunk={trunk}
				slides={slides}
				paused={introActive}
				startIndex={startIndex}
			/>
			{introActive && keywords.length > 0 ? (
				<IntroScreen
					label={label}
					trunk={trunk}
					keywords={keywords}
					onDone={() => setIntroActive(false)}
				/>
			) : null}
		</>
	);
}
