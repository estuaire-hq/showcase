"use client";

import { usePathname } from "next/navigation";
import { motion } from "@/design-system/tokens";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * ScrollReveal — the global content reveal. Every element marked `data-reveal-fade` fades
 * in (opacity 0 → 1, NO transform — the text stays the anchor) the first time it scrolls
 * into view, then stays. Per element & independent: each gets its own ScrollTrigger, so a
 * block reveals exactly when IT enters (Pierre, 2026-06-23), not in a section batch.
 *
 * Mounted once in the site layout; the `pathname` dependency makes it re-scan on every
 * client navigation (new page's elements picked up, old triggers reverted). Initial
 * opacity 0 is set inside `useGSAP` (a layout effect, BEFORE paint), so there is no flash
 * of visible-then-hidden content — on first load and on navigation alike. Honors
 * `prefers-reduced-motion`: no transform, content shown at rest.
 *
 * Lives in `@/lib/motion` with the other scroll-driven shells (Parallax, FooterReveal).
 */
export function ScrollReveal() {
	const pathname = usePathname();

	useGSAP(
		() => {
			if (prefersReducedMotion()) return;
			const els = gsap.utils.toArray<HTMLElement>("[data-reveal-fade]");
			if (els.length === 0) return;
			for (const el of els) {
				gsap.set(el, { opacity: 0 });
				gsap.to(el, {
					opacity: 1,
					duration: motion.revealDuration,
					ease: motion.easeExpo,
					scrollTrigger: { trigger: el, start: "top 85%", once: true },
				});
			}
			ScrollTrigger.refresh();
		},
		{ dependencies: [pathname] },
	);

	return null;
}
