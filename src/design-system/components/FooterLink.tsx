import Link from "next/link";
import { cn } from "@/lib/utils";
import { LineText } from "./LineText";
import { RollText } from "./RollText";

/**
 * Footer link.
 *  - `nav` (kit « Menu footer ») — the main footer menu. Uses the signature hover
 *    text-roll (RollText, `onDark`: paper → cream on the dark footer surface).
 *  - `legal` (kit « mini menu footer ») — mentions légales / CGV… Uses the "line" hover
 *    (LineText): a thin 1px underline drawing in left→right, receding to the right on leave.
 *
 * Estuaire on ink fails contrast (≈1.4:1), so the dark footer never shifts to estuaire —
 * the roll accent is `cream` (see RollText `onDark`).
 */
export function FooterLink({
	label,
	href,
	variant = "nav",
	className,
}: {
	label: string;
	href: string;
	variant?: "nav" | "legal";
	className?: string;
}) {
	if (variant === "legal") {
		return (
			<Link
				href={href}
				className={cn(
					"group/line inline-block w-fit font-sans text-caption text-paper focus-visible:outline-none",
					className,
				)}
			>
				<LineText text={label} />
			</Link>
		);
	}
	return (
		<Link
			href={href}
			className={cn(
				"block w-fit rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper",
				className,
			)}
		>
			<RollText
				text={label}
				tone="onDark"
				className="font-display text-body font-semibold"
			/>
		</Link>
	);
}
