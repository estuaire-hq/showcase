/**
 * Disclosure chevron: points DOWN at rest, flipped by the consumer when expanded.
 * Same facture as `CloseIcon` (stroke in `currentColor`, round caps, decorative), so the
 * surrounding control drives the tone and carries the accessible name.
 *
 * Deliberately NOT the kit's `arrow-right-1` (the `Arrow` component): in the nav panel the
 * row's label is already a link to its own page, so a right-pointing arrow beside it reads
 * "go there" and competes with the real link. A down chevron is the unambiguous "expand"
 * signal (ADR 0027; NN/g menu-design guideline 12 asks for a caret or arrow on submenus).
 */
export function ChevronIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<path d="M5 9l7 7 7-7" />
		</svg>
	);
}
