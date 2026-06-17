# Tasks: Page « Nous découvrir »

**Input**: Design documents from `/specs/007-discover-us-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Aucune tâche de test automatisé. La spec ne demande ni TDD ni tests unitaires ;
la vérification de ce type de page (visuelle + CMS) passe par `lint` / `typegen` / `build`
/ `seed:check` + la **revue pixel-perfect** (skill `estuaire-pixel-review`) + les contrôles
d'accessibilité / reduced-motion / CMS round-trip, conformément aux critères de succès.

**Organization**: tâches groupées par user story (spec.md) pour une livraison incrémentale
testable indépendamment. Charger les skills avant la tâche correspondante :
`estuaire-figma-cli` (lire la maquette), `estuaire-pixel-perfect` (build), `estuaire-motion`
(cinématiques), `estuaire-pixel-review` (sign-off).

## Execution status — 2026-06-16

**Done (31/35)**: Setup + Foundational (T001–T013), US1 (T014–T020), US2 (T021–T026),
seed dev (T027 — `npm run seed -- aboutPage --reset`, 19 visuels), a11y + reduced-motion
(T030–T031), **pixel review across the 3 breakpoints** (T020/T026/T033), vault (T035 → ADR 0012).
Dev `aboutPage` seeded + rendered (gate off): 200, single `<h1>`, h2/h3, nav tones, 8 sections
in maquette order, all 19 images, no runtime errors. Gates: `lint` ✓, `typegen` ✓,
`seed:check` ✓, `build` compiles + type-checks ✓.

**Pixel review (T033) — verified per section vs the cached Figma renders, 3 breakpoints:**
- Desktop: faithful; fixed the intro highlight panel (offset/constrained, not full-width) +
  added vertical rhythm to atelier/process.
- Tablet: section grids promoted `lg:`→`md:` so intro/atelier/steps render 2-col matching the
  768 frame (no horizontal overflow).
- Mobile: faithful mobile-first stack.
- **Named deviations (intended / deferred, not "fixed back"):** process steps are STACKED on
  tablet/mobile where the maquette uses a swipe CAROUSEL (ADR 0012 §4 — taller sections, same
  content, accessible no-JS baseline); vertical whitespace slightly tighter than the frame in a
  couple of spots; minor image box deltas (≤~10%).

**Remaining open (4/35):**
- **T028** Studio ergonomics — schema groups + `processStep` preview are defined and the
  seed→render path is proven; full manual Studio QA (drag-reorder, add/remove) not exercised.
- **T029** CMS round-trip — read path proven (seed → page reflects after cache bust);
  edit→`revalidateTag("sanity")`→render uses the same global webhook as the home (unchanged).
- **T032** perf — `next/image` + LQIP + `sizes` wired; LCP/CLS budget not measured.
- **T034** `build` — `lint`/`typegen`/`seed:check` green + build compiles & type-checks; the
  **prerender** needs Sanity env (as for the home — `next build` is prod mode, does not load
  `.env.development`; prod env lives in Coolify).

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance non satisfaite)
- **[Story]** : US1 / US2 / US3 (phases user story uniquement)
- Chemins de fichiers absolus depuis la racine du dépôt.

## Path Conventions

Projet Next.js unique, App Router feature-based (plan.md). Chemins relatifs à
`/home/payangar/Estuaire/showcase/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: lire la source de vérité et poser la route.

- [X] T001 Charger `estuaire-figma-cli` + lire la maquette `about` complète par breakpoint : `npm run figma -- read about`, `read about --bp=tablet`, `read about --bp=mobile`, `read about --images` — relever géométrie, copie et inventaire des 22 visuels par section (`02/ SLIDER` … `08/ CTA`). Ne jamais deviner (Principe VII).
- [X] T002 Créer la route `src/app/(site)/nous-decouvrir/page.tsx` comme RSC placeholder minimal (rend un `<main>` + TODO) pour que `/nous-decouvrir` résolve.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: couche de données + coquille de page partagées par toutes les stories.

**⚠️ CRITICAL**: aucune story ne peut commencer avant la fin de cette phase.

