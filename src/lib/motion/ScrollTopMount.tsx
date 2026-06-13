"use client";

import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { ScrollTopButton } from "@/design-system";
import { cn } from "@/lib/utils";

/**
 * Mounts the design-system `ScrollTopButton` as site-wide chrome (FR-015): it fades
 * in once the user has scrolled past a threshold and returns to the top smoothly via
 * Lenis (`scrollTo(0)`), falling back to native smooth scroll when Lenis is absent
 * (reduced-motion — SmoothScroll renders without the Lenis provider). Lives in
 * `src/lib/motion/` (behaviour) and is mounted in `(site)/layout.tsx`; the button
 * itself stays a pure DS component.
 */
export function ScrollTopMount() {
	const [visible, setVisible] = useState(false);
	const lenis = useLenis();

	useEffect(() => {
		const onScroll = () =>
			setVisible(window.scrollY > window.innerHeight * 0.6);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const toTop = () => {
		if (lenis) lenis.scrollTo(0);
		else window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div
			className={cn(
				"fixed right-5 bottom-5 z-40 transition-opacity duration-300 md:right-8 md:bottom-8",
				visible ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			<ScrollTopButton
				onClick={toTop}
				className="size-[66px] md:size-[83px] lg:size-[105px]"
			/>
		</div>
	);
}
