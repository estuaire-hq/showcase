"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

/**
 * FooterReveal — continuous "from behind" footer reveal (reference: ocitocine.com,
 * decoded live: footer in normal flow, `z` BEHIND the content, with a scroll-driven
 * `translateY` that is never pinned — it moves continuously and just settles).
 *
 * Mechanics (the reveal is the motion — text is the anchor; the footer moves as ONE
 * block, a section handoff, never per-line text parallax):
 *  - The page content is the opaque TOP layer (`z-10`, `bg-paper`).
 *  - The footer sits BEHIND it (`z-0`) in normal flow, so it is fully scrollable even
 *    when taller than the viewport (the big footer is ~1400px).
 *  - As you reach the end, the content scrolls up and over the footer, uncovering it.
 *    The footer carries a `translateY` offset that resolves to 0 over its entrance and
 *    lands at 0 exactly when its TOP reaches the viewport top — it rises slightly
 *    slower than the content (a continuous settle), so it reads as emerging from BEHIND
 *    and coming to rest. It is NEVER held/stopped (the earlier pinned version froze it
 *    — wrong). `sine.inOut` matches scroll speed at both ends → no onset/exit snap.
 *  - The footer is TALLER than the viewport, so settling when its top hits the top
 *    presents the footer's top (the CTA) IN FULL; you then scroll through the rest. A
 *    NEGATIVE-only offset never extends the scrollable height, and once settled the
 *    footer scrolls through with no gap.
 *
 * Reduced motion: no transform — the footer just flows after the content, static.
 */
// How far the footer starts offset upward (hidden behind the page), as a fraction of
// the viewport — the "comes from further / behind" amplitude. Higher = more
// pronounced; `sine.inOut` keeps it from snapping, so keep it modest to avoid the
// footer near-stalling mid-settle (footer speed at mid ≈ 1 − LAG·1.57).
const REVEAL_LAG = 0.22;

export function FooterReveal({
	children,
	footer,
}: {
	children: React.ReactNode;
	footer: React.ReactNode;
}) {
	const rootRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const footerRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const reduce = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			if (reduce) return;
			const content = contentRef.current;
			const footerEl = footerRef.current;
			if (!content || !footerEl) return;

			gsap.fromTo(
				footerEl,
				{ y: () => -window.innerHeight * REVEAL_LAG },
				{
					y: 0,
					ease: "sine.inOut",
					scrollTrigger: {
						// Trigger on the CONTENT (never transformed → stable range, unlike
						// the footer which carries the moving transform). The settle spans the
						// footer's entrance and ENDS when the footer's top reaches the viewport
						// top — i.e. when the content's bottom passes the top. That presents the
						// footer's top (the CTA) IN FULL before you scroll on through it; the
						// footer is taller than the viewport, so ending at the very bottom would
						// instead keep its top cropped the whole time.
						trigger: content,
						start: "bottom bottom", // content bottom at viewport bottom (footer enters)
						end: "bottom top", // content bottom at viewport top (footer top reaches top)
						scrub: true,
						invalidateOnRefresh: true,
					},
				},
			);

			ScrollTrigger.refresh();
		},
		{ scope: rootRef },
	);

	return (
		<div ref={rootRef}>
			<div ref={contentRef} className="relative z-10 min-h-svh bg-paper">
				{children}
			</div>
			<div ref={footerRef} className="relative z-0 bg-ink">
				{footer}
			</div>
		</div>
	);
}
