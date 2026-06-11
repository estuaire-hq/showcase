# Implementation Plan: Migration Next.js v15 → v16 + Sanity v4 → v5

**Branch**: `002-nextjs-16-migration` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-nextjs-16-migration/spec.md`

## Summary

Monter le socle technique du site Estuaire de **Next.js 15.3 → 16.2.9** et, dans le même
lot, le stack **Sanity v4 → v5** (aligné par le prérequis partagé **React 19.2**), sans
régression visible (visiteurs, éditeurs, dev/CI). Approche : migration *lift* en **deux
paliers vérifiables** au sein de la même branche — (1) cœur Next 16 + React 19.2 en gardant
Sanity v4 / `next-sanity@11` ; (2) montée Sanity v5 (`sanity@5.31`, `next-sanity@13`,
`@sanity/client@7`, `@sanity/image-url@2`) avec régénération TypeGen. Chaque palier doit
être *lint + build verts* avant de passer au suivant. Les *breaking changes* obligatoires
(middleware→proxy, `revalidateTag` à 2 arguments, Turbopack par défaut, défauts `next/image`,
stratégie cache/live `@sanity/client@7`) sont traités ; les nouveautés optionnelles
(Cache Components, React Compiler, View Transitions) sont **hors périmètre**.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict, pas de `any`) · Node ≥ 20.9 (runtime `node:22`)
**Primary Dependencies**: Next.js 16.2.9 (App Router, `output: standalone`) · React/React-DOM 19.2.7 · Sanity 5.31.1 (Studio embarqué) via `next-sanity@13` · `@sanity/client@7.22.1` (transitif) · Tailwind CSS v4 · GSAP 3.15 + `@gsap/react` + Lenis · Biome 2.4 · `tsx`
**Storage**: Sanity Cloud (contenu + assets) — aucune base locale ; le VPS ne stocke pas de contenu
**Testing**: pas de suite de tests automatisés ; la vérification = `biome check` (lint/format) + `next build` (typecheck inclus) + smoke manuel/CI (gate, revalidation, Studio, draft, animations) + `npm run seed:check` (dry-run seeds)
**Target Platform**: serveur Linux (image Docker `standalone`) sur VPS OVH via Coolify ; navigateurs modernes (Chrome/Edge/Firefox 111+, Safari 16.4+ — baseline Next 16)
**Project Type**: application web — un seul projet Next.js (App Router), Studio Sanity embarqué
**Performance Goals**: iso-performance ou mieux (Turbopack + refonte navigation v16) ; zéro régression perçue (rendu, animations, scroll)
**Constraints**: zéro régression visuelle (Principe VII) ; préserver le gate « coming soon », la revalidation ISR par webhook (Principe I) et le draft mode / Visual Editing ; conserver la sortie `standalone` ; schémas/structure/seeds Sanity inchangés (Principe IX) ; aucune nouvelle dépendance non justifiée (Principe IV)
**Scale/Scope**: petit site vitrine, quelques routes sous `(site)` + Studio + 3 routes API ; dev solo

Aucune `NEEDS CLARIFICATION` : toutes les cibles de version et stratégies sont résolues
dans [research.md](./research.md).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Impact de la migration | Verdict |
|---|---|---|
| **I. Server-First Rendering** | `revalidateTag` passe à 2 arguments ; le build Turbopack doit toujours produire `output: standalone` ; ISR par webhook conservé | ✅ Préservé — vérifié par contrat de revalidation + build standalone (FR-004, FR-006) |
| **II. CMS as Single Content Source** | Aucun contenu déplacé hors Sanity ; GROQ typées inchangées | ✅ Aucun changement |
| **III. Feature-Based Architecture** | `src/middleware.ts` → `src/proxy.ts` (même emplacement racine, rôle défini) ; pas de `components/` fourre-tout introduit | ✅ Conforme |
| **IV. Simplicity Over Abstraction** | **Aucune nouvelle dépendance** ; uniquement des bumps de version sur la ligne maintenue ; pas de nouvelle abstraction | ✅ Conforme (ajout optionnel `@types/react-dom` = typage, justifié) |
| **V. Bilingual Convention** | spec/plan en français, code/commits en anglais | ✅ Respecté |
| **VI. Intentional Event Tracking** | La migration **n'ajoute aucune interaction** → aucun nouvel événement Umami requis ; vérifier que le script Umami (layout) charge toujours | ✅ Décision documentée : pas de nouveau tracking, non-régression à vérifier |
| **VII. Pixel-Perfect Fidelity** | Aucun changement d'UI attendu → parité visuelle = la garantie (SC-001) | ✅ Gate = diff visuel / parité page à page |
| **VIII. Data/Presentation Boundary** | Inchangé (connected components, DS isolé) | ✅ Aucun changement |
| **IX. Modèle Sanity : types dérivés, seeds typés** | Sanity v5 → **régénérer TypeGen** (`src/sanity.types.ts`) ; `seed:check` doit rester vert ; schéma = source de vérité inchangée | ✅ Couvert par FR-012 + contrat TypeGen |

**Résultat du gate : PASS** — aucune violation, *Complexity Tracking* vide.

**Suivis de gouvernance (companion, hors exécution de ce plan)** :
- Amender la **constitution** (table « Stack applicative », l. 350-355) : Next.js 15 → 16,
  Sanity v4 → v5, et confirmer la lib d'animation (GSAP, lever le `TODO(ANIMATION_LIB)`).
  → bump PATCH/MINOR avec Sync Impact Report.
- Mettre à jour **ADR 0007** (coming-soon gate) : référence `middleware` → `proxy`.
- Nouvel **ADR 0008** : la décision de migration (cf. FR-018).

## Project Structure

### Documentation (this feature)

```text
specs/002-nextjs-16-migration/
├── plan.md              # Ce fichier (/speckit.plan)
├── research.md          # Phase 0 — décisions de migration + rationale
├── data-model.md        # Phase 1 — matrice de versions + modèle de contenu (inchangé) + types
├── quickstart.md        # Phase 1 — runbook d'exécution + checklist de vérification
├── contracts/
│   └── regression-contracts.md  # Invariants à préserver (webhook, gate, draft, sitemap)
└── tasks.md             # Phase 2 (/speckit.tasks — NON créé ici)
```

### Source Code (repository root) — fichiers réellement touchés

```text
src/
├── middleware.ts                 → RENOMMÉ en src/proxy.ts (fonction middleware → proxy, drop runtime)
├── app/
│   ├── layout.tsx                # await draftMode() déjà async (vérif) ; police, Umami, SanityLive
│   ├── api/revalidate/route.ts   # revalidateTag("sanity") → revalidateTag("sanity", "max")
│   ├── sitemap.ts                # statique — vérifier (pas de generateSitemaps)
│   └── studio/[[...tool]]/page.tsx# Studio v5 doit monter
├── lib/sanity/
│   ├── client.ts                 # useCdn:true, apiVersion, stega — vérif sous @sanity/client@7
│   ├── live.ts                   # defineLive({serverToken}) — vérif cache/live v7
│   └── image.ts (urlFor)         # @sanity/image-url v1 → v2 (vérifier URLs générées)
├── sanity/                       # schémas/structure/seeds — INCHANGÉS (régénérer types seulement)
└── sanity.types.ts               # RÉGÉNÉRÉ via npm run typegen (Sanity v5)

