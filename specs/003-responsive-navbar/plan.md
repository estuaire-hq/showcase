# Implementation Plan: Navbar responsive

**Branch**: `003-responsive-navbar` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-responsive-navbar/spec.md`

## Summary

Construire l'en-tête global du site Estuaire : une barre de navigation **site-wide**,
**responsive** sur les trois frames Figma (mobile 390, tablette 768, desktop 1920), au
comportement **sticky « masquer en descente / révéler en remontée »** et au **contraste
adaptatif** quand elle est transparente sur un visuel d'en-tête. Pas de nouveau modèle Sanity :
les libellés et les routes sont **statiques** dans le code (FR-015), avec un chemin de migration
vers Sanity inchangé.

**Approche technique** — séparation présentation / comportement (Principes VIII + I) :

- Les **briques visuelles** vivent dans `@/design-system` (présentationnel, props only). Les pills
  `NavButton` (liens) et `ContactButton` (CTA) existent déjà et correspondent au KIT ; on ajoute la
  **barre** (`SiteHeader`), le **panneau plein écran** (`NavPanel`) et le **bouton menu/croix**
  (`MenuToggle`), sans router ni Sanity.
- Le **comportement** vit dans un wrapper client `src/components/Navbar.tsx` : état d'ouverture du
  panneau, visibilité/style au scroll (hide-down / reveal-up / transparent-top), `aria-current`
  dérivé de `usePathname()`, verrou de défilement Lenis, contraste adaptatif, respect de
  `prefers-reduced-motion`. Il lit la config statique `src/content/navigation.ts` et rend les
  composants DS.
- Le **layout** `(site)/layout.tsx` rend `<Navbar />` dans le shell `SmoothScroll` existant (le
  commentaire du layout réserve déjà la place : « The header + floating scroll-to-top will join
  this shell later »).
- Motion via la stack déjà câblée (`@/lib/motion/gsap`, GSAP ScrollTrigger synchronisé à Lenis) et
  la skill `estuaire-motion` ; pixel-perfect via la skill `estuaire-figma` (6 frames déjà en cache
  dans `.design/figma-data/nodes.json`).

## Technical Context

**Language/Version**: TypeScript 5.8 (strict), React 19.2, Next.js 16.2 (App Router, RSC)
**Primary Dependencies**: Tailwind CSS v4 (`@theme` tokens), `tailwind-variants` (`tv`), GSAP 3.15 +
`@gsap/react` + `gsap/ScrollTrigger` (registrés dans `@/lib/motion/gsap`), Lenis 1.3 (`SmoothScroll`),
`next/link`, `next/navigation` (`usePathname`). **Aucune nouvelle dépendance prévue.**
**Storage**: N/A pour cette version — contenu de la navbar **statique** dans `src/content/navigation.ts`
(FR-015). Pas de schéma Sanity, pas de seed (migration future possible, cf. Footer).
**Testing**: Vérification visuelle (screenshot-diff contre render Figma, par breakpoint — SC-002) ;
`npm run lint` (Biome) ; `npm run build` ; vérification manuelle clavier / lecteur d'écran /
`prefers-reduced-motion` (SC-005, SC-006). Pas de framework de test unitaire dans le projet.
**Target Platform**: Web (navigateurs evergreen desktop + mobile), rendu serveur Next.js standalone.
**Project Type**: Application web (Next.js App Router, monoprojet) — frontend uniquement.
**Performance Goals**: 60 fps sur les transitions (hide/reveal, ouverture panneau) ; JS client
minimal (seul le sous-arbre navbar est `"use client"`) ; pas de layout shift à l'apparition de la
barre sticky ; scroll handler scrubbé (transform/opacity only).
**Constraints**: `prefers-reduced-motion` → changements instantanés (pas de glissement) ; pas de
scintillement autour du sommet ni sur micro-scroll (seuil de tolérance) ; pas de verrou de
défilement résiduel au resize panneau ouvert ; pixel-perfect intrinsèque sur les 3 frames Figma.
**Scale/Scope**: 1 en-tête global, 4 entrées + 1 CTA *contact*, 3 breakpoints, 4 états visuels
(transparent/repos, sticky/plein, panneau ouvert, page active). ~3 composants DS + 1 wrapper client
+ 1–2 hooks + 1 fichier de config.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Verdict | Note |
|---|---|---|
| **I. Server-First Rendering** | ✅ avec justification | La navbar est intrinsèquement interactive (scroll, toggle, focus, pathname) → `"use client"` justifié (Principe I autorise l'interactivité/animation). Le client JS reste **circonscrit au sous-arbre navbar** ; pages et layout restent RSC. Aucun bundle superflu. |
| **II. CMS as Single Content Source** | ⚠️ déviation documentée | FR-015 fixe le contenu de la navbar **statique en code** pour cette version. Voir *Complexity Tracking* : déviation consciente, sanctionnée par la spec, avec chemin de migration vers Sanity (singleton `navigation` + wrapper connecté façon `Footer`) sans changement de comportement. Logo SVG + icônes = assets UI (autorisés dans le dépôt par II). |
| **III. Feature-Based Architecture** | ✅ | Briques visuelles dans `src/design-system/` (rôle « langage visuel »), wrapper connecté dans `src/components/` (rôle « composant connecté ») — modules top-level à rôle défini explicitement autorisés par III (clarifié) + VIII. Pas de `components/` fourre-tout. |
| **IV. Simplicity Over Abstraction** | ✅ | Pas de state manager global (useState local + 1 hook) ; **zéro nouvelle dépendance** (focus-trap, scroll-lock et sticky **hand-rolled**, petits et possédés ; réutilisation de GSAP/Lenis déjà installés). Cf. research.md pour le rejet motivé des libs. |
| **V. Bilingual Convention** | ✅ | Docs (spec/plan/research) en français ; code, identifiants, commits, commentaires en anglais. Les libellés FR sont du *contenu affiché* (config), pas des identifiants. |
| **VI. Intentional Event Tracking** | ✅ décision prise | Tracking statué (cf. research.md §8) : **clic CTA *contact*** → événement custom Umami (CTA principal) ; clics liens nav → couverts par le pageview (pas d'événement custom) ; ouverture du panneau → non tracée (faible signal) — choix documenté, pas un oubli. |
| **VII. Pixel-Perfect Fidelity** | ⚠️ déviation documentée | Skill `estuaire-figma` chargée au build ; 6 frames navbar lues losslessly (`nodes.json`) + état-actif et logo fournis par le porteur (CSS/SVG, API Figma bloquée). **Déviation approuvée** : hauteur d'en-tête et taille de logo réduites vs maquette (112/80 et 60/44) — cf. *Complexity Tracking*. Le reste est conforme. Diff visuel **non vérifié** (API bloquée) → « pixel-perfect non vérifié » assumé (clause VII respectée). |
| **VIII. Data/Presentation Boundary** | ✅ | DS présentationnel (props only, **aucun** accès Sanity/router) ; le wrapper `src/components/Navbar.tsx` détient comportement + config. Pas de fetch Sanity ici (contenu statique) ; une migration future ajouterait `lib/sanity/navigation.ts` + un wrapper connecté, exactement comme `Footer`. |
| **IX. Modèle Sanity : types & seeds** | ✅ N/A | Aucun contenu Sanity dans cette version → pas de schéma, pas de type généré, pas de seed à produire. Si migration ultérieure : suivre IX (schéma → TypeGen → seed typé). |

**Résultat du gate** : PASS. Deux déviations conscientes — **II** (contenu statique, sanctionnée par
FR-015) et **VII** (hauteur d'en-tête + logo réduits vs maquette, approuvée par le porteur en cours
d'implémentation) — toutes deux tracées en *Complexity Tracking* avec leur alternative. Aucun blocage.

## Project Structure

### Documentation (this feature)

```text
specs/003-responsive-navbar/
├── plan.md              # Ce fichier (/speckit.plan)
├── research.md          # Phase 0 — décisions techniques (mécanisme contraste, sticky, scroll-lock…)
├── data-model.md        # Phase 1 — config NavItem, machine d'états UI, contrat de tonalité
├── quickstart.md        # Phase 1 — build / run / vérification pixel-perfect & a11y
├── contracts/           # Phase 1 — contrats de props DS + config nav + déclaration de tonalité
│   ├── navigation-config.md
│   ├── design-system-components.md
│   └── section-tone.md
└── tasks.md             # Phase 2 (/speckit.tasks — PAS créé ici)
```

### Source Code (repository root)

```text
src/
├── content/
│   └── navigation.ts                 # NOUVEAU — source unique statique : entrées + CTA contact + routes
│                                     #   (forme future-Sanity-compatible ; cf. src/content/footer.ts)
├── design-system/
│   ├── components/
│   │   ├── NavButton.tsx             # EXISTANT — pill liens (tone onLight/onDark, active) — réutilisé
│   │   ├── ContactButton.tsx         # EXISTANT — pill CTA (tone bleu/noir, active) — réutilisé
│   │   ├── SiteHeader.tsx            # NOUVEAU — la barre (présentationnel) : logo + liens + CTA + toggle
│   │   ├── NavPanel.tsx              # NOUVEAU — panneau plein écran (présentationnel) : logo + entrées + croix
│   │   └── MenuToggle.tsx            # NOUVEAU — bouton hamburger / croix (présentationnel, a11y labels)
│   ├── index.ts                      # MODIFIÉ — exporter SiteHeader / NavPanel / MenuToggle
│   └── tokens.ts                     # EXISTANT — breakpoints (mobile/tablet/desktop) déjà définis
├── components/
│   └── Navbar.tsx                    # NOUVEAU — wrapper CLIENT : état + scroll + pathname + scroll-lock + tone
├── lib/
│   ├── motion/
│   │   ├── gsap.ts                   # EXISTANT — GSAP + ScrollTrigger (réutilisé pour hide/reveal)
│   │   ├── SmoothScroll.tsx          # EXISTANT — Lenis ; expose l'instance pour le scroll-lock (cf. research)
│   │   └── useStickyNav.ts           # NOUVEAU — hook : direction de scroll, seuil, état top/visible/style
│   └── a11y/
│       ├── useFocusTrap.ts           # NOUVEAU — piège de focus du panneau (hand-rolled, petit)
│       └── useScrollLock.ts          # NOUVEAU — verrou de défilement (Lenis stop/start + fallback)
└── app/
    └── (site)/
        └── layout.tsx                # MODIFIÉ — rend <Navbar /> dans le shell SmoothScroll

