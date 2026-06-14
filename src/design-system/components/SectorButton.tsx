import Link from "next/link";
import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";
import { BrandText } from "../typography/BrandText";

/**
 * Sector list item (kit « BTN secteur » — e.g. « Banque & assurance »).
 * Left-aligned label framed by top + bottom rules (3px ink). Hover turns the
 * label estuaire; the rules stay ink. Designed to stack: use `divide`/negative
 * margins or drop the top rule on inner items to avoid doubled borders.
 *
 * Renders a `<button>` by default, or a Next `<Link>` when `href` is set (a
 * navigable sector row, e.g. the home « réalisations par secteur » list).
 */
const sectorButton = tv({
	base: "flex w-full items-center border-ink border-y-[3px] py-3 text-left font-display text-body font-semibold leading-tight text-ink transition-colors duration-300 hover:text-estuaire focus-visible:text-estuaire focus-visible:outline-none",
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
				<BrandText>{label}</BrandText>
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
