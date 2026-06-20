# Research — Pages de détail des secteurs (011)

Phase 0 du plan. Résout les points ouverts laissés à la planification par le spec
(`spec.md` → *Hypothèses* : modélisation du contenu, gabarit, responsive, motion, SEO,
tracking). Chaque décision : **Decision / Rationale / Alternatives**.

Toutes les valeurs de design sont lues **hors-ligne** dans le cache Figma
(`.design/scripts/figma.ts read secteurs/<slug>`) — source de vérité (Principe VII).
Nodes desktop : `secteurs/retail 51:3520`, `secteurs/bureau 51:3661`,
`secteurs/residentiel 51:3797`, `secteurs/scenographie 51:3929`.

---

## D1 — Modélisation du contenu : un nouveau type `sectorDetail`, 4 documents par slug

**Decision** : Créer **un nouveau type de document Sanity `sectorDetail`** (NON-singleton),
instancié en **4 documents** distingués par un champ `slug`
(`retail` · `bureau` · `residentiel` · `scenographie`). On NE réutilise PAS les objets
`sector` embarqués dans le singleton `sectorsPage` (feature 009).

**Rationale** :
- Le schéma `sectorsPage` (`src/sanity/schemas/documents/sectorsPage.ts:16-18`) note
  **explicitement** : « les secteurs y sont des listes ordonnées présentationnelles, et **les
  pages de détail des secteurs sont des features distinctes avec leur propre modèle** ».
- Le contenu d'une page de détail (hero, intro, enjeux, contraintes, argument, 2 citations,
  SEO) est bien plus riche que l'objet `sector` de la page index (`label`/`promise`/`href`/
  `image`). Ce sont des entités différentes.
- 4 documents par slug est l'idiome Sanity pour un gabarit décliné : routing
  `*[_type=="sectorDetail" && slug.current==$slug][0]`, `generateStaticParams` sur les 4 slugs,
  édition autonome **par secteur** (FR-010, SC-006 : « les autres secteurs restent inchangés »).

**Alternatives rejetées** :
- *Document unique multi-secteurs (un singleton avec un array de 4)* : couple l'édition des 4
  secteurs dans un seul document (revalidation/édition non isolées par secteur), et complexifie
  le mapping slug→contenu. Contraire à SC-006.
- *Réutiliser les objets `sector` de `sectorsPage`* : modèle présentationnel trop pauvre, et le
  schéma 009 l'interdit explicitement.

---

## D2 — Routing : segment dynamique `/univers/[slug]` + `generateStaticParams` + `notFound()`

**Decision** : Une route dynamique **`src/app/(site)/univers/[slug]/page.tsx`**.
- `generateStaticParams()` retourne les 4 slugs connus → SSG des 4 pages (perf, SC-009).
- `generateMetadata({ params })` lit le SEO du secteur (FR-017).
- Slug inconnu → la requête GROQ renvoie `null` → `notFound()` (page 404 claire, FR-009 / SC-008).
  Le `app/not-found.tsx` existant (ou celui du groupe `(site)`) fournit le rendu « introuvable ».

**Rationale** : c'est exactement la destination déjà câblée par les boutons « en savoir plus »
de la page Univers (`src/content/sectorsPage.ts` : `href: "/univers/retail"`, …). Aucune
modification de la feature 009 n'est nécessaire — livrer ces routes rend les boutons
fonctionnels (FR-002, SC-001 : 0 lien mort). Les slugs sont **sans accent**, déjà fixés (009).

**Alternatives rejetées** : 4 routes statiques en dur (`/univers/retail/page.tsx`, …) →
duplication du gabarit, contraire à FR-008 (gabarit unique) et au Principe IV.

---

## D3 — Composants design system : réutiliser, étendre, ajouter

Inventaire vérifié (`src/design-system/index.ts`, lecture des composants). Le gabarit Figma
se mappe ainsi :

