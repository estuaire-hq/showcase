import { cn } from "@/lib/utils";

/**
 * LinkedIn social button (kit « LinkedIn »). Outlined square at rest (paper
 * ring + glyph), estuaire fill on hover. Opens the profile in a new tab.
 *
 * NOTE: standard LinkedIn "in" glyph (approximation of the kit's bespoke vector).
 */
export function LinkedInButton({
	href,
	className,
}: {
	href: string;
	className?: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			aria-label="LinkedIn"
			className={cn(
				"inline-flex size-10 items-center justify-center rounded-full text-paper ring-2 ring-current ring-inset transition-colors duration-300 hover:bg-estuaire hover:text-paper hover:ring-estuaire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
				className,
			)}
		>
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative; the link has an aria-label */}
			<svg
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden
				className="size-5"
			>
				<circle cx="5" cy="5" r="2" />
				<rect x="3.2" y="9" width="3.6" height="11" />
				<path d="M9 9h3.5v1.6c.5-.9 1.7-1.9 3.6-1.9 3 0 4.9 1.9 4.9 5.4V20h-3.6v-5.1c0-1.4-.5-2.4-1.8-2.4-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20H9V9z" />
			</svg>
		</a>
	);
}
