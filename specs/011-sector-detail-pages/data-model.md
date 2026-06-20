# Data Model — Pages de détail des secteurs (011)

Phase 1. Modèle de contenu Sanity issu des *Entités clés* du spec et des décisions de
`research.md` (D1, D9). Le **schéma `defineType` est la source de vérité** ; les types TS sont
**générés** (`npm run typegen` → `src/sanity.types.ts`), jamais tapés à la main (Principe IX).

---

## Document : `sectorDetail` (non-singleton, 4 instances)

Un document **par secteur**, distingué par `slug`. Quatre instances :
`retail`, `bureau`, `residentiel`, `scenographie`.

Groupes Studio (onglets) : **`hero`**, **`intro`**, **`enjeux`**, **`contraintes`**,
**`argument`**, **`citations`**, **`seo`**.

### Champs

| Champ | Type | Required | Groupe | Description |
|---|---|---|---|---|
| `_id` | string | ✓ | — | `sectorDetail-<slug>` (unique, fixé par le seed) |
| `_type` | `"sectorDetail"` | ✓ | — | discriminant |
| `title` | string | ✓ | hero | **Libellé du secteur** (identité + breadcrumb). Ex. « Retail » |
| `slug` | slug | ✓ (unique) | hero | URL : `retail`/`bureau`/`residentiel`/`scenographie`. `options.source: "title"` |
| `heroEyebrow` | text (2 l.) | — | hero | Sus-titre du hero. Ex. « Retail design & agencement\nde boutiques sur-mesure » |
| `heroTitleOutline` | text | — | hero | Lignes de H1 en **contour** (peut contenir `\n`). Ex. « Des points\nde vente à » |
| `heroTitleFill` | text | ✓ | hero | Ligne(s) de H1 **pleines**. Ex. « votre image. » (porte le H1, requis) |
| `heroImage` | image (hotspot, alt) | — | hero | Visuel fort du hero (droite du bi-ton) |
| `introStatement` | text | — | intro | Énoncé d'intro (gros). Ex. « Le lien avec une marque se vit d'abord… » |
| `introText` | text (multi-§) | — | intro | Paragraphe(s) d'intro (`\n\n`) |
| `introImageMain` | image (hotspot, alt) | — | intro | Grand visuel carré (≈750×750/600) |
| `introImagePortrait` | image (hotspot, alt) | — | intro | Visuel portrait (≈475-536×712) |
| `introImageSquare` | image (hotspot, alt) | — | intro | Petit visuel carré (≈398×398) |
| `enjeuxTitleOutline` | string | — | enjeux | Titre, partie contour. Ex. « Les enjeux » |
| `enjeuxTitleFill` | string | — | enjeux | Titre, partie pleine. Ex. « du retail » |
| `enjeux` | array\<string\> | — | enjeux | Items de la liste (séparés par filets au rendu) |
| `contraintesTitleOutline` | string | — | contraintes | Titre, contour. Ex. « Les contraintes » |
| `contraintesTitleFill` | text | — | contraintes | Titre, plein. Ex. « terrain\nà anticiper » |
| `contraintes` | array\<`constraintChip`\> | — | contraintes | Nuage de chips (voir objet) |
| `argument` | text | — | argument | Texte de positionnement, décliné par secteur |
| `citations` | array\<`testimonial`\> (max 2) | — | citations | Deux citations / témoignages |
| `seoMetaTitle` | string | — | seo | Titre de page (SEO). Repli : « Estuaire » |
| `seoMetaDescription` | text (3 l.) | — | seo | Meta-description |
| `seoOgImage` | image (alt) | — | seo | Image de partage (Open Graph) |

> Tous les champs éditoriaux sont **optionnels au schéma** (défaut TypeGen) ; le repli front
> (`src/content/sectorDetail.ts`) garantit qu'aucune zone n'est vide (FR-010, SC-007). `title`,
> `slug`, `heroTitleFill` sont marqués required (identité + H1 + routing).

### Objet imbriqué : `constraintChip`

| Champ | Type | Required | Description |
|---|---|---|---|
| `_type` | `"constraintChip"` | ✓ | discriminant |
| `label` | string | ✓ | Texte du chip. Ex. « normes & conformité » |
| `emphasis` | string (list) | — | `outline` (défaut, contour) · `ink` (fond sombre) · `accent` (fond `estuaire`) — pilote le rythme visuel de la maquette |

### Objet imbriqué : `testimonial`

