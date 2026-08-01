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

## Addendum (2026-07-31) : réintroduction de D3 seule (`LineText`), périmètre resserré

Sur décision de Pierre (worktree `text-hover-line`, via `/dispatch`), **D3 est rétablie** : les liens
texte nus dont le hover était un simple soulignement reçoivent le **trait animé**. L'addendum du
2026-06-23 ci-dessus est donc **partiellement renversé**.

- **D3 (`LineText`) : de nouveau en vigueur.** La primitive est recréée dans le design system depuis
  l'implémentation d'origine (commit `666e88a`), pas réinventée. Comportement inchangé : trait 1px
  `currentColor` qui se dessine de gauche à droite au survol et au `:focus-visible`, **persiste** tant
  que le curseur ou le focus est là, puis se **résorbe vers la droite** à la sortie. Token
  `--duration-line` (400 ms) restauré dans `@theme` ; pas de miroir dans `tokens.ts` (CSS pur, aucun
  GSAP ne le lit).
- **D2 (`RollText`) : reste annulée.** La navbar garde son *ghost-pill*, le menu footer ne roule pas.
  `RollText` n'est pas recréé.
- **Périmètre : les hovers actuellement soulignés, et eux seuls.** Deux endroits dans le code :
  `FooterLink` (variantes `nav` et `legal`) et le lien **mailto** de la page contact. Explicitement
  **hors périmètre** : liens de nav (`NavButton`, `NavDropdown`, `NavPanelItem`), boutons et pills,
  cartes et images (blur + scale) ; `Breadcrumb` (son hover est une bascule d'opacité, seul son
  `focus-visible` souligne) ; les soulignements **permanents** de `LegalPage` et du consentement de
  `ContactForm` (leur hover est un changement de couleur).
- **Trois écarts assumés par rapport à l'implémentation #22**, tous imposés par le périmètre élargi
  au menu footer et au mail 35 px :
  1. `leading-none` sur le conteneur du texte, sinon la ligne se cale sur le *line-height* du lien
     (le menu footer porte `leading-[45px]`) et flotte 14 px sous le texte. Corollaire : les libellés
     doivent tenir sur **une ligne** (vérifié sur les 6 liens, en 390 / 768 / 1440).
  2. Décalage vertical en **`em`** (`-bottom-[0.15em]`) et non en px : à 35 px un offset fixe fait
     passer le trait **dans** les descendantes (le `@` de l'e-mail).
  3. Le `:focus-visible` du footer conserve **en plus** l'anneau DS des surfaces sombres
     (`ring-2 ring-paper`) : un trait de 1 px seul serait un indicateur de focus plus faible que le
     soulignement 2 px qu'il remplace.
- **Règle transverse honorée** : sous `prefers-reduced-motion`, la transition est neutralisée mais le
  trait s'affiche quand même au survol et au focus (l'affordance survit, seul le dessin disparaît).

## Addendum (2026-07-31) : D9 — un seul comportement pour les bandeaux-liens

Sur demande du client (revue vocale) puis arbitrage de Pierre (worktree `banner-links-unify`, via
`/dispatch`), les **bandeaux-liens pleine largeur** — réalisations (home + portfolio), secteurs
(univers), niveaux (expertises) — reçoivent **un seul** comportement : même espacement, même survol,
même mouvement au scroll. Motif : « ils ont souvent une manière de s'afficher différente sur chaque
page », et le survol flou + zoom était jugé laid.

### D9.1 — Espacement : 5 px, et ce n'était pas un arbitrage

La maquette tranche seule : **5 px** entre bandeaux empilés, sur **tous** les breakpoints. Mesuré sur
chaque frame — home 5228/5951/6674 (tablet 3401/4106/4811, mobile 4185/4545/4905), secteurs
1951/2674/3397/4120, expertises 3227/3950/4673 (tablet 1579/2302/3025, mobile 2293/2688/3085),
portfolio 1558/2281/3004 — tous 718 de haut. La **home était déjà conforme** ; univers, expertises et
le portfolio étaient jointifs. Il n'y avait donc rien à décider, seulement un écart à corriger.
Porté par **`BandStack`** (design system) ; aucune page ne redéclare l'écart.

**Largeur du portfolio : écart assumé, contre la maquette.** Le portfolio rend ses bandes **dans le
conteneur** (marges 7,29 %) alors que la maquette les veut **pleine largeur** (x=0, w=1920). Elles ont
été passées en pleine largeur, puis **Pierre a demandé de revenir à l'encart** (2026-07-31, en cours
de branche). C'est donc un écart **validé par le propriétaire**, pas un oubli : seul l'**écart de 5 px**
y est aligné (il était de 24/32 px). Le bandeau **unique** d'une sous-page expertise est, lui, encadré
par sa propre maquette (1640×718 à 7,29 %, node 51:3008).

