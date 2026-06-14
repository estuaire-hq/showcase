"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";
import { type NavState, type NavTone, TONE_TEXT_CLASS } from "../nav";
import { BrandLogo } from "./BrandLogo";
import { ContactButton } from "./ContactButton";
import { MenuToggle } from "./MenuToggle";
import { NavButton } from "./NavButton";

/** Shared id linking the toggle's `aria-controls` to the `NavPanel` (rendered by the wrapper). */
export const NAV_PANEL_ID = "site-nav-panel";

type NavLink = { label: string; href: string };

// Per-breakpoint toggle tone at rest: base (mobile) vs `md:` (tablet). The home hero
// is dark full-width on mobile (white toggle) but light on the right on tablet (ink
// toggle) — read losslessly from nodes 77:3150 / 77:3149. The template-literal key type
// makes the four combinations exhaustive (no silent `undefined` lookup); the values stay
// literal strings so Tailwind's JIT sees every `md:` variant. Keyed `${mobileTone}-${tabletTone}`.
const TOGGLE_TOP_CLASS: Record<`${NavTone}-${NavTone}`, string> = {
	"onDark-onDark": "text-paper md:text-paper",
	"onDark-onLight": "text-paper md:text-ink",
	"onLight-onDark": "text-ink md:text-paper",
	"onLight-onLight": "text-ink md:text-ink",
};

// Background/shadow per visual state (data-model §2). Shadow = Figma drop shadow on the
// sticky frame (0 3px 6px rgba(0,0,0,.102), node 51:2585). The slide (transform) is driven
// by GSAP, NOT here — Tailwind v4 translate utilities animate the `translate` CSS property,
// which a class-swap transition can't reliably tween. `hidden` stays transparent so the bar
// slides up cleanly over the hero (no white flash); it reveals as solid (`pinned`).
const STATE_CLASS: Record<NavState, string> = {
	top: "bg-transparent",
	pinned: "bg-paper shadow-[0_3px_6px_rgba(0,0,0,0.102)]",
	hidden: "bg-transparent",
};

/**
 * The site header bar (presentational, props only — Principle VIII). No Sanity, no
 * router, no scroll logic: `state`, tones, `activeHref` and the menu open flag all
 * come from the `Navbar` wrapper. Geometry read losslessly from Figma (nodes
 * 51:2221 desktop / 77:3149 tablet / 77:3150 mobile): page padding 140 (lg) / 40
 * (md) / 20, logo left + horizontal links right (gap 15) at `lg`, hamburger below
 * `lg`. Bar height is tuned down to 112 (lg) / 80 from the maquette's 160/120 (too
 * tall), and the logo a touch (see BrandLogo). Renders `fixed`, overlaying the page top.
 *
 * Tone: at `top`, `logoTone`/`linksTone` apply per slot and the CTA is `bleu`; when
 * `pinned`/`hidden` the bar is opaque and content is forced `onLight` (ink) with the
 * CTA `noir` (the CTA colour DOES change with state — Figma nodes 51:2221 vs 51:2585,
 * which the original contract under-specified).
 *
 * `overlay`: the bar is floating over a full-bleed dark section (the pinned case
 * studies). It then stays transparent (no solid background, no shadow) even while
 * `pinned`, and content is forced `onDark` (white) with the CTA `bleu`, so the whole
 * dark photo shows through the bar instead of a white band.
 */
