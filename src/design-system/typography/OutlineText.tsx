import { cn } from "@/lib/utils";
import { outlineStroke } from "../tokens";
import { BrandText } from "./BrandText";

type Tier = keyof typeof outlineStroke;

/**
 * Outline / contour text — the kit's signature title device (e.g. the slider
 * « Là où les / idées prennent », the « Nous sommes » intro). The glyphs are
 * drawn as a stroke with a transparent fill. The stroke colour follows the
 * surrounding text colour (`currentColor`) so it adapts to light/dark sections;
 * the stroke width comes from the specimen per display tier (2px title/display,
 * 1px subtitle). Content still follows the brand casse rule via BrandText.
 *
 * NOTE: Figma uses strokeAlign OUTSIDE; CSS `-webkit-text-stroke` is centred —
 * a faithful approximation at these thin widths.
 */
export function OutlineText({
	children,
	tier = "title",
	width,
	className,
}: {
	children: string;
	/** Display tier → stroke width from the kit specimen. */
	tier?: Tier;
	/** Explicit stroke width in px (overrides the tier default). */
	width?: number;
	className?: string;
}) {
	return (
		<span
			className={cn(className)}
			style={{
				WebkitTextStrokeWidth: `${width ?? outlineStroke[tier]}px`,
				WebkitTextStrokeColor: "currentColor",
				WebkitTextFillColor: "transparent",
			}}
		>
			<BrandText>{children}</BrandText>
		</span>
	);
}
