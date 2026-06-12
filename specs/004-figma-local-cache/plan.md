# Implementation Plan: Cache Figma local & lecteur offline (remplacement du MCP Figma)

**Branch**: `004-figma-local-cache` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-figma-local-cache/spec.md`

## Summary

Remplacer le MCP Figma (Dev Mode, plafonné par le plan Starter) par un **cache local versionné** de
la maquette et un **lecteur offline**. Une **seule** opération `collect` rapatrie **toute la page de
design désignée** (canvas `51:2220` « Webdesign-ESTUAIRE-V3 ») via l'**API REST** — vérifié : `GET
/v1/files/:key/nodes?ids=<canvasId>` sans `depth` renvoie **tout le sous-arbre en une requête** — puis
**découpe** ce résultat **par frame de premier niveau** en fichiers JSON **autonomes et lossless**, et
télécharge les **images placées** (image-fills en 1 appel + renders batchés, reprenables sur quota via
`Retry-After`). La **lecture** (`read <id|nom>`) est **100 % locale, exhaustive, < 1 s, 0 appel** —
c'est le vrai remplacement du MCP. Un **manifeste auto-généré** route tout node id → sa frame ; un
**index nommé curé** (dev + agent) donne un point d'entrée IA *« quelles cibles existent et ce
qu'elles représentent »* avec variantes responsive. `status` rapporte fraîcheur (`version` distante vs
locale) + cohérence index↔cache. Les scripts prototypes de `.design/scripts/` sont **consolidés en
une chaîne canonique** `figma.ts` à **4 commandes** (`collect`/`read`/`list`/`status`) ; `render` et
`kit` sont **retirés du périmètre** (clarif. 2026-06-12 : captures de référence fournies manuellement,
KIT lu via `read`), et la skill `estuaire-figma` + le Principe VII (qui les citent) sont mis à jour.
Décisions détaillées : [research.md](./research.md).

## Technical Context

**Language/Version**: **TypeScript**, Node 24 (présent : v24.14.0), exécuté via **`tsx`**
(`node [--env-file=.env.development] --import tsx .design/scripts/figma.ts …`) — même pattern que le
seed tooling (`src/sanity/seed/*.ts`). Pas d'étape de build (tsx transpile à la volée). Choix révisé
suite au retour utilisateur (cf. research §5).
**Primary Dependencies**: aucune nouvelle. **`tsx`** (`^4.22.4`, déjà devDep) pour exécuter le TS ;
`fetch` natif Node + `node:fs`/`node:stream`. API REST Figma (token `FIGMA_TOKEN`, `.env.development`
git-crypt — déjà en place).
**Storage**: fichiers locaux sous `.design/figma-cache/` — JSON versionnés (`config.json`,
`manifest.json`, `index.json`, `frames/*.json`) + `assets/` binaires **gitignorés**
(ré-téléchargeables). Aucune base de données.
**Testing**: pas de runner de test dans le projet (devDeps : biome, tsx, typescript — pas de
vitest/jest). Vérification par : (a) la commande **`status`** (gate cohérence/fraîcheur, analogue à
`seed --check`) ; (b) les **tests indépendants** de la spec exécutés manuellement (lecture offline,
fraîcheur, reprise) ; (c) la recette de [quickstart.md](./quickstart.md). Pas de nouveau framework
(Principe IV).
**Target Platform**: outillage de développement local + CI (lecture seule, sans token). Hors build
Next.js / hors runtime de l'app.
**Project Type**: CLI tooling au sein du dépôt web existant (un seul projet — pas de monorepo).
**Performance Goals**: lecture d'un node **< 1 s** et **0 appel** réseau (CS-002/003) ; rafraîchissement
complet en **1 commande** + **nombre d'appels borné** (1 structure + 1 image-fills + N renders, jamais
1/node — CS-004) ; chaque lecture charge **une seule** frame (taille bornée — CS-005).
**Constraints**: hors-ligne pour `read`/`list` ; rate-limit Figma **10 req/min** (Tier 1, plan Starter,
leaky bucket partagé) → 429 honoré via header `Retry-After`, collecte **reprenable**, cache **jamais à
moitié écrit** (rename atomique) ; cache + index **versionnés** lisibles sans token (checkout neuf / CI).
**Scale/Scope**: 1 page Figma désignée ≈ **~30 frames de premier niveau** (7 pages × 3 breakpoints +
KIT + variantes menu + marqueurs), de l'ordre de **~1 000–1 500 nodes** au total ; réponse one-shot
estimée 10–30 Mo (d'où la découpe). Mono-utilisateur (dev) + agent IA.

## Constitution Check

*GATE : doit passer avant Phase 0. Re-vérifié après Phase 1.* — Constitution v1.7.0 (10 principes).

| Principe | Applicable ? | Verdict |
|---|---|---|
| **I. Server-First Rendering** | Non | Outillage de build, hors runtime/app. Aucun impact RSC/ISR. ✅ |
| **II. CMS as Single Content Source** | Oui (frontière) | Le cache est de la **référence design** (specs de build), **pas** du contenu éditorial. Le contenu reste dans Sanity. **Renforcé** : les assets quittent `public/` (servi en prod) pour `.design/figma-cache/assets/` (local) → aucune fuite de référence design dans l'app servie. ✅ |
| **III. Feature-Based Architecture** | Oui | L'outillage vit dans `.design/` (dossier dédié au design, déjà établi, hidden), **pas** un `components/` fourre-tout. Module `lib/` pour le code partagé. ✅ |
| **IV. Simplicity Over Abstraction** | Oui | **Net simplification** : 6 scripts ad hoc → 1 chaîne. **Aucune nouvelle dépendance** (TS via `tsx`, déjà devDep ; pas d'étape de build — research §5), pas de framework de test, pas de serveur MCP. Les **deux index** (manifeste auto + index curé) sont justifiés par des besoins orthogonaux (routage machine vs découverte IA — research §2). ✅ |
| **V. Bilingual Convention** | Oui | Code/commentaires/commits en anglais ; specs/docs (ce plan) en français. ✅ |
| **VI. Intentional Event Tracking** | Non | Aucune interaction utilisateur final (outillage dev). Décision de non-tracking = explicite. ✅ |
| **VII. Pixel-Perfect Fidelity** | **Oui (central)** | Cette feature **EST** la couche de données du pixel-perfect : préserve la lecture **FULL node, lossless** (EF-001 = `read` exhaustif). L'étape *verify* reste exigée par le principe, mais ses **captures de référence sont fournies manuellement** (PNG Figma — clarif. 2026-06-12), pas par une commande de l'outil. **Action de gouvernance requise** : le Principe VII et la skill `estuaire-figma` **citent nommément** `figma-pull.mjs`/`figma-node.mjs` → leurs **références opérationnelles** doivent être mises à jour vers `figma.ts collect`/`read` (le **principe** lui-même est inchangé). Companion changes (cf. ci-dessous). ✅ sous réserve de ces MAJ. |
| **VIII. Data/Presentation Boundary** | Non | Aucun code Sanity/design-system. ✅ |
| **IX. Modèle Sanity (types dérivés, seeds typés)** | Non (esprit respecté) | Hors Sanity. L'esprit « source unique + validation avant usage » est repris : `status` = gate de cohérence (analogue `seed --check`), formes du cache documentées une seule fois (data-model.md). ✅ |
| **X. Design System (source unique du visuel)** | Non | L'outillage **produit de la donnée**, n'ajoute aucun code visuel ni token. ✅ |

**Résultat du gate : PASS.** Aucune violation. Une **obligation de gouvernance** (non bloquante pour le
plan) : mettre à jour les références des anciens scripts dans le Principe VII + la skill `estuaire-figma`,
et consigner la décision en **ADR** (`docs/vault/decisions/`). Ces companion changes sont des **tâches
d'implémentation** (pas une modification de constitution dans `/speckit.plan`). Voir Complexity Tracking.

### Companion changes (gouvernance / mémoire projet)
- **ADR** `docs/vault/decisions/00XX-figma-local-cache.md` : décision du cache découpé + chaîne canonique.
- **Constitution Principe VII** : remplacer les citations `figma-pull.mjs`/`figma-node.mjs` par
  `figma.ts collect`/`read` (bump **PATCH** — correction factuelle de références opérationnelles, le
  principe ne change pas). Mise à jour du Sync Impact Report.
- **Skill `estuaire-figma`** : réécrire les commandes (Source of truth, étapes 1 & 5) vers `figma.ts`.
- **CLAUDE.md** : section « Pixel-Perfect & Animation » + « Lab » (assets hors `public/figma`).
- **Post-mortem** : aucun requis (pas d'erreur) ; la leçon « assets hors `public/` » est capturée par l'ADR.

## Project Structure

### Documentation (this feature)

```text
specs/004-figma-local-cache/
├── plan.md              # Ce fichier (/speckit.plan)
├── research.md          # Phase 0 — décisions (unité de découpe, 2 index, runtime, reprise…)
├── data-model.md        # Phase 1 — formes du cache (config/manifest/frames/index)
├── contracts/
│   ├── cli-commands.md  # Phase 1 — contrat de chaque sous-commande (I/O, exit codes, erreurs)
│   └── cache-files.md   # Phase 1 — contrat de forme des fichiers du cache
├── quickstart.md        # Phase 1 — parcours quotidien + recette des critères de succès
├── checklists/          # (préexistant)
└── tasks.md             # Phase 2 — /speckit.tasks (NON créé par /speckit.plan)
```

### Source Code (repository root)

Outillage de design dans `.design/` (hors build Next). L'arborescence **cible** :

```text
.design/
├── .gitignore                    # MAJ : ignorer figma-cache/assets/ (+ retirer images/, *.png si obsolètes)
├── scripts/
│   ├── figma.ts                  # ENTRÉE unique : routeur de sous-commandes (collect/read/list/status)
│   ├── tsconfig.json             # extends la racine, strict, noEmit — sert tsx/éditeur/`figma:check`
│   └── lib/                      # modules partagés
│       ├── types.ts              # interfaces des contrats du cache (Config/Manifest/FrameFile/IndexEntry)
│       ├── figma-api.ts          # client REST + backoff Retry-After (429) + helpers endpoints
│       ├── collect.ts            # pull page (1 req) → split frames → manifeste → image-fills + renders (reprise/atomique)
│       ├── read.ts               # résolution id|nom → frame → sous-arbre ; digest lossless + --raw/--depth/--leaves
│       ├── index-status.ts       # list + status (fraîcheur depth=1 + cohérence index↔cache)
│       ├── paints.ts             # formatage fills/strokes/text (extrait de figma-node.mjs)
│       └── cache.ts              # chemins, safe-id, écriture atomique (temp→rename), I/O manifeste/index
└── figma-cache/                  # LE CACHE
    ├── config.json               # [versionné] fileKey + pageId désigné (51:2220)
    ├── manifest.json             # [versionné] auto : nodeToFrame + frames[] + source{version,…} + missingAssets
    ├── index.json                # [versionné] curé : noms métier → nodes + descriptions + variantes
    ├── frames/<safe-id>.json     # [versionné] 1 frame de premier niveau = 1 sous-arbre lossless autonome
    └── assets/                   # [GITIGNORÉ] renders PNG + sources image-fills (ré-téléchargeables)

# RETIRÉS :
#   migrés → figma.ts (collect/read) : .design/scripts/{figma-pull,figma-node,figma-fills,figma-frames}.mjs
#     (la capacité de rendu d'images placées migre dans lib/figma-api.ts, utilisée par collect)
#   supprimés sans remplacement (clarif. 2026-06-12) : .design/scripts/{figma-render,kit-inventory}.mjs
#     (render → captures manuelles ; kit → read sur la frame KIT) + .design/figma-data/kit-inventory.md
#   .design/figma-data/{nodes.json (monolithe 2,3 Mo), images.json}
#   écritures dans public/figma/ (assets déplacés hors de public/)
```

**Structure Decision** : **projet unique**, outillage CLI **TypeScript** isolé dans `.design/scripts/`
(entrée `figma.ts` + `lib/`, exécuté par **`tsx`**), cache de données dans `.design/figma-cache/`.
Choix dicté par : le Project Type (tooling de build, pas de l'app), la convention `.design/` existante
(Principe III + Memory Architecture), et le typage des contrats du cache (research §5). **Wiring TS** :
scripts npm `figma` (`node --env-file=.env.development --import tsx .design/scripts/figma.ts`) +
`figma:check` (`tsc --noEmit -p .design/scripts`) ; `.design` **exclu** du `tsconfig.json` racine
(découplage du build Next) avec un `.design/scripts/tsconfig.json` dédié ; Biome ignore déjà `.design`.
Les scripts prototypes de collecte/lecture sont consolidés dans `figma.ts` (4 commandes) ; `render` et
`kit` sont retirés (clarif. 2026-06-12) ; les artefacts monolithiques (`figma-data/`) et les écritures
dans `public/figma/` sont supprimés.

## Complexity Tracking

> Le Constitution Check **passe sans violation**. Cette table consigne les deux points qui
> *pourraient* sembler ajouter de la complexité, et pourquoi l'alternative plus simple est rejetée.

| Point | Pourquoi nécessaire | Alternative plus simple rejetée parce que |
|---|---|---|
| **Deux index** (`manifest.json` auto + `index.json` curé) | besoins orthogonaux : routage machine exhaustif (read par id, cohérence, fraîcheur) vs découverte éditoriale IA (noms + descriptions) | *Un seul index* : forcerait soit à décrire à la main des milliers de nodes (impossible), soit à polluer l'index curé de routage machine. La spec liste d'ailleurs les deux entités séparément. |
| **MAJ Principe VII + skill `estuaire-figma`** (companion) | ils citent nommément les scripts migrés → références cassées sinon | *Ne rien toucher* : laisserait des références mortes vers `figma-pull/node.mjs`, violant la traçabilité de la constitution (et trompant l'agent au prochain build pixel-perfect). |

*(Aucune autre source de complexité : pas de nouvelle dépendance (TS via `tsx` déjà présent, sans
build), pas de framework de test, pas de serveur MCP, pas de base de données.)*
