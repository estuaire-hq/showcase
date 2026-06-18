# Plan d'implémentation : Page « Univers » (secteurs)

**Branche** : `009-sectors-page` | **Date** : 2026-06-17 | **Spec** : [spec.md](./spec.md)
**Entrée** : Spécification de fonctionnalité `specs/009-sectors-page/spec.md`

## Summary

Construire la page « Univers » (secteurs) sur la route `/univers` (déjà ciblée par l'entrée
de navigation « univers » et listée dans le footer), à partir des composants
présentationnels du design system, brancher son contenu éditable sur un **nouveau
singleton Sanity `sectorsPage`**, appliquer les cinématiques de scroll (skill
`estuaire-motion`) et la rendre fidèle à la maquette Figma desktop (skill
`estuaire-pixel-perfect`), responsive par breakpoint.

Le socle est posé et plusieurs pages sont livrées : design system consommable, shell
`(site)` (`SmoothScroll` Lenis + GSAP, `Navbar` sticky à tonalité adaptative via
`data-nav-*-tone`, footer global `<Footer />` révélé au scroll — qui **porte déjà** la
bannière CTA « Une question, un projet ? », `ScrollTopMount`), revalidation ISR globale
(`revalidateTag("sanity")`). « Univers » est un **contenu spécifique à une page** :
conformément au Principe VIII, la page elle-même est le connecteur (elle fetche via
`@/lib/sanity/sectorsPage.ts` et passe les props aux composants DS) — pas un composant
connecté global comme le footer.

La page comporte 4 sections de contenu (maquette `51:3386` desktop ; pas de frame
tablette/mobile fournie — responsive adapté, cf. *Hypothèses* de la spec) :
`02/ SLIDER` (hero + encart titre) · `03/ INTRO` (phrase de positionnement + texte +
visuel, sur panneau crème) · `04/ SECTEURS` (4 bandes plein-largeur : Retail, Bureau,
Résidentiel, Scénographie — image + voile + titre + trait + phrase + bouton « en savoir
plus ») · `05/ INFOS CLÉS` (grille 2×2 de 4 chiffres/promesses + croix de séparation),
suivies du `BIG FOOTER` global existant (CTA + footer + retour-en-haut).

