# Contrat — Modèle de contenu & édition (`aboutPage`)

Contrat entre le **Studio** (éditeur), le **schéma** (source de vérité), la **requête**
GROQ et la **revalidation**. Décrit ce qui est garanti, pas l'implémentation.

## 1. Contrat éditeur (Studio)

- Un seul document `aboutPage` (singleton, `_id = "aboutPage"`), accessible dans
  « Contenu » → « Nous découvrir » (à épingler dans `structure.ts` + `SINGLETONS`).
- Champs organisés en onglets : **Hero · Intro · Vision · Atelier · Mode opératoire ·
  Grand visuel · CTA · SEO** (groupes — voir `data-model.md` pour la liste exhaustive).
- L'éditeur peut **ajouter / retirer / réordonner** les étapes du mode opératoire
  (`processSteps`), les piliers, les capacités et les visuels en `array`.
- Toute publication est reflétée sur `/nous-decouvrir` après revalidation, **sans
  redéploiement** (SC-005), grâce au webhook existant.
- Tant que le singleton n'est pas saisi, la page rend les **valeurs maquette** par défaut
  (SC-006) : aucune zone vide.

## 2. Contrat schéma (`src/sanity/schemas/documents/aboutPage.ts`)

- Nouveau `defineType` + `defineField`, TypeScript, colocalisé (Principe II/IX).
- Champs `image` : `options.hotspot = true` + sous-champ `alt`
  (`required().warning(...)` — FR-015) via le helper `imageField` (repris du modèle home).
- `heroTitle` : `validation: rule => rule.required()` (H1 — FR-016).
- `processSteps` : objet `processStep` avec `number` + `title` requis ; `bullets` /
  `images` optionnels ; `preview` `{title, subtitle:number, media:images.0}`.
- Enregistré dans `src/sanity/schemas/index.ts` (`schemaTypes`).
- Épinglé : ajouter `"aboutPage"` à `SINGLETONS` + entrée desk dans `structure.ts`.
- **Après création/modification** : `npm run typegen` (régénère `sanity.types.ts`, commité).

## 3. Contrat de requête (`ABOUT_PAGE_QUERY`)

- `defineQuery` dans `src/lib/sanity/queries.ts` ; cible `*[_id == "aboutPage"][0]`.
- Projette **tous** les champs du modèle, et pour chaque image : `asset, hotspot, crop,
  alt, "lqip": asset->metadata.lqip` (pattern home/footer — LQIP pour le placeholder,
  SC-007 / cas limite « visuel lent »). L'OG image projette `asset, alt` (sans lqip).
- Le type de résultat `ABOUT_PAGE_QUERYResult` est **généré** par TypeGen.
- Consommée par `getAboutPageProps()` (`src/lib/sanity/aboutPage.ts`) via `sanityFetch`.

### Esquisse de projection

```groq
*[_id == "aboutPage"][0]{
  heroTitle,
  heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  introStatement, introText,
  introImagePrimary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  introImageSecondary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  introHighlight,
  visionTitleOutline, visionTitleFill, visionText,
  visionImages[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  atelierTitleOutline, atelierTitleFill, atelierText,
  atelierPillarsLead, atelierPillars, atelierCapabilities,
  atelierImages[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  atelierHighlight,
  processTitleOutline, processTitleFill, processIntro,
  processSteps[]{
    number, title, text, bullets,
    images[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
  },
  statementImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  statementText,
  ctaLabel, ctaHref,
  seoMetaTitle, seoMetaDescription,
  seoOgImage{ asset, alt }
}
```

## 4. Contrat de mapping (`getAboutPageProps`)

- `src/lib/sanity/aboutPage.ts`, **miroir de `homePage.ts`** : `sanityFetch` → applique
  les defaults (`aboutPageContent`) → résout les images via `urlFor().width(...).auto("format")`
  + `lqip` (helper `mapImage` réutilisable — l'extraire en partagé ou le dupliquer à
  l'identique selon ce qui reste le plus simple, Principe IV).
- Repli texte : chaque champ `?? DEFAULTS.<champ>`. Repli image : `undefined` si pas
  d'asset (le composant dégrade proprement — cas limite « visuel manquant »).
- Exporte `getAboutPageProps()` + `type AboutPageProps = Awaited<ReturnType<…>>`.

## 5. Contrat de seed (`aboutPage.seed.ts`)

- `defineSeed<AboutPage>` (type généré), texte depuis `@/content/aboutPage.ts` (source
  unique), images via `image("seed-assets/aboutPage/<file>", "alt")`.
- Membres d'objet déclarent leur `_type` (`processStep`).
- Enregistré dans `src/sanity/seed/registry.ts`.
- Validé par `npm run seed:check` (champs required présents + assets sur disque) **avant**
  `npm run seed`. `createIfNotExists` par défaut (Principe IX).

## 6. Contrat de revalidation

- `sanityFetch`/`defineLive` attache le tag parent `sanity` à la requête.
- Webhook Sanity → `POST /api/revalidate` → `revalidateTag("sanity", "max")` invalide la
  page « Nous découvrir » à toute édition. **Aucune** config par-document à ajouter
  (mécanisme global existant).
