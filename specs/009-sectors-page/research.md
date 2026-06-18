# Phase 0 — Recherche & décisions

Toutes les inconnues du Technical Context sont résolues ci-dessous (aucune
« NEEDS CLARIFICATION » restante). Chaque entrée : **Décision** · **Justification** ·
**Alternatives écartées**. Le contexte vient de la spec (`spec.md`), de la maquette Figma
lue **complète** (`read secteurs` / `51:3386`, hors-ligne) et des conventions des pages
déjà livrées (home `005`, « Nous découvrir » `007`).

## 1. Route & slug — `/univers`

- **Décision** : la page est servie sur `/univers` (`src/app/(site)/univers/page.tsx`).
- **Justification** : slug déjà câblé dans `src/content/navigation.ts` (entrée
  « univers » → `/univers`) et listé dans le footer ; livrer la page rend ce lien
  fonctionnel. Le nom interne/design est « secteurs » (fichier Figma *page-secteurs*) mais
  le **label public et la route sont « univers »** (Hypothèse réglée de la spec).
- **Alternatives écartées** : `/secteurs` (contredirait la navbar et le footer déjà câblés).

## 2. Modélisation des secteurs — liste embarquée dans le singleton

- **Décision** : `sectorsPage.sectors` = `array<sector>` embarqué (objet `sector` :
  `label`, `promise`, `image`, `href`) ; l'ordre du tableau EST le rang d'affichage.
  Idem `sectorsPage.keyFigures` = `array<keyFigure>` (`value`, `support`).
- **Justification** : sur cette page les secteurs sont une **liste présentationnelle
  ordonnée**, miroir exact du précédent `aboutPage.processSteps` (`array<object>`).
  Principe IV / YAGNI : pas de type de document supplémentaire, pas de références, pas de
  desk par secteur. L'édition (réordonner, modifier texte/visuel) reste simple (Scénario 3).
- **Alternatives écartées** : **documents `sector` autonomes** réutilisés par les pages de
  détail. Écarté : (a) coût (type + 4 docs + références + desk) non justifié ici ; (b) les
  pages de détail secteur sont des **features distinctes** avec leurs propres maquettes
  (`51:3520`…`51:3929`) et définiront leur propre modèle — elles ne consomment pas cette
  liste ; (c) réévaluable plus tard si un besoin de partage d'entité émerge (noté dans
  `plan.md` Structure Decision).

## 3. Bande secteur — nouveau primitif DS `SectorBand` (pas `SplitSection`)

- **Décision** : ajouter `src/design-system/components/SectorBand.tsx` — une bande
  plein-largeur : image de fond (`next/image` `fill`, `object-cover`) + **voile sombre**
  (`bg-ink/25`, opacité maquette 0.253) + contenu superposé aligné à gauche : titre
  (`BrandText`/`SectionTitle`), trait de séparation (`<hr border-paper>`), phrase de
  promesse, bouton « en savoir plus » (`Button tone="light" arrow`). Hooks de motion
  `data-reveal` (titre, line-mask) et `data-parallax` (image) comme `SplitSection`.
- **Justification** : aucun composant existant ne couvre ce layout. `SplitSection`
  (variantes `expertises`/`vision`) est un **image + colonne de texte côte-à-côte** avec
  carte et titre contour/fill — pas une image plein-cadre avec texte superposé sous voile.
  C'est un **primitif de marque réutilisable** (les pages de détail secteur, et
  potentiellement « réalisations », réutiliseront la bande plein-cadre) → l'ajouter au DS
  est la voie constitutionnelle (Principe X), pas une duplication ad hoc.
