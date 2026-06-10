// Estuaire brand typographic rule: UPPERCASE letters render in Montserrat,
// everything else (lowercase, digits, punctuation, spaces) in Montserrat
// Alternates. Applied per character so it works for any content, including text
// coming from Sanity. Server-component safe (no client hooks).
const UPPER = /\p{Lu}/u;

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
