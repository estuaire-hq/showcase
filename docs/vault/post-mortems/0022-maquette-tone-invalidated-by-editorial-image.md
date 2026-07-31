# 0022, Logo invisible : une valeur de maquette invalidée par l'image éditoriale

- **Date** : 2026-07-31
- **Branche** : `navbar-logo-tone`
- **Lien** : [[decisions/0029-navbar-tone-measured-from-content]], [[post-mortems/0017-multi-resolution-review-blind-spots]]

> Numéro 0022 : le 0021 a été pris par `main` (`0021-fix-shipped-without-confirming-the-symptom`)
> pendant ce worktree, donc renumérotation au merge (skill `estuaire-branch-sync`). ADR 0029 libre.
> Renuméroter au merge si collision avec un worktree parallèle, skill `estuaire-branch-sync`.

## Symptôme

Sur `estuaire.fr/nous-decouvrir`, le logo de la navbar est **blanc sur un mur blanc** : illisible.
Signalé non pas comme un bug mais comme une question, *« pourquoi le logo est en blanc ? »*, parce
que rien, à la lecture, ne laissait penser à une erreur : la maquette dit bien blanc.

## Diagnostic

**Le code était juste ; c'est son hypothèse qui avait cessé d'être vraie.**

La chaîne produit exactement ce qu'on lui demande : `nous-decouvrir/page.tsx` déclare
`data-nav-logo-tone="onDark"` → `Navbar.readHeaderTones()` → `SiteHeader` → `TONE_TEXT_CLASS.onDark`
= `text-paper` → `BrandLogo` en `currentColor`. Et c'est **conforme aux trois frames Figma** (51:2699,
78:4374, 78:4626), où tous les vecteurs du groupe `logo` sont en `#ffffff`.

Le blanc reposait sur une hypothèse jamais écrite : *la photo est sombre là où le logo se pose.* Vraie
dans la maquette (rack de bois sombre, luminance 86 → **7,35:1**), fausse en production, où l'image a
été remplacée par un cadrage plus large de la même scène : le rack sort du champ, le logo tombe sur le
mur de l'atelier (luminance 215 → **1,44:1**, contre 3:1 exigé par WCAG 2.2 SC 1.4.11).

Deux fausses pistes écartées avant de conclure, chacune par une mesure :

- **« C'est notre crop qui diffère »**, la maquette pose son image en `STRETCH`, le code en
  `object-cover`. Testé sur **l'image de la maquette** : le code donne 6,99:1 contre 7,35:1 dans
  Figma. Même verdict, donc le crop est innocent.
- **« Toutes les pages à logo blanc sont touchées »**, non : le critère n'est pas « le logo est-il
  blanc » mais « sur quoi repose-t-il ». La home surplombe le split solide de `HeroSlideshow`, pas une
  photo. **Mais cette vérification a elle-même produit une seconde erreur, voir ci-dessous.**

## Deuxième erreur : une garantie vérifiée à une seule largeur

De ce constat j'ai conclu que les pages « à surface solide » (`/univers`, `/univers/[slug]`,
`/realisations`, la home) avaient un contraste **garanti par construction**, et je les ai exclues de
la mesure en le documentant comme un choix délibéré. Le propriétaire a trouvé le contre-exemple en
réduisant simplement la largeur de la fenêtre : sur `/univers`, « nous découvrir » passe au-dessus du
cartouche noir **sans passer en blanc**.

La cause est une **géométrie mixte** : les panneaux sont dimensionnés en **pourcentage**
(`w-[56.8%]`, `lg:right-[48%]`) tandis que les pills ont une **largeur fixe en px, ancrées à droite**
(`lg:px-[140px]` + labels de largeur constante). Leur recouvrement n'est donc pas invariant : à 1920
les liens sont tous à droite de la couture, et en dessous ils glissent dessus. Mesuré en production :

| page | plage cassée | pire |
|---|---|---|
| `/univers`, `/univers/[slug]` | 1024 → 1700 | **1:1** (ink sur cartouche ink) |
| `/realisations` | 1024 → 1700 | **1,45:1** (ink sur panneau estuaire) |
| `/` home | 1024 → 1536 | **1:1** |

Toute la plage laptop, donc 1280 / 1366 / 1440 / 1536, des résolutions majeures. Le défaut était **en
ligne**, préexistant, et personne ne l'avait vu, moi compris, parce que j'avais vérifié cette famille
de pages à 1920 uniquement, la largeur du frame Figma.

Ce qui l'a corrigé : mesurer aussi ces pages, mais via le **DOM** (la couleur d'un panneau est dans
`getComputedStyle`, contrairement à une photo) plutôt que via une bande synthétique qui aurait
dupliqué la géométrie du panneau.

## Troisième leçon : le remède visuel n'était pas le bon levier

Pour les labels à cheval sur la couture, j'ai construit deux compensations successives, un fond
opaque puis un halo, toutes deux **refusées par le propriétaire** : elles faisaient lire les liens
comme des boutons et ajoutaient une ombre au texte et au logo, là où la référence est le texte nu de
« Nous découvrir ».

