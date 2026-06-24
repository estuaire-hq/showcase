import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import type { NavTone } from "../nav";
import { NavButton } from "./NavButton";

type SubItem = { label: string; href: string };

/**
 * Desktop nav entry WITH a dropdown (kit nav, extended for the client request to surface
 * the expertises / univers sub-pages from the navbar — revue 2026-06, B2/B3). The trigger is
 * the usual ghost-pill `NavButton` linking to the hub page; a panel of sub-links reveals
 * below it on hover / keyboard focus.
 *
 * The reveal is pure CSS (`group-hover` + `group-focus-within`) — no JS state, SSR-safe, and
 * keyboard-reachable (tabbing into a sub-link keeps the panel open via focus-within). The
 * panel is always a solid paper surface so it stays legible over any header tone (transparent
 * over the hero, opaque when pinned). `pt-3` keeps the trigger→panel hover bridge gap-free.
 */
export function NavDropdown({
	label,
	href,
	items,
	tone,
	active,
	activeHref,
	onSelect,
}: {
	label: string;
	href: string;
	items: SubItem[];
	tone?: NavTone;
	active?: boolean;
	activeHref?: string;
	onSelect?: (href: string) => void;
}) {
	const handle =
		(href: string): MouseEventHandler<HTMLElement> =>
		() =>
			onSelect?.(href);
	return (
		<div className="group relative">
			<NavButton
				label={label}
				href={href}
				tone={tone}
				active={active}
				onClick={handle(href)}
			/>
			<div className="invisible absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-200 ease-out group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
				<ul className="min-w-[208px] rounded-2xl bg-paper p-2 shadow-[0_12px_32px_rgba(14,18,21,0.16)] ring-1 ring-ink/10">
					{items.map((item) => {
						const current = activeHref === item.href;
						return (
							<li key={item.href}>
								{/* Hover affordance BEYOND a subtle blue text (estuaire sits close to ink):
								    a full estuaire fill with paper text — same treatment as the portfolio
								    Filter/SubFilter chips, clean and unmistakably interactive (client
								    review 2026-06). */}
								<Link
									href={item.href}
									onClick={handle(item.href)}
									aria-current={current ? "page" : undefined}
									className={cn(
										"block rounded-xl px-5 py-2.5 text-center font-display text-caption lowercase leading-none text-ink transition-colors duration-200 hover:bg-estuaire hover:text-paper focus-visible:bg-estuaire focus-visible:text-paper focus-visible:outline-none",
										current && "font-semibold",
									)}
								>
									{item.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
