/**
 * Hamburger icon — geometry from Figma `menu hamburger` (31×24). Paints in
 * `currentColor` so the consumer drives the tone. Decorative (`aria-hidden`); the
 * surrounding control carries the accessible name.
 */
export function MenuIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width="31"
			height="24"
			viewBox="0 0 31 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2.5}
			strokeLinecap="round"
			aria-hidden="true"
			focusable="false"
		>
			<line x1="1" y1="2" x2="30" y2="2" />
			<line x1="1" y1="12" x2="30" y2="12" />
			<line x1="1" y1="22" x2="30" y2="22" />
		</svg>
	);
}
