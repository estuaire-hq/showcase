import type { ComponentProps } from "react";
import { tv } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { Arrow } from "./Arrow";

/**
 * Primary portfolio filter tab (kit « btn filtres » — Univers / Expertises).
 * Big 122px square tab with a disclosure chevron. States: default (ink
 * outline), hover (estuaire fill), selected (ink fill). `hover` is CSS;
 * `selected` is driven by the parent. The label runs through BrandText so the
 * leading capital renders in Montserrat and the rest in Montserrat Alternates.
 *
 * Responsive: the maquette geometry (24px label centred on the full tab, chevron
 * pinned to the right edge) only fits once the tab is wide enough — the portfolio
 * grid reaches that from `xl`. Below it the tab is narrow (~150px at the sm
 * 4-column switch), so the label steps down to `text-body-sm` (the DS mobile step,
 * as on SubFilter) and the chevron sits IN FLOW next to it: overlap then becomes
 * structurally impossible instead of depending on the label's width.
 */
const filter = tv({
	base: "relative inline-flex h-[122px] w-full items-center justify-center gap-2 rounded-none px-4 font-display text-body-sm font-semibold leading-none ring-inset transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire lg:px-6 lg:text-body xl:px-12",
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
				className="xl:-translate-y-1/2 xl:absolute xl:top-1/2 xl:right-8"
			/>
		</button>
	);
}
