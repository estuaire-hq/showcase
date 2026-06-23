# Data Model — Réalisations

Phase 1 du plan. Définit le type Sanity `realisation` (source de vérité du modèle, Principe IX), les
types dérivés (TypeGen), et le contenu partagé. Les champs reprennent les conventions des schémas
existants (`imageField` partagé, groups par section, `text` multi-lignes, arrays d'objets avec
discriminateur `_type`, slug-based identity).

> **⚠️ Réalignement v1.8.0 (ADR 0019/0020)** : le **schéma + les types dérivés** ci-dessous restent
> valables. En revanche la section « Contenu partagé » (records `realisationsContent` + type
> `RealisationContent`, seed git) est **caduque** — les réalisations sont une **collection dynamique**
> qui vit **dans Sanity** (non seedée depuis git). `src/content/realisations.ts` ne garde plus que la
> **taxonomie** (`UNIVERS`/`EXPERTISE_*`). Voir ADR 0020 § « Mise à jour ».

---

## Entité : `realisation` (document, collection)

`defineType({ name: "realisation", type: "document", icon: …, groups: […], fields: […] })`
enregistré dans `src/sanity/schemas/index.ts` et listé via `documentTypeList("realisation")`.

### Groups (onglets Studio)

`identity` (défaut) · `classification` · `infos` · `narrative` · `media` · `seo`

### Champs

| Champ | Type | Requis | Group | Règles / notes |
|---|---|:--:|---|---|
| `title` | `string` | ✅ | identity | Nom du **projet** (≠ client). Affiché en titre, carte, fil d'ariane. |
| `slug` | `slug` | ✅ | identity | `options.source: "title"`, unique. URL `/realisations/<slug>`. Accents/apostrophes → slug propre (edge case). |
| `client` | `string` | ✅ | identity | Nom du **client**, distinct du titre, éditable (FR-002). |
| `status` | `string` | ✅ | identity | Liste radio `published`/`upcoming`/`draft`. `initialValue:"draft"`. Voir research D3. |
| `order` | `number` | — | identity | Ordonnancement « plus récent » (tri `desc`). Pré-rempli au seed. Voir D12. |
| `publishedAt` | `datetime` | — | identity | Optionnel ; départage à `order` égal. |
| `univers` | `string` | ✅ | classification | `options.list` = `UNIVERS` (12, importé de `@/content/realisations`). **Exactement un** (FR-003). |
| `expertises` | `array<string>` | ✅ | classification | `options.list` = 3 slugs d'expertise. ≥ 1 (FR-003). Voir D2. |
| `location` | `string` | — | infos | Lieu. Masqué si vide (FR-004). |
| `year` | `string` | — | infos | Année. Masqué si vide. |
| `area` | `string` | — | infos | Superficie (ex. « 320 m² »). Masqué si vide. |
| `layout` | `string` | ✅ | media | Liste radio `fournie`/`legere`. `initialValue:"legere"`. Voir D5. |
| `cover` | `image` (`imageField`) | ✅ | media | Image principale (carte + featured). |
| `gallery` | `array<image>` | — | media | Galerie ordonnée (2→26). `imageField`-like membre image. Voir D6. |
| `context` | `text` | ✅ | narrative | Contexte (intro). |
| `enjeu` | `text` | ✅ | narrative | Enjeu (intro). |
| `interventions` | `array<string>` | — | narrative | « Nos missions ». |
| `challenges` | `array<object{title,body}>` | — | narrative | « Défis relevés », `validation.max(3)`. Objet `name:"challenge"`, `title:string(req)`, `body:text(req)`. |
| `skills` | `array<string>` | — | narrative | Savoir-faire mobilisés → pastilles `Pill`. |
| `photoCredit` | `string` | — | narrative | Crédit photo optionnel. Rendu **entre** dernier défi et savoir-faire (FR-019). Masqué si absent. |
| `seoMetaTitle` | `string` | — | seo | Repli : `title`. Template `%s | Estuaire`. |
| `seoMetaDescription` | `text` | — | seo | — |
| `seoOgImage` | `image` | — | seo | Repli au build : `cover`. |

`preview`: `select: { title, subtitle: "client", media: "cover" }` →
`prepare`: titre = `title`, sous-titre = `status` + `/realisations/<slug>`.

### Objet imbriqué `challenge`

```
defineArrayMember({ type:"object", name:"challenge", title:"Défi",
  fields: [ title:string (required), body:text rows:4 (required) ],
  preview: { select:{ title:"title", subtitle:"body" } } })
```

### Règles & invariants (issus des FR)

- `status` pilote la visibilité (D3) : aucune fuite d'« à venir »/« brouillon » sur les surfaces
  publiées (détail, plus-récentes, demock).
