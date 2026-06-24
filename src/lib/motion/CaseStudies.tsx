"use client";

import Link from "next/link";
import { useRef } from "react";
import {
	Button,
	CaseStudyPanel,
	type CaseStudyPanelData,
} from "@/design-system";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { setNavOverlay } from "@/lib/motion/navOverlay";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

// Subtle background drift while a band crosses the viewport (yPercent, kept within the
// band image's 8% overflow margin so an edge is never exposed). Scrubbed → ease "none".
const PARALLAX = 6;

/**
 * Réalisations as a vertical stack of full-bleed case-study BANDS (maquette « CAS
 * STUDY »), laid out in NORMAL FLOW — no pin, no scroll-jacking, the scroll stays 100%
 * native. Each band, on entry, reveals its content once (title rises & fades → the 3px
 * rule traces in → the meta items stagger) while its background image drifts in a light
 * scrubbed parallax tied to the real scroll. A single "voir nos réalisations" pill sits
 * below all bands (the maquette CTA — not one per band). While the dark bands sit under
 * the sticky navbar, the bar is asked to go onDark/transparent via `setNavOverlay`, so
 * no white band paints over the photos.
 *
 * `prefers-reduced-motion`: no parallax, no reveal — bands are shown statically and are
 * fully readable. The nav-overlay tone signal still runs (it is a colour switch, not a
 * motion), and it always releases (on scroll-out and on unmount).
 */
export function CaseStudies({
	cards,
	cta,
}: {
	cards: (CaseStudyPanelData & { href: string })[];
	cta: { label: string; href: string };
}) {
	const ref = useRef<HTMLDivElement>(null);
	const bandsRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const root = ref.current;
			const bands = bandsRef.current;
			if (!root || !bands) return;

			// Dark navbar while the bands block is behind the sticky bar. Driven by scroll
			// position (no pin), so it can never get stuck; runs regardless of reduced
			// motion (it is a tone toggle, not an animation).
			const navTrigger = ScrollTrigger.create({
				trigger: bands,
				start: "top top",
				end: "bottom top",
				onToggle: (self) => setNavOverlay(self.isActive),
			});

			// Release the overlay if we unmount mid-section (e.g. client-side nav away):
			// ScrollTrigger.kill() does not fire onToggle(false).
			const cleanup = () => {
				navTrigger.kill();
				setNavOverlay(false);
			};

			if (prefersReducedMotion()) return cleanup;

			const panels = gsap.utils.toArray<HTMLElement>("[data-cs-layer]", root);
			for (const panel of panels) {
				const q = gsap.utils.selector(panel);

				// Background parallax — drifts the whole time the band crosses the viewport.
				gsap.fromTo(
					q("[data-cs-image]"),
					{ yPercent: PARALLAX },
					{
						yPercent: -PARALLAX,
						ease: "none",
						scrollTrigger: {
							trigger: panel,
							start: "top bottom",
							end: "bottom top",
							scrub: true,
							invalidateOnRefresh: true,
						},
					},
				);

				// Content reveal on entry (once): the title rises & fades in, the rule
				// traces from the right, the meta items stagger in — then everything is
				// static (text is the anchor). Each target is guarded — a réalisation may
				// carry no meta (no lieu/année/superficie), and GSAP would warn on an empty
				// selector.
				const tl = gsap.timeline({
					defaults: { ease: "expo.out" },
					scrollTrigger: { trigger: panel, start: "top 80%", once: true },
				});
				tl.from(q("[data-cs-title]"), {
					autoAlpha: 0,
					yPercent: 40,
					duration: 1.1,
				}).from(q("[data-cs-rule]"), { scaleX: 0, duration: 0.9 }, 0.15);
				if (q("[data-cs-detail]").length) {
					tl.from(
						q("[data-cs-detail]"),
						{ autoAlpha: 0, y: 14, stagger: 0.1, duration: 0.7 },
						0.3,
					);
				}
			}

			ScrollTrigger.refresh();

			return cleanup;
		},
		{ scope: ref },
	);

	return (
		<div ref={ref}>
			<div
				ref={bandsRef}
				className="mx-auto flex max-w-[1920px] flex-col gap-[5px]"
			>
				{cards.map((card, i) => (
					<Link
						key={card.title}
						href={card.href}
						aria-label={`Voir la réalisation : ${card.title}`}
						data-cs-layer
						data-umami-event="home_realisation_click"
						data-umami-event-card={String(i)}
						className="block"
					>
						<CaseStudyPanel
							image={card.image}
							title={card.title}
							meta={card.meta}
						/>
					</Link>
				))}
			</div>

			{/* The maquette's single shared CTA, centred below the bands. */}
			<div className="mt-12 flex justify-center lg:mt-16">
				<Button
					tone="dark"
					href={cta.href}
					data-umami-event="home_cta_click"
					data-umami-event-section="realisations"
				>
					{cta.label}
				</Button>
			</div>
		</div>
	);
}
