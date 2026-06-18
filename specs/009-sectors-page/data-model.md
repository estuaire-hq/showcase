# Phase 1 — Modèle de données

Entités du contenu de la page « Univers » (secteurs). Le **schéma Sanity est la source de
vérité** (Principe IX) : les types TypeScript sont **générés** (`npm run typegen` →
`src/sanity.types.ts`), jamais tapés à la main. Ce document décrit la **forme cible** ; les
*valeurs* (copie, libellés) sont lues sur la maquette au build (node `51:3386`) et vivent
une seule fois dans `src/content/sectorsPage.ts`.

## Entité : `sectorsPage` (singleton CMS)

- **Type** : document Sanity, `_id` fixe `"sectorsPage"` (singleton via `structure.ts` +
  `SINGLETONS`).
- **Édition** : un seul écran Studio, organisé en `groups` (onglets).
- **Repli** : chaque champ texte a une valeur par défaut maquette (`@/content/sectorsPage.ts`)
  rendue si le singleton n'est pas saisi (SC-006) ; les images viennent du seed.

### Groupes (onglets Studio)

`hero` (défaut) · `intro` · `sectors` · `keyFigures` · `seo`

### Champs

| Champ | Type Sanity | Groupe | Obligatoire | Défaut (repli) | Notes |
|-------|-------------|--------|:-----------:|----------------|-------|
| `heroEyebrow` | `text` (rows 2) | hero | — | « Agencement sur mesure\ndu retail à vos bureaux » | Sur-titre de l'encart (2 lignes, `\n`). → `PageHero.eyebrow`. |
| `heroTitleOutline` | `text` (rows 2) | hero | ✅ | « Architectes et designers, » | Lignes de titre **en contour** (`OutlineText`). Partie du **H1** (FR-014). → `PageHero.titleOutline`. |
| `heroTitleFill` | `text` (rows 2) | hero | ✅ | « nous concrétisons vos projets avec soin. » | Lignes de titre **pleines**. Partie du **H1**. → `PageHero.titleFill`. |
| `heroImage` | `image` (`hotspot`, `alt`) | hero | — | seed-asset | Visuel du hero, à droite du panneau sombre (`51:3402`). |
| `introStatement` | `text` | intro | — | maquette | Phrase de positionnement multisectoriel (`text-subtitle`). |
| `introText` | `text` | intro | — | maquette | Texte d'introduction (3 paragraphes, `\n\n` significatif). |
| `introImage` | `image` (`hotspot`, `alt`) | intro | — | seed-asset | Visuel d'appui, sur le panneau crème à gauche (`51:3449`). |
| `sectors` | `array<sector>` | sectors | — (def. 4) | 4 secteurs maquette | Liste **ordonnée** (FR-004) ; l'ordre du tableau = rang d'affichage. Voir objet ci-dessous. |
| `keyFigures` | `array<keyFigure>` | keyFigures | — (def. 4) | 4 chiffres maquette | Liste **ordonnée** (FR-006). Voir objet ci-dessous. |
| `seoMetaTitle` | `string` | seo | — | maquette / « Univers » | Titre de page (FR-014). |
| `seoMetaDescription` | `text` | seo | — | maquette | Meta-description (FR-014). |
| `seoOgImage` | `image` (`alt`) | seo | — | seed-asset | Image de partage social (FR-014). |

### Objet : `sector` (membre de `sectors`)

| Champ | Type | Obligatoire | Défaut (maquette) | Notes |
|-------|------|:-----------:|-------------------|-------|
| `label` | `string` | ✅ | Retail / Bureau / Résidentiel / Scénographie | Titre du secteur, rendu `BrandText` 75px (`text-title`). |
| `promise` | `text` | — | phrase maquette | Phrase de promesse (sous le trait, `text-lead`/`text-subtitle` Montserrat Alternates). |
| `href` | `string` | — | `/univers/<slug>` | Destination « en savoir plus » (FR-005). Route de détail prévue (404 temp OK). Slugs : `retail`, `bureau`, `residentiel`, `scenographie`. |
| `image` | `image` (`hotspot`, `alt`) | — | seed-asset | Visuel **plein-cadre** de la bande, sous voile (`51:3454/3468/3481/3494`). |

- **Préview Studio** : `title` = `label`, `subtitle` = `href`, `media` = `image`.
- **Ordre** : l'ordre du tableau EST l'ordre d'affichage (Scénario 3 §3) ; aucune
  numérotation persistée — le **rang d'affichage** (la pastille « 01/02… » de la maquette
  si présente) est dérivé de l'index par le rendu, l'éditeur réordonne sans rien casser.
- **Slug / tracking** : le slug Umami (`data-umami-event-sector`) est dérivé du dernier
  segment de `href` (ex. `/univers/retail` → `retail`) — pas de champ dédié.

