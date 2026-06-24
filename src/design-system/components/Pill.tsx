import type { ReactNode } from "react";
import { tv } from "@/lib/utils";
import { brandCase } from "../typography/BrandText";

/**
 * Pill — a non-interactive label chip for the « contraintes terrain » cloud (maquette:
 * sector intro, node 51:3520 « mots », radius 61, Montserrat Alternates 600 24px). Three
 * emphases drive the maquette's visual rhythm (Principle X — tokens only, no hard-coded
 * colour). Presentational only; not focusable (a label, not a control).
 *
 *   outline  ⬚ ink stroke, ink text, transparent  (the default / most chips)
 *   ink      ▮ ink fill, paper text
 *   accent   ▮ estuaire fill, paper text
 */
const pill = tv({
	base: "inline-flex items-center rounded-full px-7 py-3 text-center font-display font-semibold text-body-sm leading-none lg:px-8 lg:text-body",
	variants: {
		emphasis: {
			outline: "bg-transparent text-ink ring-1 ring-inset ring-ink",
			ink: "bg-ink text-paper",
			accent: "bg-estuaire text-paper",
		},
	},
	defaultVariants: { emphasis: "outline" },
});

// Mirrors the content layer's `ConstraintEmphasis` (kept separate to preserve DS isolation —
// the DS must not import from @/content). Keep both in sync if a variant is added.
export type PillEmphasis = "outline" | "ink" | "accent";

export function Pill({
	children,
	emphasis,
	className,
}: {
	children: ReactNode;
	emphasis?: PillEmphasis;
	className?: string;
}) {
	return (
		<span className={pill({ emphasis, class: className })}>
			{brandCase(children)}
		</span>
	);
}
