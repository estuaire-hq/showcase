# 0027 — Livraison des images via un loader Sanity (bypass de l'optimiseur next/image)

**Statut** : accepté · **Date** : 2026-07-25 · **Branche** : `hero-image-quality`

> Numéro 0027 : suite de 0026. Des worktrees parallèles non mergés
> (`realisations-filter-rework`, `mobile-responsive-typography`) peuvent avoir pris le même
> numéro. Réconcilier / renuméroter au merge, skill `estuaire-branch-sync`.

## Contexte

Le client (Sébastien) signale des **heros full-bleed très pixelisés sur grand écran**, alors que
certaines sources uploadées sont excellentes. Diagnostic confirmé **par observation** (URLs servies,
`srcset` réel, dimensions curl-vérifiées), pas seulement par lecture du code.

Cause racine **double** :

1. **Pipeline (le bug code).** `mapImage.ts` / `footer.ts` construisaient une URL Sanity plafonnée
   (`urlFor(img).width(1920|1600).auto("format")`, sans `.quality()`). Cette URL `cdn.sanity.io?w=1920`
   était ensuite passée en `src` à `<Image>`, donc **re-proxyée par l'optimiseur intégré
   `/_next/image`**. Conséquences observées :
   - **Plafond dur à 1920** : chaque candidat du `srcset` (jusqu'à `3840w`) pointait vers une source
     déjà réduite à 1920 → gain nul au-delà. Sur 2560/4K (et a fortiori en DPR 2), l'image livrée
     (≤ 1920) était étirée par `object-cover` → **flou**.
   - **Double compression** (Sanity puis Next) et **tout le ré-encodage exécuté sur le VPS OVH**
     (`output: standalone`).
2. **Contenu (hors code).** Beaucoup de sources prod sont trop petites pour du plein cadre grand
   écran. Sur **266 images prod, 145 (55 %) font < 1600 px de large, 195 (73 %) < 2560 px**. Exemples
   critiques : bandes univers (`FeatureBlock`) 531–593 px, hero résidentiel 550×251, heros
   univers/expertises/sous-pages 1365 px, plusieurs covers réalisations < 1600 px, cover `ibis`
   **manquante** (réf. cassée). Aucun réglage de pipeline ne peut inventer ces pixels.

Faits mesurés utiles à la décision :
- Sanity sert **exactement** la largeur demandée (jusqu'à 3840+ depuis une source 6455–7008 px), sans
  plafond côté service.
- **Sanity ne produit pas d'AVIF** (`fm=avif` → HTTP 400) ; le format moderne disponible est **WebP**
  (`auto=format`), déjà ~2× plus léger que JPEG (3840 : ~326 KB WebP vs ~772 KB JPEG q80).

## Décisions

### 1. Le CDN Sanity devient l'optimiseur, via un `loaderFile` custom

`next.config.ts` : `images.loader = "custom"` + `images.loaderFile =
"./src/lib/sanity/imageLoader.ts"`. Un loader custom **remplace** l'optimiseur intégré : `next/image`
garde tout son rôle (génération du `srcset`, `sizes`, `priority`, lazy, LQIP) mais le navigateur va
chercher `cdn.sanity.io` **directement**, à la largeur exacte de chaque candidat, **en une seule
passe**. Plus de `/_next/image`, plus de double compression, **plus aucune charge d'optimisation
d'image sur le VPS**.

- **Pourquoi (vs garder l'optimiseur Next + relever la source)** : l'option « Next optimise » gardait
  la double compression et faisait ré-encoder du 3840 sur le VPS à chaque hero. Le loader Sanity est
  le pattern idiomatique d'un site Sanity, plus propre (une passe = plus fidèle à la source, l'objet
  du ticket) et plus **chirurgical** (voir §4).
- **Arbitrage assumé** : on **perd l'AVIF** (Sanity n'en fait pas) → WebP. WebP q80 est excellent et
  le flou venait de l'upscaling, pas de la compression.

### 2. Plafond **3840 / 4K**, `deviceSizes` avec 2560 ajouté

`deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840]` (défaut Next + 2560). Le `srcset`
monte donc réellement à 3840 (net en 4K DPR 1 et QHD ; QHD DPR 2 légèrement soft mais bien mieux que
1920). Le **2560** ajouté donne un candidat bien dimensionné aux full-bleed QHD (~188 KB WebP) au lieu
de sauter à 3840. On ne monte **pas** au-delà de 3840 (du 7680 pour du 4K DPR 2 serait un poids absurde
pour un gain imperceptible) : « net sans gâcher la bande passante ».

### 3. Qualité **80**, WebP, clamp anti-upscale

Le loader force `q=80` (`quality ?? 80` ; `next/image` passe `undefined` à un loader custom quand
aucune prop `quality` n'est posée — vérifié), `auto=format` (WebP), et **clampe `w` à la largeur
intrinsèque de la source** (lue dans le nom de fichier Sanity `…-<W>x<H>.<ext>`) pour ne jamais
upscaler une petite source (bande passante gâchée + re-flou). Les paramètres posés en amont sont
**préservés** (ex. `fit=crop` des CTA footer). Les `src` non-Sanity (images statiques `/lab`
temporaires) sont servies telles quelles (passthrough).

### 4. `mapImage` / connecteurs / `footer` **inchangés**

Le loader écrase `w`/`q` pour le rendu `<Image>`, donc les `.width(1920|1600)` existants ne servent
plus que de base pour les **URLs directes** (images OpenGraph / metadata, non rendues via `<Image>`,
qui gardent ainsi leur largeur fixe voulue, ex. OG 1200). Résultat : le fix tient en **1 fichier
loader + 11 lignes de config**, sans toucher les connecteurs.

## Conséquences

- Les heros à belle source (nous-decouvrir 13252 px, reebok/skatepark/van-rycke 6000–7000 px…) sont
  **nets jusqu'en 4K**, servis directement par le CDN Sanity en WebP q80. Vérifié en direct :
  `viaNextImage: 0` sur toutes les pages hero, `broken: 0`, requêtes `cdn.sanity.io?w=<candidat>&q=80&auto=format`.
- **Aucune régression** : changement d'URL d'images uniquement, zéro CSS/géométrie touché (cadrage
  identique) ; les petites sources ne sont **pas** dégradées (le loader supprime l'upscale-puis-recompression
  et sert la résolution native).
- **La bande passante image passe côté quota Sanity** (plan Free : 100 GB/mois). Vu les poids WebP et
  le trafic d'un site vitrine, la marge est large ; à surveiller si le trafic explose. Le VPS, lui, est
  **déchargé** du travail d'image.
- **La moitié « contenu » n'est pas corrigible en code.** Les sources trop petites (55 % du parc,
  bandes univers, plusieurs covers, hero résidentiel, cover `ibis` cassée) resteront molles en plein
  cadre tant qu'elles ne sont pas **remplacées par des images plus grandes** (viser ≥ 2560 px, idéal
  3840 px). Action **éditoriale côté client**, transmise séparément.
- Gate : `npm run lint` OK. `next build` non lancé dans le worktree (partagerait `.next` avec le dev
  server) ; le loader est validé au runtime + typecheck.
