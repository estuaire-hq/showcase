# Tasks : Page d'accueil

**Input** : artefacts de conception dans `specs/005-homepage/`
**Prérequis** : plan.md, spec.md (user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests** : la spec ne demande **pas** de tests automatisés. Le projet valide par `lint` + `build`
+ **vérification pixel-perfect** (diff Figma), **reduced-motion** et **clavier** (méthodes réelles
du projet). Les tâches de vérification ci-dessous remplacent les tâches de test.

**Organisation** : tâches groupées par user story pour une implémentation et une validation
indépendantes. MVP = User Story 1.

## Format : `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, pas de dépendance bloquante)
- **[Story]** : US1 / US2 / US3 (phases user story uniquement)

---

## Phase 1 : Setup (préparation partagée)

**But** : lire la source de vérité (Figma) et réunir les assets avant de coder.

- [ ] T001 Charger les skills `estuaire-pixel-perfect`, `estuaire-figma-cli`, `estuaire-motion` et lire les nodes Figma complets de la home par breakpoint (`npm run figma -- read 51:2221`, `77:3149`, `77:3150`, `51:2420`) ; relever géométrie intrinsèque + copie de chaque section.
- [ ] T002 [P] Déposer les images de contenu **éditable** dans `seed-assets/homePage/` (slides hero, visuel expertises, visuel vision, image OG) d'après la maquette.
- [ ] T003 [P] Déposer les visuels **statiques** des cartes de réalisations dans `public/home/realisations/` d'après la maquette.

---

## Phase 2 : Foundational (prérequis bloquants — modèle de contenu)

**But** : poser la couche de données du singleton `homePage` (un seul document) que **toutes** les
stories consomment. ⚠️ Aucune story ne peut démarrer avant la fin de cette phase.

- [ ] T004 Réécrire **from scratch** `src/sanity/schemas/documents/homePage.ts` (groupes hero/intro/expertises/univers/vision/seo + champs par `data-model.md` ; supprimer le test `title`/`tagline` ; `heroSlides` min 1 ; images `hotspot` + `alt`). (dépend T001)
- [ ] T005 Vérifier l'enregistrement dans `src/sanity/schemas/index.ts` et le pin singleton + l'exclusion desk dans `src/sanity/structure.ts`.
- [ ] T006 Régénérer les types : `npm run typegen` → `src/sanity.types.ts` (commité). (dépend T004, T005)
- [ ] T007 Écrire la projection complète `HOME_PAGE_QUERY` (tous champs + images `asset/hotspot/crop/alt/"lqip"`) dans `src/lib/sanity/queries.ts`. (dépend T004)
- [ ] T008 [P] Créer `src/content/homePage.ts` — copie maquette par défaut de **toutes** les sections (source unique seed ↔ fallback). (dépend T001)
- [ ] T009 Créer `src/lib/sanity/homePage.ts` — `getHomePageProps()` (`sanityFetch` + defaults depuis `content` + `urlFor` + `lqip`), renvoyant les props de toutes les sections. (dépend T006, T007, T008)
- [ ] T010 Scaffolder + remplir le seed : `npm run seed:scaffold -- homePage`, remplir `src/sanity/seed/documents/homePage.seed.ts` depuis `src/content/homePage.ts` + `seed-assets/homePage/`, enregistrer dans `src/sanity/seed/registry.ts`. (dépend T004, T008)
- [ ] T011 Valider + appliquer le seed sur **dev** : `npm run seed:check`, puis supprimer le doc de test et `npm run seed -- --reset homePage`. (dépend T010)

**Checkpoint** : couche de données prête — les stories peuvent démarrer.

---

## Phase 3 : User Story 1 — Première impression & identité de marque (P1) 🎯 MVP

**But** : hero/slider + intro de positionnement qui communiquent l'identité Estuaire dès le premier écran.

**Test indépendant** : afficher `/` → le hero (fondu auto image+titre) et l'intro identifient la marque ; lisible et navigable sur les 3 formats ; reduced-motion fige la 1re slide.

- [ ] T012 [P] [US1] Construire `src/design-system/components/HeroSlideshow.tsx` (cross-fade **image + titre synchronisés**, auto, **sans contrôle**, reduced-motion → 1re slide figée ; titres via `OutlineText`/`BrandText` ; `label` rendu en **H1**) d'après Figma `51:2420` + `51:2221` ; exporter dans `src/design-system/index.ts`. (dépend T001)
- [ ] T013 [US1] Faire de `src/app/(site)/page.tsx` le **connecteur** : `getHomePageProps()` + rendu hero (`HeroSlideshow`, `heroLabel` en H1) + section intro ; déclarer la tonalité navbar (`data-nav-logo-tone`/`data-nav-links-tone`/`data-nav-toggle-tone`) d'après le hero. (dépend T009, T012)
- [ ] T014 [US1] Appliquer la cinématique d'entrée hero/intro (titre par ligne-masque ; reduced-motion safe) selon `estuaire-motion`. (dépend T013)
- [ ] T015 [US1] Vérifier pixel-perfect hero+intro vs renders Figma (desktop/tablette/mobile) + reduced-motion + **base render** (JS désactivé / image en échec : texte lisible, `alt` présents, rien masqué par une anim non jouée — FR-016). (dépend T013, T014)

**Checkpoint** : MVP — la home affiche hero + intro, identité claire, déployable.

---

## Phase 4 : User Story 2 — Découverte guidée de l'offre (P2)

**But** : sections « Nos expertises », « Nos univers / Réalisations », « Notre vision » avec CTAs et reveals au scroll.

**Test indépendant** : faire défiler `/` → chaque bloc présente son message et mène, via son CTA, vers la destination prévue ; reveals discrets ; cartes/secteurs cliquables au clavier.

- [ ] T016 [P] [US2] Créer `src/content/homeRealisations.ts` (cartes statiques `{ image, sector, title }`, `href` constant `/realisations`). (dépend T003)
- [ ] T017 [P] [US2] Créer `src/lib/motion/Reveal.tsx` (wrapper client de reveal au scroll, ScrollTrigger ; reduced-motion → état final visible).
- [ ] T018 [US2] Section « Nos expertises » dans `page.tsx` : `FeatureBlock` + `Button` (CTA → `/expertises`), enveloppée d'un `Reveal`. (dépend T009, T013, T017)
- [ ] T019 [US2] Section « Nos univers / Réalisations » : liste `SectorButton` (→ `/univers/[secteur]`) + grille `CaseStudyCard` depuis `homeRealisations` (→ `/realisations`) ; `Reveal`. (dépend T009, T016, T017)
- [ ] T020 [US2] Section « Notre vision » : `FeatureBlock` + `Button` (CTA → `/nous-decouvrir`) ; `Reveal`. (dépend T009, T017)
- [ ] T021 [P] [US2] Instrumenter les événements Umami via `trackEvent` (`home_cta_click`{section}, `home_sector_click`{sector}, `home_realisation_click`{card}) depuis des wrappers client (garder le DS pur). (dépend T018, T019, T020)
- [ ] T022 [US2] Vérifier pixel-perfect des 3 sections vs Figma par breakpoint + reveals + reduced-motion + atteignabilité clavier + **base render** (JS désactivé / image en échec : contenu lisible, rien masqué par un `Reveal` non joué — FR-016). (dépend T018, T019, T020)

**Checkpoint** : parcours de scroll complet ; US1 + US2 fonctionnels indépendamment.

---

## Phase 5 : User Story 3 — Maîtrise éditoriale du contenu (P3)

**But** : contenu (hors cartes statiques) et **SEO** éditables via le CMS, avec défauts maquette en repli.

**Test indépendant** : modifier un texte/visuel en Studio → reflété sur `/` après revalidation ; avant saisie, page complète via défauts ; H1 unique + métadonnées présentes.

- [ ] T023 [US3] Ajouter `generateMetadata()` à `src/app/(site)/page.tsx` lisant les champs SEO (`metaTitle`/`metaDescription`/`ogImage` via `getHomePageProps`) → `Metadata` + `openGraph.images` (`urlFor`) ; défauts depuis `content`. (dépend T009)
- [ ] T024 [US3] Vérifier le flux éditorial : éditer un texte/visuel en Studio → revalidation (`revalidateTag("sanity")`) → reflété sur `/` (SC-005) ; rendu complet via défauts avant toute saisie (SC-006) ; ajout/retrait/réordonnancement d'une slide hero reflété (P3-3). (dépend T011, T013)
- [ ] T025 [US3] Passe accessibilité/SEO : **H1 unique** (= `heroLabel`), titres de section `h2`, `alt` de tous les visuels, navigation clavier sans piège (FR-013/014, SC-004). (dépend T013, T018, T019, T020)

**Checkpoint** : les trois stories sont indépendamment fonctionnelles.

---

## Phase 6 : Polish & cross-cutting

**But** : chrome de shell et qualité transverse.

- [ ] T026 [P] Monter `ScrollTopButton` via `src/lib/motion/ScrollTopMount.tsx` dans `src/app/(site)/layout.tsx` (Lenis `scrollTo(0)`, apparition au-delà d'un seuil) (FR-015 ; plan Complexity #2).
- [ ] T027 Passe performance : placeholders LQIP, `sizes` des images, premier écran lisible < 2,5 s mobile, zéro décalage de mise en page notable (SC-007).
- [ ] T028 [P] Exécuter la checklist `quickstart.md` + `npm run lint` + `npm run build` + `npm run typegen` (aucun diff non commité).
- [ ] T029 Sign-off **pixel-perfect** : diff visuel final sur les 3 breakpoints vs renders Figma, ou déclarer explicitement « non vérifié » (Principe VII).

---

## Dépendances & ordre d'exécution

### Dépendances de phase

- **Setup (P1)** : aucune dépendance.
- **Foundational (P2)** : dépend du Setup — **bloque toutes les stories**.
- **User Stories (P3→P5)** : dépendent de la Foundational. Ensuite parallélisables, ou séquentielles par priorité (US1 → US2 → US3).
- **Polish (P6)** : après les stories visées.

### Dépendances entre stories

- **US1 (P1)** : démarre après Foundational ; aucune dépendance sur une autre story.
- **US2 (P2)** : après Foundational ; partage `page.tsx` avec US1 (intégration séquentielle conseillée sur ce fichier) mais testable indépendamment.
- **US3 (P3)** : après Foundational ; `generateMetadata` indépendant ; les vérifs a11y/édito s'appuient sur les sections présentes.

### Opportunités de parallélisme

- T002 / T003 en parallèle (assets distincts).
- T008 en parallèle de T005/T007 (fichier distinct) ; T012 et T017 [P].
- ⚠️ T013, T018, T019, T020, T023 touchent **tous `page.tsx`** → **sérialiser** (pas [P] entre eux).

---

## Parallel Example : Foundational

```bash
# Une fois T004 (schéma) écrit :
Task: "T008 [P] Créer src/content/homePage.ts (copie maquette)"
# en parallèle de :
Task: "T007 Écrire HOME_PAGE_QUERY dans src/lib/sanity/queries.ts"
```

## Parallel Example : User Story 2

```bash
Task: "T016 [P] [US2] Créer src/content/homeRealisations.ts"
Task: "T017 [P] [US2] Créer src/lib/motion/Reveal.tsx"
# puis T018/T019/T020 séquentiels (même page.tsx), puis T021 [P]
```

---

## Stratégie d'implémentation

### MVP d'abord (US1)

1. Phase 1 Setup → 2. Phase 2 Foundational (CRITIQUE) → 3. Phase 3 US1 → **STOP & valider** la home (hero+intro) indépendamment → déployable.

### Livraison incrémentale

Setup + Foundational → US1 (MVP) → US2 → US3 → Polish. Chaque story ajoute de la valeur sans casser les précédentes.

---

## Notes

- `[P]` = fichiers différents, pas de dépendance. `[US#]` = traçabilité story.
- ⚠️ Le DS reste **présentationnel** (pas de fetch) ; le fetch vit dans `getHomePageProps` consommé par `page.tsx` (Principe VIII). Le motion vit dans `src/lib/motion/` (pas dans le DS).
- Tout visuel/typo via `@/design-system` + tokens `@theme` (Principe X — aucune couleur/taille codée en dur).
- Commiter après chaque tâche ou groupe logique ; s'arrêter aux checkpoints pour valider une story.
- Cartes de réalisations = **statiques** (FR-005), à rebrancher sur le CMS lors de la feature « Réalisations ».
