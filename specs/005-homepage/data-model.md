# Phase 1 — Modèle de données

Entités du contenu de la page d'accueil. Le **schéma Sanity est la source de vérité**
(Principe IX) : les types TypeScript sont **générés** (`npm run typegen` →
`src/sanity.types.ts`), jamais tapés à la main. Ce document décrit la forme cible ; les
*valeurs* (copie, libellés) sont lues sur la maquette au build et vivent une seule fois
dans `src/content/homePage.ts`.

## Entité : `homePage` (singleton CMS)

- **Type** : document Sanity, `_id` fixe `"homePage"` (singleton via `structure.ts`).
- **État actuel** : `title` (required) + `tagline` étaient un **test jetable** →
  **supprimés**. Le modèle ci-dessous est défini *from scratch* — aucun champ de test
  n'est conservé ni repris (`seo.metaTitle` est un champ neuf, pas l'ancien `title`).
- **Édition** : un seul écran Studio, organisé en `groups` (onglets).

### Groupes (onglets Studio)

`hero` (défaut) · `intro` · `expertises` · `univers` · `vision` · `seo`

### Champs

| Champ | Type Sanity | Groupe | Obligatoire | Défaut (repli) | Notes |
|-------|-------------|--------|:-----------:|----------------|-------|
| `heroLabel` | `string` | hero | ✅ | maquette | **H1 unique** (FR-014) : petit label au-dessus des grands titres. |
| `heroSlides` | `array<heroSlide>` | hero | ✅ (min 1) | 1 slide maquette | Carrousel auto, fondu, sans contrôle (FR-002). |
| `introText` | `text` | intro | — | maquette | Texte de positionnement (« agenceur-concepteur engagé »). |
| `introHeading` | `string` | intro | — | maquette | Optionnel : titre d'intro si présent dans `51:2221`. |
| `expertisesTitle` | `string` | expertises | — | maquette | Titre du bloc. |
| `expertisesText` | `text` | expertises | — | maquette | Texte de présentation. |
| `expertisesImage` | `image` (`hotspot`, `alt`) | expertises | — | seed-asset | Visuel `FeatureBlock`. |
| `expertisesCtaLabel` | `string` | expertises | — | maquette | Libellé CTA. |
| `expertisesCtaHref` | `string` | expertises | — | `/expertises` | Destination (FR-003). |
| `universTitle` | `string` | univers | — | maquette | Titre de section. |
| `universSectors` | `array<sector>` | univers | — (def. 4) | retail/bureaux/scénographie/résidentiel | Liens actifs (FR-004). |
| `visionTitle` | `string` | vision | — | maquette | Titre du bloc. |
| `visionText` | `text` | vision | — | maquette | Texte. |
| `visionImage` | `image` (`hotspot`, `alt`) | vision | — | seed-asset | Visuel `FeatureBlock`. |
| `visionCtaLabel` | `string` | vision | — | maquette | Libellé CTA. |
| `visionCtaHref` | `string` | vision | — | `/nous-decouvrir` | Destination (FR-006). |
| `seo.metaTitle` | `string` | seo | — | maquette / `"Estuaire"` | Titre de page (FR-014). |
| `seo.metaDescription` | `text` | seo | — | maquette | Meta-description (FR-014). |
| `seo.ogImage` | `image` (`alt`) | seo | — | seed-asset | Image de partage social (FR-014). |

> `seo` peut être un objet imbriqué (`type: "object"`) ou des champs à plat `seoMetaTitle…`
> — choix d'implémentation ; un objet `seo` regroupe proprement dans l'onglet. À trancher
> au moment du schéma selon la lisibilité TypeGen.

### Objet : `heroSlide`

| Champ | Type | Obligatoire | Notes |
|-------|------|:-----------:|-------|
| `image` | `image` (`hotspot`, `alt`) | ✅ | Visuel plein cadre de la slide. |
| `titleOutline` | `string` | — | Partie du titre en **contour** (`OutlineText`). |
| `titleFill` | `string` | — | Partie du titre en **plein**. |

