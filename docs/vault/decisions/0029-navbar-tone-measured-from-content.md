# 0029 : la tonalité de la navbar est mesurée sur le contenu, plus déclarée depuis la maquette

- **Statut** : accepté.
- **Date** : 2026-07-31
- **Origine** : travail ad hoc en worktree `navbar-logo-tone` (via `/dispatch`, pas de spec ; brief
  dans `.dispatch/`, non commité). Question de départ du propriétaire : *« sur cette page
  https://estuaire.fr/nous-decouvrir, pourquoi le logo dans la navbar est en blanc ? Alors que comme
  ça j'aurais eu tendance à dire que le contraste pousserait vers du noir »*.
- **Périmètre** : les slots « fantômes » de la barre (logo, liens desktop, burger) et la pilule CTA,
  **à l'état `top` uniquement**, sur toute page dont la barre surplombe autre chose qu'un `bg-paper`
  uni, que ce soit une photo ou un panneau de couleur. Le contrat d'attributs de la feature 003 est
  étendu, pas remplacé.
- **Contexte** : prolonge [[0005-data-presentation-boundary]] (le DS reste présentationnel : la
  mesure vit dans `@/lib/nav`, pas dans `@/design-system`) et s'appuie sur
  [[0027-image-delivery-via-sanity-loader]] (le LQIP déjà fetché est la source de la mesure).
  Vérifié via la gate [[0022-multi-resolution-pixel-review]]. Post-mortem associé :
  [[0022-maquette-tone-invalidated-by-editorial-image]].

## Contexte

La tonalité de chaque slot de la navbar était une **constante recopiée de la maquette** : la page
déclarait `data-nav-logo-tone="onDark"` et le logo peignait en blanc (`SiteHeader` → `TONE_TEXT_CLASS`
→ `BrandLogo` en `currentColor`). Sur « Nous découvrir », c'était fidèle aux trois frames Figma
(51:2699, 78:4374, 78:4626), où le groupe `logo` est bien en `#ffffff`.

Ce blanc reposait sur une hypothèse **implicite et non vérifiable par le code** : que la photo de hero
soit sombre là où le logo se pose. Dans la maquette, elle l'était (rack de bois sombre dans le coin
haut-gauche, luminance 86/255 → contraste 7,35:1). En production, l'image éditoriale a été remplacée
par un cadrage plus large de la même scène : le rack est sorti du champ, le logo se retrouve sur le
mur blanc de l'atelier. Mesures relevées en production (luminance moyenne derrière la boîte du slot,
contraste WCAG du rendu réel) :

| slot | largeur | fond | contraste rendu | seuil |
|---|---|---|---|---|
| logo | 1920 | 215 | **1,44:1** | 3:1 |
| logo | 768 | 213 | **1,47:1** | 3:1 |
| logo | 390 (voile 25 %) | 163 | **2,54:1** | 3:1 |
| burger | 768 | 194 | **1,78:1** | 3:1 |
| burger | 390 (voile 25 %) | 152 | **2,90:1** | 3:1 |

La même campagne de mesure a révélé un **second défaut indépendant**, jamais signalé : sur
`/expertises/agencement-sur-mesure`, les quatre liens desktop, déclarés `onDark`, sont à
**2,44-2,48:1** sur un fond mesuré à 165.