La leçon n'est pas « il fallait choisir l'autre remède », c'est que **je traitais un problème de
layout par de la peinture**. Un lien à cheval sur une couture ink/paper n'a aucune solution par la
couleur du texte, donc tout remède colorimétrique ne pouvait être qu'un cache-misère, avec un coût
esthétique que le propriétaire a immédiatement vu. La vraie question était : *pourquoi un lien
traverse-t-il la couture ?* Réponse : parce que le layout le permet en dessous de ~1900 px. Le levier
propre est donc géométrique (largeur du panneau par palier, ou bascule burger plus tardive), pas
chromatique. À proposer, pas à décider seul.

La campagne de mesure a par ailleurs trouvé un **défaut jamais signalé** : sur
`/expertises/agencement-sur-mesure`, les quatre liens desktop sont à **2,44-2,48:1**.

## Cause racine

Une **valeur de design copiée d'une maquette, portant sur un contenu qui peut changer, sans rien pour
détecter la divergence.** La tonalité décrit une relation entre deux choses (un slot et le fond
derrière lui), mais n'était stockée que comme une constante sur l'une des deux. Le jour où l'autre
bouge, la constante devient un mensonge silencieux : pas d'erreur de type, pas de test rouge, pas
d'alerte de build. Seul un œil sur la page pouvait le voir, et encore fallait-il regarder le bon
breakpoint.

C'est la même famille que [[post-mortems/0017-multi-resolution-review-blind-spots]] : une vérification
qui portait sur ce que le code déclare, pas sur ce qu'il rend.

## Correctif

Mesurer au lieu de déclarer, sur tout fond susceptible de varier : voir
[[decisions/0029-navbar-tone-measured-from-content]] pour l'architecture (bande LQIP échantillonnée
côté serveur pour les photos, lecture des fonds peints du DOM pour les panneaux, seuil
d'équi-contraste dérivé, résolution par slot côté client, variante `paper` du CTA). Aucun artefact
visuel : la tonalité est le seul levier retenu.

## Leçons

1. **Une valeur de design qui décrit une RELATION au contenu ne doit pas être stockée comme une
   constante.** Tonalité sur photo, taille de texte sur longueur variable, hauteur de bloc sur nombre
   d'items : dès qu'un des deux termes vient du CMS, la valeur figée est une bombe à retardement.
   Demander : *« qu'est-ce qui casse cette valeur si le client change son contenu demain ? »*
2. **« Conforme à la maquette » n'est pas « correct ».** La maquette est la source de vérité sur
   l'**intention** ; elle n'est pas une garantie de résultat sur du contenu qu'elle ne connaît pas.
   Ici la maquette contenait elle-même le défaut à son échelle : à 768, son propre « Estuaire » blanc
   et son burger blanc se perdent sur le mur clair. Reproduire fidèlement, c'était reproduire le
   défaut.
3. **Un « pourquoi » du propriétaire mérite une mesure, pas une explication.** La tentation était de
   répondre « c'est la maquette » et de clore. Le chiffre (1,44:1) a transformé une question de goût
   en défaut d'accessibilité objectif, et a fait apparaître un second défaut sur une autre page.
4. **Mesurer le rendu, pas le déclaré.** La sonde de contraste (luminance réelle derrière la boîte de
   chaque slot, à partir du bitmap plein format + les voiles composités) est le seul oracle qui aurait
   attrapé ça. Elle fait désormais partie de la recette de la navbar, comme le probe de layout fait
   partie de la revue multi-résolution.
5. **Le LQIP est une donnée sous-exploitée.** Il est déjà fetché avec chaque image, et un flou de 20
   px suffit à trancher une décision binaire de contraste (verdict identique à la vérité pixel sur
   les six cas testés). Avant d'ajouter une requête ou une dépendance, regarder ce que le pipeline
   transporte déjà. Attention à sa limite : ce flou **lisse les creux locaux**, donc il ne dit pas si
   le contraste tient à l'échelle du glyphe (2,3 à 2,9:1 mesurés là où il concluait « rien à faire »).
6. **Une invariance px contre pourcentage n'est jamais garantie : elle se vérifie sur la plage.**
   C'est la leçon de la deuxième erreur. Dès qu'un élément en **px** et un fond en **%** se
   superposent, leur recouvrement est fonction de la largeur, donc une vérification à une largeur ne
   prouve rien. Le réflexe : chercher la largeur où les deux se croisent, pas celle du frame Figma.
   Et se méfier du mot « garanti par construction » quand la construction mélange deux unités.
7. **Une exemption doit être plus argumentée qu'une inclusion.** Exclure les pages solides me
   demandait une preuve *pour toutes les largeurs* ; je l'ai justifiée par une mesure à une seule.
   Une exemption est un endroit où l'on cesse de vérifier : elle mérite donc plus de preuves que le
   cas général, pas moins.