- [X] T003 Créer le schéma `src/sanity/schemas/documents/aboutPage.ts` — `defineType` singleton, groupes (`hero`/`intro`/`vision`/`atelier`/`process`/`statement`/`cta`/`seo`), tous les champs + l'objet `processStep` + le helper `imageField`, conformément à `data-model.md` et `contracts/content-model.md`.
- [X] T004 Enregistrer `aboutPage` dans `src/sanity/schemas/index.ts` (`schemaTypes`).
- [X] T005 Épingler le singleton dans `src/sanity/structure.ts` : ajouter `"aboutPage"` à `SINGLETONS` + un `S.listItem()` « Nous découvrir » (`documentId("aboutPage")`).
- [X] T006 Lancer `npm run typegen` → régénérer `src/sanity.types.ts` (commité) ; vérifier que `AboutPage` est généré (dépend de T003/T004).
- [X] T007 Ajouter `ABOUT_PAGE_QUERY` dans `src/lib/sanity/queries.ts` — projection complète `*[_id == "aboutPage"][0]{…}` + `"lqip": asset->metadata.lqip` sur chaque image (esquisse dans `contracts/content-model.md`).
- [X] T008 [P] Créer `src/content/aboutPage.ts` — copie maquette **texte uniquement** (source unique seed ↔ repli, Principe IX), lue sur Figma (`\n` significatifs).
- [X] T009 Créer `src/lib/sanity/aboutPage.ts` — `getAboutPageProps()` (fetch `sanityFetch` + defaults `aboutPageContent` + `urlFor`/`lqip` via `mapImage`) + `type AboutPageProps`, miroir de `src/lib/sanity/homePage.ts` (dépend de T006/T007/T008).
- [X] T010 [P] Curer les visuels maquette dans `seed-assets/aboutPage/` (depuis `.design/figma-cache/assets/`), committés, hors `public/`.
- [X] T011 Créer `src/sanity/seed/documents/aboutPage.seed.ts` (`defineSeed<AboutPage>`, texte depuis `@/content/aboutPage.ts`, images via `image("seed-assets/aboutPage/…")`, `_type: "processStep"` sur les membres) + l'enregistrer dans `src/sanity/seed/registry.ts` (dépend de T003/T006/T008/T010).
- [X] T012 Lancer `npm run seed:check` (dry-run offline : champs required + assets sur disque) — corriger jusqu'au vert (dépend de T011).
- [X] T013 Implémenter la coquille du connecteur dans `src/app/(site)/nous-decouvrir/page.tsx` : `getAboutPageProps()`, `generateMetadata()` (SEO + repli), `<main data-nav-logo-tone=… data-nav-links-tone=… data-nav-toggle-tone=…>` (tonalité **lue sur le node hero** au build) + emplacements de sections vides (dépend de T009).

**Checkpoint**: la route fetche le singleton, rend la coquille + SEO ; couche de données prête.

---

## Phase 3: User Story 1 - Comprendre qui est Estuaire et adhérer à sa vision (Priority: P1) 🎯 MVP

**Goal**: hero + intro + « Notre vision » rendus, fidèles à la maquette, communiquant
l'identité et la philosophie d'Estuaire.

**Independent Test**: ouvrir `/nous-decouvrir` → le hero (visuel + encart titre), l'intro
(phrase de positionnement + texte + 2 visuels + phrase phare) et le bloc « Notre vision »
s'affichent, lisibles, fidèles à `51:2699` sur les 3 formats — sans dépendre des sections
suivantes.

### Implementation for User Story 1

- [X] T014 [P] [US1] Créer `src/design-system/components/PageHero.tsx` (visuel plein cadre + encart titre sombre rendu en `<h1>` via `BrandText` + trait de séparation, **statique**) + l'exporter dans `src/design-system/index.ts` ; géométrie ← encart `@(140,620)` de `51:2699`.
- [X] T015 [P] [US1] Créer `src/design-system/components/Pullquote.tsx` (énoncé centré, `BrandText`, `currentColor`, type de marque) + l'exporter dans `src/design-system/index.ts`.
- [X] T016 [US1] Composer la section **hero** dans `src/app/(site)/nous-decouvrir/page.tsx` avec `PageHero` (props `hero.title` / `hero.image`) (dépend de T013/T014).
- [X] T017 [US1] Composer la section **intro** dans `page.tsx` (phrase de positionnement + texte `whitespace-pre-line` + 2 visuels `next/image`+LQIP + `Pullquote` pour `intro.highlight`) dans `<Parallax>` (dépend de T013/T015).
- [X] T018 [US1] Composer la section **vision** dans `page.tsx` (`SectionTitle` outline/fill + texte + `vision.images[]` mappés par index) dans `<Parallax>` (dépend de T013).
- [X] T019 [US1] Appliquer `estuaire-motion` aux sections US1 : reveal line-mask des titres, parallaxe/clip des visuels (hero **statique**, rien au premier paint) ; honorer `prefers-reduced-motion`.
- [X] T020 [US1] Revue pixel (skill `estuaire-pixel-review`) des sections hero/intro/vision par breakpoint (side-by-side + overlay + diff vs render `51-2699`/`78-4374`/`78-4626`) ; boucler fix→recapture jusqu'à zéro écart.

