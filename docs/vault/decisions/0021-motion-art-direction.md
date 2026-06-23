# 0021 — Direction artistique des animations (motion DA)

- **Statut** : accepté, **en cours de réglage** (la grammaire et l'architecture sont figées ;
  les valeurs exactes — durées, amplitudes, opacités — vivent dans `tokens.ts` et s'ajustent là).
- **Date** : 2026-06-23
- **Origine** : travail ad hoc en worktree `motion-art-direction` (via `/dispatch`, pas de spec ;
  brief dans `.dispatch/`, non commité). Matière source : prototypes du projet *claude design* de
  Pierre, repris tels quels (aucune animation inventée).
- **Contexte** : prolonge le skill **`estuaire-motion`** (maison canonique du mouvement) ; voir
  [[0002-animation-stack]] (GSAP + `@gsap/react` + Lenis), [[0003-design-system]] (langage visuel,
  Principe X), [[0012-about-page-build-decisions]] (motion **placée délibérément**, pas sur chaque
  image). Leçons d'implémentation : [[../post-mortems/0015-motion-in-react-gsap-transform-and-theme-tokens]].

## Contexte

Pierre veut un site **globalement animé de la même manière** : les **mêmes effets de hover** et les
**mêmes effets d'apparition** partout — une grammaire de mouvement **cohérente et réutilisable**, pas
des animations au cas par cas. Contrainte dure : **aucune animation sortie du chapeau** ; chaque effet
vient de la matière source ou est explicitement validé avant d'exister. La DA est bâtie
**incrémentalement** (un effet à la fois, validé en live) ; cet ADR acte la grammaire au fil de l'eau.

## Décisions

### D1 — Deux couches de mouvement distinctes
- **Cinématique de scroll** : le **texte est l'ancre**, il ne bouge pas (pas de parallaxe sur le texte).
  Le contenu se **révèle** une fois à l'entrée puis reste figé ; ce sont les **visuels** et les
  **transitions** qui portent le mouvement.
- **Feedback d'interaction** : sur un élément interactif, le texte **peut** s'animer au survol (le roll).
  Ce n'est pas une contradiction de D1 : c'est du feedback local déclenché par l'intention, pas de la
  cinématique de scroll.

### D2 — Hover « text-roll » (`RollText`) — liens nav + liens principaux du footer
Chaque lettre est dans un cadre `overflow-hidden` ; une colonne à deux copies (repos / accent) roule
vers le haut au survol, lettre par lettre (stagger). Easing maison `expo.out`. **Timing asymétrique** :
**délai au déclenchement** (entrée), **retour immédiat et symétrique** à la sortie (l'inverse exact de
l'entrée, sans délai — surtout pas `timeline.reverse()` qui inverserait aussi l'easing → départ lent
perçu comme un délai). Tons : `onLight` ink→estuaire, `onDark` paper→**cream atténué** (estuaire échoue
le contraste sur ink). Accessibilité : glyphes dupliqués `aria-hidden`, nom accessible via copie
`sr-only` ; `prefers-reduced-motion` → pas de roll, simple bascule de couleur.

### D3 — Hover « line » (`LineText`) — liens secondaires (footer légal, « voir nos réalisations »)
Trait **1px** qui se **dessine de gauche à droite** au survol et se **résorbe vers la droite** à la
sortie (CSS pur : `scaleX` + bascule de `transform-origin` left↔right, seul `transform` transité). Couleur
`currentColor` (s'adapte au fond). Marche aussi au **clavier** (`:focus-visible`) ; `motion-reduce` neutralise.

### D4 — Apparition au scroll (`ScrollReveal` + `data-reveal-fade`) — contenu/texte
Chaque élément marqué `data-reveal-fade` fait un **fondu d'opacité** (0→1, **sans déplacement** —
respecte D1) la 1ʳᵉ fois qu'il entre dans le viewport, **par élément et indépendamment**, puis reste.
Driver global monté dans le layout, re-scanné à chaque navigation ; opacité 0 posée **avant le paint**
(pas de flash) ; `prefers-reduced-motion` → contenu visible direct. Baké dans les composants DS porteurs
de texte (`SectionTitle`, corps de `SplitSection`…) pour une cohérence automatique.

### D5 — Transition de page « rideau » (`PageTransition`)
Un panneau **paper** plein écran **monte depuis le bas** pour couvrir (navbar incluse, porté en portail
sur `<body>`, `z-100`), la route est poussée **pendant la couverture**, puis le panneau **continue vers
le haut** pour révéler la nouvelle page (un seul balayage ascendant). L'interception du clic utilise
**`preventDefault` SANS `stopPropagation`** : `next/link` (v16) appelle le `onClick` applicatif *avant*
de tester `defaultPrevented`, donc Umami (Principe VI) et tous les `onClick` continuent de fonctionner —
seule la navigation de Next est reprise par le rideau. Désactivé sous `prefers-reduced-motion`.

### D6 — Clusters d'images superposées : parallaxe de profondeur
Dans un cluster de deux images qui se chevauchent, l'**image de devant** (au-dessus) **monte plus vite**
au scroll (`data-parallax`, mode `rise`) pendant que l'image du fond reste statique → effet de profondeur.
Appliqué délibérément, pas partout (cf. [[0012-about-page-build-decisions]]).

### D7 — Tokens de mouvement
`@theme` (`globals.css`) = source de vérité **déclarée** ; `tokens.ts` (`motion`) = miroir **et source
live pour GSAP**. Tokens : `--ease-expo` (≈ `expo.out`), `roll*` (durée/délai/stagger), `reveal`,
`curtain`, `clusterParallax`. ⚠️ Les valeurs **GSAP-only** ne sont lues que via `tokens.ts` (Tailwind v4
élague les variables `@theme` non référencées en CSS — voir
[[../post-mortems/0015-motion-in-react-gsap-transform-and-theme-tokens]]).

### D8 — Où vit la DA + forme des primitives
- **Doc opérationnelle** : skill `estuaire-motion` (à consolider quand la DA sera figée).
- **Décision** : cet ADR.
- **Primitives** : hover (présentationnel) dans le **design system** — `RollText`, `LineText` ;
  scroll/page (shells motion) dans **`@/lib/motion`** — `ScrollReveal`, `PageTransition`, `Parallax`.
  Cette frontière (hover = DS, scroll/page = lib/motion) prolonge le langage du DS sans casser la
  frontière data/présentation (Principe VIII).
- **Règle transverse** : `prefers-reduced-motion` honoré sur **chaque** effet.

## Réconciliation

Cette DA **prolonge** `estuaire-motion` (texte = ancre, reveals à l'entrée, un mouvement focal, signatures
contextuelles) sans le contredire : elle **étend** la couche feedback (hovers roll/line standardisés),
**simplifie** le reveal de contenu en un fondu d'opacité homogène, et **ajoute** la transition de page et
la parallaxe de cluster. La constitution gagnera un principe **« Intentional Motion »** (différé, ligne 63)
**une fois la DA figée**.

## Addendum (2026-06-23) : retrait de la couche hover (D2 + D3)

Sur décision de Pierre (worktree `restore-link-hover`, via `/dispatch`), les **hovers de liens**
introduits par #22 ont été **retirés**. Les liens de la **navbar** et du **footer** retrouvent leur
comportement d'avant #22.

- **D2 (`RollText`, text-roll nav + footer principal)** et **D3 (`LineText`, line-draw footer légal)** :
  **annulées**. Les primitives `RollText` / `LineText` sont supprimées du design system (zéro autre
  usage), ainsi que leurs tokens devenus orphelins (`--duration-roll`, `--delay-roll`, `--stagger-roll`,
  `--duration-line` ; `rollDuration` / `rollDelay` / `rollStagger`). `--ease-expo` est conservé (lu par
  `ScrollReveal`).
- **Comportement restauré** : navbar = *ghost-pill* (transparent au repos, se remplit au survol,
  `transition-colors`) ; footer = soulignement au survol/focus (`hover:underline`). C'est l'état exact
  du parent de #22, restauré depuis git (non réinventé).
- **Inchangé** : D1 (deux couches), D4 (`ScrollReveal` / `data-reveal-fade`), D5 (`PageTransition`,
  rideau), D6 (parallaxe de cluster), D7 (tokens conservés : `--ease-expo`, `reveal`, `curtain`,
  `clusterParallax`), D8 (frontière hover = DS / scroll-page = `@/lib/motion`, désormais sans primitive
  hover côté DS).

Le statut de l'ADR reste **« en cours de réglage »** : la grammaire *reveal / transition / parallaxe*
demeure la DA en vigueur ; seule la **couche feedback hover** est abandonnée (retour au feedback hover
natif d'avant #22). Le principe constitutionnel « Intentional Motion » (différé) couvrira la DA restante
une fois figée.
