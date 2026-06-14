# Spécification : Implémentation de la page d'accueil

**Branche**: `005-homepage`
**Créée le**: 2026-06-12
**Statut**: Draft
**Contexte**: La page d'accueil est la porte d'entrée du site vitrine Estuaire (marque de Mosaique
Production). Le socle est posé — design system construit et consommé, navbar sticky responsive et
pied de page global déjà livrés et intégrés dans le shell `(site)`. Aujourd'hui la route `/` n'affiche
qu'un **placeholder** (titre + tagline). Cette feature consiste à **assembler la vraie page d'accueil**
à partir des composants du design system, à **brancher son contenu sur le CMS**, à appliquer les
**cinématiques d'animation** et à la rendre **fidèle à la maquette** et **responsive** sur les trois
formats. Source de vérité visuelle : maquette Figma *Webdesign-ESTUAIRE* — home `51:2221` (desktop),
`77:3149` (tablette), `77:3150` (mobile) ; slider d'intro `51:2420`.
**Input utilisateur** : « feature: Implémentation de la page d'accueil ».

Sections de la maquette (de haut en bas) : `01/ HEADER-SLIDER-INTRO` (header + slider + intro),
`02/ NOS EXPERTISES`, `03/ NOS UNIVERS - PORTFOLIO`, `04/ NOTRE VISION`, `BIG FOOTER`. Le header et
le footer sont **déjà construits** ; ils ne sont pas re-spécifiés ici (voir *Hors périmètre*).

## Clarifications

### Session 2026-06-12

- **Q : D'où vient le contenu des cartes de réalisations de la section « Nos univers / Réalisations » de
  la home, et qu'inclut cette feature ?** → **R : Cartes statiques pour l'instant.** La section affiche
  un ensemble fixe de cartes de réalisations utilisant les visuels de la maquette (contenu statique, non
  éditable). Aucun modèle de contenu « réalisation » n'est créé dans cette feature. Le branchement CMS
  de ces cartes sera réalisé **au moment de la feature « Réalisations »**, là où le modèle de contenu
  des réalisations sera conçu (voir FR-005 et *Hors périmètre*).
- **Q : Quels contrôles de navigation pour le hero / slider multi-slides ?** → **R : Défilement
  automatique seul, sans contrôle manuel.** Le hero enchaîne ses slides en fondu (visuel + titre
  changent ensemble), sans flèches ni puces — conformément à la maquette (aucun contrôle dessiné) et au
  composant de diaporama déjà utilisé au pied de page. « Réduire les animations » fige la première slide.
- **Q : Que font les boutons « univers / secteurs » tant que les pages par secteur n'existent pas ?** →
  **R : Liens actifs vers la route prévue par secteur (`/univers/[secteur]`).** Chaque univers est un lien
  actif vers sa sous-page de secteur planifiée ; 404 temporaire accepté jusqu'à la livraison de la feature
  « Univers », cohérent avec la règle des CTA de section (pointer vers la route prévue).
- **Q : Que se passe-t-il au clic sur une carte de réalisation (statique) ?** → **R : Cartes cliquables
  vers le catalogue Réalisations (`/realisations`).** Par cohérence avec les liens d'univers et de CTA, les
  cartes deviennent cliquables (effet de survol conservé) et pointent **toutes** vers la page catalogue
  `/realisations` (route clé garantie d'exister, SC-002) — pas de deep-link par item, donc aucun lien mort
  permanent malgré le contenu statique. **À revoir lors de l'implémentation de la page Réalisations** :
  rebrancher chaque carte vers sa page de détail (`/realisations/[slug]`) une fois le modèle de contenu créé.
  *(Remplace la décision initiale « cartes non cliquables ».)*
- **Q : Les métadonnées SEO de la home (titre, description, image de partage) sont-elles éditables ?** →
  **R : Oui, éditables via le CMS.** Ajoutées au singleton « Page d'accueil » (titre de page,
  meta-description, image de partage social), avec valeurs par défaut issues de la maquette en repli
  (voir FR-007 et FR-014).

## Scénarios utilisateur & tests *(obligatoire)*

### Scénario 1 - Première impression & identité de marque (Priorité : P1)

