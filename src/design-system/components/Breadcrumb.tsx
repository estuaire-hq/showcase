import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";

export type BreadcrumbItem = { label: string; href?: string };

/**
 * Breadcrumb (expertise sub-pages « 02/ SLIDER », e.g. « univers / agencement sur-mesure »).
 * A small `<nav>` of brand-cased segments separated by « / »; segments with an `href` are
 * links (hover underline), the last/plain one is the current page. Colour is inherited
 * (`currentColor`) so it adapts to its surface (white over the dark hero). Brand casse via
 * BrandText (lowercase → Montserrat Alternates). Presentational only (Principle VIII).
 */
export function Breadcrumb({
	items,
	className,
}: {
	items: BreadcrumbItem[];
	className?: string;
}) {
	if (items.length === 0) return null;
	return (
		<nav
			aria-label="Fil d'Ariane"
			className={cn(
				"font-display font-normal text-caption tracking-[-0.01em]",
				className,
			)}
		>
			<ol className="flex flex-wrap items-center gap-x-2.5">
				{items.map((item, i) => {
					const isLast = i === items.length - 1;
					return (
						<li key={item.label} className="flex items-center gap-x-2.5">
							{i > 0 && (
								<span aria-hidden className="opacity-70">
									/
								</span>
							)}
							{item.href && !isLast ? (
								<Link href={item.href} className="group relative">
									<BrandText>{item.label}</BrandText>
									<span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:origin-left group-hover:scale-x-100" />
								</Link>
							) : (
								<span aria-current={isLast ? "page" : undefined}>
									<BrandText>{item.label}</BrandText>
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
