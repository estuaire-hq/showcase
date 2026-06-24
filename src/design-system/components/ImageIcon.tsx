import { cn } from "@/lib/utils";

/**
 * Placeholder « image » glyph (maquette « image_icn » — a framed mountain + sun). Marks an
 * empty media slot, e.g. a client-logo cell awaiting its Sanity asset (ClientsCarousel, I7).
 * Decorative — the consumer provides the accessible context. Inherits `currentColor`.
 */
export function ImageIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={cn("h-6 w-auto", className)}
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<rect x="3" y="4" width="18" height="16" rx="1.5" />
			<circle cx="8.5" cy="9" r="1.5" />
			<path d="M3 17l5-4 4 3 4-4 5 5" />
		</svg>
	);
}