export function SiteHeader({
	items,
	cta,
	brandHref,
	logo,
	state,
	overlay = false,
	logoTone = "onLight",
	linksTone = "onLight",
	toggleToneMobile,
	activeHref,
	isMenuOpen,
	onMenuToggle,
	onCtaClick,
	reducedMotion = false,
	className,
}: {
	items: NavLink[];
	cta: NavLink;
	brandHref: string;
	logo?: React.ReactNode;
	state: NavState;
	/** Float transparently over a full-bleed dark section (forces `onDark`, drops the background). */
	overlay?: boolean;
	logoTone?: NavTone;
	linksTone?: NavTone;
	/** At-rest toggle tone below `md` (mobile) when it differs from `linksTone`. Defaults to `linksTone`. */
	toggleToneMobile?: NavTone;
	activeHref?: string;
	isMenuOpen: boolean;
	onMenuToggle: () => void;
	/** Fired on CTA click (the wrapper tracks it — keeps Umami out of the DS). */
	onCtaClick?: () => void;
	reducedMotion?: boolean;
	className?: string;
}) {
	const atTop = state === "top";
	// Over dark imagery (overlay) the bar is transparent with white content, regardless
	// of the pinned/hidden state; otherwise the hero tones apply at `top`, ink elsewhere.
	const resolvedLogoTone: NavTone = overlay
		? "onDark"
		: atTop
			? logoTone
			: "onLight";
	const resolvedLinksTone: NavTone = overlay
		? "onDark"
		: atTop
			? linksTone
			: "onLight";
	const ctaTone = overlay || atTop ? "bleu" : "noir";

	const toggleClass = overlay
		? "text-paper"
		: atTop
			? TOGGLE_TOP_CLASS[`${toggleToneMobile ?? linksTone}-${linksTone}`]
			: "text-ink";

	const headerRef = useRef<HTMLElement>(null);

	// Slide the bar up to hide / down to reveal. Tuned to the site's reveal feel
	// (estuaire-motion): the signature `expo.out` ease + an unhurried ~0.6s, so it
	// reads like the footer/section reveals rather than a snappy UI toggle. Transform
	// only; instant under reduced motion. GSAP owns the transform — see STATE_CLASS for
	// why a CSS-class transition can't drive the Tailwind v4 translate. overwrite:"auto"
	// lets a reversal interrupt the in-flight tween (no jitter).
	useEffect(() => {
		const el = headerRef.current;
		if (!el) return;
		const yPercent = state === "hidden" ? -100 : 0;
		if (reducedMotion) {
			gsap.set(el, { yPercent });
			return;
		}
		const tween = gsap.to(el, {
			yPercent,
			duration: 0.6,
			ease: "expo.out",
			overwrite: "auto",
		});
		return () => {
			tween.kill();
		};
	}, [state, reducedMotion]);

	return (
		<header
			ref={headerRef}
			className={cn(
				// Bar height is tuned DOWN from the Figma frames (160/120 read too tall) to
				// 112 (lg) / 80 — the chosen look. Padding-x stays at the maquette values
				// (140/40/20). The logo is also reduced a touch (see BrandLogo).
				"fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between px-5 md:px-10 lg:h-28 lg:px-[140px]",
				!reducedMotion &&
					"transition-[background-color,box-shadow] duration-500 ease-out",
				// `overlay` wins over the at-rest state: stay transparent (no shadow) over the
				// dark full-bleed section so the bar never paints a band over the photo.
				overlay ? "bg-transparent" : STATE_CLASS[state],
				className,
			)}
		>
			{/* Brand / logo (left). currentColor → tone-driven. */}
			<Link
				href={brandHref}
				aria-label="Estuaire — accueil"
				aria-current={activeHref === brandHref ? "page" : undefined}
				className={cn(
					"inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
					TONE_TEXT_CLASS[resolvedLogoTone],
				)}
			>
				{logo ?? <BrandLogo />}
			</Link>

			{/* Desktop list (lg and up) — links + CTA, gap 15 (node 51:2221). */}
			<nav aria-label="Navigation principale" className="hidden lg:block">
				<ul className="flex items-center gap-[15px]">
					{items.map((item) => (
						<li key={item.href}>
							<NavButton
								label={item.label}
								href={item.href}
								tone={resolvedLinksTone}
								active={activeHref === item.href}
							/>
						</li>
					))}
					<li>
						<ContactButton
							label={cta.label}
							href={cta.href}
							tone={ctaTone}
							active={activeHref === cta.href}
							onClick={onCtaClick}
						/>
					</li>
				</ul>
			</nav>

			{/* Mobile / tablet toggle (below lg). */}
			<MenuToggle
				isOpen={isMenuOpen}
				onClick={onMenuToggle}
				controls={NAV_PANEL_ID}
				label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
				className={cn("lg:hidden", toggleClass)}
			/>
		</header>
	);
}
