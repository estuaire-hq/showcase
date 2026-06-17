# Phase 1 — Modèle de données

Entités du contenu de la page « Nous découvrir ». Le **schéma Sanity est la source de
vérité** (Principe IX) : les types TypeScript sont **générés** (`npm run typegen` →
`src/sanity.types.ts`), jamais tapés à la main. Ce document décrit la **forme cible** ; les
*valeurs* (copie, libellés) sont lues sur la maquette au build (nodes `51:2699` /
`78:4374` / `78:4626`) et vivent une seule fois dans `src/content/aboutPage.ts`. Le nombre
exact de visuels par section et les variations de mise en page des étapes sont confirmés au
build sur les nodes complets (Principe VII).

## Entité : `aboutPage` (singleton CMS)

- **Type** : document Sanity, `_id` fixe `"aboutPage"` (singleton via `structure.ts` +
  `SINGLETONS`).
- **Édition** : un seul écran Studio, organisé en `groups` (onglets).
- **Repli** : chaque champ texte a une valeur par défaut maquette (`@/content/aboutPage.ts`)
  rendue si le singleton n'est pas saisi (SC-006) ; les images viennent du seed.

### Groupes (onglets Studio)

`hero` (défaut) · `intro` · `vision` · `atelier` · `process` · `statement` · `cta` · `seo`

### Champs

