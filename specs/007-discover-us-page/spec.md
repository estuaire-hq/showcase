# Spécification : Page « Nous découvrir »

**Branche**: `007-discover-us-page`
**Créée le**: 2026-06-15
**Statut**: Draft
**Contexte**: « Nous découvrir » est la page récit du site vitrine Estuaire (marque de Mosaique
Production) : celle qui raconte **qui est Estuaire**, sa philosophie (la confluence — l'estuaire « où
les univers se rencontrent »), sa **vision** du métier, sa **capacité industrielle** (l'atelier) et son
**mode opératoire** (la méthode, étape par étape). C'est la destination de l'appel à l'action « Notre
vision » de la page d'accueil (home FR-006). Le socle est posé et la home livrée : design system
construit et consommé, navbar sticky responsive, pied de page global, bouton flottant de retour en
haut et cinématiques d'animation existent déjà et sont montés dans le shell `(site)`. Cette feature
consiste à **construire la page « Nous découvrir »** à partir des composants du design system, à
**brancher son contenu sur le CMS**, à appliquer les **cinématiques d'animation** et à la rendre
**fidèle à la maquette** et **responsive** sur les trois formats. Source de vérité visuelle : maquette
Figma *Webdesign-page-nous-découvrir-ESTUAIRE* — `51:2699` (desktop), `78:4374` (tablette),
`78:4626` (mobile).
**Input utilisateur** : « feature : page "nous découvrir" ».

Sections de la maquette (de haut en bas) : `02/ SLIDER` (hero + encart titre), `03/ INTRO` (phrase de
positionnement + texte + visuels + phrase phare), `04/ VISION` (« Notre vision »), `05/ ATELIER` (« De
notre atelier à votre chantier »), `06/ MODE OPÉRATOIRE` (« Notre mode opératoire » en 4 étapes),
`07/ BIG IMAGE` (grand visuel + phrase en incrustation), `08/ CTA expertises` (bouton « découvrir nos
expertises »), `BIG FOOTER`. Le header (navbar) et le footer sont **déjà construits** ; ils ne sont
pas re-spécifiés ici (voir *Hors périmètre*).

## Scénarios utilisateur & tests *(obligatoire)*

### Scénario 1 - Comprendre qui est Estuaire et adhérer à sa vision (Priorité : P1)

Un visiteur (architecte, designer, marque, donneur d'ordre, partenaire ou recruteur) arrive sur
« Nous découvrir » — depuis l'appel à l'action « Notre vision » de la home ou la navigation
principale (« Nous découvrir »). Le **hero** (visuel fort + encart titre), l'**intro de
positionnement** puis le bloc **« Notre vision »** lui font comprendre, en quelques écrans, l'identité
d'Estuaire et sa philosophie : un lieu de confluence où créativité, faisabilité technique et maîtrise
industrielle dialoguent.

**Pourquoi cette priorité** : c'est le cœur de la valeur de cette page — transformer la curiosité en
compréhension et en adhésion à la vision d'Estuaire. Une page qui ne ferait que cela (raconter
l'identité et la vision) est déjà un MVP exploitable et déployable.

**Test indépendant** : afficher la page et vérifier que le hero, l'intro et le bloc « Notre vision »
communiquent l'identité et la philosophie d'Estuaire, que le contenu est lisible et que les chemins
de navigation restent accessibles — sans dépendre des sections suivantes.

**Scénarios d'acceptation** :

1. **Étant donné** un visiteur qui ouvre « Nous découvrir », **quand** le premier écran s'affiche,
   **alors** il voit un visuel hero et un encart titre identifiant le sujet de la page (le savoir-faire
   d'Estuaire), au-dessus d'une navbar restant lisible sur le visuel.
2. **Étant donné** le visiteur qui fait défiler l'intro, **quand** la phrase de positionnement et le
   texte d'introduction s'affichent, **alors** il comprend l'exigence de conception et la maîtrise
   multimatériaux revendiquées par Estuaire, ponctuées d'une phrase phare.
3. **Étant donné** le bloc « Notre vision », **quand** il s'affiche, **alors** le visiteur lit la
   vision d'Estuaire (la métaphore de la confluence / l'estuaire) accompagnée de ses visuels.
4. **Étant donné** un visiteur ayant activé « réduire les animations », **quand** il ouvre la page,
   **alors** le contenu reste complet et lisible, sans mouvement automatique gênant.
5. **Étant donné** la page, **quand** elle s'affiche sur mobile, tablette ou desktop, **alors** la mise
   en page s'adapte au format sans perte de contenu ni de lisibilité.

---

### Scénario 2 - Se rassurer sur la capacité industrielle et la méthode (Priorité : P2)

En poursuivant le défilement, le visiteur découvre l'**atelier** (« De notre atelier à votre
chantier » : implantation à Machecoul, 3000 m², parc machines, déploiements France/Europe) puis le
**mode opératoire** en 4 étapes (01/ Analyse, 02/ Co-conception, 03/ Co-construction, 04/ Installation
et déploiement). Ces sections prouvent qu'Estuaire **sait faire et sait livrer**. Un grand visuel à
forte charge (« notre atelier est un cadre pour expérimenter, pour innover ») puis un appel à l'action
**« découvrir nos expertises »** l'invitent à approfondir l'offre.

**Pourquoi cette priorité** : après l'adhésion à la vision, l'enjeu est de **convaincre de la
capacité à exécuter** et de pousser le visiteur vers l'offre concrète (Expertises) ou le contact.
C'est ce qui transforme l'intérêt en confiance, puis en parcours.

**Test indépendant** : faire défiler la page jusqu'au bas et vérifier que les blocs atelier, mode
opératoire, grand visuel et CTA présentent leur message et que l'appel à l'action mène à la
destination attendue.

**Scénarios d'acceptation** :

1. **Étant donné** le bloc « atelier », **quand** il s'affiche, **alors** le visiteur voit le titre,
   le texte de présentation, les piliers de la promesse (précision / fiabilité / performance), les
   points de capacité (parc machines, organisation agile, installation France et Europe) et les visuels
   associés.
2. **Étant donné** le bloc « mode opératoire », **quand** il s'affiche, **alors** le visiteur parcourt
   les 4 étapes numérotées, chacune avec son titre, son texte et, le cas échéant, sa liste de points.
3. **Étant donné** le grand visuel et sa phrase en incrustation, **quand** ils s'affichent, **alors**
   le message reste lisible par-dessus l'image.
4. **Étant donné** l'appel à l'action « découvrir nos expertises », **quand** le visiteur clique,
   **alors** il est dirigé vers la page Expertises.
5. **Étant donné** n'importe quelle section, **quand** le visiteur la fait apparaître au scroll,
   **alors** une animation discrète accompagne son entrée (les visuels portent le mouvement, le texte
   reste l'ancre), sans jamais bloquer la lecture.

---

### Scénario 3 - Maîtrise éditoriale du contenu (Priorité : P3)

Un membre de l'équipe Estuaire met à jour le contenu de « Nous découvrir » (encart titre du hero,
textes des sections, phrases phares, visuels, étapes du mode opératoire, libellé et lien de l'appel à
l'action) depuis l'outil de gestion de contenu, sans intervention d'un développeur.

**Pourquoi cette priorité** : l'autonomie éditoriale est un objectif de fond du projet (contenu et
visuels pilotés par le CMS), mais la page reste exploitable avant même d'être éditée grâce aux valeurs
par défaut issues de la maquette. C'est donc une couche de valeur qui vient après le rendu lui-même.

**Test indépendant** : modifier un texte ou un visuel de la page dans l'outil de contenu et vérifier
que le changement apparaît sur la page publiée, sans redéploiement.

**Scénarios d'acceptation** :

1. **Étant donné** un éditeur dans l'outil de contenu, **quand** il modifie un texte ou un visuel
   d'une section de la page, **alors** la page publiée reflète ce changement après revalidation.
2. **Étant donné** une page dont le contenu n'a pas encore été saisi, **quand** elle s'affiche,
   **alors** elle présente les textes et visuels par défaut issus de la maquette (aucune zone vide ni
   cassée).
3. **Étant donné** la liste des étapes du mode opératoire, **quand** l'éditeur modifie le texte ou les
   points d'une étape, **alors** la section reflète le changement en conservant l'ordre et la
   numérotation.

---

### Cas limites

- **Hero sans visuel saisi** : la page affiche le visuel et l'encart titre par défaut de la maquette
  (jamais un hero vide).
- **Étape de mode opératoire sans liste de points** : la mise en page de l'étape reste correcte
  (certaines étapes n'ont pas de liste à puces, conformément à la maquette).
- **Visuel manquant ou lent** : un placeholder de chargement (dominante de couleur) évite tout saut de
  mise en page le temps que l'image arrive.
- **Texte plus long que prévu** : titres, paragraphes et phrases phares restent lisibles et ne
  débordent pas leur conteneur quel que soit le format.
- **Lisibilité de la phrase en incrustation** : la phrase posée sur le grand visuel reste lisible quel
  que soit le visuel (traitement de contraste préservé).
- **Destination du CTA non encore publiée** : tant que la page Expertises n'existe pas, le lien
  « découvrir nos expertises » pointe vers la route prévue (404 temporaire accepté) ; la livraison de
  cette page relève d'une feature distincte (voir *Hors périmètre*).
- **Préférence « réduire les animations »** : toutes les animations (reveals au scroll, parallaxe,
  défilement éventuel du hero) sont neutralisées au profit d'un rendu statique complet.
- **Navigation au clavier / lecteur d'écran** : toutes les sections, étapes, visuels et le CTA sont
  atteignables et compréhensibles sans souris.

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : La page « Nous découvrir » DOIT présenter, dans l'ordre de défilement, les sections
  suivantes : (1) hero / slider avec encart titre, (2) intro de positionnement (phrase de
  positionnement + texte + visuels + phrase phare de transition), (3) « Notre vision », (4) atelier
  (« De notre atelier à votre chantier »), (5) « Notre mode opératoire » (étapes), (6) grand visuel
  avec phrase en incrustation, (7) appel à l'action « découvrir nos expertises », suivies du pied de
  page global existant.
- **FR-002** : Le hero DOIT afficher un **visuel plein cadre** et un **encart (cartouche) titre**
  contenant le titre de la page (avec son trait de séparation), conformément à la maquette. Sous
  « réduire les animations », il reste statique.
- **FR-003** : Le bloc **intro** DOIT présenter une **phrase de positionnement** mise en avant, un
  **texte d'introduction** (exigence de conception, maîtrise multimatériaux et savoir-faire), des
  **visuels d'appui** et une **phrase phare** de transition.
- **FR-004** : Le bloc **« Notre vision »** DOIT présenter son titre, une **phrase phare** de vision,
  un **texte de vision** (la métaphore de la confluence / l'estuaire) et ses **visuels**.
- **FR-005** : Le bloc **atelier** DOIT présenter le titre (« De notre atelier à votre chantier »), un
  **texte d'introduction** (implantation, atelier de 3000 m²), les **piliers de la promesse**
  (précision, fiabilité, performance), les **points de capacité** (parc machines dernière génération,
  organisation agile sur-mesure/série, installation et déploiements en France et en Europe), ses
  **visuels** et une **phrase phare**.
- **FR-006** : Le bloc **« Notre mode opératoire »** DOIT présenter son titre et une **liste ordonnée
  d'étapes** ; chaque étape comporte un **numéro**, un **titre**, un **texte** et, le cas échéant, une
  **liste de points** et ses **visuels**. La maquette en décrit quatre (01/ Analyse, 02/ Co-conception,
  03/ Co-construction, 04/ Installation et déploiement).
- **FR-007** : Le bloc **grand visuel** DOIT afficher un **visuel plein largeur** avec une **phrase en
  incrustation** lisible par-dessus l'image.
- **FR-008** : L'**appel à l'action** « découvrir nos expertises » DOIT mener vers la page Expertises
  (route prévue ; 404 temporaire accepté tant que la page n'est pas livrée).
- **FR-009** : Le contenu éditorial de la page (encart titre du hero, titres, textes, phrases phares,
  visuels, étapes du mode opératoire avec leurs points, libellé et lien du CTA, **métadonnées SEO de la
  page** — titre, meta-description, image de partage) DOIT être **éditable via le CMS**, avec des
  **valeurs par défaut issues de la maquette** servant de repli quand le contenu n'est pas saisi.
- **FR-010** : La page DOIT s'afficher correctement et conserver sa lisibilité sur les **trois
  formats** de la maquette : mobile (~390), tablette (~768) et desktop (~1920).
- **FR-011** : Le rendu DOIT être **fidèle à la maquette** sur les dimensions intrinsèques
  (typographie, espacements, proportions, composition, traitements de titres) ; les dimensions
  dynamiques (ex. hauteur du hero) peuvent s'adapter à l'écran.
- **FR-012** : La page DOIT s'intégrer dans le **shell de site existant** (navbar sticky, pied de page
  global, bouton flottant de retour en haut) sans les redéfinir ; elle DOIT déclarer la **tonalité de
  navigation** appropriée pour que la navbar transparente reste lisible au-dessus du hero.
- **FR-013** : Chaque section DOIT être accompagnée d'**animations cinématiques discrètes** au scroll
  (le texte reste l'ancre statique, les visuels et transitions portent le mouvement, les titres se
  révèlent par ligne), avec une seule motion focale à la fois.
- **FR-014** : Toutes les animations DOIVENT honorer la préférence **« réduire les animations »** : un
  visiteur l'ayant activée obtient un rendu statique complet et lisible.
- **FR-015** : La page DOIT être **accessible** : navigation et activation au clavier de toutes les
  sections / visuels / CTA, contrastes suffisants, alternatives textuelles des visuels, structure de
  titres sémantique.
- **FR-016** : La page DOIT respecter les attentes **SEO** : un titre principal (H1) unique, une
  hiérarchie de titres cohérente entre les sections, un titre et une description de page et une image
  de partage social. Le **titre de page, la meta-description et l'image de partage sont éditables via
  le CMS**, avec des valeurs par défaut issues de la maquette.
- **FR-017** : Le bouton flottant de **retour en haut** DOIT apparaître au fil du scroll et ramener en
  haut de page de façon fluide.
- **FR-018** : Le contenu de la page DOIT rester accessible et exploitable même si les visuels ou les
  animations ne se chargent pas (rendu de base d'abord, enrichissement ensuite).

### Entités clés *(incluses car la feature implique du contenu)*

- **Page « Nous découvrir » (singleton de contenu)** : représente l'ensemble du contenu éditable de la
  page — le hero (visuel + encart titre), l'intro, la vision, l'atelier, le mode opératoire (liste
  d'étapes), le grand visuel et sa phrase, le libellé et le lien du CTA, ainsi que les **métadonnées
  SEO de la page** (titre, meta-description, image de partage social).
- **Hero** : un visuel plein cadre et un encart titre (titre de la page + trait de séparation).
- **Bloc intro** : une phrase de positionnement, un texte d'introduction, des visuels d'appui et une
  phrase phare.
- **Bloc vision** : un titre, une phrase phare, un texte et des visuels.
- **Bloc atelier** : un titre, un texte d'introduction, des piliers de promesse (libellés), des points
  de capacité (libellés), des visuels et une phrase phare.
- **Étape de mode opératoire** : un numéro d'ordre, un titre, un texte, une liste de points
  optionnelle et des visuels. Liste ordonnable (4 dans la maquette).
- **Bloc grand visuel** : un visuel plein largeur et une phrase en incrustation.
- **Appel à l'action** : un libellé et un lien de destination (page Expertises).

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **SC-001** : Au moins 80 % des visiteurs testés restituent correctement la philosophie d'Estuaire
  (la confluence / le dialogue entre créativité, technique et maîtrise industrielle) après avoir
  parcouru la page.
- **SC-002** : Depuis « Nous découvrir », la page **Expertises** et la prise de **contact** (via le
  pied de page / la navigation) sont atteignables en un seul clic.
- **SC-003** : Le rendu de la page correspond à la maquette sur les **trois formats** (mobile, tablette,
  desktop), validé par comparaison visuelle (diff) section par section.
- **SC-004** : Avec « réduire les animations » activé, la totalité du contenu reste visible et lisible,
  et l'intégralité de la page est parcourable au clavier (0 piège clavier).
- **SC-005** : Un éditeur modifie un texte, un visuel ou une étape de la page et constate le changement
  sur la page publiée **sans aucune intervention de développeur ni redéploiement**.
- **SC-006** : Avant toute saisie de contenu, la page s'affiche complète, sans zone vide ni élément
  cassé, grâce aux valeurs par défaut de la maquette.
- **SC-007** : Le premier écran devient lisible et le contenu principal apparaît en moins de 2,5 s sur
  une connexion mobile représentative, sans décalage de mise en page notable pendant le chargement.

## Hypothèses

- **Hero** *(défaut validé — « Ok pour les défauts », 2026-06-15)* : le hero est **mono-visuel et
  statique** — un visuel plein cadre + un encart titre fixe (titre de page), sans contrôle ni
  défilement (la maquette `02/ SLIDER` ne porte qu'un seul visuel). Il **ne réutilise pas** le
  diaporama de la home (`HeroSlideshow`, spécifique à la home) mais un nouveau primitif de design
  system `PageHero` (voir plan.md / research.md §3).
- **Mode opératoire — étapes** : modélisé comme une **liste ordonnée d'étapes** éditable (numéro,
  titre, texte, points optionnels, visuels), pré-remplie avec les 4 étapes de la maquette ; chaque
  étape peut avoir une mise en page (visuels, présence de liste) légèrement différente, fidèle à la
  maquette.
- **Destination du CTA** : « découvrir nos expertises » → page Expertises (route prévue, livrée par
  une feature distincte) ; la page se contente de pointer vers la route prévue (404 temporaire accepté).
- **H1 / SEO** : le H1 est le titre principal de la page (encart titre du hero, conformément à la
  maquette) ; titre de page, meta-description et image de partage sont **éditables via le CMS**,
  pré-remplis avec des valeurs par défaut issues de la maquette.
- **URL / slug** *(réglé)* : la page est servie sur **`/nous-decouvrir`** — slug déjà câblé dans la
  navbar (`src/content/navigation.ts`) et dans le CTA « Notre vision » de la home
  (`visionCtaHref` → `/nous-decouvrir`) ; la livrer rend ces liens fonctionnels.
- **Contenu textuel des phrases phares et visuels** : les copies et visuels de référence de la maquette
  servent de valeurs par défaut et de source pour le pré-remplissage initial du contenu (copie partagée
  entre seed et repli front rangée une seule fois, conformément à la convention projet).
- **Langue** : contenu en français uniquement (pas d'internationalisation).
- **Breakpoints** : mobile-first, base = mobile (390), `md` = tablette (768), `lg` = desktop (≥1024,
  référence 1920), conformément à la convention du design system.

## Dépendances

- **Shell de site déjà livré** : navbar sticky responsive, pied de page global (avec diaporama, bouton
  plaquette PDF, bouton flottant de retour en haut) sont construits et montés dans le layout `(site)` ;
  la page s'y insère.
- **Page d'accueil livrée** : « Nous découvrir » est la destination de l'appel à l'action « Notre
  vision » de la home (home FR-006) ; la livraison de cette page rend ce lien fonctionnel.
- **Design system** : les composants présentationnels nécessaires (blocs de section, phrase phare,
  encart titre, listes de points, mise en avant d'étapes, grand visuel avec incrustation, CTA,
  typographie de marque) existent dans le design system et sont consommés tels quels (ou étendus de
  façon délibérée si un composant manque).
- **Cinématiques d'animation** : les primitives de motion (reveals au scroll, parallaxe, révélation
  des titres par ligne) sont définies et réutilisées.
- **Outil de gestion de contenu + revalidation** : le mécanisme de publication/revalidation existant
  est réutilisé pour rendre le contenu éditable de la page.
- **Cache Figma local** : la maquette (« Nous découvrir », 3 formats) est disponible dans le cache
  local et fait foi pour la fidélité visuelle.

## Hors périmètre

- **Navbar et pied de page** : déjà construits et intégrés ; non re-spécifiés ici (sauf intégration /
  vérification de la tonalité de navigation au-dessus du hero).
- **Page Expertises** (destination du CTA) : relève d'une feature distincte ; la page se contente de
  pointer vers la route prévue.
- **Formulaire de contact** et routage des e-mails : portés par la page Contact / le pied de page
  existant.
- **Plaquette PDF** : le bouton de téléchargement de la plaquette est déjà porté par le pied de page
  global ; non re-spécifié ici.
- **Suppression du bac à sable `(lab)`** : nettoyage post-livraison, hors de cette feature.
