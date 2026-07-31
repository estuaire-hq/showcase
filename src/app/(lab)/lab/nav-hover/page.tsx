import Link from "next/link";
import { navigation } from "@/content/navigation";
import { LineText } from "@/design-system";
import { cn } from "@/lib/utils";

// Lab playground (noindex): settling the nav's hover + current-page treatments.
//
// Settled with the owner:
//  - current page → a DOT 8px below the baseline, plus the label in BOLD.
//  - hover        → the word lifts, and the line draws.
//
// The line is `LineText`, the project's existing primitive (ADR 0021 D3, restored on main by
// #45): a 1px `bg-current` bar that draws left→right on hover AND on `:focus-visible`, then
// recedes to the right on leave, timed by `--duration-line` on `ease-expo`. It replaces the
// hand-rolled rule this page used before, which was both redundant and worse (no keyboard
// focus, and a px offset instead of `em`, so it did not follow the type size). Contract: the
// host element MUST carry `group/line`.
//
// Resolved (variant B): the current page's link is inert, so the two markers can never
// stack. And the LIFT moves the link's CONTENT, not the link itself, so the hit area stays
// still (a moving hit area made the hover oscillate along the bottom edge).
//
// THE CONFLICT this page resolves: on the CURRENT page's link, hovering stacked two markers
// under one word, the line at ~0.15em and the dot at 8px, five pixels apart. Treating them as
// the same register is the mistake: the line is an invitation to click, the dot is a state. The
// current page's link is a no-op (you are already there), so it needs no click affordance at
// all. The variants below differ only in how far to take that.
//
// Both effects paint in `currentColor`, so they follow the measured tone (ADR 0029).

/** Settled: the dot sits 8px below the baseline. */
const DOT_OFFSET = "-bottom-2";

function NavRow({ tone }: { tone: "onLight" | "onDark" }) {
	const activeHref = "/univers";
	return (
		<div
			className={cn(
				"flex items-center justify-end px-8 py-7",
				tone === "onDark" ? "bg-ink" : "bg-paper",
			)}
		>
			<nav>
				<ul className="flex items-center gap-[15px]">
					{navigation.items.map((item) => {
						// Owner's pick (variant B): the current page's link is INERT. It is a
						// no-op, so it gets neither the line nor the lift, only the dot + bold.
						const isActive = item.href === activeHref;
						return (
							<li key={item.href}>
								<Link
									href="#"
									aria-current={isActive ? "page" : undefined}
									className={cn(
										// The HIT AREA. It must NOT move: if the link itself lifted, a pointer
										// resting near its bottom edge would fall outside as the word rose, the
										// hover would drop, the word would come back down, and the whole thing
										// would oscillate. So the box stays put and only its CONTENT moves.
										// `group/line` is here because LineText keys off hover AND
										// focus-visible on this element.
										"group/line relative inline-block rounded-sm font-display text-caption lowercase leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estuaire",
										tone === "onDark" ? "text-paper" : "text-ink",
										isActive && "font-semibold",
									)}
								>
									{isActive ? (
										item.label
									) : (
										// The moving part: the word plus its line, lifted together.
										// `transition-[translate]` targets exactly the property Tailwind v4
										// writes for `-translate-y-*`. (`transition-transform` would work too:
										// in v4 it expands to `transform, translate, scale, rotate`. What DID
										// break the animation here was `--duration-line` missing from the
										// compiled CSS until the dev server was restarted, since Turbopack does
										// not recompile a `@theme` change live.)
										<span className="inline-block transition-[translate] duration-(--duration-line) ease-expo group-hover/line:-translate-y-0.5 motion-reduce:transition-none">
											<LineText text={item.label} />
										</span>
									)}
									{isActive && (
										<span
											aria-hidden
											className={cn(
												"absolute left-1/2 size-1 -translate-x-1/2 rounded-full bg-current",
												DOT_OFFSET,
											)}
										/>
									)}
								</Link>
							</li>
						);
					})}
					<li>
						{/* The CTA stays a filled pill: it is a button by design. */}
						<span
							className={cn(
								"inline-flex h-10 items-center justify-center rounded-full px-[18px] font-display text-caption lowercase leading-none",
								tone === "onDark"
									? "bg-paper text-ink"
									: "bg-estuaire text-paper",
							)}
						>
							{navigation.cta.label}
						</span>
					</li>
				</ul>
			</nav>
		</div>
	);
}

export default function NavHoverLabPage() {
	return (
		<main className="mx-auto max-w-[1100px] px-6 py-16">
			<h1 className="font-display font-semibold text-title-sm text-ink">
				Nav : survol et page courante
			</h1>
			<div className="mt-4 max-w-[72ch] space-y-3 text-body-sm text-ink/70">
				<p>
					<strong>Retenu</strong> : page courante = point à 8px + texte en gras
					; survol = le mot monte et le trait se dessine. Le trait est{" "}
					<code className="text-caption">LineText</code>, la primitive déjà en
					place sur le footer et le mailto (ADR 0021 D3), donc le même effet que
					le reste du site, focus clavier compris.
				</p>
				<p>
					<strong>Conflit trait / point résolu</strong> : l'entrée de la page
					courante est <strong>inerte</strong>, ni trait ni montée. Elle est un
					no-op, donc elle porte un état (le point) et aucune invitation à
					cliquer. Deux marqueurs ne peuvent plus se superposer.
				</p>
			</div>

			<section className="border-ink/10 border-t py-8">
				<h2 className="font-display font-semibold text-body-sm text-ink">
					Réglage retenu
				</h2>
				<p className="mt-1 max-w-[72ch] text-caption text-ink/60">
					Survolez un lien : le mot monte et le trait se dessine. Survolez «
					univers » (page courante) : rien ne bouge. Passez la souris le long du
					bord bas d'un lien : la zone de survol ne bouge pas, donc pas
					d'oscillation.
				</p>
				<div className="mt-4 grid gap-px overflow-hidden rounded-lg ring-1 ring-ink/10">
					<NavRow tone="onLight" />
					<NavRow tone="onDark" />
				</div>
			</section>
		</main>
	);
}
