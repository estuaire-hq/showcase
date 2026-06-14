# Quickstart — Construire & vérifier la page d'accueil

Guide opérationnel pour implémenter la home après ce plan. Charger les skills avant
chaque tâche correspondante : **`estuaire-figma-cli`** (lire la maquette),
**`estuaire-pixel-perfect`** (méthode de build), **`estuaire-motion`** (cinématiques).

## 0. Prérequis

```bash
git-crypt unlock                 # secrets .env.development en clair
npm install
npm run dev                      # http://localhost:3000  (⚠️ relancer après tout changement @theme)
```

## 1. Lire la maquette (source de vérité — ne jamais deviner)

```bash
npm run figma -- list                       # cibles disponibles
npm run figma -- read 51:2221               # home desktop, node complet (offline)
npm run figma -- read 77:3149               # home tablette
npm run figma -- read 77:3150               # home mobile
npm run figma -- read 51:2420               # slider d'intro (hero)
```

Le render de référence (`.design/figma-cache/assets/<node>.png`) sert au **diff visuel**
final (Principe VII). Lire le node **complet** — jamais un résumé.

## 2. Étendre le modèle Sanity (Principe IX — ordre imposé par CLAUDE.md)

1. Réécrire `src/sanity/schemas/documents/homePage.ts` *from scratch* — supprimer le test
   `title`/`tagline` (cf. `data-model.md` + `contracts/content-model.md`).
2. `npm run typegen` → régénère `src/sanity.types.ts` (commité).
3. Compléter `HOME_PAGE_QUERY` dans `src/lib/sanity/queries.ts` (projection complète + LQIP).
4. Créer `src/content/homePage.ts` (copie maquette, **source unique** — Principe IX) en
   lisant les textes sur Figma.
5. Créer `src/lib/sanity/homePage.ts` : `getHomePageProps()` (fetch + defaults + `urlFor`),
   miroir de `src/lib/sanity/footer.ts`.

## 3. Seeder le contenu par défaut

```bash
npm run seed:scaffold -- homePage           # génère un stub *.seed.ts
# remplir src/sanity/seed/documents/homePage.seed.ts depuis src/content/homePage.ts
# déposer les images éditables sous seed-assets/homePage/
# enregistrer le seed dans src/sanity/seed/registry.ts
npm run seed:check                          # dry-run (offline) : required + assets présents
# Ménage unique (DEV) : un doc de TEST occupe déjà _id "homePage" et createIfNotExists
#   ne l'écrase pas. Le supprimer une fois — au choix :
#     • Studio : ouvrir « Page d'accueil » → menu ⋮ → Delete   (le plus simple)
#     • CLI    : npx sanity documents delete homePage
npm run seed                                # crée le doc neuf, puis createIfNotExists (n'écrase pas l'édition)
# Équivalent en une commande (createOrReplace = delete+recreate atomique) :
# npm run seed -- --reset homePage          # destructif, opt-in (Principe IX) — pas un réflexe
```

> Prod : seedée par la CI sur le projet prod — **pas** en local.

## 4. Ajouter le primitif DS manquant

- Créer `src/design-system/components/HeroSlideshow.tsx` (cross-fade image+titre synchro,
  auto, reduced-motion → 1re slide figée — cf. `contracts/section-contracts.md` §1).
- L'exporter depuis `src/design-system/index.ts`.
- Le valider en isolation dans le lab (`(lab)/lab/kit`) avant de l'intégrer.

## 5. Cartes de réalisations statiques (FR-005)

- Créer `src/content/homeRealisations.ts` (`{ image, sector, title }[]`).
- Déposer les visuels sous `public/home/realisations/` (exception II, temporaire).
- `href` constant `/realisations` pour toutes les cartes.

## 6. Composer la page (connecteur RSC)

- Modifier `src/app/(site)/page.tsx` :
  - `const props = await getHomePageProps();`
  - composer les sections DS dans l'ordre FR-001, wrappées par `<Reveal>` (`src/lib/motion/`).
  - déclarer la tonalité navbar sur `<main>` (cf. contrat ; confirmer onDark/onLight au build).
  - exporter `generateMetadata()` (SEO éditable + défauts, FR-007/014).
- Câbler les événements Umami (`trackEvent`) sur CTA / secteurs / cartes (research §8).

## 7. Motion & shell

- Charger **`estuaire-motion`** ; créer `src/lib/motion/Reveal.tsx` (ScrollTrigger, reduced-motion).
- Monter `ScrollTopButton` via `src/lib/motion/ScrollTopMount.tsx` dans `(site)/layout.tsx`
  (FR-015 ; Lenis `scrollTo(0)`).

## 8. Vérifier (gates)

```bash
npm run lint                     # Biome
npm run typegen                  # schéma ↔ types cohérents (aucun diff non commité)
npm run build                    # build production OK
npm run seed:check               # seed valide
```

Puis, par breakpoint (390 / 768 / 1920) :

- [ ] **Diff visuel** contre `.design/figma-cache/assets/{51-2221,77-3149,77-3150}.png`
  (Principe VII) — sinon déclarer « non vérifié ».
- [ ] Hero : fondu auto image+titre, sans contrôle ; reduced-motion fige la 1re slide.
- [ ] Tous les CTA / secteurs / cartes : focus clavier + activation, 0 piège (SC-004).
- [ ] `prefers-reduced-motion` : contenu complet, statique, lisible (FR-012).
- [ ] Un seul H1 (= `heroLabel`) ; hiérarchie de titres cohérente (FR-014).
- [ ] Sans saisie CMS : page complète via défauts maquette (SC-006).
- [ ] Édition d'un texte/visuel en Studio → reflété après revalidation (SC-005).
- [ ] Navbar lisible au-dessus du hero (tonalité), retour-en-haut fonctionnel (FR-010/015).

## Définition de « terminé »

Toutes les exigences FR-001…FR-016 satisfaites, les critères SC-001…SC-007 vérifiables,
le Constitution Check du plan tenu (2 déviations documentées), et le diff visuel validé
sur les trois formats.
