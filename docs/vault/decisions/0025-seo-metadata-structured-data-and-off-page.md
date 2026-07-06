# 0025 — SEO : métadonnées, données structurées (JSON-LD), sitemap et cadrage off-page

**Statut** : accepté · **Date** : 2026-07-05 · **Branche** : `seo-improvements`

> Numéro choisi 0025 : `0024` est pris par un worktree parallèle non mergé
> (`client-feedback-fixes`, webhook de revalidation). Renuméroter au merge si collision,
> skill `estuaire-branch-sync`.

## Contexte

Le site est public et indexable (gate coming-soon retiré). L'audit de l'existant a montré une
base on-page correcte mais des trous structurants :

- `generateMetadata` sur 8 pages, mais gabarit minimal (`title` + `description` +
  `openGraph.images`). **Aucune** balise `canonical`, `twitter`, `metadataBase`, ni `og:type/url/
  site_name/locale` nulle part.
- `sitemap.ts` = stub ne renvoyant que la home.
- **Données structurées : absence totale** (0 `application/ld+json`) alors que le NAP complet
  (`src/content/legal/identity.ts`) et les coordonnées geo (`src/content/contactPage.ts`)
  existaient déjà côté contenu.
- Liste réalisations + 2 pages légales : metadata statique sans OG.
- Le volet **off-page** était à cadrer selon l'outillage réellement disponible.

Périmètre validé par Pierre : les trois terrains (technique + on-page + off-page). Trois
arbitrages tranchés avant implémentation (mode `reflect`).

## Décisions

### 1. Défauts SEO en code, PAS de singleton `siteSettings` (arbitrage Pierre)

Les défauts globaux (image OG de secours, description par défaut, `sameAs`, identité pour le
JSON-LD) vivent dans un module code `src/lib/seo/` (`config.ts`), pas dans un nouveau singleton
Sanity. Le SEO **par document** (objet `seo` : `seoMetaTitle/Description/OgImage`) reste tel quel.

- **Pourquoi** : rapidité, aucun nouveau modèle Sanity + seed + typegen + seed prod à maintenir ;
  ces défauts changent rarement. Migrable vers un singleton plus tard si un besoin éditeur émerge.

### 2. Un helper `buildMetadata()` unique (`src/lib/seo/metadata.ts`)

Toutes les `generateMetadata` et les pages statiques passent par ce helper → `title` (+ template
racine, ou `absolute` pour la home), `description`, `alternates.canonical`, `openGraph`
(title/description/url/siteName/locale/type/images) et `twitter` (summary_large_image + images)
cohérents et **complets** partout. `metadataBase` (layout racine) résout les chemins relatifs en
URLs absolues.

### 3. `metadataBase` + résolution de l'origine (`SITE_URL`)

`metadataBase = new URL(SITE_URL)` dans le layout racine. `SITE_URL` est résolu par
`src/lib/seo/config.ts` : `process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ??
"https://estuaire.fr"` (slash final retiré). On garde `NEXT_PUBLIC_SITE_URL` (déjà en Coolify,
utilisé par robots/sitemap) et on introduit un `SITE_URL` **server-only** prioritaire, conforme à
la règle CLAUDE.md (une valeur injectée côté serveur ne doit pas porter le préfixe `NEXT_PUBLIC_`,
inliné au build). Aucune variable Coolify à changer dans l'immédiat. `robots.ts` et `sitemap.ts`
importent désormais cette **source unique** (`absoluteUrl`).

### 4. Données structurées : une seule entité `Organization` + `LocalBusiness`

