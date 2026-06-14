# Contrat — Modèle de contenu & édition (`homePage`)

Contrat entre le **Studio** (éditeur), le **schéma** (source de vérité), la **requête**
GROQ et la **revalidation**. Décrit ce qui est garanti, pas l'implémentation.

## 1. Contrat éditeur (Studio)

- Un seul document `homePage` (singleton, `_id = "homePage"`), accessible dans « Contenu »
  → « Page d'accueil » (déjà épinglé dans `structure.ts`).
- Champs organisés en onglets : **Hero · Intro · Expertises · Univers · Vision · SEO**
  (groupes — voir `data-model.md` pour la liste exhaustive).
- L'éditeur peut **ajouter / retirer / réordonner** les slides du hero et les secteurs.
- L'éditeur **ne voit pas** les cartes de réalisations (statiques, FR-005).
- Toute publication est reflétée sur `/` après revalidation, **sans redéploiement**
  (SC-005), grâce au webhook existant.

## 2. Contrat schéma (réécriture `src/sanity/schemas/documents/homePage.ts`)

- Le schéma est **réécrit from scratch** : les champs de test `title`/`tagline` sont
  supprimés (jetables, non repris).
- `defineType` + `defineField`, TypeScript, colocalisé (Principe II/IX).
- Champs `image` : `options.hotspot = true` + sous-champ `alt` (FR-013).
- `heroSlides` : `validation: rule => rule.min(1)` (FR-002).
- Enregistré dans `src/sanity/schemas/index.ts` (déjà fait pour `homePage`).
- **Après modification** : `npm run typegen` (régénère `sanity.types.ts`, commité).

## 3. Contrat de requête (`HOME_PAGE_QUERY`)

- `defineQuery` dans `src/lib/sanity/queries.ts` ; cible `*[_id == "homePage"][0]`.
- Projette **tous** les champs du modèle, et pour chaque image : `asset, hotspot, crop,
  alt, "lqip": asset->metadata.lqip` (pattern footer — LQIP pour le placeholder, SC-007 /
  cas limite « visuel lent »).
- Le type de résultat `HOME_PAGE_QUERY_RESULT` est **généré** par TypeGen.
- Consommée par `getHomePageProps()` (`src/lib/sanity/homePage.ts`) via `sanityFetch`.

### Esquisse de projection

```groq
*[_id == "homePage"][0]{
  heroLabel,
  heroSlides[]{ titleOutline, titleFill, "img": image{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip } },
  introHeading, introText,
  expertisesTitle, expertisesText,
  "expertisesImage": expertisesImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  expertisesCtaLabel, expertisesCtaHref,
  universTitle, universSectors[]{ label, href },
  visionTitle, visionText,
  "visionImage": visionImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  visionCtaLabel, visionCtaHref,
  "seo": seo{ metaTitle, metaDescription, "ogImage": ogImage{ asset, alt } }
}
```

## 4. Contrat de mapping (`getHomePageProps`)

- Signature : `async function getHomePageProps(): Promise<HomePageProps>`.
- Applique **systématiquement** les défauts de `src/content/homePage.ts` (`?? DEFAULTS.…`).
- Transforme les images via `urlFor(...).width(...).auto("format").url()` + `blurDataURL`
  (`lqip`). Filtre les images sans `asset`.
- Garantit : **jamais** `undefined`/vide rendu (SC-006) ; hero **au moins 1** slide (repli
  maquette si l'array est vide — cas limite « hero sans slide »).
- `generateMetadata()` réutilise la partie `seo` (mêmes défauts) → `title`, `description`,
  `openGraph.images`.

## 5. Contrat de revalidation

- Inchangé : webhook Sanity → `POST /api/revalidate` → `revalidateTag("sanity", "max")`.
- `defineLive` attache le tag parent `sanity` à chaque `sanityFetch` → publier `homePage`
  invalide la home. **Aucune nouvelle route ni nouveau tag** requis (vérifié, research §0).

## 6. Contrat de seed (`homePage.seed.ts`)

- `defineSeed<HomePage>({ _id: "homePage", _type: "homePage", ... })`.
- Texte importé de `src/content/homePage.ts` ; images via `image("seed-assets/homePage/…", "alt")`.
- Enregistré dans `src/sanity/seed/registry.ts`.
- Validé par `npm run seed:check` (champs `required` présents + assets disque existants)
  **avant** `npm run seed` (Principe IX).
- `createIfNotExists` par défaut ; `--reset` réservé au pré-lancement / dev (jamais en CI).
- Prod seedée via la CI (projet prod), pas en local.
