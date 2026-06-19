# Contrat — Modèle de contenu & édition (`expertisesPage`)

Contrat entre le **Studio** (éditeur), le **schéma** (source de vérité), la **requête** GROQ
et la **revalidation**. Décrit ce qui est garanti, pas l'implémentation.

## 1. Contrat éditeur (Studio)

- Un seul document `expertisesPage` (singleton, `_id = "expertisesPage"`), accessible dans
  « Contenu » → « Expertises » (à épingler dans `structure.ts` + `SINGLETONS`).
- Champs organisés en onglets : **Hero · Intro · Niveaux · Grand visuel · SEO** (groupes —
  voir `data-model.md` pour la liste exhaustive).
- L'éditeur peut **ajouter / retirer / réordonner** les niveaux d'expertise (`levels`) et
  éditer pour chacun l'intitulé, le visuel, le libellé et le lien du « en savoir plus ».
- Toute publication est reflétée sur `/expertises` après revalidation, **sans
  redéploiement** (SC-005), grâce au webhook existant.
- Tant que le singleton n'est pas saisi, la page rend les **valeurs maquette** par défaut
  (SC-006) : aucune zone vide.

## 2. Contrat schéma (`src/sanity/schemas/documents/expertisesPage.ts`)

- Nouveau `defineType` + `defineField`, TypeScript, colocalisé (Principe II/IX).
- Champs `image` : `options.hotspot = true` + sous-champ `alt` (`required().warning(...)` —
  FR-013) via le helper `imageField` (repris du modèle home/about).
- `heroTitleFill` : `validation: rule => rule.required()` (partie obligatoire du H1 — FR-014).
- `levels` : tableau d'objets `expertiseLevel` avec `title` requis ; `image`, `ctaLabel`
  (initialValue « en savoir plus »), `ctaHref` ; `preview` `{title, media:image}`.
- Enregistré dans `src/sanity/schemas/index.ts` (`schemaTypes`).
- Épinglé : ajouter `"expertisesPage"` à `SINGLETONS` + entrée desk dans `structure.ts`.
- **Après création/modification** : `npm run typegen` (régénère `sanity.types.ts`, commité).

## 3. Contrat de requête (`EXPERTISES_PAGE_QUERY`)

- `defineQuery` dans `src/lib/sanity/queries.ts` ; cible `*[_id == "expertisesPage"][0]`.
- Projette **tous** les champs du modèle, et pour chaque image : `asset, hotspot, crop, alt,
  "lqip": asset->metadata.lqip` (pattern home/about/footer — LQIP pour le placeholder, SC-007
  / cas limite « visuel lent »). L'OG image projette `asset, alt` (sans lqip).
- Le type de résultat `EXPERTISES_PAGE_QUERYResult` est **généré** par TypeGen.
- Consommée par `getExpertisesPageProps()` (`src/lib/sanity/expertisesPage.ts`) via
  `sanityFetch`.

### Esquisse de projection

```groq
*[_id == "expertisesPage"][0]{
  heroEyebrow, heroTitleOutline, heroTitleFill,
  heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  introStatement, introText,
  introImagePrimary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  introImageSecondary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  levelsTitleOutline, levelsTitleFill,
  levels[]{
    title, ctaLabel, ctaHref,
    image{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
  },
  statementImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  statementText,
  seoMetaTitle, seoMetaDescription,
  seoOgImage{ asset, alt }
}
```

## 4. Contrat de mapping (`getExpertisesPageProps`)

- `src/lib/sanity/expertisesPage.ts`, **miroir de `aboutPage.ts`** : `sanityFetch` → applique
  les defaults (`expertisesPageContent`) → résout les images via le helper partagé `mapImage`
  (`urlFor().width(...).auto("format")` + `lqip`).
- Repli texte : chaque champ `?? DEFAULTS.<champ>`. Repli image : `undefined` si pas d'asset
  (le composant dégrade proprement — cas limite « visuel manquant »).
- Les niveaux : `levels` de Sanity (avec images) quand présents, sinon les niveaux maquette
  (texte + `ctaHref`, image-less) en repli — exactement le pattern des `processSteps` de la
  007 (la section dégrade à son texte/lien ; les images arrivent une fois seedées). Chaque
  niveau expose un `slug` dérivé du dernier segment de `ctaHref` (pour le tracking).
- Exporte `getExpertisesPageProps()` + `type ExpertisesPageProps = Awaited<ReturnType<…>>`.

## 5. Contrat de seed (`expertisesPage.seed.ts`)

- `defineSeed<ExpertisesPage>` (type généré), texte depuis `@/content/expertisesPage.ts`
  (source unique), images via `image("seed-assets/expertisesPage/<file>", "alt")`.
- Membres d'objet déclarent leur `_type` (`expertiseLevel`).
- Enregistré dans `src/sanity/seed/registry.ts`.
- Validé par `npm run seed:check` (champs required présents + assets sur disque) **avant**
  `npm run seed`. `createIfNotExists` par défaut (Principe IX).

## 6. Contrat de revalidation

- `sanityFetch`/`defineLive` attache le tag parent `sanity` à la requête.
- Webhook Sanity → `POST /api/revalidate` → `revalidateTag("sanity", "max")` invalide la page
  « Expertises » à toute édition. **Aucune** config par-document à ajouter (mécanisme global
  existant).