Un visiteur (prospect, marque, recruteur ou partenaire potentiel) arrive sur la page d'accueil. Dès
le premier écran, un **hero** visuel fort et une **intro de positionnement** lui font comprendre, en
quelques secondes, qui est Estuaire (« agenceur-concepteur engagé ») et ce qu'il propose. La
**navigation principale** (déjà en place) et les premiers repères lui permettent d'aller plus loin.

**Pourquoi cette priorité** : c'est le cœur de la valeur d'une page d'accueil de site vitrine — créer
une première impression nette et crédible et orienter le visiteur. Une home qui ne fait que cela est
déjà un MVP exploitable et déployable.

**Test indépendant** : afficher `/` et vérifier que le hero et l'intro communiquent l'identité de la
marque, que le contenu est lisible et que les chemins de navigation sont accessibles — sans dépendre
des sections suivantes.

**Scénarios d'acceptation** :

1. **Étant donné** un visiteur qui ouvre la page d'accueil, **quand** le premier écran s'affiche,
   **alors** il voit un visuel hero et un message de positionnement identifiant clairement Estuaire.
2. **Étant donné** le hero composé de plusieurs slides, **quand** le temps passe, **alors** le visuel et
   le titre changent ensemble automatiquement, en fondu et sans à-coup.
3. **Étant donné** un visiteur ayant activé « réduire les animations », **quand** il ouvre la home,
   **alors** le contenu reste complet et lisible, sans mouvement automatique gênant.
4. **Étant donné** la page d'accueil, **quand** elle s'affiche sur mobile, tablette ou desktop,
   **alors** la mise en page s'adapte au format sans perte de contenu ni de lisibilité.

---

### Scénario 2 - Découverte guidée de l'offre (Priorité : P2)

En faisant défiler la page, le visiteur découvre successivement **Nos expertises** (agencement,
mobilier, présentoir), **Nos univers / Réalisations** (secteurs d'intervention + une sélection de
réalisations marquantes) et **Notre vision** du métier. Chaque section l'incite, par un appel à
l'action clair, à approfondir sur la page dédiée correspondante, ou à entrer en contact.

**Pourquoi cette priorité** : après la première impression, l'enjeu est de convertir l'intérêt en
exploration — donner envie de creuser l'offre et de contacter Estuaire. C'est ce qui transforme la
home en point de départ d'un parcours, pas en cul-de-sac.

**Test indépendant** : faire défiler `/` et vérifier que chaque bloc (expertises, univers/réalisations,
vision) présente son message et mène, via son CTA, vers la destination attendue.

**Scénarios d'acceptation** :

1. **Étant donné** le bloc « Nos expertises », **quand** le visiteur clique sur son appel à l'action,
   **alors** il est dirigé vers la page Expertises.
2. **Étant donné** la section « Nos univers / Réalisations », **quand** elle s'affiche, **alors** le
   visiteur voit les univers (secteurs) comme points d'entrée et une sélection de réalisations en
   cartes (visuel + secteur + titre).
3. **Étant donné** une carte de réalisation (statique), **quand** le visiteur la survole puis clique,
   **alors** un effet visuel signale l'interaction et la carte mène à la page catalogue Réalisations
   (`/realisations`) ; le lien vers la page de détail sera rebranché avec la feature « Réalisations ».
4. **Étant donné** le bloc « Notre vision », **quand** le visiteur clique sur son appel à l'action,
   **alors** il est dirigé vers la page « Nous découvrir ».
5. **Étant donné** n'importe quelle section, **quand** le visiteur la fait apparaître au scroll,
   **alors** une animation discrète accompagne son entrée (les visuels portent le mouvement, le texte
   reste l'ancre), sans jamais bloquer la lecture.

---

### Scénario 3 - Maîtrise éditoriale du contenu (Priorité : P3)

Un membre de l'équipe Estuaire met à jour le contenu de la page d'accueil (slides du hero, textes des
sections, visuels, libellés et liens des appels à l'action des blocs) depuis l'outil de gestion de
contenu, sans intervention d'un développeur. (Les cartes de réalisations, statiques, ne sont pas
concernées — voir FR-005.)

**Pourquoi cette priorité** : l'autonomie éditoriale est un objectif de fond du projet (contenu et
visuels pilotés par le CMS), mais la home reste exploitable avant même d'être éditée grâce aux valeurs
par défaut issues de la maquette. C'est donc une couche de valeur qui vient après le rendu lui-même.