| Champ | Type Sanity | Groupe | Obligatoire | Défaut (repli) | Notes |
|-------|-------------|--------|:-----------:|----------------|-------|
| `heroTitle` | `text` | hero | ✅ | maquette | **H1 unique** (FR-016) : titre de l'encart. Rendu `BrandText`. |
| `heroImage` | `image` (`hotspot`, `alt`) | hero | — | seed-asset | Visuel plein cadre du hero (`51:2703`). |
| `introStatement` | `text` | intro | — | maquette | Phrase de positionnement (« La réussite d'un agencement… »). |
| `introText` | `text` | intro | — | maquette | Texte d'introduction (maîtrise multimatériaux…). |
| `introImagePrimary` | `image` (`hotspot`, `alt`) | intro | — | seed-asset | Visuel d'appui (`51:2758`). |
| `introImageSecondary` | `image` (`hotspot`, `alt`) | intro | — | seed-asset | Visuel d'appui (`51:2759`). |
| `introHighlight` | `text` | intro | — | maquette | Phrase phare (« Nous faisons dialoguer créativité… »). → `Pullquote`. |
| `visionTitleOutline` | `string` | vision | — | « Notre » | Titre — contour (`SectionTitle`). |
| `visionTitleFill` | `string` | vision | — | « vision » | Titre — plein. |
| `visionText` | `text` | vision | — | maquette | Texte de vision (la confluence / l'estuaire). |
| `visionImages` | `array<image>` | vision | — | seed-assets | Visuels de la section (`51:2774`, `51:2775`). Slots mappés par index. |
| `atelierTitleOutline` | `string` | atelier | — | « De notre atelier » | Titre — contour. |
| `atelierTitleFill` | `string` | atelier | — | « à votre chantier » | Titre — plein. |
| `atelierText` | `text` | atelier | — | maquette | Implantation (Machecoul) + atelier 3000 m². |
| `atelierPillarsLead` | `string` | atelier | — | maquette | « Un atelier de 3000 m² pour garantir : ». |
| `atelierPillars` | `array<string>` | atelier | — | précision / fiabilité / performance | Piliers de la promesse. |
| `atelierCapabilities` | `array<text>` | atelier | — | maquette (3) | Points de capacité (parc machines, organisation agile, installation FR/EU). |
| `atelierImages` | `array<image>` | atelier | — | seed-assets | Visuels (`51:2786/2787/2789/2790`). Slots mappés par index. |
| `atelierHighlight` | `text` | atelier | — | maquette | Phrase phare de l'atelier → `Pullquote`. |
| `processTitleOutline` | `string` | process | — | « Notre mode » | Titre — contour. |
| `processTitleFill` | `string` | process | — | « opératoire » | Titre — plein. |
| `processIntro` | `text` | process | — | maquette | Intro du mode opératoire (suivi de proximité…). |
| `processSteps` | `array<processStep>` | process | — (def. 4) | 4 étapes maquette | Liste ordonnée (FR-006). Voir objet ci-dessous. |
| `statementImage` | `image` (`hotspot`, `alt`) | statement | — | seed-asset | Grand visuel plein largeur (`51:2881`). |
| `statementText` | `text` | statement | — | maquette | Phrase en incrustation (« Nous ne sommes pas contraints… »). |
| `ctaLabel` | `string` | cta | — | « découvrir nos expertises » | Libellé du CTA (FR-008). |
| `ctaHref` | `string` | cta | — | `/expertises` | Destination du CTA. |
| `seoMetaTitle` | `string` | seo | — | maquette / « Nous découvrir » | Titre de page (FR-016). |
| `seoMetaDescription` | `text` | seo | — | maquette | Meta-description (FR-016). |
| `seoOgImage` | `image` (`alt`) | seo | — | seed-asset | Image de partage social (FR-016). |

> **Slots image en `array<image>`** (`visionImages`, `atelierImages`) : la mise en page est
> fixe (pixel-perfect) ; la page mappe chaque entrée à sa position maquette par **index**.
> Le nombre de slots est figé par la maquette (lu au build). Choix assumé : un `array`
> ordonné est plus simple pour l'éditeur qu'une cascade de champs nommés, et le rendu
> contrôle le placement. À reconsidérer en champs nommés si l'ergonomie l'exige au build.

### Objet : `processStep` (membre de `processSteps`)

| Champ | Type | Obligatoire | Notes |
|-------|------|:-----------:|-------|
| `number` | `string` | ✅ | Numéro d'ordre affiché (« 01 », « 02 », …). |
| `title` | `string` | ✅ | Titre de l'étape (« Analyse », « Co-conception », …). |
| `text` | `text` | — | Description de l'étape. |
| `bullets` | `array<string>` | — | Liste de points (présente pour Co-conception / Co-construction ; absente pour Analyse — FR-006 / cas limite). |
| `images` | `array<image>` (`hotspot`, `alt`) | — | Visuels de l'étape (nombre/position variables selon la maquette). |

- **`preview`** : `title` = `title`, `subtitle` = `number`, `media` = `images.0`.
- **Ordre** : l'ordre du tableau EST l'ordre d'affichage ; la numérotation suit `number`
  (saisi), pas l'index — l'éditeur peut réordonner sans casser les libellés (Scénario 3 §3).

### Image partagée (`imageField`)

Réutilise le helper `imageField(name, title, group?)` du modèle home : `type: "image"`,
`options.hotspot`, champ `alt` (`required().warning(...)` — accessibilité + SEO). `group`
omis pour les images imbriquées dans un objet (`processStep`) — un `group` ne peut
référencer qu'un groupe défini sur le même type (sinon crash Studio, cf. commentaire
`homePage.ts`).

## Entité (non-CMS) : copie maquette `aboutPageContent`

- **Fichier** : `src/content/aboutPage.ts` — **source unique** de la copie (Principe IX),
  importée « vers le bas » par le seed (écrit dans Sanity) **et** le repli front
  (`getAboutPageProps` DEFAULTS, rendu si Sanity vide — SC-006).
- **Texte uniquement** (pas d'images : les visuels viennent du seed, uploadés vers Sanity,
  comme la home — ADR 0004). `\n` significatif (sauts de ligne maquette → `whitespace-pre-line`).
- Forme : un objet miroir des champs texte ci-dessus (titres contour/fill, statements,
  textes, piliers, capacités, étapes `{number,title,text,bullets}`, libellés CTA, SEO).

## Relations & invariants

- `aboutPage` est **autonome** : aucune référence à un autre document (la home référence
  `/nous-decouvrir` par une simple `string href`, pas une référence Sanity).
- `ctaHref` pointe vers `/expertises` (route prévue ; 404 temporaire accepté — FR-008).
- Revalidation : la query déclare le tag parent `sanity` (via `sanityFetch`/`defineLive`) ;
  le webhook `revalidateTag("sanity")` invalide la page à toute édition (aucune config
  par-document à ajouter).
- TypeGen : après création/maj du schéma, `npm run typegen` régénère `AboutPage` +
  `ABOUT_PAGE_QUERYResult` (consommés par `aboutPage.ts`). Aucun type tapé à la main.