### Objet : `keyFigure` (membre de `keyFigures`)

| Champ | Type | Obligatoire | Défaut (maquette) | Notes |
|-------|------|:-----------:|-------------------|-------|
| `value` | `string` | ✅ | « 15 ans d'expérience » / « +150 projets par an » / « Partenaires locaux » / « Atelier multimatériaux » | Intitulé fort (chiffre ou promesse), `text-title` (`BrandText`). |
| `support` | `text` | — | phrase d'appui maquette | Phrase d'appui (`text-lead`, Montserrat 600). |

- **Préview Studio** : `title` = `value`, `subtitle` = `support`.
- **Valeurs éditoriales** (pas des compteurs calculés — Hypothèse de la spec).

### Image partagée (`imageField`)

Réutilise le helper `imageField(name, title, group?)` (`src/sanity/schemas/fields.ts`) :
`type: "image"`, `options.hotspot`, champ `alt` requis (accessibilité + SEO). `group` omis
pour les images imbriquées dans un objet (`sector`) — un `group` ne peut référencer qu'un
groupe défini sur le même type (sinon crash Studio, cf. précédent `homePage.ts`/`aboutPage.ts`).

## Entité (non-CMS) : copie maquette `sectorsPageContent`

- **Fichier** : `src/content/sectorsPage.ts` — **source unique** de la copie (Principe IX),
  importée « vers le bas » par le seed (écrit dans Sanity) **et** le repli front
  (`getSectorsPageProps` DEFAULTS, rendu si Sanity vide — SC-006).
- **Texte uniquement** (pas d'images : les visuels viennent du seed, uploadés vers Sanity —
  ADR 0004). `\n` significatif (sauts de ligne maquette → `whitespace-pre-line`).
- Forme : un objet miroir des champs texte ci-dessus — `heroEyebrow`, `heroTitleOutline`,
  `heroTitleFill`, `introStatement`, `introText`, `sectors: [{label, promise, href}]` (×4),
  `keyFigures: [{value, support}]` (×4), `seoMetaTitle`, `seoMetaDescription`.

### Valeurs maquette (lues sur `51:3386`)

- **Hero** — eyebrow « Agencement sur mesure » / « du retail à vos bureaux » ; titre contour
  « Architectes et designers, » + plein « nous concrétisons vos projets avec soin. ».
- **Intro** — statement « Grâce à notre périmètre d'intervention multisectoriel, nous faisons
  preuve d'agilité et savons appréhender des univers variés. » ; texte 3 paragraphes
  (« Chaque projet est unique… » / « Grâce à notre périmètre… » / « Du retail aux espaces de
  travail, de la scénographie aux projets résidentiels, nous adaptons nos méthodes avec le
  même engagement. »).
- **Secteurs** —
  - **Retail** : « Nous anticipons les cahiers des charges et nous adaptons aux contraintes
    opérationnelles de chaque point de vente. » → `/univers/retail`.
  - **Bureau** : « Nous mettons en place des solutions innovantes visant à faciliter la
    collaboration au travail. » → `/univers/bureau`.
  - **Résidentiel** : « Nous accompagnons chaque particulier avec une attention particulière
    pour répondre au mieux à leurs envies. » → `/univers/residentiel`.
  - **Scénographie** : « Nous trouvons des solutions de montage et démontage efficientes et
    assurons le stockage d'une année à l'autre. » → `/univers/scenographie`.
- **Infos clés** —
  - « 15 ans d'expérience » → « Une excellence acquise à l'occasion de projets exigeants. »
  - « +150 projets par an » → « Une organisation capable de garantir qualité et réactivité. »
  - « Partenaires locaux » → « Un réseau de partenaires fiables à moins de 100 km. »
  - « Atelier multimatériaux » → « Une maîtrise technique complète, du prototype à la
    réalisation finale. »

## Relations & invariants

- `sectorsPage` est **autonome** : aucune référence à un autre document. Les secteurs et
  chiffres sont des **objets embarqués** (pas de documents/références — voir `research.md` §2).
- `sector.href` pointe vers `/univers/<slug>` (route de détail prévue ; 404 temporaire
  accepté — FR-005). Les pages de détail sont des features distinctes (Hors périmètre).
- La mise en page « secteurs » et « infos clés » ne casse pas si la liste compte 3 ou 5
  entrées (cas limite spec) : le rendu mappe la liste, sans nombre figé en dur.
- Revalidation : la query déclare le tag parent `sanity` (via `sanityFetch`/`defineLive`) ;
  le webhook `revalidateTag("sanity")` invalide la page à toute édition (aucune config
  par-document à ajouter).
- TypeGen : après création/maj du schéma, `npm run typegen` régénère `SectorsPage` +
  `SECTORS_PAGE_QUERYResult` (consommés par `sectorsPage.ts`). Aucun type tapé à la main.
