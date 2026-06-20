# Contrat — Modèle de contenu (schéma / éditeur / GROQ / revalidation)

Contrat entre le **schéma Sanity** (`expertiseSubpage`), l'**éditeur** (Studio) et la couche de
**consommation** (`@/lib/sanity/expertiseSubpage.ts`). Le schéma est la source de vérité
(Principe IX) ; les types sont générés (`npm run typegen`).

## 1. Document & instances

- **Type** : `expertiseSubpage` (document, **non singleton**). **3 instances** d'`_id` stables :
  `expertiseSubpage.agencement-sur-mesure`, `expertiseSubpage.mobiliers-sur-mesure`,
  `expertiseSubpage.presentoirs-sur-mesure`.
- **Clé de route** : `slug.current` ∈ `{agencement-sur-mesure, mobiliers-sur-mesure,
  presentoirs-sur-mesure}` (figées par les CTA de la 008 — ne pas renommer sans casser ces liens).
- **Groupes Studio** : `hero` (défaut) · `intro` · `responsable` · `engagements` · `caseStudy` ·
  `seo`.
- **Desk** (`structure.ts`) : une entrée « Sous-pages d'expertise » listant les documents du type
  (les 3 instances). `expertiseSubpage` **n'est pas** dans `SINGLETONS` (il est multi-instances).

## 2. Champs (contrat éditeur)

Voir `data-model.md` pour la table complète. Invariants de contrat :

- `title` (admin) + `slug` + `heroTitleFill` sont **`required()`** ; chaque `engagement.title` est
  `required()`. Tout le reste est optionnel (repli maquette).
- `engagements` est une **liste ordonnée** ; la numérotation `01/`…`06/` est **dérivée de
  l'ordre** au rendu, jamais saisie. Masquer/réordonner un engagement garde une numérotation
  cohérente.
- `caseStudyCtaHref` est un **`string href`** (pas une référence) — route de réalisation prévue,
  404 temporaire accepté (FR-007).
- `breadcrumb` est un libellé éditable ; le **lien parent** du fil d'Ariane est `/expertises`
  (résolu côté connecteur, pas stocké — FR-018).
- Les images utilisent `imageField` (hotspot + `alt` requis en warning).

## 3. Requêtes GROQ (`@/lib/sanity/queries.ts`)

```groq
// EXPERTISE_SUBPAGE_QUERY — un document par slug (route dynamique)
*[_type == "expertiseSubpage" && slug.current == $slug][0]{
  "slug": slug.current,
  breadcrumb,
  heroEyebrow, heroTitleOutline, heroTitleFill,
  heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  introStatement, introText,
  introImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  responsableStatement,
  responsableImages[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  engagementsTitleOutline, engagementsTitleFill,
  engagements[]{ title },
  caseStudyTitleOutline, caseStudyTitleFill,
  caseStudyImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  caseStudyProjectTitle, caseStudyMeta, caseStudyCtaLabel, caseStudyCtaHref,
  seoMetaTitle, seoMetaDescription,
  seoOgImage{ asset, alt }
}

// EXPERTISE_SUBPAGE_SLUGS_QUERY — slugs présents en Sanity (optionnel, generateStaticParams)
*[_type == "expertiseSubpage" && defined(slug.current)]{ "slug": slug.current }
```

- Projection d'images identique au reste du projet : `{ asset, hotspot, crop, alt, "lqip":
  asset->metadata.lqip }` ; l'OG image omet `lqip`.
- `defineQuery` ⇒ types `EXPERTISE_SUBPAGE_QUERYResult` générés par TypeGen, consommés par le
  mapping (aucun type tapé à la main).

## 4. Mapping consommation (`@/lib/sanity/expertiseSubpage.ts`)

- Signature : `getExpertiseSubpageProps(slug: string)` → props de page, **ou** `null` si le slug
  n'a ni document Sanity ni défaut maquette (→ `notFound()` côté page).
- Applique les **défauts maquette par slug** (`expertiseSubpagesContent[slug]`) champ par champ
  (`e?.x ?? DEFAULTS.x`).
- Résout les images via le helper partagé `mapImage` (`urlFor` + `width` + `lqip`).
- Dérive : le **slug** (pour le tracking `case_study_click`), le **lien parent** du fil d'Ariane
  (`/expertises`), la **numérotation** des engagements (laissée au composant `EngagementsGrid`).
- `generateStaticParams` ← `EXPERTISE_SLUGS` (clés de `expertiseSubpagesContent`), éventuellement
  unionné aux slugs Sanity.

## 5. Seed (`@/sanity/seed/documents/expertiseSubpages.seed.ts`)

- Default-exporte un **tableau de 3** `defineSeed<ExpertiseSubpage>({...})` (un par slug), texte
  issu de `expertiseSubpagesContent`, images de `seed-assets/expertiseSubpages/<slug>/…`.
- Enregistré via spread dans `registry.ts` : `seeds = [..., ...expertiseSubpages]`.
- Validé par `npm run seed -- expertiseSubpage --check` (champs `required` présents + assets
  existants). Écriture `createIfNotExists` par défaut (`--reset` opt-in).

## 6. Revalidation

- Aucune config par-document. `sanityFetch`/`defineLive` attache le tag parent `sanity` ; le
  webhook `POST /api/revalidate` appelle `revalidateTag("sanity", "max")` → les 3 sous-pages se
  rafraîchissent après publication (SC-006).
