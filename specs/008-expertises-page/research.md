# Phase 0 — Recherche & décisions

Décisions de conception pour l'implémentation de la page « Expertises ». Chaque point :
**Décision** / **Justification** / **Alternatives rejetées**. Aucune valeur de design n'est
figée ici : la géométrie exacte est lue au build sur les nodes Figma complets (Principe VII,
skill `estuaire-figma-cli`). Cette phase résout l'architecture et confirme les hypothèses de
la spec (toutes des défauts motivés, alignés sur le précédent 007 « Nous découvrir »).

## 0. Faits vérifiés sur le socle existant (base des décisions)

| Fait | Source vérifiée |
|------|-----------------|
| Route `/expertises` **déjà ciblée** : navbar + pied de page (`navigation.ts`, `footer.ts`) ; CTA « découvrir nos expertises » de « Nous découvrir » (`aboutPage.ctaHref` → `/expertises`). La livrer rend ces liens fonctionnels (FR-017). | `src/content/navigation.ts`, `src/lib/sanity/aboutPage.ts`, `src/content/aboutPage.ts` |
| Aucune route `(site)/expertises/` n'existe encore. | `src/app/(site)/` (`page.tsx` home + `nous-decouvrir/`) |
| Revalidation : webhook → `revalidateTag("sanity", "max")` invalide **tout** le cache Sanity en un coup — aucune config par-document à ajouter. | `src/app/api/revalidate/route.ts` (pattern 007) |
| Shell `(site)` : `SmoothScroll` (Lenis + GSAP, fallback reduced-motion) > `Navbar` > footer **avec son bloc CTA** révélé au scroll > `ScrollTopMount`. Le **bloc CTA + le pied de page (le « BIG FOOTER ») sont déjà montés** → FR-001 les consomme sans les redéfinir (FR-010). | `src/app/(site)/layout.tsx`, `src/components/Footer.tsx` |
| Tonalité navbar : la page déclare `data-nav-logo-tone` / `data-nav-links-tone` / `data-nav-toggle-tone` ∈ `{onLight, onDark}` sur un élément racine ; en sticky la navbar force `onLight`. | `src/components/Navbar.tsx`, `src/design-system/nav.ts` |
| DS prêt et réutilisable, **sans ajout** : `PageHero` (visuel plein cadre + encart titre eyebrow/trait/outline-fill, **créé par la 007**), `SectionTitle` (contour/fill responsive), `Pullquote` (phrase phare `BrandText` + `currentColor`), **`FeatureBlock`** (image plein-bleed sous voile ink 25 % + titre + CTA clair — doc : kit « Notre vision du métier d'agenceur »), `Button` (tons + `data-umami-*`), `BrandText`/`OutlineText`. | `src/design-system/index.ts` + composants |
| `FeatureBlock` est **exactement** la carte de niveau de la maquette (visuel assombri + titre + « en savoir plus »). Son titre est en `font-sans` par défaut (= « Notre vision du métier d'agenceur »), `display` bascule en Montserrat Alternates. Ratio actuel **figé** `aspect-[1920/718]` (desktop), CTA interne **sans** passe-plat d'attributs. | `src/design-system/components/FeatureBlock.tsx` |
| Motion : `Parallax` (drift/settle/rise + `data-reveal-clip`) + hooks `data-reveal` (line-mask) ; honore `prefers-reduced-motion`. Réutilisable sans ajout. | `src/lib/motion/Parallax.tsx` |
| Pattern singleton de référence (home/about/footer) : schema → `queries.ts` → `lib/sanity/<doc>.ts` (fetch + defaults + `mapImage`/`urlFor`) → `src/content/<doc>.ts` (copie unique) → `seed/documents/<doc>.seed.ts` → `registry.ts`. | `src/lib/sanity/aboutPage.ts` & co. |
| Singletons épinglés dans `structure.ts` (`SINGLETONS = ["homePage","aboutPage","footer"]`) + entrée desk dédiée. | `src/sanity/structure.ts` |
| Cache Figma : target `expertises` (`51:2893` desktop / `87:5600` tablette / `87:6290` mobile), renders disponibles. Lecture : `npm run figma -- read expertises`. Les sous-pages (`expertises/agencement-sur-mesure` …) ont leurs propres targets — **hors périmètre**. | `.design/figma-cache/index.json` |

## 1. Frontière donnée/présentation : la page est le connecteur

**Décision** : le contenu de « Expertises » est fetché par **la page**
(`(site)/expertises/page.tsx`, RSC), via une fonction de mapping `getExpertisesPageProps()`
isolée dans `@/lib/sanity/expertisesPage.ts` (miroir exact de `getAboutPageProps`). La page
passe les props aux composants DS. **Pas** de composant connecté dans `src/components/`.

**Justification** : Principe VIII — le singleton `expertisesPage` n'est consommé que par
`/expertises` : c'est du contenu de page, pas du global/singleton consommé partout
(footer/header). Le mapping isolé garde le DS présentationnel et `page.tsx` mince.

**Alternatives rejetées** : un wrapper `src/components/ExpertisesPage.tsx` (aucune
réutilisation cross-page, contraire au cadrage VIII) ; fetch inline sans couche de mapping
(mélangerait fetch/defaults/`urlFor` avec la composition).

## 2. Nouveau singleton `expertisesPage`

**Décision** : créer un **nouveau** document singleton `expertisesPage` (`_id:
"expertisesPage"`), épinglé dans `structure.ts`, organisé en groupes (onglets) : `hero` ·
`intro` · `levels` · `statement` · `seo`. Les 3 niveaux sont une **liste ordonnée éditable**
`levels[]` (objet `expertiseLevel`), pré-remplie avec les 3 niveaux de la maquette.

**Justification** : Principe II/IX — chaque page de contenu distincte a son modèle. La page
« Expertises » a un contenu propre, sans recoupement avec home/about. Miroir du pattern
`aboutPage` (groupes Studio, champs préfixés par section, valeurs maquette en repli). Modèle
~2× plus simple que `aboutPage` (4 sections de contenu vs 7).

**Alternatives rejetées** : étendre `homePage`/`aboutPage` (couplerait des pages sans
rapport) ; un type partagé « contentPage » générique (sur-abstraction prématurée,
anti-Principe IV — 3 pages de contenu ne prouvent pas un besoin de généricité, leurs sections
diffèrent).

## 3. Les 4 sections : réutilisation pure du DS (aucun nouveau composant)

**Décision** : la page n'ajoute **aucun** primitif DS. Chaque section est rendue avec un
composant existant :

| Section maquette | Rendu | Composant DS |
|------------------|-------|--------------|
| `012/ SLIDER` (hero) | visuel plein cadre + encart titre (eyebrow + trait + titre outline/fill) | **`PageHero`** (réutilisé tel quel ; créé par la 007) |
| `02/ INTRO` | phrase phare + texte + visuels d'appui | composé **en-ligne** : `Pullquote` (ou panneau bleu, cf. `HighlightPanel` 007) + `next/image` LQIP |
| `03/ NOS NIVEAUX` | titre de section + 3 cartes pleine largeur (visuel assombri + intitulé + « en savoir plus ») | `SectionTitle` + **3 × `FeatureBlock`** (map sur `levels[]`) |
| `05/ BIG IMAGE` | visuel plein largeur assombri + phrase phare en incrustation | composé **en-ligne** (image + voile + `Pullquote`), comme la bande `statement` de la 007 — ou `FeatureBlock` sans CTA selon le node |

**Justification** : Principe IV/X — `FeatureBlock` est **littéralement** la carte de niveau
(sa doc cite « Notre vision du métier d'agenceur », qui est le niveau 1 de FR-004) : voile
ink 25 %, titre superposé, CTA clair « fixé » 398px. Réutiliser avant d'ajouter. Le hero est
exactement le `PageHero` de la 007 (eyebrow + trait + titre outline/fill + visuel plein
cadre). L'intro et le grand visuel sont des compositions de page (texte + visuels), à
l'altitude correcte en-ligne — comme la 007 a composé son intro et sa bande `statement`.

**Extensions délibérées de `FeatureBlock` (À CONFIRMER au build sur les nodes)** :
1. **Ratio responsive** — `FeatureBlock` est figé à `aspect-[1920/718]`. Les cartes de
   niveau ont des ratios différents en tablette/mobile (`87:5600` / `87:6290`). Si confirmé,
   ajouter des ratios par breakpoint au composant (token `aspect-*`, pas de valeur magique
   de couleur/typo) — extension du DS, pas une carte ad hoc dans la page.
2. **Passe-plat de tracking** — le CTA de `FeatureBlock` est un `Button` interne ; pour
   tracer le clic (research §7), `FeatureBlock` doit transmettre des `data-umami-*` à son
   `Button`. Étendre la prop `cta` (ex. `cta.tracking?: Record<string, string>`) ou accepter
   des `data-*` — petit ajout cadré.

**Alternatives rejetées** : créer un `ExpertiseLevelCard` dédié (réinventerait `FeatureBlock`
— à éviter tant qu'une extension suffit) ; composer les cartes en-ligne dans la page (un
visuel de marque réutilisable et déjà existant doit venir du DS, Principe X).

## 4. Les 3 niveaux : liste ordonnée éditable mappée sur `FeatureBlock`

**Décision** : modéliser `levels` comme une **liste ordonnée** dans le schéma (objet
`expertiseLevel` : `title`, `image`, `ctaLabel`, `ctaHref`), pré-remplie avec les 3 niveaux
de la maquette (FR-004) :
1. « Notre vision du métier d'agenceur » → `/expertises/agencement-sur-mesure`
2. « Notre savoir-faire appliqué aux mobiliers » → `/expertises/mobiliers-sur-mesure`
3. « Notre exigence au service des présentoirs » → `/expertises/presentoirs-sur-mesure`

La page mappe `levels[]` sur `FeatureBlock` (l'ordre du tableau EST l'ordre d'affichage). Le
rendu reste correct si un niveau est masqué/réordonné dans le CMS (cas limite spec).

**Justification** : Principe II/IX — les niveaux sont du contenu éditable, pas des cartes
statiques (contrairement à une exception home). Une liste ordonnée d'objets est plus simple
pour l'éditeur qu'une cascade de champs nommés et laisse le rendu contrôler le placement
(même choix assumé que les `array` images de la 007).

**Alternatives rejetées** : 3 groupes de champs nommés `level1*`/`level2*`/`level3*` (rigide,
ne permet ni réordonnancement ni masquage — cas limite spec) ; des **références Sanity** vers
de futurs documents de sous-page (anti-Principe IV : les sous-pages sont hors périmètre et
n'existent pas ; un simple `string href` suffit, comme la home pointe `/nous-decouvrir`).

## 5. Destinations des cartes (FR-005) : `string href`, 404 temporaire accepté

**Décision** : chaque niveau porte un `ctaHref` (`string`) vers la route prévue de sa
sous-page (`/expertises/agencement-sur-mesure`, `…/mobiliers-sur-mesure`,
`…/presentoirs-sur-mesure`). Tant que la sous-page n'est pas livrée, le lien rend un **404
temporaire** (accepté — FR-005, par analogie avec la 007 qui pointait `/expertises` avant
cette feature).

**Justification** : les 3 sous-pages sont des **features distinctes** (Hors périmètre). La
landing se contente de router ; un `href` éditable suffit.

**Alternatives rejetées** : bloquer la livraison sur l'existence des sous-pages (couplerait 4
features) ; masquer les CTA (briserait le scénario 2 « passer à l'action » et SC-002).

## 6. Tonalité de la navbar au-dessus du hero (FR-010)

**Décision** : la page déclare les `data-nav-*-tone` sur son élément racine en fonction du
hero, **valeurs lues au build** sur `012/ SLIDER` (visuel plein cadre, logo blanc attendu →
`onDark` ; liens/menu selon la zone surplombée ; toggle mobile idem). Précédent direct :
« Nous découvrir » force `onDark` sur les trois tons au-dessus de son hero.

**Justification** : mécanisme existant (Principe VII + socle home/about) ; les valeurs
exactes dépendent de la composition réelle du hero, donc lues sur le node, jamais devinées.

**Alternatives rejetées** : forcer une tonalité fixe sans vérifier le node (risque
d'illisibilité ; contraire au Principe VII).

## 7. Tracking d'événements (Principe VI)

**Décision** : tracer **un** événement métier — le clic sur chaque « en savoir plus » des
cartes de niveau → `expertise_level_click`, avec une propriété `level` = slug du niveau
(`agencement` / `mobiliers` / `presentoirs`), via les attributs `data-umami-event*`
transmis au `Button` interne de `FeatureBlock` (extension §3.2). Aucun autre événement
custom : pas de formulaire ; le CTA contact + la plaquette vivent dans le footer (déjà
instrumentés) ; le hero et le grand visuel n'ont pas de CTA. Le pageview par défaut couvre la
consultation.

**Justification** : Principe VI — décision explicite, traçage des CTA principaux sans PII
(le slug n'est pas une donnée personnelle), sans sur-instrumenter. Les 3 « en savoir plus »
sont les seuls leviers de conversion propres à la page (routage vers les sous-pages — SC-002).

**Alternatives rejetées** : tracer les reveals de section (bruit analytique, pas un résultat
métier) ; ne rien tracer (manquerait les seuls CTA de conversion de la page) ; un événement
unique sans la propriété `level` (perdrait quel niveau convertit).

## 8. SEO / H1 (FR-014)

**Décision** : le **H1 unique** est le titre de l'encart du hero (« Notre expertise :
réaliser vos projets de toutes formes et de toutes tailles »), rendu dans `PageHero` comme
`<h1>`. Le titre « Nos 3 niveaux d'expertise » et les autres titres de section
(`SectionTitle`) sont des `<h2>` ; les intitulés de carte (`FeatureBlock`) des `<h2>`/`<h3>`
(à fixer pour garder une hiérarchie cohérente). `generateMetadata` lit `seoMetaTitle` /
`seoMetaDescription` / `seoOgImage` du singleton, avec repli maquette (titre de page formaté
par le template racine `%s | Estuaire`).

**Justification** : FR-014 — un seul H1, hiérarchie cohérente, métadonnées éditables. Aligné
sur le précédent home/about (`generateMetadata` lisant le singleton).

**Note hiérarchie** : `FeatureBlock` rend actuellement son titre en `<h2>`. Avec le titre de
section `<h2>` « Nos 3 niveaux d'expertise » au-dessus, vérifier au build que les intitulés
de carte n'enfreignent pas la hiérarchie (passer en `<h3>` si nécessaire — petite prop ou
override). Décision tranchée au build sur la sémantique réelle des sections.

**Alternatives rejetées** : titre absolu hors template (le titre de page « Expertises »
bénéficie du template `%s | Estuaire`, comme « Nous découvrir »).

## 9. Motion (skill `estuaire-motion`)

**Décision** : hero **statique** (mono-visuel, rien au premier paint). Reveals au scroll —
line-mask sur les titres (`SectionTitle`, hero une fois affiché), parallaxe/clip sur les
visuels d'intro, des cartes de niveau et du grand visuel — via `<Parallax>` + attributs
`data-*`. Une seule motion focale à la fois ; le texte reste l'ancre statique (FR-011).
`prefers-reduced-motion` → tout au repos, contenu complet (FR-012). **Aucun nouveau primitif
de motion.** Le choix précis des beats par section est arrêté en chargeant `estuaire-motion`
au build.

**Justification** : Principe I/VII — réutilise le motion du socle ; cohérent avec la 007 (qui
a livré la page d'abord statique puis enrichie). Le hover de `FeatureBlock` (blur + CTA crème)
est déjà conforme aux cinématiques.

**Alternatives rejetées** : animer le hero (mono-visuel statique par hypothèse spec) ; un
carrousel sur les cartes de niveau (la maquette présente 3 cartes empilées pleine largeur, pas
un carrousel — à confirmer au build).
