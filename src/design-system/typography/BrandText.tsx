import type { ReactNode } from "react";

// Estuaire brand typographic rule: UPPERCASE letters render in Montserrat,
// everything else (lowercase, digits, punctuation, spaces) in Montserrat
// Alternates. Applied per character so it works for any content, including text
// coming from Sanity. Server-component safe (no client hooks).
export const UPPER = /\p{Lu}/u;

/** Brand casse rule for a single glyph → its font-family CSS value. Use this anywhere a
 *  per-character font is needed (e.g. the hero's per-glyph title reconstruction) so the
 *  rule has ONE definition. `BrandText` itself coalesces runs rather than calling it. */
export const charFont = (ch: string) =>
	UPPER.test(ch)
		? "var(--font-montserrat)"
		: "var(--font-montserrat-alternates)";

export function BrandText({ children }: { children: string }) {
	const runs: { upper: boolean; text: string }[] = [];
	for (const ch of children) {
		const upper = UPPER.test(ch);
		const last = runs.at(-1);
		if (last && last.upper === upper) last.text += ch;
		else runs.push({ upper, text: ch });
	}
	// Wrap the per-font runs in a single inline element. Without this wrapper the
	// runs are sibling nodes, and a flex parent with `gap` (e.g. the Filter, label
	// + chevron) would treat each run as a flex item and insert the gap *between*
	// letters — the "U nivers" gap. One span = one inline unit, gap-safe.
	return (
		<span>
			{runs.map((run, i) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: runs are positional
					key={i}
					style={{
						fontFamily: run.upper
							? "var(--font-montserrat)"
							: "var(--font-montserrat-alternates)",
					}}
				>
					{run.text}
				</span>
			))}
		</span>
	);
}

/**
 * Apply the brand casse rule to a label ONLY when it's a plain string. Display-type
 * primitives (Button, Pill) accept arbitrary `ReactNode`; wrapping a string in
 * `BrandText` makes every capital render in Montserrat (the brand rule) while
 * leaving non-string children (icons, composed nodes) untouched.
 */
export function brandCase(children: ReactNode): ReactNode {
	return typeof children === "string" ? (
		<BrandText>{children}</BrandText>
	) : (
		children
	);
}
