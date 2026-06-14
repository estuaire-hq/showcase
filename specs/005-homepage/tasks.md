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

- [X] T001 Charger les skills `estuaire-pixel-perfect`, `estuaire-figma-cli`, `estuaire-motion` et lire les nodes Figma complets de la home par breakpoint (`npm run figma -- read 51:2221`, `77:3149`, `77:3150`, `51:2420`) ; relever géométrie intrinsèque + copie de chaque section.
- [X] T002 [P] Déposer les images de contenu **éditable** dans `seed-assets/homePage/` (slides hero, visuel expertises, visuel vision, image OG) d'après la maquette.
- [X] T003 [P] Déposer les visuels **statiques** des cartes de réalisations dans `public/home/realisations/` d'après la maquette.

---

## Phase 2 : Foundational (prérequis bloquants — modèle de contenu)

**But** : poser la couche de données du singleton `homePage` (un seul document) que **toutes** les
stories consomment. ⚠️ Aucune story ne peut démarrer avant la fin de cette phase.

- [X] T004 Réécrire **from scratch** `src/sanity/schemas/documents/homePage.ts` (groupes hero/intro/expertises/univers/realisations/vision/seo + champs ; supprimer le test `title`/`tagline` ; `heroSlides` min 1 ; images `hotspot` + `alt` ; titres contour/plein). Schéma enrichi vs data-model (images intro + chrome réalisations) suite aux clarifications Pierre. (dépend T001)
- [X] T005 Vérifié : `src/sanity/schemas/index.ts` enregistre `homePage` ; `src/sanity/structure.ts` épingle le singleton (`documentId("homePage")`) + l'exclut du desk (SINGLETONS). Aucune modif nécessaire.
- [X] T006 Régénérer les types : `npm run typegen` → `src/sanity.types.ts` (commité). (dépend T004, T005)
- [X] T007 Écrire la projection complète `HOME_PAGE_QUERY` (tous champs + images `asset/hotspot/crop/alt/"lqip"`) dans `src/lib/sanity/queries.ts`. (dépend T004)
- [X] T008 [P] Créer `src/content/homePage.ts` — copie maquette par défaut de **toutes** les sections (source unique seed ↔ fallback). (dépend T001)
- [X] T009 Créer `src/lib/sanity/homePage.ts` — `getHomePageProps()` (`sanityFetch` + defaults depuis `content` + `urlFor` + `lqip`), renvoyant les props de toutes les sections. (dépend T006, T007, T008)
- [X] T010 Seed écrit à la main (pattern footer) : `src/sanity/seed/documents/homePage.seed.ts` depuis `src/content/homePage.ts` + `seed-assets/homePage/`, enregistré dans `src/sanity/seed/registry.ts`. (dépend T004, T008)
- [~] T011 `npm run seed:check` ✓ (dry-run offline, homePage valide). ⚠️ Application réelle sur **dev** (`npm run seed -- --reset homePage` + suppression du doc de test) en attente : nécessite le token d'écriture dev (git-crypt verrouillé dans cet environnement) → **à lancer par Pierre**. (dépend T010)

**Checkpoint** : couche de données prête — les stories peuvent démarrer.

---

## Phase 3 : User Story 1 — Première impression & identité de marque (P1) 🎯 MVP

**But** : hero/slider + intro de positionnement qui communiquent l'identité Estuaire dès le premier écran.

**Test indépendant** : afficher `/` → le hero (fondu auto image+titre) et l'intro identifient la marque ; lisible et navigable sur les 3 formats ; reduced-motion fige la 1re slide.

- [X] T012 [P] [US1] Construire `src/design-system/components/HeroSlideshow.tsx` (cross-fade **image + titre synchronisés**, auto, **sans contrôle**, reduced-motion → 1re slide figée ; titres via `OutlineText`/`BrandText` ; `label` rendu en **H1**) d'après Figma `51:2420` + `51:2221` ; exporté dans `src/design-system/index.ts`. (dépend T001)
- [X] T013 [US1] `src/app/(site)/page.tsx` est le **connecteur** : `getHomePageProps()` + hero (`HeroSlideshow`, `heroLabel` en H1) + section intro (titre contour/plein + texte + 2 images + pills univers) ; tonalité navbar déclarée (`logo=onDark`/`links=onLight`/`toggle=onDark`) d'après le hero sombre-gauche. (dépend T009, T012)
- [X] T014 [US1] Cinématique d'entrée hero/intro appliquée via `<Reveal>` (titre ligne-masque `SplitText` + image clip-reveal ; reduced-motion safe). (dépend T013)
- [~] T015 [US1] Vérification : structure/layout/responsive/couleurs/typo hero+intro confirmés via screenshots dev (desktop 1920 + mobile 390) ; 1 seul H1 ; base render OK (page complète sans images éditables — FR-016/SC-006). ⚠️ **Diff Figma final + fidélité des images éditables en attente du seed dev** (token requis). (dépend T013, T014)

**Checkpoint** : MVP — la home affiche hero + intro, identité claire, déployable.

---

## Phase 4 : User Story 2 — Découverte guidée de l'offre (P2)

**But** : sections « Nos expertises », « Nos univers / Réalisations », « Notre vision » avec CTAs et reveals au scroll.

**Test indépendant** : faire défiler `/` → chaque bloc présente son message et mène, via son CTA, vers la destination prévue ; reveals discrets ; cartes/secteurs cliquables au clavier.

