"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { CloseIcon } from "./CloseIcon";
import { ContactButton } from "./ContactButton";
import { NavButton } from "./NavButton";

/**
 * Full-screen mobile/tablet navigation panel (presentational, props only). Layout +
 * values read losslessly from Figma "MENU pop-up" (nodes 77:3630 / 87:5893): a
 * 90%-opaque ink backdrop, a close cross top-right (where the toggle sat), the
 * entries stacked + centred (gap 20, white = onDark), the CTA (`bleu`), and the logo
 * centred below them.
 *
 * The wrapper owns focus-trap / scroll-lock / background `inert` — this component
 * only provides the markup, the `id` (matches the toggle's `aria-controls`), the
 * close affordance and `onSelect` (FR-008/009/011). Always mounted so the fade can
 * play; closed = transparent + `inert` + non-interactive. `reducedMotion` → instant.
 */
export function NavPanel({
	ref,
	id,
	isOpen,
	onClose,
	items,
	cta,
	brandHref,
	logo,
	activeHref,
	onSelect,
	reducedMotion = false,
}: {
	/** Root ref — the wrapper points its focus trap at the panel (React 19 ref-as-prop). */
	ref?: React.Ref<HTMLDivElement>;
	id: string;
	isOpen: boolean;
	onClose: () => void;
	items: {
		label: string;
		href: string;
		children?: { label: string; href: string }[];
	}[];
	cta: { label: string; href: string };
	brandHref: string;
	logo?: React.ReactNode;
	activeHref?: string;
	/** Called when an entry is selected — the wrapper navigates then closes (FR-010). */
	onSelect?: (href: string) => void;
	reducedMotion?: boolean;
}) {
	return (
		<div
			ref={ref}
			id={id}
			role="dialog"
			aria-modal="true"
			aria-label="Menu de navigation"
			// Mounted always (fade); inert + hidden from AT when closed.
			inert={!isOpen}
			aria-hidden={!isOpen}
			className={cn(
				"fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink/90 lg:hidden",
				!reducedMotion && "transition-opacity duration-300 ease-out",
				isOpen ? "opacity-100" : "pointer-events-none opacity-0",
			)}
		>
			{/* Close cross — top-right, aligned with the (reduced) header band height. */}
			<div className="flex h-20 shrink-0 items-center justify-end px-5 md:px-10">
				<button
					type="button"
					onClick={onClose}
					aria-label="Fermer le menu"
					className="inline-flex size-11 items-center justify-center rounded-full text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire"
				>
					<CloseIcon />
				</button>
			</div>

			{/* Entries — stacked, centred, gap 20 (pitch 60). White ghost pills (onDark).
			    Entries with sub-pages (expertises / univers) list their children just below,
			    indented and smaller (client request, revue 2026-06, B2/B3). */}
			<nav
				aria-label="Navigation principale"
				className="flex flex-col items-center gap-5"
			>
				{items.map((item) => (
					<div key={item.href} className="flex flex-col items-center gap-2">
						<NavButton
							label={item.label}
							href={item.href}
							tone="onDark"
							active={activeHref === item.href}
							onClick={() => onSelect?.(item.href)}
						/>
						{item.children && item.children.length > 0 && (
							<ul className="flex flex-col items-center gap-1.5">
								{item.children.map((child) => (
									<li key={child.href}>
										<Link
											href={child.href}
											onClick={() => onSelect?.(child.href)}
											aria-current={
												activeHref === child.href ? "page" : undefined
											}
											className={cn(
												"font-display text-caption lowercase leading-none text-paper/70 transition-colors hover:text-paper focus-visible:text-paper focus-visible:outline-none",
												activeHref === child.href && "font-semibold text-paper",
											)}
										>
											{child.label}
										</Link>
									</li>
								))}
							</ul>
						)}
					</div>
				))}
				<ContactButton
					label={cta.label}
					href={cta.href}
					tone="bleu"
					active={activeHref === cta.href}
					onClick={() => onSelect?.(cta.href)}
				/>
			</nav>

			{/* Logo — centred, below the entries (node `logo_header` @ y≈467 → ~62px gap). */}
			<Link
				href={brandHref}
				onClick={() => onSelect?.(brandHref)}
				aria-label="Estuaire — accueil"
				className="mt-[62px] flex justify-center text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire"
			>
				{logo ?? <BrandLogo />}
			</Link>
		</div>
	);
}
