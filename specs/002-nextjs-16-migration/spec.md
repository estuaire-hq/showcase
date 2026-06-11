# Feature Specification: Migration Next.js v15 → v16 + Sanity v4 → v5 (latest stable)

**Feature Branch**: `002-nextjs-16-migration`
**Created**: 2026-06-11
**Status**: Draft
**Input**: User description: "on va faire la migration nextjs v15 -> v16 latest stable." (+ décision
de profiter de la migration pour monter aussi le stack Sanity de v4 à v5).

## Contexte

Le site Estuaire tourne aujourd'hui sur **Next.js 15.3** (App Router, React 19.1,
Tailwind v4, Sanity v4 embarqué via `next-sanity@11`, déploiement Docker `standalone`
via Coolify). L'objectif est de passer à **Next.js 16 dernière stable** (16.2.9 au
moment de la rédaction) en absorbant les *breaking changes* obligatoires, **sans
régression visible** pour les visiteurs, les éditeurs de contenu, ni la chaîne de dev/CI.

**Le périmètre inclut également la montée du stack Sanity de v4 à v5** (`sanity` 5.31.x
stable, `next-sanity@13`, `@sanity/client@7`). Cette montée est intégrée ici car elle est
**alignée** avec la migration Next 16 : le seul *breaking change* de Sanity v4 → v5 est
l'exigence de **React 19.2**, que Next 16 impose déjà. Une fois React 19.2 en place pour
Next 16, le saut Sanity v5 ne casse ni les schémas, ni la structure, ni les seeds, ni les
plugins (pas de *breaking change* sur l'API Studio). On reste sur **Sanity v5 stable** ;
**Sanity v6 est explicitement hors périmètre** (uniquement disponible en pré-version
`6.0.0-next`, non stabilisée).

Il s'agit d'une migration de type *lift* : on applique les changements rendus
nécessaires par les nouvelles versions et on vérifie l'iso-fonctionnement ; l'adoption des
nouvelles fonctionnalités optionnelles de la v16 (Cache Components / PPR, React Compiler,
View Transitions, cache disque Turbopack) est **hors périmètre** (voir *Hors périmètre*).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Le site public tourne en prod sur Next.js 16 sans régression (Priority: P1)

En tant que **visiteur**, je continue d'accéder au site Estuaire avec exactement le
même rendu, les mêmes pages, les mêmes animations (scroll fluide Lenis, reveals GSAP)
et les mêmes performances qu'avant — sans savoir qu'une migration a eu lieu.

**Why this priority**: C'est la raison d'être de la migration. Si seule cette story
est livrée — l'application *build*, se déploie sur Coolify et s'affiche à l'identique —
la migration apporte déjà sa valeur (être sur une version supportée, plus rapide).

**Independent Test**: Déployer la branche, ouvrir le site déployé, parcourir toutes
les pages existantes et comparer (visuel + comportement + animations) à la prod v15.
Aucune différence visible, aucune erreur console/hydratation.

**Acceptance Scenarios**:

1. **Given** la branche migrée déployée, **When** un visiteur ouvre la page d'accueil
   et fait défiler, **Then** le rendu est identique à la v15 et le scroll fluide +
   les animations d'entrée fonctionnent comme avant.
2. **Given** un build de production (image Docker `standalone`), **When** Coolify le
   construit et le démarre, **Then** le build réussit et le conteneur sert le site
   sur le port attendu sans erreur runtime.
3. **Given** le mode « coming soon » activé (`SITE_PREVIEW_TOKEN` défini), **When** un
   visiteur sans cookie ouvre n'importe quelle route, **Then** il voit le placeholder ;
   **When** il visite le lien d'accès `/v/<token>`, **Then** le cookie est posé et il
   accède au site réel — comportement strictement identique à la v15.
4. **Given** le mode « coming soon » désactivé (variable absente), **When** un visiteur
   ouvre une route, **Then** le site est ouvert publiquement (gate no-op).

---

### User Story 2 - Le stack de contenu passe en Sanity v5 et reste pleinement opérationnel (Priority: P2)

En tant qu'**éditeur de contenu** (et mainteneur), le stack Sanity est monté en v5
(ligne maintenue, alignée Next 16 via `next-sanity@13`) **sans perte de fonctionnalité** :
le Studio embarqué fonctionne, mes schémas/structure/seeds sont intacts, je prévisualise
mes brouillons (draft mode / Visual Editing) et mes publications apparaissent sur le site.

**Why this priority**: Garde le projet sur une ligne Sanity supportée et débloque
`next-sanity@12` (aligné sur Next 16), tout en garantissant qu'aucune capacité d'édition
n'est perdue. Subordonné au fait que le site rende d'abord (P1), mais essentiel à la
maintenabilité.

**Independent Test**: Une fois Next 16 + React 19.2 en place, monter Sanity v5 +
`next-sanity@13` + `@sanity/client@7`, régénérer les types (`npm run typegen`), ouvrir
`/studio`, éditer/publier un document, déclencher la revalidation et constater la mise à
jour côté site.

**Acceptance Scenarios**:

1. **Given** Sanity monté en v5 sous Next 16, **When** un éditeur ouvre `/studio`,
   **Then** le Studio v5 se monte et fonctionne (auth, navigation desk, édition, Vision)
   avec les schémas, la structure et la locale `fr-FR` inchangés.
2. **Given** le schéma extrait à jour, **When** `npm run typegen` est exécuté, **Then**
   les types générés (`src/sanity.types.ts`) sont régénérés et le projet compile sans
   erreur de type.
3. **Given** un contenu publié dans Sanity, **When** le webhook `POST /api/revalidate`
   est reçu avec une signature valide, **Then** les caches Sanity sont invalidés et la
   nouvelle valeur apparaît côté site (revalidation effective de bout en bout, sous
   `@sanity/client@7`).
4. **Given** le draft mode activé, **When** un éditeur prévisualise un document, **Then**
   `SanityLive` + `VisualEditing` fonctionnent et l'aperçu se met à jour en direct.
5. **Given** la nouvelle stratégie cache/live de `@sanity/client@7` (combinaison
   `useCdn: true` + `serverToken` via `defineLive`), **When** le site lit du contenu
   publié (CDN) et des brouillons (token), **Then** chaque mode sert la bonne source
   sans régression (publié = cache CDN ; brouillon = données live).

---

### User Story 3 - La chaîne de développement et d'intégration reste verte (Priority: P3)

En tant que **développeur**, je lance le serveur de dev, le lint, le build et les jobs
CI/seed comme avant, sans friction nouvelle introduite par les montées de version.

**Why this priority**: Indispensable pour la suite du projet, mais n'affecte pas
directement l'utilisateur final ni l'éditeur ; vient donc après P1/P2.

**Independent Test**: `npm run dev`, `npm run lint`, `npm run build`, `npm run typegen`,
`npm run seed:check` en local + pipeline CI sur la branche ; tous verts.

**Acceptance Scenarios**:

1. **Given** la branche migrée, **When** `npm run dev` est lancé, **Then** le serveur
   démarre (Turbopack par défaut) et le hot-reload fonctionne.
2. **Given** la branche migrée, **When** le pipeline CI s'exécute, **Then** les jobs
   `lint` (Biome) et `build` (Next 16 + typecheck) passent au vert.
3. **Given** la branche migrée, **When** `npm run build` est lancé, **Then** le build
   de production aboutit et produit la sortie `standalone` exploitable par le Dockerfile.
4. **Given** Sanity v5 en place, **When** `npm run seed:check` puis le job seed CI
   s'exécutent, **Then** le scaffolding/validation des seeds fonctionne (TypeGen v5).

---

### Edge Cases

- **Build Turbopack en production** : Next 16 build avec Turbopack par défaut. Si un
  plugin injecte une config `webpack`, le build échoue volontairement. → S'assurer
  qu'aucune config webpack implicite n'est présente ; sinon documenter le repli
  `next build --webpack`.
- **`revalidateTag` à un seul argument** : produit désormais une erreur TypeScript. →
  Le second argument (profil `cacheLife`) doit être fourni, et la revalidation Sanity
  doit rester fonctionnelle de bout en bout (pas seulement compiler).
- **`@sanity/client` v6 → v7** : changement de comportement de la combinaison
  `useCdn: true` + `token` (passe désormais par le CDN caché au lieu de l'API live). →
  Valider que la lecture du contenu publié (CDN) et des brouillons (token via `defineLive`)
  reste correcte ; vérifier l'`apiVersion` (`2026-03-01`) et la config `stega`.
- **TypeGen sous Sanity v5** : le schéma extrait et `src/sanity.types.ts` doivent être
  régénérés ; le code consommateur doit compiler avec les types régénérés.
- **Studio v5 sous Next 16** : le Studio embarqué doit se monter ; vérifier qu'aucun
  plugin/customisation (locale `fr-FR`, structure desk, Vision) ne casse.
- **Gate « coming soon »** : une erreur dans la migration `middleware → proxy` peut soit
  exposer le site (gate inopérant) soit verrouiller tout le monde dehors. → Tester les
  quatre états (token absent / présent ; avec / sans cookie ; lien d'accès valide / invalide).
- **Images Sanity** : nouveaux défauts `next/image` en v16 (`qualities` limité à `[75]`,
  `minimumCacheTTL` à 4 h, `16` retiré de `imageSizes`). → Vérifier que les images
  servies depuis `cdn.sanity.io` s'affichent sans dégradation perçue.
- **Scroll fluide & navigation** : la v16 ne surcharge plus `scroll-behavior` et revoit
  le préchargement/navigation. → Vérifier que Lenis et les transitions inter-pages se
  comportent comme avant (le site n'utilise pas `scroll-behavior: smooth` en CSS).
- **Sitemap** : `src/app/sitemap.ts` est statique (pas de `generateSitemaps`), donc le
  changement « `id` asynchrone » ne s'applique pas — à confirmer.
- **Cohérence des versions Node** : Dockerfile, CI et job seed doivent tous tourner sur
  Node ≥ 20.9 (actuellement `node:22` partout). → Confirmer, aucun environnement résiduel
  en Node 18.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Les dépendances DOIVENT être montées vers Next.js 16 dernière stable
  (16.2.9 au moment de la rédaction — figer la dernière stable au moment de l'exécution),
  avec `react` / `react-dom` en 19.2.x et `@types/react` / `@types/react-dom` alignés.
- **FR-002**: Le stack Sanity DOIT être monté de v4 à **v5 stable** (`sanity` 5.31.x,
  `@sanity/vision` v5, `@sanity/client` v7, `next-sanity` v13, `@sanity/image-url` et
  `@sanity/locale-fr-fr` aux versions compatibles), **sans toucher** aux schémas, à la
  structure desk, ni aux seeds (pas de *breaking change* d'API Studio). **Sanity v6 est
  exclu** (pré-version `next-major` non stable).
- **FR-003**: Le `middleware` DOIT être migré vers `proxy` (`src/middleware.ts` →
  `src/proxy.ts`, fonction `middleware` → `proxy`, suppression de `runtime: "nodejs"`
  non configurable en proxy) en **préservant à l'identique** le comportement du gate
  « coming soon » (placeholder, lien d'accès `/v/<token>`, cookie, matcher).
- **FR-004**: L'appel `revalidateTag("sanity")` DOIT être mis en conformité avec la
  nouvelle API à deux arguments de la v16, **en préservant l'invalidation effective**
  des caches Sanity déclenchée par le webhook de revalidation.
- **FR-005**: Le code DOIT n'utiliser que les Async Request APIs (cookies, headers,
  draftMode, params, searchParams) en accès asynchrone ; tout accès synchrone résiduel
  DOIT être éliminé (l'usage actuel `await draftMode()` est déjà conforme — à confirmer
  qu'aucun autre accès synchrone n'existe).
- **FR-006**: Le build de production DOIT aboutir avec Turbopack (défaut v16) et produire
  une sortie `standalone` exploitable par le Dockerfile ; en cas d'échec dû à une config
  webpack implicite, le repli `next build --webpack` DOIT être documenté et appliqué.
- **FR-007**: Les scripts `package.json` DOIVENT être mis à jour (`dev` : retrait du
  `--turbopack` désormais redondant), sans casser `start`, `lint`, `typegen`, `seed*`.
- **FR-008**: `next.config.ts` DOIT être revu pour les options renommées/retirées en v16
  (pas de `images.domains`, pas de `experimental.ppr`, pas de `serverRuntimeConfig`/
  `publicRuntimeConfig`, pas d'`amp`, pas d'option `eslint`, `experimental.turbopack` →
  `turbopack` au niveau racine si présent) et confirmé conforme.
- **FR-009**: Le rendu des images DOIT être vérifié au regard des nouveaux défauts
  `next/image` v16 ; si un comportement dégrade l'affichage, la configuration
  (`images.qualities`, `minimumCacheTTL`, `imageSizes`) DOIT être ajustée explicitement.
- **FR-010**: Le Studio Sanity embarqué (`/studio`) DOIT se monter et fonctionner sous
  Next 16 **en version v5** (navigation desk, édition, Vision, locale `fr-FR`).
- **FR-011**: Le draft mode, `SanityLive` et `VisualEditing` DOIVENT rester fonctionnels
  sous `next-sanity@12` / `@sanity/client@7` ; la stratégie cache/live (publié via CDN,
  brouillon via token) DOIT être validée de bout en bout.
- **FR-012**: Les types Sanity DOIVENT être régénérés (`npm run typegen` : extraction du
  schéma + génération) et le projet DOIT compiler avec `src/sanity.types.ts` régénéré ;
  la chaîne de seeds (`seed:check`) DOIT rester fonctionnelle.
- **FR-013**: `sitemap.ts` et `robots.ts` DOIVENT continuer de se générer correctement.
- **FR-014**: Le scroll fluide (Lenis) et les animations (GSAP / `@gsap/react`) DOIVENT
  se comporter comme avant, y compris lors des transitions inter-pages, et respecter
  `prefers-reduced-motion`.
- **FR-015**: La cohérence des versions Node DOIT être confirmée ≥ 20.9 sur tous les
  environnements (Dockerfile, CI `ci.yml`, job `seed-sanity.yml`).
- **FR-016**: Le pipeline CI (jobs `lint` Biome + `build`) DOIT passer au vert sur la
  branche de migration.
- **FR-017**: Le code DOIT être exempt de toute API retirée en v16 (AMP / `next/amp`,
  `serverRuntimeConfig`/`publicRuntimeConfig`, options `devIndicators` supprimées,
  `next/legacy/image`, `unstable_rootParams`, commande `next lint`) — confirmé par scan.
- **FR-018**: La décision de migration (cibles de version Next 16 + Sanity v5, exclusion
  de Sanity v6, périmètre *lift*, choix Turbopack, alignement React 19.2) DOIT être
  consignée en ADR dans `docs/vault/decisions/` conformément à la convention projet.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des pages existantes rendent à l'identique de la v15 (parité
  visuelle et fonctionnelle constatée page par page), sans erreur console ni d'hydratation.
- **SC-002**: Le gate « coming soon » se comporte correctement dans ses 4 états testés
  (token absent → ouvert ; token présent sans cookie → placeholder ; lien d'accès valide
  → déverrouillage ; cookie valide → site réel).
- **SC-003**: Le Studio v5 se monte et est pleinement éditable ; aucune capacité
  d'édition perdue (schémas, structure, Vision, locale `fr-FR` intacts).
- **SC-004**: `npm run typegen` régénère les types et le projet compile (typecheck vert) ;
  aucun document de contenu altéré ou perdu par la montée Sanity.
- **SC-005**: Un contenu publié dans Sanity apparaît côté site après revalidation, dans
  le même délai qu'en v15 (revalidation + draft mode fonctionnels sous `@sanity/client@7`).
- **SC-006**: Le pipeline CI (lint + build) est vert sur la branche de migration.
- **SC-007**: L'image Docker `standalone` se construit et démarre, et sert le site sans
  erreur runtime.
- **SC-008**: Aucune nouvelle erreur ni avertissement bloquant introduit (console
  navigateur, logs serveur, sortie de build).
- **SC-009**: Le scroll fluide et les animations se comportent comme en v15 (validation
  visuelle), `prefers-reduced-motion` respecté.
- **SC-010**: Zéro occurrence résiduelle d'API dépréciée/retirée par la v16 dans le code.

## Assumptions

- **« latest stable » = Next 16.2.x** (16.2.9 à la rédaction) et **Sanity 5.31.x** ; les
  dernières stables disponibles au moment de l'exécution seront figées. Les canaux
  `canary`/`beta`/`preview`/`next-major` sont exclus.
- **Sanity monte en v5, pas en v6.** Sanity v6 n'existe qu'en pré-version (`6.0.0-next`),
  non stabilisée → hors périmètre. La v5 est la dernière stable.
- **La montée Sanity v4 → v5 est « peu coûteuse » par alignement** : son seul prérequis
  *breaking* est React 19.2, déjà apporté par Next 16 ; aucun *breaking change* d'API
  Studio (schémas, structure, plugins, seeds inchangés). Le principal point de vigilance
  est le bump transitif `@sanity/client` v6 → v7 (stratégie cache/live).
- **Migration de type *lift*** : seuls les *breaking changes* obligatoires sont appliqués ;
  les nouvelles fonctionnalités optionnelles de la v16 ne sont pas adoptées ici.
- **Turbopack adopté** pour le dev et le build de production (nouveau défaut v16) ; repli
  `--webpack` uniquement si le build échoue à cause d'une config webpack implicite.
- **Node ≥ 20.9 déjà en place** partout (`node:22` dans le Dockerfile, CI et seed) — aucun
  bump Node requis, simple confirmation.
- **Biome reste le linter** ; la suppression de `next lint` en v16 est sans effet (le
  projet n'utilise pas `next lint`, `npm run lint` = `biome check`).
- Pas de routes parallèles (`@slots`) ni de `generateSitemaps`/`generateImageMetadata`
  dans le projet — les *breaking changes* correspondants ne s'appliquent pas (confirmé par scan).

## Dependencies

- React 19.2 est requis **à la fois** par l'App Router de Next 16 **et** par Sanity v5 —
  c'est le pivot qui rend les deux montées cohérentes en un seul lot.
- `next-sanity@13` exige `next ^16`, `sanity ^5.29 || ^6`, `@sanity/client ^7.22.1`,
  `react/react-dom ^19.2`, `styled-components ^6.1.15` (on reste en **Sanity v5**).
- Le codemod officiel `@next/codemod@canary upgrade latest` est disponible pour
  automatiser une partie de la migration Next (config, middleware→proxy, retrait `unstable_`).
- L'environnement de build Coolify doit tourner sur Node ≥ 20.9 (base `node:22` déjà en place).

## Out of Scope

- Montée **Sanity v6** (pré-version `next-major`, non stable).
- Adoption de **Cache Components / PPR** (`cacheComponents`) — change le modèle de cache.
- Adoption du **React Compiler** (`reactCompiler`).
- Adoption des nouveautés React 19.2 (**View Transitions**, **Activity**, `useEffectEvent`)
  et du **cache disque Turbopack** (beta).
- Refonte du modèle de données/contenu : la montée Sanity v5 conserve schémas, structure
  et seeds tels quels (pas de remodelage de contenu).
- Suppression du groupe de routes `(lab)` et de ses assets (nettoyage déjà prévu ailleurs).
- Toute optimisation de performance au-delà de l'iso-fonctionnement (les nouvelles versions
  apportent leurs propres gains sans changement de code).
