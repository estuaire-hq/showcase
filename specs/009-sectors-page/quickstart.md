# Quickstart — Construire & vérifier la page « Univers » (secteurs)

Guide opérationnel pour implémenter la page après ce plan. Charger les skills avant chaque
tâche correspondante : **`estuaire-figma-cli`** (lire la maquette), **`estuaire-pixel-perfect`**
(méthode de build), **`estuaire-motion`** (cinématiques), **`estuaire-pixel-review`**
(sign-off final). Toujours lire le **node complet** — jamais un résumé (Principe VII).

## 0. Prérequis

```bash
git-crypt unlock                 # secrets .env.development en clair
npm install
npm run dev                      # http://009-sectors-page.estuaire.localhost:1355/univers
                                 #   (PORTLESS=0 npm run dev → http://localhost:3000/univers)
                                 #   ⚠️ relancer après tout changement @theme (Turbopack)
```

## 1. Lire la maquette (source de vérité — ne jamais deviner)

```bash
npm run figma -- list                       # cibles disponibles
npm run figma -- read secteurs              # = 51:3386, node complet desktop (offline)
npm run figma -- read secteurs --images     # inventaire des visuels + slots
```

Le render de référence (`.design/figma-cache/assets/51-3386.png`) sert au **diff visuel**
final. Pas de frame tablette/mobile (desktop seul — responsive adapté, SC-003). Lire chaque
section (`02/ SLIDER` · `03/ INTRO` · `04/ SECTEURS` · `05/ INFOS CLÉS`) sur le node avant de
la coder.

## 2. Créer le modèle Sanity (Principe IX — ordre imposé par CLAUDE.md)

1. `npm run seed:scaffold -- sectorsPage` (génère le squelette de seed à remplir).
2. Écrire `src/sanity/schemas/documents/sectorsPage.ts` (groupes Hero · Intro · Secteurs ·
   Infos clés · SEO + champs — cf. `data-model.md` + `contracts/content-model.md`). Objets
   `sector` et `keyFigure` avec `preview`. Réutiliser le helper `imageField`.
3. Enregistrer dans `src/sanity/schemas/index.ts` (`schemaTypes`).
4. Épingler le singleton dans `src/sanity/structure.ts` : ajouter `"sectorsPage"` à
   `SINGLETONS` + un `S.listItem()` « Univers ».
5. `npm run typegen` → régénère `src/sanity.types.ts` (commité).
6. Ajouter `SECTORS_PAGE_QUERY` dans `src/lib/sanity/queries.ts` (projection complète + LQIP).
7. Créer `src/content/sectorsPage.ts` (copie maquette, **source unique** — Principe IX) en
   lisant les textes sur Figma (valeurs listées dans `data-model.md`).
8. Créer `src/lib/sanity/sectorsPage.ts` : `getSectorsPageProps()` (fetch + defaults +
   `mapImage`), miroir de `src/lib/sanity/homePage.ts`.

## 3. Seeder le contenu par défaut

1. Déposer les visuels maquette dans `seed-assets/sectorsPage/` (committé, hors `public/`) :
   hero, intro, 4 secteurs (retail/bureau/residentiel/scenographie), og.
2. Remplir `src/sanity/seed/documents/sectorsPage.seed.ts` (`defineSeed<SectorsPage>`, texte
   depuis `@/content/sectorsPage.ts`, images via `image(...)` ; `_type` sur `sector`/`keyFigure`).
3. Enregistrer dans `src/sanity/seed/registry.ts`.
4. `npm run seed:check` (dry-run : required + assets) puis `npm run seed -- sectorsPage`
   (projet **dev** uniquement ; la prod se seede par la CI).

## 4. Ajouter le primitif DS manquant

- `src/design-system/components/SectorBand.tsx` — bande plein-largeur : image `fill
  object-cover` + voile `bg-ink/25` + contenu superposé (titre `BrandText`, trait `<hr>`,
  phrase, `Button tone="light" arrow`). Props : `label`, `promise`, `href`, `image`,
  `ctaUmamiEvent`/`ctaUmamiData`. Hooks `data-reveal`/`data-parallax`. Géométrie ←
  `read secteurs`.
- Exporter dans `src/design-system/index.ts`.
- Tokens uniquement (`@theme`), variantes via `tv` (Principe X). Aucune couleur/taille en dur.
- Si le hero **split** n'est pas couvert par `PageHero`, lui ajouter une prop/variante
  `background` (additif DS) — pas de réimplémentation locale.

## 5. Composer la page (RSC connecteur)

`src/app/(site)/univers/page.tsx` :

1. `generateMetadata()` lit `props.seo` (repli maquette).
2. `<main data-nav-logo-tone="onDark" data-nav-links-tone="onLight" …>` (tonalité **confirmée
   au build** sur le hero split).
3. Sections dans l'ordre FR-001 (cf. `contracts/section-contracts.md`) : `PageHero` →
   intro (en-ligne) → `sectors.map(SectorBand)` → infos clés (grille 2×2 en-ligne).
4. Visuels en `next/image` + LQIP, enveloppés de `<Parallax>` ; chaque `SectorBand` reçoit
   `ctaUmamiEvent="sector_cta_click"` + `ctaUmamiData={{ sector: <slug> }}`.
5. Pas de CTA de page ni de footer rendus ici — fournis par le shell `(site)`.

## 6. Motion (skill `estuaire-motion`)

- Hero **statique**. Reveals au scroll (line-mask sur titres, parallaxe sur visuels et
  bandes secteur) via `<Parallax>` + `data-*`. Une seule motion focale à la fois (FR-011).
- Vérifier `prefers-reduced-motion` : tout au repos, contenu complet (FR-012).

## 7. Vérifier

```bash
npm run lint                     # Biome
npm run typegen                  # cohérence schéma ↔ types
npm run build                    # build prod
```

- **Pixel-review** (skill `estuaire-pixel-review`, MANDATORY) : capturer `/univers` par
  breakpoint, aligner **section par section** contre le render Figma `51-3386.png`
  (side-by-side + overlay + diff) sur le **desktop** ; tablette/mobile vérifiés en
  cohérence + lisibilité (SC-003). Boucler fix→recapture→re-diff jusqu'à zéro écart desktop.
- **Accessibilité** : un seul H1, navigation clavier de bout en bout, `alt` sur tous les
  visuels, contraste des textes posés sur les visuels (FR-013 / SC-004).
- **CMS** : modifier un secteur (texte/visuel/ordre) dans le Studio → vérifier la mise à jour
  après revalidation (SC-005) ; vider un champ → vérifier le repli maquette (SC-006).

## Definition of Done (rappel des critères de succès)

- [ ] Les 4 sections rendues dans l'ordre + footer global (FR-001), fidèles à la maquette
      desktop (diff, SC-003) ; tablette/mobile cohérents et lisibles.
- [ ] Contenu éditable via le CMS, repli maquette complet sans saisie (SC-005/SC-006).
- [ ] Chaque « en savoir plus » → `/univers/<slug>` (404 temp OK) + événement Umami
      `sector_cta_click` (FR-005, Principe VI).
- [ ] `prefers-reduced-motion` honoré ; page parcourable au clavier, 0 piège (SC-004).
- [ ] H1 unique + métadonnées SEO éditables (FR-014).
- [ ] `lint`, `typegen`, `build`, `seed:check` au vert.