- **Alternatives écartées** : (a) étendre `SplitSection` d'une 3ᵉ variante — rejeté : le
  layout (overlay vs side-by-side) est structurellement différent, une variante
  forcerait des branches incohérentes ; (b) composer la bande en-ligne dans la page —
  rejeté : 4 occurrences identiques sur cette page + réutilisation future = un composant
  (Principe X interdit la duplication d'un visuel de marque).

## 4. Hero — réutilisation de `PageHero`

- **Décision** : réutiliser `PageHero` (`eyebrow`, `titleOutline`, `titleFill`, `image`).
  Le hero secteurs = encart titre sombre (sur-titre « Agencement sur mesure / du retail à
  vos bureaux », titre contour+plein « Architectes et designers, nous concrétisons vos
  projets avec soin. »), trait de séparation, image à droite — exactement la signature de
  `PageHero` (introduit pour « Nous découvrir »).
- **Justification** : composant de marque déjà construit et réutilisable pour les pages de
  contenu ; statique (Principe I — pas de carrousel). Géométrie exacte lue au build sur
  `51:3386` (encart `02/SLIDER`, fond split `bg-ink` à gauche / image à droite).
- **Alternatives écartées** : nouveau composant hero (duplication — `PageHero` existe déjà).
- **À confirmer au build** : le fond split (noir à gauche 1090px / blanc à droite) — si
  `PageHero` ne gère pas le split tel quel, ajouter une variante/prop `background` au
  composant (additif DS), pas une réimplémentation locale.

## 5. Intro & Infos clés — composition en-ligne

- **Décision** : composer ces deux sections **en-ligne** dans `page.tsx` à partir des
  tokens `@theme` et de l'échelle typographique DS (pas de nouveau composant).
  - **Intro** (`03/INTRO`) : panneau crème (`bg-cream`) à gauche portant l'image
    (`next/image` + LQIP), à droite la phrase de positionnement (`text-subtitle`,
    Montserrat Alternates) + le corps de texte (`text-body`, `whitespace-pre-line`).
  - **Infos clés** (`05/INFOS CLÉS`) : fond `bg-cream`, **grille 2×2** des 4 chiffres
    (`value` en `text-title`/`OutlineText` selon traitement, `support` en `text-lead`)
    avec **croix de séparation** (un `<hr>` horizontal + un séparateur vertical, `border-ink`).
- **Justification** : sections **spécifiques à la page**, sans réutilisation hors de cette
  page → Principe IV (composer en-ligne plutôt que sur-abstraire), précédent direct des
  grilles composées en-ligne de « Nous découvrir ».
- **Alternatives écartées** : composants `Intro`/`KeyFiguresGrid` dédiés — rejeté tant
  qu'une 2ᵉ occurrence n'existe pas (YAGNI). À promouvoir au DS si réutilisé.

## 6. Tonalité de la navbar au-dessus du hero (`data-nav-*-tone`)

- **Décision** : déclarer la tonalité sur l'élément racine de la page (`<main
  data-nav-logo-tone=… data-nav-links-tone=…>`), API définie par la feature 003. Cible
  **planifiée** : `logo=onDark` (le logo blanc surplombe le panneau noir `bg-ink` à
  gauche) ; `links=onLight` (le menu surplombe la zone blanche à droite). Toggle mobile
  selon la zone — à confirmer.
- **Justification** : le hero est **split** (noir à gauche où est le logo, blanc à droite
  où est le menu) ; la navbar transparente doit rester lisible des deux côtés (FR-010).
- **À confirmer au build** (Principe VII) : lire le node `51:3386` (HEADER sticky menu :
  logo `#ffffff`, libellés `#0e1215`) avant de figer les valeurs — ne pas deviner.

## 7. Tracking Umami — décision explicite (Principe VI)

- **Décision** : tracer chaque clic « en savoir plus » → événement `sector_cta_click` avec
  la propriété `data-umami-event-sector=<slug>` (retail/bureau/residentiel/scenographie),
  via les attributs `data-umami-*` exposés par `SectorBand` (transmis au `Button`).
- **Justification** : ce sont les **CTA principaux** de la page (router le visiteur vers le
  secteur qui le concerne — SC-002) ; mesurer quel univers convertit est la valeur métier.
  Pas de PII. Pas d'autre interaction à tracer (le CTA contact et la plaquette vivent dans
  le footer, déjà instrumentés ; pas de formulaire sur la page).
- **Alternatives écartées** : tracer aussi les scroll-depth/section-views — écarté (bruit,
  pageview par défaut suffit pour la lecture).

## 8. Responsive — pas de frame tablette/mobile (desktop seul)

- **Décision** : mobile-first selon la convention DS (`base` = mobile, `md` = tablette,
  `lg` = desktop) ; le pixel-perfect par **diff** ne s'applique qu'au **desktop** (`51:3386`),
  tablette/mobile vérifiés en cohérence + lisibilité (SC-003).
- **Adaptations clés** : hero split → empilé sous `lg` (encart au-dessus, image dessous) ;
  intro → image puis texte empilés sous `md` ; bandes secteur → contenu reflué, hauteur
  dynamique (le 718px desktop devient `min-h` adaptatif) ; grille infos-clés 2×2 → 1
  colonne sous `md`, croix de séparation neutralisée en empilement.
- **Justification** : la maquette ne fournit que le desktop (Hypothèse de la spec) ;
  l'adaptation suit les breakpoints établis (home, about).
- **Alternatives écartées** : demander les frames tablette/mobile — hors périmètre (la spec
  acte l'adaptation responsive sans diff).

## 9. Cinématiques de scroll (skill `estuaire-motion`)

- **Décision** : appliquer le motion via le wrapper existant `@/lib/motion/Parallax` +
  attributs data (`data-parallax`/`data-parallax-mode` sur les images, `data-reveal`
  line-mask sur les titres). Hero **statique** (rien au premier paint, Principe I).
  Une seule motion focale à la fois (FR-011). `prefers-reduced-motion` → tout au repos
  (FR-012), géré par `SmoothScroll`/`Parallax`.
- **Justification** : FR-011 exige des animations cinématiques discrètes (contrairement à
  « Nous découvrir » qui était statique) ; les primitives existent et sont réutilisées —
  **aucun nouveau primitif de motion**. Choré exacte arrêtée au build via la skill.
- **Alternatives écartées** : animer le hero / les textes — contraire à la cinématique
  Estuaire (texte = ancre statique, visuels portent le mouvement).

## 10. Pré-footer CTA « Une question, un projet ? » — porté par le footer global

- **Décision** : la page **ne rend pas** de CTA propre ; elle s'arrête à « Infos clés ».
  La bannière CTA « Une question, un projet ? / tout commence ici », le footer et le bouton
  retour-en-haut sont rendus par le **shell global** (`<Footer />` via `SiteFooter`,
  alimenté par `content/footer.ts` / singleton `footer`, + `ScrollTopMount`).
- **Justification** : dans la maquette, `BIG FOOTER` est une **instance** (composant Figma
  réutilisé) qui bundle CTA + footer + retour-en-haut ; le `SiteFooter` du DS rend déjà
  cette bannière CTA (vérifié : `SiteFooter` « CTA banner »). Hors périmètre (spec).
- **Alternatives écartées** : ajouter un CTA de page (comme « Nous découvrir » l'avait pour
  « découvrir nos expertises ») — ici le CTA appartient au footer global, pas à la page.