| Section maquette | Composant | Action |
|---|---|---|
| Hero bi-ton (panel sombre + image) | **`PageHero` variant `split`** | **Étendre** : slot breadcrumb |
| Titre du secteur (outline/fill) | `PageHero` (H1 outline+fill, déjà) | Réutiliser |
| Eyebrow 2 lignes | `PageHero.eyebrow` (`whitespace-pre-line`) | Réutiliser |
| Fil d'ariane « univers / X » | **`Breadcrumb`** | **Ajouter au DS** |
| Titres de section (« Les enjeux du retail ») | `SectionTitle` (outline/fill) | Réutiliser |
| Intro (statement + body + cluster d'images) | composition page (Image + `BrandText`) | Page-local |
| Liste « enjeux » (items + filets) | composition page (`SectionTitle` + filets) | Page-local |
| « Contraintes terrain » (nuage de chips) | **`Pill`/`Tag`** (3 emphases) | **Ajouter au DS** |
| Argument (statement centré sur panneau crème) | `Pullquote` sur panneau `bg-cream` | Réutiliser + compo |
| Citations (image + voile + quote + attribution) | **`Testimonial`** | **Ajouter au DS** |
| Footer + CTA + bouton retour-haut | `<Footer/>` + `ScrollTopMount` (montés dans `(site)/layout.tsx`) | Réutiliser tels quels |

**Decision — 3 ajouts au DS** (Principe X : un composant UI réutilisable vit dans
`src/design-system/`, jamais réimplémenté ad hoc) :

1. **`Breadcrumb`** — `items: { label, href? }[]`, séparateur `/`, casse de marque via
   `BrandText`, couleur héritée (`currentColor`) pour la tonalité (blanc sur le panel sombre du
   hero). Le segment « univers » est un lien vers `/univers` (FR-004, scénario 1.6).
2. **`Testimonial`** — image de fond + voile `bg-ink/25` (maquette), gros texte de citation
   (`text-subtitle`, `BrandText`), guillemets décoratifs, attribution **optionnelle**
   (FR-007 ; pas de bloc vide si absente — cas limite « citation sans attribution »). Variantes
   via `tailwind-variants`.
3. **`Pill`** (chip non-interactif) — `label` + `emphasis: 'outline' | 'ink' | 'accent'`
   (= contour / fond `ink` / fond `estuaire`), rayon plein (`radius=61` maquette → token rounded),
   `text-body` `font-display`. L'emphase est **éditoriale** (le rythme visuel filled/outline de la
   maquette est piloté par le contenu, pas codé en dur).

