import type { ComponentProps } from "react";
import { tv } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";
import { CloseIcon } from "./CloseIcon";

/**
 * Secondary portfolio filter (kit « btn sous-filtre » — e.g. « Banque &
 * assurance »). 61px square chip. States: default (ink outline), hover
 * (estuaire fill), selected (ink fill). `hover` is CSS; `selected` is driven by
 * the parent. When selected, hovering reveals a deselect cross (×) at the
 * right: the whole chip is the toggle, the cross only signals that a click
 * removes the filter.
 */
const subFilter = tv({
	base: "group relative inline-flex h-[61px] w-full items-center justify-center rounded-none px-8 font-display text-body-sm font-semibold leading-none ring-inset transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire sm:text-body",
	variants: {
		selected: {
			false:
				"text-ink ring-2 ring-ink hover:bg-estuaire hover:text-paper hover:ring-estuaire",
			true: "bg-ink text-paper ring-2 ring-ink",
		},
	},
	defaultVariants: { selected: false },
});

export function SubFilter({
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
			className={subFilter({ selected, class: className })}
			{...props}
		>
			<BrandText>{label}</BrandText>
			{selected && (
				<CloseIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-4 size-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
			)}
		</button>
	);
}
