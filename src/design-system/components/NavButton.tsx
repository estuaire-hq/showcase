import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn, tv } from "@/lib/utils";
import { LineText } from "./LineText";

/**
 * Nav entry (desktop bar + the `NavDropdown` trigger). BARE TEXT, no box: `tone` gives it
 * `onLight` (ink) or `onDark` (paper), and it paints in `currentColor` so a measured tone
 * follows through (ADR 0029). Renders a `<button>`, or a Next `<Link>` when `href` is set.
 *
 * Interaction (owner's call, 2026-07-31, tuned in `lab/nav-hover`):
 *  - hover / focus → the word LIFTS 2px and the `LineText` rule draws under it (ADR 0021 D3,
 *    the same primitive as the footer links, so keyboard focus is covered too).
 *  - current page  → a DOT 8px under the word + a bold label, and the entry is INERT: no
 *    lift, no rule. It is a no-op, so it carries a state, not an invitation to click. That
 *    also settles a conflict: the rule (~0.15em) and the dot (8px) used to stack under the
 *    same word, five pixels apart, mixing the two registers.
 *
 * This REPLACES the KIT's own treatments (node 75:2963: hover = a filled pill, active = a 1px
 * ring), which read as a button. A deliberate departure from the maquette, like the measured
 * tone. The KIT also keeps the label at 400 in every state, so the bold here is ours too.
 *
 * Geometry: the hit area keeps the pill's 40px height and 18px side padding, so the bar's
 * vertical rhythm and the spacing between entries are unchanged; only the fill and the ring
 * are gone. The hit area MUST NOT move: the lift is applied to an inner span, because
 * translating the link itself moved its box out from under a pointer resting on its bottom
 * edge, which dropped the hover and made the word oscillate.
 */
const navButton = tv({
	// Kit: Montserrat Alternates Regular (400) 16px, textCase LOWER, ~18px h-padding.
	// `group/line` is the contract LineText keys off (hover AND focus-visible).
	base: "group/line inline-flex h-10 items-center justify-center rounded-full px-[18px] font-display text-caption lowercase leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
	variants: {
		tone: { onLight: "text-ink", onDark: "text-paper" },
		active: { true: "font-semibold", false: "" },
	},
	defaultVariants: { tone: "onLight", active: false },
});

/** The word, plus the rule and the lift, or the inert current-page word with its dot. */
function NavButtonLabel({ label, active }: { label: string; active: boolean }) {
	if (active) {
		return (
			<span className="relative inline-block leading-none">
				{label}
				{/* 8px under the baseline (settled with the owner): close enough to read as
				    belonging to the word, far enough not to touch its descenders. */}
				<span
					aria-hidden
					className="absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current"
				/>
			</span>
		);
	}
	return (
		// `transition-[translate]` targets exactly the property Tailwind v4 writes for
		// `-translate-y-*`. Duration/ease come from the line's own tokens, so the lift and the
		// rule move as one gesture. NB: a `@theme` token change needs a dev-server restart,
		// Turbopack does not recompile it live (that is what once made this look unanimated).
		<span className="inline-block transition-[translate] duration-(--duration-line) ease-expo group-hover/line:-translate-y-0.5 group-focus-visible/line:-translate-y-0.5 motion-reduce:transition-none">
			<LineText text={label} />
		</span>
	);
}

export function NavButton({
	label,
	href,
	tone,
	active = false,
	className,
	onClick,
}: {
	label: string;
	href?: string;
	tone?: "onLight" | "onDark";
	active?: boolean;
	className?: string;
	onClick?: MouseEventHandler<HTMLElement>;
}) {
	const cls = cn(navButton({ tone, active }), className);
	const content = <NavButtonLabel label={label} active={active} />;
	if (href != null) {
		return (
			<Link
				href={href}
				className={cls}
				aria-current={active ? "page" : undefined}
				onClick={onClick}
			>
				{content}
			</Link>
		);
	}
	return (
		<button
			type="button"
			className={cls}
			aria-pressed={active}
			onClick={onClick}
		>
			{content}
		</button>
	);
}
