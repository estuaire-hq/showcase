# Plan d'implémentation : Page d'accueil

**Branche** : `005-homepage` | **Date** : 2026-06-13 | **Spec** : [spec.md](./spec.md)
**Entrée** : Spécification de fonctionnalité `specs/005-homepage/spec.md`

## Summary

Assembler la vraie page d'accueil `/` à partir des composants présentationnels du
design system, brancher son contenu éditable sur le singleton Sanity `homePage`,
appliquer les cinématiques de scroll (skill `estuaire-motion`) et la rendre fidèle à
la maquette Figma sur les trois formats (skill `estuaire-pixel-perfect`).

Le socle est posé : design system consommable, shell `(site)` (Lenis + GSAP, navbar
sticky à tonalité adaptative, footer global révélé au scroll), revalidation ISR
globale. La home est un **contenu spécifique à une page** : conformément au Principe
VIII, la page elle-même est le connecteur (elle fetche via `@/lib/sanity/homePage.ts`
et passe les props aux composants DS) — pas un composant connecté global comme le
footer. Le singleton `homePage` ne contient aujourd'hui qu'un **test jetable**
(`title` + `tagline`) ; cette feature le **réécrit entièrement** en un modèle complet
(hero multi-slides, intro, blocs expertises / univers / vision, métadonnées SEO). Les
champs de test sont **supprimés**, pas conservés ni repris.

**Approche technique** : (1) étendre le schéma `homePage` + TypeGen + seed typé avec
les valeurs de maquette ; (2) ajouter au DS le seul primitif manquant — un hero qui
cross-fade **image + titre ensemble** (FR-002) ; (3) composer la page en RSC à partir
des composants DS, avec des wrappers de motion (`src/lib/motion/`) pour les reveals au
scroll ; (4) `generateMetadata` lisant les champs SEO du singleton ; (5) monter le
bouton flottant de retour en haut dans le shell (FR-015). Les cartes de réalisations
restent **statiques** (FR-005), hors CMS.

## Technical Context

**Language/Version** : TypeScript strict, React Server Components — Next.js 16 (App
Router, `standalone`). 
**Primary Dependencies** : `next` 16, `sanity` v5 + `next-sanity` 13 (Studio embarqué,
`defineLive`/`sanityFetch`, TypeGen), `gsap` 3.15 + `@gsap/react` + `lenis` (déjà
câblés via `src/lib/motion/`), Tailwind CSS v4 (`@theme`), `tailwind-variants` + `cn`. 
**Storage** : Sanity Cloud (projet dev / projet prod distincts) — contenu éditable du
singleton `homePage` ; assets de contenu hébergés chez Sanity. Cartes de réalisations
**statiques** : images committées sous `public/home/realisations/`, données sous
`src/content/` (exception documentée — voir Complexity Tracking). 
**Testing** : `npm run lint` (Biome), `npm run build`, `npm run seed:check` (dry-run
de validation seed), `npm run typegen` (cohérence schéma↔types). Vérification
pixel-perfect par **diff visuel** contre les renders Figma cachés (Principe VII). 
**Target Platform** : navigateurs modernes desktop/tablette/mobile ; rendu serveur +
ISR, hydratation client minimale (slideshow, motion, scroll-top). 
**Project Type** : application web (site vitrine) — un seul projet Next.js, App Router
feature-based. 
**Performance Goals** : SC-007 — premier écran lisible et contenu principal < 2,5 s sur
mobile représentatif, sans décalage de mise en page notable (placeholders LQIP). 
**Constraints** : pixel-perfect par breakpoint (frames Figma `51:2221` / `77:3149` /
`77:3150`, slider `51:2420`) ; `prefers-reduced-motion` honoré partout (FR-012) ;
accessibilité clavier + sémantique (FR-013) ; aucune couleur/taille codée en dur
(Principe X) ; JS client minimal (Principe I). 
**Scale/Scope** : une route (`/`) ; 5 sections + footer existant ; un singleton CMS
étendu ; un primitif DS ajouté ; ~6 cartes de réalisations statiques.

## Constitution Check

*GATE : doit passer avant la Phase 0. Re-vérifié après la Phase 1.* — **Verdict :
PASS** (2 déviations justifiées et documentées en Complexity Tracking).

