"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { ScrollTopButton } from "@/design-system";
import { cn } from "@/lib/utils";

/**
 * Mounts the design-system `ScrollTopButton` as site-wide chrome (FR-015): it appears
 * only while the user scrolls back UP (and is past a threshold, so it never shows near
 * the top), hides again on any downward scroll, and returns to the top smoothly via
 * Lenis (`scrollTo(0)`), falling back to native smooth scroll when Lenis is absent
 * (reduced-motion — SmoothScroll renders without the Lenis provider). Lives in
 * `src/lib/motion/` (behaviour) and is mounted in `(site)/layout.tsx`; the button
 * itself stays a pure DS component.
 */
export function ScrollTopMount() {
	const [visible, setVisible] = useState(false);
	const lastY = useRef(0);
	const lenis = useLenis();

	useEffect(() => {
		lastY.current = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			// Ignore sub-pixel jitter so momentum settling doesn't flip the direction.
			if (Math.abs(y - lastY.current) < 2) return;
			const goingUp = y < lastY.current;
			lastY.current = y;
			// Show only while scrolling up and not near the top (no point once almost there).
			setVisible(goingUp && y > window.innerHeight * 0.6);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const toTop = () => {
		if (lenis) lenis.scrollTo(0);
		else window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// No wrapper: positioning + the scroll-in fade go straight onto the button so the
	// element carrying `mix-blend-difference` is itself the `fixed` (page-level) box —
	// a `fixed` wrapper would trap the blend in its own empty context (see
	// ScrollTopButton). The button's own `transition` already covers `opacity`.
	return (
		<ScrollTopButton
			onClick={toTop}
			className={cn(
				"fixed right-5 bottom-5 z-40 size-[56px] md:right-8 md:bottom-8 md:size-[70px] lg:size-[90px]",
				visible ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		/>
	);
}