Corollaire : `CaseStudyCard` n'est **jamais** pleine largeur, ses ratios mobile/tablette d'origine
(390/224, 768/384) sont conservés.

### D9.2 — Survol : désaturation, écart assumé vis-à-vis du kit

Le kit Figma décrit le survol comme un **LAYER_BLUR 15** sur l'image, et rien d'autre : voile
constant à 0,253, seul le CTA passe en crème (nodes 75:3691 « CAS STUDY survol » et 75:3703). Le
`blur-[8px]` du code en était donc une transposition **fidèle** (≈ 7,5 px CSS), pas une atténuation
comme le prétendait son commentaire. Doser le flou ne menait nulle part : le client voulait un autre
effet.

**Retenu (Pierre, après prototypage comparatif sur page lab jetable) : la désaturation.** Au repos
l'image est à **30 % de saturation** sous un voile d'encre **plus profond** que la maquette ; au
survol elle retrouve sa **couleur pleine** et le voile revient aux **25 % de la maquette**.

- **Les zooms étaient des inventions du code**, absentes de la maquette : `scale-105` statique
  (`FeatureBlock`, `CaseStudyCard`), `group-hover:scale-105` (`CaseStudyPanel`), et **les deux à la
  fois** avec le flou sur `RealisationGridCard` — c'est ce dernier que décrivait littéralement la
  remarque du client. Tous supprimés.
- **Règle de contraste** : l'état de **survol EST la maquette** (voile 25 %) et c'est le **repos** qui
  est plus sombre. Le titre blanc en incrustation n'est donc jamais *moins* lisible que la maquette, à
  aucun moment de la transition. L'écart est au repos, où le voile supplémentaire ne fait qu'aider.
- **`prefers-reduced-motion` n'est délibérément pas neutralisé** sur ce fondu : un changement de
  couleur / filtre n'est pas du mouvement vestibulaire (l'ADR traite `motion-reduce` comme portant sur
  le déplacement). C'est la **parallaxe** du bandeau qui est du mouvement, et elle est coupée par le
  driver `Parallax`.
- Périmètre élargi à **`RealisationGridCard`** (grille portfolio) : ce n'est pas un bandeau, mais
  laisser le flou là aurait recréé une incohérence sur la page même dont parlait le client.

### D9.3 — Netteté : le zoom n'était pas le coupable principal

Le client redoutait que le zoom fasse « dépasser le 1920 ». Mesuré à 1920 px, DPR 1, la cause réelle
était ailleurs :

| Bandeau | Avant | Après |
|---|---|---|
| Portfolio « Dernières réalisations » | **1,44× d'agrandissement au repos** (1200 px demandés, 1722 peints) | 1640 peints, 3840 livrés → **2,3× de marge** |
| Sous-page expertise (bandeau unique) | idem 1,44× | 1640 peints, 1909 livrés → **aucun agrandissement** |
| Home | 1,9× de marge, le zoom ne coûtait rien | inchangé, +5 % (plus de `scale-105`) |
| Univers / secteurs | **3,4–3,8×** — sources de 531–593 px | inchangé : **problème de source, pas de code** |
| Expertises / niveaux | 1,48× — sources de 1365 px | 1,41 × — idem |

Deux enseignements :
1. **`CaseStudyCard` était mal câblé** : `sizes` annonçait 1200 px pour une boîte de 1640, sans
   `oversampled()`, plus un `scale-105`. Il était mou **au repos**, indépendamment du survol. Corrigé
   par `BandMedia` (oversampling + `sizes="100vw"`) et le passage en pleine largeur.
2. **Les sources d'univers et d'expertises sont trop petites**, et ce n'est pas récupérable : dans le
   Figma lui-même, les images placées dans les slots 1920×718 font 550–593 px
   (`.design/figma-cache/assets/51-3454.jpg` etc.), et `seed-assets/sectorsPage/*.jpg` les reprend
   telles quelles — donc la prod aussi, via le seed CI. **Aucun changement de survol ne corrige ça** :
   il faut de vraies photos du client. Même constat que la branche `hero-image-quality`.

Garantie tenue : **rien dans ce comportement ne met l'image à l'échelle**, donc la boîte peinte ne
dépasse jamais la largeur réellement demandée au CDN. Vérifié au **pic du survol** (1920 peints,
`scale: none`), pas seulement au repos.

### D9.4 — Mouvement au scroll : la dérive de la home, généralisée