| Champ | Type | Required | Description |
|---|---|---|---|
| `_type` | `"testimonial"` | ✓ | discriminant |
| `quote` | text | ✓ | Texte de la citation |
| `attribution` | string | — | **Optionnelle** (auteur, rôle, entreprise). Ex. « Delphine Tipré, architecte d'intérieur, Clarins ». Absente → pas de bloc d'attribution vide (cas limite) |
| `image` | image (hotspot, alt) | — | Visuel de fond (traité « parallax fixe » + voile 25%) |

`citations` : `validation: rule.max(2)` (FR-007 : deux blocs). Aucun `_key` à la main (le runner
de seed l'injecte).

---

## Règles de validation (du spec)

- **FR-009 / SC-008** : un slug hors `{retail,bureau,residentiel,scenographie}` → requête `null`
  → `notFound()`. La contrainte d'unicité du `slug` empêche deux secteurs sur la même URL.
- **FR-007** : `citations` limité à 2 ; `attribution` optionnelle, jamais de bloc vide.
- **FR-010 / SC-007** : repli systématique sur `src/content/sectorDetail.ts` si un champ est vide.
- **FR-017** : `title` = seule source du H1 (rendu une fois, dans le hero) → H1 unique.
- **Accessibilité (FR-016)** : `image.alt` requis (warning) via le helper `imageField`.

---

## Routing & requête (consommation)

```groq
// src/lib/sanity/queries.ts
export const SECTOR_DETAIL_QUERY = defineQuery(/* groq */ `
  *[_type == "sectorDetail" && slug.current == $slug][0]{
    title, slug,
    heroEyebrow, heroTitleOutline, heroTitleFill,
    heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introStatement, introText,
    introImageMain{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introImagePortrait{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introImageSquare{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    enjeuxTitleOutline, enjeuxTitleFill, enjeux,
    contraintesTitleOutline, contraintesTitleFill,
    contraintes[]{ label, emphasis },
    argument,
    citations[]{ quote, attribution,
      image{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip } },
    seoMetaTitle, seoMetaDescription, seoOgImage{ asset, alt }
  }
`);

// Liste des slugs pour generateStaticParams
export const SECTOR_DETAIL_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "sectorDetail" && defined(slug.current)]{ "slug": slug.current }
`);
```

Cache-tags ISR via `sanityFetch` (revalidation webhook Sanity → `revalidateTag`). Le mapping
`src/lib/sanity/sectorDetail.ts` (`getSectorDetailProps(slug)`) applique les replis de
`src/content/sectorDetail.ts` et résout les images via `mapImage` (LQIP/blur).

---

## Desk structure (Studio)

`sectorDetail` n'est **PAS** un singleton → ne PAS l'ajouter au tableau `SINGLETONS` de
`src/sanity/structure.ts`. Il apparaît dans « Contenu » via le filtre auto
`S.documentTypeListItems()`. Optionnel : un `S.listItem()` « Univers — secteurs » groupant les 4
documents (preview par `title` + `slug` + `heroImage`).

---

## Images de contenu par secteur (6)

`heroImage` · `introImageMain` · `introImagePortrait` · `introImageSquare` ·
`citations[0].image` · `citations[1].image`. (La 7ᵉ image du frame Figma — le visuel du CTA — est
portée par le **footer global**, pas par ce document.) Sources de seed :
`seed-assets/sectorDetail/<slug>/{hero,intro-main,intro-portrait,intro-square,citation-1,citation-2}.jpg`.

---

## Type généré (après `npm run typegen`)

```ts
// src/sanity.types.ts (extrait attendu — généré, jamais tapé à la main)
export type SectorDetail = {
  _id: string; _type: "sectorDetail";
  _createdAt: string; _updatedAt: string; _rev: string;
  title?: string;
  slug?: Slug;
  heroEyebrow?: string; heroTitleOutline?: string; heroTitleFill?: string;
  heroImage?: { asset?: SanityImageAssetReference; /* … */ _type: "image" };
  introStatement?: string; introText?: string;
  introImageMain?: { /* image */ }; introImagePortrait?: { /* image */ }; introImageSquare?: { /* image */ };
  enjeuxTitleOutline?: string; enjeuxTitleFill?: string; enjeux?: Array<string>;
  contraintesTitleOutline?: string; contraintesTitleFill?: string;
  contraintes?: Array<{ label?: string; emphasis?: string; _type: "constraintChip"; _key: string }>;
  argument?: string;
  citations?: Array<{ quote?: string; attribution?: string; image?: { /* image */ }; _type: "testimonial"; _key: string }>;
  seoMetaTitle?: string; seoMetaDescription?: string;
  seoOgImage?: { asset?: SanityImageAssetReference; alt?: string; _type: "image" };
};
```
