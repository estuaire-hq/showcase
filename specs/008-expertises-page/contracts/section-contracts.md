# Contrat — Composition de page & props par section

Contrat entre le **connecteur** (`(site)/expertises/page.tsx`) et les **composants
présentationnels** du design system. La page mappe les props (issues de
`getExpertisesPageProps`) vers chaque composant DS. Aucun composant DS ne fetche (Principe
VIII).

## Ordre des sections (FR-001)

`PageHero` → intro (`Pullquote` + texte + visuels) → niveaux (`SectionTitle` + 3 ×
`FeatureBlock`) → grand visuel (`05/ BIG IMAGE` : visuel + `Pullquote` en incrustation) →
*(bloc CTA + pied de page global, déjà montés par le shell — le « BIG FOOTER »)*.

## Contrat de tonalité navbar (page racine)

- Défini par la feature 003 (navbar) ; la page le **consomme** sur l'élément racine
  (`<main data-nav-logo-tone=… data-nav-links-tone=… data-nav-toggle-tone=…>`).
- Valeurs ∈ `{ onLight, onDark }`. Hero `012/ SLIDER` : visuel plein cadre, logo blanc
  attendu → cible attendue `onDark` (précédent direct : « Nous découvrir »). **À confirmer en
  lisant le node au build** (Principe VII) — ne pas figer ici.

## Contrats props par section

### 1. Hero — `PageHero` *(réutilisé tel quel)*

| Prop | Source | Notes |
|------|--------|-------|
| `eyebrow` | `props.hero.eyebrow` | Sur-titre (« Design d'espace, agencement et présentoirs »), `BrandText`. |
| `titleOutline` | `props.hero.titleOutline` | Lignes du H1 en contour (`OutlineText`), peut contenir `\n`. |
| `titleFill` | `props.hero.titleFill` | Ligne pleine du H1 (`BrandText`). **Rendu en `<h1>`** (FR-014). |
| `image` | `props.hero.image` → `{ src, alt, blurDataURL? }` | Visuel plein cadre ; `urlFor`+`lqip`. |

- Comportement : visuel **statique** + encart titre sombre (eyebrow + trait de séparation +
  titre outline/fill). Aucun autoplay, aucun contrôle. Géométrie ← `read expertises`
  (`51:2893`) au build. Composant **inchangé** (livré par la 007).

### 2. Intro *(composée en-ligne)*

| Élément | Source | Composant |
|---------|--------|-----------|
| Phrase phare | `props.intro.statement` | `Pullquote` (ou panneau bleu `HighlightPanel`, cf. précédent 007) |
| Texte d'introduction | `props.intro.text` | `text-body`, `whitespace-pre-line` |
| Visuels d'appui | `props.intro.imagePrimary` / `imageSecondary` | `next/image` + LQIP, dans `<Parallax>` |

- Texte = ancre statique ; le motion porte sur les visuels (FR-011). Nombre/placement des
  visuels lus sur `02/ INTRO` au build.

### 3. Nos 3 niveaux d'expertise

| Élément | Source | Composant |
|---------|--------|-----------|
| Titre de section | `props.levels.titleOutline` / `titleFill` | `SectionTitle` (`<h2>` « Nos 3 niveaux d'expertise ») |
| Cartes (×3) | `props.levels.items[]` → `{ title, image, ctaLabel, ctaHref, slug }` | **3 × `FeatureBlock`** (map ; l'ordre du tableau = ordre d'affichage) |

- `FeatureBlock` par carte : `image`/`alt` (fond assombri par le voile ink 25 %), `title` =
  `level.title`, `cta` = `{ label: level.ctaLabel, href: level.ctaHref }`. Le titre de carte
  est en `font-sans` (= « Notre vision du métier d'agenceur ») sauf indication contraire du
  node (`display` bascule en Montserrat Alternates).
- **Tracking** (research §7) : transmettre `data-umami-event="expertise_level_click"` +
  `data-umami-event-level={slug}` au `Button` interne → **extension de `FeatureBlock`** (prop
  de passe-plat), à appliquer au build.
- **Ratio responsive** : si le node tablette/mobile (`87:5600` / `87:6290`) impose des ratios
  différents du `aspect-[1920/718]` figé, étendre `FeatureBlock` avec des ratios par
  breakpoint (token `aspect-*`) — extension DS délibérée (research §3.1).
- Cas limite : 1–2 niveaux masqués/réordonnés dans le CMS → la mise en page reste correcte
  (la page mappe ce que renvoie le CMS, repli sur les 3 niveaux maquette si vide).
- Hiérarchie de titres : vérifier au build que les `<h2>` de carte ne cassent pas la
  hiérarchie sous le `<h2>` de section (passer en `<h3>` si nécessaire — research §8).

### 4. Grand visuel — `05/ BIG IMAGE` *(composé en-ligne)*

| Élément | Source | Composant |
|---------|--------|-----------|
| Visuel plein largeur | `props.statement.image` | `next/image` + LQIP, sous voile ink |
| Phrase phare en incrustation | `props.statement.text` | `Pullquote` (`align="center"`, `text-paper`) |

- Reproduit la bande `statement` de la 007 (image + voile `bg-ink/25` + `Pullquote` centré,
  lisible par-dessus l'image — FR-006). À confirmer au build (`read expertises` `05/`) : si le
  traitement correspond exactement à `FeatureBlock` sans CTA, le réutiliser ; sinon composer
  en-ligne comme la 007. Contraste du voile préservé (cas limite « lisibilité incrustation »).

### *(BIG FOOTER — bloc CTA + pied de page)*

- **Aucune prop de page** : le bloc CTA et le pied de page global sont rendus par le shell
  `(site)/layout.tsx` (`Footer` révélé au scroll). FR-001/FR-010 : la page **ne les redéfinit
  pas**. Le CTA contact et la plaquette y vivent déjà (et sont déjà tracés).

## Contrat de motion (skill `estuaire-motion`)

- Wrapper `<Parallax>` autour des sections à visuels ; `data-parallax`/`data-parallax-mode`
  sur les images, `data-reveal` (line-mask) sur les titres. Le hero est **statique** (rien au
  premier paint). `prefers-reduced-motion` → tout au repos (FR-012). Aucun nouveau primitif de
  motion. Beats par section arrêtés au build en chargeant `estuaire-motion`.

## Contrat SEO (`generateMetadata`)

- Lit `props.seo` : `{ metaTitle, metaDescription, ogImage }` ; repli maquette. Titre formaté
  par le template racine `%s | Estuaire`. Un seul `<h1>` (hero) ; titres de section/cartes en
  `<h2>`/`<h3>` (hiérarchie cohérente — FR-014).
