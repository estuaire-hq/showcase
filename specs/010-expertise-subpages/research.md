# Phase 0 — Recherche & décisions

Décisions de conception pour les trois sous-pages d'expertise. Chaque point : **Décision** /
**Justification** / **Alternatives rejetées**. Aucune valeur de design n'est figée ici : la
géométrie exacte (positions, ratios, tailles) est lue au build sur les nodes Figma complets
(Principe VII, skill `estuaire-figma-cli`). Cette phase résout l'architecture et confirme les
hypothèses de la spec (toutes des défauts motivés, alignés sur le précédent 008 « Expertises »).

## 0. Faits vérifiés sur le socle existant (base des décisions)

| Fait | Source vérifiée |
|------|-----------------|
| Les 3 routes sont **déjà ciblées** par la page « Expertises » (cartes de niveau → `/expertises/{agencement-sur-mesure, mobiliers-sur-mesure, presentoirs-sur-mesure}`). Les livrer rend ces « en savoir plus » fonctionnels (FR-001 / SC-001). | `src/content/expertisesPage.ts` `levels[].ctaHref`, `src/lib/sanity/expertisesPage.ts` |
| Aucune route `(site)/expertises/[…]` n'existe ; la seule route dynamique du projet est `studio/[[...tool]]`. C'est donc la **première route de contenu dynamique**. | `find src/app -type d -name "[*]"` |
| Revalidation : webhook → `revalidateTag("sanity", "max")` invalide **tout** le cache Sanity en un coup (`defineLive` attache le tag parent `sanity`) — aucune config par-document à ajouter. | `src/app/api/revalidate/route.ts` |
| Shell `(site)` : `SmoothScroll` (Lenis + GSAP, fallback reduced-motion) > `Navbar` > footer **avec son bloc CTA** révélé au scroll (`FooterReveal`) > `ScrollTopMount`. Le **« BIG FOOTER » (bloc CTA + pied de page) est déjà monté** → FR-002 le consomme sans le redéfinir. | `src/app/(site)/layout.tsx`, `src/components/Footer.tsx` |
| Tonalité navbar : la page déclare `data-nav-logo-tone` / `data-nav-links-tone` / `data-nav-toggle-tone` ∈ `{onLight, onDark}` sur un élément racine ; en sticky la navbar force `onLight`. | `src/components/Navbar.tsx`, `src/design-system/nav.ts` |
| Template de titre racine : `%s | Estuaire` (defaut `Estuaire`). `generateMetadata` par page fournit `title`/`description`/`openGraph`. | `src/app/layout.tsx` |
| DS réutilisable : `PageHero` (visuel plein cadre + encart titre eyebrow/trait/outline-fill), `SectionTitle` (contour/fill responsive), `Pullquote` (phrase phare `BrandText` + `currentColor`), **`CaseStudyCard`** (image plein-bleed + voile ink 25 % + titre + trait 3px + ligne meta à tirets, `href` optionnel), `FeatureBlock`, `Button` (tons + `data-umami-*` via `umamiAttrs`), `BrandText`/`OutlineText`. | `src/design-system/index.ts` + composants |
| **Manque DS** : aucun primitif « fil d'Ariane » ni « grille d'engagements numérotée » n'existe. | `src/design-system/index.ts` (inventaire) |
| Pattern de contenu de référence (home/about/expertises/sectors) : schema → `queries.ts` → `lib/sanity/<doc>.ts` (fetch + defaults + `mapImage`/`urlFor`) → `src/content/<doc>.ts` (copie unique) → `seed/documents/<doc>.seed.ts` → `registry.ts`. | `src/lib/sanity/expertisesPage.ts` & co. |
| Le runner de seed consomme `seeds` comme un **tableau plat de documents** filtrable par `_type` (`-- <type>`), et valide les `required()` du schéma + l'existence des assets (`--check`). Plusieurs documents du même `_type` sont donc seedables ensemble. | `src/sanity/seed/run.ts` (`seeds as SeedDoc[]`, `requiredFields(doc._type)`) |
| Cache Figma : les 3 sous-pages sont présentes — agencement `51:3008` (desktop) / `87:6762` (tablette) / `87:6964` (mobile), mobiliers `51:3134` (desktop), présentoirs `51:3259` (desktop). Gabarit identique confirmé (6 sections). | lecture structurelle du cache (`.design/scripts/figma.ts read`) |

## 1. Modèle CMS : un type de document paramétré, instancié 3 fois

