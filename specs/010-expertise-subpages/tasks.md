---
description: "Liste de tâches — Sous-pages « Expertise »"
---

# Tasks: Sous-pages « Expertise » (agencement / mobiliers / présentoirs)

**Input**: Design documents from `specs/010-expertise-subpages/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests** : aucune tâche de test automatisé — ce projet ne pratique pas le TDD ; la vérification
passe par `lint` / `typegen` / `build` + **pixel-review** (skill `estuaire-pixel-review`) +
contrôles CMS/accessibilité manuels (cf. `quickstart.md`).

**Organisation** : tâches groupées par user story pour une livraison incrémentale. Charger la
skill adéquate avant chaque tâche (`estuaire-figma-cli`, `estuaire-pixel-perfect`,
`estuaire-motion`, `estuaire-pixel-review`). Toujours lire le **node Figma complet** — jamais un
résumé (Principe VII). Aucune couleur/taille en dur — tokens `@theme` (Principe X).

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, pas de dépendance sur une tâche inachevée).
- **[Story]** : `[US1]`/`[US2]`/`[US3]` pour les phases user story uniquement.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose** : préparer la lecture maquette (source de vérité) et les assets de seed.

- [x] T001 Charger `estuaire-figma-cli` puis lire les nodes complets (offline) : agencement `npm run figma -- read 51:3008` (desktop) / `87:6762` (tablette) / `87:6964` (mobile), et `51:3134` (mobiliers) / `51:3259` (présentoirs) — confirmer le gabarit 6 sections et relever copie verbatim + géométrie (alimente `src/content/expertiseSubpages.ts` et les composants). Source : `.design/figma-cache/`.
- [x] T002 [P] Créer `seed-assets/expertiseSubpages/{agencement-sur-mesure,mobiliers-sur-mesure,presentoirs-sur-mesure}/` et y déposer les visuels maquette par expertise (hero, intro, responsable, cas study, og) — committés, hors `public/`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : la couche données + le squelette de route partagés par les 3 user stories.
`EXPERTISE_SLUGS` ne contient d'abord que `agencement-sur-mesure` → seule cette route existe
(les 2 autres arrivent en US3).

**⚠️ CRITICAL** : aucune user story ne peut démarrer avant la fin de cette phase.

- [x] T003 Créer le schéma `src/sanity/schemas/documents/expertiseSubpage.ts` (document **non singleton** ; groupes `hero`/`intro`/`responsable`/`engagements`/`caseStudy`/`seo` ; `title`+`slug`(source `title`)+`heroTitleFill` requis ; objet `engagement` `{title}` requis + `preview` ; `responsableImages` array ; `caseStudyMeta` array de strings ; réutiliser `imageField` ; `preview` document) — cf. `data-model.md`.
- [x] T004 [P] Enregistrer `expertiseSubpage` dans `src/sanity/schemas/index.ts` (`schemaTypes`).
- [x] T005 [P] Ajouter l'entrée desk « Sous-pages d'expertise » (`S.documentTypeList("expertiseSubpage")`) dans `src/sanity/structure.ts` — **ne pas** ajouter à `SINGLETONS`.
- [x] T006 Régénérer les types : `npm run typegen` → `src/sanity.types.ts` (commité ; type `ExpertiseSubpage`). Dépend de T003–T005.
- [x] T007 [P] Ajouter `EXPERTISE_SUBPAGE_QUERY` (`$slug`) + `EXPERTISE_SUBPAGE_SLUGS_QUERY` dans `src/lib/sanity/queries.ts` (projection + LQIP — cf. `contracts/content-model.md` §3).
- [x] T008 [P] Créer `src/content/expertiseSubpages.ts` : objet **indexé par slug** avec l'entrée `agencement-sur-mesure` (copie texte des 6 sections, dont les 6 engagements + le cas study) + `export const EXPERTISE_SLUGS = Object.keys(...)` (cf. `data-model.md`). Texte uniquement (Principe IX).
- [x] T009 Créer `src/lib/sanity/expertiseSubpage.ts` : `getExpertiseSubpageProps(slug)` (fetch by slug + defaults par slug via `expertiseSubpagesContent` + `mapImage`/`urlFor` ; lien parent fil d'Ariane `/expertises` ; `null` si slug inconnu). Dépend de T006, T007, T008.
- [x] T010 Créer `src/sanity/seed/documents/expertiseSubpages.seed.ts` (default-export d'un tableau, **entrée agencement** : `_id:"expertiseSubpage.agencement-sur-mesure"`, `slug`, texte depuis `@/content/expertiseSubpages.ts`, images `image(...)`, engagements `{_type:"engagement",title}`) + register `...expertiseSubpages` dans `src/sanity/seed/registry.ts`. Dépend de T006, T008.
- [x] T011 Valider + seeder (dev) : `npm run seed -- expertiseSubpage --check` puis `npm run seed -- expertiseSubpage`. Dépend de T010, T002.
- [x] T012 Créer le squelette de route `src/app/(site)/expertises/[expertise]/page.tsx` : `generateStaticParams` ← `EXPERTISE_SLUGS`, `generateMetadata({params})` (lit `getExpertiseSubpageProps(slug).seo`, `notFound()` si `null`), `<main data-nav-*-tone=…>` (tonalité lue au build, attendu `onDark`) avec un conteneur vide (sections ajoutées en US1/US2). Dépend de T009.

**Checkpoint** : `/expertises/agencement-sur-mesure` se résout (titre/SEO + shell), prêt à recevoir les sections.

---

## Phase 3: User Story 1 - Approfondir une expertise précise (Priority: P1) 🎯 MVP

**Goal** : la sous-page agencement communique l'expertise — hero (visuel + fil d'Ariane + encart
titre), intro (phrase phare + texte + visuel), bloc responsable (phrase d'engagement + visuels),
« Nos engagements » (6 engagements numérotés). Responsive + reduced-motion.

**Independent Test** : ouvrir `/expertises/agencement-sur-mesure` et vérifier que le hero, l'intro
et « Nos engagements » communiquent l'expertise et ses 6 engagements, lisibles sur les 3 formats,
sans dépendre de la section cas study ni des deux autres sous-pages.

- [x] T013 [P] [US1] Créer le primitif DS `src/design-system/components/Breadcrumb.tsx` (`items:{label,href?}[]`, séparateur `/`, `BrandText`, `<nav aria-label="Fil d'Ariane">`) — présentationnel (Principe VIII).
- [x] T014 [P] [US1] Créer le primitif DS `src/design-system/components/EngagementsGrid.tsx` (`items:{title}[]`, grille 3×2 responsive 1→2→3, numéro **dérivé de l'ordre** `String(i+1).padStart(2,"0")` en Montserrat Alternates, traits 3px via tokens, intitulés `<h3>`) — géométrie lue sur `05/ NOS ENGAGEMENTS`.
- [x] T015 [US1] Étendre `src/design-system/components/PageHero.tsx` d'un slot optionnel `breadcrumb?: ReactNode` (placement lu sur `02/ SLIDER` au build) — extension DS délibérée.
- [x] T016 [US1] Exporter `Breadcrumb` + `EngagementsGrid` depuis `src/design-system/index.ts`.
- [x] T017 [US1] Composer la section **hero** (`PageHero` + `Breadcrumb`) dans `src/app/(site)/expertises/[expertise]/page.tsx` — H1 = encart titre ; confirmer la tonalité navbar au build.
- [x] T018 [US1] Composer la section **intro** (`Pullquote` + texte `whitespace-pre-line` + `next/image`+LQIP ; demi-fond bleu agencement via panneau `bg-estuaire`) dans `page.tsx`.
- [x] T019 [US1] Composer la section **responsable** (phrase d'engagement soulignée d'un trait token + cluster `next/image`+LQIP) dans `page.tsx`.
- [x] T020 [US1] Composer la section **engagements** (`SectionTitle` `<h2>` « Nos engagements » + `EngagementsGrid`) dans `page.tsx`.
- [ ] T021 [US1] Appliquer le motion (skill `estuaire-motion`) : hero **statique** ; reveals au scroll (line-mask sur titres, parallaxe/clip sur visuels intro/responsable, apparition des cellules d'engagements) via `<Parallax>` + `data-*` ; `prefers-reduced-motion` → tout au repos (FR-013).
- [ ] T022 [US1] Pixel-review (skill `estuaire-pixel-review`) des sections hero/intro/responsable/engagements de l'agencement par breakpoint (desktop `51:3008` / tablette `87:6762` / mobile `87:6964`) ; boucler fix→recapture→diff jusqu'à zéro écart.

**Checkpoint** : l'agencement (MVP) est livrable et rend fonctionnel le 1er « en savoir plus » de la 008.

---

## Phase 4: User Story 2 - Passer à l'action depuis une sous-page (Priority: P2)

**Goal** : la section cas study (titre + bande visuelle + bouton vers la réalisation) + le routage
d'action (footer CTA, navigation inter-sous-pages).

**Independent Test** : faire défiler la sous-page jusqu'en bas et vérifier que le bouton du cas
study mène à la réalisation (404 temporaire OK), que le bloc CTA du footer mène au contact, et que
la navigation atteint les autres sous-pages / la page « Expertises ».

- [x] T023 [US2] Étendre `src/design-system/components/CaseStudyCard.tsx` d'un slot bouton optionnel + passe-plat `data-umami-*` (la carte n'est plus cliquable en entier — c'est le bouton qui route) — extension DS délibérée, confirmée au build.
- [x] T024 [US2] Composer la section **cas study** (`SectionTitle` « Découvrez notre dernier projet … » + `CaseStudyCard` + `Button`) dans `src/app/(site)/expertises/[expertise]/page.tsx` ; bouton tracé `data-umami-event="case_study_click"` + `data-umami-event-expertise={slug}` (Principe VI).
- [ ] T025 [US2] Appliquer le motion à la section cas study (reveal/parallaxe de la bande, voile lisible) via `<Parallax>` ; honorer `prefers-reduced-motion`.
- [ ] T026 [US2] Pixel-review de la section cas study par breakpoint vs Figma (`06/ CAS STUDY`) ; boucler jusqu'à zéro écart.
- [ ] T027 [US2] Vérifier le routage d'action : bouton cas study → route de réalisation (404 temporaire accepté — FR-007) ; bloc CTA du footer → contact ; navbar/menu → autres sous-pages + `/expertises` (SC-003).

**Checkpoint** : depuis l'agencement, le visiteur peut passer à l'action.

---

## Phase 5: User Story 3 - Maîtrise éditoriale du contenu (Priority: P3)

**Goal** : livrer les 2 autres sous-pages (mobiliers, présentoirs) via le gabarit + garantir
l'édition CMS indépendante par page, les défauts maquette et le responsive dérivé.

**Independent Test** : modifier un texte/visuel/engagement/lien cas study d'une sous-page dans le
Studio → le changement apparaît après revalidation **sans affecter** les deux autres ; une page
non saisie s'affiche complète via les défauts maquette.

- [x] T028 [P] [US3] Ajouter les entrées `mobiliers-sur-mesure` + `presentoirs-sur-mesure` à `src/content/expertiseSubpages.ts` (copie verbatim des 6 sections, dont les 6 engagements + le cas study de chaque, lus sur `51:3134` / `51:3259`) → `EXPERTISE_SLUGS` couvre désormais les 3 routes.
- [x] T029 [P] [US3] Ajouter les objets seed mobiliers + présentoirs au tableau de `src/sanity/seed/documents/expertiseSubpages.seed.ts` (images de `seed-assets/expertiseSubpages/<slug>/`) puis `npm run seed -- expertiseSubpage --check` et `npm run seed -- expertiseSubpage`.
- [ ] T030 [US3] Responsive : dériver tablette/mobile de mobiliers & présentoirs du gabarit agencement (frames desktop only) ; vérifier le rendu des 3 sous-pages sur les 3 formats (FR-009 ; déclarer « non vérifié » tout écart tablette/mobile faute de frame — Principe VII).
- [ ] T031 [US3] Vérifier l'indépendance éditoriale : éditer un champ / un engagement (réordonner) / le lien cas study d'**une** page dans le Studio → reflété après revalidation **sans impact** sur les 2 autres (SC-006) ; vider un champ → repli maquette complet (SC-007) ; numérotation des engagements cohérente après réordonnancement.
- [x] T032 [US3] Vérifier le SEO par page : un H1 unique par page (encart hero), `generateMetadata` lit le doc par slug, `seoMetaTitle`/`seoMetaDescription`/`seoOgImage` éditables par page avec repli maquette (FR-015).

**Checkpoint** : les 3 sous-pages sont en ligne, éditables indépendamment.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose** : qualité transverse et sign-off pixel-perfect (MANDATORY).

- [x] T033 [P] `npm run lint` (Biome) — lint + format au vert.
- [x] T034 [P] `npm run typegen` — aucun diff (schéma ↔ types cohérents, `sanity.types.ts` à jour).
- [x] T035 `npm run build` — build prod au vert (les 3 routes pré-générées via `generateStaticParams`).
- [ ] T036 Sign-off pixel-review final (skill `estuaire-pixel-review`) sur les 3 sous-pages × 3 breakpoints, section par section ; nommer tout écart résiduel « non vérifié » (mobiliers/présentoirs n'ont pas de frame tablette/mobile) — SC-004.
- [x] T037 [P] Accessibilité : un seul H1 par page, navigation clavier de bout en bout (fil d'Ariane + bouton cas study, 0 piège), `alt` sur tous les visuels, contrastes suffisants, hiérarchie de titres sémantique (FR-014 / SC-005).
- [ ] T038 [P] Vérifier `prefers-reduced-motion` sur toutes les sections des 3 pages : rendu statique complet et lisible (FR-013 / SC-005).
- [x] T039 Vérifier SC-001 : depuis `/expertises`, les 3 « en savoir plus » mènent à leur sous-page (plus aucun 404 sur les 3 routes).
- [x] T040 [P] Consigner toute décision durable dans `docs/vault/` si justifié (ex. modèle « type de document paramétré + route dynamique » pour N pages à gabarit identique) — Memory & Knowledge Architecture.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance — démarre immédiatement.
- **Foundational (Phase 2)** : dépend de Setup — **bloque** toutes les user stories.
- **User Stories (Phase 3+)** : dépendent de Foundational.
  - **US1 (P1)** : démarre après Foundational — aucune dépendance inter-story.
  - **US2 (P2)** : démarre après Foundational ; édite le même `page.tsx` qu'US1 (séquentiel sur ce fichier), mais sa section est indépendante. Recommandé après US1 (MVP d'abord).
  - **US3 (P3)** : démarre après Foundational ; réutilise le gabarit construit en US1/US2 (sa valeur = les 2 autres pages + l'autonomie éditoriale). Recommandé après US1/US2.
- **Polish (Phase 6)** : dépend des user stories désirées.

### Dépendances intra-Foundational

- T003 → T004, T005 → T006 → (T009, T010).
- T007, T008 [P] → T009 ; T008 → T010 ; (T010, T002) → T011 ; T009 → T012.

### Within Each User Story

- US1 : T013, T014 [P] (composants DS) → T016 (export) ; T015 (PageHero) → T017 ; sections T017→T018→T019→T020 (même fichier, séquentiel) → T021 (motion) → T022 (pixel-review).
- US2 : T023 → T024 → T025 → T026 → T027.
- US3 : T028, T029 [P] → T030 → T031, T032.

### Parallel Opportunities

- Setup : T002 [P] pendant T001.
- Foundational : T004/T005 [P] après T003 ; T007/T008 [P] en parallèle.
- US1 : T013/T014 [P] (fichiers DS distincts).
- US3 : T028/T029 [P].
- Polish : T033/T034/T037/T038/T040 [P].

---

## Parallel Example: User Story 1

```bash
# Les 2 nouveaux primitifs DS (fichiers distincts) en parallèle :
Task: "Créer src/design-system/components/Breadcrumb.tsx"
Task: "Créer src/design-system/components/EngagementsGrid.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1).
2. **STOP & VALIDATE** : `/expertises/agencement-sur-mesure` communique l'expertise + 6
   engagements, fidèle maquette 3 formats, reduced-motion OK. Le 1er « en savoir plus » de la 008
   est fonctionnel → livrable/déployable.

### Incremental Delivery

1. Setup + Foundational → architecture prête (route agencement résolue).
2. US1 → page agencement (MVP) → valider → déployer.
3. US2 → routage d'action (cas study + nav) → valider → déployer.
4. US3 → mobiliers + présentoirs + autonomie éditoriale → valider → déployer.
5. Polish → sign-off pixel-perfect + a11y + perf.

---

## Notes

- [P] = fichiers différents, pas de dépendance. Le `page.tsx` du connecteur est édité par
  Foundational/US1/US2 (séquentiel sur ce fichier — pas de [P] entre ces tâches).
- Lire le **node Figma complet** avant chaque section ; diff visuel obligatoire (Principe VII).
- Tokens `@theme` + `@/design-system` uniquement — aucune couleur/taille en dur (Principe X).
- Commit après chaque tâche ou groupe logique cohérent.
- Les sous-pages servent un gabarit unique (1 type de document, 3 instances) via une route
  dynamique `[expertise]` — toute section construite en US1/US2 profite aux 3 pages dès leur
  contenu ajouté (US3).
