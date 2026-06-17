# Plan d'implémentation : Page « Nous découvrir »

**Branche** : `007-discover-us-page` | **Date** : 2026-06-15 | **Spec** : [spec.md](./spec.md)
**Entrée** : Spécification de fonctionnalité `specs/007-discover-us-page/spec.md`

## Summary

Construire la page récit « Nous découvrir » sur la route `/nous-decouvrir` (déjà ciblée
par la navbar et le CTA « Notre vision » de la home), à partir des composants
présentationnels du design system, brancher son contenu éditable sur un **nouveau
singleton Sanity `aboutPage`**, appliquer les cinématiques de scroll (skill
`estuaire-motion`) et la rendre fidèle à la maquette Figma sur les trois formats (skill
`estuaire-pixel-perfect`).

Le socle est posé et la home livrée : design system consommable, shell `(site)` (Lenis +
GSAP via `SmoothScroll`, navbar sticky à tonalité adaptative, footer global révélé au
scroll, `ScrollTopButton` monté), revalidation ISR globale (`revalidateTag("sanity")`).
« Nous découvrir » est un **contenu spécifique à une page** : conformément au Principe
VIII, la page elle-même est le connecteur (elle fetche via `@/lib/sanity/aboutPage.ts`
et passe les props aux composants DS) — pas un composant connecté global comme le footer.

La page comporte 8 sections (maquette `51:2699` desktop / `78:4374` tablette / `78:4626`
mobile) : hero + encart titre · intro (phrase de positionnement + texte + 2 visuels +
phrase phare) · « Notre vision » · atelier (« De notre atelier à votre chantier » :
texte + piliers + capacités + visuels + phrase phare) · « Notre mode opératoire » (intro
+ 4 étapes) · grand visuel + phrase en incrustation · CTA « découvrir nos expertises » ·
footer existant.

**Approche technique** : (1) créer le singleton `aboutPage` (schéma + groupes Studio +
desk + TypeGen) ; (2) ajouter au DS les deux primitifs de marque manquants — `PageHero`
(visuel plein cadre + encart titre, réutilisable par les futures pages de contenu) et
`Pullquote` (la « phrase phare » récurrente) ; (3) réutiliser `SectionTitle`, `Button`,
`FeatureBlock` (bande grand-visuel + incrustation) et le wrapper de motion `Parallax` ;
(4) composer la page en RSC (`(site)/nous-decouvrir/page.tsx`) — intro, vision, atelier
et les 4 étapes du mode opératoire assemblées en-ligne à partir des primitifs DS + images
LQIP, dans des `<Parallax>` ; (5) `generateMetadata` lisant les champs SEO du singleton ;
(6) seed typé `aboutPage.seed.ts` + assets `seed-assets/aboutPage/`, copie maquette unique
dans `src/content/aboutPage.ts`.

## Technical Context

**Language/Version** : TypeScript strict, React Server Components — Next.js 16 (App
Router, `standalone`).
**Primary Dependencies** : `next` 16, `sanity` v5 + `next-sanity` (Studio embarqué,
`defineLive`/`sanityFetch`, TypeGen), `gsap` + `@gsap/react` + `lenis` (déjà câblés via
`src/lib/motion/`), Tailwind CSS v4 (`@theme`), `tailwind-variants` + `cn`. Aucune
nouvelle dépendance.
**Storage** : Sanity Cloud (projet dev / projet prod distincts) — contenu éditable du
**nouveau singleton `aboutPage`** ; assets de contenu hébergés chez Sanity, sourcés au
seed depuis `seed-assets/aboutPage/` (committé, hors `public/`).
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
**Constraints** : pixel-perfect par breakpoint (frames Figma `51:2699` / `78:4374` /
`78:4626`) ; `prefers-reduced-motion` honoré partout (FR-014) ; accessibilité clavier +
sémantique, un H1 unique (FR-015/FR-016) ; aucune couleur/taille codée en dur (Principe
X) ; JS client minimal (Principe I).
**Scale/Scope** : une route (`/nous-decouvrir`) ; 7 sections de contenu + footer existant ;
un nouveau singleton CMS ; 2 primitifs DS ajoutés (`PageHero`, `Pullquote`) ; une liste
de 4 étapes mappée en-ligne.

## Constitution Check

*GATE : doit passer avant la Phase 0. Re-vérifié après la Phase 1.* — **Verdict : PASS**
(aucune déviation ; voir Complexity Tracking — vide).

