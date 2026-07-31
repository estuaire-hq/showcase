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

---

## Addendum — 2026-07-31 · branche `hero-image-sharpness`

Le client a signalé que le hero de `/nous-decouvrir` **restait perçu comme mou** après le déploiement
ci-dessus. Le pipeline décrit ici fonctionne (vérifié : aucune URL `/_next/image`, candidats 2560 et
3840 présents, source authentiquement détaillée) — mais il ne traitait **pas** la cause du flou perçu.
Voir le post-mortem 0021 pour la leçon de méthode.

### Deux affirmations de cette ADR étaient fausses

1. **« Sanity ne produit pas d'AVIF »** — faux. `fm=avif` renvoie bien 400, mais **`auto=format`
   négocie l'AVIF** quand l'`Accept` du navigateur l'inclut. La prod servait donc déjà de l'AVIF
   (1920 : 117 KB, et non ~300 KB de WebP).
2. En prime, l'encodage AVIF est **paresseux** : une rendition *froide* répond en WebP, la **même URL**
   à chaud répond en AVIF. Le premier visiteur d'une nouvelle largeur télécharge donc plus lourd que
   le régime permanent (mesuré : `w=3840&q=60` → 306 KB WebP à froid, 178 KB AVIF à chaud). Corollaire
   méthodologique : **ne jamais conclure sur un poids ou un format depuis une seule requête sur une
   URL neuve.**

### La cause réelle du flou : le rééchantillonneur du CDN Sanity

À **largeur identique, codec identique et budget d'octets comparable**, la sortie Sanity contient
~25 % moins d'énergie haute fréquence qu'un Lanczos3 local sur la même source (métrique : moyenne du
|Laplacien| en luminance, plafond = Lanczos3 → PNG) :

| 1920×1280, source « Nous découvrir » | énergie HF | poids |
|---|---|---|
| Lanczos3 local → PNG (plafond) | 100 % | 4291 KB |
| Lanczos3 local → JPEG q80 | 93,2 % | 313 KB |
| **Sanity → JPEG q80** | **69,6 %** | 285 KB |

C'est **transverse et constant**, donc une propriété du CDN et non de cette image : 74,7 % (hero
nous-decouvrir, /4,27), 74,2 % (CTA footer, /3,43), 72,6 % (cover réalisation, /1,56), 77,4 %
(portrait, /1,65). Le codec ajoute ensuite ~8 points (AVIF q80 = 59 % du plafond vs JPEG q80 = 70 %).

Hypothèses testées et **écartées** : `object-cover` + `sizes="100vw"` ne gonflent pas la largeur peinte
sur ces heros (le conteneur, ratio 2,036, est plus paysage que l'image, 1,50 → le recadrage est
vertical, `paintedW == rectW`) ; la sélection de candidat `srcset` est correcte à tous les viewports ;
`PageHero` n'a aucun `scale`/parallax ; la source est suffisante (détail réel jusqu'à ~4096 px) ; pas
de palier `shrink-on-load` JPEG (aucun décrochage à /8 = 1656 px ni /4 = 3313 px).

**Aucun levier de netteté côté CDN** : `sharpen=10…100` produit une sortie **identique à l'octet**
(paramètre silencieusement ignoré), et monter `q` ne corrige pas un rééchantillonnage (q=85 → 62 % du
plafond seulement).

**Pourquoi surtout sur grand écran DPR 1** : en DPR 1 le resize mou de Sanity est la **dernière étape
avant l'écran**. En DPR 2, le navigateur redescend lui-même le candidat (3840 → 2880) et sa passe de
downscale, elle, est nette — ce qui masque le défaut. Le symptôme est donc un phénomène 1920/2560 DPR 1.

### Décision 5 — Suréchantillonnage opt-in des visuels full-bleed

Puisque le CDN ne sait pas livrer net à la largeur exacte, on lui demande **~2× les pixels utiles** :
la dernière réduction avant l'écran est alors faite par le **navigateur**. Mesuré de bout en bout sur
la vraie page prod, 1920×1080 DPR 1, sur les **pixels réellement peints** (capture `scale: device`) :

