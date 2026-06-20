# 0018 — Pages de détail des secteurs : décisions de construction

- **Date** : 2026-06-19
- **Feature** : `011-sector-detail-pages`
- **Statut** : accepté
- **Liens** : [[decisions/0016-sectors-page-build-decisions]], [[decisions/0017-expertises-page-build-decisions]],
  [[decisions/0005-connected-components-for-global-sanity-content]],
  [[decisions/0006-schema-derived-types-and-typed-seeds]], [[post-mortems/0010-reseed-not-reflected-cdn-and-next-fetch-cache]],
  [[post-mortems/0011-portless-route-404-and-worktree-gate]]

Pages de détail des 4 secteurs sous `/univers` (retail, bureau, résidentiel, scénographie) —
destinations des boutons « en savoir plus » de la page Univers (feature 009). Spec :
`specs/011-sector-detail-pages/`.

## D1 — Modèle Sanity dédié : `sectorDetail` (non-singleton, 4 docs par slug)

Nouveau type `sectorDetail`, 4 documents distingués par `slug`, **pas** réutilisation des objets
`sector` embarqués dans `sectorsPage` (009) — leur schéma note explicitement que les pages de
détail relèvent d'un modèle distinct. Édition autonome **par secteur** (SC-006), routing par
`slug.current`. Objets imbriqués : `constraintChip` (`label` + `emphasis`), `testimonial`
(`quote` + `attribution?` + `image`). Copie maquette unique dans `src/content/sectorDetail.ts`,
seeds typés `defineSeed<SectorDetail>` via un builder partagé `sectorDetail.build.ts`.

## D2 — 3 composants ajoutés au design system (Principe X)

- **`Breadcrumb`** — fil d'ariane « univers / <Secteur> » (segment « univers » → `/univers`),
  `currentColor`, `aria-current`, casse de marque.
- **`Pill`** — étiquette non-interactive du nuage « contraintes terrain », 3 emphases
  (`outline` / `ink` / `accent`) via `tailwind-variants`, tokens uniquement.
- **`Testimonial`** — bande citation : image + voile `bg-ink/25` + citation `text-subtitle`
  brand-casée + attribution optionnelle + marques de citation décoratives ; hook `data-parallax`.

`PageHero` étendu d'un slot optionnel `breadcrumb` (rétro-compatible — aucun appelant existant
modifié). La liste « enjeux » (filets) et le cluster d'images d'intro restent des **compositions
de page** (agencements mono-usage, pas des primitives — Principe IV).

## D3 — Rendu dynamique + ISR, PAS de `generateStaticParams` (déviation au plan)

Le plan visait un SSG via `generateStaticParams`. **Abandonné** : `sanityFetch` (defineLive) lit
le cookie de perspective → la page est **intrinsèquement dynamique**, comme toutes les autres
pages du site. Forcer le prérendu au build déclenche un fetch Sanity au build, qui :
1. échoue localement (l'env Sanity n'est pas chargé par `next build` — limitation **pré-existante**,
   commune à toutes les pages : `/expertises` échoue à l'identique sans env ; `--env-file` est
   refusé dans les workers de build) ;
2. en prod, dépendrait de l'état du projet Sanity *au moment du build* (les docs sont seedés par
   un job CI séparé).

La route est donc **dynamique + ISR-cachée** par `sanityFetch` (tags de cache, revalidation par
webhook Sanity — Principe I). Slug inconnu → `getSectorDetailProps` renvoie `null` → `notFound()`
à l'exécution (FR-009). Les éditions de contenu se reflètent par revalidation, pas par rebuild.

## D4 — Motion sobre, justifiée par la maquette (tension à valider)

Les pages sœurs **Univers** (016) et **Expertises** (017) ont été livrées **statiques** « à la
demande du propriétaire ». Ce spec **exige** la motion (FR-014/015) et la maquette nomme
littéralement les fonds de citation « image parallax fixe ». Compromis retenu : **une seule
motion focale, design-sourcée** — la parallaxe scrubbée des fonds de citation (via le primitive
`Parallax` existant, image légèrement sur-dimensionnée pour ne pas exposer les bords), inerte sous
`prefers-reduced-motion`. La chorégraphie complète (révélation des titres par ligne, reveals au
scroll de chaque bloc) est **différée** — à trancher avec Pierre : homogénéité statique des pages
sœurs **ou** cinématiques complètes. Retrait/ajout trivial (la motion est opt-in).

## D5 — Tracking Umami : aucun nouvel événement (Principe VI)

Décision explicite : le pageview auto couvre l'entrée par secteur (`/univers/<slug>`) ; la
conversion est le bouton « contact » du footer global, déjà instrumenté ; le clic « en savoir
plus » est déjà tracé en amont (`sector_cta_click`, 009). Le fil d'ariane est une navigation de
retour, non tracée.

## D6 — Images de contenu (6 par secteur)

hero · intro principal (grand) · intro portrait · intro carré · 2 fonds de citation. (La 7ᵉ image
du frame Figma — le visuel du CTA — appartient au footer global.) Sources de maquette copiées dans
`seed-assets/sectorDetail/<slug>/`, uploadées par le runner (dédup par hash de contenu).

## Pièges rencontrés (rappels de post-mortems)

- **Re-seed non reflété en dev** (post-mortem 0010) : après seed, les images ne s'affichaient pas
  — le fetch-cache Next sur disque (`.next/cache`) avait mémorisé le résultat *vide* d'avant le
  seed. La donnée était fraîche à la source (CDN + live API confirmés). Fix : `rm -rf .next` + start
  **atomique** (aucun serveur intermédiaire ne doit repeupler le cache).
- **Route portless 404** (post-mortem 0011) : redémarrages multiples du dev server → route nommée
  perdue ; un `npm run dev` propre la ré-enregistre.

## Suivi

- **Pixel-review** : Retail vérifié au desktop (rendu fidèle ; géométrie fine de l'intro et marques
  de citation décoratives à affiner). Diff complet par secteur × breakpoint = **gate restant**
  (skill `estuaire-pixel-review`) — déclaré UNVERIFIED tant qu'il n'est pas bouclé.
- **Build de production** : compile OK + tsc/lint verts ; le prérendu statique des pages
  Sanity-dépendantes ne peut être validé localement (env absent) → validé en CI/Coolify.
