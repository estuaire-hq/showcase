"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, SplitText, useGSAP } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { breakpoint, motion } from "../tokens";
import { BrandText } from "../typography/BrandText";
import { LogomarkLoader } from "./LogomarkLoader";

/**
 * HeroIntro — the site-entry overlay for the home (brief header-entry-animation).
 *
 * Choreography (3 tight beats, horizontal axis — the split-screen reads left↔right):
 *  1. INK panel (portalled to <body>, above the navbar — stacking-context lesson from
 *     PageTransition) traces the logomark via `LogomarkLoader` (loop=false, writes once
 *     in ~1s), then rolls « Estuaire » in letter by letter (roulette grammar).
 *  2. Bascule: the mark FLIPs up-left into the navbar logo slot, « Estuaire » slides to
 *     the hero H1, and the black panel RETRACTS from the right to the split line (the
 *     white right half appears) — all together. The panel then fades, revealing the real
 *     navbar logo + H1 + dark panel underneath (ink→ink, seamless).
 *  3. (Owned by HeroSlideshow via the entrance, next) « là où… » types in + first image.
 *
 * Seamless H1 handoff: the intro word is the SAME render as the hero `<h1>` — identical
 * `BrandText` + identical type classes (so it carries the `text-display` 0.05em tracking),
 * split into chars for the roll via GSAP `SplitText` (which preserves the exact layout). So
 * once scaled onto the H1 the letters line up exactly and the cross-fade is invisible — a
 * different-tracking copy would visibly snap (Pierre, 2026-06-23).
 *
 * Two layers so the retract clip never cuts the flying copies: a black background that
 * gets clipped, and the lockup (knot + word) above it, untouched. FLIP targets are read
 * live from the real DOM (`[data-brand-logo]`, `[data-hero-h1]`) at the tween's start.
 * Top-left aligned + scaled (FLIP lesson: align corners, not centres). Presentational;
 * never mounted under reduced motion (HomeHero).
 */