- **Nœud global** typé `["Organization","LocalBusiness"]` (un `@id` unique `…/#organization`),
  rendu dans le layout racine → présent sur **toutes** les pages (knowledge panel + signaux
  locaux). Porte l'identité (nom légal MOSAIQUE PRODUCTION, marque Estuaire), le logo, la
  description, l'email, le téléphone (E.164), la TVA, l'adresse structurée (`PostalAddress`) et la
  geo (`GeoCoordinates` 46.9931 / -1.8221). `sameAs` = LinkedIn entreprise (fourni par Pierre,
  2026-07-06 ; seul profil pour l'instant).
  - **Pourquoi une entité combinée plutôt que deux nœuds** (Organization global + LocalBusiness sur
    /contact, comme esquissé au brief) : MOSAIQUE PRODUCTION a **un seul** siège/atelier. Deux nœuds
    créeraient deux entités concurrentes pour la même société ; un nœud multi-typé (schema.org
    l'autorise) est plus propre et non ambigu, et couvre la home (où le local pack se joue).
- **`WebSite`** global (attribué à l'organisation comme `publisher`). Pas de `SearchAction` (pas de
  recherche interne sur le site).
- **`BreadcrumbList`** sur les pages de détail (réalisation, expertise, univers) — miroir du fil
  d'ariane visible, URLs absolues.
- **`CreativeWork`** sur le détail réalisation (case study) : `creator` → `@id` de l'organisation
  (graphe d'entités lié), `image` = cover, `about` = client.
- Composant `src/components/JsonLd.tsx` (RSC) : sérialise et échappe `<` en `<` (garde XSS).
  Builders purs dans `src/lib/seo/jsonld.ts`, alimentés côté RSC/connecteur (frontière
  data/présentation respectée — Principe VIII).

### 5. Image OG par défaut : générée (next/og), référencée EXPLICITEMENT

`src/app/opengraph-image.tsx` génère une image 1200×630 brandée (fond bleu marque, logomark blanc,
wordmark « estuaire » en Montserrat Alternates, tagline) — la police est récupérée au build
(fallback logomark-seul si le fetch échoue, jamais d'échec de build).

- **Gotcha tranché** : l'auto-injection du fichier `opengraph-image` par Next est **abandonnée dès
  qu'une page définit son propre `openGraph`** (vérifié en runtime : `/confidentialite` sortait
  sans `og:image`). `buildMetadata` référence donc **toujours** une image explicitement — l'image
  Sanity si présente, sinon le défaut `/opengraph-image` (résolu en absolu via `metadataBase`).
  Résultat vérifié : exactement 1 `og:image` par page, jamais de doublon.

### 6. Sitemap dynamique via `sanityFetch`

`sitemap.ts` liste les 8 routes statiques + les 3 expertises (`EXPERTISE_SLUGS`) + les 4 univers
(`SECTOR_SLUGS`) + toutes les réalisations publiées (`REALISATION_SLUGS_QUERY` via `sanityFetch`,
donc revalidé par les mêmes tags webhook que les pages). `_updatedAt` a été ajouté à cette query
(+ `npm run typegen`) pour un `lastModified` réel sur les réalisations. Les vues filtrées
(`/realisations?univers=…`) sont **exclues** (elles canonicalisent vers `/realisations`).

### 7. Off-page : pas de dépendance Semrush ; leviers agent + plan manuel

Arbitrage Pierre : **pas d'abonnement Semrush** → on ne dépend pas du MCP Semrush (gaté derrière un
plan payant, vérifié en live). L'agent livre les leviers automatisables ; le reste est un plan
d'action daté pour Pierre. Détail complet : **[[seo-off-page-action-plan]]**.

- **Fait par l'agent** (ce PR) : `public/llms.txt`, données structurées testables, sitemap
  soumettable, `sameAs` LinkedIn intégré.
- **À faire par Pierre** (manuel) : **fiche Google Business Profile** (contenu prêt à coller fourni
  dans le plan), netlinking / annuaires métier.
- **Reporté** (décision Pierre, 2026-07-06) : Google Search Console / Bing Webmaster — pas
  prioritaire pour l'instant ; le hook de vérification par `<meta>` a été retiré du code (pas de
  code mort), réactivable via DNS TXT ou re-câblage quand voulu.

## Vérifié (runtime, serveur dev)

`<head>` de chaque type de page (title/description/canonical/OG complet/twitter), fallback OG
défaut sur pages sans image Sanity, `og:type=article` sur le détail réalisation ; JSON-LD parseable
et typé correct (Organization+LocalBusiness, WebSite, BreadcrumbList, CreativeWork) avec URLs
absolues et liaison `@id` ; `/sitemap.xml` (36 URLs) ; `/robots.txt` (Host + Sitemap) ;
`/opengraph-image` (PNG 1200×630) ; slug inconnu → 404. `npm run lint` (Biome) et `npm run build`
verts (build local : projectId dev public inline — `next build` ne charge pas `.env.development`).

## Pourquoi pas…

- **Singleton `siteSettings`** : sur-ingénierie pour un besoin de défauts qui changent rarement
  (arbitrage Pierre). Réévaluable si l'éditeur doit gérer l'image OG de secours sans redéploiement.
- **Image OG statique fournie** : Pierre a choisi la génération (aucun asset à produire, brandée,
  cohérente).
- **Auto-injection du fichier `opengraph-image`** : cassée dès qu'un `openGraph` est défini par
  page (cf. §5) → référence explicite.
- **Deux nœuds Organization + LocalBusiness séparés** : entités concurrentes pour une société à
  site unique (cf. §4).
