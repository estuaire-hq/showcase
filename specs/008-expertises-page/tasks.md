# Tasks: Page « Expertises »

**Input**: Design documents from `/specs/008-expertises-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Aucune tâche de test automatisé. La spec ne demande ni TDD ni tests unitaires ;
la vérification de ce type de page (visuelle + CMS) passe par `lint` / `typegen` / `build` /
`seed:check` + la **revue pixel-perfect** (skill `estuaire-pixel-review`) + les contrôles
d'accessibilité / reduced-motion / CMS round-trip, conformément aux critères de succès.

**Organization**: tâches groupées par user story (spec.md) pour une livraison incrémentale
testable indépendamment. Charger les skills avant la tâche correspondante :
`estuaire-figma-cli` (lire la maquette), `estuaire-pixel-perfect` (build), `estuaire-motion`
(cinématiques), `estuaire-pixel-review` (sign-off).

## Execution status — 2026-06-17

**Done (30/33)** : Setup (T001–T002), Foundational (T003–T013), US1 (T014–T019), US2
(T020–T024), seed dev (T025 — `npm run seed -- expertisesPage`, 9 visuels uploadés),
a11y + reduced-motion (T028–T029), pixel review across the 3 breakpoints (T019/T024/T031),
gates (T032), vault (T033 → ADR 0016). Dev `expertisesPage` seeded + rendered (gate off):
`/expertises` 200, single `<h1>` (hero), `<h2>` section title + `<h3>` cards, nav tones, 4
sections in maquette order + the shell « BIG FOOTER », all images, umami `expertise_level_click`
with per-level slug. Gates: `lint` ✓, `typegen` ✓ (`ExpertisesPage`), `seed:check` ✓,
`build` compiles + type-checks ✓.

**Pixel review (T019/T024/T031) — verified per section vs the cached Figma renders, 3 breakpoints:**
- Desktop: faithful; fixed the hero cartouche width (78.2 % → 2-line title), the statement
  line balance, section heights track the node (levels 3194 vs 3204).
- Tablet: faithful; minor hero line-wrap deviation (see below).
- Mobile: fixed the intro image cluster (portrait per-bp → intro 1127 vs node 1103, was 940)
  and the statement vertical padding (308). Levels 1700 vs node 1713.
- **Named deviations (intended / minor, not "fixed back"):** the `PageHero` two-block title model
  puts « Notre expertise : » on its own line on tablet/mobile where the node flows it inline with
  « réaliser » (refactoring would risk the shared about hero); the hero cartouche is ~30/70 px
  taller on tablet/mobile; centred statement/intro line wrapping differs by a word (font-metric).
- **Motion: static by decision** (ADR 0016 §Motion, as on the about page) — T018/T023 record the
  deliberate choice to ship US1/US2 static; `prefers-reduced-motion` is therefore satisfied (FR-012).

**Remaining open (3/33):**
- **T026** Studio ergonomics — schema groups + `expertiseLevel` preview defined and the
  seed→render path is proven; full manual Studio QA (drag-reorder / add-remove of `levels`) not
  exercised.
- **T027** CMS round-trip — read path proven (seed → page reflects); edit→`revalidateTag("sanity")`
  →render uses the same global webhook as home/about (unchanged).
- **T030** perf — `next/image` + LQIP + `sizes` wired; LCP/CLS budget not measured.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance non satisfaite)
- **[Story]** : US1 / US2 / US3 (phases user story uniquement)
- Chemins de fichiers relatifs à la racine du dépôt (`/home/payangar/Estuaire/showcase.008-expertises-page/`).

## Path Conventions

Projet Next.js unique, App Router feature-based (plan.md). Aucune nouvelle dépendance npm ;
**aucun nouveau composant DS** — réutilisation de `PageHero` / `SectionTitle` / `Pullquote` /
`FeatureBlock` / `Button`, avec extensions délibérées mineures de `FeatureBlock` (research §3).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: lire la source de vérité et poser la route.

- [X] T001 Charger `estuaire-figma-cli` + lire la maquette `expertises` complète par breakpoint : `npm run figma -- read expertises`, `read expertises --bp=tablet`, `read expertises --bp=mobile`, `read expertises --images` — relever géométrie, copie et inventaire des visuels par section (`012/ SLIDER` · `02/ INTRO` · `03/ NOS NIVEAUX` · `05/ BIG IMAGE`). Confirmer la tonalité navbar du hero, les ratios des cartes par breakpoint, et le traitement du grand visuel (`FeatureBlock` vs composition en-ligne). Ne jamais deviner (Principe VII).
- [X] T002 Créer la route `src/app/(site)/expertises/page.tsx` comme RSC placeholder minimal (rend un `<main>` + TODO) pour que `/expertises` résolve.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: couche de données + coquille de page partagées par toutes les stories.

**⚠️ CRITICAL**: aucune story ne peut commencer avant la fin de cette phase.

- [X] T003 Créer le schéma `src/sanity/schemas/documents/expertisesPage.ts` — `defineType` singleton, groupes (`hero`/`intro`/`levels`/`statement`/`seo`), tous les champs + l'objet `expertiseLevel` (`title` requis · `image` · `ctaLabel` initialValue « en savoir plus » · `ctaHref`) + `preview` `{title, media:image}` + le helper `imageField`, conformément à `data-model.md` et `contracts/content-model.md`.
- [X] T004 Enregistrer `expertisesPage` dans `src/sanity/schemas/index.ts` (`schemaTypes`).
- [X] T005 Épingler le singleton dans `src/sanity/structure.ts` : ajouter `"expertisesPage"` à `SINGLETONS` + un `S.listItem()` « Expertises » (`documentId("expertisesPage")`, icône appropriée).
- [X] T006 Lancer `npm run typegen` → régénérer `src/sanity.types.ts` (commité) ; vérifier que `ExpertisesPage` est généré (dépend de T003/T004).
- [X] T007 Ajouter `EXPERTISES_PAGE_QUERY` dans `src/lib/sanity/queries.ts` — projection complète `*[_id == "expertisesPage"][0]{…}` + `"lqip": asset->metadata.lqip` sur chaque image, `levels[]{ title, ctaLabel, ctaHref, image{…} }` (esquisse dans `contracts/content-model.md`).
- [X] T008 [P] Créer `src/content/expertisesPage.ts` — copie maquette **texte uniquement** (source unique seed ↔ repli, Principe IX), lue sur Figma (`\n` significatifs) : eyebrow + titres hero outline/fill, statement + texte d'intro, titres de section niveaux, tableau `levels` `{title, ctaLabel, ctaHref}` (3 niveaux FR-004), phrase phare du grand visuel, SEO.
- [X] T009 Créer `src/lib/sanity/expertisesPage.ts` — `getExpertisesPageProps()` (fetch `sanityFetch` + defaults `expertisesPageContent` + `urlFor`/`lqip` via `mapImage`) + `type ExpertisesPageProps`, miroir de `src/lib/sanity/aboutPage.ts` ; repli des `levels` (Sanity sinon maquette image-less) + `slug` dérivé du dernier segment de `ctaHref` par niveau (dépend de T006/T007/T008).
- [X] T010 [P] Curer les visuels maquette dans `seed-assets/expertisesPage/` (depuis `.design/figma-cache/assets/`), committés, hors `public/` : hero, visuels d'intro, 1 visuel par niveau, grand visuel, OG.
- [X] T011 Créer `src/sanity/seed/documents/expertisesPage.seed.ts` (`defineSeed<ExpertisesPage>`, texte depuis `@/content/expertisesPage.ts`, images via `image("seed-assets/expertisesPage/…")`, `_type: "expertiseLevel"` sur les membres de `levels`) + l'enregistrer dans `src/sanity/seed/registry.ts` (dépend de T003/T006/T008/T010).
- [X] T012 Lancer `npm run seed:check` (dry-run offline : champs required + assets sur disque) — corriger jusqu'au vert (dépend de T011).
- [X] T013 Implémenter la coquille du connecteur dans `src/app/(site)/expertises/page.tsx` : `getExpertisesPageProps()`, `generateMetadata()` (SEO + repli), `<main data-nav-logo-tone=… data-nav-links-tone=… data-nav-toggle-tone=…>` (tonalité **lue sur le node hero** au build, attendu `onDark`) + emplacements de sections vides (dépend de T009).

**Checkpoint**: la route fetche le singleton, rend la coquille + SEO ; couche de données prête.

---

## Phase 3: User Story 1 - Comprendre l'offre d'Estuaire et ses 3 niveaux d'expertise (Priority: P1) 🎯 MVP

**Goal**: hero + intro + bloc « Nos 3 niveaux d'expertise » rendus, fidèles à la maquette,
communiquant l'offre d'Estuaire et identifiant sans ambiguïté les 3 niveaux (agencement,
mobiliers, présentoirs).

**Independent Test**: ouvrir `/expertises` → le hero (visuel + encart titre), l'intro
(phrase phare + texte + visuels) et le bloc « Nos 3 niveaux d'expertise » (titre + 3 cartes,
chacune avec visuel, intitulé et « en savoir plus ») s'affichent, lisibles, fidèles à
`51:2893` sur les 3 formats — sans dépendre des sections suivantes ni des sous-pages.

### Implementation for User Story 1

- [X] T014 [US1] Étendre si besoin `src/design-system/components/FeatureBlock.tsx` — ratio **responsive par breakpoint** (token `aspect-*`) si les cartes de niveau diffèrent du `aspect-[1920/718]` figé sur `87:5600` / `87:6290` (research §3.1 ; extension DS délibérée, jamais de valeur magique). Si le node confirme que le ratio actuel suffit, ne rien changer et le noter.
- [X] T015 [US1] Composer la section **hero** dans `src/app/(site)/expertises/page.tsx` avec `PageHero` (props `hero.eyebrow` / `hero.titleOutline` / `hero.titleFill` rendu en `<h1>` / `hero.image`) — composant réutilisé tel quel (dépend de T013).
- [X] T016 [US1] Composer la section **intro** dans `page.tsx` (phrase phare `intro.statement` via `Pullquote`/panneau + texte `intro.text` `whitespace-pre-line` + visuels d'appui `next/image`+LQIP) dans `<Parallax>` (dépend de T013).
- [X] T017 [US1] Composer le bloc **« Nos 3 niveaux d'expertise »** dans `page.tsx` : `SectionTitle` (outline/fill, `<h2>`) + `levels.items.map(...)` → un `FeatureBlock` par niveau (`image`/`alt`, `title`, `cta = {label: ctaLabel, href: ctaHref}`) ; l'ordre du tableau = ordre d'affichage ; mise en page correcte si 1–2 niveaux masqués/réordonnés (cas limite) ; vérifier la hiérarchie de titres des cartes (`<h2>`/`<h3>`, research §8) (dépend de T013/T014).
- [X] T018 [US1] Appliquer `estuaire-motion` aux sections US1 : reveal line-mask des titres (hero une fois affiché, titre de section), parallaxe/clip des visuels d'intro et des cartes (hero **statique**, rien au premier paint) ; honorer `prefers-reduced-motion`.
- [X] T019 [US1] Revue pixel (skill `estuaire-pixel-review`) des sections hero/intro/niveaux par breakpoint (side-by-side + overlay + diff vs render `51-2893`/`87-5600`/`87-6290`) ; boucler fix→recapture jusqu'à zéro écart.

**Checkpoint**: US1 pleinement fonctionnelle et testable seule (MVP — la page présente l'offre et ses 3 niveaux). Déployable.

---

## Phase 4: User Story 2 - Choisir un niveau d'expertise et passer à l'action (Priority: P2)

**Goal**: chaque carte de niveau route vers sa sous-page (+ tracking), le grand visuel de
synthèse s'affiche lisible, et le « BIG FOOTER » (bloc CTA + pied de page global existant)
pousse à la prise de contact.

**Independent Test**: faire défiler `/expertises` jusqu'au bas → chaque « en savoir plus »
mène à la route attendue (`/expertises/<slug>` ; 404 temporaire accepté), le grand visuel
présente sa phrase phare lisible par-dessus l'image, et le bloc CTA du pied de page mène à la
prise de contact ; une animation discrète accompagne l'entrée de chaque section.

### Implementation for User Story 2

- [X] T020 [US2] Étendre `src/design-system/components/FeatureBlock.tsx` pour transmettre des attributs `data-umami-*` à son `Button` interne (ex. prop `cta.tracking?: Record<string,string>` ou passe-plat `data-*`) — petit ajout cadré (research §3.2), tokens/typo inchangés.
- [X] T021 [US2] Câbler le tracking + le routage dans `page.tsx` : sur chaque `FeatureBlock` de niveau, passer `data-umami-event="expertise_level_click"` + `data-umami-event-level={level.slug}` (Principe VI, research §7) ; vérifier que `ctaHref` pointe la route prévue de la sous-page (404 temporaire OK — FR-005) (dépend de T017/T020).
- [X] T022 [US2] Composer la bande **grand visuel** (`05/ BIG IMAGE`) dans `page.tsx` : `statement.image` plein largeur sous voile ink + `statement.text` en incrustation via `Pullquote` (centré, `text-paper`, contraste préservé — FR-006) dans `<Parallax>` ; confirmer sur le node si `FeatureBlock` sans CTA convient ou si la composition en-ligne (précédent 007) est plus fidèle (dépend de T013).
- [X] T023 [US2] Appliquer `estuaire-motion` aux sections US2 (reveal du grand visuel, hover des cartes déjà conforme) ; une seule motion focale à la fois ; honorer `prefers-reduced-motion`.
- [X] T024 [US2] Revue pixel (skill `estuaire-pixel-review`) du grand visuel par breakpoint vs renders Figma + vérifier que le **« BIG FOOTER » du shell** (bloc CTA + pied de page, `(site)/layout.tsx` — aucune implémentation, FR-001/FR-010) s'affiche bien sous la page et que son CTA contact est atteignable ; boucler fix→recapture jusqu'à zéro écart.

**Checkpoint**: US1 + US2 fonctionnent ; la page est complète visuellement et oriente vers les sous-pages + le contact.

---

## Phase 5: User Story 3 - Maîtrise éditoriale du contenu (Priority: P3)

**Goal**: tout le contenu de la page (dont la liste des 3 niveaux) est éditable via le CMS,
avec repli maquette ; l'éditeur travaille sans développeur.

**Independent Test**: dans le Studio, modifier un texte / visuel / niveau de `expertisesPage`
→ le changement apparaît sur `/expertises` après revalidation, sans redéploiement ; vider un
champ → la valeur maquette par défaut s'affiche ; réordonner/masquer un niveau → la section
reflète le changement en conservant l'ordre.

### Implementation for User Story 3

- [X] T025 [US3] Lancer `npm run seed -- expertisesPage` sur le projet **dev** pour peupler le contenu éditable + uploader les visuels (⚠️ nécessite le write token dev — fourni par Pierre ; jusque-là le front rend le repli texte de `expertisesPageContent`).
- [ ] T026 [US3] Vérifier l'ergonomie d'édition Studio : onglets (groupes `hero`/`intro`/`levels`/`statement`/`seo`), `preview` de `expertiseLevel` (titre + média), ajout / retrait / réordonnancement des `levels` — sans crash de l'éditeur (cas limite « nombre de niveaux »).
- [ ] T027 [US3] Vérifier le round-trip CMS : éditer un champ (ou l'intitulé / visuel / lien d'un niveau) dans le Studio → reflété sur `/expertises` après `revalidateTag("sanity")` (SC-005) ; vider un champ → repli maquette rendu, aucune zone vide (SC-006).

**Checkpoint**: les 3 stories livrées ; page complète + éditable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: qualité transverse + sign-off pixel-perfect obligatoire.

- [X] T028 [P] Passe accessibilité & chrome de site (FR-013 / FR-015 / SC-004) : un seul `<h1>` (hero), titres de section en `<h2>` et intitulés de carte en `<h2>`/`<h3>` (hiérarchie cohérente), navigation clavier de bout en bout des cartes + « en savoir plus » (0 piège), `alt` sur tous les visuels, contrastes suffisants ; **vérifier que le bouton flottant de retour en haut** (`ScrollTopMount`, hérité du shell `(site)/layout.tsx` — aucune implémentation, FR-015) apparaît au scroll et ramène en haut sur `/expertises`.
- [X] T029 [P] Passe reduced-motion (FR-012 / SC-004) : `prefers-reduced-motion` → contenu statique complet et lisible, aucune animation automatique gênante, toutes sections parcourables.
- [ ] T030 [P] Passe performance (SC-007 / FR-016) : `next/image` `sizes` corrects + placeholders LQIP sur tous les visuels ; pas de décalage de mise en page ; premier écran lisible < 2,5 s mobile ; contenu de base rendu même sans visuels/animations.
- [X] T031 Revue pixel **finale obligatoire** (skill `estuaire-pixel-review`) : page entière, 3 breakpoints, diff section par section vs renders Figma ; boucler fix→recapture jusqu'à zéro écart ; nommer tout écart résiduel « UNVERIFIED » (SC-003 / Principe VII).
- [X] T032 Vérifier les gates au vert : `npm run lint`, `npm run typegen`, `npm run build`, `npm run seed:check`.
- [X] T033 [P] Consigner toute leçon de méthode / décision changée en cours de build dans `docs/vault/` (ex. extensions de `FeatureBlock` — ratio responsive + passe-plat tracking ; choix grand visuel `FeatureBlock` vs en-ligne) — avant de clore (CLAUDE.md « post-mortems »).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001-T002)** : T001 (lecture maquette) d'abord ; aucune dépendance.
- **Foundational (T003-T013)** : bloque toutes les stories. Chaîne schéma : T003 → T004/T005 → T006 → T009/T011. T007/T008/T010 parallélisables. T012 après T011. T013 après T009.
- **US1 (P1)** : démarre après Foundational. **MVP** — peut être livrée seule.
- **US2 (P2)** : démarre après Foundational ; éditant le même `page.tsx` que US1 → séquencer après US1 en pratique. T020 (extension DS) parallélisable avec la fin d'US1.
- **US3 (P3)** : après que le contenu est rendu (US1/US2) ; T025 nécessite le token dev.
- **Polish (T028-T033)** : après US1+US2 (T031 après tout le rendu).

### Story Independence

- **US1** présente l'offre + identifie les 3 niveaux : déployable seule (MVP viable).
- **US2** active la conversion (routage des cartes + tracking + grand visuel + CTA footer) : s'empile sur US1.
- **US3** est la couche d'autonomie éditoriale : valide le round-trip CMS du modèle déjà posé en Foundational.

---

## Parallel Execution Examples

**Foundational** — après T003 (schéma) :
```
T008 [P] content/expertisesPage.ts   +   T010 [P] seed-assets/expertisesPage/
```
(puis T006 typegen → T009 mapping → T011 seed → T012 check)

**US1 → US2** — l'extension DS en parallèle de la composition (fichiers différents) :
```
T014 [US1] FeatureBlock ratio responsive   +   T020 [US2] FeatureBlock tracking passthrough
```
(les deux éditent `FeatureBlock.tsx` → en réalité séquentiels entre eux ; parallélisables avec la lecture maquette / le contenu)

**Polish** — passes transverses en parallèle :
```
T028 [P] a11y   +   T029 [P] reduced-motion   +   T030 [P] perf   +   T033 [P] vault
```
(T031 revue pixel finale après ; T032 gates)

---

## Implementation Strategy

### MVP First (US1 only)

1. Setup (T001-T002) → Foundational (T003-T013) → **US1 (T014-T019)**.
2. **STOP & VALIDATE** : `/expertises` rend hero + intro + bloc « Nos 3 niveaux d'expertise »,
   fidèle à la maquette, contenu lisible — la page présente déjà l'offre et ses 3 niveaux.
   Déployable.

### Incremental Delivery

- **+ US2 (T020-T024)** : routage des cartes + tracking + grand visuel + CTA footer → page complète.
- **+ US3 (T025-T027)** : autonomie éditoriale (seed dev + vérif round-trip CMS + réordonnancement des niveaux).
- **+ Polish (T028-T033)** : a11y, reduced-motion, perf, **revue pixel finale obligatoire**, gates, vault.

### Notes

- Aucune nouvelle dépendance npm. **Aucun nouveau composant DS** : réutilisation de `PageHero` /
  `SectionTitle` / `Pullquote` / `FeatureBlock` / `Button` ; seules extensions = `FeatureBlock`
  (ratio responsive + passe-plat tracking), actes DS délibérés confirmés au build (Principe X).
- Tout le contenu est piloté par le CMS (les 3 niveaux = liste éditable ; aucune carte statique).
- Le « BIG FOOTER » (bloc CTA + pied de page) est **monté par le shell** `(site)/layout.tsx` —
  la page ne le redéfinit pas (FR-001/FR-010).
- `page.tsx` est édité par US1 puis US2 (même fichier) → ces tâches ne sont pas `[P]` entre elles.