**Test indépendant** : modifier un texte ou un visuel de la home dans l'outil de contenu et vérifier
que le changement apparaît sur la page publiée, sans redéploiement.

**Scénarios d'acceptation** :

1. **Étant donné** un éditeur dans l'outil de contenu, **quand** il modifie un texte ou un visuel d'une
   section de la home, **alors** la page publiée reflète ce changement après revalidation.
2. **Étant donné** une page d'accueil dont le contenu n'a pas encore été saisi, **quand** elle
   s'affiche, **alors** elle présente les textes et visuels par défaut issus de la maquette (aucune
   zone vide ni cassée).
3. **Étant donné** un hero multi-slides, **quand** l'éditeur ajoute, retire ou réordonne une slide,
   **alors** le carrousel reflète la nouvelle composition.

---

### Cas limites

- **Hero sans slide** : si aucune slide n'est configurée, la home affiche la slide par défaut de la
  maquette (jamais un hero vide).
- **Cartes de réalisations** : l'ensemble est fixe (contenu statique de la maquette) ; la section n'est
  donc jamais vide et ne dépend d'aucune saisie éditoriale pour l'instant.
- **Visuel manquant ou lent** : un placeholder de chargement (dominante de couleur) évite tout saut de
  mise en page le temps que l'image arrive.
- **Texte plus long que prévu** : les titres et paragraphes restent lisibles et ne débordent pas leur
  conteneur quel que soit le format.
- **Destination d'un CTA non encore publiée** : tant qu'une page cible (Expertises, Univers — y compris
  ses sous-pages de secteur `/univers/[secteur]` —, Réalisations, Nous découvrir, Contact) n'existe pas,
  son lien pointe vers la route prévue (404 temporaire) ; la livraison de ces pages relève de features
  distinctes (voir *Hors périmètre*).
- **Préférence « réduire les animations »** : toutes les animations automatiques (défilement du hero,
  reveals au scroll, parallaxe) sont neutralisées au profit d'un rendu statique complet.
- **Navigation au clavier / lecteur d'écran** : toutes les sections, slides, cartes et CTA sont
  atteignables et compréhensibles sans souris.

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : La page d'accueil DOIT présenter, dans l'ordre de défilement, les sections suivantes :
  (1) hero / slider, (2) intro de positionnement, (3) « Nos expertises », (4) « Nos univers /
  Réalisations », (5) « Notre vision », suivies du pied de page global existant.
- **FR-002** : Le hero DOIT être un **carrousel multi-slides à défilement automatique** (en fondu) où le
  visuel et le titre changent ensemble, **sans contrôle manuel** (ni flèches ni puces), avec au moins
  une slide. Sous « réduire les animations », il affiche la première slide figée.
- **FR-003** : Le bloc « Nos expertises » DOIT présenter un visuel, un texte de présentation et un
  appel à l'action menant vers la page Expertises.
- **FR-004** : La section « Nos univers / Réalisations » DOIT présenter les **univers / secteurs**
  (retail, bureaux, scénographie, résidentiel) comme **liens actifs** vers leur sous-page de secteur prévue
  (`/univers/[secteur]`, 404 temporaire accepté), et un ensemble de **cartes de réalisations** (visuel,
  secteur, titre).
- **FR-005** : Les cartes de réalisations de cette section DOIVENT afficher un **ensemble fixe de
  contenu statique** (visuels et libellés issus de la maquette), **non éditable** pour l'instant. Elles
  SONT **cliquables** (effet de survol conservé) et pointent **toutes vers la page catalogue Réalisations**
  (`/realisations`) — pas de deep-link par carte, afin d'éviter tout lien mort permanent vu l'absence de
  modèle de contenu. Aucun modèle de contenu « réalisation » n'est créé dans cette feature. Le branchement
  CMS **et** le rebranchement de chaque carte vers sa page de détail (`/realisations/[slug]`) se feront **au
  moment de la feature « Réalisations »**, lorsque le modèle de contenu des réalisations sera conçu (voir
  *Hors périmètre*).
- **FR-006** : Le bloc « Notre vision » DOIT présenter un visuel, un texte et un appel à l'action menant
  vers la page « Nous découvrir ».
