"use client";

import { useEffect, useMemo, useState } from "react";
import {
	EXPERTISE_LABELS,
	type ExpertiseSlug,
	UNIVERS,
} from "@/content/realisations";
import {
	Button,
	Filter,
	RealisationGridCard,
	SubFilter,
} from "@/design-system";
import type { RealisationListItem } from "@/lib/sanity/realisation";
import { umamiAttrs } from "@/lib/utils";

// Navigateur du portfolio (US2) — composant CLIENT, reçoit toutes les réalisations en props (pas de
// fetch — Principe VIII). Filtrage en mémoire MONO-DIMENSION : une seule dimension est active à la
// fois (Univers OU Expertises OU Clients) ; changer de dimension réinitialise la sélection. Dans la
// dimension active, la multi-sélection combine les valeurs en OU. Aucune sélection ⇒ tout est
// affiché (plus de « TOUS » : l'état vide EST « tout »). Une valeur sélectionnée révèle une croix au
// survol et se retire au clic. Affichage progressif (6 + « charger d'autres »), états vides (contact
// / « revenez bientôt »). Filtre initial depuis l'URL (?univers= / ?expertise=) pour les deep-links
// home & expertises (D4). Barre de filtres d'après la maquette `portfolio` 51:4064 (FILTRES NIV1 +
// sous-filtres en 3 col.).

const PAGE = 6;
type Dimension = "univers" | "expertises" | "clients";

export function RealisationsBrowser({
	items,
}: {
	items: RealisationListItem[];
}) {
	// Mono-dimension: at most one dimension is active; `selected` holds the OR-combined values
	// picked within it. Switching dimension clears the selection (see `selectDimension`).
	const [activeDimension, setActiveDimension] = useState<Dimension | null>(
		null,
	);
	const [selected, setSelected] = useState<string[]>([]);
	const [shown, setShown] = useState(PAGE);

	// Deep-link initial filter read from the URL AFTER mount (?univers= / ?expertise=), so the
	// list page stays statically prerendered (no server-side `searchParams` read → no per-visit
	// Sanity request). Home & expertise sub-pages link here with a pre-selected filter, always a
	// single value on a single dimension → mapped onto the mono-dimension model. Reading in an
	// effect (rather than `useSearchParams`) keeps the initial render identical on server and
	// client → no hydration mismatch and no Suspense boundary; the filter applies one frame later.
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const u = params.get("univers");
		if (u && (UNIVERS as readonly string[]).includes(u)) {
			setActiveDimension("univers");
			setSelected([u]);
			return;
		}
		const e = params.get("expertise");
		if (e && EXPERTISE_LABELS[e as ExpertiseSlug]) {
			setActiveDimension("expertises");
			setSelected([e]);
		}
	}, []);

	const clients = useMemo(
		() =>
			Array.from(new Set(items.map((i) => i.client).filter(Boolean))).sort(
				(a, b) => a.localeCompare(b, "fr"),
			),
		[items],
	);

	const hasFilter = activeDimension !== null && selected.length > 0;

	// Unfiltered: published + upcoming (upcoming greyed). Filtered (FR-013): published only.
	// Within the active dimension the selected values combine as an OR.
	const filtered = useMemo(() => {
		if (!hasFilter) return items;
		const published = items.filter((i) => i.status === "published");
		return published.filter((i) => {
			if (activeDimension === "univers")
				return i.univers !== null && selected.includes(i.univers);
			if (activeDimension === "expertises")
				return i.expertises.some((e) => selected.includes(e));
			return selected.includes(i.client); // clients
		});
	}, [items, hasFilter, activeDimension, selected]);

	const visible = filtered.slice(0, shown);
	const resetPaging = () => setShown(PAGE);

	// Switching to another dimension resets the selection (mono-dimension). Re-clicking the active
	// tab is a no-op: the panel stays open, clearing is done by deselecting the values.
	const selectDimension = (dim: Dimension) => {
		if (dim === activeDimension) return;
		setActiveDimension(dim);
		setSelected([]);
		resetPaging();
	};

	const toggleValue = (value: string) => {
		setSelected((cur) =>
			cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
		);
		resetPaging();
	};

	// « revenez bientôt » : dimension Univers ciblée, mais aucun des univers sélectionnés n'a de
	// réalisation publiée (FR-015).
	const universHasNoPublished =
		activeDimension === "univers" &&
		selected.length > 0 &&
		!items.some(
			(i) =>
				i.status === "published" &&
				i.univers !== null &&
				selected.includes(i.univers),
		);

	// Sous-filtres de la dimension active (kit « FILTRES » : valeurs en 3 colonnes, sans « TOUS »).
	const UMAMI_DIM: Record<Dimension, string> = {
		univers: "univers",
		expertises: "expertise",
		clients: "client",
	};
	const options: { label: string; value: string }[] =
		activeDimension === "univers"
			? UNIVERS.map((u) => ({ label: u, value: u }))
			: activeDimension === "expertises"
				? (Object.keys(EXPERTISE_LABELS) as ExpertiseSlug[]).map((s) => ({
						label: EXPERTISE_LABELS[s],
						value: s,
					}))
				: activeDimension === "clients"
					? clients.map((c) => ({ label: c, value: c }))
					: [];
	// Rows of the sm+ 3-column layout — the empty gutter cell spans them so the option chips stay
	// aligned under the three dimension tabs (mirrors the old « TOUS » cell placement).
	const optionRows = Math.max(1, Math.ceil(options.length / 3));

	return (
		<div className="flex flex-col gap-10 lg:gap-14">
			{/* Barre de filtres (kit « FILTRES » : label + 3 onglets, sous-filtres en grille alignée). */}
			<div className="flex flex-col gap-3 lg:gap-4">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,0.72fr)_repeat(3,minmax(0,1fr))] sm:items-center lg:gap-4">
					<span className="col-span-2 font-display font-semibold text-body text-ink sm:col-span-1 sm:text-center">
						Filtres
					</span>
					<Filter
						label="Univers"
						selected={activeDimension === "univers"}
						onClick={() => selectDimension("univers")}
					/>
					<Filter
						label="Expertises"
						selected={activeDimension === "expertises"}
						onClick={() => selectDimension("expertises")}
					/>
					<Filter
						label="Clients"
						selected={activeDimension === "clients"}
						onClick={() => selectDimension("clients")}
					/>
				</div>

				{activeDimension && (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,0.72fr)_repeat(3,minmax(0,1fr))] lg:gap-4">
						<div
							aria-hidden
							className="hidden sm:block"
							style={{ gridRow: `span ${optionRows}` }}
						/>
						{options.map((o) => (
							<SubFilter
								key={o.value}
								label={o.label}
								selected={selected.includes(o.value)}
								onClick={() => toggleValue(o.value)}
								{...umamiAttrs("realisation_filter", {
									dimension: UMAMI_DIM[activeDimension],
									value: o.value,
								})}
							/>
						))}
					</div>
				)}
			</div>

			{/* Résultats */}
			{visible.length > 0 ? (
				<>
					<ul className="grid gap-6 lg:grid-cols-2 lg:gap-8">
						{visible.map((item) => (
							<li key={item.slug}>
								<BrowserCard item={item} />
							</li>
						))}
					</ul>
					{shown < filtered.length && (
						<div className="flex justify-center">
							<Button
								tone="dark"
								arrow={false}
								className="w-full max-w-[536px]"
								onClick={() => setShown((s) => s + PAGE)}
								{...umamiAttrs("realisation_load_more", {
									shown: String(shown + PAGE),
								})}
							>
								Charger d'autres réalisations
							</Button>
						</div>
					)}
				</>
			) : universHasNoPublished ? (
				<EmptyState
					title="Revenez bientôt"
					body="Nous n'avons pas encore de réalisation publiée pour cet univers. De nouveaux projets arrivent très prochainement."
				/>
			) : (
				<EmptyState
					title="Aucune réalisation ne correspond"
					body="Aucun projet ne correspond à cette combinaison de filtres. Parlons de votre projet, nous serions ravis d'en discuter."
					contact
				/>
			)}
		</div>
	);
}

