"use client";

import { useRef } from "react";
import { CaseStudyPanel, type CaseStudyPanelData } from "@/design-system";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { setNavOverlay } from "@/lib/motion/navOverlay";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

// Per-panel choreography, in timeline units (mapped to scroll by scrub). Each panel:
// reveals its content, HOLDS fully on screen (you see only it), then hands off — the
// outgoing panel slides up while the incoming settles in from behind (BOTH move).
const REVEAL = 0.6; // content reveal duration
const HOLD = 0.9; // fully-on-screen linger (alone) before the handoff begins
const HANDOFF = 0.8; // outgoing slides up + incoming settles (both moving)
const SEG = REVEAL + HOLD + HANDOFF;
// Scroll length per timeline unit (viewport fraction). Tune for pacing.
const UNIT_VH = 0.58;

/**
 * Réalisations as a stack of full-viewport case studies with a footer-reveal-style
 * hand-off. The container is pinned; the panels are stacked (absolute) with decreasing
 * z. A master scrubbed timeline drives, per panel: content reveal → a HOLD where only
 * that panel is on screen → a hand-off where the current panel slides up AND the next
 * settles in from behind (both in motion, like the footer reveal). The background image
 * never stops drifting while a panel is on screen. The last panel hands off the same
 * way to whatever follows (the pin releases as it slides away).
 *
 * Nothing on first paint (scroll-driven). `prefers-reduced-motion`: no pin/stack — the
 * panels stay as plain full-height sections in normal flow, fully readable (FR-016).
 */
export function PinnedCaseStudies({
	cards,
	cta,
}: {
	cards: CaseStudyPanelData[];
	cta: { label: string; href: string };
}) {
	const ref = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const root = ref.current;
			if (!root) return;
			if (prefersReducedMotion()) return;

			const panels = gsap.utils.toArray<HTMLElement>("[data-cs-layer]", root);
			if (!panels.length) return;
			const n = panels.length;
			const lastIdx = n - 1;
			// The last panel has no hand-off — it holds, then the pin releases and the next
			// section scrolls in. Ending the pin exactly on its hold avoids a white gap.
			const total = lastIdx * SEG + (REVEAL + HOLD);

			// Stack the panels (absolute) over a single-viewport pinned container.
			gsap.set(root, { height: "100svh" });
			gsap.set(panels, { position: "absolute", inset: 0 });
			// Incoming panels start slightly zoomed (NOT offset in y — a y offset would
			// expose a black band above the panel during the hand-off). They settle to
			// scale 1, so both panels still move during the transition.
			gsap.set(panels.slice(1), { scale: 1.06 });

			const tl = gsap.timeline({
				defaults: { ease: "power2.out" },
				scrollTrigger: {
					trigger: root,
					start: "top top",
					end: () => `+=${Math.round(window.innerHeight * total * UNIT_VH)}`,
					pin: true,
					// Lagged scrub (0.7s catch-up) instead of a hard 1:1 — smooths the pinned
					// hand-off so fast wheel/trackpad flicks don't snap between panels.
					scrub: 0.7,
					invalidateOnRefresh: true,
					// While a case-study panel fills the viewport, ask the navbar to drop its
					// solid background (onDark, transparent) so the whole dark photo shows
					// through when the bar reappears on scroll-up — instead of a white band.
					onToggle: (self) => setNavOverlay(self.isActive),
				},
			});

			panels.forEach((panel, i) => {
				const q = gsap.utils.selector(panel);
				const base = i * SEG;
				const isLast = i === lastIdx;
				const segLen = isLast ? REVEAL + HOLD : SEG;

				// Background never stops — drifts across the whole segment the panel is up.
				// Amplitude stays within the image's overflow margin (scale-125) so an edge
				// is never exposed (no black band).
				tl.fromTo(
					q("[data-cs-image]"),
					{ yPercent: -7 },
					{ yPercent: 7, ease: "none", duration: segLen },
					base,
				);

				// Content reveal (after the panel has settled — never at "bottom 0").
				tl.from(
					q("[data-cs-title]"),
					{ autoAlpha: 0, yPercent: 45 },
					base + 0.1,
				)
					.from(q("[data-cs-rule]"), { scaleX: 0 }, base + 0.28)
					.from(
						q("[data-cs-detail]"),
						{ autoAlpha: 0, y: 16, stagger: 0.1 },
						base + 0.4,
					)
					.from(q("[data-cs-cta]"), { autoAlpha: 0, y: 12 }, base + REVEAL);

				// Hand-off (all but the last): this panel slides up AND the next settles in —
				// both moving. The last panel stays put; the pin then releases to the next
				// section, so there is no white gap after it.
				if (!isLast) {
					const handoff = base + REVEAL + HOLD;
					tl.to(
						panel,
						{ yPercent: -100, ease: "power1.in", duration: HANDOFF },
						handoff,
					).to(
						panels[i + 1],
						{ scale: 1, ease: "power1.out", duration: HANDOFF },
						handoff,
					);
				}
			});

			ScrollTrigger.refresh();

			// Release the navbar overlay if we unmount mid-section (e.g. client-side nav
			// away while pinned) — ScrollTrigger.kill() does not fire onToggle(false).
			return () => setNavOverlay(false);
		},
		{ scope: ref },
	);

	return (
		<div ref={ref} className="relative">
			{cards.map((card, i) => (
				<div
					key={card.title}
					data-cs-layer
					data-umami-event="home_realisation_click"
					data-umami-event-card={String(i)}
					className="relative h-svh"
					style={{ zIndex: cards.length - i }}
				>
					<CaseStudyPanel
						image={card.image}
						title={card.title}
						meta={card.meta}
						cta={cta}
					/>
				</div>
			))}
		</div>
	);
}