Deux vérifications ont écarté les fausses pistes avant de conclure. Le rendu du code n'est pas en
cause : la maquette pose son image en `STRETCH` et le code en `object-cover`, mais avec **l'image de
la maquette** le code donne 6,99:1 contre 7,35:1 dans Figma, soit le même verdict. Et la home ne surplombe
jamais une photo : sa barre flotte sur le split solide de `HeroSlideshow` (`bg-ink` à gauche,
`bg-paper` à droite). Attention cependant, ce constat a d'abord été pris pour une garantie alors
qu'il n'était vérifié qu'à 1920 : voir le point 8, la home est en réalité cassée de 1024 à 1536 pour
une raison indépendante (recouvrement variable d'un panneau en pourcentage).

Le diagnostic est donc : **le code était correct, l'hypothèse de contraste ne l'était plus.** Une
valeur de design copiée d'une maquette devient fausse dès que le contenu qu'elle décrit change, et
rien dans la chaîne ne le signale.

## Décision

La tonalité par slot est **déduite du fond réel** plutôt que déclarée, sur tout fond susceptible de
varier : une photo éditoriale comme un panneau de couleur dont le recouvrement bouge avec la largeur
du viewport.

1. **Mesure côté serveur, sans coût réseau.** `@/lib/nav/luminance` décode le **LQIP déjà fetché**
   avec chaque image (`metadata.lqip`, ~400 octets, cf. `mapImage`), reproduit le crop `object-cover`
   du hero pour chaque breakpoint (`sharp` avec `fit: "cover"` = `object-fit: cover`), composite le
   voile `bg-ink/25` de `PageHero` quand il s'applique à ce breakpoint, et échantillonne la bande de
   la barre en 32 colonnes. Zéro requête supplémentaire, zéro JS client, donc aucun flash de mauvaise
   couleur.
2. **Seuil dérivé, pas réglé au jugé.** `TONE_THRESHOLD = 121` est le point d'**équi-contraste**
   entre `paper` (#ffffff) et `ink` (#0e1215) : le fixe de `contraste(paper, L) = contraste(ink, L)`.
   Choisir le côté où tombe la mesure garantit donc **≥ 4,34:1 en théorie**. À recalculer si l'un des
   deux tokens change.
3. **La géométrie reste au client, l'image au serveur.** La largeur d'une pilule dépend de la police
   rendue, donc sa boîte n'est pas calculable côté serveur. Le serveur émet la bande
   (`data-nav-band-sm|md|lg`, ~130 octets par breakpoint) ; `useMeasuredTones` lit la boîte de chaque
   slot (`data-nav-slot`) et interroge la bande. Le pont entre les deux est un tableau de nombres :
   le client ne décode aucune image.
4. **Un slot = une décision.** Les liens sont résolus **individuellement** (clés par href) : sur
   `/expertises`, le fond varie de 8 à 137 d'un lien à l'autre, avec des contrastes de 3,5 à 20:1.
   Une tonalité de groupe aurait moyenné ces cas.
5. **Aucun artefact ajouté : la tonalité est le seul levier.** Deux compensations ont été
   construites puis **retirées sur décision du propriétaire** : un fond opaque au repos sur le slot
   (« les liens sont entourés comme dans un bouton ») et un halo `drop-shadow` sur le texte et le
   logo (« il faut la retirer »). La consigne est le rendu en **texte nu de « Nous découvrir »
   partout**. La barre ne peint donc rien : elle choisit seulement ink ou paper.

   Le compromis est assumé et mesurable : là où un label **chevauche une couture franche**
   ink/paper, la fraction du mot qui tombe du mauvais côté reste illisible, car aucune couleur de
   texte ne peut servir les deux moitiés (les deux mesurent 1:1 d'un côté). Constaté à l'image sur
   `/univers` à 1280 (« experti|ses ») et sur la home à 1440 (« nous décou|vrir »).

   **La seule façon d'éliminer ce cas sans rien peindre est un changement de layout** : faire en
   sorte que les pills ne traversent jamais la couture, en ajustant la largeur du panneau par palier
   (`w-[56.8%]` ne laisse la place aux liens qu'au-delà de ~1900 px) ou en repoussant la bascule
   burger→liens de `lg` à `xl`. Les deux touchent la maquette, donc restent à arbitrer.

6. **Nouvelle variante `paper` pour le CTA.** Les deux tonalités du kit sont sombres (estuaire
   luminance 49, ink 17) : sur un hero sombre la pilule mesurait 1,35:1 et sa forme disparaissait.
   Arbitrer entre deux sombres ne pouvait pas corriger ça. Une pilule claire (fond `paper`, texte
   `ink`) est ajoutée, **choisie uniquement sur fond mesuré sombre**, le bleu de marque est préféré
   partout où le fond le permet. Aucun `ring` n'est ajouté quand seul le CONTOUR de la pilule se
   fond dans un fond de même valeur : un CTA cerclé lirait comme un autre composant, même raison
   que pour les liens.
7. **Toutes les pages sont mesurées, chacune par l'oracle adapté à son fond.** Une première version
   exemptait les pages « à surface solide » (`/univers`, `/realisations`, la home) au motif que leur
   contraste était garanti par construction. **C'était faux**, et vérifié seulement à 1920 : ces
   panneaux sont dimensionnés en **pourcentage** (`w-[56.8%]`, `lg:right-[48%]`) alors que les pills
   ont une **largeur fixe en px ancrée à droite**. Leur recouvrement se déplace donc avec la largeur
   du viewport, et de 1024 à ~1700 « nous découvrir » se retrouvait en ink sur le cartouche ink,
   soit **1:1**, sur trois pages, en production. Voir post-mortem 0022.

   Le fond solide n'a pas besoin d'une bande : sa couleur **est dans le DOM**. Le hook la lit
   directement (`elementsFromPoint` + composition des couches translucides via un canvas 1×1, car
   Tailwind v4 rend `oklab()` dès qu'il y a une opacité). Avantage décisif sur une bande synthétique :
   la mesure **suit le CSS** au lieu de dupliquer la géométrie du panneau. Les couches `fixed`
   (intro d'entrée, rideau de transition) sont ignorées : ce sont des voiles transitoires, pas la
   surface de la page, et elles masquent la barre de toute façon.

   Seules restent hors mesure les surfaces qui n'ont aucun fond variable : les pages légales et le
   détail réalisation sont sur `bg-paper` plein, et leur tonalité déclarée `onLight` est exacte à
   toute largeur (vérifié).
8. **La mesure ne vaut qu'à `top`.** En `pinned`/`hidden` la barre est opaque (`bg-paper`) et tout
   est forcé `ink` ; en `overlay` tout est forcé blanc. Le seuil `TOP_THRESHOLD = 8` de
   `useStickyNav` garantit que l'état `top` correspond bien au haut de page mesuré.

## Alternatives écartées

- **Voile dégradé sous la barre** (première intention validée, puis rétrogradée). Rend le blanc
  lisible sur n'importe quelle photo, mais fabrique le fond au lieu de s'y adapter : il assombrit le
  visuel de trois pages pour un problème qui n'existe que sur une partie d'entre elles, et n'aurait
  rien dit du cas inverse (fond sombre, slot ink). Conservé en esprit sous la forme du halo, appliqué
  **par slot** et seulement quand la mesure le justifie.
- **`mix-blend-mode: difference`.** Inversion automatique, sans JS ni mesure, mais deux défauts
  rédhibitoires : contraste **nul** sur les mi-tons (~128, exactement la zone à risque), et un logo
  qui vire au cyan sur du bois orangé, inacceptable pour une identité de marque.
- **Mesure de pixels côté client** (canvas sur l'image plein format). Dépend du CORS, coûte un
  décodage d'image, et la couleur ne serait décidée qu'après hydratation : flash visible.
- **Micro-fetch `?rect=…&w=32` sur le CDN Sanity par zone.** Mesure quasi exacte, mais une requête
  serveur par zone et par breakpoint là où le LQIP, déjà en main, suffit à trancher (validé sur six
  cas : verdict identique à la vérité pixel dans les six).
- **Tonalité par lien calculée côté serveur.** Impossible sans la largeur du texte rendu, d'où le
  partage serveur (image) / client (géométrie).

## Conséquences

- `sharp` passe de dépendance transitive de Next à **dépendance déclarée** (déjà installée, aucun
  poids ajouté). Il n'est utilisé que côté serveur, dans un module gardé par `import "server-only"`.
- `SiteHeader` gagne une prop `measured` et marque ses slots (`data-nav-slot`) ; `MenuToggle` et
  `NavButton`/`NavDropdown` gagnent respectivement `slot` et `halo`. Le contrat
  `specs/003-responsive-navbar/contracts/section-tone.md` est étendu des attributs `data-nav-band-*`.
- Les tonalités déclarées **restent** : valeur rendue au SSR, et seule source sur les pages à surface
  solide. Aucune page n'a eu à changer ses déclarations.
- **Écart assumé à la maquette** : sur « Nous découvrir » en production, logo et burger deviendront
  noirs alors que les trois frames les donnent blancs. Le côte à côte montre que la maquette souffre
  du même défaut à son échelle (à 768, son propre « Estuaire » blanc et son burger blanc se perdent
  sur le mur clair). La lisibilité prime, et l'écart ne se produit **que là où l'image s'écarte de
  celle de la maquette** : avec l'image de la maquette (dataset dev), le rendu reste identique à
  Figma à 1920.
- **Garantie théorique 4,34:1, garantie pratique inférieure sur photo.** Le LQIP est un flou :
  l'erreur mesurée va de -15 à +30 sur 255, donc une décision peut se prendre sur une estimation
  légèrement du mauvais côté, et surtout ce flou **lisse les creux locaux** (2,3 à 2,9:1 relevés au
  pire pixel là où la bande concluait « rien à faire »). D'où le plancher `halo` sur photo. Un
  logotype est explicitement exempté du critère de contraste de texte (SC 1.4.3) ; les liens et le
  burger sont des composants d'interface et relèvent du 3:1 de SC 1.4.11.
- **État de la vérification, à ne pas surestimer.** Sur les fonds **solides** la mesure est exacte
  (la couleur vient du DOM) et le rendu a été vérifié slot par slot, position par position, contre la
  géométrie des panneaux : `/univers`, `/univers/[slug]`, `/realisations` et la home à 1024 / 1280 /
  1440 (+ 768 et 390), toutes correctes, y compris les slots à cheval qui reçoivent leur fond opaque.
  Sur les fonds **photo**, la couverture exhaustive reste **UNVERIFIED** : la sonde automatisée
  écrite pour la mesurer produisait des faux positifs (canvas de lecture contaminé quand le moteur
  refuse une valeur CSS, puis `null` propagé dans le calcul du ratio), et son diagnostic n'a pas été
  mené à terme. Les cas photo ont été validés par lecture DOM et captures à taille réelle, pas par
  une passe automatisée fiable. Une sonde de recette digne de confiance reste à écrire.
- La sonde de contraste écrite pour ce diagnostic devient l'outil de recette de la navbar : elle
  mesure, par page et par résolution, ce que chaque slot rend contre son fond réel.

## Ce que ça ne résout pas

- Une image dont la zone du logo est **uniformément mi-ton** (~121) ne peut être servie par aucune des
  deux tonalités : le halo la rend lisible, il ne la rend pas belle. Le vrai remède est éditorial.
- Le **cadrage** de l'image de hero de « Nous découvrir » reste divergent de la maquette. Le correctif
  rend la barre lisible dessus ; il ne restitue pas l'intention du designer (logo blanc sur zone
  sombre). À signaler au client comme un point de contenu, indépendamment du code.
