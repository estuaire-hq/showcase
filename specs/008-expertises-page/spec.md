# Spécification : Page « Expertises »

**Branche**: `008-expertises-page`
**Créée le**: 2026-06-17
**Statut**: Draft
**Contexte**: « Expertises » est la page **offre** du site vitrine Estuaire (marque de Mosaique
Production) : celle qui présente **ce que sait faire** Estuaire et structure son savoir-faire en
**3 niveaux d'expertise** — l'agencement (métier d'agenceur), les mobiliers (sur mesure et en série)
et les présentoirs (de la pièce simple à la plus sophistiquée). C'est la destination de l'appel à
l'action « découvrir nos expertises » de la page « Nous découvrir » (about) et de l'entrée
« expertises » de la navigation principale. Le socle est posé et les pages home + « Nous découvrir »
sont livrées : design system construit et consommé, navbar sticky responsive, pied de page global,
bouton flottant de retour en haut et cinématiques d'animation existent déjà et sont montés dans le
shell `(site)`. Cette feature consiste à **construire la page « Expertises »** (la landing de la
section) à partir des composants du design system, à **brancher son contenu sur le CMS**, à appliquer
les **cinématiques d'animation** et à la rendre **fidèle à la maquette** et **responsive** sur les
trois formats. Source de vérité visuelle : maquette Figma *Webdesign-page-expertises-ESTUAIRE* —
`51:2893` (desktop), `87:5600` (tablette), `87:6290` (mobile).
**Input utilisateur** : « nouvelle feature : page expertises ».

Sections de la maquette (de haut en bas) : `012/ SLIDER` (hero plein cadre + encart titre noir),
`02/ INTRO` (phrase phare + texte d'introduction + visuels), `03/ NOS NIVEAUX D'EXPERTISE` (titre
« Nos 3 niveaux d'expertise » + 3 cartes pleine largeur, une par niveau, chacune avec un appel
« en savoir plus » vers sa sous-page), `05/ BIG IMAGE` (grand visuel + phrase phare en incrustation),
`BIG FOOTER` (bloc CTA + pied de page global). Le header (navbar) et le footer sont **déjà
construits** ; ils ne sont pas re-spécifiés ici (voir *Hors périmètre*). Les **3 sous-pages
d'expertise** (agencement / mobiliers / présentoirs sur mesure) sont des **features distinctes** :
cette page se contente de pointer vers leurs routes (voir *Hypothèses* et *Hors périmètre*).

## Scénarios utilisateur & tests *(obligatoire)*

### Scénario 1 - Comprendre l'offre d'Estuaire et ses 3 niveaux d'expertise (Priorité : P1)

Un visiteur (architecte, designer, marque, donneur d'ordre, partenaire) arrive sur « Expertises » —
depuis l'appel à l'action « découvrir nos expertises » de « Nous découvrir », depuis l'entrée
« expertises » de la navigation, ou via le pied de page. Le **hero** (visuel fort + encart titre
« Notre expertise : réaliser vos projets de toutes formes et de toutes tailles »), l'**intro de
positionnement** (« À la frontière entre artisanat et industrie, entre design et fabrication ») puis
le bloc **« Nos 3 niveaux d'expertise »** lui font comprendre, en quelques écrans, **ce que fait**
Estuaire et comment son savoir-faire se structure : agencement, mobiliers, présentoirs.

**Pourquoi cette priorité** : c'est le cœur de la valeur de cette page — donner une vue claire de
l'offre et de sa structuration en 3 niveaux. Une page qui ne ferait que cela (présenter l'offre et
ses 3 axes) est déjà un MVP exploitable et déployable.

**Test indépendant** : afficher la page et vérifier que le hero, l'intro et le bloc « Nos 3 niveaux
d'expertise » communiquent l'offre d'Estuaire et identifient sans ambiguïté les trois niveaux
(agencement, mobiliers, présentoirs), que le contenu est lisible et que les chemins de navigation
restent accessibles — sans dépendre des sections suivantes ni des sous-pages.

**Scénarios d'acceptation** :

1. **Étant donné** un visiteur qui ouvre « Expertises », **quand** le premier écran s'affiche,
   **alors** il voit un visuel hero plein cadre et un encart titre (sur-titre, trait de séparation,
   titre « Notre expertise : réaliser vos projets de toutes formes et de toutes tailles »)
   identifiant le sujet de la page, au-dessus d'une navbar restant lisible sur le visuel.
2. **Étant donné** le visiteur qui fait défiler l'intro, **quand** la phrase phare et le texte
   d'introduction s'affichent, **alors** il comprend le positionnement d'Estuaire (« à la frontière
   entre artisanat et industrie ») et la diversité des projets réalisés (espaces commerciaux,
   bureaux, hôtels particuliers, installations éphémères), accompagnés de leurs visuels.
3. **Étant donné** le bloc « Nos 3 niveaux d'expertise », **quand** il s'affiche, **alors** le
   visiteur identifie le titre de section et **trois** cartes distinctes, une par niveau (agencement,
   mobiliers, présentoirs), chacune avec son visuel, son intitulé et un appel « en savoir plus ».
4. **Étant donné** un visiteur ayant activé « réduire les animations », **quand** il ouvre la page,
   **alors** le contenu reste complet et lisible, sans mouvement automatique gênant.
5. **Étant donné** la page, **quand** elle s'affiche sur mobile, tablette ou desktop, **alors** la
   mise en page s'adapte au format sans perte de contenu ni de lisibilité.

---

### Scénario 2 - Choisir un niveau d'expertise et passer à l'action (Priorité : P2)

Convaincu par l'offre, le visiteur veut **approfondir** un niveau précis. Chaque carte du bloc
« Nos 3 niveaux d'expertise » porte un appel **« en savoir plus »** menant à la sous-page dédiée
(agencement sur mesure, mobiliers sur mesure et en série, présentoirs sur mesure). En bas de page, un
**grand visuel** porte une phrase phare de synthèse (« Nous concevons chaque projet avec la précision
du sur-mesure et la puissance de l'industrie ») et le **bloc CTA** du pied de page invite à la prise
de contact.

**Pourquoi cette priorité** : après la compréhension de l'offre, l'enjeu est de **router** le
visiteur vers le niveau qui le concerne ou vers le contact. C'est ce qui transforme l'intérêt en
parcours. La page reste un MVP utile sans ce routage (Scénario 1), mais c'est lui qui crée la
conversion.

**Test indépendant** : faire défiler la page jusqu'au bas et vérifier que chaque carte de niveau mène
à la destination attendue, que le grand visuel présente son message lisible et que le bloc CTA du
pied de page mène à la prise de contact.

**Scénarios d'acceptation** :

1. **Étant donné** une carte de niveau d'expertise, **quand** le visiteur active son appel
   « en savoir plus », **alors** il est dirigé vers la sous-page correspondante (route prévue ;
   404 temporaire accepté tant que la sous-page n'est pas livrée — voir *Hypothèses*).
2. **Étant donné** le grand visuel et sa phrase phare en incrustation, **quand** ils s'affichent,
   **alors** le message reste lisible par-dessus l'image (traitement de contraste préservé).
3. **Étant donné** le bloc CTA du pied de page, **quand** le visiteur l'active, **alors** il est
   dirigé vers la prise de contact (réutilise le pied de page global existant).
4. **Étant donné** n'importe quelle section, **quand** le visiteur la fait apparaître au scroll,
   **alors** une animation discrète accompagne son entrée (les visuels portent le mouvement, le texte
   reste l'ancre), sans jamais bloquer la lecture.

---

### Scénario 3 - Maîtrise éditoriale du contenu (Priorité : P3)

Un membre de l'équipe Estuaire met à jour le contenu de « Expertises » (encart titre du hero, phrase
phare et texte d'intro, visuels, intitulés / visuels / liens des 3 cartes de niveau, phrase phare du
grand visuel, métadonnées SEO) depuis l'outil de gestion de contenu, sans intervention d'un
développeur.

**Pourquoi cette priorité** : l'autonomie éditoriale est un objectif de fond du projet (contenu et
visuels pilotés par le CMS), mais la page reste exploitable avant même d'être éditée grâce aux valeurs
par défaut issues de la maquette. C'est donc une couche de valeur qui vient après le rendu lui-même.

**Test indépendant** : modifier un texte, un visuel ou un lien d'une carte de niveau dans l'outil de
contenu et vérifier que le changement apparaît sur la page publiée, sans redéploiement.

**Scénarios d'acceptation** :

1. **Étant donné** un éditeur dans l'outil de contenu, **quand** il modifie un texte ou un visuel
   d'une section de la page, **alors** la page publiée reflète ce changement après revalidation.
2. **Étant donné** une page dont le contenu n'a pas encore été saisi, **quand** elle s'affiche,
   **alors** elle présente les textes, visuels et liens par défaut issus de la maquette (aucune zone
   vide ni cassée).
3. **Étant donné** la liste des 3 niveaux d'expertise, **quand** l'éditeur modifie l'intitulé, le
   visuel ou le lien d'un niveau, **alors** la section reflète le changement en conservant l'ordre.

---

### Cas limites

- **Hero sans visuel saisi** : la page affiche le visuel et l'encart titre par défaut de la maquette
  (jamais un hero vide).
- **Visuel manquant ou lent** : un placeholder de chargement (dominante de couleur) évite tout saut
  de mise en page le temps que l'image arrive.
- **Texte plus long que prévu** : sur-titre, titres de cartes, paragraphes et phrases phares restent
  lisibles et ne débordent pas leur conteneur quel que soit le format.
- **Lisibilité des textes en incrustation** : l'encart titre du hero, les intitulés des cartes (posés
  sur visuel assombri) et la phrase du grand visuel restent lisibles quel que soit le visuel.
- **Nombre de niveaux d'expertise** : la maquette en présente exactement **trois** ; la mise en page
  reste correcte si un niveau est temporairement masqué ou réordonné dans le CMS.
- **Destination d'une carte non encore publiée** : tant qu'une sous-page d'expertise n'existe pas, son
  « en savoir plus » pointe vers la route prévue (404 temporaire accepté) ; la livraison de ces
  sous-pages relève de features distinctes (voir *Hors périmètre*).
- **Préférence « réduire les animations »** : toutes les animations (reveals au scroll, parallaxe,
  défilement éventuel du hero) sont neutralisées au profit d'un rendu statique complet.
- **Navigation au clavier / lecteur d'écran** : toutes les sections, cartes, visuels, appels
  « en savoir plus » et le CTA sont atteignables et compréhensibles sans souris.

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : La page « Expertises » DOIT présenter, dans l'ordre de défilement, les sections
  suivantes : (1) hero / slider avec encart titre, (2) intro (phrase phare + texte d'introduction +
  visuels), (3) « Nos 3 niveaux d'expertise » (titre de section + 3 cartes de niveau), (4) grand
  visuel avec phrase phare en incrustation, suivies du **bloc CTA** et du **pied de page global**
  existants.
- **FR-002** : Le hero DOIT afficher un **visuel plein cadre** et un **encart (cartouche) titre** sur
  fond sombre contenant un **sur-titre** (« Design d'espace, agencement et présentoirs »), un **trait
  de séparation** et le **titre de la page** (« Notre expertise : réaliser vos projets de toutes
  formes et de toutes tailles »), conformément à la maquette. Sous « réduire les animations », il
  reste statique.
- **FR-003** : Le bloc **intro** DOIT présenter une **phrase phare** mise en avant (« À la frontière
  entre artisanat et industrie, entre design et fabrication »), un **texte d'introduction**
  (bureau d'études + atelier, ouvrages et objets multimatériaux, diversité des projets) et des
  **visuels d'appui**.
- **FR-004** : Le bloc **« Nos 3 niveaux d'expertise »** DOIT présenter un **titre de section**
  (« Nos 3 niveaux d'expertise ») et une **liste ordonnée de 3 niveaux** ; chaque niveau est rendu
  comme une **carte pleine largeur** comportant un **visuel** (assombri pour la lisibilité), un
  **intitulé** et un **appel « en savoir plus »** vers la sous-page du niveau. La maquette décrit :
  (1) « Notre vision du métier d'agenceur » → *agencement sur mesure*, (2) « Notre savoir-faire
  appliqué aux mobiliers » → *mobiliers sur mesure et en série*, (3) « Notre exigence au service des
  présentoirs » → *présentoirs sur mesure*.
- **FR-005** : Chaque appel **« en savoir plus »** d'un niveau DOIT mener vers la **route de sa
  sous-page** (`/expertises/agencement-sur-mesure`, `/expertises/mobiliers-sur-mesure`,
  `/expertises/presentoirs-sur-mesure` ; 404 temporaire accepté tant que la sous-page n'est pas
  livrée).
- **FR-006** : Le bloc **grand visuel** DOIT afficher un **visuel plein largeur** (assombri) avec une
  **phrase phare en incrustation** (« Nous concevons chaque projet avec la précision du sur-mesure et
  la puissance de l'industrie ») lisible par-dessus l'image.
- **FR-007** : Le contenu éditorial de la page (sur-titre + titre du hero, phrase phare et texte
  d'intro, visuels, intitulés / visuels / liens des 3 niveaux, phrase phare du grand visuel,
  **métadonnées SEO de la page** — titre, meta-description, image de partage) DOIT être **éditable via
  le CMS**, avec des **valeurs par défaut issues de la maquette** servant de repli quand le contenu
  n'est pas saisi.
- **FR-008** : La page DOIT s'afficher correctement et conserver sa lisibilité sur les **trois
  formats** de la maquette : mobile (~390), tablette (~768) et desktop (~1920).
- **FR-009** : Le rendu DOIT être **fidèle à la maquette** sur les dimensions intrinsèques
  (typographie, espacements, proportions, composition, traitements de titres) ; les dimensions
  dynamiques (ex. hauteur du hero) peuvent s'adapter à l'écran.
- **FR-010** : La page DOIT s'intégrer dans le **shell de site existant** (navbar sticky, bloc CTA +
  pied de page global, bouton flottant de retour en haut) sans les redéfinir ; elle DOIT déclarer la
  **tonalité de navigation** appropriée pour que la navbar transparente reste lisible au-dessus du
  hero.
- **FR-011** : Chaque section DOIT être accompagnée d'**animations cinématiques discrètes** au scroll
  (le texte reste l'ancre statique, les visuels et transitions portent le mouvement, les titres se
  révèlent par ligne), avec une seule motion focale à la fois.
- **FR-012** : Toutes les animations DOIVENT honorer la préférence **« réduire les animations »** : un
  visiteur l'ayant activée obtient un rendu statique complet et lisible.
- **FR-013** : La page DOIT être **accessible** : navigation et activation au clavier de toutes les
  sections / visuels / appels « en savoir plus » / CTA, contrastes suffisants, alternatives textuelles
  des visuels, structure de titres sémantique.
- **FR-014** : La page DOIT respecter les attentes **SEO** : un titre principal (H1) unique, une
  hiérarchie de titres cohérente entre les sections, un titre et une description de page et une image
  de partage social. Le **titre de page, la meta-description et l'image de partage sont éditables via
  le CMS**, avec des valeurs par défaut issues de la maquette.
- **FR-015** : Le bouton flottant de **retour en haut** DOIT apparaître au fil du scroll et ramener en
  haut de page de façon fluide (réutilise le comportement existant du shell).
- **FR-016** : Le contenu de la page DOIT rester accessible et exploitable même si les visuels ou les
  animations ne se chargent pas (rendu de base d'abord, enrichissement ensuite).
- **FR-017** : La page DOIT être servie sur la route **`/expertises`** (slug déjà câblé dans la navbar
  et le pied de page) ; la livrer rend fonctionnels les liens « expertises » de la navigation et
  l'appel « découvrir nos expertises » de « Nous découvrir ».

### Entités clés *(incluses car la feature implique du contenu)*

- **Page « Expertises » (singleton de contenu)** : représente l'ensemble du contenu éditable de la
  page — le hero (visuel + sur-titre + titre), l'intro (phrase phare + texte + visuels), la liste des
  3 niveaux d'expertise, le grand visuel et sa phrase phare, ainsi que les **métadonnées SEO de la
  page** (titre, meta-description, image de partage social).
- **Hero** : un visuel plein cadre et un encart titre (sur-titre + trait de séparation + titre de la
  page).
- **Bloc intro** : une phrase phare, un texte d'introduction et des visuels d'appui.
- **Niveau d'expertise** : un intitulé, un visuel, un appel à l'action (libellé + lien de destination
  vers la sous-page). Liste ordonnable (3 dans la maquette).
- **Bloc grand visuel** : un visuel plein largeur et une phrase phare en incrustation.

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **SC-001** : Au moins 80 % des visiteurs testés identifient correctement les **trois niveaux
  d'expertise** d'Estuaire (agencement, mobiliers, présentoirs) après avoir parcouru la page.
- **SC-002** : Depuis « Expertises », chacune des **3 sous-pages d'expertise** et la prise de
  **contact** (via le bloc CTA / le pied de page / la navigation) sont atteignables en un seul clic.
- **SC-003** : Le rendu de la page correspond à la maquette sur les **trois formats** (mobile,
  tablette, desktop), validé par comparaison visuelle (diff) section par section.
- **SC-004** : Avec « réduire les animations » activé, la totalité du contenu reste visible et
  lisible, et l'intégralité de la page est parcourable au clavier (0 piège clavier).
- **SC-005** : Un éditeur modifie un texte, un visuel ou un lien d'un niveau d'expertise et constate
  le changement sur la page publiée **sans aucune intervention de développeur ni redéploiement**.
- **SC-006** : Avant toute saisie de contenu, la page s'affiche complète, sans zone vide ni élément
  cassé, grâce aux valeurs par défaut de la maquette.
- **SC-007** : Le premier écran devient lisible et le contenu principal apparaît en moins de 2,5 s sur
  une connexion mobile représentative, sans décalage de mise en page notable pendant le chargement.

## Hypothèses

- **Périmètre = la landing « Expertises » uniquement** *(défaut motivé)* : cette feature livre la page
  `/expertises` (la page de présentation de l'offre). Les **3 sous-pages d'expertise** (agencement /
  mobiliers / présentoirs sur mesure), bien que présentes dans la maquette comme cibles distinctes,
  sont des **features séparées** — par analogie avec la feature 007 « Nous découvrir », qui a traité
  le lien *vers* Expertises comme une simple route (404 temporaire accepté). Les cartes de niveau
  pointent vers les routes prévues des sous-pages.
- **Hero** : mono-visuel et **statique** — un visuel plein cadre + un encart titre fixe (la maquette
  `012/ SLIDER` ne porte qu'un seul visuel) ; il **ne réutilise pas** le diaporama de la home. Si un
  primitif de design system `PageHero` existe déjà (issu de « Nous découvrir »), il est réutilisé /
  étendu plutôt que recréé (à confirmer en phase plan).
- **Niveaux d'expertise** : modélisés comme une **liste ordonnée éditable** (intitulé, visuel, lien),
  pré-remplie avec les 3 niveaux de la maquette ; chaque niveau peut avoir un visuel propre, fidèle à
  la maquette.
- **Destinations des cartes** : `/expertises/agencement-sur-mesure`, `/expertises/mobiliers-sur-mesure`,
  `/expertises/presentoirs-sur-mesure` (routes prévues, livrées par des features distinctes ; 404
  temporaire accepté).
- **H1 / SEO** : le H1 est le titre principal de la page (encart titre du hero, conformément à la
  maquette) ; titre de page, meta-description et image de partage sont **éditables via le CMS**,
  pré-remplis avec des valeurs par défaut issues de la maquette.
- **URL / slug** *(réglé)* : la page est servie sur **`/expertises`** — slug déjà câblé dans la navbar
  et le pied de page (`src/content/navigation.ts`, `footer.ts`) ; la livrer rend ces liens
  fonctionnels.
- **Contenu textuel des phrases phares et visuels** : les copies et visuels de référence de la
  maquette servent de valeurs par défaut et de source pour le pré-remplissage initial du contenu
  (copie partagée entre seed et repli front rangée une seule fois, conformément à la convention
  projet).
- **Langue** : contenu en français uniquement (pas d'internationalisation).
- **Breakpoints** : mobile-first, base = mobile (390), `md` = tablette (768), `lg` = desktop (≥1024,
  référence 1920), conformément à la convention du design system.

## Dépendances

- **Shell de site déjà livré** : navbar sticky responsive, bloc CTA + pied de page global (avec
  diaporama, bouton plaquette PDF, bouton flottant de retour en haut) sont construits et montés dans
  le layout `(site)` ; la page s'y insère.
- **Pages home + « Nous découvrir » livrées** : « Expertises » est la destination de l'appel à
  l'action « découvrir nos expertises » de « Nous découvrir » et de l'entrée « expertises » de la
  navigation ; la livraison de cette page rend ces liens fonctionnels.
- **Design system** : les composants présentationnels nécessaires (hero de page, phrase phare, encart
  titre, carte de niveau pleine largeur avec visuel assombri + intitulé + CTA, grand visuel avec
  incrustation, bouton, typographie de marque) existent dans le design system et sont consommés tels
  quels (ou étendus de façon délibérée si un composant manque).
- **Cinématiques d'animation** : les primitives de motion (reveals au scroll, parallaxe, révélation
  des titres par ligne) sont définies et réutilisées.
- **Outil de gestion de contenu + revalidation** : le mécanisme de publication/revalidation existant
  est réutilisé pour rendre le contenu éditable de la page.
- **Cache Figma local** : la maquette (« Expertises », 3 formats) est disponible dans le cache local
  et fait foi pour la fidélité visuelle.

## Hors périmètre

- **3 sous-pages d'expertise** (agencement / mobiliers / présentoirs sur mesure) : relèvent de
  features distinctes ; cette page se contente de pointer vers leurs routes (voir *Hypothèses*).
- **Navbar et pied de page** : déjà construits et intégrés ; non re-spécifiés ici (sauf intégration /
  vérification de la tonalité de navigation au-dessus du hero).
- **Formulaire de contact** et routage des e-mails : portés par la page Contact / le pied de page
  existant.
- **Plaquette PDF** : le bouton de téléchargement de la plaquette est déjà porté par le pied de page
  global ; non re-spécifié ici.
- **Suppression du bac à sable `(lab)`** : nettoyage post-livraison, hors de cette feature.