- [X] T016 [P] [US2] Créer `src/content/homeRealisations.ts` (cartes statiques + liste des 12 secteurs « par secteur », `href` constant `/realisations`). (dépend T003)
- [X] T017 [P] [US2] Créé `src/lib/motion/Reveal.tsx` (wrapper client reveal au scroll : `SplitText` ligne-masque sur `[data-reveal]` + clip sur `[data-image-reveal]`, `once` ; reduced-motion → état final visible).
- [X] T018 [US2] Section « Nos expertises » : nouveau composant DS `SplitSection` variant `expertises` (image + colonne texte sur bande slate) + `Button` (CTA → `/expertises`), enveloppée d'un `Reveal`. **NB : `FeatureBlock` (overlay) ne correspondait pas à la maquette → composant split fidèle ajouté (validé par Pierre).** (dépend T009, T013, T017)
- [X] T019 [US2] Section « Nos univers / Réalisations » : titre contour/plein + liste `SectorButton` des 12 catégories « par secteur » (→ `/realisations`) + 3 `CaseStudyCard` depuis `homeRealisations` (→ `/realisations`) + CTA ; `Reveal`. Les 4 univers (→ `/univers/[secteur]`) sont dans l'intro (placement maquette). (dépend T009, T016, T017)
- [X] T020 [US2] Section « Notre vision » : `SplitSection` variant `vision` (cadre cream + carte blanche, image sur panneau bleu) + `Button` (CTA → `/nous-decouvrir`) ; `Reveal`. (dépend T009, T017)
- [X] T021 [P] [US2] Événements Umami via `data-umami-event` déclaratif (DS pur) : `home_cta_click`{section} (expertises/vision), `home_sector_click`{sector} (pills univers), `home_realisation_click`{card} (cartes). (dépend T018, T019, T020)
- [~] T022 [US2] Vérification : layout/responsive/couleurs/typo des 3 sections confirmés (screenshots dev desktop+mobile ; bande slate, cadre cream, pills empilées, cartes cas-study avec leurs images statiques servies) ; base render OK ; reveals reduced-motion-safe (gate dans `Reveal`). ⚠️ **Diff Figma final + clavier exhaustif + images éditables en attente du seed dev.** (dépend T018, T019, T020)

**Checkpoint** : parcours de scroll complet ; US1 + US2 fonctionnels indépendamment.

---

## Phase 5 : User Story 3 — Maîtrise éditoriale du contenu (P3)

**But** : contenu (hors cartes statiques) et **SEO** éditables via le CMS, avec défauts maquette en repli.

**Test indépendant** : modifier un texte/visuel en Studio → reflété sur `/` après revalidation ; avant saisie, page complète via défauts ; H1 unique + métadonnées présentes.

- [X] T023 [US3] `generateMetadata()` ajouté à `page.tsx` : lit les champs SEO via `getHomePageProps` → `title.absolute` + `description` + `openGraph.images` (`urlFor`) ; défauts maquette. Vérifié : `<title>Estuaire — agenceur-concepteur engagé</title>`. (dépend T009)
- [~] T024 [US3] Flux éditorial : rendu complet via défauts AVANT toute saisie **confirmé** (le projet dev non seedé rend la home complète en texte — SC-006). ⚠️ Édition Studio → revalidation → reflet (SC-005) + réordonnancement slides (P3-3) **à vérifier après le seed dev** (token requis). (dépend T011, T013)
- [X] T025 [US3] Accessibilité/SEO : **H1 unique** (= `heroLabel`) + 5 `h2` de section confirmés ; `alt` sur tous les visuels (champ `alt` requis au schéma + DS) ; liens/CTA = `<a>`/`<button>` natifs focusables, secteurs en `next/link`. (dépend T013, T018, T019, T020)

**Checkpoint** : les trois stories sont indépendamment fonctionnelles.

---

## Phase 6 : Polish & cross-cutting

**But** : chrome de shell et qualité transverse.

- [X] T026 [P] `ScrollTopButton` monté via `src/lib/motion/ScrollTopMount.tsx` dans `src/app/(site)/layout.tsx` (Lenis `scrollTo(0)` + fallback natif, apparition au-delà de 0,6×viewport, tailles responsives) (FR-015 ; plan Complexity #2).
- [X] T027 Passe performance : placeholders LQIP câblés (`blurDataURL` depuis `lqip`), `sizes` sur toutes les images, `priority` sur la 1re slide hero, conteneurs à ratio fixe (zéro CLS). Mesure terrain < 2,5 s à confirmer en prod (SC-007).
- [~] T028 [P] `npm run lint` ✓ · `npm run typegen` ✓ (stable, commité) · `npm run seed:check` ✓ · `npx tsc --noEmit` ✓. ⚠️ `npm run build` **compile entièrement** mais échoue au prerender de `/` sur le fetch Sanity (`projectId "placeholder"`) car `next build` ne charge pas `.env.development` → gate à repasser en CI/Coolify (env réel) ou après `git-crypt unlock`.
- [X] T029 Sign-off **pixel-perfect** : seed dev appliqué (images réelles), puis **revue alignée section par section** via la nouvelle skill **`estuaire-pixel-review`** (helper Pillow : crop ref Figma ↔ crop dev à largeur commune, side-by-side + overlay + diff). Écarts trouvés & corrigés : hero (image plein-bord → fenêtre contenue + position texte), intro (panneau bleu agrandi + pills 2×2 bas-gauche + image secondaire chevauchante), expertises & vision (images portrait hautes — bande expertises 1052 vs 1042 maquette), réalisations (2 images décoratives + layout 2 rangées). Reste mineur : intro/vision ~10-20% plus compactes, ordre des éléments d'intro en mobile, images cas-study = placeholders. Skill rendue **obligatoire en fin de feature maquette** (CLAUDE.md).

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
