# Quickstart — Pages de détail des secteurs (011)

Ordre d'implémentation et commandes. Détail des tâches : `tasks.md` (généré par
`/speckit.tasks`). Dev : `http://011-sector-detail-pages.estuaire.localhost:1355`
(`PORTLESS=0 npm run dev` → `localhost:3000`).

## Prérequis
- Skills à charger au bon moment : **`estuaire-pixel-perfect`** (avant de construire chaque
  section), **`estuaire-motion`** (avant d'animer), **`estuaire-pixel-review`** (sign-off final).
- Valeurs de design lues hors-ligne : `npm run figma -- read secteurs/<slug>` (jamais devinées).

## Séquence

1. **Schéma** `src/sanity/schemas/documents/sectorDetail.ts` (type + objets `constraintChip`,
   `testimonial`) → enregistrer dans `src/sanity/schemas/index.ts`.
2. **TypeGen** : `npm run typegen` → `SectorDetail` dans `src/sanity.types.ts` (commité).
3. **Desk structure** (optionnel) : entrée « Univers — secteurs » dans `src/sanity/structure.ts`
   (ne PAS marquer singleton).
4. **Contenu de maquette** `src/content/sectorDetail.ts` (4 secteurs — copie lue node par node
   sur le cache Figma). Source unique seed + repli front.
5. **Composants DS** : `Breadcrumb`, `Pill`, `Testimonial` (+ slot `breadcrumb` dans `PageHero`) ;
   exporter depuis `src/design-system/index.ts`. Tokens uniquement (Principe X).
6. **Query + mapping** : `SECTOR_DETAIL_QUERY` + `SECTOR_DETAIL_SLUGS_QUERY` dans
   `src/lib/sanity/queries.ts` ; `getSectorDetailProps(slug)` + `getSectorDetailSlugs()` dans
   `src/lib/sanity/sectorDetail.ts` (replis + `mapImage`).
7. **Route** : `src/app/(site)/univers/[slug]/page.tsx` — `generateStaticParams`,
   `generateMetadata`, `notFound()`, tonalité de nav, composition des sections (hero → intro →
   enjeux → contraintes → argument → citations).
8. **Motion** (skill `estuaire-motion`) : line-mask titres, reveal-on-scroll, parallaxe des
   citations ; `prefers-reduced-motion` neutralise tout.
9. **Seeds** : `npm run seed:scaffold -- sectorDetail` puis dériver 4 fichiers
   `sectorDetail.<slug>.seed.ts` (`_id`/`slug` uniques, images `seed-assets/sectorDetail/<slug>/`)
   → enregistrer dans `src/sanity/seed/registry.ts`.
10. **Seed dev** : `npm run seed -- --check` (gate) puis `npm run seed`.
11. **Lint/build** : `npm run lint` ; `npm run build`.

## Vérification (mappée sur les critères de succès)

- **SC-001 / FR-002** : depuis `/univers`, les 4 boutons « en savoir plus » ouvrent leur page
  sans 404.
- **SC-008 / FR-009** : `/univers/inconnu` → page « introuvable » claire.
- **SC-007 / FR-010** : avant saisie, chaque page est complète (replis maquette).
- **SC-003 / FR-012** : diff pixel-perfect **desktop** section par section (skill
  `estuaire-pixel-review`) contre les renders Figma (`51:3520/3661/3797/3929`) ; tablette/mobile
  vérifiés sur cohérence + lisibilité.
- **SC-005 / FR-015/016** : `prefers-reduced-motion` → rendu statique complet ; parcours clavier
  sans piège (fil d'ariane, chips, citations, CTA footer, retour-haut).
- **SC-006** : éditer un champ d'un secteur dans le Studio → reflété sur cette page seule après
  revalidation.
- **SC-009** : LCP < 2,5 s mobile, pas de CLS notable (LQIP/blur, dimensions réservées).
