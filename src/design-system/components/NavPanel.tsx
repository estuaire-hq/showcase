"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { CloseIcon } from "./CloseIcon";
import { ContactButton } from "./ContactButton";
import { NavPanelItem } from "./NavPanelItem";

/**
 * Full-screen mobile/tablet navigation panel (presentational, props only). The backdrop,
 * close cross, CTA and centred logo come from Figma "MENU pop-up" (nodes 77:3630 /
 * 87:5893): a 90%-opaque ink backdrop, a close cross top-right (where the toggle sat),
 * the `bleu` CTA, and the logo centred below the entries.
 *
 * The ENTRY LIST deliberately departs from those frames (ADR 0028). They predate the
 * expertises / univers sub-menus (revue 2026-06) and specify centred ghost pills with no
 * second level at all, so once the children were bolted on as a flat, same-size,
 * same-position sibling list, the panel read as one undifferentiated 12-item column with
 * 19px touch targets. The list is now a left-aligned accordion: one full-width row per
 * entry, sub-pages disclosed by a separate chevron and indented under their parent (see
 * `NavPanelItem`). Left alignment is what buys the indentation; centring could not.
 * One section is open at a time, and the current page's section opens on panel open.
 *
 * The column is bounded (`max-w-[420px]`, centred) so tablet gets air rather than rows
 * stretched across 768px.
 *
 * The wrapper owns focus-trap / scroll-lock / background `inert` — this component
 * only provides the markup, the `id` (matches the toggle's `aria-controls`), the
 * close affordance and `onSelect` (FR-008/009/011). Always mounted so the fade can
 * play; closed = transparent + `inert` + non-interactive. `reducedMotion` → instant.
 */
export function NavPanel({
	ref,
	id,
	isOpen,
	onClose,
	items,
	cta,
	brandHref,
	logo,
	activeHref,
	activeChildHref,
	onSelect,
	reducedMotion = false,
}: {
	/** Root ref — the wrapper points its focus trap at the panel (React 19 ref-as-prop). */
	ref?: React.Ref<HTMLDivElement>;
	id: string;
	isOpen: boolean;
	onClose: () => void;
	items: {
		label: string;
		href: string;
		children?: { label: string; href: string }[];
	}[];
	cta: { label: string; href: string };
	brandHref: string;
	logo?: React.ReactNode;
	activeHref?: string;
	/** Sub-page href matching the current route, so the open section marks its current child. */
	activeChildHref?: string;
	/** Called when an entry is selected — the wrapper navigates then closes (FR-010). */
	onSelect?: (href: string) => void;
	reducedMotion?: boolean;
}) {
	// Which entry has its sub-pages disclosed, one at a time, so the panel stays short
	// enough to fit a phone in landscape (the flat list overflowed it by 322px).
	const [openHref, setOpenHref] = useState<string | null>(null);

	// Open the section the current page belongs to, every time the panel opens: it doubles
	// as a "you are here" cue, and it re-arms on each open so a toggle from a previous visit
	// never lingers as a stale state.
	useEffect(() => {
		if (!isOpen) return;
		const section = items.find(
			(item) => item.href === activeHref && item.children?.length,
		);
		setOpenHref(section?.href ?? null);
	}, [isOpen, activeHref, items]);

	return (
		<div
			ref={ref}
			id={id}
			role="dialog"
			aria-modal="true"
			aria-label="Menu de navigation"
			// Mounted always (fade); inert + hidden from AT when closed.
			inert={!isOpen}
			aria-hidden={!isOpen}
			// Lenis runs in `root` mode and hijacks wheel/touch at the document level, which
			// neutralises the panel's own scroll. `data-lenis-prevent` makes Lenis yield to
			// native scroll for any gesture inside the overlay so the scroll region below can
			// scroll. The background stays locked: useScrollLock's `lenis.stop()` still
			// preventDefaults gestures that land OUTSIDE the panel (checked after this attr).
			data-lenis-prevent
			className={cn(
				"fixed inset-0 z-[60] flex flex-col bg-ink/90 lg:hidden",
				!reducedMotion && "transition-opacity duration-300 ease-out",
				isOpen ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			{/* Close cross — top-right, aligned with the (reduced) header band height. Kept
			    outside the scroll region (shrink-0) so it stays reachable while the entries
			    scroll on short viewports. */}
			<div className="flex h-20 shrink-0 items-center justify-end px-5 md:px-10">
				<button
					type="button"
					onClick={onClose}
					aria-label="Fermer le menu"
					// `ring-paper`, not the site-wide `ring-estuaire`: see the CTA note below.
					className="inline-flex size-11 items-center justify-center rounded-full text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper"
				>
					<CloseIcon />
				</button>
			</div>

			{/* Scroll region — the entries + logo. `flex-1 min-h-0 overflow-y-auto` makes THIS
			    the scroll container (not the whole panel), top-aligned to match the Figma
			    "MENU pop-up" (entries near the top, logo below). Since the sub-pages were added
			    (revue 2026-06) the list can exceed a short viewport; scrolling keeps the CTA,
			    every sub-link and the logo reachable. `overscroll-contain` stops scroll chaining. */}
			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-8">
				{/* Entries: a left-aligned accordion in a bounded, centred column. Each row is
				    ≥56px; sub-pages are indented under their parent behind a chevron. The CTA
				    keeps its centred `bleu` pill (the one element that stays as per the kit). */}
				<nav
					aria-label="Navigation principale"
					className="mx-auto w-full max-w-[420px] px-5"
				>
					<ul className="border-paper/15 border-t">
						{items.map((item) => (
							<NavPanelItem
								key={item.href}
								label={item.label}
								href={item.href}
								items={item.children}
								open={openHref === item.href}
								onToggle={() =>
									setOpenHref((current) =>
										current === item.href ? null : item.href,
									)
								}
								active={activeHref === item.href}
								activeChildHref={activeChildHref}
								onSelect={onSelect}
								reducedMotion={reducedMotion}
							/>
						))}
					</ul>
					<div className="mt-8 flex justify-center">
						{/* Two overrides scoped to the panel, so the desktop CTA is untouched: `h-11`
						    lifts the kit's 40px pill to the 44px touch floor every other row now
						    meets, and the focus ring paints in `paper` (the kit's `estuaire` ring
						    only reaches ~1.7:1 over this ink backdrop, and WCAG 1.4.11 asks 3:1). */}
						<ContactButton
							label={cta.label}
							href={cta.href}
							tone="bleu"
							active={activeHref === cta.href}
							onClick={() => onSelect?.(cta.href)}
							className="h-11 focus-visible:ring-paper"
						/>
					</div>
				</nav>

				{/* Logo — centred, below the entries (node `logo_header` @ y≈467 → ~62px gap). */}
				<Link
					href={brandHref}
					onClick={() => onSelect?.(brandHref)}
					aria-label="Estuaire — accueil"
					className="mt-[62px] flex justify-center text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper"
				>
					{logo ?? <BrandLogo />}
				</Link>
			</div>
		</div>
	);
}