**Approche technique** : (1) créer le singleton `sectorsPage` (schéma + groupes Studio +
desk + TypeGen) avec une **liste embarquée `array<sector>`** (libellé, phrase, visuel,
lien, l'ordre du tableau = rang) et une **liste embarquée `array<keyFigure>`** (intitulé +
phrase d'appui) — décision de modélisation tranchée ci-dessous ; (2) ajouter au DS **un
seul primitif manquant — `SectorBand`** (image plein-cadre + voile sombre + titre + trait
+ phrase + CTA flèche superposés, réutilisable par les futures pages de détail secteur) ;
(3) réutiliser `PageHero` (hero + encart titre), `Button` (`tone="light"` = « en savoir
plus »), `SectionTitle`/`OutlineText`, `BrandText`, et le wrapper de motion `Parallax` ;
(4) composer la page en RSC (`(site)/univers/page.tsx`) — l'intro et la grille « infos
clés » assemblées en-ligne à partir des tokens + type DS, les 4 secteurs mappés sur
`SectorBand`, le tout dans des `<Parallax>` ; (5) `generateMetadata` lisant les champs SEO
du singleton ; (6) seed typé `sectorsPage.seed.ts` + assets `seed-assets/sectorsPage/`,
copie maquette unique dans `src/content/sectorsPage.ts`.

## Technical Context

**Language/Version** : TypeScript strict, React Server Components — Next.js 16 (App
Router, `standalone`).
**Primary Dependencies** : `next` 16, `sanity` v5 + `next-sanity` (Studio embarqué,
`defineLive`/`sanityFetch`, TypeGen), `gsap` + `@gsap/react` + `lenis` (déjà câblés via
`src/lib/motion/`), Tailwind CSS v4 (`@theme`), `tailwind-variants` (`tv`) + `cn`. **Aucune
nouvelle dépendance.**
**Storage** : Sanity Cloud (projet dev / projet prod distincts) — contenu éditable du
**nouveau singleton `sectorsPage`** ; assets de contenu hébergés chez Sanity, sourcés au
seed depuis `seed-assets/sectorsPage/` (committé, hors `public/`).
**Testing** : `npm run lint` (Biome), `npm run build`, `npm run typegen` (cohérence
schéma↔types), `npm run seed:check` (dry-run de validation seed). Vérification
pixel-perfect par **diff visuel** contre le render Figma caché `51-3386.png` (Principe VII,
skill `estuaire-pixel-review`) — desktop uniquement ; tablette/mobile vérifiés en cohérence
et lisibilité (SC-003).
**Target Platform** : navigateurs modernes desktop/tablette/mobile ; rendu serveur + ISR,
hydratation client minimale (motion de scroll uniquement ; le hero est statique).
**Project Type** : application web (site vitrine) — un seul projet Next.js, App Router
feature-based.
**Performance Goals** : SC-007 — premier écran lisible et contenu principal < 2,5 s sur
mobile représentatif, sans décalage de mise en page notable (placeholders LQIP, images
`next/image`).
**Constraints** : pixel-perfect desktop sur les dimensions intrinsèques (frame `51:3386`),
dynamiques adaptatives ; responsive **par breakpoint** (mobile-first : base = mobile,
`md` = tablette, `lg` = desktop) faute de frames tablette/mobile ; `prefers-reduced-motion`
honoré partout (FR-012) ; accessibilité clavier + sémantique, un **H1 unique** (FR-013/014) ;
aucune couleur/taille codée en dur (Principe X) ; JS client minimal (Principe I).
**Scale/Scope** : une route (`/univers`) ; 4 sections de contenu + footer existant ; un
nouveau singleton CMS (avec 2 listes embarquées : 4 secteurs, 4 chiffres clés) ; **un seul**
primitif DS ajouté (`SectorBand`) ; intro + grille infos-clés composées en-ligne.

## Constitution Check

*GATE : doit passer avant la Phase 0. Re-vérifié après la Phase 1.* — **Verdict : PASS**
(aucune déviation ; voir Complexity Tracking — vide).

| # | Principe | Conformité | Note |
|---|----------|------------|------|
| I | Server-First Rendering | ✅ | Page RSC + ISR (`revalidateTag("sanity")`). `"use client"` réservé au motion de scroll (`Parallax`, déjà existant) ; le hero est statique (pas de carrousel, contrairement à la home). |
| II | CMS as Single Content Source | ✅ | Tout le contenu éditorial (hero, intro, 4 secteurs, 4 chiffres clés, SEO) → singleton `sectorsPage`. Aucune copie codée en dur dans les composants ; les valeurs de maquette servent de **repli** via `src/content/sectorsPage.ts`. |
| III | Feature-Based Architecture | ✅ | Page sous `(site)/univers/`, mapping `@/lib/sanity/sectorsPage.ts`, copie `@/content/sectorsPage.ts`, primitif visuel dans `@/design-system`, motion réutilisé depuis `@/lib/motion`. |
| IV | Simplicity Over Abstraction | ✅ | Réutilise DS + `Parallax`. **Un seul** primitif DS ajouté (`SectorBand`), justifié par un besoin concret et réutilisable (les pages de détail secteur réutiliseront la bande plein-cadre). Secteurs/chiffres = **listes embarquées** (pas de documents autonomes ni de références — voir Structure Decision). Intro + grille infos-clés composées en-ligne. Pas de state global. |
| V | Bilingual Convention | ✅ | Specs/docs FR ; code/commentaires/commits EN. |
| VI | Intentional Event Tracking | ✅ | Décision explicite (research §7) : chaque bouton « en savoir plus » → événement Umami `sector_cta_click` (`data-umami-event-sector=<slug>`) via les attributs `data-umami-*` exposés par `SectorBand`/`Button`. Pas de formulaire sur la page ; le CTA contact vit dans le footer (déjà tracé). |
| VII | Pixel-Perfect Fidelity | ✅ | Build depuis le node Figma **complet** (`read secteurs` / `51:3386`, hors-ligne) ; diff visuel contre le render caché `51-3386.png` (skill `estuaire-pixel-review`) ; responsive adapté par breakpoint (desktop seul fourni — diff desktop, cohérence tablette/mobile, SC-003). |
| VIII | Data/Presentation Boundary | ✅ | DS présentationnel (props only). Contenu **spécifique à la page** → fetché par la page (connecteur), mapping isolé dans `@/lib/sanity/sectorsPage.ts`. Pas de wrapper `src/components/` (réservé au global/singleton type footer). |
| IX | Modèle Sanity : types & seeds | ✅ | Schéma = source ; `npm run typegen` régénère `sanity.types.ts` ; seed typé `sectorsPage.seed.ts` validé `--check` ; `createIfNotExists` par défaut ; valeurs maquette à un seul endroit (`@/content/sectorsPage.ts`). |
| X | Design System : langage visuel | ✅ | Tokens `@theme` (`bg-ink`, `bg-cream`, `text-paper`, échelle `text-title`/`text-lead`/…) + composants `@/design-system` uniquement ; le primitif `SectorBand` **ajouté au DS** (acte délibéré), jamais dupliqué ad hoc ; variantes via `tv`. Voile = `bg-ink/25` (token + opacité), pas de couleur en dur. |

## Project Structure

### Documentation (cette feature)

```text
specs/009-sectors-page/
├── spec.md                       # Spécification (entrée)
├── plan.md                       # Ce fichier (/speckit.plan)
├── research.md                   # Phase 0 — décisions
├── data-model.md                 # Phase 1 — modèle de contenu sectorsPage
├── quickstart.md                 # Phase 1 — workflow de build & vérification
├── contracts/
│   ├── content-model.md          # Phase 1 — contrat schéma/éditeur + GROQ + revalidation
│   └── section-contracts.md      # Phase 1 — contrat props page→DS par section + nav-tone
└── tasks.md                      # Phase 2 — généré par /speckit.tasks (PAS ici)
```

### Source Code (repository root)

```text
src/
├── app/(site)/univers/
│   └── page.tsx                  # NEW : connecteur RSC — getSectorsPageProps + composition + generateMetadata
├── sanity/
│   ├── schemas/
│   │   ├── documents/sectorsPage.ts  # NEW : singleton (hero, intro, sectors[], keyFigures[], seo)
│   │   └── index.ts                  # MODIF : enregistrer sectorsPage
│   ├── structure.ts                  # MODIF : entrée desk singleton « Univers » + SINGLETONS
│   └── seed/
│       ├── documents/sectorsPage.seed.ts  # NEW : seed typé, valeurs maquette
│       └── registry.ts             # MODIF : enregistrer sectorsPage
├── lib/sanity/
│   ├── queries.ts                # MODIF : SECTORS_PAGE_QUERY (projections + images + lqip)
│   └── sectorsPage.ts            # NEW : getSectorsPageProps() — fetch + defaults + urlFor (miroir de homePage.ts)
├── content/
│   └── sectorsPage.ts            # NEW : copie maquette (source unique seed ↔ fallback front)
├── design-system/
│   ├── components/SectorBand.tsx # NEW : image plein-cadre + voile + titre + trait + phrase + CTA flèche
│   └── index.ts                  # MODIF : exporter SectorBand
└── sanity.types.ts               # RÉGÉNÉRÉ : npm run typegen

seed-assets/sectorsPage/          # NEW : images de seed (hero, intro, 4 secteurs, og) — hors public/
```

**Structure Decision** : un seul projet Next.js App Router (Principe IV — pas de monorepo).
« Univers » suit le pattern *connecteur de page* (Principe VIII) : la page RSC fetche et
compose ; le mapping Sanity→props est isolé dans `@/lib/sanity/sectorsPage.ts` (miroir exact
de `homePage.ts`/`aboutPage.ts`) ; la copie de maquette vit une seule fois dans
`@/content/sectorsPage.ts` (Principe IX). L'ajout au DS se limite au seul primitif de marque
réutilisable `SectorBand` (Principe X). Le motion de scroll réutilise `@/lib/motion/Parallax`
(comportement, hors DS présentationnel) — aucun nouveau primitif de motion (le hero est
statique).

**Modélisation des secteurs — liste embarquée (tranché)** : les secteurs et les chiffres
clés sont modélisés comme des **`array` embarqués dans le singleton `sectorsPage`**
(objets `sector` / `keyFigure`), PAS comme des documents Sanity autonomes. Raisons :
(1) sur cette page les secteurs sont une **liste présentationnelle ordonnée** (libellé,
phrase, visuel, lien, rang) — exactement le précédent `processSteps` de `aboutPage` ;
(2) Principe IV / YAGNI — des documents autonomes ajouteraient un type, 4 documents seedés,
des références et 4 entrées de desk, sans bénéfice ici ; (3) les **pages de détail secteur**
sont des features distinctes (maquettes propres `51:3520`…`51:3929`) qui définiront leur
propre modèle (vraisemblablement un `sectorPage` par secteur) — elles ne consomment pas
cette liste. Le `href` de chaque secteur pointe vers la route de détail prévue
(`/univers/<slug>`, 404 temporaire accepté — FR-005). Réévaluable si une future feature
prouve le besoin de partager une entité `sector` entre la liste et les détails.

## Complexity Tracking

> Aucune déviation par rapport aux principes.
>
> - L'ajout du primitif `SectorBand` au design system est la voie constitutionnelle
>   (Principe X : un visuel de marque réutilisable s'ajoute au DS, ne se duplique pas dans
>   la page), pas une déviation — `SplitSection` (image+texte côte-à-côte avec carte/CTA)
>   ne couvre pas le layout plein-cadre superposé sous voile des bandes secteur.
> - Le contenu est intégralement piloté par le CMS (pas d'exception au Principe II comme
>   l'avaient les cartes statiques de la home).

*(Section vide — rien à justifier.)*
