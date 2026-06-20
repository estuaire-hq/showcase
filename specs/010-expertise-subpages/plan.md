# Plan d'implémentation : Sous-pages « Expertise »

**Branche** : `010-expertise-subpages` | **Date** : 2026-06-19 | **Spec** : [spec.md](./spec.md)
**Entrée** : Spécification de fonctionnalité `specs/010-expertise-subpages/spec.md`

## Summary

Livrer les **trois sous-pages de détail** d'expertise — `/expertises/agencement-sur-mesure`,
`/expertises/mobiliers-sur-mesure`, `/expertises/presentoirs-sur-mesure` — qui rendent
fonctionnels les liens « en savoir plus » de la page « Expertises » (feature 008, aujourd'hui
en 404 temporaire). Les trois pages partagent **un seul gabarit** de 6 sections (hero +
fil d'Ariane · intro · responsable · « Nos engagements » · cas study · BIG FOOTER du shell)
et ne diffèrent que par leur **contenu**.

**Approche technique** : un **type de document Sanity unique paramétré** `expertiseSubpage`
(avec un champ `slug`), instancié **3 fois**, servi par **une route dynamique**
`(site)/expertises/[expertise]/page.tsx` (la première route de contenu dynamique du projet —
seul `studio/[[...tool]]` existe). `generateStaticParams` génère les 3 slugs connus ; le
connecteur résout le contenu par slug (Sanity → défauts maquette par slug), `notFound()` sinon.
Le gabarit est composé en-ligne dans ce connecteur RSC à partir des composants du design
system. Trois composants DS sont en jeu : **`PageHero`** (réutilisé, étendu d'un slot
fil d'Ariane), **un nouveau `Breadcrumb`**, **un nouveau `EngagementsGrid`** (la grille 3×2
des 6 engagements numérotés — le manque structurant), et **`CaseStudyCard`** (réutilisé, étendu
d'un slot bouton) pour la bande cas study. Le contenu est branché sur le CMS (un seul modèle,
3 documents indépendants), les cinématiques appliquées (skill `estuaire-motion`), le rendu
rendu fidèle à la maquette (skill `estuaire-pixel-perfect` / `estuaire-pixel-review`) sur les 3
formats — l'agencement (3 frames) servant de **référence responsive** dont mobiliers et
présentoirs (desktop only) dérivent.

## Technical Context

**Language/Version** : TypeScript strict, React Server Components — Next.js 16 (App Router,
`standalone`).
**Primary Dependencies** : `next` 16, `sanity` v5 + `next-sanity` (Studio embarqué,
`defineLive`/`sanityFetch`, TypeGen), `gsap` + `@gsap/react` + `lenis` (déjà câblés via
`src/lib/motion/`), Tailwind CSS v4 (`@theme`), `tailwind-variants` + `cn`. **Aucune nouvelle
dépendance.**
**Storage** : Sanity Cloud (projets dev / prod distincts) — **un nouveau type de document
`expertiseSubpage`** instancié 3 fois (contenus indépendants par page). Assets de contenu
hébergés chez Sanity, sourcés au seed depuis `seed-assets/expertiseSubpages/` (committé, hors
`public/`).
**Testing** : `npm run lint` (Biome), `npm run build`, `npm run typegen` (cohérence
schéma↔types), `npm run seed -- expertiseSubpage --check` (dry-run de validation des 3 seeds).
Vérification pixel-perfect par **diff visuel** contre les renders Figma cachés (Principe VII,
skill `estuaire-pixel-review`).
**Target Platform** : navigateurs modernes desktop/tablette/mobile ; rendu serveur + ISR,
hydratation client minimale (motion de scroll uniquement ; le hero est statique).
**Project Type** : application web (site vitrine) — un seul projet Next.js, App Router
feature-based.
**Performance Goals** : SC-008 — premier écran lisible et contenu principal < 2,5 s sur mobile
représentatif, sans décalage de mise en page notable (placeholders LQIP, images `next/image`).
**Constraints** : pixel-perfect par breakpoint (agencement `51:3008` desktop / `87:6762`
tablette / `87:6964` mobile ; mobiliers `51:3134` et présentoirs `51:3259` desktop, responsive
dérivé) ; `prefers-reduced-motion` honoré partout (FR-013) ; accessibilité clavier +
sémantique, un H1 unique par page (FR-014) ; aucune couleur/taille codée en dur (Principe X) ;
JS client minimal (Principe I).
**Scale/Scope** : 3 routes via **une** route dynamique `[expertise]` ; 5 sections de contenu
par page + footer existant ; **un** nouveau type de document CMS (3 instances) ; **2 nouveaux
primitifs DS** (`Breadcrumb`, `EngagementsGrid`) + **2 extensions délibérées** (`PageHero` slot
fil d'Ariane, `CaseStudyCard` slot bouton), à confirmer au build sur les nodes.

## Constitution Check

*GATE : doit passer avant la Phase 0. Re-vérifié après la Phase 1.* — **Verdict : PASS**
(aucune déviation ; voir Complexity Tracking — vide).

| # | Principe | Conformité | Note |
|---|----------|------------|------|
| I | Server-First Rendering | ✅ | 1 route dynamique RSC + ISR (`revalidateTag("sanity")`). `generateStaticParams` pré-génère les 3 slugs. `"use client"` réservé au motion de scroll ; hero statique. |
| II | CMS as Single Content Source | ✅ | Tout le contenu éditorial → document `expertiseSubpage` (3 instances). Les 6 engagements et le cas study sont des champs/listes CMS, jamais codés en dur. Le lien du cas study est un `string href` (route de réalisation prévue), pas une référence. |
| III | Feature-Based Architecture | ✅ | Route sous `(site)/expertises/[expertise]/`, mapping `@/lib/sanity/expertiseSubpage.ts`, copie `@/content/expertiseSubpages.ts`, primitifs visuels dans `@/design-system`, motion réutilisé depuis `@/lib/motion`. |
| IV | Simplicity Over Abstraction | ✅ | **Un seul** type de document paramétré + **une** route dynamique pour 3 pages (vs 3 singletons + 3 routes = duplication). Réutilise le DS ; n'ajoute que les 2 primitifs réellement manquants (la grille d'engagements et le fil d'Ariane), repérés sur le node — pas d'abstraction spéculative. |
| V | Bilingual Convention | ✅ | Specs/docs FR ; code/commentaires/commits EN. |
| VI | Intentional Event Tracking | ✅ | Décision explicite (research §7) : le **bouton du cas study** est le levier de conversion propre à ces pages → événement Umami `case_study_click` avec propriété `expertise` (slug, sans PII), via le passe-plat `data-umami-*`. Pas de formulaire ; le CTA contact + la plaquette vivent dans le footer (déjà tracés) ; l'« en savoir plus » d'entrée est tracé par la 008. |
| VII | Pixel-Perfect Fidelity | ✅ | Build depuis les nodes Figma **complets** (`read` hors-ligne : agencement `51:3008`/`87:6762`/`87:6964`, mobiliers `51:3134`, présentoirs `51:3259`) ; diff visuel contre renders cachés (skill `estuaire-pixel-review`) ; responsive par breakpoint, mobiliers/présentoirs dérivés de l'agencement. |
| VIII | Data/Presentation Boundary | ✅ | DS présentationnel (props only). Contenu **spécifique aux pages** → fetché par le connecteur de route, mapping isolé dans `@/lib/sanity/expertiseSubpage.ts`. Pas de wrapper `src/components/` (réservé au global/singleton type footer). |
| IX | Modèle Sanity : types & seeds | ✅ | Schéma = source ; `npm run typegen` régénère `sanity.types.ts` ; **3 seeds** typés `expertiseSubpage` validés `--check` ; `createIfNotExists` par défaut ; valeurs maquette à un seul endroit (`@/content/expertiseSubpages.ts`, indexées par slug). |
| X | Design System : langage visuel | ✅ | Tokens `@theme` + composants `@/design-system` uniquement (bleu = `bg-estuaire`, jamais `#003787`). Les 2 nouveaux primitifs (`Breadcrumb`, `EngagementsGrid`) et les 2 extensions (`PageHero`, `CaseStudyCard`) sont des **ajouts délibérés au DS** (Principe III/X : on étend le DS, on ne duplique pas dans la page). Le demi-fond bleu de l'intro agencement = composition de tokens, pas un composant ad hoc. |

## Project Structure

### Documentation (cette feature)

```text
specs/010-expertise-subpages/
├── spec.md                       # Spécification (entrée)
├── plan.md                       # Ce fichier (/speckit.plan)
├── research.md                   # Phase 0 — décisions
├── data-model.md                 # Phase 1 — modèle de contenu expertiseSubpage
├── quickstart.md                 # Phase 1 — workflow de build & vérification
├── contracts/
│   ├── content-model.md          # Phase 1 — contrat schéma/éditeur + GROQ (par slug) + revalidation
│   └── section-contracts.md      # Phase 1 — contrat props connecteur→DS par section + nav-tone
└── tasks.md                      # Phase 2 — généré par /speckit.tasks (PAS ici)
```

### Source Code (repository root)

```text
src/
├── app/(site)/expertises/[expertise]/
│   └── page.tsx                  # NEW : connecteur RSC dynamique — generateStaticParams (3 slugs) +
│                                 #       getExpertiseSubpageProps(slug) + composition gabarit + generateMetadata
├── sanity/
│   ├── schemas/
│   │   ├── documents/expertiseSubpage.ts  # NEW : type document (slug + hero/breadcrumb, intro, responsable,
│   │   │                                  #       engagements[6], caseStudy, seo)
│   │   └── index.ts                        # MODIF : enregistrer expertiseSubpage
│   ├── structure.ts                        # MODIF : entrée desk « Sous-pages d'expertise » (liste du type)
│   └── seed/
│       ├── documents/expertiseSubpages.seed.ts  # NEW : 3 seeds typés (agencement/mobiliers/présentoirs)
│       └── registry.ts                     # MODIF : ...expertiseSubpages (spread des 3 docs)
├── lib/sanity/
│   ├── queries.ts                # MODIF : EXPERTISE_SUBPAGE_QUERY ($slug) + EXPERTISE_SUBPAGE_SLUGS_QUERY
│   └── expertiseSubpage.ts       # NEW : getExpertiseSubpageProps(slug) — fetch by slug + defaults + urlFor
├── content/
│   └── expertiseSubpages.ts      # NEW : copie maquette indexée par slug (source unique seed ↔ fallback front)
├── design-system/
│   ├── components/
│   │   ├── Breadcrumb.tsx        # NEW : fil d'Ariane (items {label, href?} + séparateur), présentationnel
│   │   ├── EngagementsGrid.tsx   # NEW : grille 3×2 des 6 engagements numérotés (01/…06/) + traits
│   │   ├── PageHero.tsx          # MODIF (si confirmé au build) : slot optionnel `breadcrumb`
│   │   └── CaseStudyCard.tsx     # MODIF (si confirmé au build) : slot bouton + passe-plat data-umami
│   └── index.ts                  # MODIF : exporter Breadcrumb, EngagementsGrid
└── sanity.types.ts               # RÉGÉNÉRÉ : npm run typegen

seed-assets/expertiseSubpages/     # NEW : images de seed des 3 sous-pages (hors public/)
```

**Structure Decision** : un seul projet Next.js App Router (Principe IV — pas de monorepo).
Là où la 008 était un **singleton** (1 page = 1 document), cette feature est **1 gabarit = N
contenus** : le bon idiome est **un type de document paramétré + une route dynamique** (DRY,
Principe IV), conforme à l'hypothèse du spec (« modèle de contenu unique paramétré par
l'expertise »). Le mapping Sanity→props est isolé dans `@/lib/sanity/expertiseSubpage.ts`
(prend un `slug`) ; la copie de maquette vit une seule fois dans `@/content/expertiseSubpages.ts`
(indexée par slug — Principe IX). Le DS gagne 2 primitifs manquants et 2 extensions délibérées ;
le motion réutilise `@/lib/motion/Parallax` (hors DS présentationnel).

## Complexity Tracking

> Aucune déviation par rapport aux principes. La nouveauté — une **route dynamique** et un
> **type de document multi-instances** — est précisément le choix le plus simple pour 3 pages à
> gabarit identique (l'alternative « 3 singletons + 3 routes » dupliquerait modèle et code, à
> rebours du Principe IV). Les 2 nouveaux composants DS correspondent à des éléments réellement
> absents du design system (grille d'engagements numérotée, fil d'Ariane) et lui sont ajoutés
> délibérément (Principe X), pas dupliqués dans la page. Les extensions de `PageHero` et
> `CaseStudyCard` ne sont faites **que si la lecture du node au build les confirme**.

*(Section vide — rien à justifier.)*
