"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * File picker (kit « BTN fichier », 332×50). Square ink-outlined field,
 * Montserrat 24px, label left-aligned with a paperclip icon at the right; fills
 * ink on hover. Shows the chosen filename. Wraps a visually-hidden native
 * `<input type="file">` for full accessibility.
 */
export function FileInput({
	name,
	accept,
	label = "Choisissez un fichier",
	onChange,
	className,
}: {
	name?: string;
	accept?: string;
	label?: string;
	onChange?: (file: File | null) => void;
	className?: string;
}) {
	const [fileName, setFileName] = useState<string | null>(null);

	return (
		<label
			className={cn(
				"group flex h-[50px] w-full cursor-pointer items-center gap-3 rounded-none px-[18px] font-sans text-body text-ink ring-1 ring-ink ring-inset transition-colors duration-300 hover:bg-ink hover:text-paper focus-within:ring-2 focus-within:ring-estuaire",
				className,
			)}
		>
			{/* Kit BTN fichier: text left, paperclip icon at the right. */}
			<span className="flex-1 truncate">{fileName ?? label}</span>
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative; the surrounding label names the control */}
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden
				className="size-7 shrink-0"
			>
				<path d="M21 11.5l-8.5 8.5a5 5 0 01-7-7l8.5-8.5a3 3 0 014 4l-8.5 8.5a1 1 0 01-1.5-1.5L15 7" />
			</svg>
			<input
				type="file"
				name={name}
				accept={accept}
				className="sr-only"
				onChange={(e) => {
					const file = e.target.files?.[0] ?? null;
					setFileName(file?.name ?? null);
					onChange?.(file);
				}}
			/>
		</label>
	);
}