- **FR-007** : Le contenu éditorial de la home (slides du hero, titres, textes, visuels, libellés et
  liens des CTA des blocs, **métadonnées SEO de la page** — titre, meta-description, image de partage)
  DOIT être **éditable via le CMS**, avec des **valeurs par défaut issues de
  la maquette** servant de repli quand le contenu n'est pas saisi. Les cartes de réalisations de la
  section « Réalisations » sont **exclues** de ce périmètre éditable pour l'instant (statiques, FR-005).
- **FR-008** : La page d'accueil DOIT s'afficher correctement et conserver sa lisibilité sur les
  **trois formats** de la maquette : mobile (~390), tablette (~768) et desktop (~1920).
- **FR-009** : Le rendu DOIT être **fidèle à la maquette** sur les dimensions intrinsèques (typographie,
  espacements, proportions, composition, traitement contour/plein des titres) ; les dimensions
  dynamiques (ex. hauteur du hero) peuvent s'adapter à l'écran.
- **FR-010** : La page d'accueil DOIT s'intégrer dans le **shell de site existant** (navbar sticky,
  pied de page global, bouton flottant de retour en haut) sans les redéfinir ; elle DOIT déclarer la
  tonalité de navigation appropriée pour que la navbar transparente reste lisible au-dessus du hero.
- **FR-011** : Chaque section DOIT être accompagnée d'**animations cinématiques discrètes** au scroll
  (le texte reste l'ancre statique, les visuels et transitions portent le mouvement, les titres se
  révèlent par ligne), avec une seule motion focale à la fois.
- **FR-012** : Toutes les animations DOIVENT honorer la préférence **« réduire les animations »** : un
  visiteur l'ayant activée obtient un rendu statique complet et lisible.
- **FR-013** : La page d'accueil DOIT être **accessible** : navigation et activation au clavier de
  toutes les sections / slides / cartes / CTA, contrastes suffisants, alternatives textuelles des
  visuels, structure de titres sémantique.
- **FR-014** : La page d'accueil DOIT respecter les attentes **SEO** : un titre principal (H1) unique
  correspondant au petit label au-dessus des grands titres, une hiérarchie de titres cohérente, un
  titre et une description de page, et une image de partage social. Le **titre de page, la
  meta-description et l'image de partage sont éditables via le CMS** (champs du singleton « Page
  d'accueil »), avec des valeurs par défaut issues de la maquette.
- **FR-015** : Le bouton flottant de **retour en haut** DOIT apparaître au fil du scroll et ramener en
  haut de page de façon fluide.
- **FR-016** : Le contenu de la page DOIT rester accessible et exploitable même si les visuels ou les
  animations ne se chargent pas (rendu de base d'abord, enrichissement ensuite).

### Entités clés *(incluses car la feature implique du contenu)*

- **Page d'accueil (singleton de contenu)** : représente l'ensemble du contenu éditable de la home —
  les slides du hero, le texte d'intro, les trois blocs (expertises, univers, vision) avec leurs
  titres, textes, visuels et appels à l'action, ainsi que les **métadonnées SEO de la page** (titre,
  meta-description, image de partage social). (Les cartes de réalisations en sont exclues : statiques,
  FR-005.)
- **Slide de hero** : un visuel + un titre (avec traitement contour/plein), affichés ensemble ;
  ordonnable au sein du carrousel.
- **Bloc de section** (expertises / vision) : un titre, un texte, un visuel, un libellé de CTA et son
  lien de destination.
- **Univers / secteur** : un nom et un **lien actif** vers sa sous-page de secteur (`/univers/[secteur]`).
- **Carte de réalisation** (statique, FR-005) : un visuel, un secteur/univers de rattachement et un
  titre. Contenu fixe issu de la maquette ; **cliquable vers le catalogue `/realisations`** (pas de lien
  de détail par item dans cette feature). Pas d'entité CMS.

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **SC-001** : Au moins 80 % des visiteurs testés décrivent correctement l'activité d'Estuaire
  (« agenceur-concepteur ») après avoir seulement vu le premier écran, en moins de 5 secondes.
- **SC-002** : Depuis la page d'accueil, 100 % des destinations clés (Expertises, Univers, Réalisations,
  Nous découvrir, Contact) sont atteignables en un seul clic via la navigation ou les CTA des sections.