**Décision** : créer **un seul** type de document `expertiseSubpage` (PAS un singleton),
portant un champ `slug` (`agencement-sur-mesure` / `mobiliers-sur-mesure` /
`presentoirs-sur-mesure`) et l'ensemble des champs du gabarit. **Trois documents** de ce type
sont seedés (un par expertise), avec des `_id` stables dérivés du slug
(`expertiseSubpage.agencement-sur-mesure`, …). Chacun est **éditable indépendamment** (SC-006).

**Justification** : Principe IV/IX — les 3 pages partagent un gabarit strictement identique et
ne diffèrent que par le contenu (hypothèse spec « gabarit partagé » / « modèle de contenu unique
paramétré par l'expertise »). Un type unique + N instances est la modélisation DRY exacte de ce
cas ; les 3 documents sont indépendants (modifier l'un n'affecte pas les autres — SC-006).

**Alternatives rejetées** : **3 singletons** `agencementPage`/`mobiliersPage`/`presentoirsPage`
(triple le schéma, le mapping, le seed et la route ; duplique un gabarit identique — anti-IV) ;
**étendre `expertisesPage`** (couplerait la landing et ses sous-pages, modèles différents) ; un
type « contentPage » ultra-générique pour toutes les pages du site (sur-abstraction
prématurée — leurs sections diffèrent, anti-IV).

## 2. Routage : une route dynamique `[expertise]`

**Décision** : `(site)/expertises/[expertise]/page.tsx`. `generateStaticParams()` retourne les
**3 slugs connus** (clés de `@/content/expertiseSubpages.ts`) → pré-génération statique / ISR.
Le connecteur résout le contenu par slug : document Sanity correspondant si présent, sinon
défauts maquette indexés par slug (SC-007) ; si **ni l'un ni l'autre** (slug inconnu) →
`notFound()` (404 propre). `dynamicParams` reste au défaut (`true`) afin qu'un éventuel
4e document créé en Studio se résolve à la demande sans rebuild — mais le périmètre reste 3.

**Justification** : une route dynamique sert les 3 pages à gabarit identique avec **un seul**
fichier de page (Principe IV). `generateStaticParams` + LQIP couvrent la perf (SC-008). La
résolution « Sanity sinon défaut maquette par slug » garantit que la page s'affiche complète
avant toute saisie (SC-007), exactement comme les défauts de la 008.

**Alternatives rejetées** : **3 routes statiques** `agencement-sur-mesure/page.tsx`, etc.,
chacune appelant un composant gabarit partagé (3 fichiers de page quasi vides — duplication
inutile vs un segment dynamique) ; `dynamicParams = false` (404 un futur document ajouté en
Studio — moins souple pour l'autonomie éditoriale, sans bénéfice ici).

## 3. Gabarit en 6 sections : réutilisation DS + 2 primitifs manquants

**Décision** : composer le gabarit en-ligne dans le connecteur à partir du DS. Correspondance
section → rendu (géométrie lue au build) :

| Section maquette | Rendu | Composant DS |
|------------------|-------|--------------|
| `02/ SLIDER` (hero) | fil d'Ariane (haut) + visuel plein cadre + encart titre (eyebrow + trait + titre outline/fill) | **`PageHero`** (réutilisé) **+ extension : slot `breadcrumb`** rendant le nouveau **`Breadcrumb`** |
| `03/ INTRO` | phrase phare + texte d'intro + visuel (agencement : demi-fond bleu) | composé **en-ligne** : `Pullquote` + texte + `next/image` LQIP ; le demi-fond = panneau `bg-estuaire` (tokens, pas de composant) |
| `04/ RESPONSABLE` | phrase d'engagement de synthèse (soulignée d'un trait) + visuels | composé **en-ligne** : `SectionTitle`/`Pullquote` + trait (`bg-*`) + cluster `next/image` |
| `05/ NOS ENGAGEMENTS` | titre « Nos engagements » + 6 engagements numérotés (01/…06/) en grille 3×2 séparés de traits | `SectionTitle` + **nouveau `EngagementsGrid`** |
| `06/ CAS STUDY` | titre « Découvrez notre dernier projet … » + bande visuelle (titre/meta en incrustation) + **bouton** vers la réalisation | `SectionTitle` (titre de section) + **`CaseStudyCard`** (réutilisé) **+ extension : slot bouton** (`Button` + passe-plat `data-umami-*`) |
| BIG FOOTER | — | shell `(site)/layout.tsx` (non rendu ici) |

**Justification** : Principe IV/X — réutiliser avant d'ajouter. `PageHero` est exactement le
hero de page (eyebrow + trait + titre outline/fill + visuel plein cadre) ; `CaseStudyCard` est
exactement la bande cas study (image + voile ink + titre + trait 3px + ligne meta à tirets). Les
**deux seuls** éléments réellement absents du DS sont le **fil d'Ariane** et la **grille des 6
engagements numérotés** : ce sont des primitifs d'UI réutilisables → ils sont **ajoutés au DS**
(Principe X), pas composés ad hoc dans la page. L'intro, le bloc responsable et le demi-fond
bleu sont des **compositions de page** (texte + visuels + tokens), à la bonne altitude en-ligne.

**Extensions délibérées (À CONFIRMER au build sur les nodes complets)** :
1. **`PageHero` — slot `breadcrumb`** : le fil d'Ariane se pose en haut du hero. Ajouter une
   prop optionnelle `breadcrumb?: ReactNode` rendue au-dessus de l'encart (ou en overlay haut),
   plutôt que de positionner le fil d'Ariane à la main dans la page (le hero reste l'unité DS).
