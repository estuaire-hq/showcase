# Phase 1 — Modèle de données

Entités du contenu de la page « Expertises ». Le **schéma Sanity est la source de vérité**
(Principe IX) : les types TypeScript sont **générés** (`npm run typegen` →
`src/sanity.types.ts`), jamais tapés à la main. Ce document décrit la **forme cible** ; les
*valeurs* (copie, libellés) sont lues sur la maquette au build (nodes `51:2893` desktop /
`87:5600` tablette / `87:6290` mobile) et vivent une seule fois dans
`src/content/expertisesPage.ts`. Le nombre exact de visuels d'intro et les variations de mise
en page sont confirmés au build sur les nodes complets (Principe VII).

## Entité : `expertisesPage` (singleton CMS)

- **Type** : document Sanity, `_id` fixe `"expertisesPage"` (singleton via `structure.ts` +
  `SINGLETONS`).
- **Édition** : un seul écran Studio, organisé en `groups` (onglets).
- **Repli** : chaque champ texte a une valeur par défaut maquette
  (`@/content/expertisesPage.ts`) rendue si le singleton n'est pas saisi (SC-006) ; les
  images viennent du seed.

### Groupes (onglets Studio)

`hero` (défaut) · `intro` · `levels` · `statement` · `seo`

### Champs

| Champ | Type Sanity | Groupe | Obligatoire | Défaut (repli) | Notes |
|-------|-------------|--------|:-----------:|----------------|-------|
| `heroEyebrow` | `string` | hero | — | « Design d'espace, agencement et présentoirs » | Sur-titre de l'encart, séparé par un trait. Rendu `BrandText`. |
| `heroTitleOutline` | `text` (rows 2) | hero | — | maquette | Lignes du H1 en **contour** (`OutlineText`). Lu sur `012/ SLIDER`. |
| `heroTitleFill` | `string` | hero | ✅ | « réaliser vos projets de toutes formes et de toutes tailles » | Ligne pleine du H1 (`BrandText`). **Partie obligatoire du H1 unique** (FR-014). |
| `heroImage` | `image` (`hotspot`, `alt`) | hero | — | seed-asset | Visuel plein cadre du hero (`012/ SLIDER`). |
| `introStatement` | `text` | intro | — | « À la frontière entre artisanat et industrie, entre design et fabrication » | Phrase phare mise en avant → `Pullquote`. |
| `introText` | `text` (rows 8) | intro | — | maquette | Texte d'intro (bureau d'études + atelier, ouvrages multimatériaux, diversité des projets). |
| `introImagePrimary` | `image` (`hotspot`, `alt`) | intro | — | seed-asset | Visuel d'appui (slot 1). Nombre/position confirmés au build. |
| `introImageSecondary` | `image` (`hotspot`, `alt`) | intro | — | seed-asset | Visuel d'appui (slot 2). Présent si la maquette en montre 2. |
| `levelsTitleOutline` | `string` | levels | — | « Nos 3 niveaux » | Titre de section — contour (`SectionTitle`). |
| `levelsTitleFill` | `string` | levels | — | « d'expertise » | Titre de section — plein. |
| `levels` | `array<expertiseLevel>` | levels | — (def. 3) | 3 niveaux maquette | Liste ordonnée (FR-004). L'ordre = ordre d'affichage. Voir objet ci-dessous. |
| `statementImage` | `image` (`hotspot`, `alt`) | statement | — | seed-asset | Grand visuel plein largeur assombri (`05/ BIG IMAGE`). |
| `statementText` | `text` | statement | — | « Nous concevons chaque projet avec la précision du sur-mesure et la puissance de l'industrie » | Phrase phare en incrustation → `Pullquote`. |
| `seoMetaTitle` | `string` | seo | — | maquette / « Expertises » | Titre de page (FR-014). |
| `seoMetaDescription` | `text` | seo | — | maquette | Meta-description (FR-014). |
| `seoOgImage` | `image` (`alt`) | seo | — | seed-asset | Image de partage social (FR-014). |

