/**
 * Close cross — geometry from Figma `croix fermer` (30×30). Paints in `currentColor`
 * so the consumer drives the tone. Decorative (`aria-hidden`); the surrounding control
 * carries the accessible name. Shared by `MenuToggle` (open state) and `NavPanel`.
 */
export function CloseIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width="30"
			height="30"
			viewBox="0 0 30 30"
			fill="none"
			stroke="currentColor"
			strokeWidth={2.5}
			strokeLinecap="round"
			aria-hidden="true"
			focusable="false"
		>
			<line x1="4" y1="4" x2="26" y2="26" />
			<line x1="26" y1="4" x2="4" y2="26" />
		</svg>
	);
}
