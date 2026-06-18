# Contrat — Composition de page & props par section

Contrat entre le **connecteur** (`(site)/univers/page.tsx`) et les **composants
présentationnels** du design system. La page mappe les props (issues de
`getSectorsPageProps`) vers chaque composant DS. Aucun composant DS ne fetche (Principe VIII).

## Ordre des sections (FR-001)

`PageHero` → intro (en-ligne : panneau crème + image + statement + texte) → secteurs
(4 × `SectorBand`) → infos clés (grille 2×2 en-ligne) → *(footer global + CTA « Une
question, un projet ? » + retour-en-haut, déjà montés par le shell)*.

## Contrat de tonalité navbar (page racine)

- Défini par la feature 003 (navbar) ; la page le **consomme** sur l'élément racine
  (`<main data-nav-logo-tone=… data-nav-links-tone=… data-nav-toggle-tone=…>`).
- Valeurs ∈ `{ onLight, onDark }`. Hero `02/ SLIDER` **split** (panneau noir `bg-ink` à
  gauche / blanc à droite) : cible **planifiée** `logo=onDark` (logo blanc sur le noir),
  `links=onLight` (menu sur le blanc). **À confirmer en lisant le node au build**
  (Principe VII — node `51:3386`, HEADER : logo `#ffffff`, libellés `#0e1215`) — ne pas figer.

## Contrats props par section

### 1. Hero — `PageHero` *(composant DS existant)*

| Prop | Source | Notes |
|------|--------|-------|
| `eyebrow` | `props.hero.eyebrow` | Sur-titre 2 lignes (`whitespace-pre-line`). |
| `titleOutline` | `props.hero.titleOutline` | Lignes en contour (`OutlineText`). |
| `titleFill` | `props.hero.titleFill` | Lignes pleines. Le titre complet est le **H1** (FR-014) via `BrandText`. |
| `image` | `props.hero.image` → `{ src, alt, blurDataURL? }` | Visuel à droite ; `urlFor` + `lqip`. |

- Comportement : **statique** (aucun autoplay/carrousel — Principe I). Géométrie exacte ←
  `read secteurs` au build (encart `@(135,220)`, fond split, image `@(1029,220) 751×603`).
- **À confirmer au build** : si `PageHero` ne gère pas le **fond split** (noir gauche /
  blanc droite), ajouter une variante/prop `background` au composant DS (additif), pas une
  réimplémentation locale (Principe X).

### 2. Intro *(composée en-ligne)*

| Élément | Source | Rendu |
|---------|--------|-------|
| Panneau de fond | — | `bg-cream` (gauche, derrière l'image) |
| Visuel | `props.intro.image` | `next/image` + LQIP, dans `<Parallax>` (gauche) |
| Phrase de positionnement | `props.intro.statement` | `text-subtitle`, Montserrat Alternates (droite) |
| Texte d'introduction | `props.intro.text` | `text-body`, `whitespace-pre-line` (droite) |

- Texte = ancre statique ; le motion porte sur le visuel (FR-011). Responsive : image puis
  texte empilés sous `md`.

### 3. Secteurs — `SectorBand` *(nouveau composant DS, ×4)*

Pour chaque `props.sectors[i]` :

| Prop | Source | Notes |
|------|--------|-------|
| `label` | `sector.label` | Titre 75px (`BrandText`/`SectionTitle`), superposé. |
| `promise` | `sector.promise` | Phrase de promesse, sous le trait. |
| `href` | `sector.href` | « en savoir plus » → `/univers/<slug>` (404 temp OK — FR-005). |
| `image` | `sector.image` → `{ src, alt, blurDataURL? }` | Visuel **plein-cadre**, sous voile. |
| `ctaUmamiEvent` | `"sector_cta_click"` | + `ctaUmamiData={{ sector: <slug from href> }}` (Principe VI, research §7). |

- Comportement : image `fill object-cover` + **voile** `bg-ink/25` (opacité maquette 0.253)
  ; contenu superposé aligné à gauche (`px` container) ; CTA = `Button tone="light" arrow`
  (le DS impose le pill — « en savoir plus », cf. `Button` tone `light`). Titre + phrase +
  bouton restent lisibles par-dessus le visuel (Scénario 2 §3 / cas limite contraste).
- Hooks motion : `data-reveal` (titre, line-mask) + `data-parallax` (image) — comme
  `SplitSection`. La mise en page ne casse pas pour 3 ou 5 secteurs (cas limite).
- **À confirmer au build** : hauteur (718px desktop → `min-h` adaptatif), position exacte
  du trait/CTA, présence d'un rang « 01/02 » (la maquette n'en montre pas sur cette page).

### 4. Infos clés *(composée en-ligne)*

| Élément | Source | Rendu |
|---------|--------|-------|
| Panneau de fond | — | `bg-cream` pleine largeur |
| Chiffres (×4) | `props.keyFigures[]` → `{ value, support }` | Grille **2×2**, mappée |
| Intitulé | `keyFigure.value` | `text-title` (`BrandText`), `text-ink` |
| Phrase d'appui | `keyFigure.support` | `text-lead`, Montserrat 600, `text-ink` |
| Séparateurs | — | **croix** : `<hr>` horizontal + séparateur vertical, `border-ink` (desktop) |

- Responsive : 2×2 → 1 colonne sous `md` ; la croix de séparation est neutralisée en
  empilement. Le texte ne déborde pas (cas limite « texte plus long »).

## Contrat de motion (skill `estuaire-motion`)

- Wrapper `<Parallax>` autour des sections à visuels ; `data-parallax`/`data-parallax-mode`
  sur les images, `data-reveal` (line-mask) sur les titres. Le hero est **statique** (rien
  au premier paint). Une seule motion focale à la fois (FR-011). `prefers-reduced-motion` →
  tout au repos (FR-012). **Aucun nouveau primitif de motion** (réutilise `@/lib/motion`).

## Contrat SEO (`generateMetadata`)

- Lit `props.seo` : `{ metaTitle, metaDescription, ogImage }` ; repli maquette. Titre
  formaté par le template racine `%s | Estuaire`. Un seul `<h1>` (hero) ; les titres de
  section (secteurs, chiffres) en `<h2>`/`<h3>` cohérents (FR-013/014).