- **SC-003** : Le rendu de la home correspond à la maquette sur les **trois formats** (mobile, tablette,
  desktop), validé par comparaison visuelle (diff) section par section.
- **SC-004** : Avec « réduire les animations » activé, la totalité du contenu reste visible et lisible,
  et l'intégralité de la page est parcourable au clavier (0 piège clavier).
- **SC-005** : Un éditeur modifie un texte ou un visuel de la home et constate le changement sur la page
  publiée **sans aucune intervention de développeur ni redéploiement**.
- **SC-006** : Avant toute saisie de contenu, la page d'accueil s'affiche complète, sans zone vide ni
  élément cassé, grâce aux valeurs par défaut de la maquette.
- **SC-007** : Le premier écran devient lisible et le contenu principal apparaît en moins de 2,5 s sur
  une connexion mobile représentative, sans décalage de mise en page notable pendant le chargement.

## Hypothèses

- **Hero éditable, multi-slides** : le hero est un carrousel multi-slides géré par l'éditeur dans le CMS
  (visuels et titres), à défilement automatique sans contrôle manuel (voir *Clarifications* et FR-002),
  conformément à la maquette (`51:2420`) et au précédent du diaporama du footer.
- **Destinations des CTA** : « Nos expertises » → page Expertises ; « Notre vision » → page « Nous
  découvrir » ; les cartes de réalisation → la page catalogue `/realisations` pour l'instant (puis leur
  page de détail avec la feature « Réalisations ») ; les univers → leur sous-page de secteur
  (`/univers/[secteur]`). Ces pages cibles sont livrées par des features distinctes ; la home se contente
  de pointer vers les routes prévues.
- **H1 / SEO** : le H1 est le petit label situé au-dessus des grands titres (conformément à la
  maquette) ; le titre de page, la meta-description et l'image de partage sont **éditables via le CMS**
  (singleton « Page d'accueil »), pré-remplis avec des valeurs par défaut issues de la maquette ; les
  URLs des pages cibles restent à confirmer par Pierre.
- **Langue** : contenu en français uniquement (pas d'internationalisation).
- **Contenu par défaut = maquette** : les copies et visuels de référence de la maquette servent de
  valeurs par défaut et de source pour le pré-remplissage initial du contenu.
- **Breakpoints** : mobile-first, base = mobile (390), `md` = tablette (768), `lg` = desktop (≥1024,
  référence 1920), conformément à la convention du design system.

## Dépendances

- **Shell de site déjà livré** : navbar sticky responsive et pied de page global (avec diaporama,
  bouton plaquette PDF, bouton flottant de retour en haut) sont construits et montés dans le layout
  `(site)` ; la home s'y insère.
- **Design system** : les composants présentationnels nécessaires (bloc de mise en avant, carte de
  réalisation, diaporama, boutons de secteur, flèches de carrousel, CTA, typographie de marque)
  existent dans le design system et sont consommés tels quels.
- **Outil de gestion de contenu + revalidation** : le mécanisme de publication/revalidation existant
  est réutilisé pour rendre le contenu éditable de la home (hors cartes de réalisations, statiques).
- **Cache Figma local** : la maquette (home + slider, 3 formats) est disponible dans le cache local et
  fait foi pour la fidélité visuelle.

## Hors périmètre

- **Navbar et pied de page** : déjà construits et intégrés ; non re-spécifiés ici (sauf intégration /
  vérification de la tonalité de navigation au-dessus du hero).
- **Pages cibles des CTA** : Expertises, Univers (et sous-pages secteurs), Réalisations (catalogue +
  pages de détail), Nous découvrir, Contact — chacune relève d'une feature distincte.
- **Contenu CMS des réalisations** : modèle de contenu « réalisation », templates court/long, ~20+ cas,
  filtres, état « aucune réalisation », pages de détail — reporté à la **feature « Réalisations »**, où
  le modèle sera conçu ; c'est aussi à ce moment-là que les cartes statiques de la home seront branchées
  sur le CMS (FR-005).
- **Formulaire de contact** et routage des e-mails par type de demande (porté par la page Contact).
- **Suppression du bac à sable `(lab)`** : nettoyage post-livraison, hors de cette feature.