| # | Principe | Conformité | Note |
|---|----------|------------|------|
| I | Server-First Rendering | ✅ | Page RSC + ISR (`revalidateTag("sanity")`). `"use client"` réservé au motion de scroll (`Parallax`) ; le hero est statique (pas de carrousel). |
| II | CMS as Single Content Source | ✅ | Tout le contenu éditorial → singleton `aboutPage`. Aucune exception : pas de cartes statiques sur cette page (contrairement à la home). |
| III | Feature-Based Architecture | ✅ | Page sous `(site)/nous-decouvrir/`, mapping `@/lib/sanity/aboutPage.ts`, copie `@/content/aboutPage.ts`, primitifs visuels dans `@/design-system`, motion réutilisé depuis `@/lib/motion`. |
| IV | Simplicity Over Abstraction | ✅ | Réutilise DS + `Parallax`. **Deux** primitifs DS ajoutés, chacun justifié par un besoin concret et réutilisable (`PageHero` = hero de page de contenu ; `Pullquote` = phrase phare récurrente, 2–3 occurrences). Étapes/piliers/capacités composés en-ligne (pas de sur-abstraction). Pas de state global. |
| V | Bilingual Convention | ✅ | Specs/docs FR ; code/commentaires/commits EN. |
| VI | Intentional Event Tracking | ✅ | Décision explicite (research §7) : CTA « découvrir nos expertises » → événement Umami `about_cta_click` (`section=expertises`) via les attributs `data-umami-*` du `Button` (précédent home). Pas de formulaire sur la page ; le CTA contact vit dans le footer (déjà tracé). |
| VII | Pixel-Perfect Fidelity | ✅ | Build depuis les nodes Figma **complets** (`read about` / `51:2699` etc., hors-ligne) ; diff visuel contre renders cachés (skill `estuaire-pixel-review`) ; responsive par breakpoint. |
| VIII | Data/Presentation Boundary | ✅ | DS présentationnel (props only). Contenu **spécifique à la page** → fetché par la page (connecteur), mapping isolé dans `@/lib/sanity/aboutPage.ts`. Pas de wrapper `src/components/` (réservé au global/singleton type footer). |
| IX | Modèle Sanity : types & seeds | ✅ | Schéma = source ; `npm run typegen` régénère `sanity.types.ts` ; seed typé `aboutPage.seed.ts` validé `--check` ; `createIfNotExists` par défaut ; valeurs maquette à un seul endroit (`@/content/aboutPage.ts`). |
| X | Design System : langage visuel | ✅ | Tokens `@theme` + composants `@/design-system` uniquement ; les primitifs `PageHero` et `Pullquote` **ajoutés au DS** (acte délibéré), jamais dupliqués ad hoc ; variantes via `tv`. |

## Project Structure

### Documentation (cette feature)

```text
specs/007-discover-us-page/
├── spec.md                       # Spécification (entrée)
├── plan.md                       # Ce fichier (/speckit.plan)
├── research.md                   # Phase 0 — décisions
├── data-model.md                 # Phase 1 — modèle de contenu aboutPage
├── quickstart.md                 # Phase 1 — workflow de build & vérification
├── contracts/
│   ├── content-model.md          # Phase 1 — contrat schéma/éditeur + GROQ + revalidation
│   └── section-contracts.md      # Phase 1 — contrat props page→DS par section + nav-tone
├── checklists/
│   └── requirements.md           # Checklist qualité de la spec (déjà créée)
└── tasks.md                      # Phase 2 — généré par /speckit.tasks (PAS ici)
```

### Source Code (repository root)

```text
src/
├── app/(site)/nous-decouvrir/
│   └── page.tsx                  # NEW : connecteur RSC — getAboutPageProps + composition + generateMetadata
├── sanity/
│   ├── schemas/
│   │   ├── documents/aboutPage.ts  # NEW : singleton complet (hero, intro, vision, atelier, process, statement, cta, seo)
│   │   └── index.ts                # MODIF : enregistrer aboutPage
│   ├── structure.ts                # MODIF : entrée desk singleton « Nous découvrir »
│   └── seed/
│       ├── documents/aboutPage.seed.ts  # NEW : seed typé, valeurs maquette
│       └── registry.ts             # MODIF : enregistrer aboutPage
├── lib/sanity/
│   ├── queries.ts                # MODIF : ABOUT_PAGE_QUERY (projections + images + lqip)
│   └── aboutPage.ts              # NEW : getAboutPageProps() — fetch + defaults + urlFor (miroir de homePage.ts)
├── content/
│   └── aboutPage.ts              # NEW : copie maquette (source unique seed ↔ fallback front)
├── design-system/
│   ├── components/PageHero.tsx   # NEW : visuel plein cadre + encart titre (réutilisable)
│   ├── components/Pullquote.tsx  # NEW : « phrase phare » (statement centré récurrent)
│   └── index.ts                  # MODIF : exporter PageHero, Pullquote
└── sanity.types.ts               # RÉGÉNÉRÉ : npm run typegen

seed-assets/aboutPage/            # NEW : images de seed du contenu éditable (hors public/)
```

**Structure Decision** : un seul projet Next.js App Router (Principe IV — pas de
monorepo). « Nous découvrir » suit le pattern *connecteur de page* (Principe VIII) : la
page RSC fetche et compose ; le mapping Sanity→props est isolé dans
`@/lib/sanity/aboutPage.ts` (miroir exact de `homePage.ts`/`footer.ts`) ; la copie de
maquette vit une seule fois dans `@/content/aboutPage.ts` (Principe IX). Les ajouts au DS
se limitent aux deux primitifs de marque réutilisables `PageHero` et `Pullquote` (Principe
X). Le motion de scroll réutilise `@/lib/motion/Parallax` (comportement, hors DS
présentationnel) — aucun nouveau primitif de motion (le hero est statique).

## Complexity Tracking

> Aucune déviation par rapport aux principes. La page n'introduit pas l'exception du
> Principe II qu'avait la home (cartes statiques) : tout son contenu est piloté par le CMS.
> L'ajout des primitifs `PageHero` / `Pullquote` au design system est la voie
> constitutionnelle (Principe X : un visuel de marque réutilisable s'ajoute au DS, ne se
> duplique pas dans la page), pas une déviation.

*(Section vide — rien à justifier.)*
