# Quickstart — Construire & vérifier la page « Nous découvrir »

Guide opérationnel pour implémenter la page après ce plan. Charger les skills avant chaque
tâche correspondante : **`estuaire-figma-cli`** (lire la maquette), **`estuaire-pixel-perfect`**
(méthode de build), **`estuaire-motion`** (cinématiques), **`estuaire-pixel-review`**
(sign-off final). Toujours lire le **node complet** — jamais un résumé (Principe VII).

## 0. Prérequis

```bash
git-crypt unlock                 # secrets .env.development en clair
npm install
npm run dev                      # http://localhost:3000/nous-decouvrir  (⚠️ relancer après tout changement @theme)
```

## 1. Lire la maquette (source de vérité — ne jamais deviner)

```bash
npm run figma -- list                       # cibles disponibles
npm run figma -- read about                 # = 51:2699, node complet desktop (offline)
npm run figma -- read about --bp=tablet     # = 78:4374
npm run figma -- read about --bp=mobile     # = 78:4626
npm run figma -- read about --images        # inventaire des 22 visuels + slots
```

Le render de référence (`.design/figma-cache/assets/51-2699.png`) sert au **diff visuel**
final. Lire chaque section (`02/ SLIDER` … `08/ CTA`) sur le node avant de la coder.

## 2. Créer le modèle Sanity (Principe IX — ordre imposé par CLAUDE.md)

1. `npm run seed:scaffold -- aboutPage` (génère le squelette de seed à remplir).
2. Écrire `src/sanity/schemas/documents/aboutPage.ts` (groupes + champs — cf.
   `data-model.md` + `contracts/content-model.md`). Réutiliser le helper `imageField`.
3. Enregistrer dans `src/sanity/schemas/index.ts` (`schemaTypes`).
4. Épingler le singleton dans `src/sanity/structure.ts` : ajouter `"aboutPage"` à
   `SINGLETONS` + un `S.listItem()` « Nous découvrir ».
5. `npm run typegen` → régénère `src/sanity.types.ts` (commité).
6. Ajouter `ABOUT_PAGE_QUERY` dans `src/lib/sanity/queries.ts` (projection complète + LQIP).
7. Créer `src/content/aboutPage.ts` (copie maquette, **source unique** — Principe IX) en
   lisant les textes sur Figma.
8. Créer `src/lib/sanity/aboutPage.ts` : `getAboutPageProps()` (fetch + defaults + `urlFor`),
   miroir de `src/lib/sanity/homePage.ts`.

## 3. Seeder le contenu par défaut

1. Déposer les visuels maquette dans `seed-assets/aboutPage/` (committé, hors `public/`).
2. Remplir `src/sanity/seed/documents/aboutPage.seed.ts` (`defineSeed<AboutPage>`, texte
   depuis `@/content/aboutPage.ts`, images via `image(...)`).
3. Enregistrer dans `src/sanity/seed/registry.ts`.
4. `npm run seed:check` (dry-run : required + assets) puis `npm run seed -- aboutPage`
   (projet **dev** uniquement ; la prod se seede par la CI).

## 4. Ajouter les primitifs DS manquants

- `src/design-system/components/PageHero.tsx` — visuel plein cadre + encart titre (H1),
  statique. Géométrie ← `read 51:2699`.
- `src/design-system/components/Pullquote.tsx` — phrase phare centrée (`BrandText`,
  `currentColor`).
- Exporter les deux dans `src/design-system/index.ts`.
- Tokens uniquement (`@theme`), variantes via `tv` (Principe X). Aucune couleur/taille en dur.

## 5. Composer la page (RSC connecteur)

`src/app/(site)/nous-decouvrir/page.tsx` :

1. `generateMetadata()` lit `props.seo` (repli maquette).
2. `<main data-nav-*-tone=…>` (tonalité lue sur le hero au build).
3. Sections dans l'ordre FR-001 (cf. `contracts/section-contracts.md`) : `PageHero` →
   intro → vision → atelier → mode opératoire (map des étapes) → `FeatureBlock` → CTA.
4. Visuels en `next/image` + LQIP, enveloppés de `<Parallax>` ; CTA `Button` avec
   `data-umami-event="about_cta_click"`.

## 6. Motion (skill `estuaire-motion`)

- Hero **statique**. Reveals au scroll (line-mask sur titres, parallaxe/clip sur visuels)
  via `<Parallax>` + `data-*`. Une seule motion focale à la fois.
- Vérifier `prefers-reduced-motion` : tout au repos, contenu complet (FR-014).

## 7. Vérifier

```bash
npm run lint                     # Biome
npm run typegen                  # cohérence schéma ↔ types
npm run build                    # build prod
```

- **Pixel-review** (skill `estuaire-pixel-review`, MANDATORY) : capturer
  `/nous-decouvrir` par breakpoint, aligner **section par section** contre le render Figma
  (side-by-side + overlay + diff), boucler fix→recapture→re-diff jusqu'à zéro écart.
- **Accessibilité** : un seul H1, navigation clavier de bout en bout, `alt` sur tous les
  visuels, contrastes (FR-015 / SC-004).
- **CMS** : modifier un champ dans le Studio → vérifier la mise à jour après revalidation
  (SC-005) ; vider un champ → vérifier le repli maquette (SC-006).

## Definition of Done (rappel des critères de succès)

- [ ] Les 7 sections rendues dans l'ordre + footer (FR-001), fidèles à la maquette sur les
      3 formats (SC-003).
- [ ] Contenu éditable via le CMS, repli maquette complet sans saisie (SC-005/SC-006).
- [ ] CTA « découvrir nos expertises » → `/expertises` + événement Umami (FR-008, Principe VI).
- [ ] `prefers-reduced-motion` honoré ; page parcourable au clavier, 0 piège (SC-004).
- [ ] H1 unique + métadonnées SEO éditables (FR-016).
- [ ] `lint`, `typegen`, `build`, `seed:check` au vert.
