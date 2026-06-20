# UI Contracts — Pages de détail des secteurs (011)

Contrats des **interfaces exposées** par cette feature : la route applicative et les composants
design system ajoutés/étendus. Les composants DS sont **présentationnels** (props uniquement,
jamais de Sanity — Principe VIII). Toute valeur visuelle = tokens (Principe X).

---

## Route : `GET /univers/[slug]`

`src/app/(site)/univers/[slug]/page.tsx` (React Server Component).

```ts
type Params = { slug: string };

// SSG des 4 secteurs connus
export function generateStaticParams(): Promise<{ slug: string }[]>;
// SEO par secteur (repli maquette)
export function generateMetadata(props: { params: Promise<Params> }): Promise<Metadata>;
// Page ; slug inconnu → notFound()
export default function SectorDetailPage(props: { params: Promise<Params> }): Promise<JSX.Element>;
```

**Contrat de comportement**
- `slug ∈ {retail,bureau,residentiel,scenographie}` → page complète (hero → intro → enjeux →
  contraintes → argument → 2 citations → footer global). (FR-001, FR-003)
- `slug` inconnu → `notFound()` → page « introuvable » claire. (FR-009, SC-008)
- Déclare la tonalité de nav sur `<main>` : `data-nav-logo-tone="onDark"`,
  `data-nav-links-tone="onLight"`, `data-nav-toggle-tone="onDark"` (hero bi-ton — FR-013).
- H1 unique = `title` du secteur (porté par `PageHero`). (FR-017)

---

## `Breadcrumb` — NOUVEAU (`src/design-system/components/Breadcrumb.tsx`)

Fil d'ariane « univers / <Secteur> ». Présentationnel, tonalité héritée (`currentColor`).

```ts
type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb(props: {
  items: BreadcrumbItem[];        // ex. [{label:"univers", href:"/univers"}, {label:"Retail"}]
  separator?: string;             // défaut "/"
  className?: string;
}): JSX.Element;
```

**Contrat**
- Rendu sémantique `<nav aria-label="Fil d'ariane">` + liste ; dernier item = `aria-current="page"`.
- Item avec `href` → `<Link>` activable clavier/lecteur d'écran (FR-016, scénario 1.6).
- Casse de marque via `BrandText` ; couleur = `currentColor` (blanc dans le hero sombre).
- `text-caption` (16px maquette), `font-display`.

---

## `Pill` — NOUVEAU (`src/design-system/components/Pill.tsx`)

Étiquette non-interactive (chip) pour le nuage « contraintes terrain ». Variantes via `tv`.

```ts
type PillEmphasis = "outline" | "ink" | "accent";

export function Pill(props: {
  children: ReactNode;            // label
  emphasis?: PillEmphasis;        // défaut "outline"
  className?: string;
}): JSX.Element;
```

**Contrat (mappé sur la maquette)**
- `outline` → contour `border-ink`, texte `text-ink`, fond transparent.
- `ink` → fond `bg-ink`, texte `text-paper`.
- `accent` → fond `bg-estuaire`, texte `text-paper`.
- Rayon plein (`rounded-full`), `text-body` `font-display font-semibold`, padding du token.
- Aucune couleur en dur (Principe X). Non focusable (label décoratif, pas un contrôle).

---

## `Testimonial` — NOUVEAU (`src/design-system/components/Testimonial.tsx`)

Bloc citation : image de fond + voile + citation + attribution optionnelle. Variantes via `tv`.

```ts
type TestimonialImage = { src: string; alt: string; blurDataURL?: string };

export function Testimonial(props: {
  quote: string;                  // texte de la citation
  attribution?: string;           // optionnel — pas de bloc vide si absent (cas limite)
  image?: TestimonialImage;       // fond ; placeholder couleur si absent (anti-CLS)
  className?: string;
}): JSX.Element;
```

**Contrat**
- Image plein cadre (`object-cover`) + voile `bg-ink/25` (maquette) → contraste du texte garanti
  (FR-016, lisibilité par-dessus le visuel).
- `quote` en `text-subtitle` (50px maquette), `font-display`, `BrandText`, centré, `text-paper`.
- Guillemets décoratifs (`aria-hidden`).
- `attribution` rendue seulement si non vide ; `text-body`, `text-paper`.
- Image absente → fond `bg-ink` (dominante) pour éviter le saut de mise en page (cas limite).
- Hook d'opt-in motion : `data-parallax` sur l'image (parallaxe « fixe » de la maquette, D6) ;
  inerte sous `prefers-reduced-motion`.

---

## `PageHero` — ÉTENDU (`src/design-system/components/PageHero.tsx`)

Ajout d'un slot **optionnel** `breadcrumb` rendu en haut de la cartouche (sous la navbar,
au-dessus de l'eyebrow). N'altère aucun appelant existant (Univers, Expertises, Nous découvrir).

```ts
export function PageHero(props: {
  eyebrow?: string;
  titleOutline?: string;
  titleFill: string;
  image?: PageHeroImage;
  variant?: "overlay" | "split";  // secteur = "split"
  breadcrumb?: ReactNode;         // NOUVEAU — ex. <Breadcrumb items={…} />
  className?: string;
  cartoucheClassName?: string;
}): JSX.Element;
```

**Contrat**
- `breadcrumb` absent → comportement actuel inchangé (rétro-compatible).
- `breadcrumb` présent → rendu dans la cartouche, couleur héritée du panneau (blanc sur `ink`).

---

## Compositions de page (PAS des composants DS — Principe IV)

Restent dans `page.tsx` (agencements mono-usage, pas des primitives réutilisables) :
- **Intro** : grille `SectionTitle`/`BrandText` + cluster de 3 images (main / portrait / square).
- **Liste enjeux** : `SectionTitle` (outline/fill) + items séparés par des filets pleine largeur.
- **Argument** : `Pullquote` sur panneau `bg-cream` inséré (motif décoratif à vérifier au diff).