public/                               # logo de marque (SVG vectoriel) — pull/export Figma au build, sinon placeholder flaggé

src/app/(lab)/lab/navbar/page.tsx     # OPTIONNEL (recommandé) — page d'isolation pour valider les 4 états × 3 breakpoints
```

**Structure Decision** : application web Next.js monoprojet (pas de backend séparé). On suit la
frontière **présentation / comportement** déjà établie par le `Footer` : composants présentationnels
dans `src/design-system/`, wrapper avec logique dans `src/components/`. La spécificité ici (vs Footer)
est que le wrapper est **client** (interactivité) et que la « donnée » est une **config statique**
(`src/content/navigation.ts`) plutôt qu'un fetch Sanity — cohérent avec FR-015 et avec le pattern
`src/content/footer.ts` (copie de maquette en un seul endroit). Les hooks de comportement
(`useStickyNav`, `useFocusTrap`, `useScrollLock`) vivent sous `src/lib/` (code partagé, Principe III).

## Complexity Tracking

> Renseigné uniquement pour les déviations au Constitution Check.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Contenu navbar statique en code** (déviation Principe II — « pas de contenu codé en dur ») | FR-015 le **prescrit** explicitement pour cette version : les libellés sont liés à la **structure de routes** de l'app (chrome de navigation), pas à de l'éditorial volatil ; les pages cibles n'existent pas encore (FR-014). Mettre la navigation en Sanity maintenant ajouterait un schéma + un seed + un wrapper connecté pour un contenu qui ne change pas tant que la structure du site n'évolue pas. | Tout passer en Sanity dès maintenant = abstraction prématurée (contre Principe IV) pour un gain nul à ce stade, et hors du périmètre de la spec. La **forme** de `src/content/navigation.ts` est conçue pour être consommée à l'identique par un futur `lib/sanity/navigation.ts` (mapping → mêmes props DS), donc la **migration vers Sanity est non-cassante** : même comportement, on ne fait que changer la source des props (exactement le pattern `Footer` / `getFooterProps`). Déviation **bornée et réversible**, sanctionnée par la spec. |
| **Hauteur d'en-tête + taille de logo réduites vs maquette** (déviation Principe VII — dimensions intrinsèques pixel-perfect) | Demande **explicite du porteur** en cours d'implémentation : à 160/120 px la barre « était trop large en hauteur / juste moche ». Ramenée à **112 px desktop / 80 px sous `lg`** (barre) et **60 / 44 px** (logo). Tout le reste (padding-x 140/40/20, gaps 15, typo, couleurs, positions, ombre) reste **conforme** à Figma. | Conserver les valeurs Figma exactes = **rejeté par le porteur** (rendu jugé disgracieux). Déviation **bornée** (hauteur de barre + taille de logo uniquement), **owner-approuvée**, documentée en commentaire dans `SiteHeader.tsx` / `BrandLogo.tsx` et réconciliée dans `spec.md` (FR-013 + Hypothèses). Le diff pixel-perfect reste **non vérifié** (API Figma bloquée) — clause d'échappement VII respectée. |
