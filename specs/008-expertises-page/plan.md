# Plan d'implémentation : Page « Expertises »

**Branche** : `008-expertises-page` | **Date** : 2026-06-17 | **Spec** : [spec.md](./spec.md)
**Entrée** : Spécification de fonctionnalité `specs/008-expertises-page/spec.md`

## Summary

Construire la page offre « Expertises » sur la route `/expertises` (déjà ciblée par la
navbar, le pied de page et le CTA « découvrir nos expertises » de « Nous découvrir »), à
partir des composants présentationnels du design system, brancher son contenu éditable sur
un **nouveau singleton Sanity `expertisesPage`**, appliquer les cinématiques de scroll
(skill `estuaire-motion`) et la rendre fidèle à la maquette Figma sur les trois formats
(skill `estuaire-pixel-perfect`).

Le socle est posé, et les pages home + « Nous découvrir » sont livrées : design system
consommable, shell `(site)` (Lenis + GSAP via `SmoothScroll`, navbar sticky à tonalité
adaptative, footer global révélé au scroll avec son **bloc CTA**, `ScrollTopButton` monté),
revalidation ISR globale (`revalidateTag("sanity", "max")`). « Expertises » est un **contenu
spécifique à une page** : conformément au Principe VIII, la page elle-même est le connecteur
(elle fetche via `@/lib/sanity/expertisesPage.ts` et passe les props aux composants DS) —
pas un composant connecté global comme le footer.

La page comporte 4 sections de contenu + le pied de page global (maquette `51:2893`
desktop / `87:5600` tablette / `87:6290` mobile) : (1) hero `012/ SLIDER` (visuel plein
cadre + encart titre) · (2) intro `02/ INTRO` (phrase phare + texte + visuels) · (3)
« Nos 3 niveaux d'expertise » `03/` (titre de section + 3 cartes de niveau pleine largeur,
chacune avec un « en savoir plus » vers sa sous-page) · (4) grand visuel `05/ BIG IMAGE`
(visuel plein largeur + phrase phare en incrustation) · puis le `BIG FOOTER` (bloc CTA +
pied de page global **déjà montés par le shell**, non re-spécifiés).

