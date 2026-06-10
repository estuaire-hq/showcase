import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";
import { BrandText } from "../typography/BrandText";
import { Arrow } from "./Arrow";

/**
 * Primary portfolio filter tab (kit « btn filtres » — Univers / Expertises).
 * Big 122px square tab with a disclosure chevron. States: default (ink
 * outline), hover (estuaire fill), selected (ink fill). `hover` is CSS;
 * `selected` is driven by the parent. The label runs through BrandText so the
 * leading capital renders in Montserrat and the rest in Montserrat Alternates.
 */
const filter = tv({
	base: "relative inline-flex h-[122px] w-full items-center justify-center rounded-none px-12 font-display text-body font-semibold leading-none ring-inset transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
	variants: {
		selected: {
			false:
				"text-ink ring-2 ring-ink hover:bg-estuaire hover:text-paper hover:ring-estuaire",
			true: "bg-ink text-paper ring-2 ring-ink",
		},
	},
	defaultVariants: { selected: false },
});

export function Filter({
	label,
	selected = false,
	className,
	...props
}: {
	label: string;
	selected?: boolean;
} & Omit<ComponentProps<"button">, "className"> & { className?: string }) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			className={filter({ selected, class: className })}
			{...props}
		>
			<BrandText>{label}</BrandText>
			<Arrow
				direction="down"
				className="-translate-y-1/2 absolute top-1/2 right-8"
			/>
		</button>
	);
}
