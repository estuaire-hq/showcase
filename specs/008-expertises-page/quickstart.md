# Quickstart — Construire & vérifier la page « Expertises »

Guide opérationnel pour implémenter la page après ce plan. Charger les skills avant chaque
tâche correspondante : **`estuaire-figma-cli`** (lire la maquette), **`estuaire-pixel-perfect`**
(méthode de build), **`estuaire-motion`** (cinématiques), **`estuaire-pixel-review`** (sign-off
final). Toujours lire le **node complet** — jamais un résumé (Principe VII).

## 0. Prérequis

```bash
git-crypt unlock                 # secrets .env.development en clair
npm install
npm run dev                      # http://008-expertises-page.estuaire.localhost:1355/expertises
                                 # (PORTLESS=0 npm run dev → http://localhost:3000/expertises)
                                 # ⚠️ relancer après tout changement @theme
```

## 1. Lire la maquette (source de vérité — ne jamais deviner)

```bash
npm run figma -- list                          # cibles disponibles
npm run figma -- read expertises               # = 51:2893, node complet desktop (offline)
npm run figma -- read expertises --bp=tablet   # = 87:5600
npm run figma -- read expertises --bp=mobile   # = 87:6290
npm run figma -- read expertises --images      # inventaire des visuels + slots
```

Le render de référence (`.design/figma-cache/assets/51-2893.png`) sert au **diff visuel**
final. Lire chaque section (`012/ SLIDER` · `02/ INTRO` · `03/ NOS NIVEAUX` · `05/ BIG IMAGE`)
sur le node avant de la coder. Ne pas lire les sous-pages (`51:3008` … — hors périmètre).

## 2. Créer le modèle Sanity (Principe IX — ordre imposé par CLAUDE.md)

1. `npm run seed:scaffold -- expertisesPage` (génère le squelette de seed à remplir).
2. Écrire `src/sanity/schemas/documents/expertisesPage.ts` (groupes + champs — cf.
   `data-model.md` + `contracts/content-model.md`). Réutiliser le helper `imageField`. Définir
   l'objet `expertiseLevel` (`title` requis · `image` · `ctaLabel` · `ctaHref`) + `preview`.
3. Enregistrer dans `src/sanity/schemas/index.ts` (`schemaTypes`).
4. Épingler le singleton dans `src/sanity/structure.ts` : ajouter `"expertisesPage"` à
   `SINGLETONS` + un `S.listItem()` « Expertises ».
5. `npm run typegen` → régénère `src/sanity.types.ts` (commité).
6. Ajouter `EXPERTISES_PAGE_QUERY` dans `src/lib/sanity/queries.ts` (projection complète +
   LQIP — cf. esquisse dans `contracts/content-model.md`).
7. Créer `src/content/expertisesPage.ts` (copie maquette, **source unique** — Principe IX) en
   lisant les textes sur Figma.
8. Créer `src/lib/sanity/expertisesPage.ts` : `getExpertisesPageProps()` (fetch + defaults +
   `mapImage`), miroir de `src/lib/sanity/aboutPage.ts`. Dériver `slug` de `ctaHref` par niveau.

## 3. Seeder le contenu par défaut

1. Déposer les visuels maquette dans `seed-assets/expertisesPage/` (committé, hors `public/`).
2. Remplir `src/sanity/seed/documents/expertisesPage.seed.ts` (`defineSeed<ExpertisesPage>`,
   texte depuis `@/content/expertisesPage.ts`, images via `image(...)`, niveaux avec
   `_type: "expertiseLevel"`).
3. Enregistrer dans `src/sanity/seed/registry.ts`.
4. `npm run seed:check` (dry-run : required + assets) puis `npm run seed -- expertisesPage`
   (projet **dev** uniquement ; la prod se seede par la CI).

## 4. Réutiliser le design system (aucun nouveau composant)

- **`PageHero`** (hero), **`SectionTitle`** (titre niveaux), **`Pullquote`** (phrases
  phares), **`FeatureBlock`** (cartes de niveau), **`Button`** — tous **déjà** dans
  `@/design-system`. Ne rien dupliquer (Principe X).
- **Extensions de `FeatureBlock` (uniquement si le node le confirme — research §3)** :
  - ratio responsive par breakpoint (token `aspect-*`) si les cartes diffèrent en
    tablette/mobile ;
  - passe-plat des attributs `data-umami-*` vers le `Button` interne (tracking §7).
  - Toute couleur/taille reste un token `@theme` ; aucune valeur en dur.

## 5. Composer la page (RSC connecteur)

`src/app/(site)/expertises/page.tsx` :

1. `generateMetadata()` lit `props.seo` (repli maquette).
2. `<main data-nav-*-tone=…>` (tonalité lue sur le hero au build — attendu `onDark`).
3. Sections dans l'ordre FR-001 (cf. `contracts/section-contracts.md`) : `PageHero` → intro →
   `SectionTitle` + `levels.map(FeatureBlock)` → grand visuel (image + `Pullquote`).
4. Visuels en `next/image` + LQIP, enveloppés de `<Parallax>` ; chaque `FeatureBlock` reçoit
   `data-umami-event="expertise_level_click"` + `data-umami-event-level={slug}`.
5. **Ne pas** rendre de bloc CTA ni de footer : le shell les monte déjà (« BIG FOOTER »).

## 6. Motion (skill `estuaire-motion`)

- Hero **statique**. Reveals au scroll (line-mask sur titres, parallaxe/clip sur visuels
  d'intro / cartes / grand visuel) via `<Parallax>` + `data-*`. Une seule motion focale à la
  fois ; le texte reste l'ancre.
- Vérifier `prefers-reduced-motion` : tout au repos, contenu complet (FR-012).

## 7. Vérifier

```bash
npm run lint                     # Biome
npm run typegen                  # cohérence schéma ↔ types
npm run build                    # build prod
```

- **Pixel-review** (skill `estuaire-pixel-review`, MANDATORY) : capturer `/expertises` par
  breakpoint, aligner **section par section** contre le render Figma (side-by-side + overlay +
  diff), boucler fix→recapture→re-diff jusqu'à zéro écart.
- **Accessibilité** : un seul H1 (hero), navigation clavier de bout en bout (cartes + « en
  savoir plus »), `alt` sur tous les visuels, contrastes (FR-013 / SC-004).
- **CMS** : modifier un champ (ou un niveau) dans le Studio → vérifier la mise à jour après
  revalidation (SC-005) ; vider un champ → vérifier le repli maquette (SC-006).
- **Liens** : les 3 « en savoir plus » mènent aux routes prévues (404 temporaire OK — FR-005) ;
  les liens « expertises » de la navbar/footer/about deviennent fonctionnels (FR-017).

## Definition of Done (rappel des critères de succès)

- [ ] Les 4 sections rendues dans l'ordre + le « BIG FOOTER » du shell (FR-001), fidèles à la
      maquette sur les 3 formats (SC-003).
- [ ] Contenu éditable via le CMS (dont la liste des 3 niveaux), repli maquette complet sans
      saisie (SC-005/SC-006).
- [ ] Chaque carte de niveau → sa sous-page (FR-005) + événement Umami `expertise_level_click`
      (Principe VI).
- [ ] `prefers-reduced-motion` honoré ; page parcourable au clavier, 0 piège (SC-004).
- [ ] H1 unique + métadonnées SEO éditables (FR-014).
- [ ] Route `/expertises` servie ; liens navbar/footer/about fonctionnels (FR-017).
- [ ] `lint`, `typegen`, `build`, `seed:check` au vert.
