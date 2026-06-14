"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Scroll-driven motion wrapper (estuaire-motion, ocitocine-style). NOTHING fires on
 * first paint — every effect is tied to scroll position. Applies to its subtree, on
 * IMAGES / PANELS only (never text):
 *
 *   - `[data-parallax="<amp>"]` — scrubbed parallax (yPercent). `data-parallax-mode`:
 *       · `drift` (default) : amp → -amp over the element's full pass (top bottom →
 *         bottom top). Different amps on siblings = depth.
 *       · `settle`          : -amp → 0 over top bottom → center center, then HOLDS at
 *         rest (e.g. the expertises image descends slowly and settles into its bleed).
 *       · `rise`            : amp*0.25 → -amp (asymmetric — barely descends, rises a lot;
 *         e.g. the intro primary image).
 *   - `[data-reveal-clip]` — a panel clip-reveal on enter (once), bottom→up.
 *
 * Honors `prefers-reduced-motion`: no transforms, everything shown at its rest state.
 */
export function Parallax({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const root = ref.current;
			if (!root) return;
			if (prefersReducedMotion()) return;

			for (const node of root.querySelectorAll<HTMLElement>(
				"[data-parallax]",
			)) {
				const amp = Number.parseFloat(node.dataset.parallax || "0");
				if (!amp) continue;
				const mode = node.dataset.parallaxMode;
				// from -> to (yPercent) per mode: settle (above -> rest at center, holds),
				// rise (asymmetric: barely descends, rises a lot), drift (symmetric, default).
				let from = amp;
				let to = -amp;
				let end = "bottom top";
				if (mode === "settle") {
					from = -amp;
					to = 0;
					end = "center center";
				} else if (mode === "rise") {
					from = amp * 0.25;
					to = -amp;
				}
				gsap.fromTo(
					node,
					{ yPercent: from },
					{
						yPercent: to,
						ease: "none",
						scrollTrigger: {
							trigger: node,
							start: "top bottom",
							end,
							scrub: true,
							invalidateOnRefresh: true,
						},
					},
				);
			}

			for (const node of root.querySelectorAll<HTMLElement>(
				"[data-reveal-clip]",
			)) {
				gsap.fromTo(
					node,
					{ clipPath: "inset(0 0 100% 0)" },
					{
						clipPath: "inset(0 0 0% 0)",
						ease: "power2.out",
						duration: 1.2,
						scrollTrigger: { trigger: node, start: "top 80%", once: true },
					},
				);
			}

			ScrollTrigger.refresh();
		},
		{ scope: ref },
	);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
