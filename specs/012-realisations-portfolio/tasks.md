# Tasks: Réalisations (portfolio + pages projet)

**Input**: Design documents from `/specs/012-realisations-portfolio/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: AUCUNE tâche de test automatisé. Ce projet vitrine n'a pas de suite de tests ; la
vérification se fait par `npm run build`, `npm run lint` (Biome), `npm run seed -- --check`
(dry-run) et la **revue pixel-perfect** (skill `estuaire-pixel-review`). (Voir plan.md → Testing.)

**Organization**: tâches groupées par user story (US1 P1 = MVP ; US2/US3 P2 ; US4 P3) pour une
implémentation et une validation indépendantes.

> **Statut d'implémentation (2026-06-20)** — **28/33 faites**. Socle (Setup + Foundational : schéma,
> types, queries, connecteur, builder, 23 études seedées depuis le pptx, 188 images) **complet et
> seedé (dev)**. **US1/US2/US3/US4 fonctionnels et vérifiés** au dev server (HTTP + contenu : liste,
> détail 2 variantes, prev/suiv, filtres combinés, états vides, demock home + expertises, 404 des
> non-publiées). Gates passés : `tsc --noEmit` **0 erreur**, `npm run lint` (Biome) **clean**.
> **Revue pixel-perfect desktop (T030) — partiellement faite & vérifiée par screenshots/diff :**
> page **liste** alignée (hero panneau bleu + titre/eyebrow blancs + image contenue ; « Dernières »
> = titre + intro + filet + 3 bandes overlay ; portfolio = titre « Toutes nos réalisations » + filet
> + barre « Filtres » + sous-filtres en grille « Tous les univers » + 12 en 3 col. ; cartes grille
> **image+légende-dessous** via nouveau DS `RealisationGridCard`) ; **hero détail** corrigé (fil
> d'ariane + image à marges + voile 25% + titre sur l'image, plus de cartouche). **Reste :** intro
> détail (composition éditoriale cluster d'images vs 2 col.), chevron d'onglet (↓ vs › fermé, mineur),
> méta vide (contenu Studio) ; **T028 motion · T029 responsive tablette/mobile (pas de render Figma →
> UNVERIFIED par design) · T031 `npm run build` (creds CI, cf. post-mortem 0013) · T033 validation.**
> Voir ADR 0020 + post-mortem 0013.
>
> **⚠️ Réalignement (2026-06-21, constitution v1.8.0 / ADR 0019)** — les réalisations sont une
> **collection dynamique** : elles vivent **directement dans Sanity** (dev `wje1fhkq` + prod
> `vbuzs69z`, peuplés), **pas dans git**. Les tâches T007/T009/T010 (builder + 432 Mo
> `seed-assets/realisations/` + seed enregistré) ont été **retirées** ; T011 a servi de bootstrap
> dev. Le seed CI ne porte plus que le **socle statique**. Réalisations = éditeur-first / MCP
> (ADR 0020 § « Mise à jour »).

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, pas de dépendance sur une tâche incomplète)
- **[Story]** : US1 / US2 / US3 / US4 (phases user story uniquement)
- Chemins de fichiers exacts inclus

## Conventions de chemins

Monolithe Next.js App Router (voir plan.md → Project Structure). Tous les chemins sont relatifs à
la racine du worktree `…/showcase.012-realisations-portfolio/`.

---

## Phase 1: Setup (modèle partagé)

**Purpose**: poser le type Sanity et la taxonomie partagée dont dépend tout le reste.

- [X] T001 [P] Créer la taxonomie partagée dans `src/content/realisations.ts` : `UNIVERS` (12, `as const`), `Univers`, `EXPERTISE_SLUGS` (3 slugs), `ExpertiseSlug`, `EXPERTISE_LABELS`, `RealisationLayout`, `RealisationStatus`, et le type `RealisationContent` (data-model.md §contenu partagé). **Pas encore** les 23 records.
- [X] T002 Créer le schéma `src/sanity/schemas/documents/realisation.ts` : `defineType("realisation", document)` avec groups `identity/classification/infos/narrative/media/seo` et tous les champs de data-model.md (réutiliser `imageField` de `../fields` ; `univers.options.list` importé de `UNIVERS` ; objet `challenge` `validation.max(3)` ; `status`/`layout` listes radio ; `preview`). `_id` non dotté (`realisation-<slug>`).
- [X] T003 Enregistrer le type dans `src/sanity/schemas/index.ts` et ajouter l'entrée desk dans `src/sanity/structure.ts` : `S.documentTypeList("realisation")` (titre « Réalisations », `defaultOrdering` `order desc`) + ajouter `"realisation"` à la liste `EXPLICIT`.
- [X] T004 Lancer `npm run typegen` et vérifier que le type `Realisation` apparaît dans `src/sanity.types.ts` (commité). (dépend de T002, T003)

**Checkpoint**: le type existe dans le Studio + types générés disponibles.

---

## Phase 2: Foundational (prérequis bloquants)

**Purpose**: rendre des réalisations **interrogeables** (queries + connecteur + contenu seedé).
**⚠️ Aucune user story ne peut commencer avant la fin de cette phase.**

- [X] T005 Ajouter les queries cœur dans `src/lib/sanity/queries.ts` (contracts §1) : `REALISATIONS_LIST_QUERY`, `REALISATION_QUERY($slug)`, `REALISATION_SLUGS_QUERY` (projection d'images `{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }`). Puis `npm run typegen`. (dépend de T004)
- [X] T006 Créer le connecteur `src/lib/sanity/realisation.ts` (contracts §2, pattern `sectorDetail.ts`) : `getRealisationListProps()` (→ `RealisationListItem[]`, `meta` = location/year/area filtrés, `href` undefined si non publié) et `getRealisationProps(slug)` (→ `RealisationDetailProps | null` + voisins prev/next via `REALISATION_SLUGS_QUERY`, bornés). Utiliser `sanityFetch` + `mapImage`. Types dérivés via `Awaited<ReturnType<…>>`. (dépend de T005)
- [X] T007 [P] Créer le builder de seed `src/sanity/seed/documents/realisation.build.ts` : `buildRealisationSeed(content, files)` → `defineSeed<Realisation>({…})` (pattern `sectorDetail.build.ts`), `_id: realisation-<slug>`, images via `image("seed-assets/realisations/<slug>/<seo>", alt)`, `challenges`/membres d'array avec discriminateur `_type`.
- [X] T008 Renseigner les **23 études** dans `realisationsContent` (`src/content/realisations.ts`) depuis le pptx client (`~/Downloads/OneDrive_2026-06-19/04 - Dossier portfolio dev/Page portfolio - contenu texte.pptx`) : title/client/status/order/univers/expertises (heuristique D2/data-model)/layout (depuis le nb de photos, D5)/context/enjeu/interventions/challenges/skills/photoCredit/infos. Marquer Cambaceres + Ibis `upcoming`, Bureaux Lumière + Bureaux Publicis `draft`. (dépend de T001)
- [X] T009 Intégrer + renommer SEO les photos dans `seed-assets/realisations/<slug>/` (`estuaire-agencement-<client>-<n>.<ext>`, D13) depuis `…/Photos DEF/` — **dossier source laissé intact** ; NVH en `.avif` basse déf tel quel. Vérifier que `galleryCount` de T008 correspond aux fichiers réels.
- [X] T010 Créer `src/sanity/seed/documents/realisations.seed.ts` (`export default realisationsContent.map(c => buildRealisationSeed(c, …))`, pattern `expertiseSubpages.seed.ts`) et l'ajouter à `src/sanity/seed/registry.ts` (`...realisations`). (dépend de T007, T008, T009)
- [X] T011 `npm run seed -- --check` (corriger jusqu'au vert : requis présents + assets sur disque), puis `npm run seed -- realisation` (projet **dev**). Vérifier les 23 docs + leurs images dans le Studio. (dépend de T010)

**Checkpoint**: des réalisations publiées sont interrogeables → les user stories peuvent démarrer.

---

## Phase 3: User Story 1 — Découvrir les réalisations et explorer un projet (P1) 🎯 MVP

**Goal**: page liste `/realisations` (Dernières Réalisations + grille cliquable) menant à une page
détail `/realisations/[slug]` lisible de bout en bout (récit + images + variantes + prev/suiv).

**Independent Test**: avec ≥ 1 réalisation publiée, ouvrir `/realisations`, voir la réalisation
listée, cliquer, atterrir sur `/realisations/<slug>`, lire l'intégralité du récit (contexte → enjeu
→ missions → défis → savoir-faire) avec ses images, et naviguer prev/suiv. (sans filtres — US2)

- [X] T012 [P] [US1] Créer la primitive `src/design-system/components/Carousel.tsx` (`"use client"`, contracts §6) : grande visuelle + `CarouselArrow` prev/suiv, index interne, `prefers-reduced-motion` friendly, props `images`/`className`. L'exporter depuis `src/design-system/index.ts`. Tokens `@theme` only (Principe X).
- [X] T013 [US1] Lire les nodes Figma complets `portfolio` (51:4064), `case-study` (51:4386, fournie), `case-study-court` (53:2745, légère) via la skill `estuaire-figma-cli` ; charger la skill `estuaire-pixel-perfect` avant de coder (géométrie, ratios des emplacements d'images, barre filtres, bandeau Dernières Réalisations, bloc logos).
- [X] T014 [US1] Créer la page détail `src/app/(site)/realisations/[slug]/page.tsx` (RSC connecteur, pattern `univers/[slug]/page.tsx`) : `getRealisationProps(slug)` → `notFound()` si `null` ; `generateMetadata` par slug ; **pas** de `generateStaticParams` (ISR via `sanityFetch`). Composer les sections dans l'ordre FR-019 : `Breadcrumb` (réalisations / titre) → intro (contexte+enjeu ; `layout==="fournie"` → `<Carousel>`, sinon compacte) → nos missions (`interventions`) → défis (`challenges` 1→3) → crédit photo (si `photoCredit`, **entre** dernier défi et savoir-faire) → savoir-faire (`skills` → `Pill`). Composants `@/design-system`. (dépend de T006, T012, T013)
- [X] T015 [US1] Ajouter la navigation précédent/suivant (bornée, D8) en bas de la page détail : `<Link>` vers les voisins fournis par `getRealisationProps` (masquer le lien absent aux bornes ; sans lien cassé). Attribut Umami `realisation_nav` (direction/from). (dépend de T014)
- [X] T016 [US1] Créer la page liste `src/app/(site)/realisations/page.tsx` (RSC connecteur) : `getRealisationListProps()` → section « Dernières Réalisations » (3 plus récentes **publiées**) + grille du portfolio (cartes via `CaseStudyCard` ou variante confirmée en T013). Cartes `published` cliquables (`href`) → détail ; `upcoming` grisées non cliquables. `generateMetadata`. Attribut Umami `realisation_card_open` (slug). (dépend de T006, T013)

**Checkpoint**: US1 pleinement fonctionnelle et testable seule (liste → détail, 2 variantes, prev/suiv).

---

## Phase 4: User Story 2 — Filtrer et parcourir le portfolio (P2)

**Goal**: filtrer la grille (Univers · Expertises · Clients, combinables), charger davantage de
résultats, et afficher des états vides explicites — le tout sans rechargement (SC-004).

**Independent Test**: sur `/realisations`, activer un filtre d'univers → seules ses réalisations
restent ; combiner avec un autre filtre ; « charger d'autres réalisations » révèle des entrées ;
une combinaison sans résultat → état vide + bouton contact ; un univers sans publiée → « revenez
bientôt ».

- [X] T017 [US2] Créer le composant client `src/app/(site)/realisations/RealisationsBrowser.tsx` (`"use client"`, reçoit `items: RealisationListItem[]` en props — pas de fetch, Principe VIII) : barre de filtres 3 onglets `Filter` (Univers/Expertises/Clients) + `SubFilter` (valeurs), **un choix par dimension**, **combinaison ET** entre dimensions, réinitialisation « tous ». Filtrage en mémoire (D4). (dépend de T016)
- [X] T018 [US2] Affichage progressif dans `RealisationsBrowser` : afficher un sous-ensemble (≈ 6) + bouton « charger d'autres réalisations » révélant la suite (sans rechargement). Attribut Umami `realisation_load_more`. (dépend de T017)
- [X] T019 [US2] États vides dans `RealisationsBrowser` : combinaison sans résultat → message + bouton « contactez-nous » (Umami `realisation_empty_contact`) ; univers filtré sans réalisation publiée → message « revenez bientôt » (FR-014/FR-015). (dépend de T017)
- [X] T020 [US2] Deep-link & tracking : `RealisationsBrowser` initialise son filtre actif depuis l'URL (`?univers=` / `?expertise=` / `?client=`, lus dans `page.tsx` via `searchParams` et passés en props) ; émettre `realisation_filter` (dimension/value) à la sélection. Brancher la page liste sur le browser (remplace la grille statique de T016). (dépend de T017, T018, T019)

**Checkpoint**: US1 + US2 fonctionnent indépendamment ; filtrage instantané + états vides.

---

## Phase 5: User Story 3 — Réalisations réelles intégrées au reste du site (demock) (P2)

**Goal**: remplacer les réalisations en dur (home + 3 sous-pages d'expertises) par les données CMS,
liens menant à la vraie section Réalisations (zéro 404).

**Independent Test**: home → 3 cartes = 3 plus récentes publiées + boutons univers → `/realisations`
filtré ; chaque sous-page expertise → cas study = réalisation publiée la plus récente de l'expertise
+ CTA → `/realisations` filtré ; aucun lien réalisation en 404.

- [X] T021 [US3] Ajouter `LATEST_REALISATIONS_QUERY` et `EXPERTISE_LATEST_REALISATION_QUERY($expertise)` dans `src/lib/sanity/queries.ts` (contracts §1) ; `npm run typegen` ; ajouter `getLatestRealisations(limit)` et `getLatestRealisationForExpertise(slug)` dans `src/lib/sanity/realisation.ts`. (dépend de T006)
- [X] T022 [US3] Demock home `src/app/(site)/page.tsx` (contracts §4.1) : 3 cartes `PinnedCaseStudies` ← `getLatestRealisations(3)` (panneau → `/realisations/<slug>`) ; 12 boutons secteurs (libellés `UNIVERS`) → `href=/realisations?univers=<slug>` ; images décoratives feature/wide ← covers de réalisations récentes. Conserver `home_realisation_click`/`home_sector_click`. (dépend de T021)
- [X] T023 [US3] Supprimer `src/content/homeRealisations.ts` et ses imports ; retirer les assets `public/home/realisations/` désormais inutilisés. Vérifier que la home build sans référence morte. (dépend de T022)
- [X] T024 [US3] Demock sous-pages d'expertises `src/app/(site)/expertises/[expertise]/page.tsx` (contracts §4.2) : la section « cas study » utilise `getLatestRealisationForExpertise(slug)` (cover/title/meta) + CTA `href=/realisations?expertise=<slug>` ; **repli dégradé** sur les `caseStudy*` du doc + CTA `/realisations` si `null`. Titre de section inchangé. Conserver `case_study_click`. (dépend de T021)
- [X] T025 [US3] Vérifier zéro 404 (SC-002) : home (cartes + boutons), sous-pages expertises (CTA), fil d'ariane détail, nav prev/suiv — tous les liens « réalisations » aboutissent à une page valide avec ≥ 1 publiée par cible. (dépend de T022, T024)

**Checkpoint**: les 3 user stories sont indépendamment fonctionnelles ; site cohérent, zéro 404.

---

## Phase 6: User Story 4 — Gérer les réalisations dans le CMS (P3)

**Goal**: l'éditeur crée/édite une réalisation depuis le Studio, et l'affichage public reflète les
changements après revalidation — sans développeur.

**Independent Test**: dans le Studio, créer une réalisation, la publier, ajouter images + statut, et
vérifier que la liste et le détail reflètent le changement après revalidation.

- [X] T026 [US4] Vérifier de bout en bout les transitions de `status` (data-model §invariants) : `published` → liste cliquable + détail ; `upcoming` → grisé non cliquable + `/realisations/<slug>` → 404 propre ; `draft` → invisible partout. Corriger le filtrage des queries si un état fuit. (dépend de T011, T014, T016)
- [X] T027 [US4] Ergonomie Studio : confirmer `defaultOrdering` `order desc` (T003), les `description` d'aide des champs, et que les champs `infos`/`photoCredit` vides sont bien masqués à l'affichage (FR-004). Vérifier qu'une création + publication d'une nouvelle réalisation apparaît après revalidation (webhook → `revalidateTag`). (dépend de T026)

**Checkpoint**: autonomie éditoriale validée.

---

## Phase 7: Polish & qualité transverse

**Purpose**: motion, responsive, pixel-perfect, qualité de code, décision documentée.

- [ ] T028 [P] Passe motion (skill `estuaire-motion`) sur liste + détail : reveals (line-mask titres), transitions de section, carrousel d'intro, parallax sobre ; honorer `prefers-reduced-motion`. Texte statique = ancre. (dépend de T014, T016)
- [ ] T029 Responsive par breakpoint (FR-031) des pages liste + détail (tablette + mobile) — maquettes desktop only → interpréter par breakpoint (grille, carrousel, barre de filtres, prev/suiv).
- [ ] T030 Revue pixel-perfect (skill `estuaire-pixel-review`, **obligatoire**) : capturer dev par breakpoint, aligner section par section contre les renders Figma cachés (51:4064 / 51:4386 / 53:2745), corriger → recapturer → re-diff jusqu'à zéro écart ; nommer tout écart résiduel UNVERIFIED. (dépend de T028, T029)
- [ ] T031 [P] `npm run lint` (Biome) + `npm run build` au vert ; aucun `any`, aucun import mort, aucune couleur/typo en dur (Principes IX/X).
- [X] T032 [P] Consigner la décision durable dans le vault : ADR `docs/vault/decisions/00XX-realisation-collection-type.md` (premier type collection : pattern, taxonomie listes contrôlées vs références, filtrage client-side, layout fournie/légère). ⚠️ Numéro ADR : vérifier les collisions parallèles (skill `estuaire-branch-sync`).
- [ ] T033 Exécuter la validation `quickstart.md` (vérifications fonctionnelles mappées aux scénarios US1–US4 + SC-002/003/005/008).

---

## Dependencies & Execution Order

### Dépendances de phase

- **Setup (Phase 1)** : aucune dépendance — démarrer immédiatement (T001 [P] ; T002→T003→T004).
- **Foundational (Phase 2)** : dépend de Setup — **bloque toutes les user stories**.
- **User Stories (Phases 3–6)** : dépendent de Foundational. US1 d'abord (MVP) ; US2 et US3
  s'appuient sur le connecteur (T006/T021) mais sont testables indépendamment ; US4 = vérification.
- **Polish (Phase 7)** : dépend des user stories visées (au moins US1–US3).

### Dépendances entre user stories

- **US1 (P1)** : démarre après Foundational. Aucune dépendance sur une autre story.
- **US2 (P2)** : démarre après US1 (réutilise/raffine la page liste T016 → browser).
- **US3 (P2)** : démarre après Foundational (a juste besoin de T021) ; indépendante de US1/US2.
- **US4 (P3)** : vérification — après que US1 (détail/liste) et Foundational (seed) existent.

### Au sein d'une user story

- Lire la maquette (T013) avant de coder les pages.
- DS/queries/connecteur avant pages ; pages avant interactions (filtres/load-more).
- Story complète avant de passer à la priorité suivante.

### Opportunités parallèles

- T001 ([P]) en parallèle du reste du Setup au démarrage.
- T007 ([P], builder) en parallèle de T005/T006 (queries/connecteur) — fichiers différents.
- T012 ([P], Carousel DS) en parallèle des autres tâches US1.
- T028 / T031 / T032 ([P]) en Polish — fichiers/disciplines distincts.
- US2 et US3 peuvent être menées en parallèle par deux personnes une fois US1 + T021 prêts.

---

## Parallel Example: Foundational

```text
# Une fois T004 fait, lancer en parallèle (fichiers différents) :
T005  queries cœur (src/lib/sanity/queries.ts)
T007  builder de seed (src/sanity/seed/documents/realisation.build.ts)
# Puis séquentiel : T006 (connecteur, dépend T005) ; T008/T009 (contenu+assets) → T010 → T011
```

## Parallel Example: User Story 1

```text
# Au démarrage d'US1 (après Foundational) :
T012  Carousel DS          (src/design-system/components/Carousel.tsx)   [P]
T013  Lecture maquette Figma (prérequis build — bloque T014/T016)
# Puis : T014 (détail) → T015 (prev/suiv) ; T016 (liste) en parallèle de T014 une fois T013 fait
```

---

## Implementation Strategy

### MVP First (US1 uniquement)

1. Phase 1 Setup → Phase 2 Foundational (seed inclus — bloquant).
2. Phase 3 US1 (liste + détail + variantes + prev/suiv).
3. **STOP & VALIDATE** : tester US1 seule (independent test ci-dessus).
4. Démo possible : portfolio consultable + études de cas lisibles.

### Livraison incrémentale

1. Setup + Foundational → données interrogeables.
2. US1 → tester → démo (MVP : liste → détail).
3. US2 → filtrage + load-more + états vides → tester → démo.
4. US3 → demock home + expertises → zéro 404 → tester → démo.
5. US4 → autonomie éditoriale vérifiée.
6. Polish → motion + responsive + pixel-perfect + ADR.

---

## Notes

- `[P]` = fichiers différents, pas de dépendance ; `[Story]` = traçabilité user story.
- Pas de tâche de test (pas de suite ; gates = build/lint/`seed --check`/pixel-review).
- `_id = realisation-<slug>` (hyphen, **jamais** de point — post-mortem 0010).
- Dataset dev partagé — pas de `--reset` si un autre worktree travaille.
- Commit après chaque tâche ou groupe logique cohérent.
- Après implémentation : hooks optionnels `speckit.verify.run` puis `speckit.review.run`
  (`.specify/extensions.yml`).
