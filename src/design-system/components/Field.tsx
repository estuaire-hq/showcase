import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Form field wrapper (a11y — FR-021). The maquette shows each field's name as an
 * in-field placeholder, so the `<label>` is visually hidden but present for assistive
 * tech. Renders the control + an error message announced via `role="alert"`.
 *
 * The control inside MUST carry `id={htmlFor}` and, when invalid,
 * `aria-describedby={`${htmlFor}-error`}` + `aria-invalid` — so the error text is
 * associated. Presentational only (Principle VIII).
 */
export function Field({
	label,
	htmlFor,
	error,
	required,
	className,
	children,
}: {
	label: string;
	htmlFor: string;
	error?: string;
	required?: boolean;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<label htmlFor={htmlFor} className="sr-only">
				{label}
				{required ? " (obligatoire)" : ""}
			</label>
			{children}
			{error && (
				<p
					id={`${htmlFor}-error`}
					role="alert"
					className="font-sans text-caption text-danger"
				>
					{error}
				</p>
			)}
		</div>
	);
}
