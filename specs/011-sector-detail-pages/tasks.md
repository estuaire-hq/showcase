# Tasks: Pages de détail des secteurs (« univers / … »)

**Input**: Design documents from `/specs/011-sector-detail-pages/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: aucune tâche de test — site vitrine, pas de tests unitaires (Principe IV, plan.md).
Vérification = `npm run lint`, `npm run build`, `npm run seed -- --check`, diff pixel-perfect
(skill `estuaire-pixel-review`).

**Organization**: tâches groupées par user story (US1 P1 = MVP, US2 P2, US3 P3) pour une
implémentation et une validation indépendantes.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance bloquante).
- **[Story]** : US1 / US2 / US3 (phases user story uniquement).
- Chemins de fichiers exacts dans chaque description.

**Skills à charger** : `estuaire-figma-cli` (lire les nodes), `estuaire-pixel-perfect` (avant de
construire chaque section), `estuaire-motion` (avant la motion), `estuaire-pixel-review`
(sign-off). Nodes Figma desktop : retail `51:3520`, bureau `51:3661`, residentiel `51:3797`,
scenographie `51:3929`. Dev : `http://011-sector-detail-pages.estuaire.localhost:1355`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: structure de base nécessaire avant le modèle et les stories.

- [x] T001 [P] Créer l'arborescence des assets de seed `seed-assets/sectorDetail/{retail,bureau,residentiel,scenographie}/` (vide ; les 6 images/secteur y seront copiées depuis le cache Figma dans chaque story)
- [x] T002 Créer le squelette de copie maquette `src/content/sectorDetail.ts` : le type partagé (forme d'un secteur : hero, intro, enjeux, contraintes [label+emphasis], argument, citations [quote+attribution], seo) + un `Record<slug, …>` aux 4 clés (`retail`/`bureau`/`residentiel`/`scenographie`), valeurs remplies en US1/US2. Source unique seed + repli front (Principe IX)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: la machinerie du gabarit partagée par les 4 pages. **⚠️ Aucune story ne peut
démarrer avant cette phase.**

- [x] T003 Créer le schéma Sanity `src/sanity/schemas/documents/sectorDetail.ts` : document `sectorDetail` (groupes hero/intro/enjeux/contraintes/argument/citations/seo) + objets imbriqués `constraintChip` (`label`, `emphasis` en liste outline/ink/accent) et `testimonial` (`quote`, `attribution?`, `image`) ; champs, validations (`title`/`slug`/`heroTitleFill` required, `slug` unique, `citations` max 2), `imageField` helper, previews — conforme à `data-model.md`
- [x] T004 Enregistrer `sectorDetail` dans `src/sanity/schemas/index.ts` (import + ajout au tableau `schemaTypes`)
- [x] T005 Régénérer les types : `npm run typegen` → `SectorDetail` dans `src/sanity.types.ts` (commité) — dépend de T003, T004
- [x] T006 [P] Ajouter `SECTOR_DETAIL_QUERY` (par `$slug`) et `SECTOR_DETAIL_SLUGS_QUERY` dans `src/lib/sanity/queries.ts` (projections image avec `lqip`, conforme à `data-model.md`)
- [x] T007 Créer le mapping connecté `src/lib/sanity/sectorDetail.ts` : `getSectorDetailProps(slug)` (replis depuis `src/content/sectorDetail.ts`, images via `mapImage`) + `getSectorDetailSlugs()` ; type `SectorDetailProps = Awaited<ReturnType<…>>` — dépend de T005, T006
- [x] T008 [P] Créer le composant DS `src/design-system/components/Breadcrumb.tsx` (props `items`/`separator` ; `<nav aria-label>`, `aria-current`, `BrandText`, `currentColor`, `text-caption`) — contrat `contracts/components.md`
- [x] T009 [P] Créer le composant DS `src/design-system/components/Pill.tsx` (chip non-interactif ; variantes `outline`/`ink`/`accent` via `tailwind-variants` ; `rounded-full`, tokens only) — contrat `contracts/components.md`
- [x] T010 [P] Créer le composant DS `src/design-system/components/Testimonial.tsx` (image + voile `bg-ink/25`, `quote` en `text-subtitle`/`BrandText`, guillemets `aria-hidden`, `attribution` optionnelle, placeholder couleur si image absente, hook `data-parallax`) — contrat `contracts/components.md`
- [x] T011 Étendre `src/design-system/components/PageHero.tsx` : slot **optionnel** `breadcrumb?: ReactNode` rendu en haut de la cartouche (rétro-compatible — n'altère aucun appelant existant)
- [x] T012 Exporter `Breadcrumb`, `Pill`, `Testimonial` depuis `src/design-system/index.ts` — dépend de T008–T010

**Checkpoint**: modèle + types + mapping + primitives DS prêts → les user stories peuvent démarrer.

---

## Phase 3: User Story 1 - Approfondir un secteur précis (Priority: P1) 🎯 MVP

**Goal**: livrer **une** page de secteur (Retail) de bout en bout — hero (fil d'ariane + titre +
visuel) → intro (enjeux + contraintes terrain + visuel + texte) → argument → 2 citations →
footer global — atteignable depuis « Univers », prouvant le gabarit que les 3 autres réutilisent.

**Independent Test**: ouvrir `/univers/retail` via le bouton « en savoir plus » de `/univers` et
vérifier que la page déroule, dans l'ordre, toutes les sections, chacune lisible et propre au
secteur, sans dépendre des autres pages ; sous « réduire les animations », contenu complet.

- [x] T013 [US1] Renseigner le contenu **Retail** dans `src/content/sectorDetail.ts` (lire le node `51:3520` via `estuaire-figma-cli` : eyebrow, titre outline/fill, intro statement+text, enjeux [4 items], contraintes [chips + emphases], argument, 2 citations + attributions, SEO)
- [x] T014 [US1] Construire la **route dynamique générique** `src/app/(site)/univers/[slug]/page.tsx` (skill `estuaire-pixel-perfect`, Retail comme référence) : `generateStaticParams` (clés de `sectorDetailContent`), `generateMetadata` (SEO secteur), `notFound()` si slug inconnu / query nulle, `<main>` avec `data-nav-logo-tone="onDark"`/`data-nav-links-tone="onLight"`/`data-nav-toggle-tone="onDark"` ; composer toutes les sections : `PageHero variant="split"` + `Breadcrumb`, intro (cluster 3 images + statement/text), liste enjeux (`SectionTitle` + filets), nuage `Pill` (contraintes), argument (`Pullquote` sur `bg-cream`), 2 `Testimonial` — dépend de Phase 2 + T013
- [x] T015 [P] [US1] Copier les 6 visuels Retail du cache Figma vers `seed-assets/sectorDetail/retail/` : hero `51-3524.jpg`, intro-main `75-3288.jpg`, intro-portrait `75-3294.jpg`, intro-square `75-3295.jpg`, citation-1 `51-3638.jpg`, citation-2 `51-3650.jpg`
- [x] T016 [US1] Créer le seed `src/sanity/seed/documents/sectorDetail.retail.seed.ts` : `npm run seed:scaffold -- sectorDetail` puis `defineSeed<SectorDetail>` (`_id: "sectorDetail-retail"`, `slug.current: "retail"`, copie depuis `sectorDetailContent.retail`, `image()` vers `seed-assets/sectorDetail/retail/`, discriminants `_type: "constraintChip"`/`"testimonial"`) — dépend de T013, T015
- [x] T017 [US1] Enregistrer le seed Retail dans `src/sanity/seed/registry.ts` ; lancer `npm run seed -- --check` (gate) puis `npm run seed -- sectorDetail` (projet dev)
- [x] T018 [US1] Vérifier US1 : depuis `/univers`, le bouton « en savoir plus » Retail ouvre `/univers/retail` sans 404, toutes les sections rendues et propres au secteur ; diff pixel-perfect **desktop** de Retail (skill `estuaire-pixel-perfect`/render `51:3520`) ; `prefers-reduced-motion` → contenu complet et statique

**Checkpoint**: Retail livré de bout en bout, déployable — le gabarit est prouvé (MVP).

---

## Phase 4: User Story 2 - Les quatre secteurs couverts, aucun lien mort (Priority: P2)

**Goal**: les 3 secteurs restants (Bureau, Résidentiel, Scénographie) déclinent le gabarit ;
les 4 boutons « en savoir plus » résolvent, contenu propre à chacun, 0 lien mort, 404 propre sur
slug inconnu.

**Independent Test**: depuis `/univers`, activer les 4 boutons « en savoir plus » → 4 pages
distinctes sans 404, chacune avec le contenu + visuels de son secteur ; `/univers/inconnu` → 404.

- [x] T019 [US2] Renseigner le contenu **Bureau** (node `51:3661`), **Résidentiel** (`51:3797`) et **Scénographie** (`51:3929`) dans `src/content/sectorDetail.ts` (mêmes champs qu'en T013, lus via `estuaire-figma-cli`)
- [x] T020 [P] [US2] Copier les 6 visuels **Bureau** du cache → `seed-assets/sectorDetail/bureau/` (hero `51-3665.jpg`, intro-main `75-3338.jpg`, + les 4 restants via `npm run figma -- read secteurs/bureau --images`)
- [x] T021 [P] [US2] Copier les 6 visuels **Résidentiel** → `seed-assets/sectorDetail/residentiel/` (`51-3801`, `75-3383`, `75-3389`, `75-3390`, `51-3907`, `51-3919`)
- [x] T022 [P] [US2] Copier les 6 visuels **Scénographie** → `seed-assets/sectorDetail/scenographie/` (hero `51-3934`, intro-main `75-3431`, + les 4 restants via `read secteurs/scenographie --images`)
- [x] T023 [P] [US2] Créer le seed `src/sanity/seed/documents/sectorDetail.bureau.seed.ts` (`_id: "sectorDetail-bureau"`, `slug: "bureau"`)
- [x] T024 [P] [US2] Créer le seed `src/sanity/seed/documents/sectorDetail.residentiel.seed.ts` (`_id: "sectorDetail-residentiel"`, `slug: "residentiel"`)
- [x] T025 [P] [US2] Créer le seed `src/sanity/seed/documents/sectorDetail.scenographie.seed.ts` (`_id: "sectorDetail-scenographie"`, `slug: "scenographie"`)
- [x] T026 [US2] Enregistrer les 3 seeds dans `src/sanity/seed/registry.ts` ; `npm run seed -- --check` puis `npm run seed -- sectorDetail` (dev) — dépend de T019–T025
- [x] T027 [US2] Vérifier US2 : les 4 boutons « en savoir plus » de `/univers` résolvent (0 lien mort) ; contenu/visuels propres à chaque secteur ; diff pixel-perfect **desktop** des 3 nouveaux secteurs ; `/univers/inconnu` → page « introuvable » claire

**Checkpoint**: les 4 secteurs en ligne, parcours complet et cohérent, aucun 404.

---

## Phase 5: User Story 3 - Maîtrise éditoriale du contenu (Priority: P3)

**Goal**: chaque secteur est éditable **par secteur** via le Studio (textes, citations, visuels,
SEO), avec replis maquette quand un champ n'est pas saisi.

**Independent Test**: modifier un texte / une citation / un visuel / une métadonnée SEO d'un
secteur dans le Studio → le changement apparaît sur la page publiée de **ce** secteur seul après
revalidation, les autres inchangés ; une page sans contenu saisi affiche les replis maquette.

- [x] T028 [US3] Ajouter l'entrée de desk « Univers — secteurs » dans `src/sanity/structure.ts` regroupant les 4 documents `sectorDetail` (preview par `title`/`slug`/`heroImage`) — **ne PAS** ajouter `sectorDetail` au tableau `SINGLETONS`
- [ ] T029 [US3] Vérifier US3 : éditer un champ d'un secteur dans le Studio → reflété sur cette page seule après revalidation (webhook → `revalidateTag`) ; document vide → replis maquette (aucune zone vide, SC-007) ; `seoMetaTitle`/`seoMetaDescription`/`seoOgImage` éditables et reflétés via `generateMetadata` (FR-017)

**Checkpoint**: autonomie éditoriale par secteur opérationnelle.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: finitions transverses aux 4 pages.

- [x] T030 [P] **Motion** (charger `estuaire-motion`) : révélation des titres par ligne (H1 hero + `SectionTitle`), reveal-on-scroll des blocs, parallaxe des images de `Testimonial` (« parallax fixe » de la maquette) ; une motion focale à la fois ; `prefers-reduced-motion` neutralise tout (FR-014/015, SC-005). ⚠️ Voir tension D6 (pages sœurs statiques) — à valider avec Pierre
- [ ] T031 [P] **Accessibilité** (FR-016) : parcours clavier complet (lien fil d'ariane, chips, citations, CTA footer, retour-haut) sans piège ; contrastes des textes sur visuels ; alternatives textuelles ; hiérarchie de titres sémantique (H1 unique = titre secteur)
- [ ] T032 **Pixel-review final** (charger `estuaire-pixel-review`) : pour les 4 secteurs, capture + alignement section par section au **desktop** contre les renders Figma (`51:3520/3661/3797/3929`) ; tablette/mobile vérifiés sur cohérence + lisibilité ; boucle fix→recapture→re-diff jusqu'à 0 écart (gaps restants nommés UNVERIFIED)
- [x] T033 [P] `npm run lint` (Biome) + `npm run build` (build de production OK)
- [x] T034 [P] Écrire l'ADR `docs/vault/decisions/0018-sector-detail-pages-build-decisions.md` (D1 modèle dédié, D3 ajouts DS, D6 décision motion, D8 tracking)
- [ ] T035 Avant PR : vérifier les collisions de numérotation (ADR/post-mortem/specs) dues aux worktrees parallèles — skill `estuaire-branch-sync` ; renuméroter si besoin

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance.
- **Foundational (Phase 2)** : dépend de Setup — **bloque toutes les stories**.
- **US1 (Phase 3)** : dépend de Foundational. MVP.
- **US2 (Phase 4)** : dépend de Foundational ; réutilise la route générique de US1 (T014) — n'ajoute que contenu + seeds, indépendamment testable.
- **US3 (Phase 5)** : dépend de Foundational + au moins un secteur seedé (US1) ; indépendamment testable.
- **Polish (Phase 6)** : après les stories souhaitées.

### Within Each User Story

- US1 : contenu Retail (T013) → route (T014) → images (T015) → seed (T016) → seed dev (T017) → vérif (T018).
- US2 : contenu 3 secteurs (T019) → images (T020-22 [P]) + seeds (T023-25 [P]) → seed dev (T026) → vérif (T027).
- US3 : desk structure (T028) → vérif éditoriale (T029).

### Parallel Opportunities

- Foundational : T006 et les composants DS T008/T009/T010 en parallèle (fichiers distincts).
- US1 : T015 (images) en parallèle de T014 (route).
- US2 : T020–T022 (images) et T023–T025 (seeds) en parallèle entre secteurs.
- Polish : T030/T031/T033/T034 en parallèle.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Composants DS indépendants (après T005 typegen) :
Task: "Create Breadcrumb in src/design-system/components/Breadcrumb.tsx"
Task: "Create Pill in src/design-system/components/Pill.tsx"
Task: "Create Testimonial in src/design-system/components/Testimonial.tsx"
Task: "Add SECTOR_DETAIL_QUERY in src/lib/sanity/queries.ts"
```

## Parallel Example: Phase 4 (US2)

```bash
# Images + seeds des 3 secteurs en parallèle :
Task: "Copy bureau visuals to seed-assets/sectorDetail/bureau/"
Task: "Copy residentiel visuals to seed-assets/sectorDetail/residentiel/"
Task: "Copy scenographie visuals to seed-assets/sectorDetail/scenographie/"
Task: "Create sectorDetail.bureau.seed.ts"
Task: "Create sectorDetail.residentiel.seed.ts"
Task: "Create sectorDetail.scenographie.seed.ts"
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 Setup → 2. Phase 2 Foundational (bloquant) → 3. Phase 3 US1 (Retail) →
4. **STOP & VALIDATE** : Retail de bout en bout, atteignable, pixel-perfect desktop →
5. Déployable/démontrable.

### Incremental Delivery

Setup + Foundational → US1 (Retail, MVP) → US2 (3 secteurs, 0 lien mort) → US3 (édition CMS) →
Polish (motion, a11y, pixel-review, lint/build, ADR). Chaque story ajoute de la valeur sans
casser les précédentes.

---

## Notes

- [P] = fichiers différents, sans dépendance bloquante.
- Tokens uniquement (Principe X) ; DS présentationnel (Principe VIII) ; aucune valeur de design devinée — lue sur le cache Figma (Principe VII).
- `src/content/sectorDetail.ts` et `src/sanity/seed/registry.ts` sont touchés par plusieurs stories (édition séquentielle, pas de [P] entre stories sur ces fichiers).
- Commit après chaque tâche ou groupe logique ; messages en anglais (Principe V).
- PR en anglais + template `.github/PULL_REQUEST_TEMPLATE.md`.
