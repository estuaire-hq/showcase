"use client";

import Link from "next/link";
import {
	type FocusEvent,
	type MouseEventHandler,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import type { NavTone } from "../nav";
import { NavButton } from "./NavButton";

type SubItem = { label: string; href: string };

/**
 * Desktop nav entry WITH a dropdown (kit nav, extended for the client request to surface
 * the expertises / univers sub-pages from the navbar — revue 2026-06, B2/B3). The trigger is
 * the usual ghost-pill `NavButton` linking to the hub page; a panel of sub-links reveals
 * below it on hover / keyboard focus.
 *
 * The reveal is pure CSS (`group-hover` + `group-focus-within`), keyboard-reachable (tabbing
 * into a sub-link keeps the panel open via focus-within). The panel is always a solid paper
 * surface so it stays legible over any header tone (transparent over the hero, opaque when
 * pinned). `pt-3` keeps the trigger→panel hover bridge gap-free.
 *
 * `dismissed` fixes the navbar-persists-across-navigation bug: the bar lives in the layout,
 * so after a click the pointer is still over the trigger (hover stays true) and/or focus stays
 * on the clicked link (focus-within stays true) — the CSS reveal would keep the panel open
 * after navigating. On click we set `dismissed`, which drops the `group-hover:*` /
 * `group-focus-within:*` reveal classes so the panel hides regardless of the lingering
 * hover/focus, then re-arm it (below) so the next hover/focus re-opens normally. Stays
 * presentational (Principle VIII): no router, no pathname — purely local interaction state.
 */
export function NavDropdown({
	label,
	href,
	items,
	tone,
	active,
	activeHref,
	onSelect,
}: {
	label: string;
	href: string;
	items: SubItem[];
	tone?: NavTone;
	active?: boolean;
	activeHref?: string;
	onSelect?: (href: string) => void;
}) {
	const [dismissed, setDismissed] = useState(false);
	const groupRef = useRef<HTMLDivElement>(null);
	// Whether the pointer is currently over the group. A ref (not state): read synchronously
	// in `onBlur`, never needs to trigger a render — see `handleBlur`.
	const hovering = useRef(false);

	const handle =
		(href: string): MouseEventHandler<HTMLElement> =>
		() => {
			setDismissed(true);
			onSelect?.(href);
		};

	// Re-arm (mouse) on a genuine geometric exit while dismissed. A document-level pointermove
	// is the robust signal here: the page-transition curtain that sweeps over the viewport
	// between routes never MOVES the pointer, so it can't spuriously re-arm and reopen the
	// panel under the still cursor (the bug). It does fire the group's own pointerenter/leave,
	// though — and its leave "consumes" the only element-level leave — so element handlers
	// can't drive the re-arm reliably. Tracking the real pointer on `document` sidesteps that:
	// we re-arm the instant the cursor is actually OUTSIDE the group box (a real "I left"),
	// never while it still rests on the trigger — so there's no flicker and the next re-hover
	// reopens normally. On re-arm we also drop the stale focus the mouse CLICK left on the
	// trigger/sub-link: otherwise `group-focus-within` would reopen the panel the moment the
	// cursor leaves. This only runs on real mouse movement, so keyboard focus is never touched
	// (keyboard re-arms through `handleBlur`).
	useEffect(() => {
		if (!dismissed) return;
		const onPointerMove = (event: PointerEvent) => {
			const el = groupRef.current;
			if (!el) return;
			const r = el.getBoundingClientRect();
			const inside =
				event.clientX >= r.left &&
				event.clientX <= r.right &&
				event.clientY >= r.top &&
				event.clientY <= r.bottom;
			if (inside) return;
			const focused = document.activeElement;
			if (focused instanceof HTMLElement && el.contains(focused))
				focused.blur();
			setDismissed(false);
		};
		document.addEventListener("pointermove", onPointerMove);
		return () => document.removeEventListener("pointermove", onPointerMove);
	}, [dismissed]);

	// Re-arm (keyboard) when focus genuinely leaves the group — `relatedTarget` outside the
	// group, or null when activating a sub-link hides the panel and dumps focus to the body.
	// Guard on `!hovering`: a stray blur while the cursor still rests on the group must not
	// re-arm (it would reopen the panel under the cursor); the document pointermove above
	// handles the mouse re-arm.
	const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
		if (hovering.current) return;
		if (!event.currentTarget.contains(event.relatedTarget)) setDismissed(false);
	};

	return (
		// Passive grouping wrapper, not a control — the handlers only track hover/focus to
		// re-arm the dismissal; the trigger and sub-links inside carry the real semantics +
		// keyboard support, so the a11y interaction rule is a false positive here.
		// biome-ignore lint/a11y/noStaticElementInteractions: see comment above
		<div
			ref={groupRef}
			className="group relative"
			onPointerEnter={() => {
				hovering.current = true;
			}}
			onPointerLeave={() => {
				hovering.current = false;
			}}
			onBlur={handleBlur}
		>
			<NavButton
				label={label}
				href={href}
				tone={tone}
				active={active}
				onClick={handle(href)}
			/>
			<div
				className={cn(
					"invisible absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-200 ease-out",
					// Drop the hover/focus reveal while dismissed so the panel stays hidden even
					// though the pointer/focus is still inside the persistent navbar after a click.
					!dismissed &&
						"group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
				)}
			>
				<ul className="min-w-[208px] rounded-2xl bg-paper p-2 shadow-[0_12px_32px_rgba(14,18,21,0.16)] ring-1 ring-ink/10">
					{items.map((item) => {
						const current = activeHref === item.href;
						return (
							<li key={item.href}>
								{/* Hover affordance BEYOND a subtle blue text (estuaire sits close to ink):
								    a full estuaire fill with paper text — same treatment as the portfolio
								    Filter/SubFilter chips, clean and unmistakably interactive (client
								    review 2026-06). */}
								<Link
									href={item.href}
									onClick={handle(item.href)}
									aria-current={current ? "page" : undefined}
									className={cn(
										"block rounded-xl px-5 py-2.5 text-center font-display text-caption lowercase leading-none text-ink transition-colors duration-200 hover:bg-estuaire hover:text-paper focus-visible:bg-estuaire focus-visible:text-paper focus-visible:outline-none",
										current && "font-semibold",
									)}
								>
									{item.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
