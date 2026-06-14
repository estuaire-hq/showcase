# Phase 0 — Recherche & décisions

Décisions de conception pour l'implémentation de la page d'accueil. Chaque point :
**Décision** / **Justification** / **Alternatives rejetées**. Aucune valeur de design
n'est figée ici : la géométrie exacte est lue au build sur les nodes Figma complets
(Principe VII). Cette phase résout l'architecture et lève les `NEEDS CLARIFICATION`.

## 0. Faits vérifiés sur le socle existant (base des décisions)

| Fait | Source vérifiée |
|------|-----------------|
| Singleton `homePage` ne contient qu'un **test jetable** (`title` + `tagline`), à supprimer entièrement. Épinglé dans `structure.ts` (`.documentId("homePage")`). | `src/sanity/schemas/documents/homePage.ts`, `src/sanity/structure.ts` |
| `HOME_PAGE_QUERY` ne projette que `title, tagline`. | `src/lib/sanity/queries.ts` |
| Revalidation : webhook → `revalidateTag("sanity", "max")` invalide **tout** le cache Sanity en un coup. | `src/app/api/revalidate/route.ts` |
| Shell `(site)` : `SmoothScroll` (Lenis + GSAP ticker, fallback reduced-motion) > `Navbar` > `FooterReveal(footer=<Footer/>)`. Footer auto-monté, sans props. | `src/app/(site)/layout.tsx`, `src/lib/motion/` |
| Tonalité navbar : la page déclare `data-nav-logo-tone` / `data-nav-links-tone` / `data-nav-toggle-tone` ∈ `{onLight, onDark}` sur un élément racine ; en sticky la navbar force `onLight`. | `src/components/Navbar.tsx`, `src/design-system/nav.ts` |
| `ScrollTopButton` existe dans le DS mais **n'est monté nulle part** (sauf lab/kit). Le layout note « will join this shell later ». | `src/design-system/components/ScrollTopButton.tsx`, `src/app/(site)/layout.tsx` |
| DS prêt : `Slideshow` (cross-fade auto + reduced-motion), `FeatureBlock` (image+titre+CTA), `CaseStudyCard` (image+titre+meta+href), `SectorButton`, `Button` (5 tons), `BrandText`/`OutlineText`. | `src/design-system/index.ts` |
| `Slideshow` cross-fade des **images uniquement** ; pas d'overlay titre synchronisé. | `src/design-system/components/Slideshow.tsx` |
| Helper `trackEvent(name, data)` (Umami, no-op gardé, sans PII) disponible. Tracker injecté en prod via env. | `src/lib/utils.ts`, `src/app/layout.tsx` |
| Pattern singleton de référence (footer) : schema → `queries.ts` → `lib/sanity/footer.ts` (fetch+defaults+`urlFor`) → `src/content/footer.ts` (copie unique) → `seed/documents/footer.seed.ts`. | `src/components/Footer.tsx` & co. |
| Cache Figma : `home` (`51:2221` desktop / `77:3149` tablette / `77:3150` mobile) + `home/slideshow` (`51:2420`) présents, renders disponibles. Lecture : `npm run figma -- read <node|nom>`. | `.design/figma-cache/index.json` |
| Routes cibles confirmées : `/expertises`, `/nous-decouvrir`, `/univers` (+ `/univers/[secteur]`), `/realisations`, `/contact`. | `src/content/navigation.ts` |

## 1. Frontière donnée/présentation : la page est le connecteur (pas un wrapper global)

**Décision** : le contenu de la home est fetché par **la page** (`(site)/page.tsx`, RSC),
via une fonction de mapping `getHomePageProps()` isolée dans `@/lib/sanity/homePage.ts`
(miroir exact de `getFooterProps`). La page passe les props aux composants DS. **Pas**
de composant connecté dans `src/components/`.

**Justification** : Principe VIII distingue explicitement le contenu **global/singleton
consommé partout** (footer, header → wrapper connecté `src/components/`) du contenu
**spécifique à une page** (→ fetché par la page). Le singleton `homePage` n'est consommé
que par `/` : c'est du contenu de page. Le mapping isolé garde le DS présentationnel et
testable, et `page.tsx` mince.

