# Contrat — Composition de page & props par section

Contrat entre le **connecteur dynamique** (`(site)/expertises/[expertise]/page.tsx`) et les
**composants présentationnels** du design system. Le connecteur résout le contenu par slug
(`getExpertiseSubpageProps(slug)`) et mappe les props vers chaque composant DS. Aucun composant
DS ne fetche (Principe VIII). Le **même** connecteur sert les 3 pages (gabarit identique).

## Ordre des sections (FR-002)

`PageHero` (+ `Breadcrumb`) → intro (`Pullquote` + texte + visuel) → responsable (titre + trait +
visuels) → engagements (`SectionTitle` + `EngagementsGrid`) → cas study (`SectionTitle` +
`CaseStudyCard` + bouton) → *(bloc CTA + pied de page global, montés par le shell — « BIG FOOTER »)*.

## Contrat de tonalité navbar

- Défini par la 003 (navbar) ; la page le **consomme** sur l'élément racine
  (`<main data-nav-logo-tone=… data-nav-links-tone=… data-nav-toggle-tone=…>`).
- Valeurs ∈ `{ onLight, onDark }`. Hero `02/ SLIDER` : visuel plein cadre sombre + encart blanc →
  cible attendue `onDark` (précédent « Expertises »/« Nous découvrir »). **À confirmer en lisant
  le node au build** (Principe VII) — ne pas figer ici.

## Contrats props par section

### 1. Hero + fil d'Ariane — `PageHero` *(réutilisé)* + `Breadcrumb` *(nouveau)*

| Prop / élément | Source | Composant |
|------|--------|-----------|
| `breadcrumb` | `props.breadcrumb.items` → `[{label, href?}]` (parent « Expertises » = `/expertises`) | **`Breadcrumb`** (nouveau), passé à `PageHero` via le slot `breadcrumb` (extension) |
| `eyebrow` | `props.hero.eyebrow` | `PageHero` (sur-titre `BrandText`) |
| `titleOutline` | `props.hero.titleOutline` | `PageHero` (`OutlineText`, peut contenir `\n`) |
| `titleFill` | `props.hero.titleFill` | `PageHero` — **rendu en `<h1>`** (FR-014) |
| `image` | `props.hero.image` → `{src, alt, blurDataURL?}` | `PageHero` (visuel plein cadre ; `urlFor`+`lqip`) |

- **Extension `PageHero`** (à confirmer au build) : prop optionnelle `breadcrumb?: ReactNode`
  rendue en haut du hero (overlay/au-dessus de l'encart). Si le node impose un autre placement,
  ajuster — le hero reste l'unité DS, le fil d'Ariane n'est pas positionné à la main dans la page.
- **`Breadcrumb`** (nouveau) : `<nav aria-label="Fil d'Ariane">` + items rendus avec séparateur
  `/`, casse de marque (`BrandText`). Le 1er segment cliquable mène à `/expertises` (FR-018).
- Comportement : visuel **statique** + encart titre sombre. Géométrie ← `read` du node au build.

### 2. Intro *(composée en-ligne)*

| Élément | Source | Rendu |
|---------|--------|-------|
| Phrase phare | `props.intro.statement` | `Pullquote` |
| Texte d'introduction | `props.intro.text` | `text-body`, `whitespace-pre-line` |
| Visuel d'appui | `props.intro.image` | `next/image` + LQIP, dans `<Parallax>` |
| Demi-fond bleu (agencement) | composition | panneau `bg-estuaire` (token) derrière une moitié — **pas** de composant ad hoc |

- Texte = ancre statique ; le motion porte sur le visuel (FR-012). Présence du demi-fond bleu et
  nombre de visuels lus sur `03/ INTRO` au build (l'agencement diffère de mobiliers/présentoirs).

### 3. Responsable *(composé en-ligne)*

| Élément | Source | Rendu |
|---------|--------|-------|
| Phrase d'engagement (soulignée d'un trait) | `props.responsable.statement` | `SectionTitle` ou `Pullquote` (selon le node) + trait `bg-*` |
| Visuels | `props.responsable.images[]` | cluster `next/image` + LQIP, dans `<Parallax>` |

- Phrase de synthèse du métier (FR-005), soulignée d'un trait (token, pas de valeur magique).
  Cardinalité/placement des visuels lus sur `04/ RESPONSABLE` au build.

### 4. Nos engagements — `SectionTitle` + `EngagementsGrid` *(nouveau)*

| Élément | Source | Composant |
|---------|--------|-----------|
| Titre de section | `props.engagements.titleOutline` / `titleFill` | `SectionTitle` (`<h2>` « Nos engagements ») |
| Les 6 engagements | `props.engagements.items[]` → `[{title}]` | **`EngagementsGrid`** (nouveau) |

- **`EngagementsGrid`** (nouveau, présentationnel) : `items: {title}[]` rendus en grille **3 col ×
  2 lignes** (responsive 1→2→3), chaque cellule = **numéro dérivé de l'ordre** (`01/`…, Montserrat
  Alternates) + intitulé, séparées par des **traits 3px** (tokens). Intitulés en `<h3>` (sous le
  `<h2>` de section — hiérarchie FR-014). Reste correct si un engagement est masqué/réordonné.
