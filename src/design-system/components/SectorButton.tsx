import Link from "next/link";
import type { ComponentProps } from "react";
import { tv } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";

/**
 * Sector list item (kit « BTN secteur » — e.g. « Banque & assurance »).
 * Left-aligned label, TOP rule only (3px ink); the LIST container draws the final
 * bottom rule (`border-b-[3px] border-ink`). This single-rule-per-item pattern keeps
 * every separator an exact 3px — the previous `border-y-[3px]` + `-mt-[3px]` overlap
 * produced uneven (3/6px) sub-pixel doubling (client review 2026-06: « des traits
 * plus gras que d'autres »).
 *
 * Hover: the label turns estuaire AND slides right — estuaire (#003787) sits close to
 * ink (#0e1215), so the colour change alone read as too subtle (« on ne distingue pas
 * bien le bleu / qu'on peut cliquer »); the slide makes the affordance unmistakable.
 *
 * Renders a `<button>` by default, or a Next `<Link>` when `href` is set (a
 * navigable sector row, e.g. the home « réalisations par secteur » list).
 */
const sectorButton = tv({
	base: "group flex w-full cursor-pointer items-center border-ink border-t-[3px] py-3 text-left font-display text-body font-semibold leading-tight text-ink transition-colors duration-300 hover:text-estuaire focus-visible:text-estuaire focus-visible:outline-none",
});

type BaseProps = { label: string; className?: string };

type AsButton = BaseProps &
	Omit<ComponentProps<"button">, "className"> & { href?: undefined };
type AsLink = BaseProps &
	Omit<ComponentProps<typeof Link>, "className"> & { href: string };

export function SectorButton(props: AsButton | AsLink) {
	// Discriminate on `props` (not a destructured `rest`) so TS narrows the union to a
	// single arm — Link vs button props are then exact, no cast needed.
	if (props.href != null) {
		const { label, className, ...rest } = props;
		return (
			<Link className={sectorButton({ class: className })} {...rest}>
				<span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">
					<BrandText>{label}</BrandText>
				</span>
			</Link>
		);
	}
	const { label, className, href: _href, ...rest } = props;
	return (
		<button
			type="button"
			className={sectorButton({ class: className })}
			{...rest}
		>
			<BrandText>{label}</BrandText>
		</button>
	);
}