**Alternatives rejetées** : un wrapper `src/components/HomePage.tsx` — inutile (aucune
réutilisation cross-page) et contraire au cadrage du Principe VIII ; fetch inline dans
`page.tsx` sans couche de mapping — mélangerait fetch/defaults/`urlFor` avec la
composition (le footer prouve que la couche `lib/sanity/<doc>.ts` paie).

## 2. Modèle de contenu `homePage` : schéma réécrit from scratch, champs groupés à plat

**Décision** : **réécrire** le singleton from scratch avec des champs **à plat assignés à
des `groups`** Sanity (onglets : `hero`, `intro`, `expertises`, `univers`, `vision`,
`seo`), comme le footer. Les champs de test `title`/`tagline` sont **purement supprimés**
(jetables — ils ne sont ni conservés, ni repris, ni convertis en `seo.metaTitle`, qui est
un champ neuf avec son propre défaut maquette). Forme détaillée dans `data-model.md`. Le
titre de hero porte un traitement **contour/plein** par slide (`titleOutline` /
`titleFill`), exactement comme `ctaTitleOutline`/`ctaTitleFill` du footer.

**Justification** : la cohérence avec le footer minimise la charge cognitive et réutilise
le pipeline TypeGen+seed éprouvé. Les `groups` donnent une UX d'édition lisible pour un
singleton riche. Le traitement contour/plein est déjà un précédent du DS (`OutlineText`)
et du footer.

**Alternatives rejetées** : un champ Portable Text monolithique — l'éditeur perdrait la
structure par section et le front ne pourrait pas mapper proprement vers les composants
DS ; des documents séparés par section — sur-modélisation (Principe IV) pour un singleton.

## 3. Cartes de réalisations statiques : données + images hors CMS (exception II, bornée)

**Décision** : les ~6 cartes vivent dans `src/content/homeRealisations.ts`
(`{ image, sector, title }[]`, `href` constant `/realisations`) ; leurs images sont
committées sous `public/home/realisations/`. Toutes les cartes pointent vers
`/realisations` (FR-005, pas de deep-link). Mappées vers `CaseStudyCard`
(`image, alt=title, title, meta=[sector], href`).