| servi | poids AVIF | netteté peinte |
|---|---|---|
| `w=1920 q=80` — avant | 117 KB | **65,3 %** |
| `w=2560 q=80` | 190 KB | 70,7 % |
| **`w=3840 q=60` — retenu** | **178 KB** | **76,0 %** |
| `w=3840 q=70` | 247 KB | 77,9 % |
| `w=3840 q=80` | 311 KB | 79,2 % |

`w=3840 q=60` **domine** `w=2560 q=80` sur les deux axes : **plus de pixels vaut mieux que plus de
qualité par pixel**. Retenu : +11 points de netteté pour +61 KB sur l'élément LCP (~+40 ms en 4G).

Mise en œuvre — `@/lib/images` (`oversampled(src)`) pose un marqueur `x-oversample=1` dans le `src` ;
`imageLoader.ts` le lit, le **retire** (il n'atteint jamais le réseau) et calcule
`w = min(candidat × 2, 3840, largeurSource)`, avec `q=60` **uniquement si des pixels supplémentaires
ont réellement été obtenus** (une source trop petite garde `q=80`, aucune régression).

- **Opt-in par composant, pas global** : seuls les visuels `sizes="100vw"` (`PageHero` overlay,
  `FeatureBlock`, `CaseStudyPanel`, les deux « grands visuels » de `nous-decouvrir` / `expertises`).
  Le marqueur est un simple paramètre d'URL, **agnostique de Sanity**, pour qu'un composant du design
  system puisse marquer un visuel sans importer `@/lib/sanity` (Principe VIII). Écartés : le hero
  d'accueil (`HeroSlideshow`, 50vw), `PageHero` split (43vw), `Testimonial` (94vw), `Carousel` (60vw),
  `SiteFooter` (42vw), réalisation détail (94/85vw) — boîtes plus étroites, octets non justifiés.
- **Plancher `OVERSAMPLE_FROM = 1024`** : en dessous, le candidat sert un téléphone (DPR 2+), dont la
  densité masque déjà le défaut — il paierait ~3× les octets pour un détail que l'œil ne résout pas.
  Vérifié : 390@1 → `w=640 q=80`, 390@2 → `w=828 q=80` (inchangés).
- **Coût assumé** : une tablette **768 en DPR 2** demande le candidat 1920, donc reçoit 3840 et paie
  des octets pour un gain qu'elle ne voit pas. Inhérent au `srcset` (les candidats ignorent le DPR) ;
  jugé acceptable devant la simplicité d'un seul point de décision.

### Correction au §3 — le clamp anti-upscale est un majorant, pas la largeur exacte

Les dimensions du nom de fichier Sanity sont celles de **l'upload**, pas nécessairement du fichier
stocké : le hero « Nous découvrir » s'appelle `-13252x8834` alors que **l'origine CDN fait 8192 px de
large** (même poids exact, 5 401 191 octets). Le clamp reste correct (il ne fait qu'éviter l'upscale)
mais ne doit pas être lu comme la largeur intrinsèque réelle.

### Ce qui reste non corrigible en code (confirmé, et re-qualifié)

Le §« moitié contenu » ci-dessus attribuait les bandes univers 531–593 px à des uploads client. C'est
inexact : ces quatre fichiers viennent de **`seed-assets/sectorsPage/`**, donc de nos propres exports
de maquette (24–40 KB), poussés en dev **et** en prod par le seed. Mesuré sur `/univers` : source
551 px peinte sur **2016 px physiques** en 1920 DPR 1 et **3024 px** en 1440 DPR 2 → agrandissement
**×3,7 à ×5,5**. Dans la maquette, chaque bande empile deux fills image et **le visible est le dernier
avant le voile** : pour « Retail » c'est `51:3455`, **4096×2730** — notre seed a pris celui du dessous,
masqué, à 551 px. Bilan : *retail* 551 → 4096 px et *scénographie* 531 → 1024 px sont récupérables
depuis la maquette ; *bureau* (593 px) et *résidentiel* (550 px) n'ont rien de mieux et exigent de
vraies photos. Traité hors de cette branche (remplacer des assets LFS seedés implique un reseed de
contenu prod déjà en ligne).
