"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogomarkLoader } from "@/design-system/components/LogomarkLoader";
import { motion } from "@/design-system/tokens";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { navState } from "./navigationState";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * PageTransition — the "curtain" between pages. On an internal link click a full-screen
 * paper (white) panel RISES from the bottom to cover everything (navbar included), the new
 * route is pushed while hidden, then the panel KEEPS RISING off the top to reveal it — one
 * continuous upward sweep (Pierre, 2026-06-23). The cover also hides the content swap +
 * scroll reset.
 *
 * The covered panel centers the animated `LogomarkLoader` (the Estuaire mark writing
 * itself) as a loading indicator. The reveal is held back by a floor (`curtainLogoHold`,
 * measured from cover start) so the mark writes itself in full once before uncovering; on a
 * slow route the reveal naturally waits for the route to commit instead. The loader is
 * mounted only while covering (fresh write each time, no idle GSAP loop at rest).
 *
 * How it works:
 *  - A capture-phase document click listener intercepts same-origin link clicks (skips
 *    new-tab/modified clicks, hashes, downloads, externals, same-route). It cancels the
 *    default navigation, plays the cover, and on cover-complete calls `router.push`.
 *  - When the pathname commits (new page rendered), a `pathname`-keyed effect drops the
 *    curtain. A `navigating` guard ignores clicks mid-transition (no double nav).
 *  - The panel is portalled to <body> at z-[100] so it sits ABOVE the fixed navbar (a
 *    z-index from inside the page can't — stacking-context lesson from the hero intro).
 *
 * Honors prefers-reduced-motion: the listener is not installed, so links navigate normally
 * (no curtain). The panel renders off-screen (translateY 100%) and is inert until a cover.
 */
export function PageTransition() {
	const router = useRouter();
	const pathname = usePathname();
	const panelRef = useRef<HTMLDivElement>(null);
	const navigating = useRef(false);
	const pendingPath = useRef<string | null>(null);
	const coverStartAt = useRef<number | null>(null);
	const [mounted, setMounted] = useState(false);
	// Mount the loader only while the curtain covers — fresh write each time, no
	// idle GSAP loop at rest. A ref guards the click logic; this drives the loader.
	const [covering, setCovering] = useState(false);

	useEffect(() => setMounted(true), []);

	// Intercept internal link clicks → cover, then navigate (skip under reduced motion).
	useEffect(() => {
		if (prefersReducedMotion()) return;

		const onClick = (e: MouseEvent) => {
			if (
				navigating.current ||
				e.defaultPrevented ||
				e.button !== 0 ||
				e.metaKey ||
				e.ctrlKey ||
				e.shiftKey ||
				e.altKey
			) {
				return;
			}
			const anchor = (e.target as HTMLElement | null)?.closest?.("a");
			if (!anchor) return;
			const href = anchor.getAttribute("href");
			if (
				!href ||
				href.startsWith("#") ||
				anchor.target === "_blank" ||
				anchor.hasAttribute("download")
			) {
				return;
			}
			const url = new URL(href, window.location.href);
			if (url.origin !== window.location.origin) return;
			if (url.pathname === window.location.pathname) return;

			// Take over the navigation WITHOUT stopping propagation: Next's Link calls the
			// element's onClick first, THEN skips its own navigation when `defaultPrevented`
			// (next/link 16.x). So `preventDefault()` alone cancels Next's nav while Umami
			// (declarative + programmatic onClick) and other handlers still fire.
			e.preventDefault();
			navigating.current = true;
			pendingPath.current = url.pathname + url.search + url.hash;
			// Tell HomeHero this nav is curtain-carried (the curtain already writes the
			// logomark) so it skips its own black entry intro on arrival — no double.
			navState.viaCurtain = true;

			const panel = panelRef.current;
			if (!panel) {
				router.push(pendingPath.current);
				return;
			}
			panel.style.pointerEvents = "auto";
			coverStartAt.current = performance.now();
			setCovering(true); // mount the centered logomark loader; it writes from empty
			// GSAP owns the transform (never set it via React style, or the two stack).
			// `opacity: 1` lifts the at-rest invisibility; the panel rises from below.
			gsap.fromTo(
				panel,
				{ yPercent: 100, opacity: 1 },
				{
					yPercent: 0,
					duration: motion.curtainDuration,
					ease: "expo.inOut",
					onComplete: () => {
						if (pendingPath.current) router.push(pendingPath.current);
					},
				},
			);
		};

		document.addEventListener("click", onClick, true);
		return () => document.removeEventListener("click", onClick, true);
	}, [router]);

	// When the route has committed after a cover, drop the curtain to reveal the new page.
	useGSAP(
		() => {
			if (!navigating.current) return;
			const panel = panelRef.current;
			if (!panel) return;
			// Hold the cover so the logomark writes itself in full once: keep it up until
			// at least `curtainLogoHold` has elapsed SINCE the cover started. The route is
			// already committed here (this runs on the pathname change), so on a fast nav
			// the floor dominates; on a slow one the commit dominates and the loop keeps
			// running until ready. Never less than one paint frame (0.06s).
			const elapsed =
				coverStartAt.current != null
					? performance.now() - coverStartAt.current
					: 0;
			const holdRemaining =
				Math.max(0, motion.curtainLogoHold * 1000 - elapsed) / 1000;
			// Reveal by continuing UPWARD off the top (not back down) — one upward sweep:
			// rises from the bottom to cover, then keeps going up to uncover (Pierre, 2026-06-23).
			gsap.to(panel, {
				yPercent: -100,
				duration: motion.curtainDuration,
				ease: "expo.inOut",
				delay: Math.max(0.06, holdRemaining),
				onComplete: () => {
					navigating.current = false;
					pendingPath.current = null;
					coverStartAt.current = null;
					navState.viaCurtain = false; // window over: a later home mount is a real load
					panel.style.pointerEvents = "none";
					gsap.set(panel, { opacity: 0 }); // back to invisible at rest
					setCovering(false); // unmount the loader (no idle GSAP loop at rest)
				},
			});
		},
		{ dependencies: [pathname] },
	);

	if (!mounted) return null;
	return createPortal(
		<div
			ref={panelRef}
			aria-hidden="true"
			data-page-curtain
			className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-paper opacity-0"
		>
			{covering && <LogomarkLoader size={96} delay={motion.curtainLogoDelay} />}
		</div>,
		document.body,
	);
}