À la demande de Pierre (inspiration [mxms.studio](https://mxms.studio/fr/)), les bandeaux portent un
**mouvement de fond au scroll** : le calque image est plus grand que le bandeau et translaté, si bien
que l'image semble immobile derrière une fenêtre qui défile. C'est exactement le mécanisme de mxms
(instrumenté : `overflow:hidden` + `translateY` à ~la moitié de la vitesse du scroll, **jamais de
`scale`**), et exactement ce que la home embarquait déjà.

- **Intensité : celle de la home**, inchangée (Pierre : « actuelle, 8 % ») — calque 16 % plus haut que
  le bandeau, dérive de ±6 % en `yPercent`. La course `amp × 1,16` reste sous la marge, donc **aucun
  bord n'est jamais découvert** (vérifié à 0 px d'exposition sur toute la passe de scroll).
- **Ce qui change, c'est la portée** : seule la home avait du mouvement ; univers, expertises et le
  portfolio n'en avaient aucun. Tous en ont désormais.
- Un **vrai pin** (image strictement fixe, comme mxms) n'est **pas atteignable** sur un bandeau de
  718 px sans upscaler : il faudrait plus de 1800 px de réserve verticale, on en a ~280. Écarté pour
  cette raison, pas par goût.
- **Simplification** : `CaseStudies` avait sa **propre** tween de parallaxe sur `[data-cs-image]`, qui
  dupliquait le driver partagé. Supprimée au profit de `<Parallax>` + `data-parallax` porté par
  `BandMedia`. Le reveal de contenu (titre, trait, meta) reste dans `CaseStudies`.
- ⚠️ **Contredit en partie une décision antérieure** : la page univers portait « no scroll/appearance
  animations on the images (removed at the owner's request) », qui annulait les clip-reveals prévus
  par l'ADR 0016. La demande du 2026-07-31 est plus récente et explicitement centrée sur les
  bandeaux ; le retrait portait sur les **apparitions**, ce qu'on ajoute est une **dérive de fond**.
  Les clip-reveals restent supprimés.

### D9.5 — Frontière respectée (D8)

- **Design system** : `bandLink.ts` (le contrat d'effet : filtre de survol, voiles, marge de calque,
  amplitude), `BandMedia` (calque image + voiles, déclare le hook `data-parallax`), `BandStack`
  (l'écart de 5 px). Présentationnel, aucun GSAP, aucun Sanity.
- **`@/lib/motion`** : le driver `Parallax` qui arme le hook, et `CaseStudies` pour le reveal de la
  home. Un bandeau sans ancêtre `<Parallax>` (sous-page expertise) reste **inerte, pas cassé**.

## Addendum (2026-07-31, 2) : la nav abandonne le ghost-pill pour `LineText` + un point

Sur décision de Pierre (worktree `navbar-logo-tone`, via `/dispatch`), les entrées de la nav
desktop perdent le *ghost-pill* que l'addendum précédent avait restauré. Motif énoncé : *« l'effet
bouton n'est pas moderne »* pour le survol, et *« l'état courant est moche »* pour l'anneau. Les
propositions ont été comparées dans `src/app/(lab)/lab/nav-hover/` avant arbitrage.

- **Survol** : le mot **monte de 2 px** et le trait **`LineText`** se dessine dessous, sur
  `--duration-line` / `ease-expo`. C'est **D3 étendue à la nav** : la même primitive que
  `FooterLink` et le mailto, donc un seul geste de survol sur tout le site, focus clavier compris.
  `RollText` (D2) **reste annulée**.
- **Page courante** : un **point** 8 px sous le mot + le label en **gras**, et l'entrée est
  **inerte** (ni trait ni montée). Elle est un no-op : elle porte un état, pas une invitation à
  cliquer. Ça règle aussi un conflit constaté à l'écran, le trait (~0,15 em) et le point (8 px)
  s'empilant sous le même mot à cinq pixels d'écart.
- **Écart de maquette assumé, sur trois points** : le KIT (node 75:2963) spécifie survol = pilule
  pleine, actif = anneau 1 px, et label en **400 dans les trois états**. On s'écarte des trois.
  Même registre que l'écart de tonalité d'[[0029-navbar-tone-measured-from-content]].
- **Deux pièges rencontrés, à retenir** :
  1. **La zone de survol ne doit pas bouger.** Translater le `<a>` lui-même sortait sa boîte de
     sous un pointeur posé sur son bord bas : le survol tombait, le mot redescendait, et l'effet
     oscillait. La montée est donc portée par un **span interne**, la hit-area reste fixe.
  2. **Un changement de `@theme` exige un redémarrage du serveur dev.** Après le merge de `main`
     qui apporte `--duration-line`, Turbopack ne recompile pas le bloc `@theme` à chaud : le token
     était absent du CSS servi, `duration-(--duration-line)` ne résolvait rien, et les deux
     transitions paraissaient supprimées alors que le code était juste.
- **Non retenu** : un fond opaque au repos sur le slot (lu comme un bouton) et un halo
  `drop-shadow` sur le texte et le logo, tous deux construits puis retirés sur décision de Pierre.
