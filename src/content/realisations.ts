/**
 * Réalisations — taxonomie partagée (PAS de contenu d'études).
 *
 * Les listes contrôlées `UNIVERS` / `EXPERTISE_SLUGS` / `EXPERTISE_LABELS` sont consommées par le
 * **schéma** (`options.list` du champ `univers`) ET l'**UI de filtre** du portfolio — source unique
 * (Principe IX). Ce sont de la **taxonomie** (du code), pas du contenu éditorial.
 *
 * Le **contenu des réalisations** (collection dynamique) vit **directement dans Sanity** — éditeur-
 * first, assets au CDN Sanity, jamais dans git/`seed-assets/`, et NON seedé depuis git (frontière du
 * Principe IX, constitution v1.8.0 / [[decisions/0019-dynamic-content-in-sanity-and-mcp-write-access]]
 * + [[decisions/0020-realisations-collection-and-portfolio]]).
 */

// — Taxonomie « Univers » du portfolio : 12 secteurs-clients (FR-008). DISTINCTS des 4 macro-secteurs
//   de /univers (hors périmètre). Source unique : schéma `options.list` + libellés de filtre.
export const UNIVERS = [
	"Banque & assurance",
	"Culture",
	"Hôtellerie & restauration",
	"Joaillerie",
	"Mode",
	"Optique",
	"Parfums",
	"Résidentiel",
	"Soin & cosmétique",
	"Spiritueux",
	"Sport & lifestyle",
	"Technologie & communication",
] as const;
export type Univers = (typeof UNIVERS)[number];

// — Expertises : les 3 slugs des sous-pages d'expertise existantes (= cible de rattachement +
//   dimension de filtre). Listes contrôlées, pas des références (research D2).
export const EXPERTISE_SLUGS = [
	"agencement-sur-mesure",
	"mobiliers-sur-mesure",
	"presentoirs-sur-mesure",
] as const;
export type ExpertiseSlug = (typeof EXPERTISE_SLUGS)[number];

export const EXPERTISE_LABELS: Record<ExpertiseSlug, string> = {
	"agencement-sur-mesure": "Agencement sur mesure",
	"mobiliers-sur-mesure": "Mobiliers sur mesure",
	"presentoirs-sur-mesure": "Présentoirs sur mesure",
};
