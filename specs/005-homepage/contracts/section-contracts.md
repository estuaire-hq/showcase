# Contrat — Composition de page & props par section

Contrat entre le **connecteur** (`(site)/page.tsx`) et les **composants présentationnels**
du design system. La page mappe les props (issues de `getHomePageProps` + statiques) vers
chaque composant DS. Aucun composant DS ne fetche (Principe VIII).

## Ordre des sections (FR-001)

`HeroSlideshow` → intro → `FeatureBlock` (expertises) → univers (`SectorButton`* +
`CaseStudyCard`*) → `FeatureBlock` (vision) → *(footer global, déjà monté par le shell)*.

## Contrat de tonalité navbar (page racine)

- Défini par la feature 003 (navbar) ; la home le **consomme** sur l'élément racine.
- Valeurs ∈ `{ onLight, onDark }` sur `data-nav-logo-tone` / `data-nav-links-tone` /
  `data-nav-toggle-tone`.
- Hero `51:2221` = sombre à gauche / clair à droite → cible attendue :
  `logo=onDark`, `links=onLight`, `toggle=onDark` (mobile, `77:3150`). **À confirmer en
  lisant le node au build** (Principe VII) — ne pas figer ici.

## Contrats props par section

### 1. Hero — `HeroSlideshow` *(nouveau composant DS)*

| Prop | Source | Notes |
|------|--------|-------|
| `label` | `props.heroLabel` | Rendu en **H1** (FR-014). |
| `slides` | `props.heroSlides[]` → `{ src, alt, titleOutline, titleFill, blurDataURL }` | `src`/`blurDataURL` via `urlFor`+`lqip`. |
| `interval?` | constante | Défilement auto (FR-002). |

- Comportement : cross-fade **image + titre ensemble**, auto, **sans contrôle** ; reduced-motion
  → 1re slide figée. Titres via `OutlineText` (contour) + `BrandText` (casse de marque).
- Géométrie exacte ← `read 51:2420` + `read 51:2221` au build.

### 2. Intro

| Élément | Source | Composant |
|---------|--------|-----------|
| Titre (option.) | `props.introHeading` | `BrandText` / échelle de type |
| Texte | `props.introText` | texte tokenisé (`text-lead`/`text-body`) |

- Texte = ancre statique (le motion porte sur les visuels, FR-011).

### 3. Expertises — `FeatureBlock` + `Button`

| Prop `FeatureBlock` | Source |
|---------------------|--------|
| `image` / `alt` | `props.expertisesImage` (`urlFor`) |
| `title` | `props.expertisesTitle` |
| `cta` | `{ label: props.expertisesCtaLabel, href: props.expertisesCtaHref }` (déf. `/expertises`) |

- Le clic CTA émet `home_cta_click {section:"expertises"}` (research §8) via wrapper client.

### 4. Univers — `SectorButton`* + `CaseStudyCard`*

| Élément | Source | Composant | Lien |
|---------|--------|-----------|------|
| Secteurs | `props.universSectors[]` | `SectorButton` | `/univers/[secteur]` (FR-004) |
| Cartes | `homeRealisations.ts` (statique) | `CaseStudyCard` | **toutes** `/realisations` (FR-005) |

- `CaseStudyCard` props : `image` (`/home/realisations/…`), `alt`=`title`, `title`,
  `meta=[sector]`, `href="/realisations"`. Effet de survol conservé (clarification spec).
- Événements : `home_sector_click {sector}` ; `home_realisation_click {card}`.

### 5. Vision — `FeatureBlock` + `Button`

| Prop `FeatureBlock` | Source |
|---------------------|--------|
| `image` / `alt` | `props.visionImage` (`urlFor`) |
| `title` | `props.visionTitle` |
| `cta` | `{ label: props.visionCtaLabel, href: props.visionCtaHref }` (déf. `/nous-decouvrir`) |

- Le clic CTA émet `home_cta_click {section:"vision"}`.

## Contrat de motion (FR-011 / FR-012)

- Chaque section est wrappée par `<Reveal>` (`src/lib/motion/`) : entrée discrète au scroll,
  une seule motion focale à la fois, titres révélés par ligne-masque.
- `prefers-reduced-motion` → contenu final visible sans transition (héritage `SmoothScroll`
  + état final des wrappers). SC-004.
- Beats exacts ← skill `estuaire-motion` (chargée avant d'animer).

## Contrat shell — bouton retour en haut (FR-015)

- `ScrollTopMount` (client) monté dans `(site)/layout.tsx` : rend `ScrollTopButton`,
  apparaît au-delà d'un seuil de scroll, `onClick` → Lenis `scrollTo(0)` (fallback natif).
- Chrome site-wide (pas spécifique à la home) — voir plan §Complexity #2.

## Invariants d'accessibilité (FR-013)

- Structure de titres : **un seul H1** (`heroLabel`) ; titres de section en `h2`.
- Toutes les images ont un `alt` ; tous les liens/CTA sont focusables et activables clavier.
- Slides, secteurs et cartes atteignables sans souris ; 0 piège clavier (SC-004).
