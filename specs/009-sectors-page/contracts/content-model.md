# Contrat — Modèle de contenu & édition (`sectorsPage`)

Contrat entre le **Studio** (éditeur), le **schéma** (source de vérité), la **requête**
GROQ et la **revalidation**. Décrit ce qui est garanti, pas l'implémentation.

## 1. Contrat éditeur (Studio)

- Un seul document `sectorsPage` (singleton, `_id = "sectorsPage"`), accessible dans
  « Contenu » → « Univers » (à épingler dans `structure.ts` + `SINGLETONS`).
- Champs organisés en onglets : **Hero · Intro · Secteurs · Infos clés · SEO** (groupes —
  voir `data-model.md` pour la liste exhaustive).
- L'éditeur peut **ajouter / retirer / réordonner** les secteurs (`sectors`) et les chiffres
  clés (`keyFigures`) en `array` ; l'ordre du tableau est l'ordre d'affichage (Scénario 3 §3).
- Toute publication est reflétée sur `/univers` après revalidation, **sans redéploiement**
  (SC-005), grâce au webhook existant.
- Tant que le singleton n'est pas saisi, la page rend les **valeurs maquette** par défaut
  (SC-006) : aucune zone vide.

## 2. Contrat schéma (`src/sanity/schemas/documents/sectorsPage.ts`)

- Nouveau `defineType` + `defineField`, TypeScript, colocalisé (Principe II/IX).
- Champs `image` : `options.hotspot = true` + sous-champ `alt` requis (FR-013) via le helper
  `imageField` (repris des modèles home/about).
- `heroTitleOutline` + `heroTitleFill` : `validation: rule => rule.required()` (composent le
  **H1** — FR-014).
- `sectors` : objet `sector` avec `label` requis ; `promise`, `href`, `image` optionnels ;
  `preview` `{title: label, subtitle: href, media: image}`.
- `keyFigures` : objet `keyFigure` avec `value` requis ; `support` optionnel ; `preview`
  `{title: value, subtitle: support}`.
- Enregistré dans `src/sanity/schemas/index.ts` (`schemaTypes`).
- Épinglé : ajouter `"sectorsPage"` à `SINGLETONS` + entrée desk dans `structure.ts`.
- **Après création/modification** : `npm run typegen` (régénère `sanity.types.ts`, commité).

## 3. Contrat de requête (`SECTORS_PAGE_QUERY`)

- `defineQuery` dans `src/lib/sanity/queries.ts` ; cible `*[_id == "sectorsPage"][0]`.
- Projette **tous** les champs du modèle, et pour chaque image : `asset, hotspot, crop,
  alt, "lqip": asset->metadata.lqip` (pattern home/about — LQIP pour le placeholder,
  SC-007 / cas limite « visuel lent »). L'OG image projette `asset, alt` (sans lqip).
- Le type de résultat `SECTORS_PAGE_QUERYResult` est **généré** par TypeGen.
- Consommée par `getSectorsPageProps()` (`src/lib/sanity/sectorsPage.ts`) via `sanityFetch`.

### Esquisse de projection

```groq
*[_id == "sectorsPage"][0]{
  heroEyebrow, heroTitleOutline, heroTitleFill,
  heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  introStatement, introText,
  introImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  sectors[]{
    label, promise, href,
    image{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
  },
  keyFigures[]{ value, support },
  seoMetaTitle, seoMetaDescription,
  seoOgImage{ asset, alt }
}
```

## 4. Contrat de mapping (`getSectorsPageProps`)

- `src/lib/sanity/sectorsPage.ts`, **miroir de `homePage.ts`/`aboutPage.ts`** : `sanityFetch`
  → applique les defaults (`sectorsPageContent`) → résout les images via le helper partagé
  `mapImage` (`urlFor().width(...).auto("format")` + `lqip`).
- Repli texte : chaque champ `?? DEFAULTS.<champ>`. Repli image : `undefined` si pas d'asset
  (le composant dégrade proprement — cas limite « visuel manquant », voile préservé).
- `sectors` : mappe chaque entrée valide (filtre `label` non vide, comme `homePage.universSectors`)
  vers `{ label, promise, href, image }` ; repli sur `DEFAULTS.sectors[i]` par index pour le
  texte, image résolue ou `undefined`. `keyFigures` : idem (`value` requis).
- Exporte `getSectorsPageProps()` + `type SectorsPageProps = Awaited<ReturnType<…>>`.

## 5. Contrat de seed (`sectorsPage.seed.ts`)

- `defineSeed<SectorsPage>` (type généré), texte depuis `@/content/sectorsPage.ts` (source
  unique), images via `image("seed-assets/sectorsPage/<file>", "alt")`.
- Membres d'objet déclarent leur `_type` (`sector`, `keyFigure`).
- Enregistré dans `src/sanity/seed/registry.ts`.
- Validé par `npm run seed:check` (champs required présents + assets sur disque) **avant**
  `npm run seed`. `createIfNotExists` par défaut (Principe IX).

## 6. Contrat de revalidation

- `sanityFetch`/`defineLive` attache le tag parent `sanity` à la requête.
- Webhook Sanity → `POST /api/revalidate` → `revalidateTag("sanity", …)` invalide la page
  « Univers » à toute édition. **Aucune** config par-document à ajouter (mécanisme global
  existant).
