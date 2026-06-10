import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";
import { BrandText } from "../typography/BrandText";

/**
 * Sector list item (kit « BTN secteur » — e.g. « Banque & assurance »).
 * Left-aligned label framed by top + bottom rules (3px ink). Hover turns the
 * label estuaire; the rules stay ink. Designed to stack: use `divide`/negative
 * margins or drop the top rule on inner items to avoid doubled borders.
 */
const sectorButton = tv({
	base: "flex w-full items-center border-ink border-y-[3px] py-3 text-left font-display text-body font-semibold leading-tight text-ink transition-colors duration-300 hover:text-estuaire focus-visible:text-estuaire focus-visible:outline-none",
});

export function SectorButton({
	label,
	className,
	...props
}: {
	label: string;
} & Omit<ComponentProps<"button">, "className"> & { className?: string }) {
	return (
		<button
			type="button"
			className={sectorButton({ class: className })}
			{...props}
		>
			<BrandText>{label}</BrandText>
		</button>
	);
}
