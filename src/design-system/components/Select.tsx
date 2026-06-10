"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Arrow } from "./Arrow";

/**
 * Form select (kit « Type de demande » — collapsed/expanded). Square ink-outlined
 * box, Montserrat 24px, disclosure chevron in the header. Matches the kit by
 * expanding IN PLACE — the options live inside the same border, the box grows —
 * rather than floating, so the chevron stays put (top-right) in both states.
 * Controlled-optional: pass `value` + `onChange`, or let it self-manage.
 */
export function Select({
	options,
	value,
	defaultValue,
	onChange,
	placeholder = "Type de demande",
	name,
	className,
}: {
	options: string[];
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	name?: string;
	className?: string;
}) {
	const [open, setOpen] = useState(false);
	const [internal, setInternal] = useState(defaultValue ?? "");
	const selected = value ?? internal;
	const listId = useId();
	const rootRef = useRef<HTMLDivElement>(null);

	const choose = (opt: string) => {
		if (value === undefined) setInternal(opt);
		onChange?.(opt);
		setOpen(false);
	};

	// Close when clicking/tapping outside the field.
	useEffect(() => {
		if (!open) return;
		const onDown = (e: PointerEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("pointerdown", onDown);
		return () => document.removeEventListener("pointerdown", onDown);
	}, [open]);

	return (
		<div
			ref={rootRef}
			className={cn("font-sans text-body text-ink", className)}
		>
			{name && <input type="hidden" name={name} value={selected} />}
			<div className="border border-ink">
				<button
					type="button"
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-controls={listId}
					onClick={() => setOpen((o) => !o)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setOpen(false);
					}}
					className="flex h-[50px] w-full items-center justify-between gap-4 px-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire focus-visible:ring-inset"
				>
					<span className={selected ? "" : "text-ink/50"}>
						{selected || placeholder}
					</span>
					<Arrow direction={open ? "up" : "down"} />
				</button>
				{open && (
					<div id={listId} role="listbox" aria-label={placeholder}>
						{options.map((opt) => (
							<button
								key={opt}
								type="button"
								role="option"
								aria-selected={opt === selected}
								onClick={() => choose(opt)}
								className="flex h-[55px] w-full items-center px-5 text-left transition-colors duration-200 hover:bg-estuaire hover:text-paper focus-visible:bg-estuaire focus-visible:text-paper focus-visible:outline-none aria-selected:font-semibold"
							>
								{opt}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
