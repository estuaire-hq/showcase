"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/motion/gsap";

/**
 * Scroll-reveal wrapper (estuaire-motion). Applies the two recurring effects to its
 * subtree, on enter, once — then everything is static (the text is the anchor):
 *   - `[data-reveal]`       → title line-mask reveal (SplitText lines, rise from mask);
 *   - `[data-image-reveal]` → key image clip-path reveal.
 * One focal motion at a time; scrubless (enter triggers, `once`). Honors
 * `prefers-reduced-motion`: no transforms — content is shown in its final state.
 *
 * Wrap a section that carries those hooks: `<Reveal><SplitSection …/></Reveal>`.
 * Presentational components stay pure — the motion (behaviour) lives here, outside
 * the design system (Principle VIII).
 */
export function Reveal({
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
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			for (const title of root.querySelectorAll<HTMLElement>("[data-reveal]")) {
				const split = new SplitText(title, { type: "lines", mask: "lines" });
				gsap.from(split.lines, {
					yPercent: 110,
					duration: 1.15,
					ease: "expo.out",
					stagger: 0.1,
					scrollTrigger: { trigger: title, start: "top 85%", once: true },
				});
			}

			for (const el of root.querySelectorAll<HTMLElement>(
				"[data-image-reveal]",
			)) {
				gsap.fromTo(
					el,
					{ clipPath: "inset(0 0 100% 0)" },
					{
						clipPath: "inset(0 0 0% 0)",
						duration: 1.3,
						ease: "expo.out",
						scrollTrigger: { trigger: el, start: "top 85%", once: true },
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
