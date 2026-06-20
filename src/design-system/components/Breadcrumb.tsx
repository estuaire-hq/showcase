import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandText } from "../typography/BrandText";

/**
 * Breadcrumb — « univers / <Secteur> » (sector hero) and « univers / <expertise> sur-mesure »
 * (expertise sub-page hero), node @140,152, Montserrat Alternates 400 16px, paper over the
 * dark hero. Presentational only (Principle VIII); colour is inherited (`currentColor`) so it
 * adapts to its surface — set it on a parent (paper in the dark hero). The last item is the
 * current page; any earlier item with an `href` is a link back (e.g. « univers » → `/univers`,
 * « univers » → `/expertises` for the expertise sub-pages).
 */
export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({
	items,
	separator = "/",
	className,
}: {
	items: BreadcrumbItem[];
	separator?: string;
	className?: string;
}) {
	if (items.length === 0) return null;
	return (
		<nav
			aria-label="Fil d'ariane"
			className={cn(
				"flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-caption",
				className,
			)}
		>
			{items.map((item, i) => {
				const isLast = i === items.length - 1;
				return (
					<span
						key={item.href ?? item.label}
						className="flex items-center gap-x-3"
					>
						{i > 0 && (
							<span aria-hidden className="opacity-80">
								{separator}
							</span>
						)}
						{item.href && !isLast ? (
							<Link
								href={item.href}
								className="transition-opacity hover:opacity-70 focus-visible:underline focus-visible:outline-none"
							>
								<BrandText>{item.label}</BrandText>
							</Link>
						) : (
							<span aria-current={isLast ? "page" : undefined}>
								<BrandText>{item.label}</BrandText>
							</span>
						)}
					</span>
				);
			})}
		</nav>
	);
}