package.json                      # bumps deps + script dev (drop --turbopack)
next.config.ts                    # revue v16 (a priori conforme : remotePatterns, standalone)
Dockerfile / .github/workflows/*  # Node ≥ 20.9 déjà OK (node:22) — confirmer
docs/vault/decisions/0008-*.md    # NOUVEL ADR ; MAJ 0007 (proxy)
```

**Structure Decision**: projet Next.js unique (App Router) conservé tel quel. La migration
ne déplace aucune frontière d'architecture : elle renomme `middleware.ts` → `proxy.ts` (même
emplacement racine `src/`, rôle inchangé) et touche des points ponctuels (config, deps, un
appel `revalidateTag`, régénération de types). Aucun nouveau module, aucune nouvelle couche.

## Phasage d'exécution (paliers vérifiables)

> Détail opérationnel dans [quickstart.md](./quickstart.md). `/speckit.tasks` développera ces paliers en tâches.

- **Palier 0 — Baseline** : confirmer `lint` + `build` verts sur v15 (point de comparaison).
- **Palier 1 — Cœur Next 16** : codemod `@next/codemod upgrade latest` ; bumps `next@16.2.9`,
  `react`/`react-dom@19.2.7`, types ; `package.json` (drop `--turbopack`) ; `middleware.ts`
  → `proxy.ts` ; `revalidateTag(…, "max")` ; revue `next.config.ts`. **Sanity reste en v4 /
  `next-sanity@11`** (compatible Next 16). Gate : `lint` + `build` verts + smoke (gate,
  images, scroll, Studio v4). *Note : React 19.2 peut produire un warning peer transitoire
  contre Sanity v4 — levé au palier 2.*
- **Palier 2 — Stack Sanity v5** : bumps `sanity@5.31`, `@sanity/vision@5`, `next-sanity@13`,
  `@sanity/image-url@2`, `styled-components ^6.1.15` ; `npm run typegen` (régénère
  `sanity.types.ts`) ; vérifier `client.ts`/`live.ts` sous `@sanity/client@7` (cache/live),
  `urlFor` sous image-url v2. Gate : `lint` + `build` + `seed:check` verts + smoke (Studio v5,
  revalidation, draft/Visual Editing).
- **Palier 3 — Docs & gouvernance** : ADR 0008, MAJ ADR 0007 (proxy), amendement constitution
  (suivi).
- **Palier 4 — Vérification finale & déploiement** : checklist de régression complète
  (contracts), build Docker `standalone` local, déploiement Coolify, smoke prod.

## Complexity Tracking

*Aucune violation constitutionnelle — section vide.*
