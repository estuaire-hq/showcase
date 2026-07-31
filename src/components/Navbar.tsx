"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { type NavItem, navigation } from "@/content/navigation";
import {
	breakpoint,
	NAV_PANEL_ID,
	NavPanel,
	type NavTone,
	SiteHeader,
} from "@/design-system";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { useScrollLock } from "@/lib/a11y/useScrollLock";
import { useNavOverlay } from "@/lib/motion/navOverlay";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import { useStickyNav } from "@/lib/motion/useStickyNav";
import { useMeasuredTones } from "@/lib/nav/useMeasuredTones";
import { trackEvent } from "@/lib/utils";

/**
 * Navbar — the connected, behavioural wrapper for the global site header. Reads the
 * static `navigation` config (FR-015) and renders the presentational `<SiteHeader>` +
 * `<NavPanel>`. The only `"use client"` boundary for the header; pages/layout stay RSC
 * (Principle I). Owns: the active route (US1), the mobile panel + scroll-lock +
 * focus-trap (US2), and the sticky state + adaptive per-slot tone (US3).
 */

/**
 * Resolve which nav entry is "active" for the current pathname (FR-016, data-model §2):
 * exact match or sub-route prefix; the brand/home is active only on exactly "/". Returns
 * the matching entry's href (never the raw pathname) so the pills emit `aria-current`.
 *
 * `childHref` additionally names the SUB-PAGE that matches, when the route is one:
 * `/expertises/agencement-sur-mesure` resolves to `href: "/expertises"` (unchanged, so the
 * desktop pills and dropdowns behave exactly as before) **plus**
 * `childHref: "/expertises/agencement-sur-mesure"`. The mobile panel needs that second
 * value to mark the current sub-page, since `href` alone can never equal a child's href, so a
 * sub-page used to be reachable but never signalled as current.
 */
function resolveActive(pathname: string): {
	href?: string;
	childHref?: string;
} {
	if (pathname === navigation.brandHref) return { href: navigation.brandHref };
	// The CTA is structurally a childless NavItem, so both lists walk under one type.
	const entries: NavItem[] = [...navigation.items, navigation.cta];
	for (const entry of entries) {
		if (pathname === entry.href) return { href: entry.href };
		if (pathname.startsWith(`${entry.href}/`)) {
			const child = entry.children?.find(
				(candidate) =>
					pathname === candidate.href ||
					pathname.startsWith(`${candidate.href}/`),
			);
			return { href: entry.href, childHref: child?.href };
		}
	}
	return {};
}

type DeclaredCtaTone = "bleu" | "noir";
type HeaderTones = {
	logo: NavTone;
	links: NavTone;
	toggleMobile?: NavTone;
	toggleTablet?: NavTone;
	cta?: DeclaredCtaTone;
};
const DEFAULT_TONES: HeaderTones = { logo: "onLight", links: "onLight" };

/**
 * Read the per-slot tone the current page's header region declares (contract
 * `section-tone.md`): `data-nav-logo-tone` / `data-nav-links-tone`, plus optional
 * per-slot overrides — `data-nav-toggle-tone` (mobile toggle) /
 * `data-nav-toggle-tone-tablet` (tablet toggle), each defaulting to the links tone,
 * and `data-nav-cta-tone` (`bleu`|`noir`) for the CTA's rest colour. Safe default
 * `onLight` (dark content on a light surface) for any page that declares nothing.
 *
 * These stay the server-rendered value and the sole source where the bar sits on a solid
 * surface. Where it floats over a photo, the page ALSO emits `data-nav-band-*` and
 * `useMeasuredTones` refines each slot from the strip behind it (ADR 0029).
 */
