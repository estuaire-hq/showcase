"use client";

import { useEffect, useRef, useState } from "react";
import type { NavState } from "@/design-system/nav";
import { ScrollTrigger } from "@/lib/motion/gsap";

/** Re-export of the DS-owned state vocabulary (single source of truth — no drift). */
export type NavbarVisualState = NavState;

// Anti-flicker thresholds (data-model §5). `top` zone avoids flicker at the very top;
// the directional delta requires a minimum sustained movement before toggling
// hidden↔pinned, so micro-scroll / trackpad jitter doesn't oscillate the bar.
const TOP_THRESHOLD = 8;
const DIRECTION_DELTA = 8;

/**
 * Sticky navbar state machine (research §2): transparent at the very top, hidden when
 * scrolling down, pinned (solid) when scrolling up. Direction is accumulated so a
 * reversal must exceed `DIRECTION_DELTA` before the state flips — no jitter on
 * micro-scroll (edge case "seuil de scroll").
 *
 * Driven by `ScrollTrigger` (already synced to Lenis) normally; under reduced motion
 * (Lenis/ticker inactive) it falls back to a passive native `scroll` listener so the
 * show/hide still works — instantly, since the transitions are disabled there.
 *
 * `reducedMotion` is passed in (resolved once in the wrapper) rather than re-subscribed
 * here, so the media query has a single subscription across the navbar.
 */
export function useStickyNav(reducedMotion: boolean): NavbarVisualState {
	const [state, setState] = useState<NavbarVisualState>("top");
	const lastY = useRef(0);
	const acc = useRef(0);

	useEffect(() => {
		const update = (y: number) => {
			if (y <= TOP_THRESHOLD) {
				acc.current = 0;
				lastY.current = y;
				setState("top");
				return;
			}
			const dy = y - lastY.current;
			lastY.current = y;
			if (dy === 0) return;
			// Accumulate movement in the current direction; reset when it reverses.
			acc.current =
				Math.sign(acc.current) === Math.sign(dy) ? acc.current + dy : dy;
			if (acc.current > DIRECTION_DELTA) setState("hidden");
			else if (acc.current < -DIRECTION_DELTA) setState("pinned");
		};

		if (reducedMotion) {
			const onScroll = () => update(window.scrollY);
			lastY.current = window.scrollY;
			update(window.scrollY);
			window.addEventListener("scroll", onScroll, { passive: true });
			return () => window.removeEventListener("scroll", onScroll);
		}

		const trigger = ScrollTrigger.create({
			onUpdate: (self) => update(self.scroll()),
		});
		update(trigger.scroll());
		return () => trigger.kill();
	}, [reducedMotion]);

	return state;
}
