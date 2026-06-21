"use client";

import { useMemo, useState } from "react";
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
// fetch — Principe VIII). Filtrage en mémoire par Univers · Expertises · Clients (combinés en ET),
// affichage progressif (6 + « charger d'autres »), états vides (contact / « revenez bientôt »).
// Filtre initial depuis l'URL (?univers= / ?expertise=) pour les deep-links home & expertises (D4).
// Barre de filtres d'après la maquette `portfolio` 51:4064 (FILTRES NIV1 + sous-filtres « Tous … »
// + valeurs en 3 col.). Revue pixel-perfect desktop OK (T030) ; restent le chevron d'onglet fermé
// et le responsive tablette/mobile (UNVERIFIED — pas de render Figma).

const PAGE = 6;
type Dimension = "univers" | "expertises" | "clients";

export function RealisationsBrowser({
	items,
	initialUnivers,
	initialExpertise,
}: {
	items: RealisationListItem[];
	initialUnivers?: string;
	initialExpertise?: string;
}) {
	const [univers, setUnivers] = useState<string | null>(
		initialUnivers && (UNIVERS as readonly string[]).includes(initialUnivers)
			? initialUnivers
			: null,
	);
	const [expertise, setExpertise] = useState<string | null>(
		initialExpertise && EXPERTISE_LABELS[initialExpertise as ExpertiseSlug]
			? initialExpertise
			: null,
	);
	const [client, setClient] = useState<string | null>(null);
	const [open, setOpen] = useState<Dimension | null>(null);
	const [shown, setShown] = useState(PAGE);

	const clients = useMemo(
		() =>
			Array.from(new Set(items.map((i) => i.client).filter(Boolean))).sort(
				(a, b) => a.localeCompare(b, "fr"),
			),
		[items],
	);

	const hasFilter = univers !== null || expertise !== null || client !== null;

	// Unfiltered: published + upcoming (upcoming greyed). Filtered (FR-013): published only.
	const filtered = useMemo(() => {
		const base = hasFilter
			? items.filter((i) => i.status === "published")
			: items;
		return base.filter(
			(i) =>
				(univers === null || i.univers === univers) &&
				(expertise === null || i.expertises.includes(expertise)) &&
				(client === null || i.client === client),
		);
	}, [items, hasFilter, univers, expertise, client]);

	const visible = filtered.slice(0, shown);
	const resetPaging = () => setShown(PAGE);

	const select = (dim: Dimension, value: string | null) => {
		if (dim === "univers") setUnivers(value);
		if (dim === "expertises") setExpertise(value);
		if (dim === "clients") setClient(value);
		resetPaging();
	};

	const toggleOpen = (dim: Dimension) =>
		setOpen((cur) => (cur === dim ? null : dim));

	// « revenez bientôt » : un univers ciblé sans aucune réalisation publiée (FR-015).
	const universHasNoPublished =
		univers !== null &&
		!items.some((i) => i.status === "published" && i.univers === univers);

	// Sous-filtres de la dimension ouverte (kit « FILTRES » : « Tous … » à gauche + valeurs en 3 col.).
	const TOUS_LABEL: Record<Dimension, string> = {
		univers: "Tous les univers",
		expertises: "Toutes les expertises",
		clients: "Tous les clients",
	};
	const UMAMI_DIM: Record<Dimension, string> = {
		univers: "univers",
		expertises: "expertise",
		clients: "client",
	};
	const options: { label: string; value: string }[] =
		open === "univers"
			? UNIVERS.map((u) => ({ label: u, value: u }))
			: open === "expertises"
				? (Object.keys(EXPERTISE_LABELS) as ExpertiseSlug[]).map((s) => ({
						label: EXPERTISE_LABELS[s],
						value: s,
					}))
				: open === "clients"
					? clients.map((c) => ({ label: c, value: c }))
					: [];
	const activeValue =
		open === "univers" ? univers : open === "expertises" ? expertise : client;
	const tousRows = Math.max(1, Math.ceil(options.length / 3));

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
						selected={open === "univers" || univers !== null}
						onClick={() => toggleOpen("univers")}
					/>
					<Filter
						label="Expertises"
						selected={open === "expertises" || expertise !== null}
						onClick={() => toggleOpen("expertises")}
					/>
					<Filter
						label="Clients"
						selected={open === "clients" || client !== null}
						onClick={() => toggleOpen("clients")}
					/>
				</div>

				{open && (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,0.72fr)_repeat(3,minmax(0,1fr))] lg:gap-4">
						<SubFilter
							label={TOUS_LABEL[open]}
							selected={activeValue === null}
							onClick={() => select(open, null)}
							className="h-full min-h-[61px]"
							style={{ gridRow: `span ${tousRows}` }}
						/>
						{options.map((o) => (
							<SubFilter
								key={o.value}
								label={o.label}
								selected={activeValue === o.value}
								onClick={() => select(open, o.value)}
								{...umamiAttrs("realisation_filter", {
									dimension: UMAMI_DIM[open],
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
