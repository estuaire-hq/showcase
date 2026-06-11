---
description: "Task list — Migration Next.js v15 → v16 + Sanity v4 → v5"
---

# Tasks: Migration Next.js v15 → v16 + Sanity v4 → v5

**Input**: Design documents from `/specs/002-nextjs-16-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/regression-contracts.md, quickstart.md

**Tests**: Aucune suite de tests automatisés dans ce projet (cf. plan.md « Testing »). La
vérification = `biome check` (lint) + `next build` (typecheck inclus) + smoke manuel/CI +
`npm run seed:check`. Les tâches de vérification ci-dessous sont donc des **gates de
non-régression** (smoke / contrats), pas des tests TDD à écrire en premier.

**Organization**: Tâches regroupées par user story. La migration s'exécute en **paliers
vérifiables** (cf. plan.md / quickstart.md) qui s'alignent sur les stories :
Palier 0 = Setup · noyau de versions = Foundational · Palier 1 = US1 · Palier 2 = US2 ·
chaîne dev/CI = US3 · Paliers 3-4 (docs + déploiement) = Polish.

## Format: `[ID] [P?] [Story?] Description avec chemin`

- **[P]** : peut tourner en parallèle (fichiers différents, aucune dépendance non satisfaite)
- **[Story]** : `[US1]` / `[US2]` / `[US3]` (mappe sur les user stories de spec.md)
- Code, chemins, commandes et identifiants en anglais (convention bilingue) ; prose en français

## Path Conventions

Projet Next.js unique (App Router), racine = `/home/payangar/Estuaire/showcase`. La migration
ne déplace aucune frontière d'architecture : elle renomme `src/middleware.ts` → `src/proxy.ts`
(même emplacement racine) et touche des points ponctuels (deps, config, un appel
`revalidateTag`, régénération de types). Aucun nouveau module.

---

## Phase 1: Setup (Palier 0 — Baseline)

**Purpose**: Établir le point de comparaison v15 avant toute modification.

- [X] T001 Vérifier un arbre de travail git propre sur la branche `002-nextjs-16-migration` (`git status`) et noter le SHA de baseline v15 comme point de comparaison — **arbre propre, SHA baseline `a63ba80`**
- [X] T002 [P] Lancer `npm run lint` (Biome, script `package.json` → `lint`) sur la baseline v15 et confirmer le vert — **68 fichiers, 0 erreur**
- [X] T003 [P] Lancer `npm run build` sur la baseline v15, confirmer le vert, vérifier que `.next/standalone/` est produit et noter le temps de build (référence) — **vert en ~78s, `.next/standalone/` produit (env Sanity CI : `vbuzs69z`/`production`)**
- [ ] T004 [P] Capturer les captures de référence des pages clés (accueil + scroll complet) pour le diff de parité final (Principe VII, SC-001) — stocker dans un dossier de travail (hors `public/`) — **⏸️ GATE VISUEL MANUEL (Pierre) : nécessite serveur dev + navigateur + jugement pixel-perfect**

**Checkpoint**: baseline v15 verte et référence visuelle capturée.

---

## Phase 2: Foundational (Noyau de versions — BLOQUE US1 & US2)

**Purpose**: Poser le socle de dépendances (Next 16 + React 19.2) dont **US1 et US2 dépendent
toutes les deux** — React 19.2 est le pivot exigé à la fois par Next 16 et par Sanity v5.

**⚠️ CRITICAL**: Aucune story ne peut démarrer avant la fin de cette phase.

- [X] T005 Lancer le codemod officiel `npx @next/codemod@canary upgrade latest` à la racine du dépôt et **relire chaque diff** avant de stager (research §D2 ; le codemod gère config `turbopack`, `middleware → proxy`, retrait `unstable_`/`experimental_ppr`) — **transforms appliqués MANUELLEMENT (env bash non-interactif) : chaque transform énuméré par research §D2-D9 est fait & revu individuellement (T008-T012)**
- [X] T006 Épingler/confirmer les deps cœur dans `package.json` : `next@16.2.9`, `react@^19.2.7`, `react-dom@^19.2.7` ; ajouter en devDeps `@types/react@^19.2.17`, `@types/react-dom@^19.2.3` ; lancer `npm install` pour recalculer `package-lock.json` (FR-001, research §D1) — **installé : next 16.2.9, react/react-dom 19.2.7, @types/react 19.2.17, @types/react-dom 19.2.3 ; aucun conflit peer**
- [X] T007 [P] Confirmer Node ≥ 20.9 dans `Dockerfile`, `.github/workflows/ci.yml`, `.github/workflows/seed-sanity.yml` (FR-015 — `node:22` attendu partout, aucun changement requis) — **`node:22` partout ✓ (runtime v24.14 local)**

**Checkpoint**: le dépôt est sur le noyau Next 16 / React 19.2 — US1 et US2 peuvent démarrer.

---

## Phase 3: User Story 1 — Site public sur Next.js 16 sans régression (Priority: P1) 🎯 MVP

**Goal**: Le site public rend à l'identique de la v15 (mêmes pages, scroll Lenis, reveals GSAP,
gate « coming soon »), *build* en `standalone` et démarre sans erreur — Sanity reste en v4 à ce
palier (research § Palier 1).

**Independent Test**: Déployer/lancer la branche, parcourir toutes les pages, comparer (visuel +
comportement + animations) à la prod v15 ; aucune différence visible, aucune erreur console/hydratation.

- [X] T008 [P] [US1] Mettre à jour le script `dev` de `package.json` : `next dev --turbopack` → `next dev` (retrait du `--turbopack` redondant) ; confirmer que `build`/`start`/`lint`/`typegen`/`seed*` restent intacts (FR-007) — **`dev` = `next dev` ; autres scripts intacts**
- [X] T009 [P] [US1] Compléter/vérifier la migration `middleware → proxy` : `src/middleware.ts` renommé en `src/proxy.ts`, fonction exportée `middleware` → `proxy`, retrait de `runtime: "nodejs"` du `config`, en-tête de commentaire réécrit (runtime `proxy`) ; matcher + logique du gate **strictement préservés** (FR-003, research §D3, C2) — **fait ; build affiche `ƒ Proxy (Middleware)`**
- [X] T010 [P] [US1] Mettre `revalidateTag("sanity")` en conformité v16 à deux arguments → `revalidateTag("sanity", "max")` dans `src/app/api/revalidate/route.ts` (FR-004, research §D4) — **fait (profil `"max"` = stale-while-revalidate)**
- [X] T011 [P] [US1] Revoir/confirmer `next.config.ts` pour les options v16 (pas de `images.domains`, `experimental.ppr`, `serverRuntimeConfig`/`publicRuntimeConfig`, `amp`, option `eslint` ; `experimental.turbopack` → `turbopack` racine si présent) ; confirmer `output: "standalone"` + `images.remotePatterns` intacts (FR-008, research §D6) — **conforme, AUCUNE modif (scan négatif)**
- [X] T012 [P] [US1] Scanner `src/` pour les API retirées en v16 (`next/amp`, `useAmp`, `serverRuntimeConfig`/`publicRuntimeConfig`/`next/config`, `next/legacy/image`, `unstable_rootParams`, `next lint`) et confirmer **zéro occurrence** (FR-017, SC-010) — **ZÉRO occurrence**
- [X] T013 [P] [US1] Confirmer l'usage exclusif des Async Request APIs : vérifier `await draftMode()` dans `src/app/layout.tsx` et l'absence de tout accès synchrone résiduel à `cookies`/`headers`/`params`/`searchParams` (FR-005) — **`await draftMode()` (layout:45) ; aucun accès sync**
- [X] T014 [US1] Lancer `npm run build` (Turbopack, défaut v16) sous Next 16 ; confirmer le vert + `.next/standalone/` produit ; en cas d'échec dû à une config webpack implicite, documenter et appliquer le repli `next build --webpack` (FR-006, SC-007, C7) — **vert en ~33s (Turbopack), `.next/standalone/` produit ; pas de repli webpack nécessaire ; tsconfig ajusté par Next 16 (jsx react-jsx + include) reformaté par Biome**
- [X] T015 [US1] Smoke du gate « coming soon » dans ses **4 états** via `npm run dev` (token absent → ouvert ; token défini sans cookie → placeholder ; `/v/<token>` valide → pose cookie + redirige `/` ; cookie valide → site réel ; mauvais token → placeholder) (FR-003, SC-002, C2) — **4 états validés via curl (307+Set-Cookie, placeholder, vrai site) ; état désactivé = chemin inchangé**
- [X] T016 [US1] Vérifier le rendu des images `cdn.sanity.io` sous les nouveaux défauts `next/image` v16 (qualité, cache, `imageSizes`) ; n'ajuster `images.qualities`/`imageSizes`/`minimumCacheTTL` dans `next.config.ts` **que si** dégradation perçue (FR-009, research §D7) — **images servies via `/_next/image` (q=75 défaut v16), URLs `cdn.sanity.io` pilotées par `urlFor` ; image atelier rendue à l'écran ; aucune dégradation → aucun ajustement config**
- [X] T017 [US1] Vérifier que `src/app/sitemap.ts` (statique, pas de `generateSitemaps`) et `src/app/robots.ts` (keyé sur `SITE_PREVIEW_TOKEN`) génèrent la même sortie qu'en v15 (FR-013, C6) — **`robots.txt` → Disallow:/ (gate actif) ; `sitemap.xml` structure identique**
- [~] T018 [US1] Vérifier le scroll fluide Lenis + reveals GSAP (`@gsap/react`) y compris sur les transitions inter-pages, respect de `prefers-reduced-motion`, et que le `<Script>` Umami charge toujours dans `src/app/layout.tsx` (FR-014, SC-009, Principe VI, C8) — **Umami présent (`data-website-id`) ; line-mask OutlineText rendu ; AUCUNE erreur JS. ⏸️ Ressenti scroll/reveals + `prefers-reduced-motion` = passe manuelle (Pierre) au scroll**
- [~] T019 [US1] Parcourir toutes les pages `(site)` sur le build Next 16 et confirmer la parité pixel/comportement vs la référence v15 (T004), **zéro erreur console/hydratation**, et que `/studio` (encore v4) se monte (SC-001, SC-008, C8) — **home rendue (Playwright/charlotte), DS intact, ZÉRO erreur console/hydratation (seul `favicon.ico` 404 pré-existant) ; `/studio` monte (200). ⏸️ Diff pixel page-à-page vs v15 = jugement visuel Pierre (Principe VII)**

**Checkpoint US1**: lint + build verts, gate OK, parité OK → **MVP déployable sur Next 16** (Sanity v4).

---

## Phase 4: User Story 2 — Stack de contenu en Sanity v5 (Priority: P2)

**Goal**: Le stack Sanity monte en v5 (aligné Next 16 via `next-sanity@13`) sans perte de
fonctionnalité : Studio embarqué, schémas/structure/seeds intacts, draft/Visual Editing,
publications visibles après revalidation, types régénérés (research § Palier 2).

**Independent Test**: Sous Next 16 + React 19.2, monter Sanity v5 + `next-sanity@13` +
`@sanity/client@7`, régénérer les types (`npm run typegen`), ouvrir `/studio`, éditer/publier,
déclencher la revalidation et constater la mise à jour côté site.

**⚠️ Dépend de Phase 2 (noyau React 19.2). Recommandé après le gate US1 (paliers vérifiables).**

- [X] T020 [US2] Monter les deps Sanity dans `package.json` : `sanity@^5.31.1`, `@sanity/vision@^5.31.1`, `next-sanity@^13.0.12`, `@sanity/image-url@^2.1.1`, `styled-components@^6.1.15` ; `npm install` (`@sanity/client@7` arrive en transitif ; `@sanity/locale-fr-fr` inchangé) — ⚠️ version `next-sanity` résolue = **@13** (research §D1), pas @12 comme rédigé dans spec.md (FR-002) — **résolu : sanity 5.31.1, @sanity/vision 5.31.1, next-sanity 13.0.12, @sanity/image-url 2.1.1, @sanity/client 7.22.1 (transitif), styled-components 6.3.12 ; aucun conflit peer**
- [X] T021 [US2] Régénérer les types : `npm run typegen` (extract schéma + generate) → `src/sanity.types.ts` ; confirmer qu'aucun type de contenu n'est tapé à la main (FR-012, Principe IX, C5) — **régénéré (2 queries, 15 types). ⚠️ TypeGen v5 renomme les résultats `*QUERYResult` → `*QUERY_RESULT` : import `footer.ts` adapté (pas de type manuel introduit)**
- [X] T022 [US2] Vérifier la stratégie cache/live sous `@sanity/client@7` dans `src/lib/sanity/client.ts` + `src/lib/sanity/live.ts` : publié via CDN (`useCdn:true`, sans token) + brouillons via `serverToken` dans `defineLive` ; confirmer `apiVersion` (`2026-03-01`) + `stega` (FR-011, research §D8, C3) — **conforme, AUCUNE modif : `client.ts` (useCdn:true sans token, apiVersion 2026-03-01, stega) + `live.ts` (defineLive serverToken)**
- [X] T023 [US2] Vérifier que `urlFor(...)` dans `src/lib/sanity/image.ts` sous `@sanity/image-url@2` génère les mêmes URLs `cdn.sanity.io` (taille/format/qualité) qu'en v1 ; repli en v1 si la sortie change de façon indésirable (research §D8) — **URL générée STRICTEMENT IDENTIQUE à v1 (vérifié). ⚠️ v2 : sous-chemin de types `lib/types/types` retiré → import `SanityImageSource` depuis la racine ; default export déprécié → migré vers `createImageUrlBuilder` (named export). Pas de repli v1 nécessaire**
- [X] T024 [US2] Lancer `npm run build` et confirmer le typecheck **vert** avec `src/sanity.types.ts` régénéré (FR-012, SC-004, C5) — **vert (~34s, Turbopack), typecheck OK, `.next/standalone/` produit, zéro warning**
- [X] T025 [US2] Lancer `npm run seed:check` (dry-run, offline, sans token) et confirmer le vert — champs `required` + assets référencés présents sous TypeGen v5 (FR-012, C5) — **vert : footer valide, schéma extrait (required enforced), dry-run OK**
- [~] T026 [US2] Smoke `/studio` **v5** via `npm run dev` : montage du Studio, auth, navigation desk (structure custom), édition, plugin Vision, locale `fr-FR` ; `export const dynamic = "force-static"` de la route conservé (FR-010, SC-003, C4) — **shell Studio v5 MONTE (200, écran d'enregistrement v5 « Connect this studio », zéro erreur) ; `force-static` conservé. ⏸️ Auth projet + navigation desk + édition + Vision + locale fr-FR = passe éditoriale manuelle (Pierre, login Sanity requis)**
- [~] T027 [US2] Vérifier draft mode + `<SanityLive />` + `<VisualEditing />` (aperçu en direct) dans `src/app/layout.tsx` ; contenu publié servi via CDN (FR-011, SC-005, C3) — **chemin de code confirmé (layout rend SanityLive+VisualEditing si draftMode) ; publié via CDN. ⏸️ Aperçu en direct = manuel (draft mode + Presentation Tool, token requis)**
- [~] T028 [US2] Revalidation de bout en bout : publier un document → `POST /api/revalidate` (signature valide) → confirmer l'invalidation effective des caches et l'apparition de la valeur publiée côté site (contrat 200 + revalidation effective, pas seulement la compilation) (FR-004, SC-005, C1) — **contrat signature vérifié : POST sans signature valide → 401 `Invalid signature` (sous next-sanity@13). ⏸️ 200 + revalidation effective (publish réel) = gate d'intégration manuel (REVALIDATION_SECRET requis)**

**Checkpoint US2**: lint + build + `seed:check` verts ; Studio v5 + revalidation + draft OK.

---

## Phase 5: User Story 3 — Chaîne de dev et d'intégration verte (Priority: P3)

**Goal**: Sur la branche **entièrement migrée** (paliers 1 + 2 intégrés), dev/lint/build/typegen/
seed et le pipeline CI restent verts, sans friction nouvelle.

**Independent Test**: `npm run dev`, `npm run lint`, `npm run build`, `npm run typegen`,
`npm run seed:check` en local + pipeline CI sur la branche ; tous verts.

- [X] T029 [US3] Lancer `npm run dev` et confirmer que le serveur démarre avec Turbopack (défaut v16) et que le hot-reload fonctionne (FR-007) — **dev démarre sous Turbopack (Next 16.2.9), Ready en ~417ms**
- [X] T030 [P] [US3] Lancer `npm run lint` (Biome) sur la branche migrée intégrée et confirmer le vert (FR-016, SC-006) — **vert (68 fichiers)**
- [X] T031 [P] [US3] Lancer `npm run build` sur la branche migrée intégrée et confirmer le build de production vert + sortie `standalone` (SC-006, SC-007) — **vert (branche intégrée Next 16 + Sanity v5), `.next/standalone/` produit**
- [~] T032 [US3] Pousser la branche `002-nextjs-16-migration` et confirmer que les jobs CI `lint` + `build` (`.github/workflows/ci.yml`) passent au vert (FR-016, SC-006) — **⏸️ ACTION SORTANTE — push en attente du feu vert de Pierre (lint+build verts en local reproduisant l'env CI `vbuzs69z`/`production`)**
- [X] T033 [US3] Confirmer le chemin seed CI (`npm run seed:ci` / `seed:check`, `.github/workflows/seed-sanity.yml`) fonctionnel sous TypeGen v5 (FR-012) — **`seed:check` (= `seed:schema` + runner, partagé avec `seed:ci`) vert sous TypeGen v5**

**Checkpoint US3**: dev/lint/build/typegen/seed + CI tous verts.

---

## Phase 6: Polish & Cross-Cutting (Paliers 3-4 — Docs & Déploiement)

**Purpose**: Consigner la décision, mettre les docs à jour, et livrer (vérification finale + déploiement).

- [X] T034 [P] Rédiger l'ADR `docs/vault/decisions/0008-nextjs-16-sanity-5-migration.md` : cibles de version (Next 16 + Sanity v5), exclusion Sanity v6, périmètre *lift*, choix Turbopack, pivot React 19.2 (FR-018) — **écrit (inclut les breaking changes découverts : renommage TypeGen, image-url@2)**
- [X] T035 [P] Mettre à jour l'ADR `docs/vault/decisions/0007-*.md` (coming-soon gate) : remplacer les références `middleware` par `proxy` — **fait (bloc « How » + « Consequences », renvoi vers ADR 0008)**
- [~] T036 Construire l'image Docker `standalone` en local (`docker build -t estuaire:next16 .`) et la lancer (`docker run --rm -p 3000:3000 estuaire:next16`) ; confirmer le démarrage et le service sur `:3000` (FR-006, SC-007, C7) — **⏸️ BLOQUÉ : daemon Docker indisponible dans cet environnement. Risque faible (le Dockerfile fait `npm run build` → `.next/standalone` déjà confirmé produit ; `.dockerignore` correct). À dérouler par Pierre / en CI**
- [~] T037 Dérouler l'intégralité des contrats de régression `specs/002-nextjs-16-migration/contracts/regression-contracts.md` (C1→C8) et confirmer chaque invariant (gate final) — **C1 (partiel : 401 ✓ ; 200+revalid. effective manuel), C2 ✓, C3 (code ✓ ; live preview manuel), C4 ✓ (montage ; édition manuelle), C5 ✓, C6 ✓, C7 ✓ (standalone ; Docker = T036), C8 ✓ (rendu + zéro erreur ; scroll/parité pixel = jugement Pierre). Synthèse dans la réponse**
- [~] T038 Déploiement : merge sur `main` → build & deploy Coolify → smoke prod (gate, contenu, animations) ; confirmer que le build Coolify tourne en Node ≥ 20.9 (SC-001…SC-009) — **⏸️ ACTION SORTANTE/PROD — ne PAS exécuter sans décision explicite de Pierre (merge main → Coolify auto-deploy)**
- [X] T039 [P] Suivi de gouvernance (companion, hors exécution stricte de ce plan) : amender la **constitution** (table « Stack applicative » : Next 15→16, Sanity v4→v5, lever `TODO(ANIMATION_LIB)` = GSAP) avec Sync Impact Report + bump de version (plan §Suivis de gouvernance) — **DÉJÀ FAIT (commit `0cfe8a0`, constitution v1.6.2 : Next 16, Sanity v5, GSAP)**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance — démarre immédiatement.
- **Foundational (Phase 2)** : dépend du Setup — **BLOQUE US1 et US2** (pose React 19.2, le pivot).
- **US1 (Phase 3)** : démarre après Foundational. C'est le MVP (site sur Next 16, Sanity v4).
- **US2 (Phase 4)** : techniquement débloquée par Foundational (React 19.2). **Recommandé après
  le gate US1** (approche en paliers vérifiables : palier 1 vert avant palier 2).
- **US3 (Phase 5)** : valide la chaîne sur la branche **intégrée** (US1 + US2) ; après US2.
- **Polish (Phase 6)** : ADR (T034/T035) rédigeables dès que les changements correspondants sont
  faits ; déploiement (T036-T038) après US3 ; T039 = suivi séparé.

### User Story Dependencies

- **US1 (P1)** : indépendante (ne dépend que de Foundational). Livrable seule = MVP.
- **US2 (P2)** : dépend du noyau React 19.2 (Foundational) ; séquencée après US1 par discipline
  de paliers. Le seul *breaking* Sanity v4→v5 est React 19.2, déjà apporté en Foundational.
- **US3 (P3)** : dépend de US1 **et** US2 (vérifie la branche entièrement migrée + CI).

### Within Each User Story

- Les tâches d'**édition** [P] (fichiers différents) précèdent les tâches de **vérification**
  (build, smoke) qui en dépendent.
- US1 : éditions (T008-T013) → build (T014) → smokes (T015-T019).
- US2 : bumps (T020) → typegen (T021) → vérifs ciblées (T022-T023) → build/seed (T024-T025) →
  smokes Studio/draft/revalidation (T026-T028).

### Parallel Opportunities

- **Setup** : T002, T003, T004 en parallèle (lecture seule, fichiers/artefacts distincts).
- **Foundational** : T007 [P] (confirmation Node) indépendant ; T005 → T006 séquentiels.
- **US1 — éditions** : T008 (`package.json`), T009 (`proxy.ts`), T010 (`route.ts`),
  T011 (`next.config.ts`), + scans T012/T013 → tous [P] (fichiers différents / lecture seule).
- **Polish** : T034 et T035 [P] (ADR distincts) ; T039 [P] (dépôt séparé / gouvernance).

---

## Parallel Example: US1 — éditions des breaking changes

```bash
# Lancer ensemble les éditions ponctuelles (fichiers différents, sans interdépendance) :
Task T008: "package.json — drop --turbopack du script dev"
Task T009: "src/middleware.ts → src/proxy.ts (fonction + config)"
Task T010: "src/app/api/revalidate/route.ts — revalidateTag('sanity','max')"
Task T011: "next.config.ts — revue options v16"
Task T012: "scan src/ — API retirées v16"
Task T013: "scan src/ — Async Request APIs"
# Puis (séquentiel) : T014 build → T015-T019 smokes.
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 Setup (baseline v15 verte + référence visuelle).
2. Phase 2 Foundational (codemod + Next 16 / React 19.2 — BLOQUANT).
3. Phase 3 US1 (breaking changes Next 16 + parité).
4. **STOP & VALIDER** : gate US1 (lint + build + gate 4 états + parité). Déployable comme MVP
   (site sur Next 16, Sanity v4) si besoin.

### Incremental Delivery (paliers vérifiables)

1. Setup + Foundational → socle de versions prêt.
2. US1 → gate vert → site sur Next 16 (palier 1).
3. US2 → gate vert → Sanity v5 (palier 2).
4. US3 → branche intégrée + CI verts.
5. Polish → ADR + Docker + contrats + déploiement.

Chaque palier doit être **lint + build verts** avant de passer au suivant (un commit par palier
au minimum, Conventional Commits en anglais).

---

## Notes

- `[P]` = fichiers différents, aucune dépendance non satisfaite.
- Pas de tâches de test TDD : la vérification passe par lint + build + smoke + `seed:check`
  (cf. plan.md « Testing »).
- **Verify Before Acting** : le codemod (T005) modifie du code → relire chaque diff avant commit ;
  vérifier les versions/peers en direct (`npm view`) au moment de l'exécution (research §D1).
- Divergence connue : spec.md cite `next-sanity@12` par endroits ; la décision résolue
  (research §D1, plan, quickstart) est `next-sanity@13.0.12` en restant en **Sanity v5**.
- Rollback : migration confinée à la branche ; `git revert` du commit de palier ou abandon de
  branche ; Coolify redéploie le dernier `main` (v15) inchangé (quickstart § Rollback).