function readHeaderTones(): HeaderTones {
	const el = document.querySelector(
		"[data-nav-logo-tone], [data-nav-links-tone], [data-nav-toggle-tone], [data-nav-toggle-tone-tablet], [data-nav-cta-tone]",
	);
	const read = (name: string): NavTone | undefined => {
		const v = el?.getAttribute(name);
		return v === "onDark" || v === "onLight" ? v : undefined;
	};
	const cta = el?.getAttribute("data-nav-cta-tone");
	return {
		logo: read("data-nav-logo-tone") ?? "onLight",
		links: read("data-nav-links-tone") ?? "onLight",
		toggleMobile: read("data-nav-toggle-tone"),
		toggleTablet: read("data-nav-toggle-tone-tablet"),
		cta: cta === "bleu" || cta === "noir" ? cta : undefined,
	};
}

export function Navbar() {
	const pathname = usePathname();
	const { href: activeHref, childHref: activeChildHref } =
		resolveActive(pathname);
	const reducedMotion = usePrefersReducedMotion();
	const state = useStickyNav(reducedMotion);
	// Full-bleed dark sections (pinned case studies) ask the bar to go transparent/onDark.
	const overlay = useNavOverlay();
	// Per-slot tones measured from the strip behind each box, on pages that emit a band.
	const measured = useMeasuredTones(pathname);

	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [tones, setTones] = useState<HeaderTones>(DEFAULT_TONES);
	// The panel node via a callback ref (state), so the focus trap re-runs the moment it
	// mounts — depending on a ref object would not re-fire if `.current` were still null.
	const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);

	const close = useCallback(() => setIsOpen(false), []);
	const trackContact = useCallback(() => trackEvent("nav_contact_click"), []);

	// Portal target (<body>) is only available after mount.
	useEffect(() => setMounted(true), []);

	// On route change: close the panel (covers back/forward) and re-read the new page's
	// declared header tones. The page DOM is committed before this effect runs, so a
	// synchronous tone declaration is read reliably (a Suspense-streamed header would need
	// a re-read — none exist today).
	// biome-ignore lint/correctness/useExhaustiveDependencies: run on route change
	useEffect(() => {
		setIsOpen(false);
		setTones(readHeaderTones());
	}, [pathname]);

	// Close + release the lock when crossing into desktop while open (edge case: no ghost
	// panel / stuck scroll on resize). `lg` breakpoint from the DS tokens.
	useEffect(() => {
		const mq = window.matchMedia(`(min-width: ${breakpoint.desktop}px)`);
		const onChange = (e: MediaQueryListEvent) => {
			if (e.matches) setIsOpen(false);
		};
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	useScrollLock(isOpen);
	useFocusTrap(isOpen, panelEl, close);

	// Selecting an entry navigates (the pill's <Link>) then closes (FR-010); the contact
	// entry is tracked like the desktop CTA.
	const handleSelect = useCallback(
		(href: string) => {
			if (href === navigation.cta.href) trackContact();
			setIsOpen(false);
		},
		[trackContact],
	);

	return (
		<>
			<SiteHeader
				items={navigation.items}
				cta={navigation.cta}
				brandHref={navigation.brandHref}
				activeHref={activeHref}
				state={state}
				overlay={overlay}
				logoTone={tones.logo}
				linksTone={tones.links}
				toggleToneMobile={tones.toggleMobile}
				toggleToneTablet={tones.toggleTablet}
				ctaToneTop={tones.cta}
				measured={measured}
				isMenuOpen={isOpen}
				onMenuToggle={() => setIsOpen((open) => !open)}
				onCtaClick={trackContact}
				reducedMotion={reducedMotion}
			/>
			{mounted &&
				createPortal(
					<NavPanel
						ref={setPanelEl}
						id={NAV_PANEL_ID}
						isOpen={isOpen}
						onClose={close}
						items={navigation.items}
						cta={navigation.cta}
						brandHref={navigation.brandHref}
						activeHref={activeHref}
						activeChildHref={activeChildHref}
						onSelect={handleSelect}
						reducedMotion={reducedMotion}
					/>,
					document.body,
				)}
		</>
	);
}