2. **`CaseStudyCard` — slot bouton + tracking** : la carte est aujourd'hui cliquable en entier
   via `href`. La maquette montre un **bouton** explicite vers la réalisation. Étendre la carte
   d'un slot CTA optionnel (`Button`) + passe-plat `data-umami-*`, ou composer le `Button` sous
   la carte — tranché au build selon le node.

**Alternatives rejetées** : créer un `ExpertiseHero`/`CaseStudyBand` dédié (réinventerait
`PageHero`/`CaseStudyCard` — éviter tant qu'une extension suffit) ; composer la grille
d'engagements et le fil d'Ariane en-ligne dans la page (un primitif d'UI réutilisable doit venir
du DS — Principe X).

## 4. `EngagementsGrid` — le primitif structurant

**Décision** : nouveau composant présentationnel `EngagementsGrid` : une liste ordonnée
d'engagements `{ title }`, rendue en **grille 3 colonnes × 2 lignes** (responsive : 1 col mobile
→ 2 → 3), chaque cellule portant un **numéro dérivé de l'ordre** (`01/`…`06/`, formaté `String(i+1).padStart(2,"0")`) et l'intitulé, séparées par des **traits** (3px, tokens). Numéro en
Montserrat Alternates (règle de marque). Reçoit la liste en props ; ne fetche pas (Principe
VIII). La grille reste correcte si un engagement est masqué/réordonné dans le CMS (la
numérotation suit l'ordre rendu — cas limite spec).

**Justification** : c'est l'élément central de FR-006, absent du DS, et réutilisable
conceptuellement. Dériver le numéro de l'ordre (et non le stocker) évite toute incohérence de
numérotation lors d'un réordonnancement (SC-006 / cas limite « nombre d'engagements »).