> **Pas de groupe `cta`** (contrairement à `aboutPage`) : le « BIG FOOTER » de la maquette
> (bloc CTA + pied de page) est **le footer global déjà monté par le shell** (FR-001 /
> FR-010), pas du contenu de cette page. Les seuls CTA propres à la page sont les
> « en savoir plus » portés par chaque `expertiseLevel`.

### Objet : `expertiseLevel` (membre de `levels`)

| Champ | Type | Obligatoire | Défaut (repli) | Notes |
|-------|------|:-----------:|----------------|-------|
| `title` | `text` (rows 2) | ✅ | maquette | Intitulé de la carte (peut contenir `\n`). Rendu sur le visuel assombri (`FeatureBlock.title`). |
| `image` | `image` (`hotspot`, `alt`) | — | seed-asset | Visuel de fond de la carte (assombri par le voile ink 25 % de `FeatureBlock`). |
| `ctaLabel` | `string` | — | « en savoir plus » | Libellé de l'appel à l'action. |
| `ctaHref` | `string` | — | route prévue | Destination (sous-page d'expertise ; 404 temporaire OK — FR-005). |

- **Niveaux par défaut (maquette, FR-004)** — ordre = affichage :
  1. `title` « Notre vision du métier d'agenceur » → `ctaHref` `/expertises/agencement-sur-mesure`
  2. `title` « Notre savoir-faire appliqué aux mobiliers » → `ctaHref` `/expertises/mobiliers-sur-mesure`
  3. `title` « Notre exigence au service des présentoirs » → `ctaHref` `/expertises/presentoirs-sur-mesure`
- **`preview`** : `title` = `title`, `media` = `image`.
- **Ordre & robustesse** : l'ordre du tableau EST l'ordre d'affichage ; la mise en page reste
  correcte si un niveau est masqué/réordonné (cas limite spec « nombre de niveaux »).
- **Tracking** : la page dérive un `slug` du `ctaHref` (dernier segment) pour la propriété
  `data-umami-event-level` (research §7) — pas un champ CMS (dérivé, sans PII).

### Image partagée (`imageField`)

Réutilise le helper `imageField(name, title, group?)` (modèle home/about) : `type: "image"`,
`options.hotspot`, champ `alt` (`required().warning(...)` — accessibilité + SEO). `group`
omis pour les images imbriquées dans un objet (`expertiseLevel`) — un `group` ne peut
référencer qu'un groupe défini sur le même type (sinon crash Studio, cf. commentaire
`homePage.ts`/`aboutPage.ts`).

## Entité (non-CMS) : copie maquette `expertisesPageContent`

- **Fichier** : `src/content/expertisesPage.ts` — **source unique** de la copie (Principe IX),
  importée « vers le bas » par le seed (écrit dans Sanity) **et** le repli front
  (`getExpertisesPageProps` DEFAULTS, rendu si Sanity vide — SC-006).
- **Texte uniquement** (pas d'images : les visuels viennent du seed, uploadés vers Sanity,
  comme home/about — ADR 0004). `\n` significatif (sauts de ligne maquette →
  `whitespace-pre-line`).
- Forme : un objet miroir des champs texte ci-dessus (eyebrow, titres outline/fill du hero et
  de la section niveaux, statements, texte d'intro, tableau `levels` `{title, ctaLabel,
  ctaHref}`, SEO).

## Relations & invariants

- `expertisesPage` est **autonome** : aucune référence à un autre document. Les destinations
  des niveaux sont de simples `string href` vers les routes prévues des sous-pages (qui
  n'existent pas encore — features distinctes ; 404 temporaire accepté — FR-005).
- Revalidation : la query déclare le tag parent `sanity` (via `sanityFetch`/`defineLive`) ; le
  webhook `revalidateTag("sanity", "max")` invalide la page à toute édition (aucune config
  par-document à ajouter).
- TypeGen : après création/maj du schéma, `npm run typegen` régénère `ExpertisesPage` +
  `EXPERTISES_PAGE_QUERYResult` (consommés par `expertisesPage.ts`). Aucun type tapé à la main.
- H1 unique : `heroTitleFill` (+ `heroTitleOutline`) constitue le seul `<h1>` ; les titres de
  section et de carte sont des `<h2>`/`<h3>` (hiérarchie fixée au build — research §8).
