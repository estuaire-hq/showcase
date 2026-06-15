"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { HeroTitle } from "./HeroTitle";

/**
 * Full-screen intro — plays once over the hero on load (handoff « Intro Estuaire v2 »).
 * Distinct from the page's editorial "Intro" section. The title cycles the hero keywords
 * in the centre (odometer ribbon), then HANDS OFF: it slides onto the real hero title
 * (FLIP — measures `[data-hero-title]`) while the black background retracts onto the
 * hero's left panel (`[data-hero-panel]`).
 *
 * Rendered through a **portal into `document.body`** so it sits ABOVE the sticky navbar
 * (capped under the `z-10` page layer of `FooterReveal`, unreachable from inside the
 * page). The black covers the navbar during the intro and, as it retracts, the navbar is
 * revealed progressively behind it; at unmount the real panel + navbar take over.
 *
 * Hand-off alignment: the intro title is constrained to the hero title's box width (so
 * the lines wrap identically) and lands by its TOP-LEFT corner — both texts are
 * left-aligned, so aligning centres would leave the text slightly off and "teleport" on
 * unmount. Reuses `HeroTitle` for an exact match. It cycles keywords 0…N-1; the hero
 * then starts on N-1 so the swap is invisible. Skippable (click / Esc / wheel / touch).
 * `prefers-reduced-motion`: hidden via CSS + `onDone` at once.
 */
export function IntroScreen({
	label,
	trunk,
	keywords,
	onDone,
}: {
	label: string;
	trunk: string;
	keywords: string[];
	onDone?: () => void;
}) {
	const rootRef = useRef<HTMLDivElement>(null);
	const bgRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLDivElement>(null);
	// Portals only render on the client (no `document` on the server).
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	useGSAP(
		() => {
			const root = rootRef.current;
			const bg = bgRef.current;
			const titleWrap = titleRef.current;
			if (!root || !bg || !titleWrap) return;

			// Reduced motion: never animate — reveal the page immediately.
			if (prefersReducedMotion()) {
				onDone?.();
				return;
			}

			const lines = gsap.utils.toArray<HTMLElement>(
				titleWrap.querySelectorAll("[data-line]"),
			);
			const kws = gsap.utils.toArray<HTMLElement>(
				titleWrap.querySelectorAll("[data-kw]"),
			);
			const N = keywords.length;
			if (!lines.length || !N) {
				onDone?.();
				return;
			}

			// FLIP target: match the hero title's box width (identical wrapping), then align
			// TOP-LEFT corners — both titles are left-aligned text, so aligning their left
			// edge (where the glyphs start) is what makes the hand-off seamless.
			const heroTitle = document.querySelector("[data-hero-title]");
			const heroPanel = document.querySelector("[data-hero-panel]");
			let dx = 0;
			let dy = 0;
			if (heroTitle) {
				const h = heroTitle.getBoundingClientRect();
				titleWrap.style.maxWidth = `${h.width}px`;
				const intro = titleWrap.getBoundingClientRect();
				dx = h.left - intro.left;
				dy = h.top - intro.top;
			}
			// Right inset the black retracts to = the gap the hero's dark panel leaves, so
			// the black ends matching the panel exactly. Default to the desktop panel (48%).
			const rightInset = heroPanel
				? Math.max(
						0,
						(1 - heroPanel.getBoundingClientRect().right / window.innerWidth) *
							100,
					)
				: 48;

			// Rest state of the keyword ribbon: only the first keyword shown.
			gsap.set(kws, { yPercent: 100, autoAlpha: 0 });
			if (kws[0]) gsap.set(kws[0], { yPercent: 0, autoAlpha: 1 });
			gsap.set(bg, { clipPath: "inset(0% 0% 0% 0%)" });

			const tl = gsap.timeline({ onComplete: () => onDone?.() });

			// Entrance — masked line reveal (line 1, line 2, first keyword).
			const reveal = lines
				.map((l) => l.firstElementChild)
				.filter((el): el is Element => el != null);
			tl.from(
				reveal,
				{ yPercent: 115, duration: 0.85, ease: "expo.out", stagger: 0.1 },
				0,
			);

			// Odometer — roll through the remaining keywords (ribbon: outgoing and incoming
			// share duration + ease, started together). Faster here than in the live hero
			// (the hero keeps its 0.7s roll): snappier phrase cycling for the intro.
			const ROLL = 0.5;
			const gaps = [0.6, 0.5, 0.45];
			let t = 0.85 + 0.8; // entrance + hold on phrase 0
			for (let i = 1; i < N; i++) {
				tl.to(
					kws[i - 1],
					{ yPercent: -100, autoAlpha: 0, duration: ROLL, ease: "expo.out" },
					t,
				).fromTo(
					kws[i],
					{ yPercent: 100, autoAlpha: 0 },
					{ yPercent: 0, autoAlpha: 1, duration: ROLL, ease: "expo.out" },
					t,
				);
				t += ROLL + (gaps[i - 1] ?? 0.45);
			}
			t += 0.35;

			// Hand-off — title glides onto the hero (top-left aligned, no scale → exact),
			// black retracts onto the panel revealing the navbar progressively behind it.
			tl.addLabel("handoff", t);
			tl.to(
				titleWrap,
				{ x: dx, y: dy, duration: 1.2, ease: "expo.inOut" },
				t,
			).to(
				bg,
				{
					clipPath: `inset(0% ${rightInset}% 0% 0%)`,
					duration: 1.2,
					ease: "expo.inOut",
				},
				t,
			);

			// Skip — fast-forward to the hand-off, then play it out (never a hard cut).
			let skipped = false;
			const skip = () => {
				if (skipped) return;
				if (tl.time() >= (tl.labels.handoff ?? 0)) return; // already handing off
				skipped = true;
				tl.tweenTo("handoff", {
					duration: 0.35,
					ease: "power2.inOut",
					onComplete: () => tl.play(),
				});
			};
			const onKey = (e: KeyboardEvent) => {
				if (e.key === "Escape") skip();
			};
			root.addEventListener("click", skip);
			window.addEventListener("keydown", onKey);
			window.addEventListener("wheel", skip, { passive: true });
			window.addEventListener("touchmove", skip, { passive: true });

			return () => {
				root.removeEventListener("click", skip);
				window.removeEventListener("keydown", onKey);
				window.removeEventListener("wheel", skip);
				window.removeEventListener("touchmove", skip);
			};
		},
		{ scope: rootRef, dependencies: [keywords, mounted] },
	);

	if (!mounted) return null;

	return createPortal(
		<div
			ref={rootRef}
			// Portaled to <body> → above the navbar (z-50). Black covers everything during
			// the intro; it retracts at the hand-off to reveal the navbar progressively.
			className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden text-paper motion-reduce:hidden"
			aria-hidden
		>
			<div ref={bgRef} className="absolute inset-0 bg-ink" />
			{/* Centred title (normal flow → measurable); FLIP translates it onto the hero. */}
			<div ref={titleRef} className="relative z-10 will-change-transform">
				<HeroTitle
					label={label}
					trunk={trunk}
					keywords={keywords}
					activeIndex={0}
				/>
			</div>
		</div>,
		document.body,
	);
}
