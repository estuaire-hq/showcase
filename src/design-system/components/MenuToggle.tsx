import { cn } from "@/lib/utils";
import { type NavTone, TONE_TEXT_CLASS } from "../nav";
import { CloseIcon } from "./CloseIcon";
import { MenuIcon } from "./MenuIcon";

/**
 * Hamburger ↔ close toggle for the mobile/tablet nav panel (presentational, props
 * only). The icon paints in `currentColor`, so the tone is driven by text colour —
 * `tone` sets a default, but a `className` (e.g. responsive `text-paper md:text-ink`
 * for a per-breakpoint header split) overrides it via tailwind-merge. The button keeps
 * a ≥44px hit area for touch/a11y (SC-006).
 *
 * a11y (FR-011, SC-006): real <button>, `aria-expanded`, `aria-controls` → panel
 * id, and an `aria-label` that reflects open/closed state.
 */
export function MenuToggle({
	isOpen,
	onClick,
	tone = "onLight",
	label,
	controls,
	className,
}: {
	isOpen: boolean;
	onClick: () => void;
	tone?: NavTone;
	/** Accessible label, e.g. "Ouvrir le menu" / "Fermer le menu". */
	label: string;
	/** id of the controlled panel (matches NavPanel id). */
	controls?: string;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-expanded={isOpen}
			aria-controls={controls}
			aria-label={label}
			className={cn(
				"inline-flex size-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
				TONE_TEXT_CLASS[tone],
				className,
			)}
		>
			{isOpen ? <CloseIcon /> : <MenuIcon />}
		</button>
	);
}
