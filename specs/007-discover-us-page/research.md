# Phase 0 — Recherche & décisions

Décisions de conception pour l'implémentation de la page « Nous découvrir ». Chaque
point : **Décision** / **Justification** / **Alternatives rejetées**. Aucune valeur de
design n'est figée ici : la géométrie exacte est lue au build sur les nodes Figma complets
(Principe VII, skill `estuaire-figma-cli`). Cette phase résout l'architecture et lève les
hypothèses ouvertes de la spec (les 3 défauts ont été validés par Pierre — « Ok pour les
défauts »).

## 0. Faits vérifiés sur le socle existant (base des décisions)

| Fait | Source vérifiée |
|------|-----------------|
| Route `/nous-decouvrir` **déjà ciblée** : navbar (`navigation.ts`) + CTA « Notre vision » de la home (`homePage.ts visionCtaHref` → `/nous-decouvrir`). La livrer rend ces liens fonctionnels. | `src/content/navigation.ts`, `src/sanity/schemas/documents/homePage.ts` |
| Aucune route `(site)/nous-decouvrir/` n'existe encore. | `src/app/(site)/` (seul `page.tsx` de la home) |
| Revalidation : webhook → `revalidateTag("sanity", "max")` invalide **tout** le cache Sanity en un coup — aucune config par-document à ajouter. | `src/app/api/revalidate/route.ts` |
| Shell `(site)` : `SmoothScroll` (Lenis + GSAP, fallback reduced-motion) > `Navbar` > `FooterReveal(footer=<Footer/>)` > `ScrollTopMount`. Footer + scroll-top **déjà montés** (contrairement à l'état de la feature home). | `src/app/(site)/layout.tsx` |
| Tonalité navbar : la page déclare `data-nav-logo-tone` / `data-nav-links-tone` / `data-nav-toggle-tone` ∈ `{onLight, onDark}` sur un élément racine ; en sticky la navbar force `onLight`. | `src/components/Navbar.tsx`, `src/design-system/nav.ts` |
| DS prêt et réutilisable : `SectionTitle` (contour/fill, responsive `text-title-sm`→`text-title`), `Button` (tons + attributs `data-umami-*`), `FeatureBlock` (image plein-bleed + voile + titre + CTA), `BrandText`/`OutlineText`. | `src/design-system/index.ts` + composants |
| `HeroSlideshow` est **spécifique à la home** (titre reconstruit lettre par lettre au changement de slide). Le hero « Nous découvrir » est mono-visuel avec encart titre → ne convient pas tel quel. | `src/design-system/components/HeroSlideshow.tsx` |
| Motion : `Parallax` (drift/settle/rise + `data-reveal-clip`) + hooks `data-reveal` (line-mask) ; honore `prefers-reduced-motion`. Réutilisable sans ajout. | `src/lib/motion/Parallax.tsx` |
| Helper d'événement Umami via attributs `data-umami-event*` (sans PII), pattern éprouvé sur les CTA de la home. | `src/app/(site)/page.tsx` (CTA home) |
| Pattern singleton de référence (home/footer) : schema → `queries.ts` → `lib/sanity/<doc>.ts` (fetch+defaults+`urlFor`) → `src/content/<doc>.ts` (copie unique) → `seed/documents/<doc>.seed.ts` → `registry.ts`. | `src/lib/sanity/homePage.ts` & co. |
| Singletons épinglés dans `structure.ts` (`SINGLETONS = ["homePage","footer"]`) + entrée desk dédiée. | `src/sanity/structure.ts` |
| Cache Figma : target `about` (`51:2699` desktop / `78:4374` tablette / `78:4626` mobile), 304 nœuds, 22 visuels, renders disponibles. Lecture : `npm run figma -- read about`. | `.design/figma-cache/index.json` |

## 1. Frontière donnée/présentation : la page est le connecteur

**Décision** : le contenu de « Nous découvrir » est fetché par **la page**
(`(site)/nous-decouvrir/page.tsx`, RSC), via une fonction de mapping `getAboutPageProps()`
isolée dans `@/lib/sanity/aboutPage.ts` (miroir exact de `getHomePageProps`). La page
passe les props aux composants DS. **Pas** de composant connecté dans `src/components/`.

**Justification** : Principe VIII — le singleton `aboutPage` n'est consommé que par
`/nous-decouvrir` : c'est du contenu de page, pas du global/singleton consommé partout
(footer/header). Le mapping isolé garde le DS présentationnel et `page.tsx` mince.

**Alternatives rejetées** : un wrapper `src/components/AboutPage.tsx` (aucune réutilisation
cross-page, contraire au cadrage VIII) ; fetch inline sans couche de mapping (mélangerait
fetch/defaults/`urlFor` avec la composition).

## 2. Nouveau singleton `aboutPage` (vs réutiliser/étendre `homePage`)

**Décision** : créer un **nouveau** document singleton `aboutPage` (`_id: "aboutPage"`),
épinglé dans `structure.ts`, organisé en groupes (onglets) : `hero` · `intro` · `vision`
· `atelier` · `process` · `statement` · `cta` · `seo`.

**Justification** : Principe II/IX — chaque page de contenu distincte a son modèle. La
page « Nous découvrir » a un contenu propre, sans recoupement avec la home. Mirroir du
pattern `homePage` (groupes Studio, champs préfixés par section, valeurs maquette en repli).

**Alternatives rejetées** : étendre `homePage` (couplerait deux pages sans rapport) ; un
type partagé « page » générique (sur-abstraction prématurée, anti-Principe IV — une seule
autre page de contenu n'est pas une preuve de besoin).

## 3. Hero : composant `PageHero` (mono-visuel + encart titre)

**Décision** : ajouter au DS un primitif **`PageHero`** : un visuel plein cadre (haut de
page) surmonté d'un **encart (cartouche) titre** sombre avec le titre de page et son trait
de séparation, conformément à `02/ SLIDER` (encart `@(140,620)` sur fond `#0e1215`, titre
rendu via `BrandText`). Mono-visuel, **statique** (défaut validé par Pierre).

**Justification** : Principe X — un hero de page de contenu est un visuel de marque
réutilisable (les futures pages Expertises / sous-pages auront un hero analogue) → il
s'ajoute au DS, ne se duplique pas. Distinct de `HeroSlideshow` (mécanique de home).

**Alternatives rejetées** : réutiliser `HeroSlideshow` (sa reconstruction de titre
lettre-à-lettre et son autoplay ne correspondent pas à un hero statique à encart) ;
construire le hero en-ligne dans la page (un hero est exactement le genre de visuel de
marque que le Principe X veut dans le DS).

## 4. « Phrase phare » : composant `Pullquote`

**Décision** : ajouter au DS un primitif **`Pullquote`** pour la « phrase phare » — un
énoncé centré en grande typographie de marque (Montserrat Alternates), récurrent dans la
maquette (intro, atelier, et en incrustation du grand visuel selon traitement).

**Justification** : Principe X + IV — l'élément apparaît 2–3 fois avec un traitement
typographique identique : c'est un primitif de marque réutilisable, pas une duplication
ad hoc. Rendu via `BrandText` (règle de casse), couleur héritée (`currentColor`) pour
s'adapter au fond clair/sombre.

**Alternatives rejetées** : un simple `<p>` répété par section (dupliquerait le traitement
de marque à 3 endroits, anti-Principe X) ; réutiliser `SectionTitle` (sémantique de titre
de section ≠ citation/énoncé ; `SectionTitle` est un `<h2>` contour/fill).

## 5. Grand visuel + incrustation (`07/ BIG IMAGE`) : réutiliser `FeatureBlock`

**Décision** : rendre la bande « grand visuel + phrase en incrustation » avec le composant
DS existant **`FeatureBlock`** (image plein-bleed sous voile + titre superposé), sans CTA.
À confirmer au build sur le node `51:2881` : si le ratio/traitement diffèrent
sensiblement de `FeatureBlock`, ajouter une variante au composant (acte DS délibéré),
plutôt qu'un nouveau composant.

**Justification** : Principe IV/X — `FeatureBlock` couvre déjà « image + voile + titre
superposé » ; réutiliser avant d'ajouter. La phrase en incrustation passe par `Pullquote`
si le traitement typographique l'exige.

**Alternatives rejetées** : un nouveau `StatementBand` d'emblée (réinventerait
`FeatureBlock` — à éviter tant qu'une variante suffit).

## 6. Mode opératoire (4 étapes) : composition en-ligne, données mappées

**Décision** : modéliser `processSteps` comme une **liste ordonnée** dans le schéma
(`number`, `title`, `text`, `bullets[]` optionnel, `images[]`), et **composer le rendu
en-ligne dans la page** (map sur les étapes + primitifs DS `SectionTitle`/`Pullquote`/
`Button` + images LQIP dans `<Parallax>`), comme la home compose ses sections intro /
réalisations en-ligne. La disposition par étape (nombre/position des visuels) est lue au
build sur les nodes `06/ MODE OPÉRATOIRE`.

**Justification** : Principe IV/VIII — les étapes sont du contenu spécifique à la page ;
leur mise en page varie d'une étape à l'autre dans la maquette. Un composant DS
`ProcessStep` figé imposerait une forme unique mal adaptée aux variations ; la composition
en-ligne reste l'altitude correcte. Si une forme strictement répétée émerge au build, un
`ProcessStep` DS pourra être extrait (décision reportée au build, pas anticipée).

**Alternatives rejetées** : un composant DS `ProcessStep` dès maintenant (anticipation
d'une réutilisation non prouvée ; risque d'inadéquation aux variations de la maquette).

## 7. Tracking d'événements (Principe VI)

**Décision** : tracer **un** événement métier — le clic sur le CTA « découvrir nos
expertises » → `about_cta_click` (`section=expertises`), via les attributs
`data-umami-event*` du `Button` (pattern home). Aucun autre événement custom sur la page :
pas de formulaire (le CTA contact et la plaquette vivent dans le footer, déjà instrumentés)
; le hero n'a pas de CTA. Le pageview par défaut couvre la consultation.

**Justification** : Principe VI — décision explicite, traçage des CTA principaux sans PII,
sans sur-instrumenter. Le CTA expertises est le seul levier de conversion propre à la page.

**Alternatives rejetées** : tracer les reveals de section (bruit analytique, pas un
résultat métier) ; ne rien tracer (manquerait le seul CTA de conversion de la page).

## 8. Tonalité de la navbar au-dessus du hero (FR-012)

**Décision** : la page déclare les `data-nav-*-tone` sur son élément racine en fonction du
hero, **valeurs lues au build** sur `02/ SLIDER` (logo blanc sur le visuel → `onDark` ;
liens/menu selon la zone qu'ils surplombent). Le toggle mobile suit la même logique.

**Justification** : mécanisme existant (Principe VII + socle home) ; les valeurs exactes
dépendent de la composition réelle du hero, donc lues sur le node, jamais devinées.

**Alternatives rejetées** : forcer une tonalité fixe sans vérifier le node (risque
d'illisibilité ; contraire au Principe VII).

## 9. SEO / H1 (FR-016)

**Décision** : le **H1 unique** est le titre de l'encart du hero (`heroTitle`), rendu dans
`PageHero` comme `<h1>`. Les titres de section (`SectionTitle`) sont des `<h2>`.
`generateMetadata` lit `seoMetaTitle` / `seoMetaDescription` / `seoOgImage` du singleton,
avec repli maquette (titre de page formaté par le template racine `%s | Estuaire`).

**Justification** : FR-016 — un seul H1, hiérarchie cohérente, métadonnées éditables.
Aligné sur le précédent home (`generateMetadata` lisant le singleton).

**Alternatives rejetées** : titre absolu hors template (le H1 de la home était le label de
marque, traité en titre absolu ; ici le titre de page « Nous découvrir » bénéficie du
template `%s | Estuaire`).
