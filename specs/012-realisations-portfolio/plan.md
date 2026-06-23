# Implementation Plan: Réalisations (portfolio + pages projet)

**Branch**: `012-realisations-portfolio` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-realisations-portfolio/spec.md`

## Summary

Introduire le **premier type de contenu Sanity de nature collection** du projet (`realisation`,
plusieurs documents éditeur-créés, chacun avec son URL `/realisations/<slug>`), puis livrer :

1. une **page liste** `/realisations` — section « Dernières Réalisations » (3 plus récentes) +
   portfolio en grille filtrable (Univers · Expertises · Clients) avec affichage progressif et
   états vides ;
2. une **page détail** `/realisations/[slug]` en deux variantes de mise en page (« fournie » avec
   carrousel d'intro / « légère » compacte), récit structuré (contexte → enjeu → missions → défis →
   crédit photo → savoir-faire) + navigation précédent/suivant ;
3. le **demock** des emplacements aujourd'hui en dur : home (3 cartes + 12 boutons secteurs) et les
   3 sous-pages d'expertises (section « cas study »), tous rebranchés sur le CMS.

**Approche technique** : copier et étendre le pattern multi-instance `sectorDetail` (schéma
`defineType` + `documentTypeList` dans le desk + queries `*[_type=="…" && slug.current==$slug]` +
connecteur `@/lib/sanity/<doc>.ts` + route dynamique `[slug]` ISR sans `generateStaticParams`). Le
filtrage/affichage progressif est **client-side** (un fetch serveur de toutes les réalisations non-
brouillon → un composant client `RealisationsBrowser`) pour satisfaire « perçu comme instantané,
sans rechargement » (SC-004). Le contenu des 23 études de cas est pré-rempli par seed typé (pattern
builder de `sectorDetail.build.ts`), images intégrées dans `seed-assets/realisations/<slug>/` avec
nommage SEO. Tout le visuel vient de `@/design-system` + tokens `@theme` (une seule primitive
nouvelle : un `Carousel` client).

## Technical Context

**Language/Version**: TypeScript (strict), React 19 Server Components, Next.js 16 (App Router)
**Primary Dependencies**: Next.js 16, Sanity v5 (Studio embarqué, TypeGen), Tailwind CSS v4
(`@theme`), `tailwind-variants`, GSAP + `@gsap/react` + Lenis (motion), `next-sanity` (`defineQuery`)
**Storage**: Sanity Cloud (projet *dev* en local, projet *prod* via CI) ; assets média dans Sanity
**Testing**: pas de suite de tests automatisés sur ce projet vitrine ; vérification = `npm run build`,
`npm run lint` (Biome), `npm run seed -- --check` (dry-run), revue **pixel-perfect** (skill
`estuaire-pixel-review`) contre les renders Figma cachés
**Target Platform**: web (SSR/ISR via Docker standalone sur VPS OVH / Coolify)
**Project Type**: web app monolithique Next.js (un seul projet — Principe IV)
**Performance Goals**: rendu serveur, JS client minimal (Principe I) ; filtrage portfolio perçu
instantané sans rechargement (SC-004)
**Constraints**: aucun contenu de réalisation codé en dur (Principe II / SC-005) ; types Sanity
générés, jamais tapés (Principe IX) ; aucune couleur/typo en dur, composants UI depuis le DS
(Principe X) ; maquettes desktop only → responsive interprété par breakpoint (FR-031, Principe VII)
**Scale/Scope**: 1 nouveau type Sanity (collection) ; 23 documents seedés (21 publiables, 2
brouillons, 2 « à venir ») ; 2 nouvelles routes ; 3 points de demock ; ~1 primitive DS nouvelle
(Carousel) ; 12 univers + 3 expertises comme dimensions de filtre

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Conformité | Comment |
|---|---|---|
| **I. Server-First Rendering** | ✅ | Routes = RSC connecteurs ; ISR via `sanityFetch` (cache tags), pas de `generateStaticParams` (perspective cookie dynamique), comme `univers/[slug]`. `"use client"` borné : `RealisationsBrowser` (filtrage), `Carousel`, nav prev/next reste des `<Link>`. |
| **II. CMS as Single Content Source** | ✅ | `realisation` est un type Sanity ; le demock supprime `homeRealisations.ts` et les `caseStudy*` en dur. SC-005 visé. Seules les listes contrôlées (12 univers, 3 slugs d'expertise) sont du code (taxonomie, pas du contenu éditorial). |
| **III. Feature-Based Architecture** | ✅ | Code colocalisé sous `src/app/(site)/realisations/` ; primitive visuelle réutilisable → `src/design-system/` ; mapping Sanity → `src/lib/sanity/realisation.ts`. Pas de fourre-tout. |
| **IV. Simplicity Over Abstraction** | ✅ | Réutilise le pattern `sectorDetail` existant. Filtrage **client-side en mémoire** (~23 items) plutôt qu'un state manager ou des requêtes par filtre. `univers`/`expertises` = listes contrôlées (string), pas de références (déréf. + couplage d'ordre d'écriture évités) — voir research D2. |
| **V. Bilingual Convention** | ✅ | Doc/specs FR ; code/commits/branche/PR EN ; commentaires EN. |
| **VI. Intentional Event Tracking** | ✅ | Décision de tracking Umami explicite (research D14) : ouverture de fiche, sélection de filtre, « charger d'autres », nav prev/next, contact depuis l'état vide. Sans PII. |
| **VII. Pixel-Perfect Fidelity** | ✅ | Build depuis les nodes Figma complets cachés (`portfolio` 51:4064, `case-study` 51:4386, `case-study-court` 53:2745) via `estuaire-pixel-perfect` ; revue finale `estuaire-pixel-review`. Desktop only → responsive par breakpoint déclaré. |
| **VIII. Data/Presentation Boundary** | ✅ | DS présentationnel (props only) ; mapping isolé dans `@/lib/sanity/realisation.ts` ; les routes (pages-specific) sont les connecteurs. `RealisationsBrowser` reçoit ses données en props (pas de fetch client). |
| **IX. Modèle Sanity dérivé + seeds typés** | ✅ | Schéma = source unique ; types via TypeGen (`npm run typegen`, commité) ; seed typé `defineSeed<Realisation>` ; `--check` avant `seed`. `_id` = `realisation-<slug>` (hyphen, jamais de point — post-mortem 0010). |
| **X. Design System = source visuelle** | ✅ | Tokens `@theme` only ; réutilise `Filter`/`SubFilter`/`CaseStudyCard`/`CaseStudyPanel`/`Pill`/`Button`/`Breadcrumb`/`PageHero`/`SectionTitle`/`CarouselArrow` ; nouvelle primitive `Carousel` **ajoutée au DS** (acte délibéré), pas ad hoc. |

**Résultat** : ✅ Aucun écart. Aucune entrée de Complexity Tracking requise.

## Project Structure

### Documentation (this feature)

```text
specs/012-realisations-portfolio/
├── plan.md              # Ce fichier (/speckit.plan)
├── research.md          # Phase 0 — décisions (D1…D14)
├── data-model.md        # Phase 1 — schéma realisation + types + contenu partagé
├── quickstart.md        # Phase 1 — comment construire / seeder / vérifier
├── contracts/
│   └── realisation.contracts.md   # Phase 1 — queries GROQ, routes, points de demock
├── checklists/          # Checklist qualité (déjà validée)
└── tasks.md             # Phase 2 (/speckit.tasks — PAS créé ici)
```

### Source Code (repository root)

```text
src/
├── sanity/
│   ├── schemas/
│   │   ├── documents/realisation.ts          # NOUVEAU — defineType collection
│   │   └── index.ts                          # MODIF — register realisation
│   ├── structure.ts                          # MODIF — documentTypeList("realisation")
│   └── seed/
│       ├── documents/
│       │   ├── realisation.build.ts          # NOUVEAU — builder typé (pattern sectorDetail.build.ts)
│       │   └── realisations.seed.ts          # NOUVEAU — array des 23 docs (pattern expertiseSubpages.seed.ts)
│       └── registry.ts                       # MODIF — ...realisations
├── content/
│   └── realisations.ts                       # NOUVEAU — listes contrôlées (UNIVERS×12, EXPERTISES×3),
│                                             #           types, libellés, + données seed des 23 études (source unique)
├── lib/sanity/
│   ├── queries.ts                            # MODIF — REALISATION(S)_* queries (defineQuery)
│   └── realisation.ts                        # NOUVEAU — getRealisationListProps / getRealisationProps(slug)
│                                             #           / getLatestRealisations(n) / getLatestRealisationForExpertise(slug)
├── design-system/
│   ├── components/Carousel.tsx               # NOUVEAU — client, grande visuelle + prev/suiv (CarouselArrow)
│   └── index.ts                              # MODIF — export Carousel
└── app/(site)/
    ├── realisations/
    │   ├── page.tsx                          # NOUVEAU — liste (RSC connecteur)
    │   ├── RealisationsBrowser.tsx           # NOUVEAU — client : filtres + load-more + états vides
    │   └── [slug]/page.tsx                   # NOUVEAU — détail (RSC connecteur, notFound si non publié)
    ├── page.tsx                              # MODIF (demock home — cartes + boutons secteurs)
    └── expertises/[expertise]/page.tsx       # MODIF (demock case study) OU dans le connecteur expertiseSubpage.ts

seed-assets/realisations/<slug>/             # NOUVEAU — images SEO (committé, hors public/, exclu du build)
src/content/homeRealisations.ts              # SUPPRIMÉ à terme (demock) — voir research D10
```

**Structure Decision** : monolithe Next.js App Router existant. La feature suit strictement les rôles
établis — schéma/seed sous `src/sanity/`, mapping sous `src/lib/sanity/`, primitive visuelle sous
`src/design-system/`, orchestration interactive page-specific colocalisée sous la route
`src/app/(site)/realisations/`. Aucun nouveau module top-level ni package.

## Complexity Tracking

> Aucune violation de la Constitution → section vide (rien à justifier).