**Justification** : FR-005 — aucun modèle « réalisation » dans cette feature ; il sera
conçu avec la feature « Réalisations », qui rebranchera ces cartes (sur Sanity + détail
`/realisations/[slug]`). Exception **documentée et temporaire** au Principe II
(Complexity Tracking #1). `public/` est le seul emplacement servi pour des images non-CMS ;
les renders Figma (`.design/`) ne sont jamais servis.

**Alternatives rejetées** : modéliser dans Sanity maintenant — duplique le futur modèle,
rework garanti (anti-IV) ; importer les images via `import` statique (`next/image` static
import) — viable mais `public/` reste plus simple et cohérent avec un futur remplacement
1:1 par des URLs Sanity. Marqué pour migration (FR-005).

## 4. Hero multi-slides : nouveau primitif DS `HeroSlideshow` (image + titre synchronisés)

**Décision** : ajouter au design system un composant `HeroSlideshow` qui **cross-fade
image ET titre ensemble** (FR-002), réutilisant la logique de fondu de `Slideshow`.
Props pressenties : `{ label, slides: { src, alt, titleOutline, titleFill, blurDataURL? }[], interval? }`
— `label` = le petit label H1 (FR-014), titres via `OutlineText`+`BrandText`. Défilement
**automatique, sans contrôle** (ni flèches ni puces) ; sous `prefers-reduced-motion`,
première slide figée. API finale confirmée en lisant `51:2420` + `51:2221` au build.

**Justification** : Principe X — un visuel de marque réutilisable s'**ajoute au DS**,
jamais dupliqué ad hoc dans la page. `Slideshow` ne synchronise que des images ; FR-002
exige image+titre couplés. Encapsuler le fondu, l'auto-play, le reduced-motion et le
traitement de titre dans un composant DS unique garde la page mince et le motion testable
en isolation (lab).

**Alternatives rejetées** : composer image + titre à la main dans `page.tsx` — dupliquerait
la logique de fondu, violerait le Principe X (réimplémentation ad hoc) ; étendre `Slideshow`
avec un slot overlay générique — couplerait un composant atomique simple à une préoccupation
hero (responsabilité unique perdue). `CarouselArrow` existe mais **n'est pas utilisé** ici
(maquette sans contrôle manuel — clarification de la spec).

## 5. Motion de scroll : wrappers réutilisables dans `src/lib/motion/`

**Décision** : les reveals au scroll (révélation de titre par ligne-masque, entrée des
visuels) sont des **composants client réutilisables** dans `@/lib/motion/` (ex. `Reveal`),
consommés par la page autour des sections DS. Ils s'appuient sur GSAP + ScrollTrigger
**déjà câblés** par `SmoothScroll`. Une seule motion focale à la fois (FR-011). Le détail
des beats vient de la skill **`estuaire-motion`**, chargée avant d'animer.

**Justification** : le motion est du **comportement**, pas de la présentation — il n'a pas
sa place dans le DS présentationnel (Principe VIII) ; `src/lib/motion/` est l'emplacement
établi (`SmoothScroll`, `FooterReveal`, `usePrefersReducedMotion`). Réutiliser
l'infrastructure Lenis/GSAP existante évite tout nouveau setup (Principe IV).

**Alternatives rejetées** : animer dans les composants DS — casserait leur pureté/isolation ;
réintroduire `framer-motion` — la stack est GSAP (constitution), aucun besoin nouveau.

## 6. Préférence « réduire les animations » : héritée + explicite par primitif

**Décision** : `prefers-reduced-motion` est honoré à trois niveaux : (a) `SmoothScroll`
désactive Lenis et rend le scroll natif ; (b) `Slideshow`/`HeroSlideshow` figent la
première slide ; (c) les wrappers `Reveal` rendent le contenu **final visible** sans
transition. Hook existant `usePrefersReducedMotion`. FR-012 / SC-004.

**Justification** : socle déjà conçu ainsi ; il suffit que le hero et les reveals
respectent le même contrat. Garantit un rendu statique complet et lisible (SC-004).

**Alternatives rejetées** : un seul interrupteur global — insuffisant, chaque primitif de
motion doit dégrader proprement vers son état final.

## 7. SEO & métadonnées : `generateMetadata` lisant le singleton + H1 = petit label

**Décision** : ajouter `seo.metaTitle` / `seo.metaDescription` / `seo.ogImage` au singleton
(défauts maquette). `page.tsx` exporte `generateMetadata()` qui lit ces champs (via le même
fetch que la page ou un fetch dédié) et renvoie `title`, `description`, `openGraph.images`
(`urlFor(ogImage)`). Le template racine `"%s | Estuaire"` s'applique. Le **H1 unique** est
le **petit label** au-dessus des grands titres (FR-014), porté par `HeroSlideshow.label`.

**Justification** : FR-007/FR-014 — métadonnées éditables avec repli maquette. Le layout
racine fournit déjà `title.template` + description par défaut ; il reste à fournir les
valeurs spécifiques home et l'image OG (absente aujourd'hui).

**Alternatives rejetées** : métadonnées codées en dur — viole FR-014 (éditable) et le
Principe II ; H1 = grand titre du hero — contredit la maquette (FR-014 : H1 = petit label).

## 8. Tracking d'événements (Principe VI) : décision explicite

**Décision** : tracer via le helper existant `trackEvent` (`@/lib/utils`) les interactions
porteuses de valeur de la home :