- `slug` unique, sans point dans l'`_id` (`realisation-<slug>`, post-mortem 0010).
- `challenges` : 1 à 3 (max 3) — la section s'adapte au nombre réel (edge cases).
- Tous les visuels via `mapImage` → repli neutre si asset manquant (jamais cassé).
- Champs `infos` (location/year/area) et `photoCredit` : rendus **uniquement si renseignés**.

---

## Types dérivés (TypeGen — jamais tapés à la main, Principe IX)

Après écriture du schéma : `npm run typegen` régénère `src/sanity.types.ts` (commité). On consomme :

- `Realisation` — type du document (pour le seed `defineSeed<Realisation>` et le builder).
- `REALISATIONS_LIST_QUERYResult`, `REALISATION_QUERYResult`,
  `REALISATION_SLUGS_QUERYResult`, `LATEST_REALISATIONS_QUERYResult`,
  `EXPERTISE_LATEST_REALISATION_QUERYResult` — types des résultats GROQ (générés depuis `defineQuery`).

Le connecteur `src/lib/sanity/realisation.ts` mappe ces résultats vers des props DS via `mapImage`
(comme `sectorDetail.ts`), et expose des types `RealisationListItem`, `RealisationDetailProps`
dérivés de `Awaited<ReturnType<…>>` (pas de duplication de la forme du schéma).

---

## Contenu partagé — `src/content/realisations.ts` (source unique)

Rôle double (Principe IX, valeurs en un seul endroit) : taxonomie (consommée par le **schéma** et
l'**UI de filtre**) + données seed des 23 études (consommées par le **builder de seed**).

```ts
// — Taxonomie (source unique : schéma options.list + libellés UI) —
export const UNIVERS = [
  "Banque & assurance", "Culture", "Hôtellerie & restauration", "Joaillerie",
  "Mode", "Optique", "Parfums", "Résidentiel", "Soin & cosmétique",
  "Spiritueux", "Sport & lifestyle", "Technologie & communication",
] as const;                       // FR-008
export type Univers = (typeof UNIVERS)[number];

export const EXPERTISE_SLUGS = [
  "agencement-sur-mesure", "mobiliers-sur-mesure", "presentoirs-sur-mesure",
] as const;                       // = slugs des expertiseSubpage (D2)
export type ExpertiseSlug = (typeof EXPERTISE_SLUGS)[number];
export const EXPERTISE_LABELS: Record<ExpertiseSlug, string> = { /* libellés filtre */ };

export type RealisationLayout = "fournie" | "legere";
export type RealisationStatus = "published" | "upcoming" | "draft";

// — Données seed (les 23 études) : forme neutre consommée par realisation.build.ts —
export type RealisationContent = {
  slug: string; title: string; client: string;
  status: RealisationStatus; order: number;
  univers: Univers; expertises: ExpertiseSlug[];
  location?: string; year?: string; area?: string;
  layout: RealisationLayout;                       // pré-réglé depuis le nb de photos (D5)
  context: string; enjeu: string;
  interventions: string[];
  challenges: { title: string; body: string }[];   // 1→3
  skills: string[];
  photoCredit?: string;
  galleryCount: number;                            // nb de fichiers seed-assets/<slug>/ (binding au build)
};
export const realisationsContent: RealisationContent[] = [ /* 23 entrées depuis le pptx client */ ];
```

> Note Principe IX : la collection n'a **pas** de repli front par slug (un slug absent → `notFound`),
> donc `realisationsContent` sert **uniquement** le seed (pas de duplication seed↔fallback). La
> taxonomie (`UNIVERS`, `EXPERTISE_*`) est en revanche partagée schéma + UI.

---

## États de contenu au seed (les 23 études)

| État | Documents (n° pptx, univers) | Comportement |
|---|---|---|
| **published** (21) | les 21 à contenu complet | liste cliquable + détail |
| **upcoming** (2) | Cambaceres (2, Banque & assurance) · Ibis (9, Hôtellerie & restauration) | grisé non cliquable, pas de détail |
| **draft** (2) | Bureaux Lumière (24) · Bureaux Publicis (25) | invisibles publiquement |

Rattachement `expertises` pré-rempli par heuristique (agencement = quasi tous ; mobiliers = projets
centrés objet/mobilier ; présentoirs = PLV/portants), confirmé par les featured actuels des
sous-pages (agencement→L'artisan parfumeur, mobiliers→Citadium, présentoirs→Distillerie Générale),
ajustable dans le Studio (FR-029).

---

## Relations

```
realisation.univers      → 1 valeur de UNIVERS (12, liste contrôlée, pas de doc support)
realisation.expertises[] → N slugs ∈ EXPERTISE_SLUGS (= slugs des expertiseSubpage, sans référence)
realisation              → consommée par : /realisations (liste), /realisations/[slug] (détail),
                            home (3 + boutons), expertises/[expertise] (latest par expertise)
```