**Étendre `PageHero`** : ajouter un slot optionnel `breadcrumb?: ReactNode` rendu en haut de la
cartouche (sous la navbar, au-dessus de l'eyebrow). N'altère aucun appelant existant (prop
optionnelle). C'est la seule modification d'un composant DS existant.

**Rationale** : `Breadcrumb`, `Testimonial`, `Pill` sont des primitives d'UI réutilisables
(fil d'ariane, témoignage, étiquette) → Principe X impose le DS. La liste d'enjeux et le cluster
d'images intro sont des **compositions de page** (agencement, pas un composant réutilisable) →
restent dans la page (Principe IV, pas de sur-abstraction).

**Alternatives rejetées** : réimplémenter chips/citations en local (viole Principe X) ;
ajouter un `CalloutBox`/`RuledList` au DS pour les enjeux (sur-abstraction d'un agencement
mono-usage, Principe IV).

---

## D4 — Tokens & valeurs de design (aucune valeur en dur — Principe X)

**Decision** : tout vient des tokens `@theme` (`src/app/globals.css`) et de l'échelle
typographique. Correspondances lues sur la maquette :

- Couleurs : `#ffffff`→`paper`, `#0e1215`→`ink`, `#eee6dc`→`cream`, `#003787`/`#013788`→`estuaire`.
- Type : titres 75px→`text-title`, statements 50px→`text-subtitle`, eyebrow/leads 35px→`text-lead`,
  body 24-25px→`text-body`, breadcrumb/captions 16px→`text-caption` ; tiers `-sm` en mobile.
- Familles : `Montserrat Alternates`→`font-display` (lowercase), `Montserrat`→`font-sans`
  (UPPERCASE) ; règle de casse via `BrandText`.
- Rayons : chips `radius=61` et boutons → utilitaire `rounded-full`.

Le motif (`fill=[PATTERN]`) du panneau crème de l'ARGUMENT et le voile 25% des citations sont
des détails à vérifier au diff ; le motif, s'il n'est pas reproductible en tokens/utilitaires,
sera traité comme texture décorative (asset léger ou omission documentée), jamais comme couleur
de marque codée en dur.

---

## D5 — Responsive : mobile-first, adapté par breakpoint (desktop = seule maquette)

**Decision** : base = mobile, `md:` = tablette, `lg:` = desktop (convention DS). Seul le desktop
a une frame Figma (FR-011, *Hypothèses*) → le diff pixel-perfect ne s'applique qu'au desktop
(SC-003) ; tablette/mobile sont vérifiés sur cohérence + lisibilité.

- Hero `split` : sur mobile, cartouche (avec breadcrumb) en haut puis image dessous (déjà géré
  par `PageHero`). Hauteur dynamique `min-h-svh` (dimension dynamique autorisée, Principe VII).
- Intro : grille 2 colonnes desktop (images / texte) → empilement mobile.
- Contraintes : nuage de chips en `flex-wrap`.
- Citations : image pleine largeur + texte centré, marges réduites en mobile.

**Rationale** : conforme au Principe VII (responsive par breakpoint) et à la convention du DS
(tiers `text-*-sm`, breakpoints 390/768/1024).

---

## D6 — Motion : cinématiques sobres requises (FR-014/015)

**Decision** : appliquer des **animations cinématiques discrètes au scroll**, gouvernées par la
skill **`estuaire-motion`**, chargée avant l'implémentation des animations :
- révélation des **titres par ligne** (line-mask) sur les `SectionTitle` et le H1 du hero ;
- **reveal-on-scroll** des blocs (`[data-reveal-clip]` via `Parallax`, déjà dans le repo) ;
- **parallaxe** sur les deux images de fond des citations — la maquette les nomme littéralement
  « image parallax fixe » → le mouvement est *sourcé par le design* ;
- une seule motion focale à la fois (texte = ancre statique).
- **`prefers-reduced-motion`** : rendu statique complet et lisible (FR-015, SC-005) — assuré par
  `usePrefersReducedMotion` / le no-op de `Parallax` / `SmoothScroll` déjà en place.

**⚠️ Tension à valider** : les pages livrées récentes **Univers** et **Expertises** ont été
expédiées **statiques** « à la demande du propriétaire » (commentaire en tête de
`(site)/univers/page.tsx` ; ADR 0016/0017). Ce spec, en revanche, **exige** la motion
(FR-014, FR-015) et la maquette explicite la parallaxe des citations. **Le spec faisant autorité
pour cette feature**, on planifie la motion (sobre, justifiée par la maquette). À confirmer par
Pierre en revue : s'il préfère l'homogénéité statique des pages sœurs, retirer la motion est
trivial (les primitives sont opt-in). Décision tracée pour l'ADR 0018.

**Alternatives** : page 100% statique (homogène avec Univers/Expertises mais contraire à FR-014) ;
motion riche (contraire à la sobriété `estuaire-motion`).

---

## D7 — SEO (FR-017)

**Decision** : par secteur, `seoMetaTitle` / `seoMetaDescription` / `seoOgImage` éditables (CMS),
repli sur les valeurs de maquette. **H1 unique** = le titre du secteur (dans le hero, déjà porté
par `PageHero`). Hiérarchie : H1 hero → H2 sur les titres de section (enjeux, contraintes,
argument, citations). `generateMetadata` lit le SEO du secteur (pattern identique à
`(site)/univers/page.tsx:26-39`). Open Graph image via `mapImage(seoOgImage, 1200)`.

**Rationale** : aligné sur le pattern SEO déjà en place sur toutes les pages (champs plats
`seoMetaTitle`/`seoMetaDescription`/`seoOgImage`, pas d'objet `seo` réutilisable — convention
constatée).

---

## D8 — Tracking Umami (Principe VI — décision explicite obligatoire)

**Decision** : **aucun nouvel événement custom** pour les pages de détail de secteur.
- Le pageview automatique Umami couvre l'arrivée sur chaque page (mesure du trafic par secteur
  via l'URL `/univers/<slug>`).
- L'appel à l'action de conversion est le bouton **« contact »** du **footer global**, déjà
  instrumenté (composant existant) — réutilisé, pas redéfini.
- Le clic « en savoir plus » qui **mène** à ces pages est déjà tracé côté Univers
  (`ctaUmamiEvent="sector_cta_click"` avec `{ sector }`).
- Le fil d'ariane « univers » est une navigation de retour, pas une conversion → non tracé.

**Rationale** : Principe VI veut une *décision* explicite, pas une instrumentation systématique.
Les interactions porteuses de valeur (entrée sur la page, conversion contact) sont déjà mesurées
en amont/aval ; ajouter des événements ici polluerait les données sans gain. Absence de tracking
= choix documenté, pas oubli.

---

## D9 — Seeds & contenu par défaut (Principe IX)

**Decision** :
- Copie de maquette partagée dans **`src/content/sectorDetail.ts`** — une entrée par secteur
  (source unique : seed + repli front, jamais dupliquée).
- **4 fichiers de seed** `src/sanity/seed/documents/sectorDetail.<slug>.seed.ts`, typés
  `defineSeed<SectorDetail>` contre le type généré, `_id` unique par secteur
  (`sectorDetail-retail`, …), `slug.current` = le slug.
- Images de seed dans **`seed-assets/sectorDetail/<slug>/`** (committées, hors `public/`),
  déclarées via `image(path, alt)`. 6 images/secteur (hero, 3 intro, 2 citations).
- Validation `npm run seed -- --check` (champs required + assets présents) avant `npm run seed`.
- Enregistrement des 4 seeds dans `src/sanity/seed/registry.ts`.

**Rationale** : conforme au Principe IX et aux conventions constatées
(`footer.seed.ts`, `sectorsPage.seed.ts`, `src/content/sectorsPage.ts`). TypeGen génère le type
`SectorDetail` après commit du schéma (`npm run typegen`).

---

## D10 — Contenu de référence par secteur (lu sur le cache Figma)

Confirmé que les **4 secteurs partagent le gabarit** (mêmes sections, même ordre ; seuls contenu
et visuels varient — FR-008). Exemple Retail (`51:3520`) :
- **Eyebrow** : « Retail design & agencement / de boutiques sur-mesure »
- **Titre** : « Des points / de vente à » (outline) / « votre image. » (fill)
- **Intro statement** : « Le lien avec une marque se vit d'abord à travers ses points de vente… »
- **Enjeux** (titre « Les enjeux / du retail ») : ouverture à date fixe · expérience vendeurs &
  visiteurs · standards de marque · mise en valeur de l'offre produits.
- **Contraintes** (titre « Les contraintes / terrain à anticiper ») : ~8 chips (accès réglementés,
  délais maîtrisés, lumière & électricité, normes & conformité, dimensions produits, coordination
  chantier, maintenance réactive, adaptation multi-sites) avec emphases mixtes.
- **Argument** : « Nous maîtrisons aussi bien le cahier des charges de la marque que ceux des
  grands magasins… »
- **Citations** : 2 (Delphine Tipré, architecte d'intérieur, Clarins · Antoine Bloudeau,
  architecte DE, Parella).

Les valeurs complètes des 4 secteurs sont lues node par node au moment du build (skill
`estuaire-pixel-perfect`), pré-remplies dans `src/content/sectorDetail.ts`.

---

## Constitution Check — résultat

Aucune violation. Détail dans `plan.md` (section Constitution Check). Complexity Tracking : vide.
Companion prévu : **ADR 0018 — sector-detail-pages build decisions**.
