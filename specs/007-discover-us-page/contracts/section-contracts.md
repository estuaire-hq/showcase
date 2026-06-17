# Contrat — Composition de page & props par section

Contrat entre le **connecteur** (`(site)/nous-decouvrir/page.tsx`) et les **composants
présentationnels** du design system. La page mappe les props (issues de
`getAboutPageProps`) vers chaque composant DS. Aucun composant DS ne fetche (Principe VIII).

## Ordre des sections (FR-001)

`PageHero` → intro (`Pullquote` + 2 visuels + statement) → vision (`SectionTitle` +
visuels) → atelier (`SectionTitle` + piliers + capacités + visuels + `Pullquote`) → mode
opératoire (`SectionTitle` + intro + 4 × étape) → `FeatureBlock` (grand visuel +
incrustation) → CTA (`Button`) → *(footer global, déjà monté par le shell)*.

## Contrat de tonalité navbar (page racine)

- Défini par la feature 003 (navbar) ; la page le **consomme** sur l'élément racine
  (`<main data-nav-logo-tone=… data-nav-links-tone=… data-nav-toggle-tone=…>`).
- Valeurs ∈ `{ onLight, onDark }`. Hero `02/ SLIDER` : logo blanc sur le visuel → cible
  attendue `logo=onDark` ; liens/menu selon la zone surplombée ; toggle mobile sur le
  visuel. **À confirmer en lisant le node au build** (Principe VII) — ne pas figer ici.

## Contrats props par section

### 1. Hero — `PageHero` *(nouveau composant DS)*

| Prop | Source | Notes |
|------|--------|-------|
| `title` | `props.hero.title` | Rendu en **H1** (FR-016) via `BrandText`. |
| `image` | `props.hero.image` → `{ src, alt, blurDataURL? }` | Visuel plein cadre ; `urlFor`+`lqip`. |

- Comportement : visuel **statique** + encart titre sombre avec trait de séparation.
  Aucun autoplay, aucun contrôle. Géométrie exacte ← `read 51:2699` (encart `@(140,620)`)
  au build.

### 2. Intro

| Élément | Source | Composant |
|---------|--------|-----------|
| Phrase de positionnement | `props.intro.statement` | type tokenisé (`text-lead`/`text-title-sm`) |
| Texte d'introduction | `props.intro.text` | `text-body`, `whitespace-pre-line` |
| Visuels (×2) | `props.intro.imagePrimary` / `imageSecondary` | `next/image` + LQIP, dans `<Parallax>` |
| Phrase phare | `props.intro.highlight` | `Pullquote` *(nouveau DS)* |

- Texte = ancre statique ; le motion porte sur les visuels (FR-013).

### 3. Vision

| Élément | Source | Composant |
|---------|--------|-----------|
| Titre | `props.vision.titleOutline` / `titleFill` | `SectionTitle` |
| Texte | `props.vision.text` | `text-body`, `whitespace-pre-line` |
| Visuels | `props.vision.images[]` | `next/image` + LQIP, slots par index, `<Parallax>` |

### 4. Atelier

| Élément | Source | Composant |
|---------|--------|-----------|
| Titre | `props.atelier.titleOutline` / `titleFill` | `SectionTitle` |
| Texte | `props.atelier.text` | `text-body` |
| Intro piliers | `props.atelier.pillarsLead` | type tokenisé |
| Piliers (×3) | `props.atelier.pillars[]` | rendu en-ligne (type de marque) |
| Capacités (×3) | `props.atelier.capabilities[]` | rendu en-ligne (liste) |
| Visuels | `props.atelier.images[]` | `next/image` + LQIP, slots par index, `<Parallax>` |
| Phrase phare | `props.atelier.highlight` | `Pullquote` |

### 5. Mode opératoire

| Élément | Source | Composant |
|---------|--------|-----------|
| Titre | `props.process.titleOutline` / `titleFill` | `SectionTitle` |
| Intro | `props.process.intro` | `text-body` |
| Étapes (×4) | `props.process.steps[]` → `{ number, title, text, bullets[], images[] }` | composées **en-ligne** (map) : numéro + titre + texte + puces + visuels `<Parallax>` |

- Composition en-ligne (research §6) ; chaque étape lit sa disposition sur la maquette au
  build. Une étape sans `bullets` rend une mise en page correcte (cas limite).

### 6. Grand visuel — `FeatureBlock`

| Prop | Source | Notes |
|------|--------|-------|
| `image` / `alt` | `props.statement.image` | Plein largeur, sous voile. |
| `title` | `props.statement.text` | Phrase en incrustation ; `Pullquote` si le traitement typographique l'exige. |
| `cta` | — | **Omis** (pas de CTA sur cette bande). |

- À confirmer au build (`read 51:2881`) : si le ratio/traitement divergent, ajouter une
  variante à `FeatureBlock` plutôt qu'un nouveau composant (research §5).

### 7. CTA « découvrir nos expertises » — `Button`

| Prop | Source | Notes |
|------|--------|-------|
| `href` | `props.cta.href` (def. `/expertises`) | Route prévue ; 404 temporaire OK (FR-008). |
| children | `props.cta.label` | « découvrir nos expertises ». |
| `data-umami-event` | `"about_cta_click"` + `data-umami-event-section="expertises"` | Tracking (Principe VI, research §7). |

## Contrat de motion (skill `estuaire-motion`)

- Wrapper `<Parallax>` autour des sections à visuels ; `data-parallax`/`data-parallax-mode`
  sur les images, `data-reveal` (line-mask) sur les titres. Le hero est **statique** (rien
  au premier paint). `prefers-reduced-motion` → tout au repos (FR-014). Aucun nouveau
  primitif de motion.

## Contrat SEO (`generateMetadata`)

- Lit `props.seo` : `{ metaTitle, metaDescription, ogImage }` ; repli maquette. Titre
  formaté par le template racine `%s | Estuaire`. Un seul `<h1>` (hero) ; sections en `<h2>`.
