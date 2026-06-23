"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/motion/gsap";

/**
 * Refresh ScrollTrigger after an App Router soft navigation.
 *
 * The `(site)` layout — and with it `FooterReveal` — PERSISTS across soft
 * navigations inside the segment (App Router only swaps `{children}`, never the
 * layout). So `FooterReveal`'s ScrollTrigger is created ONCE, with its range
 * measured against the FIRST page's height, and is never recomputed. Navigate to a
 * page of a different height and that range is stale: when the shorter page's max
 * scroll falls entirely below the (taller) stale range, the reveal never fires and
 * the footer sits frozen at its start offset (`-vh·REVEAL_LAG`), leaving a white
 * band below it (the body is `bg-paper`). See post-mortem 0014.
 *
 * Watching `usePathname()` and calling `ScrollTrigger.refresh()` once the new page
 * has committed + laid out recomputes every trigger's start/end (they all set
 * `invalidateOnRefresh: true`, so their function-based offsets re-run too). The
 * refresh is global, so it also re-settles any freshly-mounted page trigger.
 * Mounted in `(site)/layout.tsx` inside `SmoothScroll`.
 */
export function RouteScrollRefresh() {
	const pathname = usePathname();
	const lastPath = useRef<string | null>(null);

	useEffect(() => {
		// First mount: the freshly-mounted triggers measure themselves correctly; only
		// SUBSEQUENT route changes leave the persistent footer trigger stale. Comparing
		// against the last seen pathname also makes this a no-op under React Strict
		// Mode's double-invoked mount effect.
		if (lastPath.current === pathname) return;
		const isFirst = lastPath.current === null;
		lastPath.current = pathname;
		if (isFirst) return;
		// Wait for the new page to commit + lay out before re-measuring (two frames:
		// one for paint, one for layout to settle).
		let inner = 0;
		const outer = requestAnimationFrame(() => {
			inner = requestAnimationFrame(() => ScrollTrigger.refresh());
		});
		return () => {
			cancelAnimationFrame(outer);
			cancelAnimationFrame(inner);
		};
	}, [pathname]);

	return null;
}
