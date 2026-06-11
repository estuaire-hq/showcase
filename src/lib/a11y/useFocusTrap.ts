"use client";

import { useEffect } from "react";

const FOCUSABLE = [
	"a[href]",
	"button:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableWithin(panel: HTMLElement): HTMLElement[] {
	return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
		(el) =>
			el.offsetWidth > 0 ||
			el.offsetHeight > 0 ||
			el === document.activeElement,
	);
}

/**
 * Hand-rolled focus trap + dialog semantics for the nav panel (research §4, SC-006):
 * focus the first focusable on open, loop Tab / Shift-Tab inside the panel, close on
 * Escape, restore focus to the opener on close, and make the rest of the page
 * `inert` + `aria-hidden` (the wrapper portals the panel to <body>, so every other
 * body child can be inerted cleanly).
 *
 * Focus is restored to whatever was focused when the trap activated — i.e. the menu
 * toggle that opened the panel — so no trigger ref needs threading through SiteHeader.
 *
 * Takes the panel ELEMENT (not a ref object) so the effect re-runs the moment the node
 * mounts: a ref object has a stable identity, so depending on it would not re-fire if
 * `.current` were still null on the first run (open-but-untrapped panel). The wrapper
 * supplies the node via a callback-ref state.
 *
 * No dependency: the pattern is small and owned (Principle IV). If the a11y audit
 * (SC-006) finds it fragile, promote `focus-trap-react` (documented fallback, PR-acted).
 */
export function useFocusTrap(
	active: boolean,
	panel: HTMLElement | null,
	onEscape: () => void,
) {
	useEffect(() => {
		if (!active || !panel) return;

		const previouslyFocused = document.activeElement as HTMLElement | null;

		// Inert every other <body> child (panel is portaled to <body>).
		const inerted = (
			Array.from(document.body.children) as HTMLElement[]
		).filter((el) => el !== panel && !el.contains(panel));
		for (const el of inerted) {
			el.setAttribute("inert", "");
			el.setAttribute("aria-hidden", "true");
		}

		// Initial focus inside the panel.
		focusableWithin(panel)[0]?.focus();

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onEscape();
				return;
			}
			if (e.key !== "Tab") return;
			const els = focusableWithin(panel);
			if (els.length === 0) {
				e.preventDefault();
				return;
			}
			const first = els[0];
			const last = els[els.length - 1];
			const current = document.activeElement;
			if (e.shiftKey && (current === first || !panel.contains(current))) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && current === last) {
				e.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			for (const el of inerted) {
				el.removeAttribute("inert");
				el.removeAttribute("aria-hidden");
			}
			// Restore focus to the opener (inert is already removed above, so it can focus).
			previouslyFocused?.focus();
		};
	}, [active, panel, onEscape]);
}
