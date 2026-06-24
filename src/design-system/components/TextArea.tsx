import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Bordered textarea (kit « Message » — 674×254): full ink border box, Montserrat 24px,
 * ~18px inset. `invalid` switches the border to the danger token and sets
 * `aria-invalid`. Presentational only (Principle VIII) — the form owns state.
 */
export function TextArea({
	invalid,
	className,
	...props
}: ComponentProps<"textarea"> & { invalid?: boolean }) {
	return (
		<textarea
			aria-invalid={invalid || undefined}
			className={cn(
				"w-full border bg-transparent px-[18px] py-3 font-sans text-body text-ink placeholder:text-ink/50 focus-visible:outline-none",
				invalid ? "border-danger" : "border-ink focus-visible:border-estuaire",
				className,
			)}
			{...props}
		/>
	);
}