**Alternatives rejetées** : stocker le numéro en CMS (risque d'incohérence au réordonnancement) ;
6 champs nommés `engagement1..6` (rigide, ni masquage ni réordonnancement — anti II/IX) ;
composer la grille dans la page (anti Principe X).

## 5. `Breadcrumb` & libellés du fil d'Ariane (FR-018)

**Décision** : nouveau composant présentationnel `Breadcrumb` : `items: { label: string; href?: string }[]` rendus avec un séparateur, casse de marque (`BrandText`, minuscules → Montserrat
Alternates). Le contenu (segments + liens) vient du CMS par page (champ éditable), repli
maquette. Le libellé reproduit la maquette : agencement = « univers / agencement sur-mesure » ;
mobiliers/présentoirs (frames desktop sans fil d'Ariane visible) **dérivent** par analogie du
gabarit (« univers / mobiliers sur-mesure », « univers / présentoirs sur-mesure » — cas limite
spec « responsive des pages sans frame dédiée » / Hypothèses). Le **parent cliquable** du premier
segment est la page **« Expertises »** (`/expertises`, parent établi par la 008) ; la mention
« univers » est traitée comme **copie de maquette à confirmer** (Hypothèses) — en cas de doute,
le segment renvoie vers `/expertises`.

**Justification** : FR-018 + Hypothèses — le fil d'Ariane permet de remonter au parent ; son
libellé reproduit la maquette mais son lien parent est sémantiquement « Expertises ». Un
composant DS minimal le rend cohérent et accessible (nav sémantique `<nav aria-label>` + liste).

**Alternatives rejetées** : coder le fil d'Ariane en dur dans `PageHero` (non éditable —
anti II) ; rendre la mention « univers » non cliquable et muette (perdrait le chemin de
remontée — FR-018).

## 6. Tonalité de la navbar au-dessus du hero (FR-011)

**Décision** : chaque sous-page déclare les `data-nav-*-tone` sur son élément racine selon le
hero (`02/ SLIDER` : visuel plein cadre sombre + encart blanc → cible attendue `onDark` sur les
trois tons, précédent direct « Expertises »/« Nous découvrir »). **Valeurs confirmées au build**
en lisant le node — jamais devinées (Principe VII).

**Justification** : mécanisme existant ; les valeurs dépendent de la composition réelle du hero.

**Alternatives rejetées** : forcer une tonalité fixe sans vérifier le node (risque
d'illisibilité).

## 7. Tracking d'événements (Principe VI)

**Décision** : tracer **un** événement métier — le clic sur le **bouton du cas study** (le seul
levier de conversion propre à ces pages, vers une réalisation — Scénario 2 / SC-003) →
`case_study_click`, propriété `expertise` = slug de la page (`agencement` / `mobiliers` /
`presentoirs`), via les attributs `data-umami-*` transmis au `Button` (extension §3.2 de
`CaseStudyCard` ou `Button` composé). Aucun autre événement custom : pas de formulaire ; le CTA
contact + la plaquette vivent dans le footer (déjà instrumentés) ; le hero, l'intro, le
responsable et les engagements n'ont pas de CTA propre. Le pageview par défaut couvre la
consultation et l'arrivée depuis chaque « en savoir plus ».

**Justification** : Principe VI — décision explicite, traçage du seul CTA de conversion sans PII
(le slug n'est pas une donnée personnelle), sans sur-instrumenter.

**Alternatives rejetées** : tracer les reveals de section ou le clic fil d'Ariane (bruit, pas un
résultat métier) ; ne rien tracer (manquerait le seul CTA de conversion des sous-pages).

## 8. SEO / H1 (FR-015)

**Décision** : le **H1 unique** de chaque page est l'**encart titre du hero** (l'intitulé de
l'expertise, ex. « Notre vision du métier d'agenceur »), rendu par `PageHero` en `<h1>`. Le titre
« Nos engagements » et les autres titres de section sont des `<h2>` (`SectionTitle`) ; les
intitulés d'engagement et le titre de projet du cas study sont des `<h3>` (hiérarchie cohérente
fixée au build). `generateMetadata({ params })` lit `seoMetaTitle` / `seoMetaDescription` /
`seoOgImage` du document résolu par slug, repli maquette (titre formaté par `%s | Estuaire`).

**Justification** : FR-015 — un seul H1 par page, hiérarchie cohérente, métadonnées éditables par
page. Aligné sur le précédent home/about/expertises.

**Alternatives rejetées** : titre absolu hors template (le titre bénéficie de `%s | Estuaire`).

## 9. Motion (skill `estuaire-motion`)

**Décision** : hero **statique** (mono-visuel, rien au premier paint). Reveals au scroll —
line-mask sur les titres (`SectionTitle`, titre hero une fois affiché), parallaxe/clip sur les
visuels d'intro, du bloc responsable et de la bande cas study, apparition discrète des cellules
de la grille d'engagements — via `<Parallax>` + attributs `data-*`. Une seule motion focale à la
fois ; le texte reste l'ancre statique (FR-012). `prefers-reduced-motion` → tout au repos,
contenu complet (FR-013). **Aucun nouveau primitif de motion.** Beats par section arrêtés au
build en chargeant `estuaire-motion`.

**Justification** : Principe I/VII — réutilise le motion du socle ; cohérent avec les pages
livrées (statique d'abord, enrichissement ensuite).

**Alternatives rejetées** : animer le hero (mono-visuel statique par hypothèse spec) ; un
carrousel d'engagements (la maquette présente une grille fixe 3×2, pas un carrousel).

## 10. Copie maquette : source unique indexée par slug (Principe IX)

**Décision** : `@/content/expertiseSubpages.ts` exporte un objet **indexé par slug** (3 entrées)
contenant la copie texte de chaque page (fil d'Ariane, eyebrow + titre hero, phrase phare + texte
d'intro, phrase d'engagement, les 6 intitulés d'engagement, titre + meta + libellé/lien du cas
study, SEO). **Texte uniquement** (les visuels viennent du seed → Sanity, ADR 0004). Importé
« vers le bas » par le seed (écrit dans Sanity) **et** le repli front (`getExpertiseSubpageProps`
DEFAULTS). Les valeurs verbatim sont **lues au build sur les nodes complets** (Principe VII) — la
phase plan ne fige aucune copie.

**Justification** : Principe IX — la copie de maquette vit à un seul endroit, dérivée vers seed et
front, validée mécaniquement (`--check`). L'indexation par slug colle au modèle (3 contenus, 1
type).

**Alternatives rejetées** : 3 fichiers de contenu séparés (fragmente une copie de même nature) ;
dupliquer la copie entre seed et défauts front (anti-IX).