- Géométrie exacte (gouttières, épaisseur des traits, taille des numéros) lue sur `05/ NOS
  ENGAGEMENTS` au build.

### 5. Cas study — `SectionTitle` + `CaseStudyCard` *(réutilisé)* + bouton

| Élément | Source | Composant |
|---------|--------|-----------|
| Titre de section | `props.caseStudy.titleOutline` / `titleFill` | `SectionTitle` (« Découvrez notre dernier projet … ») |
| Bande visuelle + titre projet + meta | `props.caseStudy.{image, projectTitle, meta[]}` | **`CaseStudyCard`** (image + voile ink + titre `<h3>` + trait 3px + meta à tirets) |
| Bouton vers la réalisation | `props.caseStudy.{ctaLabel, ctaHref, slug}` | **`Button`** (extension/slot de `CaseStudyCard` ou composé sous la carte) |

- **Réutilisation `CaseStudyCard`** : correspond exactement à la bande (full-bleed + voile +
  titre + trait + meta). **Extension** (à confirmer au build) : slot bouton optionnel + passe-plat
  `data-umami-*`. La carte n'est plus cliquable en entier — c'est le **bouton** qui route (FR-007).
- **Tracking** (research §7) : `data-umami-event="case_study_click"` +
  `data-umami-event-expertise={slug}` sur le `Button` (via `umamiAttrs`).
- Contraste du voile préservé (titre/meta lisibles par-dessus l'image — cas limite « lisibilité
  incrustation »). 404 temporaire accepté tant que la réalisation n'existe pas (FR-007).

### *(BIG FOOTER — bloc CTA + pied de page)*

- **Aucune prop de page** : rendu par le shell `(site)/layout.tsx` (`Footer` révélé au scroll).
  FR-002 : la page **ne le redéfinit pas**. Le CTA contact + la plaquette y vivent (déjà tracés).

## Contrat de motion (skill `estuaire-motion`)

- `<Parallax>` autour des sections à visuels ; `data-parallax`/`data-parallax-mode` sur les
  images, `data-reveal` (line-mask) sur les titres, apparition discrète des cellules
  d'`EngagementsGrid`. Le hero est **statique** (rien au premier paint). `prefers-reduced-motion`
  → tout au repos (FR-013). Aucun nouveau primitif de motion ; beats par section arrêtés au build.

## Contrat SEO (`generateMetadata({ params })`)

- Lit `getExpertiseSubpageProps(slug).seo` : `{ metaTitle, metaDescription, ogImage }` ; repli
  maquette par slug. Titre formaté par le template racine `%s | Estuaire`. Un seul `<h1>` par page
  (hero) ; titres de section `<h2>`, intitulés d'engagement + titre projet `<h3>` (FR-014/FR-015).
- `generateStaticParams` → 3 slugs (`EXPERTISE_SLUGS`). `notFound()` si slug non résolu.