**Approche technique** : (1) créer le singleton `expertisesPage` (schéma + groupes Studio +
desk + TypeGen) — modèle ~2× plus simple que `aboutPage` ; (2) **réutiliser tels quels**
les primitifs DS existants — `PageHero` (hero de page de contenu, créé par la 007),
`SectionTitle`, `Pullquote`, **`FeatureBlock`** (image plein-bleed assombrie + titre + CTA
clair — littéralement la « carte de niveau » de la maquette, doc DS : « Notre vision du
métier d'agenceur ») et `Button` ; **aucun nouveau composant DS** sauf extensions
délibérées mineures de `FeatureBlock` confirmées au build (cf. research §3) ; (3) composer
la page en RSC (`(site)/expertises/page.tsx`) — hero, intro et grand visuel assemblés
en-ligne à partir des primitifs DS + images LQIP, la liste des 3 niveaux mappée sur
`FeatureBlock` ; (4) `generateMetadata` lisant les champs SEO du singleton ; (5) seed typé
`expertisesPage.seed.ts` + assets `seed-assets/expertisesPage/`, copie maquette unique dans
`src/content/expertisesPage.ts`.

## Technical Context

**Language/Version** : TypeScript strict, React Server Components — Next.js 16 (App
Router, `standalone`).
**Primary Dependencies** : `next` 16, `sanity` v5 + `next-sanity` (Studio embarqué,
`defineLive`/`sanityFetch`, TypeGen), `gsap` + `@gsap/react` + `lenis` (déjà câblés via
`src/lib/motion/`), Tailwind CSS v4 (`@theme`), `tailwind-variants` + `cn`. **Aucune
nouvelle dépendance.**
**Storage** : Sanity Cloud (projet dev / projet prod distincts) — contenu éditable du
**nouveau singleton `expertisesPage`** ; assets de contenu hébergés chez Sanity, sourcés au
seed depuis `seed-assets/expertisesPage/` (committé, hors `public/`).
**Testing** : `npm run lint` (Biome), `npm run build`, `npm run typegen` (cohérence
schéma↔types), `npm run seed:check` (dry-run de validation seed). Vérification
pixel-perfect par **diff visuel** contre les renders Figma cachés (Principe VII, skill
`estuaire-pixel-review`).
**Target Platform** : navigateurs modernes desktop/tablette/mobile ; rendu serveur + ISR,
hydratation client minimale (motion de scroll uniquement ; le hero est statique).
**Project Type** : application web (site vitrine) — un seul projet Next.js, App Router
feature-based.
**Performance Goals** : SC-007 — premier écran lisible et contenu principal < 2,5 s sur
mobile représentatif, sans décalage de mise en page notable (placeholders LQIP, images
`next/image`).
**Constraints** : pixel-perfect par breakpoint (frames Figma `51:2893` / `87:5600` /
`87:6290`) ; `prefers-reduced-motion` honoré partout (FR-012) ; accessibilité clavier +
sémantique, un H1 unique (FR-013/FR-014) ; aucune couleur/taille codée en dur (Principe
X) ; JS client minimal (Principe I).
**Scale/Scope** : une route (`/expertises`) ; 4 sections de contenu + footer existant ;
un nouveau singleton CMS ; **0 primitif DS ajouté** (réutilisation pure ; extensions de
`FeatureBlock` confirmées au build) ; une liste de 3 niveaux mappée sur `FeatureBlock`.

## Constitution Check

*GATE : doit passer avant la Phase 0. Re-vérifié après la Phase 1.* — **Verdict : PASS**
(aucune déviation ; voir Complexity Tracking — vide).

| # | Principe | Conformité | Note |
|---|----------|------------|------|
| I | Server-First Rendering | ✅ | Page RSC + ISR (`revalidateTag("sanity")`). `"use client"` réservé au motion de scroll (`Parallax`) ; le hero est statique (mono-visuel, pas de carrousel). |
| II | CMS as Single Content Source | ✅ | Tout le contenu éditorial → singleton `expertisesPage`. Aucune carte statique : les 3 niveaux sont une liste CMS éditable. Les destinations des sous-pages sont des `string href` (routes prévues), pas des références Sanity. |
| III | Feature-Based Architecture | ✅ | Page sous `(site)/expertises/`, mapping `@/lib/sanity/expertisesPage.ts`, copie `@/content/expertisesPage.ts`, primitifs visuels dans `@/design-system`, motion réutilisé depuis `@/lib/motion`. |
| IV | Simplicity Over Abstraction | ✅ | Réutilise le DS + `Parallax`. **Zéro** nouveau composant DS (tous les primitifs existent — la 007 a déjà ajouté `PageHero`/`Pullquote`). Hero / intro / grand visuel composés en-ligne ; les 3 niveaux mappés sur `FeatureBlock`. Pas de state global, pas de sur-abstraction. |
| V | Bilingual Convention | ✅ | Specs/docs FR ; code/commentaires/commits EN. |
| VI | Intentional Event Tracking | ✅ | Décision explicite (research §7) : les 3 « en savoir plus » des cartes de niveau sont les CTA de conversion de la page → événement Umami `expertise_level_click` (`data-umami-event-level=<slug>`) via les attributs `data-umami-*` transmis au `Button` de `FeatureBlock`. Pas de formulaire ; le CTA contact + la plaquette vivent dans le footer (déjà tracés). |
| VII | Pixel-Perfect Fidelity | ✅ | Build depuis les nodes Figma **complets** (`read expertises` / `51:2893` etc., hors-ligne) ; diff visuel contre renders cachés (skill `estuaire-pixel-review`) ; responsive par breakpoint. |
| VIII | Data/Presentation Boundary | ✅ | DS présentationnel (props only). Contenu **spécifique à la page** → fetché par la page (connecteur), mapping isolé dans `@/lib/sanity/expertisesPage.ts`. Pas de wrapper `src/components/` (réservé au global/singleton type footer). |
| IX | Modèle Sanity : types & seeds | ✅ | Schéma = source ; `npm run typegen` régénère `sanity.types.ts` ; seed typé `expertisesPage.seed.ts` validé `--check` ; `createIfNotExists` par défaut ; valeurs maquette à un seul endroit (`@/content/expertisesPage.ts`). |
| X | Design System : langage visuel | ✅ | Tokens `@theme` + composants `@/design-system` uniquement ; aucun primitif dupliqué ad hoc. Si `FeatureBlock` doit gagner un ratio responsive et le passe-plat des attributs de tracking, c'est une **extension délibérée du DS** (acte cadré, pas une déviation), pas un composant ad hoc dans la page. |

## Project Structure

### Documentation (cette feature)

```text
specs/008-expertises-page/
├── spec.md                       # Spécification (entrée)
├── plan.md                       # Ce fichier (/speckit.plan)
├── research.md                   # Phase 0 — décisions
├── data-model.md                 # Phase 1 — modèle de contenu expertisesPage
├── quickstart.md                 # Phase 1 — workflow de build & vérification
├── contracts/
│   ├── content-model.md          # Phase 1 — contrat schéma/éditeur + GROQ + revalidation
│   └── section-contracts.md      # Phase 1 — contrat props page→DS par section + nav-tone
└── tasks.md                      # Phase 2 — généré par /speckit.tasks (PAS ici)
```

### Source Code (repository root)

```text
src/
├── app/(site)/expertises/
│   └── page.tsx                  # NEW : connecteur RSC — getExpertisesPageProps + composition + generateMetadata
├── sanity/
│   ├── schemas/
│   │   ├── documents/expertisesPage.ts  # NEW : singleton (hero, intro, levels[], statement, seo)
│   │   └── index.ts                      # MODIF : enregistrer expertisesPage
│   ├── structure.ts                      # MODIF : entrée desk singleton « Expertises »
│   └── seed/
│       ├── documents/expertisesPage.seed.ts  # NEW : seed typé, valeurs maquette
│       └── registry.ts                   # MODIF : enregistrer expertisesPage
├── lib/sanity/
│   ├── queries.ts                # MODIF : EXPERTISES_PAGE_QUERY (projections + images + lqip)
│   └── expertisesPage.ts         # NEW : getExpertisesPageProps() — fetch + defaults + urlFor (miroir de aboutPage.ts)
├── content/
│   └── expertisesPage.ts         # NEW : copie maquette (source unique seed ↔ fallback front)
├── design-system/
│   └── components/FeatureBlock.tsx  # MODIF (si confirmé au build) : ratio responsive + passe-plat data-umami sur le CTA
└── sanity.types.ts               # RÉGÉNÉRÉ : npm run typegen

seed-assets/expertisesPage/        # NEW : images de seed du contenu éditable (hors public/)
```

**Structure Decision** : un seul projet Next.js App Router (Principe IV — pas de monorepo).
« Expertises » suit le pattern *connecteur de page* (Principe VIII), miroir exact de
« Nous découvrir » (007) : la page RSC fetche et compose ; le mapping Sanity→props est isolé
dans `@/lib/sanity/expertisesPage.ts` (miroir de `aboutPage.ts`) ; la copie de maquette vit
une seule fois dans `@/content/expertisesPage.ts` (Principe IX). **Aucun primitif DS ajouté**
— la page réutilise `PageHero`, `SectionTitle`, `Pullquote`, `FeatureBlock`, `Button`. Le
motion de scroll réutilise `@/lib/motion/Parallax` (comportement, hors DS présentationnel) —
aucun nouveau primitif de motion (le hero est statique).

## Complexity Tracking

> Aucune déviation par rapport aux principes. La page n'introduit aucune nouvelle
> abstraction : elle réutilise le design system tel que livré par les features 005/007, et
> son modèle CMS suit exactement le pattern singleton établi (home/about/footer). Les seules
> modifications hors-feature sont des **extensions délibérées de `FeatureBlock`** (ratio
> responsive par breakpoint + passe-plat des attributs `data-umami-*` sur son CTA), **à ne
> faire que si la lecture du node au build le confirme** (Principe X : on étend le DS, on ne
> duplique pas une carte ad hoc dans la page) — pas une déviation constitutionnelle.

*(Section vide — rien à justifier.)*