- Ordonnable dans l'array (l'ordre = ordre d'affichage). Réordonner/ajouter/retirer une
  slide reflète immédiatement le carrousel (FR-007, scénario P3-3).
- Traitement contour/plein : même précédent que `ctaTitleOutline`/`ctaTitleFill` du footer.

### Objet : `sector`

| Champ | Type | Obligatoire | Notes |
|-------|------|:-----------:|-------|
| `label` | `string` | ✅ | Nom du secteur (ex. « retail »). |
| `href` | `string` | ✅ | Sous-page secteur `/univers/[secteur]` (404 temporaire OK, FR-004). |

### Règles de validation

- `heroSlides` : **au moins 1** slide (`rule.min(1)`) — couvre le cas limite « hero sans
  slide » côté modèle ; le front a aussi une slide de repli (FR-002, cas limite).
- `heroSlide.image` et `expertisesImage` / `visionImage` : `asset` requis pour le seed
  (`seed:check` échoue si l'asset disque est absent — Principe IX).
- Tous les champs `image` portent un champ `alt` (FR-013, accessibilité).
- Aucune contrainte sur les `href` (les pages cibles peuvent ne pas exister — FR-014, cas
  limite « destination non publiée »).

### Valeurs par défaut (repli front)

- Vivent une seule fois dans `src/content/homePage.ts` (Principe IX : pas de duplication
  seed ↔ fallback). Importées par `homePage.seed.ts` **et** par `getHomePageProps`.
- Garantissent SC-006 : avant toute saisie, la home s'affiche complète (aucune zone vide).
- Les **images** de repli ne vivent pas dans `content/` (texte uniquement) : elles sont
  des seed-assets (`seed-assets/homePage/`) injectées par le seed ; le front s'appuie sur
  le contenu seedé (comme le footer).

## Entité : carte de réalisation (statique — PAS un type CMS, FR-005)

- **Stockage** : `src/content/homeRealisations.ts` ; images sous `public/home/realisations/`.
- **Forme** :

| Champ | Type | Notes |
|-------|------|-------|
| `image` | `string` | Chemin `public/` (ex. `/home/realisations/retail-01.jpg`). |
| `sector` | `string` | Univers de rattachement (→ `meta` de `CaseStudyCard`). |
| `title` | `string` | Titre de la réalisation (→ `title`, et `alt`). |

- `href` **constant** `/realisations` pour toutes les cartes (FR-005 — pas de deep-link,
  aucun lien mort).
- Ensemble **fixe** (~6 cartes maquette) ; non éditable ; jamais vide.
- **Migration prévue** (feature « Réalisations ») : remplacer ce fichier statique par un
  fetch Sanity et rebrancher `href` → `/realisations/[slug]`.

## Relations & flux de données

```text
Studio (homePage singleton)                 src/content/homePage.ts (copie maquette, 1 source)
        │  publish → webhook                          │ import
        ▼                                             ▼
/api/revalidate → revalidateTag("sanity")    homePage.seed.ts ──seed──▶ projet Sanity (dev/prod)
        │ invalide le cache                           
        ▼
HOME_PAGE_QUERY (defineQuery, typé)
        │ sanityFetch
        ▼
getHomePageProps()  ── defaults (content) + urlFor(images) + lqip ──▶ props
        │
        ▼
(site)/page.tsx (RSC, connecteur)
        ├─▶ <HeroSlideshow label slides/>           (DS, nouveau)
        ├─▶ intro (BrandText / texte)               (DS)
        ├─▶ <FeatureBlock/> expertises + <Button/>  (DS)
        ├─▶ univers : <SectorButton/>* + <CaseStudyCard/>* (DS ; cartes ← homeRealisations.ts)
        └─▶ <FeatureBlock/> vision + <Button/>       (DS)
              wrappés par <Reveal/> (src/lib/motion)
```

## Types générés (référence)

- `npm run typegen` régénère `src/sanity.types.ts` : `HomePage` (doc) et
  `HOME_PAGE_QUERY_RESULT` (union selon présence des champs).
- `getHomePageProps` importe ces types et **narrow** via `NonNullable<>` (pattern
  `footer.ts`). Aucun type de contenu n'est tapé à la main (Principe IX).
