"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";
import { motion } from "../tokens";
import { ChevronIcon } from "./ChevronIcon";

type SubItem = { label: string; href: string };

/**
 * One row of the mobile/tablet nav panel (presentational; only local disclosure state
 * lives here, like `NavDropdown`). A full-width link to the entry's own page, plus (when
 * it has sub-pages) a SEPARATE chevron button that discloses them in place.
 *
 * The row is deliberately SPLIT into two targets (ADR 0028): the label navigates to
 * the hub page, the chevron expands the children. That is what keeps both destinations
 * reachable without turning a real page into a mute header, and it matches the ARIA APG
 * "Disclosure Navigation" pattern: a real `<button>` with `aria-expanded` /
 * `aria-controls`, children in a NESTED `<ul>` (the list structure is what conveys the
 * hierarchy to assistive tech), and no `role="menu"`.
 *
 * Rows are left-aligned, not centred: indentation is the hierarchy cue the previous flat
 * centred list had no room for. Every target is ≥ 56px (parents) / 48px (children), above
 * the 44px floor (WCAG 2.5.5, Apple HIG) the old 19px sub-links missed.
 *
 * Focus rings paint in `paper`, not the site-wide `estuaire`: over the panel's ink
 * backdrop `estuaire` only reaches ~1.7:1, below the 3:1 that WCAG 1.4.11 asks of a
 * focus indicator.
 */
export function NavPanelItem({
	label,
	href,
	items,
	open,
	onToggle,
	active,
	activeChildHref,
	onSelect,
	reducedMotion = false,
}: {
	label: string;
	href: string;
	/** Sub-pages. Absent/empty → the row is a plain link, no chevron. */
	items?: SubItem[];
	/** Whether this row's sub-pages are disclosed (owned by `NavPanel`, one open at a time). */
	open: boolean;
	onToggle: () => void;
	/** This entry (or one of its sub-pages) is the current section. */
	active?: boolean;
	/** The sub-page href matching the current route, for `aria-current` on the child. */
	activeChildHref?: string;
	onSelect?: (href: string) => void;
	reducedMotion?: boolean;
}) {
	const listId = useId();
	const listRef = useRef<HTMLDivElement>(null);
	// Skip the tween on the very first effect run: the panel mounts closed (and invisible),
	// so the resting state must be SET, not animated from the server-rendered natural height.
	const firstRun = useRef(true);
	const hasChildren = items != null && items.length > 0;

	// Height tween on the wrapper. `display:none` while collapsed is load-bearing for a11y,
	// not just cosmetics: `useFocusTrap` keeps the collapsed links out of the Tab cycle by
	// filtering on `offsetWidth/offsetHeight`, and a merely `height:0 overflow:hidden` child
	// still reports its own box. GSAP owns `height`/`display` here (never React `style`) so
	// the two never stack (post-mortem 0015).
	useEffect(() => {
		const el = listRef.current;
		if (!el) return;
		if (firstRun.current || reducedMotion) {
			firstRun.current = false;
			gsap.set(el, {
				height: open ? "auto" : 0,
				display: open ? "block" : "none",
			});
			return;
		}
		// Tween from the CURRENT height (not a hard-coded 0) so interrupting a half-open
		// row reverses smoothly instead of snapping.
		if (open) gsap.set(el, { display: "block" });
		const tween = gsap.to(el, {
			height: open ? "auto" : 0,
			duration: motion.navDisclosureDuration,
			ease: motion.easeExpo,
			overwrite: "auto",
			onComplete: open ? undefined : () => gsap.set(el, { display: "none" }),
		});
		return () => {
			tween.kill();
		};
	}, [open, reducedMotion]);

	return (
		<li className="border-paper/15 border-b">
			{/* The active section carries a left rule; inactive rows keep a transparent one of
			    the same width so nothing shifts horizontally between states. */}
			<div
				className={cn(
					"flex items-stretch border-l-2",
					active ? "border-paper" : "border-transparent",
				)}
			>
				<Link
					href={href}
					onClick={() => onSelect?.(href)}
					aria-current={active ? "page" : undefined}
					className={cn(
						"flex min-h-14 flex-1 items-center py-2 pr-3 pl-4 font-display text-lead-sm text-paper lowercase transition-colors hover:bg-paper/5 focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-inset focus-visible:outline-none",
						active && "font-semibold",
					)}
				>
					{label}
				</Link>
				{hasChildren && (
					<button
						type="button"
						onClick={onToggle}
						aria-expanded={open}
						aria-controls={listId}
						// The chevron has no visible text, so it needs its own name, and it must
						// say WHICH section it opens, since several rows carry the same control.
						aria-label={`${open ? "Masquer" : "Afficher"} les pages de ${label}`}
						className="flex w-14 shrink-0 items-center justify-center border-paper/15 border-l text-paper transition-colors hover:bg-paper/5 focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-inset focus-visible:outline-none"
					>
						{/* Down at rest, flipped when open. The kit's rotating `arrow-right-1` would
						    read "go to this page" here and compete with the label's own link.
						    Pure CSS rotation: GSAP never touches this transform (post-mortem 0015). */}
						<ChevronIcon
							className={cn(
								"size-5",
								// `duration-(--var)` and not `duration-nav-disclosure`: Tailwind v4 has no
								// `--duration-*` theme namespace (only `--ease-*`), so a named duration
								// utility silently falls back to the 150ms default. Reading the var
								// keeps `@theme` the source of truth without hardcoding 400ms here.
								!reducedMotion &&
									"transition-transform duration-(--duration-nav-disclosure) ease-expo",
								open && "rotate-180",
							)}
						/>
					</button>
				)}
			</div>
			{hasChildren && (
				<div ref={listRef} id={listId} className="overflow-hidden">
					{/* Nested list, indented and hung off a vertical rule: the parent/child tie
					    the old sibling-of-the-parent markup could not express. */}
					<ul className="mb-2 ml-6 flex flex-col border-paper/25 border-l">
						{items.map((item) => {
							const current = activeChildHref === item.href;
							return (
								<li key={item.href}>
									<Link
										href={item.href}
										onClick={() => onSelect?.(item.href)}
										aria-current={current ? "page" : undefined}
										className={cn(
											"flex min-h-12 items-center py-1.5 pl-4 font-display text-caption text-paper/80 lowercase transition-colors hover:bg-paper/5 hover:text-paper focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-inset focus-visible:outline-none",
											current && "font-semibold text-paper",
										)}
									>
										{item.label}
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</li>
	);
}
