# Phase 1 — Modèle de données

Entités du contenu des sous-pages d'expertise. Le **schéma Sanity est la source de vérité**
(Principe IX) : les types TypeScript sont **générés** (`npm run typegen` →
`src/sanity.types.ts`), jamais tapés à la main. Ce document décrit la **forme cible** ; les
*valeurs* (copie, libellés, les 6 intitulés d'engagement) sont lues sur les nodes Figma complets
au build (agencement `51:3008` / `87:6762` / `87:6964` ; mobiliers `51:3134` ; présentoirs
`51:3259`) et vivent une seule fois dans `src/content/expertiseSubpages.ts`. Le nombre exact de
visuels par section et les variations de mise en page sont confirmés au build (Principe VII).

## Entité : `expertiseSubpage` (document CMS, multi-instances)

- **Type** : document Sanity `expertiseSubpage` — **PAS un singleton**. **Trois instances**, une
  par expertise, avec des `_id` stables dérivés du slug :
  `expertiseSubpage.agencement-sur-mesure`, `expertiseSubpage.mobiliers-sur-mesure`,
  `expertiseSubpage.presentoirs-sur-mesure`.
- **Clé de routage** : champ `slug` (`slug.current`) — résolu par la route dynamique
  `(site)/expertises/[expertise]`.
- **Édition** : un écran Studio par document, organisé en `groups` (onglets). Les 3 documents
  sont listés sous une entrée desk « Sous-pages d'expertise » (`structure.ts`).
- **Indépendance** : éditer un document n'affecte pas les deux autres (SC-006).
- **Repli** : chaque champ texte a une valeur par défaut maquette
  (`@/content/expertiseSubpages.ts`, indexée par slug) rendue si le document n'est pas saisi
  (SC-007) ; les images viennent du seed.

### Groupes (onglets Studio)

`hero` (défaut) · `intro` · `responsable` · `engagements` · `caseStudy` · `seo`

### Champs

| Champ | Type Sanity | Groupe | Obligatoire | Défaut (repli) | Notes |
|-------|-------------|--------|:-----------:|----------------|-------|
| `title` | `string` | hero | ✅ | nom de l'expertise | Libellé admin (preview Studio). Ex. « Agencement sur mesure ». |
| `slug` | `slug` (source `title`) | hero | ✅ | `agencement-sur-mesure` … | Clé de route. Valeurs figées par les CTA de la 008. |
| `breadcrumb` | `string` | hero | — | « univers / agencement sur-mesure » | Libellé du fil d'Ariane (segments séparés par `/`). Lien parent → `/expertises` (FR-018). |
| `heroEyebrow` | `string` | hero | — | maquette | Sur-titre de l'encart, séparé par un trait (`BrandText`). Confirmé au build. |
| `heroTitleOutline` | `text` (rows 2) | hero | — | maquette | Lignes du H1 en **contour** (`OutlineText`). |
| `heroTitleFill` | `text` (rows 2) | hero | ✅ | « Notre vision\ndu métier d'agenceur » | Ligne(s) pleine(s) du H1 (`BrandText`). **Partie obligatoire du H1 unique** (FR-014). |
| `heroImage` | `image` (`hotspot`, `alt`) | hero | — | seed-asset | Visuel plein cadre du hero (`02/ SLIDER`). |
| `introStatement` | `text` (rows 3) | intro | — | « Des espaces conçus dans leur ensemble et jusque dans les moindres détails. » | Phrase phare → `Pullquote`. (mobiliers : « Des mobiliers pour tous les goûts ».) |
| `introText` | `text` (rows 8) | intro | — | maquette | Texte d'introduction au métier. |
| `introImage` | `image` (`hotspot`, `alt`) | intro | — | seed-asset | Visuel d'appui. Nombre/position (et demi-fond bleu agencement) confirmés au build. |
| `responsableStatement` | `text` (rows 3) | responsable | — | « Un seul et même responsable de A à Z. » | Phrase d'engagement de synthèse, soulignée d'un trait (FR-005). |
| `responsableImages` | `array<image>` (`hotspot`, `alt`) | responsable | — (def. ≥1) | seed-assets | Visuels d'appui du bloc « responsable ». Cardinalité lue au build. |
| `engagementsTitleOutline` | `string` | engagements | — | « Nos » | Titre de section — contour (`SectionTitle`). |
| `engagementsTitleFill` | `string` | engagements | — | « engagements » | Titre de section — plein. |
| `engagements` | `array<engagement>` | engagements | — (def. 6) | 6 engagements maquette | Liste ordonnée (FR-006). Numéro `01/`…`06/` **dérivé de l'ordre**. Voir objet ci-dessous. |
| `caseStudyTitleOutline` | `string` | caseStudy | — | « Découvrez » | Titre de section — contour. |
| `caseStudyTitleFill` | `string` | caseStudy | — | « notre dernier projet » | Titre de section — plein. (« Découvrez notre dernier projet … » — FR-007.) |
| `caseStudyImage` | `image` (`hotspot`, `alt`) | caseStudy | — | seed-asset | Bande visuelle de la réalisation. |
| `caseStudyProjectTitle` | `string` | caseStudy | — | « L'artisan parfumeur » | Titre du projet en incrustation. |
| `caseStudyMeta` | `array<string>` | caseStudy | — | `["Lieu","Année","Superficie"]` | Ligne meta (lieu · année · superficie), tirets dérivés au rendu. |
| `caseStudyCtaLabel` | `string` | caseStudy | — | « voir la réalisation » | Libellé du bouton. |
| `caseStudyCtaHref` | `string` | caseStudy | — | route de réalisation prévue | Destination (404 temporaire accepté — FR-007). |
| `seoMetaTitle` | `string` | seo | — | maquette / nom de l'expertise | Titre de page (FR-015). |
| `seoMetaDescription` | `text` (rows 3) | seo | — | maquette | Meta-description (FR-015). |
| `seoOgImage` | `image` (`alt`) | seo | — | seed-asset | Image de partage social (FR-015). |

> **Pas de groupe `cta`** : le « BIG FOOTER » de la maquette (bloc CTA + pied de page) est **le
> footer global déjà monté par le shell** (FR-002), pas du contenu de page. Le seul CTA propre à
> la page est le bouton du cas study.

### Objet : `engagement` (membre de `engagements`)

| Champ | Type | Obligatoire | Défaut (repli) | Notes |
|-------|------|:-----------:|----------------|-------|
| `title` | `text` (rows 2) | ✅ | maquette | Intitulé de l'engagement (peut contenir `\n`). |

- **Numérotation** : `01/`…`06/` **dérivée de l'ordre** au rendu (`EngagementsGrid` :
  `String(index + 1).padStart(2, "0")`), jamais stockée — la numérotation reste cohérente si un
  engagement est masqué ou réordonné (cas limite spec « nombre d'engagements »).
- **`preview`** : `title` = `title` (1re ligne).
- **Cardinalité** : 6 dans la maquette ; la grille (`EngagementsGrid`) reste correcte de 1 à 6+.

### Image partagée (`imageField`)

Réutilise le helper `imageField(name, title, group?)` (modèle home/about/expertises) :
`type: "image"`, `options.hotspot`, champ `alt` (`required().warning(...)` — accessibilité +
SEO). `group` **omis** pour les images imbriquées dans un objet (`engagement` n'a pas d'image) ;
pour `responsableImages` (array d'images au niveau document), le `group` est porté par le champ
array, pas par les membres.

## Entité (non-CMS) : copie maquette `expertiseSubpagesContent`

- **Fichier** : `src/content/expertiseSubpages.ts` — **source unique** de la copie (Principe IX),
  importée « vers le bas » par le seed (écrit dans Sanity) **et** le repli front
  (`getExpertiseSubpageProps` DEFAULTS, rendu si Sanity vide — SC-007).
- **Forme** : un objet **indexé par slug** :
  ```ts
  export const expertiseSubpagesContent = {
    "agencement-sur-mesure": { /* champs texte du gabarit */ },
    "mobiliers-sur-mesure":  { /* … */ },
    "presentoirs-sur-mesure": { /* … */ },
  } as const;
  export const EXPERTISE_SLUGS = Object.keys(expertiseSubpagesContent); // generateStaticParams
  ```
- **Texte uniquement** (pas d'images : les visuels viennent du seed, uploadés vers Sanity, comme
  home/about/expertises — ADR 0004). `\n` significatif (sauts de ligne maquette →
  `whitespace-pre-line`). Chaque entrée miroir des champs texte ci-dessus (breadcrumb, eyebrow,
  titres outline/fill du hero et des sections, phrases phares, texte d'intro, tableau
  `engagements` `[{title}]`, cas study `{title, meta[], ctaLabel, ctaHref}`, SEO).

## Relations & invariants

- `expertiseSubpage` est **autonome** : aucune référence à un autre document. Les destinations
  (`caseStudyCtaHref`) sont de simples `string href` vers les routes prévues des réalisations
  (features distinctes ; 404 temporaire accepté — FR-007).
- **Routage** : `generateStaticParams()` ← `EXPERTISE_SLUGS` (3 slugs connus). Le connecteur
  fetche par `slug.current == $slug` ; repli défauts maquette par slug ; `notFound()` si slug
  absent du contenu **et** de Sanity.
- **Revalidation** : la query déclare le tag parent `sanity` (via `sanityFetch`/`defineLive`) ; le
  webhook `revalidateTag("sanity", "max")` invalide les 3 pages à toute édition (aucune config
  par-document à ajouter).
- **TypeGen** : après création/maj du schéma, `npm run typegen` régénère `ExpertiseSubpage` +
  `EXPERTISE_SUBPAGE_QUERYResult` (consommés par `expertiseSubpage.ts`). Aucun type tapé à la
  main.
- **H1 unique** : `heroTitleFill` (+ `heroTitleOutline`) constitue le seul `<h1>` de chaque page ;
  les titres de section sont des `<h2>`, les intitulés d'engagement et le titre de projet du cas
  study des `<h3>` (hiérarchie fixée au build — research §8).
- **Indépendance des contenus** : les 3 documents ne partagent que le *type* (gabarit) ; leurs
  *valeurs* sont distinctes et éditées séparément (SC-006 / Scénario 3).