/** A grid card — clickable when published, greyed & inert when « à venir » (FR-017). */
function BrowserCard({ item }: { item: RealisationListItem }) {
	if (item.status === "upcoming") {
		return (
			<div className="relative">
				<div className="pointer-events-none opacity-50 grayscale">
					<RealisationGridCard
						image={item.cover?.src ?? ""}
						alt={item.cover?.alt ?? item.title}
						title={item.title}
						meta={item.meta}
					/>
				</div>
				<span className="absolute top-4 left-4 rounded-full bg-ink px-4 py-2 font-display font-semibold text-caption text-paper">
					À venir
				</span>
			</div>
		);
	}
	return (
		<div {...umamiAttrs("realisation_card_open", { slug: item.slug })}>
			<RealisationGridCard
				image={item.cover?.src ?? ""}
				alt={item.cover?.alt ?? item.title}
				title={item.title}
				meta={item.meta}
				href={item.href}
			/>
		</div>
	);
}

function EmptyState({
	title,
	body,
	contact = false,
}: {
	title: string;
	body: string;
	contact?: boolean;
}) {
	return (
		<div className="flex flex-col items-center gap-6 py-16 text-center">
			<h3 className="font-display font-semibold text-subtitle-sm text-ink lg:text-subtitle">
				{title}
			</h3>
			<p className="max-w-[52ch] text-body-sm text-ink leading-relaxed lg:text-body">
				{body}
			</p>
			{contact && (
				<Button
					tone="dark"
					href="/contact"
					className="max-w-[536px]"
					{...umamiAttrs("realisation_empty_contact", {})}
				>
					Contactez-nous
				</Button>
			)}
		</div>
	);
}