**Checkpoint**: US1 pleinement fonctionnelle et testable seule (MVP — la page raconte l'identité).

---

## Phase 4: User Story 2 - Se rassurer sur la capacité industrielle et la méthode (Priority: P2)

**Goal**: atelier + mode opératoire + grand visuel + CTA rendus, prouvant la capacité à
faire et à livrer, et poussant vers les Expertises.

**Independent Test**: faire défiler `/nous-decouvrir` jusqu'au bas → l'atelier (titre,
texte, piliers, capacités, visuels, phrase phare), les 4 étapes du mode opératoire, le
grand visuel + incrustation et le CTA « découvrir nos expertises » (→ `/expertises`)
s'affichent, fidèles à la maquette.

### Implementation for User Story 2

- [X] T021 [US2] Composer la section **atelier** dans `page.tsx` (`SectionTitle` + texte + `pillarsLead` + `pillars[]` + `capabilities[]` + `atelier.images[]` par index + `Pullquote` pour `atelier.highlight`) dans `<Parallax>` (dépend de T013 ; réutilise `Pullquote` T015).
- [X] T022 [US2] Composer la section **mode opératoire** dans `page.tsx` (`SectionTitle` + `process.intro` + map `process.steps[]` → numéro + titre + texte + puces optionnelles + visuels) dans `<Parallax>` ; une étape sans `bullets` reste correctement mise en page (cas limite) (dépend de T013).
- [X] T023 [US2] Composer la bande **grand visuel** dans `page.tsx` avec `FeatureBlock` (`statement.image` + `statement.text` en incrustation, **sans CTA**) ; confirmer sur `51:2881` que `FeatureBlock` convient, sinon lui ajouter une variante (acte DS délibéré, research §5) (dépend de T013).
- [X] T024 [US2] Composer le **CTA** « découvrir nos expertises » dans `page.tsx` avec `Button` (`href = cta.href`, def. `/expertises`) + `data-umami-event="about_cta_click"` `data-umami-event-section="expertises"` (Principe VI) (dépend de T013).
- [X] T025 [US2] Appliquer `estuaire-motion` aux sections US2 (reveals titres, parallaxe visuels, une motion focale à la fois) ; honorer `prefers-reduced-motion`.
- [X] T026 [US2] Revue pixel (skill `estuaire-pixel-review`) des sections atelier/mode opératoire/grand visuel/CTA par breakpoint vs renders Figma ; boucler fix→recapture jusqu'à zéro écart.

**Checkpoint**: US1 + US2 fonctionnent ; la page est complète visuellement.

---

## Phase 5: User Story 3 - Maîtrise éditoriale du contenu (Priority: P3)

**Goal**: tout le contenu de la page est éditable via le CMS, avec repli maquette ;
l'éditeur travaille sans développeur.

**Independent Test**: dans le Studio, modifier un texte / visuel / étape de `aboutPage` →
le changement apparaît sur `/nous-decouvrir` après revalidation, sans redéploiement ; vider
un champ → la valeur maquette par défaut s'affiche.

### Implementation for User Story 3

- [X] T027 [US3] Lancer `npm run seed -- aboutPage` sur le projet **dev** pour peupler le contenu éditable + uploader les visuels (⚠️ nécessite le write token dev — fourni par Pierre ; jusque-là le front rend le repli texte de `aboutPageContent`).
- [ ] T028 [US3] Vérifier l'ergonomie d'édition Studio : onglets (groupes), `preview` de `processStep` (titre + numéro + média), ajout / retrait / réordonnancement des `processSteps`, `pillars`, `capabilities` et arrays d'images — sans crash de l'éditeur.
- [ ] T029 [US3] Vérifier le round-trip CMS : éditer un champ dans le Studio → reflété sur `/nous-decouvrir` après `revalidateTag("sanity")` (SC-005) ; vider un champ → repli maquette rendu, aucune zone vide (SC-006).

**Checkpoint**: les 3 stories livrées ; page complète + éditable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: qualité transverse + sign-off pixel-perfect obligatoire.

- [X] T030 [P] Passe accessibilité & chrome de site (FR-015 / FR-017 / SC-004) : un seul `<h1>` (hero), titres de section en `<h2>`, navigation clavier de bout en bout (0 piège), `alt` sur tous les visuels, contrastes suffisants ; **vérifier que le bouton flottant de retour en haut** (`ScrollTopMount`, hérité du shell `(site)/layout.tsx` — aucune tâche d'implémentation, FR-017) apparaît au scroll et ramène en haut sur `/nous-decouvrir`.
- [X] T031 [P] Passe reduced-motion (FR-014 / SC-004) : `prefers-reduced-motion` → contenu statique complet et lisible, aucune animation automatique gênante, toutes sections parcourables.
- [ ] T032 [P] Passe performance (SC-007 / FR-018) : `next/image` `sizes` corrects + placeholders LQIP sur tous les visuels ; pas de décalage de mise en page ; premier écran lisible < 2,5 s mobile ; contenu de base rendu même sans visuels/animations.
- [X] T033 Revue pixel **finale obligatoire** (skill `estuaire-pixel-review`) : page entière, 3 breakpoints, diff section par section vs renders Figma ; boucler fix→recapture jusqu'à zéro écart ; nommer tout écart résiduel « UNVERIFIED » (SC-003 / Principe VII).
- [ ] T034 Vérifier les gates au vert : `npm run lint`, `npm run typegen`, `npm run build`, `npm run seed:check`.
- [X] T035 [P] Consigner toute leçon de méthode / décision changée en cours de build dans `docs/vault/` (ex. variante `FeatureBlock` pour la bande grand-visuel, extraction éventuelle d'un `ProcessStep`) — avant de clore (CLAUDE.md « post-mortems »).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001-T002)** : T001 (lecture maquette) d'abord ; aucune dépendance.
- **Foundational (T003-T013)** : bloque toutes les stories. Chaîne schéma : T003 → T004/T005 → T006 → T009/T011. T007/T008/T010 parallélisables. T012 après T011. T013 après T009.
- **US1 (P1)** : démarre après Foundational. **MVP** — peut être livrée seule.
- **US2 (P2)** : démarre après Foundational ; indépendante d'US1 au niveau rendu (sections distinctes), mais éditant le même `page.tsx` → séquencer après US1 en pratique.
- **US3 (P3)** : après que le contenu est rendu (US1/US2) ; T027 nécessite le token dev.
- **Polish (T030-T035)** : après US1+US2 (T033 après tout le rendu).

### Story Independence

- **US1** raconte l'identité/vision : déployable seule (MVP viable).
- **US2** ajoute la preuve de capacité + le CTA de conversion : s'empile sur US1.
- **US3** est la couche d'autonomie éditoriale : valide le round-trip CMS du modèle déjà
  posé en Foundational.

---

## Parallel Execution Examples

**Foundational** — après T003 (schéma) :
```
T008 [P] content/aboutPage.ts   +   T010 [P] seed-assets/aboutPage/
```
(puis T006 typegen → T009 mapping → T011 seed → T012 check)

**US1** — primitifs DS en parallèle (fichiers différents) :
```
T014 [P] PageHero.tsx   +   T015 [P] Pullquote.tsx
```
(puis T016/T017/T018 éditent `page.tsx`, séquentiels)

**Polish** — passes transverses en parallèle :
```
T030 [P] a11y   +   T031 [P] reduced-motion   +   T032 [P] perf   +   T035 [P] vault
```
(T033 revue pixel finale après ; T034 gates)

---

## Implementation Strategy

### MVP First (US1 only)

1. Setup (T001-T002) → Foundational (T003-T013) → **US1 (T014-T020)**.
2. **STOP & VALIDATE** : `/nous-decouvrir` rend hero + intro + vision, fidèle à la maquette,
   contenu lisible — la page raconte déjà l'identité d'Estuaire. Déployable.

### Incremental Delivery

- **+ US2 (T021-T026)** : capacité industrielle + méthode + CTA → page complète.
- **+ US3 (T027-T029)** : autonomie éditoriale (seed dev + vérif round-trip CMS).
- **+ Polish (T030-T035)** : a11y, reduced-motion, perf, **revue pixel finale obligatoire**, gates.

### Notes

- Aucune nouvelle dépendance npm. Deux primitifs DS ajoutés (`PageHero`, `Pullquote`).
- Tout le contenu est piloté par le CMS (aucune exception statique, contrairement à la home).
- `page.tsx` est édité par US1 puis US2 (même fichier) → ces tâches ne sont pas `[P]` entre
  elles ; les créations de composants DS le sont.