export function HeroIntro({
	label,
	onComplete,
}: {
	label: string;
	onComplete?: () => void;
}) {
	const rootRef = useRef<HTMLDivElement>(null);
	const bgRef = useRef<HTMLDivElement>(null);
	const knotRef = useRef<HTMLDivElement>(null);
	const wordRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);
	// Logomark size paired with the word per breakpoint so the lockup stays balanced
	// (the word follows the H1 type scale: 55px below lg, 100px at lg).
	const [knotSize, setKnotSize] = useState(92);

	useEffect(() => {
		const w = window.innerWidth;
		setKnotSize(
			w >= breakpoint.desktop ? 92 : w >= breakpoint.tablet ? 64 : 52,
		);
		setMounted(true);
	}, []);

	useGSAP(
		() => {
			const root = rootRef.current;
			const bg = bgRef.current;
			const knot = knotRef.current;
			const word = wordRef.current;
			if (!root || !bg || !knot || !word) return;

			// Our ink overlay is now mounted → drop the pre-paint shield (root layout) it was
			// standing in for, in the same layout pass so the cover never lifts (ink→ink).
			document.documentElement.removeAttribute("data-hero-entry");
			// Reveal the logomark now its own stroke mask is set (the LogomarkLoader's layout
			// effect, a child, ran before ours) — no first-paint round-cap dots.
			gsap.set(knot, { autoAlpha: 1 });

			const done = () => onComplete?.();
			// Split « Estuaire » into masked chars for the roulette roll — SplitText keeps the
			// BrandText layout intact, so the FLIP lands on the H1 exactly.
			const split = new SplitText(word, { type: "chars", mask: "chars" });
			const chars = split.chars;

			// Reduced motion (defensive — HomeHero won't render us): reveal at once.
			if (prefersReducedMotion()) {
				done();
				return () => split.revert();
			}

			// Live rect of the navbar logomark (left, height-proportional part of the brand
			// link) and of the hero H1 — measured at tween start (post-font-load).
			const rectOf = (sel: string) =>
				document.querySelector(sel)?.getBoundingClientRect() ?? null;
			const navKnotRect = () => {
				const r = rectOf("[data-brand-logo]");
				if (!r) return null;
				// BrandLogo viewBox 281×75; the logomark is its left 68.5/75 of the height.
				return {
					left: r.left,
					top: r.top,
					h: r.height,
					w: (r.height * 68.5) / 75,
				};
			};

			// Revealed right fraction at the split line, per breakpoint (hero dark panel:
			// lg right-48%, md right-35.8%, mobile full dark → no retract).
			const w = window.innerWidth;
			const revealRight =
				w >= breakpoint.desktop ? 48 : w >= breakpoint.tablet ? 35.8 : 0;

			gsap.set(chars, { yPercent: 115 });
			gsap.set([knot, word], { transformOrigin: "0% 0%" });
			gsap.set(bg, { clipPath: "inset(0% 0% 0% 0%)" });

			const tl = gsap.timeline({ onComplete: done });

			// 1 — trace plays on its own (~introTraceDur); then « Estuaire » rolls in.
			tl.to(chars, {
				yPercent: 0,
				duration: motion.introWordRollDur,
				ease: motion.easeExpo,
				stagger: motion.introWordStagger,
				delay: motion.introTraceDur + motion.introWordDelay,
			});

			// 2 — bascule (all together): mark→navbar, word→H1, black retracts from the right.
			tl.addLabel("bascule", `+=${motion.introHold}`);
			tl.to(
				knot,
				{
					x: () => {
						const t = navKnotRect();
						return t ? t.left - knot.getBoundingClientRect().left : 0;
					},
					y: () => {
						const t = navKnotRect();
						return t ? t.top - knot.getBoundingClientRect().top : 0;
					},
					scale: () => {
						const t = navKnotRect();
						return t ? t.h / knot.getBoundingClientRect().height : 1;
					},
					duration: motion.introFlipDur,
					ease: motion.easeExpo,
				},
				"bascule",
			);
			tl.to(
				word,
				{
					x: () => {
						const t = rectOf("[data-hero-h1]");
						return t ? t.left - word.getBoundingClientRect().left : 0;
					},
					y: () => {
						const t = rectOf("[data-hero-h1]");
						return t ? t.top - word.getBoundingClientRect().top : 0;
					},
					scale: () => {
						const t = rectOf("[data-hero-h1]");
						return t ? t.height / word.getBoundingClientRect().height : 1;
					},
					duration: motion.introFlipDur,
					ease: motion.easeExpo,
				},
				"bascule",
			);
			if (revealRight > 0) {
				tl.to(
					bg,
					{
						clipPath: `inset(0% ${revealRight}% 0% 0%)`,
						duration: motion.introRetractDur,
						ease: motion.easeExpo,
					},
					"bascule",
				);
			}

			// 3 — the panel fades, revealing the real navbar logo + H1 + dark hero (ink→ink).
			tl.to(
				root,
				{ autoAlpha: 0, duration: 0.35, ease: "power2.out" },
				">-0.05",
			);

			return () => split.revert();
		},
		// Re-run once the portal has mounted (first pass runs with a null scope and bails).
		{ scope: rootRef, dependencies: [mounted] },
	);

	if (!mounted) return null;

	return createPortal(
		<div
			ref={rootRef}
			aria-hidden="true"
			data-hero-intro
			className="fixed inset-0 z-[100]"
		>
			{/* Black background — retracts from the right to form the split (clipped). */}
			<div ref={bgRef} className="absolute inset-0 bg-ink" />
			{/* Lockup (above the bg, never clipped): logomark + « Estuaire », like BrandLogo. */}
			<div className="absolute inset-0 flex items-center justify-center text-paper">
				<div className="flex items-center gap-4 sm:gap-5">
					{/* opacity 0 until GSAP reveals it (below): hides the LogomarkLoader's
					    first-paint round-cap dots before its own stroke mask is applied. */}
					<div
						ref={knotRef}
						data-intro-knot
						className="shrink-0"
						style={{ opacity: 0 }}
					>
						<LogomarkLoader
							size={knotSize}
							loop={false}
							delay={0.12}
							className="text-paper"
						/>
					</div>
					{/* Same render as the hero <h1> (BrandText + identical type classes → same
					    0.05em tracking) so the FLIP lands on it seamlessly. */}
					<div
						ref={wordRef}
						data-intro-word
						className="font-display font-semibold text-display-sm leading-none lg:text-display"
					>
						<BrandText>{label}</BrandText>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
