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
	const { label, className, ...rest } = props;
	const cls = sectorButton({ class: className });
	const content = <BrandText>{label}</BrandText>;

	if (rest.href != null) {
		return (
			<Link className={cls} {...(rest as ComponentProps<typeof Link>)}>
				{content}
			</Link>
		);
	}
	const { href: _omit, ...buttonRest } = rest as ComponentProps<"button"> & {
		href?: undefined;
	};
	return (
		<button type="button" className={cls} {...buttonRest}>
			{content}
		</button>
	);
}