| # | Principe | Conformité | Note |
|---|----------|------------|------|
| I | Server-First Rendering | ✅ | Page RSC + ISR (`revalidateTag("sanity")`). `"use client"` réservé au slideshow, aux reveals de scroll et au scroll-top. |
| II | CMS as Single Content Source | ⚠️ PASS | Tout le contenu éditorial → singleton `homePage`. **Exception** : cartes de réalisations statiques + leurs images (FR-005), temporaire, documentée (Complexity #1). |
| III | Feature-Based Architecture | ✅ | Page sous `(site)/`, mapping `@/lib/sanity/homePage.ts`, copie `@/content/homePage.ts`, primitif visuel dans `@/design-system`, motion dans `@/lib/motion`. |
| IV | Simplicity Over Abstraction | ✅ | Réutilise DS + `SmoothScroll` + `Slideshow` + helper `trackEvent`. Un seul primitif DS ajouté (besoin concret : FR-002). Pas de state global. |
| V | Bilingual Convention | ✅ | Specs FR ; code/commentaires/commits EN. |
| VI | Intentional Event Tracking | ✅ | Décision explicite (research §8) : CTA expertises & vision, liens secteurs, cartes réalisations → événements Umami via `trackEvent` (helper existant). Hero sans CTA → pas d'événement. |
| VII | Pixel-Perfect Fidelity | ✅ | Build depuis les nodes Figma **complets** (`read 51:2221` etc., hors-ligne) ; diff visuel contre renders cachés ; responsive par breakpoint. Skill `estuaire-pixel-perfect`. |
| VIII | Data/Presentation Boundary | ✅ | DS présentationnel (props only). Contenu **spécifique à la page** → fetché par la page (connecteur), mapping isolé dans `@/lib/sanity/homePage.ts`. Pas de wrapper `src/components/` (réservé au global/singleton type footer). |
| IX | Modèle Sanity : types & seeds | ✅ | Schéma = source ; `npm run typegen` régénère `sanity.types.ts` ; seed typé `homePage.seed.ts` validé `--check` ; `createIfNotExists` par défaut ; valeurs maquette à un seul endroit. |
| X | Design System : langage visuel | ✅ | Tokens `@theme` + composants `@/design-system` uniquement ; le primitif hero **ajouté au DS** (acte délibéré), jamais dupliqué ad hoc ; variantes via `tv`. |

## Project Structure

### Documentation (cette feature)

```text
specs/005-homepage/
├── spec.md                       # Spécification (entrée)
├── plan.md                       # Ce fichier (/speckit.plan)
├── research.md                   # Phase 0 — décisions
├── data-model.md                 # Phase 1 — modèle de contenu homePage + réalisations statiques
├── quickstart.md                 # Phase 1 — workflow de build & vérification
├── contracts/
│   ├── content-model.md          # Phase 1 — contrat schéma/éditeur + GROQ + revalidation
│   └── section-contracts.md      # Phase 1 — contrat props page→DS par section + nav-tone
└── tasks.md                      # Phase 2 — généré par /speckit.tasks (PAS ici)
```

### Source Code (repository root)

```text
src/
├── app/(site)/
│   ├── layout.tsx                # MODIF : monter le bouton scroll-top dans le shell (FR-015)
│   └── page.tsx                  # MODIF : connecteur RSC — getHomePageProps + composition + generateMetadata
├── sanity/
│   ├── schemas/documents/
│   │   └── homePage.ts           # RÉÉCRIT from scratch : modèle complet (test title/tagline supprimé)
│   └── seed/documents/
│       └── homePage.seed.ts      # NEW : seed typé, valeurs maquette (scaffold puis remplissage)
├── lib/
│   ├── sanity/
│   │   ├── queries.ts            # MODIF : HOME_PAGE_QUERY complète (projections + images + lqip)
│   │   └── homePage.ts           # NEW : getHomePageProps() — fetch + defaults + urlFor
│   └── motion/
│       ├── Reveal.tsx            # NEW : wrapper client de reveal au scroll (ScrollTrigger)
│       └── ScrollTopMount.tsx    # NEW : wrapper client montant ScrollTopButton (Lenis scrollTo 0)
├── content/
│   ├── homePage.ts               # NEW : copie maquette (source unique seed ↔ fallback front)
│   └── homeRealisations.ts       # NEW : données statiques des cartes (FR-005)
├── design-system/
│   ├── components/HeroSlideshow.tsx  # NEW : cross-fade image+titre synchronisé (FR-002)
│   └── index.ts                  # MODIF : exporter HeroSlideshow
└── sanity.types.ts               # RÉGÉNÉRÉ : npm run typegen

seed-assets/homePage/             # NEW : images de seed du contenu éditable (hors public/)
public/home/realisations/         # NEW : images statiques des cartes (exception II, temporaire)
```

**Structure Decision** : un seul projet Next.js App Router (Principe IV — pas de
monorepo). La home suit le pattern *connecteur de page* (Principe VIII) : la page RSC
fetche et compose ; le mapping Sanity→props est isolé dans `@/lib/sanity/homePage.ts`
(miroir de `footer.ts`) ; la copie de maquette vit une seule fois dans
`@/content/homePage.ts` (Principe IX). Le seul ajout au DS est le primitif `HeroSlideshow`
(Principe X — l'altitude correcte pour un visuel de marque réutilisable). Le motion de
scroll vit dans `@/lib/motion/` (comportement, hors DS présentationnel).

## Complexity Tracking

> Déviations par rapport aux principes, justifiées et bornées.

| Violation | Pourquoi nécessaire | Alternative plus simple rejetée car |
|-----------|---------------------|-------------------------------------|
| **Cartes de réalisations statiques + images hors CMS** (exception au Principe II) | FR-005 : aucun modèle de contenu « réalisation » n'existe ; il est conçu dans la feature « Réalisations » séparée. La home doit afficher des cartes maintenant. Données sous `src/content/homeRealisations.ts`, images sous `public/home/realisations/`. Cartes cliquables → `/realisations` (aucun lien mort). **Exception ratifiée par l'ADR 0011** (déviation bornée, time-boxée ; levée = feature « Réalisations »). | Modéliser les réalisations dans Sanity dès maintenant **dupliquerait** le futur modèle et imposerait un rework au moment de la feature « Réalisations » ; c'est de l'anticipation (anti-Principe IV). Migration prévue et documentée (FR-005, ADR 0011). |
| **Montage du `ScrollTopButton` dans le shell `(site)/layout.tsx`** (étend « shell déjà livré ») | FR-015 exige un retour-en-haut fonctionnel ; le composant DS existe mais n'est **pas monté** (le layout note « will join this shell later »). C'est du chrome **site-wide**. | Le monter uniquement dans `page.tsx` (home) serait à la mauvaise altitude (chrome global, pas spécifique à la home) et devrait être redéfini à la première autre page. |

> *Note* : l'ajout du primitif `HeroSlideshow` au design system n'est **pas** une
> déviation — c'est la voie constitutionnelle (Principe X : un visuel de marque
> réutilisable s'ajoute au DS, ne se duplique pas dans la page).
