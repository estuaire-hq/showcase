---
description: "Task list — Navbar responsive"
---

# Tasks: Navbar responsive

**Input**: Design documents from `/specs/003-responsive-navbar/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: AUCUNE tâche de test générée — le projet n'a pas de framework de test unitaire et la
spec ne demande pas de TDD. La vérification se fait par **screenshot-diff contre les renders Figma**
(par breakpoint) + contrôles manuels clavier / lecteur d'écran / `prefers-reduced-motion`
(cf. `quickstart.md`, critères SC-002/SC-005/SC-006).

**Organization**: tâches groupées par user story pour une implémentation et une validation
indépendantes. Convention de breakpoints (tokens.ts) : base → mobile (390) · `md:` → tablette (768)
· `lg:` → desktop (≥1024 ; frame 1920). Skills à charger : **`estuaire-figma`** (avant tout build) et
**`estuaire-motion`** (avant toute animation).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallélisable (fichiers différents, pas de dépendance bloquante)
- **[Story]**: US1 / US2 / US3 (mappé sur les user stories de spec.md)
- Chaque tâche cite un chemin de fichier précis

---

## Phase 1: Setup (préparation de la feature)

**Purpose**: rassembler la source de vérité Figma (build spec) et les assets, avant tout code.

- [ ] T001 [P] Lire **losslessly** les 6 frames navbar déjà en cache : `node .design/scripts/figma-node.mjs 51:2221 51:2585 77:3149 77:3150 77:3630 87:5893` ; passer le *completeness gate* (énumérer tous les nodes ; relever hauteurs d'en-tête, paddings, gaps, tailles de logo par frame, opacité du fond du panneau ≈90 %, position de la croix) et consigner ces valeurs intrinsèques comme build spec dans `specs/003-responsive-navbar/research.md` (section « inconnues résolues au build »).
- [ ] T002 [P] Pull + lire le node **état actif** absent du cache : `node --env-file=.env.development .design/scripts/figma-pull.mjs 51:2699` puis `node .design/scripts/figma-node.mjs 51:2699` ; consigner le traitement visuel exact de l'entrée active.
- [ ] T003 Préparer l'asset **logo** dans `public/brand/` : exporter le node logo via `.design/scripts/figma-render.mjs` / `.design/scripts/figma-fills.mjs` ; si l'export est indisponible, poser un **placeholder clairement flaggé** (et ne pas revendiquer pixel-perfect pour le logo).
- [ ] T004 [P] (Optionnel, recommandé) Scaffolder la page d'isolation `src/app/(lab)/lab/navbar/page.tsx` (noindex, déjà couvert par le layout lab) destinée au diff visuel des 4 états × 3 breakpoints — à remplir au fur et à mesure que les composants arrivent.

---

## Phase 2: Foundational (prérequis bloquants)

**Purpose**: la coquille partagée par toutes les stories : config statique, hooks partagés, barre DS
de base, wrapper client monté dans le layout.

**⚠️ CRITICAL**: aucune user story ne peut démarrer tant que cette phase n'est pas terminée.

- [ ] T005 [P] Créer la config statique `src/content/navigation.ts` conforme à `contracts/navigation-config.md` (`NavConfig` : 4 `items` dans l'ordre desktop, `cta` contact, `brandHref:"/"` ; slugs figés `/nous-decouvrir`, `/expertises`, `/univers`, `/realisations`, `/contact`). Module pur, aucun import Sanity.
- [ ] T006 [P] Créer le hook partagé `src/lib/motion/usePrefersReducedMotion.ts` (matchMedia `(prefers-reduced-motion: reduce)`, abonnement/désabonnement) — consommé par US2 (panneau) et US3 (sticky).
- [ ] T007 [P] Créer la coquille présentationnelle `src/design-system/components/SiteHeader.tsx` (slot `logo` + `brandHref`, structure responsive avec régions vides « liste desktop » et « toggle », props `state`/`logoTone`/`linksTone`/`reducedMotion` plombées mais inertes) conforme à `contracts/design-system-components.md` ; l'exporter dans `src/design-system/index.ts` (+ type `NavTone`).
- [ ] T008 Créer le wrapper client `src/components/Navbar.tsx` (`"use client"`) : importe `navigation`, rend `<SiteHeader>` avec des props statiques (`state="top"`, tonalités par défaut `onLight`). Aucun comportement encore.
- [ ] T009 Monter `<Navbar />` dans `src/app/(site)/layout.tsx`, à l'intérieur du shell `SmoothScroll` (au-dessus de `FooterReveal`).

**Checkpoint**: la barre (coquille + logo) s'affiche site-wide ; le DS reste présentationnel.

---

## Phase 3: User Story 1 - Naviguer vers les grandes parties du site (Priority: P1) 🎯 MVP

**Goal**: une navigation desktop opérationnelle — logo + 4 liens + CTA *contact*, état « page active ».

**Independent Test**: sur écran large, vérifier la présence du logo, des 4 liens et du CTA contact ;
chaque élément mène à sa destination ; le logo ramène à `/` ; sur une page d'une entrée, l'entrée
est mise en évidence (acceptances 1-4 de la story).

- [ ] T010 [US1] Rendre la **liste horizontale desktop** dans `src/design-system/components/SiteHeader.tsx` (région « liste desktop », visible `lg:`) : `items` → `NavButton`, `cta` → `ContactButton`, logo → lien `brandHref` (FR-004).
- [ ] T011 [US1] Dans `src/components/Navbar.tsx`, dériver l'état actif via `usePathname()` (`next/navigation`) : `activeHref` = **le `href` de l'entrée** telle que `pathname === item.href || pathname.startsWith(item.href + "/")` (**jamais le `pathname` brut**), logo actif seulement sur `/` ; passer ce `activeHref` à `<SiteHeader>` (FR-016).
- [ ] T012 [P] [US1] Appliquer le **traitement visuel de l'état actif** lu en T002 (node `51:2699`) à la variante `active` des pills `src/design-system/components/NavButton.tsx` et `src/design-system/components/ContactButton.tsx` (ajuster si le node diffère du `ring` actuel).
- [ ] T013 [US1] Ajouter le **tracking Umami du CTA contact** dans `src/components/Navbar.tsx` : sur clic contact, `window.umami?.track("nav_contact_click")` (guardé, no-op si absent) ; introduire si besoin un helper `trackEvent(name)` dans `src/lib/utils.ts` (research §8).
- [ ] T014 [US1] **Pixel-perfect desktop (1920)** : reproduire positions/tailles/espacements de la barre (valeurs T001, node `51:2221`) avec utilitaires Tailwind + tokens `@theme` uniquement (jamais de couleur/police/radius en dur).

**Checkpoint**: US1 livrable en MVP — navigation desktop fonctionnelle et conforme à Figma.

---

## Phase 4: User Story 2 - Naviguer depuis un mobile ou une tablette (Priority: P1)

**Goal**: sous `lg`, icône menu + panneau plein écran (logo + entrées + croix), verrou de défilement,
focus piégé, fermeture par croix/Échap/sélection.

**Independent Test**: sous le seuil desktop, la liste horizontale disparaît au profit de l'icône
menu ; l'activer ouvre le panneau plein écran avec toutes les entrées ; l'arrière-plan ne défile
plus ; sélectionner une entrée navigue + ferme ; croix/Échap ferment et restaurent le défilement.

- [ ] T015 [P] [US2] Créer le composant DS `src/design-system/components/MenuToggle.tsx` (bouton hamburger/croix, `aria-expanded`, `aria-controls`, libellé accessible ouvert/fermé, prop `tone`) ; l'exporter dans `src/design-system/index.ts` (contrat `contracts/design-system-components.md`).
- [ ] T016 [P] [US2] Créer le composant DS `src/design-system/components/NavPanel.tsx` (`role="dialog"` `aria-modal` + label, fond sombre semi-opaque ≈90 % — valeur T001, logo + entrées empilées + `cta` + croix, prop `onSelect`, `reducedMotion`) ; l'exporter dans `src/design-system/index.ts` (nodes `77:3630` / `87:5893`).
- [ ] T017 [P] [US2] Exposer l'instance Lenis depuis `src/lib/motion/SmoothScroll.tsx` via un `LenisContext` léger (nouveau `src/lib/motion/LenisContext.tsx` ; fournir l'instance, no-op si reduced-motion / scroll natif).
- [ ] T018 [US2] Créer `src/lib/a11y/useScrollLock.ts` : à l'ouverture `lenis.stop()` (via `LenisContext`) + `overflow:hidden` en filet ; à la fermeture `lenis.start()` + restauration (research §3). (dépend de T017)
- [ ] T019 [P] [US2] Créer `src/lib/a11y/useFocusTrap.ts` : focus initial dans le panneau, boucle Tab/Shift-Tab, Échap, restauration du focus sur le déclencheur, `inert`/`aria-hidden` sur l'arrière-plan (research §4).
- [ ] T020 [US2] Câbler le menu mobile dans `src/components/Navbar.tsx` : état `isOpen`, rendre `<NavPanel>` + déclencher `<MenuToggle>`, brancher `useScrollLock(isOpen)` + `useFocusTrap(...)`, `onSelect` = naviguer puis fermer (FR-010), fermer + libérer le verrou au franchissement de `lg` (resize), réutiliser le tracking contact. (dépend de T015, T016, T018, T019)
- [ ] T021 [US2] Dans `src/design-system/components/SiteHeader.tsx`, rendre le `<MenuToggle>` dans la région « toggle » sous `lg` et masquer la liste horizontale sous `lg` (FR-007). (dépend de T015)
- [ ] T022 [US2] **Pixel-perfect** barre 390/768 (nodes `77:3150` / `77:3149`) + **panneau ouvert** (nodes `87:5893` / `77:3630`) avec Tailwind + tokens ; `reducedMotion` → ouverture/fermeture instantanées. (dépend de T020, T021)

**Checkpoint**: US1 ET US2 fonctionnent indépendamment (desktop + mobile/tablette).

---

## Phase 5: User Story 3 - Retrouver la navigation en remontant (sticky) (Priority: P2)

**Goal**: transparent au sommet (contraste adaptatif), masquée en descente, plein/opaque en
remontée, retour transparent au sommet ; respect de `prefers-reduced-motion`.

**Independent Test**: charger une page, constater la barre transparente sur l'en-tête ; défiler vers
le bas → barre masquée ; amorcer la remontée → barre en style plein ; revenir au sommet → retour
transparent ; pas de vacillement sur micro-scroll ; reduced-motion → changements instantanés.

- [ ] T023 [P] [US3] Créer `src/lib/motion/useStickyNav.ts` : direction de scroll via `ScrollTrigger` (`onUpdate` → `self.direction`/`self.scroll()`) avec `TOP_THRESHOLD≈8px` et `DIRECTION_DELTA≈6–10px` → état `"top"|"hidden"|"pinned"` (data-model §2/§5) ; **repli** listener `scroll` natif passif sous reduced-motion (research §2).
- [ ] T024 [US3] Dans `src/design-system/components/SiteHeader.tsx`, appliquer le style piloté par `state` : `top` = fond transparent, pas d'ombre, contenu en tonalités par slot ; `pinned` = fond clair opaque + ombre + `fixed`, contenu `onLight` ; `hidden` = `-translate-y-full` ; transitions `transform`/`opacity` (`power2.out`, ~0.3–0.4s) **désactivées** si `reducedMotion` (node sticky `51:2585`).
- [ ] T025 [US3] Câbler `useStickyNav` + la **résolution de tonalité** dans `src/components/Navbar.tsx` : au `top`, lire `data-nav-logo-tone`/`data-nav-links-tone` de l'en-tête courant (contrat `contracts/section-tone.md`), défaut `onLight` ; `pinned`/`hidden` → liens/toggle `onLight` fixe (le CTA reste `ContactButton tone="bleu"`, variante DS, en toute situation) ; passer `state`/`logoTone`/`linksTone`/`reducedMotion` à `<SiteHeader>`. (dépend de T023, T024)
- [ ] T026 [P] [US3] Déclarer les tonalités d'en-tête sur la home `src/app/(site)/page.tsx` : `data-nav-logo-tone="onDark"` / `data-nav-links-tone="onLight"` (valeurs confirmées au node `51:2221`).
- [ ] T027 [US3] **Pixel-perfect** états sticky/plein (node `51:2585`) + transparent/repos sur les 3 breakpoints ; vérifier l'absence de scintillement (seuils) et le mode reduced-motion (instantané). (dépend de T024, T025)

**Checkpoint**: les trois user stories sont indépendamment fonctionnelles.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: qualité, vérification transverse, conformité.

- [ ] T028 [P] `npm run lint` (Biome) et corriger les écarts.
- [ ] T029 [P] `npm run build` et résoudre les erreurs de build/typage.
- [ ] T030 **Screenshot-diff** par breakpoint (390/768/1920) contre les renders Figma (`node --env-file=.env.development .design/scripts/figma-render.mjs <nodeId>`) pour les 4 états — transparent/repos, sticky/plein, page active, panneau ouvert (SC-002) ; si `/images` renvoie 429, marquer explicitement « pixel-perfect **non vérifié** ».
- [ ] T031 Audit **accessibilité** (SC-006) : traversée clavier complète (barre + panneau), focus piégé + Échap, `aria-current="page"` actif, `aria-expanded` du toggle, libellés menu/croix ; lecteur d'écran.
- [ ] T032 **Cas limites** : resize panneau ouvert → fermeture + libération du verrou (pas de panneau fantôme) ; `prefers-reduced-motion` → aucune animation, navbar fonctionnelle (SC-005) ; pas de vacillement micro-scroll ni de scintillement au sommet.
- [ ] T033 [P] Consigner un **ADR** dans `docs/vault/decisions/` : contenu de navbar statique en code (déviation Principe II, FR-015) + chemin de migration Sanity non cassant (cf. plan §Complexity Tracking).
- [ ] T034 [P] Décider du sort de la page lab `src/app/(lab)/lab/navbar/page.tsx` (garder pour le DS, ou supprimer) et s'assurer qu'aucun asset servi superflu ne reste.
- [ ] T035 Exécuter la validation `quickstart.md` de bout en bout (les 3 scénarios + cas limites).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: aucune dépendance — peut démarrer immédiatement.
- **Foundational (Phase 2)**: dépend de Setup (lecture Figma + logo) — **BLOQUE** toutes les stories.
- **User Stories (Phases 3-5)**: toutes dépendent de Foundational.
  - US1 (P1) et US2 (P1) sont indépendantes l'une de l'autre.
  - US3 (P2) est indépendante de US1/US2 (enrichit la même barre, sans dépendre d'elles).
- **Polish (Phase 6)**: dépend des stories désirées terminées.

### User Story Dependencies

- **US1 (P1)** : après Foundational. Aucune dépendance vers une autre story.
- **US2 (P1)** : après Foundational. Indépendamment testable (mobile/tablette).
- **US3 (P2)** : après Foundational. Indépendamment testable (scroll).

### Fichiers partagés (éditions séquentielles, pas de [P] entre elles)

- `src/design-system/components/SiteHeader.tsx` : T007 (shell) → T010 (US1) → T021 (US2) → T024 (US3).
- `src/components/Navbar.tsx` : T008 (shell) → T011/T013 (US1) → T020 (US2) → T025 (US3).
- `src/design-system/index.ts` : exports en T007, T015, T016 (additifs).

### Within Each User Story

- US1 : T010/T012 (vues) → T011/T013 (comportement) → T014 (pixel-perfect).
- US2 : T015/T016/T017/T019 (briques) → T018 → T020/T021 (câblage) → T022 (pixel-perfect).
- US3 : T023 (hook) + T024 (style) → T025 (câblage) + T026 (déclaration) → T027 (pixel-perfect).

---

## Parallel Opportunities

- **Setup** : T001, T002, T004 en parallèle (T003 logo indépendant aussi, mais peut suivre T002).
- **Foundational** : T005, T006, T007 en parallèle (fichiers distincts) ; puis T008 → T009.
- **US1** : T012 (pills) en parallèle de T010/T011 (fichiers distincts).
- **US2** : T015, T016, T017, T019 en parallèle ; T018 après T017 ; puis T020/T021.
- **US3** : T023 et T026 en parallèle de la mise en style.
- **Polish** : T028, T029, T033, T034 en parallèle.

### Parallel Example: Foundational

```bash
# Lancer ensemble (fichiers distincts) :
Task: "Créer src/content/navigation.ts"                         # T005
Task: "Créer src/lib/motion/usePrefersReducedMotion.ts"         # T006
Task: "Créer src/design-system/components/SiteHeader.tsx"       # T007
```

### Parallel Example: User Story 2

```bash
# Briques DS + hooks indépendants en parallèle :
Task: "Créer MenuToggle (src/design-system/components/MenuToggle.tsx)"   # T015
Task: "Créer NavPanel (src/design-system/components/NavPanel.tsx)"       # T016
Task: "Exposer LenisContext (src/lib/motion/LenisContext.tsx)"          # T017
Task: "Créer useFocusTrap (src/lib/a11y/useFocusTrap.ts)"               # T019
```

---

## Implementation Strategy

### MVP First (US1 uniquement)

1. Phase 1 Setup → 2. Phase 2 Foundational (CRITIQUE, bloque tout) → 3. Phase 3 US1 →
4. **STOP & VALIDATE** : tester la navigation desktop seule → 5. démo/déploiement possible.

### Incremental Delivery

1. Setup + Foundational → coquille prête.
2. + US1 (desktop) → test indépendant → MVP.
3. + US2 (mobile/tablette) → test indépendant.
4. + US3 (sticky + contraste adaptatif) → test indépendant.
5. Polish (lint/build/diff/a11y/ADR).

Chaque story ajoute de la valeur sans casser les précédentes.

### Parallel Team Strategy

Après Foundational : un dev sur US1 (desktop), un dev sur US2 (panneau), un dev sur US3 (sticky).
Coordonner les éditions des fichiers partagés (`SiteHeader.tsx`, `Navbar.tsx`, `index.ts`).

---

## Notes

- [P] = fichiers différents, pas de dépendance bloquante.
- Pas de tâches de test (pas de framework ; vérification = screenshot-diff Figma + contrôles manuels).
- **Skills obligatoires** : `estuaire-figma` avant chaque build pixel-perfect ; `estuaire-motion`
  avant les animations. Lire les nodes losslessly, ne rien deviner (Principe VII).
- **Zéro nouvelle dépendance** visée (focus-trap/scroll-lock/sticky hand-rolled) ; repli documenté
  `focus-trap-react` si l'audit a11y l'exige (acter dans le PR).
- Question ouverte : valider les **slugs de routes** avec Pierre (figés par défaut en T005).
- Commit après chaque tâche ou groupe logique cohérent.
