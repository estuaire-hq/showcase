import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Underline text input (kit form fields « Nom & prénom », « Société », « Email » —
 * 674×50): transparent, ink bottom-border, Montserrat 24px, ~18px left inset (text
 * @986 vs field @968 on the node). `invalid` switches the border to the danger token
 * and sets `aria-invalid`. Presentational only (Principle VIII) — the form owns state.
 */
export function TextField({
	invalid,
	className,
	...props
}: ComponentProps<"input"> & { invalid?: boolean }) {
	return (
		<input
			aria-invalid={invalid || undefined}
			className={cn(
				"h-[50px] w-full border-b bg-transparent px-[18px] font-sans text-body text-ink leading-none placeholder:text-ink/50 focus-visible:outline-none",
				invalid ? "border-danger" : "border-ink focus-visible:border-estuaire",
				className,
			)}
			{...props}
		/>
	);
}
