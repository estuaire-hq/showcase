# Implementation Plan: Pages de détail des secteurs (« univers / … »)

**Branch**: `011-sector-detail-pages` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-sector-detail-pages/spec.md`

## Summary

Construire les **4 pages de détail de secteur** (`/univers/retail`, `/univers/bureau`,
`/univers/residentiel`, `/univers/scenographie`) — destinations des boutons « en savoir plus » de
la page Univers (feature 009), aujourd'hui en 404. Les 4 pages partagent **un gabarit unique**
(hero bi-ton avec fil d'ariane → intro [enjeux + contraintes terrain + visuels + texte] →
argument → 2 citations → footer global) ; seuls le **contenu** et les **visuels** varient.

Approche technique : une **route dynamique** `/univers/[slug]` (RSC, SSG des 4 slugs,
`notFound()` sur slug inconnu), branchée sur un **nouveau type Sanity `sectorDetail`** (4
documents par slug), avec replis de maquette dans `src/content/sectorDetail.ts`. On **réutilise**
le design system (PageHero split, SectionTitle, Pullquote, BrandText/OutlineText, Button, footer
+ retour-haut + motion déjà montés) et on **ajoute 3 primitives** réutilisables (`Breadcrumb`,
`Pill`, `Testimonial`) + un slot `breadcrumb` à `PageHero`. Rendu **fidèle au desktop**
(diff Figma), responsive par breakpoint, cinématiques de scroll sobres respectant
`prefers-reduced-motion`. Décisions détaillées : [research.md](./research.md) ·
modèle : [data-model.md](./data-model.md) · contrats : [contracts/components.md](./contracts/components.md).

## Technical Context

**Language/Version**: TypeScript (strict), React 19 / Next.js 16 (App Router, RSC, `standalone`)
**Primary Dependencies**: Next.js 16, Sanity v5 (Studio embarqué + TypeGen), Tailwind CSS v4
(`@theme` tokens), GSAP + `@gsap/react` + Lenis (motion), `next-sanity` (`sanityFetch`, `defineQuery`)
**Storage**: Sanity Cloud (projet *dev* en local, projet *prod* via CI) — nouveau type `sectorDetail`
**Testing**: pas de tests unitaires (site vitrine, Principe IV) ; vérification = `npm run lint`,
`npm run build`, `npm run seed -- --check`, diff pixel-perfect (skill `estuaire-pixel-review`)
**Target Platform**: web responsive (mobile 390 / tablette 768 / desktop 1024+), déploiement Docker/Coolify
**Project Type**: application web Next.js mono-projet (App Router, feature-based)
**Performance Goals**: LCP < 2,5 s mobile, pas de CLS notable (SC-009) ; JS client minimal (RSC)
**Constraints**: 0 valeur visuelle en dur (tokens only) ; DS présentationnel ; contenu CMS-éditable
avec replis maquette ; accessibilité clavier + contrastes (FR-016)
**Scale/Scope**: 1 route dynamique (4 pages SSG), 1 type Sanity (+2 objets), 3 composants DS,
1 query+mapping, 4 seeds. Aucune maquette tablette/mobile (desktop seul → diff desktop only).

## Constitution Check

*GATE — vérifié avant Phase 0 et après Phase 1. Aucune violation.*

| Principe | Conformité |
|---|---|
| **I. Server-First** | Pages RSC ; ISR via `sanityFetch` (cache-tags) ; `"use client"` réservé aux primitives motion. ✓ |
| **II. CMS source** | Contenu/visuels dans Sanity (`sectorDetail`) ; replis maquette dans `src/content/`. Aucun texte/asset de contenu codé en dur. ✓ |
| **III. Feature-based** | Route colocalisée `(site)/univers/[slug]` ; DS dans `src/design-system/` ; mapping connecté dans `src/lib/sanity/`. ✓ |
| **IV. Simplicity** | 1 type, 1 route dynamique, réutilisation maximale ; 3 ajouts DS **justifiés** (primitives réutilisables) ; enjeux/intro = compositions de page, pas de sur-abstraction. ✓ |
| **V. Bilingual** | Specs/docs FR ; code/commentaires/commits EN ; PR EN + template. ✓ |
| **VI. Tracking** | Décision explicite (D8) : **aucun nouvel événement** — pageview auto + CTA footer déjà tracé + `sector_cta_click` en amont. ✓ |
| **VII. Pixel-Perfect** | Build sur les nodes Figma complets (cache offline) ; diff desktop par section (`estuaire-pixel-review`) ; dimensions dynamiques (hero `min-h-svh`) autorisées. ✓ |
| **VIII. Data/Presentation** | DS présentationnel (props only) ; mapping Sanity→props dans `lib/sanity/sectorDetail.ts` ; la page (RSC) est le connecteur. ✓ |
| **IX. Modèle Sanity** | Schéma source de vérité → TypeGen (`SectorDetail`) ; seeds typés `defineSeed<SectorDetail>` ; `--check` avant écriture ; `createIfNotExists` ; copie maquette à un seul endroit. ✓ |
| **X. Design System** | Tokens `@theme` only (0 hex/px arbitraire) ; primitives réutilisables ajoutées au DS, jamais réimplémentées ad hoc ; variantes via `tailwind-variants`. ✓ |

**Gate result** : PASS (Phase 0 et post-design Phase 1). **Complexity Tracking** : vide (aucune
violation à justifier).

## Project Structure

### Documentation (this feature)

```text
specs/011-sector-detail-pages/
├── spec.md              # Spécification (fournie)
├── requirements.md      # Checklist validée (fournie)
├── plan.md              # Ce fichier
├── research.md          # Phase 0 — décisions D1..D10
├── data-model.md        # Phase 1 — schéma sectorDetail
├── contracts/
│   └── components.md     # Phase 1 — contrats route + composants DS
├── quickstart.md        # Phase 1 — séquence + vérification
└── tasks.md             # Phase 2 — généré par /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── app/(site)/univers/
│   ├── page.tsx                         # EXISTANT (index Univers — non modifié)
│   └── [slug]/
│       └── page.tsx                     # NOUVEAU — route dynamique des 4 secteurs
├── design-system/
│   ├── components/
│   │   ├── PageHero.tsx                 # ÉTENDU — slot `breadcrumb`
│   │   ├── Breadcrumb.tsx               # NOUVEAU
│   │   ├── Pill.tsx                     # NOUVEAU
│   │   └── Testimonial.tsx              # NOUVEAU
│   └── index.ts                         # exporter les 3 nouveaux
├── content/
│   └── sectorDetail.ts                  # NOUVEAU — copie maquette (4 secteurs, source unique)
├── lib/sanity/
│   ├── queries.ts                       # + SECTOR_DETAIL_QUERY, SECTOR_DETAIL_SLUGS_QUERY
│   └── sectorDetail.ts                  # NOUVEAU — getSectorDetailProps(slug) + slugs (replis + mapImage)
├── sanity/
│   ├── schemas/
│   │   ├── documents/sectorDetail.ts    # NOUVEAU — type + objets constraintChip, testimonial
│   │   └── index.ts                     # + register sectorDetail
│   ├── structure.ts                     # + entrée « Univers — secteurs » (non-singleton)
│   └── seed/
│       ├── documents/
│       │   ├── sectorDetail.retail.seed.ts        # NOUVEAU
│       │   ├── sectorDetail.bureau.seed.ts        # NOUVEAU
│       │   ├── sectorDetail.residentiel.seed.ts   # NOUVEAU
│       │   └── sectorDetail.scenographie.seed.ts  # NOUVEAU
│       └── registry.ts                  # + register les 4 seeds
├── sanity.types.ts                      # RÉGÉNÉRÉ (npm run typegen) — type SectorDetail
└── seed-assets/sectorDetail/<slug>/     # NOUVEAU — 6 images/secteur (hors public/)
```

**Structure Decision** : application web Next.js mono-projet, feature-based (App Router). La
feature s'insère sans nouveau module top-level : route sous `(site)/univers/[slug]`, primitives
dans le design system existant, modèle/seed sous `src/sanity/`, consommation sous `src/lib/sanity/`,
copie de maquette sous `src/content/` — exactement le frontière modèle/consommation/présentation
des Principes VIII–X et le pattern des pages sœurs (Univers, Expertises).

## Complexity Tracking

*Aucune violation du Constitution Check — section vide.*

## Companion (hors plan, à la livraison)

- **ADR 0018** — *sector-detail-pages build decisions* (`docs/vault/decisions/`) : tracer D1
  (modèle dédié), D3 (ajouts DS), D6 (décision motion vs pages sœurs statiques), D8 (tracking).
- Vérifier les collisions de numérotation (ADR/post-mortem/specs) avant merge — skill
  `estuaire-branch-sync` (worktrees parallèles).
