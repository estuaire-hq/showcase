# Contracts — Réalisations

Phase 1 du plan. Interfaces exposées : requêtes GROQ (`defineQuery` → types générés), routes
publiques, et points d'intégration du demock. Le format suit `src/lib/sanity/queries.ts`
(projection d'images `{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }`).

---

## 1. Requêtes GROQ (`src/lib/sanity/queries.ts`)

### `REALISATIONS_LIST_QUERY` — page liste (projection légère, tout sauf brouillon)

```groq
*[_type == "realisation" && status in ["published","upcoming"]] | order(order desc, publishedAt desc){
  "slug": slug.current,
  title, client, status, order, univers, expertises,
  location, year, area,
  cover{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
}
```
- Sert la grille (cliquable si `published`, grisé non cliquable si `upcoming`) **et** la section
  « Dernières Réalisations » (filtrer `status=="published"`, prendre 3 en tête côté client/serveur).
- Consommé par `getRealisationListProps()` → hydrate `RealisationsBrowser` (filtrage client, D4).

### `REALISATION_QUERY($slug)` — page détail (projection complète)

```groq
*[_type == "realisation" && slug.current == $slug && status == "published"][0]{
  "slug": slug.current,
  title, client, univers, expertises, layout,
  location, year, area,
  context, enjeu,
  interventions,
  challenges[]{ title, body },
  skills,
  photoCredit,
  cover{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  gallery[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  seoMetaTitle, seoMetaDescription,
  seoOgImage{ asset, alt }
}
```
- Le filtre `status == "published"` garantit qu'une URL « à venir »/« brouillon » → `null` →
  `notFound()` (FR-022). Un slug inexistant → `null` aussi.

### `REALISATION_SLUGS_QUERY` — nav prev/suiv (ordre des publiées)

```groq
*[_type == "realisation" && status == "published"] | order(order desc, publishedAt desc){
  "slug": slug.current, title
}
```
- Sert à calculer, côté serveur, les voisins (prev/next bornés, D8) du slug courant.

### `LATEST_REALISATIONS_QUERY($limit)` — home & « Dernières Réalisations »

```groq
*[_type == "realisation" && status == "published"] | order(order desc, publishedAt desc)[0...$limit]{
  "slug": slug.current,
  title, client, location, year, area,
  cover{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
}
```
- Home : `$limit = 3` (cartes) + covers pour les visuels décoratifs (D10).
  *(Si `$limit` paramétré pose souci de type, dupliquer en `LATEST_REALISATIONS_3_QUERY` figé.)*

### `EXPERTISE_LATEST_REALISATION_QUERY($expertise)` — demock sous-pages expertises

```groq
*[_type == "realisation" && status == "published" && $expertise in expertises]
  | order(order desc, publishedAt desc)[0]{
  "slug": slug.current,
  title, location, year, area,
  cover{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
}
```
- Renvoie `null` si aucune réalisation publiée pour l'expertise → repli dégradé propre (D11).

Toutes terminent par `export { defineQuery }` déjà présent ; ajouter les exports nommés.

---

## 2. Connecteur (`src/lib/sanity/realisation.ts`) — Sanity → props (Principe VIII)

```ts
getRealisationListProps(): Promise<RealisationListItem[]>
  // map REALISATIONS_LIST_QUERY → { slug, title, client, status, univers, expertises,
  //   meta: string[] (location/year/area filtrés), cover: ResolvedImage, href }
  // href = `/realisations/${slug}` si published, sinon undefined (non cliquable)

getRealisationProps(slug): Promise<RealisationDetailProps | null>
  // map REALISATION_QUERY ; null → la route fait notFound()
  // + voisins prev/next (via REALISATION_SLUGS_QUERY) : { prev?: {slug,title}, next?: {slug,title} }
  // + galerie résolue + binding carrousel (layout === "fournie")

getLatestRealisations(limit): Promise<RealisationCardData[]>   // home (D10)
getLatestRealisationForExpertise(expertiseSlug): Promise<RealisationCardData | null>  // expertises (D11)
```
Toutes utilisent `sanityFetch` (ISR tags), `mapImage` (largeurs adaptées : carte ~1920, hero détail
~1920, galerie ~1200, og ~1200). Types `RealisationListItem` / `RealisationDetailProps` dérivés via
`Awaited<ReturnType<…>>` (pas de duplication du schéma).

---

## 3. Routes publiques (contrat d'URL)

| Route | Type | Comportement |
|---|---|---|
| `GET /realisations` | RSC connecteur | liste : Dernières Réalisations (3) + grille filtrable (`RealisationsBrowser`). Lit `searchParams` `?univers=` / `?expertise=` / `?client=` → filtre initial. |
| `GET /realisations?univers=<u>` | idem | filtre Univers pré-activé (deep-link depuis la home). |
| `GET /realisations?expertise=<slug>` | idem | filtre Expertise pré-activé (deep-link depuis une sous-page expertise). |
| `GET /realisations/[slug]` | RSC connecteur | détail si `status=="published"` ; sinon (`upcoming`/`draft`/inexistant) → `notFound()` (page 404 propre, FR-022). `generateMetadata` par slug. |

- **Rendu** : dynamique + ISR via `sanityFetch` (tags), **pas** de `generateStaticParams` (perspective
  cookie dynamique) — aligné sur `univers/[slug]` (D12, Principe I).
- **Fil d'ariane** détail : `Breadcrumb items=[{label:"réalisations", href:"/realisations"}, {label: title}]`
  (FR-019).

### Ordre des sections — page détail (FR-019)

```
Breadcrumb
Intro : contexte + enjeu
        └─ layout "fournie" → + Carousel (grande visuelle + prev/suiv, CarouselArrow)
        └─ layout "legere"  → intro compacte, pas de carrousel
Nos missions (interventions[])
Défis relevés (challenges[], 1→3 blocs)
[Crédit photo]            ← uniquement si photoCredit, ENTRE dernier défi et savoir-faire
Savoir-faire mobilisés (skills[] → Pill)
Navigation précédent / suivant (bornée)
```

---

## 4. Points de demock (contrat d'intégration)

### 4.1 Home — `src/app/(site)/page.tsx` (+ connecteur home)

| Avant (en dur) | Après (CMS) |
|---|---|
| `homeRealisationCards` → `PinnedCaseStudies cards` | `getLatestRealisations(3)` → `cards` (cover/title/meta), panneau → `/realisations/<slug>` |
| `homeRealisationSectors` boutons `href={REALISATIONS_HREF}` | libellés `UNIVERS` ; `href={/realisations?univers=<slug-of-label>}` |
| `homeRealisationImages.feature/.wide` (statique) | covers de réalisations récentes (D10) |
| `src/content/homeRealisations.ts` | **supprimé** |

- `home_sector_click` / `home_realisation_click` (Umami) conservés.

### 4.2 Sous-pages expertises — `expertises/[expertise]/page.tsx` (ou connecteur)

| Avant (doc `expertiseSubpage`) | Après (CMS realisation) |
|---|---|
| `caseStudyImage` | `getLatestRealisationForExpertise(slug).cover` |
| `caseStudyProjectTitle` | `.title` |
| `caseStudyMeta` | `.meta` (location/year/area filtrés) |
| `caseStudyCtaHref = "/realisations"` | `/realisations?expertise=<slug>` |
| `caseStudyTitleOutline/Fill` | **inchangés** (titre de section, depuis le doc) |
| (aucune realisation pour l'expertise) | **repli** : `caseStudy*` du doc + CTA `/realisations` (FR-024 sc.4) |

- `case_study_click` (Umami) conservé.

### 4.3 `/univers/<secteur>` — **AUCUN changement** (FR-026, hors périmètre).

---

## 5. Seed (contrat d'écriture)

- `src/sanity/seed/documents/realisation.build.ts` : `buildRealisationSeed(content, files)` →
  `defineSeed<Realisation>({...})`, `_id: realisation-<slug>`, images via `image("seed-assets/realisations/<slug>/<seo-name>", alt)`,
  `challenges`/membres d'array avec `_type` discriminateur.
- `src/sanity/seed/documents/realisations.seed.ts` : `export default realisationsContent.map(c => buildRealisationSeed(c, …))`.
- `registry.ts` : `...realisations` ajouté à `seeds`.
- Validation : `npm run seed -- --check` (offline) doit passer (champs requis présents, assets
  présents sur disque) **avant** `npm run seed` (dev uniquement ; prod = CI).

---

## 6. Composant DS nouveau (contrat)

`Carousel` (`src/design-system/components/Carousel.tsx`, `"use client"`) :
```ts
function Carousel(props: {
  images: { src: string; alt: string; blurDataURL?: string }[];
  className?: string;
}): JSX.Element   // grande visuelle + CarouselArrow prev/suiv ; index interne ; reduced-motion friendly
```
Exporté depuis `src/design-system/index.ts`. Présentationnel (aucun fetch).
