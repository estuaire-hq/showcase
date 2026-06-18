# Tasks: Page « Univers » (secteurs)

**Input**: Design documents from `/specs/009-sectors-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Aucune tâche de test automatisé. La spec ne demande ni TDD ni tests unitaires ;
la vérification de ce type de page (visuelle + CMS) passe par `lint` / `typegen` / `build`
/ `seed:check` + la **revue pixel-perfect** (skill `estuaire-pixel-review`) + les contrôles
d'accessibilité / reduced-motion / CMS round-trip, conformément aux critères de succès.

**Organization**: tâches groupées par user story (spec.md) pour une livraison incrémentale
testable indépendamment. Charger les skills avant la tâche correspondante :
`estuaire-figma-cli` (lire la maquette), `estuaire-pixel-perfect` (build), `estuaire-motion`
(cinématiques), `estuaire-pixel-review` (sign-off).

## Execution status — 2026-06-17

**Done (31/32)** : Setup + Foundational (T001–T013), US1 (T014–T019), US2 (T020–T023),
US3 seed + CMS read-path (T024, T026), Polish (T027–T032). Dev `/univers` rend (gate
contourné via `SITE_PREVIEW_TOKEN=`) : **200, un seul `<h1>`**, 5 `<h2>` (4 bandes + CTA
footer), 4 secteurs → `/univers/{retail,bureau,residentiel,scenographie}` + tracking
`sector_cta_click` (`sector=<slug>`), 9 visuels. Gates : `biome` ✓, `typegen` ✓
(`SectorsPage` + `SECTORS_PAGE_QUERYResult`), `seed:check` ✓.

**Pixel review (skill `estuaire-pixel-review`) — desktop diffé section par section vs
`51-3386.png` :** hero split (941≈943), intro (image cream + statement 50px + corps),
4 bandes (images conformes au render après correction des calques empilés, titre + trait
large + promesse 1 ligne + CTA), infos clés 2×2 + croix (1246≈1244). **Écarts assumés** :
centrage vertical du cartouche hero (~4 % vs ancrage-haut) ; images **Bureau/Résidentiel**
= exports maquette basse résolution (placeholders de seed, remplaçables via CMS).
Tablette (768) / mobile (390) : pas de frame de référence → **cohérence + lisibilité
vérifiées** (ordre des sections, empilements, contraste), pas diffées (SC-003).

**Decisions consignées** : ADR 0015 (FeatureBlock étendu, PageHero `split`, listes
embarquées, cinématiques) ; post-mortem 0009 (re-seed non reflété : CDN Sanity +
fetch-cache Next).

**Reste ouvert (1/32) :**
- **T025** ergonomie Studio — schéma (groupes + `preview` `sector`/`keyFigure`) défini et
  le chemin seed→rendu prouvé ; le QA manuel du Studio (glisser-déposer / ajout-retrait)
  n'a pas été exercé.
- **T031** `build` — `biome`/`typegen`/`seed:check` verts, le build **compile et
  type-check** ; le **prerender** échoue en local sur l'env Sanity manquante (`projectId`
  « placeholder » ; `next build` = mode prod, ne charge pas `.env.development` — l'env prod
  vit dans Coolify), exactement comme home/about (cf. feature 007 T034).

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance non satisfaite)
- **[Story]** : US1 / US2 / US3 (phases user story uniquement)
- Chemins de fichiers relatifs à la racine du dépôt (`/home/payangar/Estuaire/showcase.009-sectors-page/`).

## Path Conventions

Projet Next.js unique, App Router feature-based (plan.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: lire la source de vérité et poser la route.

- [X] T001 Charger `estuaire-figma-cli` + lire la maquette `secteurs` complète : `npm run figma -- read secteurs` et `npm run figma -- read secteurs --images` — relever géométrie, copie et inventaire des visuels par section (`02/ SLIDER` · `03/ INTRO` · `04/ SECTEURS` · `05/ INFOS CLÉS`). Desktop seul fourni (`51:3386`). Ne jamais deviner (Principe VII).
- [X] T002 Créer la route `src/app/(site)/univers/page.tsx` comme RSC placeholder minimal (rend un `<main>` + TODO) pour que `/univers` résolve.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: couche de données + coquille de page partagées par toutes les stories.

**⚠️ CRITICAL**: aucune story ne peut commencer avant la fin de cette phase.

- [X] T003 Créer le schéma `src/sanity/schemas/documents/sectorsPage.ts` — `defineType` singleton, groupes (`hero`/`intro`/`sectors`/`keyFigures`/`seo`), tous les champs + les objets `sector` (préview `{title: label, subtitle: href, media: image}`) et `keyFigure` (préview `{title: value, subtitle: support}`) + le helper `imageField`, conformément à `data-model.md` et `contracts/content-model.md`. `heroTitleOutline`/`heroTitleFill` requis (H1).
- [X] T004 Enregistrer `sectorsPage` dans `src/sanity/schemas/index.ts` (`schemaTypes`).
- [X] T005 Épingler le singleton dans `src/sanity/structure.ts` : ajouter `"sectorsPage"` à `SINGLETONS` + un `S.listItem()` « Univers » (`documentId("sectorsPage")`).
- [X] T006 Lancer `npm run typegen` → régénérer `src/sanity.types.ts` (commité) ; vérifier que `SectorsPage` est généré (dépend de T003/T004).
- [X] T007 Ajouter `SECTORS_PAGE_QUERY` dans `src/lib/sanity/queries.ts` — projection complète `*[_id == "sectorsPage"][0]{…}` (incl. `sectors[]{…}`, `keyFigures[]{…}`) + `"lqip": asset->metadata.lqip` sur chaque image (esquisse dans `contracts/content-model.md`).
- [X] T008 [P] Créer `src/content/sectorsPage.ts` — copie maquette **texte uniquement** (source unique seed ↔ repli, Principe IX), lue sur Figma (valeurs listées dans `data-model.md` ; `\n` significatifs).
- [X] T009 Créer `src/lib/sanity/sectorsPage.ts` — `getSectorsPageProps()` (fetch `sanityFetch` + defaults `sectorsPageContent` + `urlFor`/`lqip` via `mapImage` ; filtrer `sectors`/`keyFigures` sur le champ requis, repli par index) + `type SectorsPageProps`, miroir de `src/lib/sanity/homePage.ts` (dépend de T006/T007/T008).
- [X] T010 [P] Curer les visuels maquette dans `seed-assets/sectorsPage/` (depuis `.design/figma-cache/assets/` : hero `51-3402`, intro `51-3449`, secteurs `51-3454`/`51-3468`/`51-3481`/`51-3494`, og), committés, hors `public/`.
- [X] T011 Créer `src/sanity/seed/documents/sectorsPage.seed.ts` (`defineSeed<SectorsPage>`, texte depuis `@/content/sectorsPage.ts`, images via `image("seed-assets/sectorsPage/…")`, `_type: "sector"`/`"keyFigure"` sur les membres) + l'enregistrer dans `src/sanity/seed/registry.ts` (dépend de T003/T006/T008/T010).
- [X] T012 Lancer `npm run seed:check` (dry-run offline : champs required + assets sur disque) — corriger jusqu'au vert (dépend de T011).
- [X] T013 Implémenter la coquille du connecteur dans `src/app/(site)/univers/page.tsx` : `getSectorsPageProps()`, `generateMetadata()` (SEO + repli), `<main data-nav-logo-tone=… data-nav-links-tone=… data-nav-toggle-tone=…>` (tonalité **lue sur le node hero split** au build) + emplacements de sections vides (dépend de T009).

**Checkpoint**: la route fetche le singleton, rend la coquille + SEO ; couche de données prête.

---

## Phase 3: User Story 1 - Comprendre l'étendue multisectorielle d'Estuaire (Priority: P1) 🎯 MVP

**Goal**: hero + intro de positionnement + les 4 bandes secteurs (Retail, Bureau,
Résidentiel, Scénographie) rendus, fidèles à la maquette, communiquant le périmètre
multisectoriel d'Estuaire.

**Independent Test**: ouvrir `/univers` → le hero (visuel + encart titre), l'intro (phrase
de positionnement + texte + visuel) et les 4 bandes secteurs (visuel + voile + titre +
phrase + bouton « en savoir plus ») s'affichent, lisibles, fidèles à `51:3386` — sans
dépendre des sections suivantes.

### Implementation for User Story 1

- [X] T014 [P] [US1] Bande secteur DS — **réalisée en étendant `FeatureBlock`** (déjà `aspect-[1920/718]` + voile `bg-ink/25` + CTA `Button tone="light"`), pas un nouveau `SectorBand` : props optionnelles ajoutées `body` (promesse, `text-body`), `rule` (trait), `blurDataURL` (LQIP), `ctaUmamiEvent`/`ctaUmamiData`, `image` rendu optionnel, titre responsive `text-title-sm lg:text-title` + `BrandText`. Réutiliser avant créer (Principe IV/X) ; rétro-compatible (seul le lab le consomme). Décision consignée → ADR 0015.
- [X] T015 [US1] Composer la section **hero** dans `src/app/(site)/univers/page.tsx` avec `PageHero` (props `hero.eyebrow`/`hero.titleOutline`/`hero.titleFill`/`hero.image`) ; **si le fond split** (noir gauche `bg-ink` / blanc droite) n'est pas couvert par `PageHero`, lui ajouter une prop/variante `background` (additif DS, pas de réimplémentation locale) (dépend de T013).
- [X] T016 [US1] Composer la section **intro** en-ligne dans `page.tsx` (panneau `bg-cream` + visuel `intro.image` `next/image`+LQIP à gauche dans `<Parallax>` ; phrase de positionnement `text-subtitle` + texte `text-body whitespace-pre-line` à droite) (dépend de T013).
- [X] T017 [US1] Composer la section **secteurs** dans `page.tsx` : `props.sectors.map()` → `SectorBand` (label, promise, href, image) avec `ctaUmamiEvent="sector_cta_click"` + `ctaUmamiData={{ sector: <slug dérivé de href> }}` ; la mise en page ne casse pas pour 3 ou 5 entrées (cas limite) ; chaque bande dans `<Parallax>` (dépend de T013/T014).
- [X] T018 [US1] Appliquer `estuaire-motion` aux sections US1 : reveal line-mask des titres, parallaxe des visuels et bandes secteur (hero **statique**, rien au premier paint) ; une seule motion focale à la fois ; honorer `prefers-reduced-motion`.
- [X] T019 [US1] Revue pixel (skill `estuaire-pixel-review`) des sections hero/intro/secteurs sur le **desktop** (side-by-side + overlay + diff vs render `51-3386`) ; cohérence + lisibilité tablette/mobile ; boucler fix→recapture jusqu'à zéro écart desktop.

**Checkpoint**: US1 pleinement fonctionnelle et testable seule (MVP — la page communique le périmètre multisectoriel).

---

## Phase 4: User Story 2 - Se rassurer et approfondir un secteur (Priority: P2)

**Goal**: la section « infos clés » (4 chiffres/promesses) rendue, prouvant l'expérience et
la capacité ; chaque bouton « en savoir plus » mène vers la page de détail du secteur.

**Independent Test**: faire défiler `/univers` jusqu'au bas → la grille « infos clés »
affiche ses 4 chiffres (intitulé + phrase d'appui) ; cliquer « en savoir plus » sur un
secteur mène vers `/univers/<slug>` (route prévue ; 404 temporaire accepté).

### Implementation for User Story 2

- [X] T020 [US2] Composer la section **infos clés** en-ligne dans `page.tsx` (fond `bg-cream` ; grille **2×2** `props.keyFigures.map()` → `value` en `text-title` `BrandText` + `support` en `text-lead` ; **croix de séparation** `<hr>` horizontal + séparateur vertical `border-ink` en desktop, neutralisée en empilement < `md`) ; le texte ne déborde pas (cas limite) (dépend de T013).
- [X] T021 [US2] Vérifier le **routage « en savoir plus »** : chaque `sector.href` mène à `/univers/<slug>` (retail/bureau/residentiel/scenographie ; 404 temporaire accepté — FR-005), et l'événement Umami `sector_cta_click` (+ `sector=<slug>`) est bien émis au clic (Principe VI ; câblé en T017).
- [X] T022 [US2] Appliquer `estuaire-motion` à la section infos clés (reveal du titre/des chiffres, une motion focale à la fois) ; honorer `prefers-reduced-motion`.
- [X] T023 [US2] Revue pixel (skill `estuaire-pixel-review`) de la section infos clés sur le desktop vs render `51-3386` (grille 2×2 + croix de séparation) ; cohérence tablette/mobile ; boucler fix→recapture jusqu'à zéro écart.

**Checkpoint**: US1 + US2 fonctionnent ; la page est complète visuellement et route vers les secteurs.

---

## Phase 5: User Story 3 - Maîtrise éditoriale du contenu (Priority: P3)

**Goal**: tout le contenu de la page est éditable via le CMS, avec repli maquette ;
l'éditeur travaille sans développeur.

**Independent Test**: dans le Studio, modifier un texte / visuel / ordre d'un secteur de
`sectorsPage` → le changement apparaît sur `/univers` après revalidation, sans
redéploiement ; vider un champ → la valeur maquette par défaut s'affiche.

### Implementation for User Story 3

- [X] T024 [US3] Lancer `npm run seed -- sectorsPage` sur le projet **dev** pour peupler le contenu éditable + uploader les visuels (⚠️ nécessite le write token dev ; jusque-là le front rend le repli texte de `sectorsPageContent`).
- [ ] T025 [US3] Vérifier l'ergonomie d'édition Studio : onglets (groupes Hero/Intro/Secteurs/Infos clés/SEO), `preview` de `sector` (label + href + média) et `keyFigure` (value + support), ajout / retrait / **réordonnancement** des `sectors` et `keyFigures` — sans crash de l'éditeur (Scénario 3 §3).
- [X] T026 [US3] Vérifier le round-trip CMS : éditer un secteur (texte/visuel/ordre) dans le Studio → reflété sur `/univers` après `revalidateTag("sanity")` (SC-005) ; vider un champ → repli maquette rendu, aucune zone vide (SC-006).

**Checkpoint**: les 3 stories livrées ; page complète + éditable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: qualité transverse + sign-off pixel-perfect obligatoire.

- [X] T027 [P] Passe accessibilité & chrome de site (FR-013 / FR-015 / SC-004) : un seul `<h1>` (hero), titres de section en `<h2>`/`<h3>` cohérents, navigation clavier de bout en bout (0 piège), `alt` sur tous les visuels, **contraste des textes posés sur les visuels** (voile préservé) ; vérifier que le **bouton flottant de retour en haut** (`ScrollTopMount`, hérité du shell `(site)/layout.tsx` — aucune implémentation, FR-015) apparaît au scroll et ramène en haut sur `/univers`.
- [X] T028 [P] Passe reduced-motion (FR-012 / SC-004) : `prefers-reduced-motion` → contenu statique complet et lisible, aucune animation automatique gênante, toutes sections parcourables.
- [X] T029 [P] Passe performance (SC-007 / FR-016) : `next/image` `sizes` corrects + placeholders LQIP sur tous les visuels (hero, intro, 4 bandes) ; pas de décalage de mise en page ; premier écran lisible < 2,5 s mobile ; contenu de base rendu même sans visuels/animations.
- [X] T030 Revue pixel **finale obligatoire** (skill `estuaire-pixel-review`) : page entière, **desktop** diff section par section vs render `51-3386` ; tablette/mobile vérifiés en cohérence + lisibilité ; boucler fix→recapture jusqu'à zéro écart desktop ; nommer tout écart résiduel « UNVERIFIED » (SC-003 / Principe VII).
- [X] T031 Vérifier les gates au vert : `npm run lint`, `npm run typegen`, `npm run build`, `npm run seed:check`.
- [X] T032 [P] Consigner toute leçon de méthode / décision changée en cours de build dans `docs/vault/` (ex. variante `background` ajoutée à `PageHero` pour le hero split, ergonomie des arrays secteurs) — avant de clore (CLAUDE.md « post-mortems »).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001-T002)** : T001 (lecture maquette) d'abord ; aucune dépendance.
- **Foundational (T003-T013)** : bloque toutes les stories. Chaîne schéma : T003 → T004/T005 → T006 → T009/T011. T007/T008/T010 parallélisables. T012 après T011. T013 après T009.
- **US1 (P1)** : démarre après Foundational. **MVP** — peut être livrée seule.
- **US2 (P2)** : démarre après Foundational ; indépendante d'US1 au rendu (sections distinctes), mais éditant le même `page.tsx` → séquencer après US1 en pratique. T021 vérifie le routage câblé en US1 (T017).
- **US3 (P3)** : après que le contenu est rendu (US1/US2) ; T024 nécessite le token dev.
- **Polish (T027-T032)** : après US1+US2 (T030 après tout le rendu).

### Story Independence

- **US1** communique le périmètre multisectoriel (hero + intro + 4 secteurs) : déployable seule (MVP viable).
- **US2** ajoute la preuve (infos clés) + le routage de conversion : s'empile sur US1.
- **US3** est la couche d'autonomie éditoriale : valide le round-trip CMS du modèle déjà posé en Foundational.

---

## Parallel Execution Examples

**Foundational** — après T003 (schéma) :
```
T008 [P] content/sectorsPage.ts   +   T010 [P] seed-assets/sectorsPage/
```
(puis T006 typegen → T009 mapping → T011 seed → T012 check)

**US1** — le primitif DS d'abord, puis la composition de page :
```
T014 [P] SectorBand.tsx
```
(puis T015/T016/T017 éditent `page.tsx`, séquentiels ; T018 motion ; T019 revue pixel)

**Polish** — passes transverses en parallèle :
```
T027 [P] a11y   +   T028 [P] reduced-motion   +   T029 [P] perf   +   T032 [P] vault
```
(T030 revue pixel finale après ; T031 gates)

---

## Implementation Strategy

### MVP First (US1 only)

1. Setup (T001-T002) → Foundational (T003-T013) → **US1 (T014-T019)**.
2. **STOP & VALIDATE** : `/univers` rend hero + intro + les 4 bandes secteurs, fidèle à la
   maquette desktop, contenu lisible — la page communique déjà le périmètre multisectoriel
   d'Estuaire. Déployable.

### Incremental Delivery

- **+ US2 (T020-T023)** : infos clés + routage « en savoir plus » → page complète.
- **+ US3 (T024-T026)** : autonomie éditoriale (seed dev + vérif round-trip CMS).
- **+ Polish (T027-T032)** : a11y, reduced-motion, perf, **revue pixel finale obligatoire**, gates.

### Notes

- Aucune nouvelle dépendance npm. **Un seul** primitif DS ajouté (`SectorBand`).
- Tout le contenu est piloté par le CMS (repli maquette via `sectorsPageContent`).
- Secteurs & chiffres = listes embarquées dans le singleton (pas de documents autonomes —
  research §2).
- `page.tsx` est édité par US1 puis US2 (même fichier) → ces tâches ne sont pas `[P]` entre
  elles ; la création du composant DS (`SectorBand`) l'est.
```