| Interaction | Événement Umami | Props (sans PII) |
|-------------|-----------------|------------------|
| Clic CTA « Nos expertises » | `home_cta_click` | `{ section: "expertises" }` |
| Clic CTA « Notre vision » | `home_cta_click` | `{ section: "vision" }` |
| Clic lien univers/secteur | `home_sector_click` | `{ sector: <slug> }` |
| Clic carte de réalisation | `home_realisation_click` | `{ card: <index|slug> }` |

Le hero **n'a pas de CTA** (clarification spec) → aucun événement. Les événements sont
émis depuis des **wrappers client** (ou via `data-umami-event`), pour garder le DS pur
(Principe VIII ; précédent : la navbar trace son CTA hors DS).

**Justification** : Principe VI impose un choix **documenté**, pas un oubli. Ces clics
mesurent l'orientation du visiteur depuis la home (quel univers / quelle expertise attire).
L'infra Umami + `trackEvent` existe déjà → coût quasi nul.

**Alternatives rejetées** : ne rien tracer — laisserait la home aveugle alors que c'est la
porte d'entrée principale ; tracer chaque survol/scroll — pollue les données et la privacy
(travers explicitement écarté par le Principe VI).

## 9. Bouton de retour en haut : montage dans le shell (FR-015)

**Décision** : monter `ScrollTopButton` dans `(site)/layout.tsx` via un wrapper client
`ScrollTopMount` qui (a) apparaît au-delà d'un seuil de scroll, (b) appelle Lenis
`scrollTo(0)` (fallback `window.scrollTo`) au clic. Chrome **site-wide**.

**Justification** : FR-015 l'exige et le composant existe sans être monté ; c'est du chrome
global, pas spécifique à la home (le layout l'anticipe déjà). Déviation bornée et documentée
(Complexity #2) — **à confirmer par Pierre** car elle complète le « shell déjà livré ».

**Alternatives rejetées** : montage home-only dans `page.tsx` — mauvaise altitude, rework à
la 1re autre page ; laisser non monté — viole FR-015.

## 10. Workflow d'implémentation (séquence Sanity, par CLAUDE.md)

**Décision** : suivre l'ordre « Adding a New Sanity Content Type » : (1) étendre le schéma →
(2) `npm run typegen` → (3) `HOME_PAGE_QUERY` complète → (4) `getHomePageProps` + defaults →
(5) `src/content/homePage.ts` (copie maquette, lue depuis Figma) → (6) `seed:scaffold homePage`
→ remplir → `seed-assets/homePage/` → `registry.ts` → `seed:check` → `seed` (dev). Prod seedé
par la CI. Build pixel-perfect des sections en parallèle (skills `estuaire-pixel-perfect` +
`estuaire-figma-cli` + `estuaire-motion`).

**Justification** : ordre éprouvé (footer), garantit types dérivés + seed validé avant front
(Principe IX). Le détail ordonné des tâches relève de `/speckit.tasks`.

**Alternatives rejetées** : coder le front avant le schéma/types — risque de dérive
schéma↔front que le Principe IX cherche justement à éviter.

## Récapitulatif des décisions

| # | Décision | Impact |
|---|----------|--------|
| 1 | Page = connecteur ; mapping `lib/sanity/homePage.ts` | Principe VIII |
| 2 | Schéma à plat + `groups` ; stub superseded ; titres contour/plein | data-model |
| 3 | Réalisations statiques : `content/homeRealisations.ts` + `public/home/realisations/` | Exception II (bornée) |
| 4 | Nouveau primitif DS `HeroSlideshow` (image+titre synchro) | Principe X, FR-002 |
| 5 | Motion dans `src/lib/motion/` (`Reveal`) | Principe VIII, FR-011 |
| 6 | Reduced-motion à 3 niveaux | FR-012, SC-004 |
| 7 | `generateMetadata` + champs SEO éditables ; H1 = petit label | FR-007/014 |
| 8 | Événements Umami sur CTA/secteurs/cartes via `trackEvent` | Principe VI |
| 9 | `ScrollTopButton` monté dans le shell (à confirmer) | FR-015, Complexity #2 |
| 10 | Séquence schéma→typegen→query→mapping→content→seed | Principe IX |
