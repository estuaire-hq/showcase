# Spécification : Page « Univers » (secteurs)

**Branche**: `009-sectors-page`
**Créée le**: 2026-06-17
**Statut**: Draft
**Contexte**: La page « Univers » est la page **secteurs** du site vitrine Estuaire (marque de Mosaique
Production) : celle qui montre **dans quels univers Estuaire intervient** et qui revendique un
**périmètre multisectoriel**. Elle présente les quatre secteurs adressés — **Retail**, **Bureau**,
**Résidentiel**, **Scénographie** — puis quelques **chiffres clés** qui rassurent sur l'expérience et la
capacité de l'atelier. C'est la destination de l'entrée de navigation **« univers »** (`/univers`,
câblée dans `src/content/navigation.ts`) et un pivot du parcours : depuis chaque secteur, un bouton
« en savoir plus » mène vers la page de détail du secteur (feature distincte). Le socle est posé et
plusieurs pages sont livrées : design system construit et consommé, navbar sticky responsive, pied de
page global, bouton flottant de retour en haut et cinématiques d'animation existent déjà et sont montés
dans le shell `(site)`. Cette feature consiste à **construire la page « Univers »** à partir des
composants du design system, à **brancher son contenu sur le CMS**, à appliquer les **cinématiques
d'animation** et à la rendre **fidèle à la maquette** et **responsive**. Source de vérité visuelle :
maquette Figma *04A/Webdesign-page-secteurs-ESTUAIRE-V1* — `51:3386` (desktop, seul format fourni dans
le cache ; voir *Hypothèses*).
**Input utilisateur** : « nouvelle feature : page secteurs ».

Sections de la maquette (de haut en bas) : `02/ SLIDER` (hero + encart titre), `03/ INTRO` (phrase de
positionnement multisectoriel + texte + visuel), `04/ SECTEURS` (les quatre secteurs en bandes
plein-largeur : Retail, Bureau, Résidentiel, Scénographie, chacun avec titre, phrase et bouton « en
savoir plus »), `05/ INFOS CLÉS` (quatre chiffres / promesses : 15 ans d'expérience, +150 projets par
an, partenaires locaux, atelier multimatériaux), `BIG FOOTER`. Le header (navbar) et le footer sont
**déjà construits** ; ils ne sont pas re-spécifiés ici (voir *Hors périmètre*).

## Scénarios utilisateur & tests *(obligatoire)*

### Scénario 1 - Comprendre l'étendue multisectorielle d'Estuaire (Priorité : P1)

Un visiteur (architecte, designer, enseigne de retail, entreprise aménageant ses bureaux, particulier,
agence d'événementiel/scénographie, donneur d'ordre) arrive sur « Univers » — depuis l'entrée de
navigation « univers » ou un lien interne. Le **hero** (visuel fort + encart titre), l'**intro de
positionnement multisectoriel** puis la liste des **quatre secteurs** (Retail, Bureau, Résidentiel,
Scénographie) lui font comprendre, en quelques écrans, qu'Estuaire **intervient dans des univers variés**
et sait adapter ses méthodes à chacun.

**Pourquoi cette priorité** : c'est le cœur de la valeur de cette page — faire comprendre l'amplitude
d'intervention d'Estuaire et permettre au visiteur de **se reconnaître dans un secteur**. Une page qui
ne ferait que cela (hero + intro + les quatre secteurs) est déjà un MVP exploitable et déployable.

**Test indépendant** : afficher la page et vérifier que le hero, l'intro et les quatre bandes secteurs
communiquent le périmètre multisectoriel d'Estuaire, que chaque secteur est identifiable (titre +
phrase) et que le contenu est lisible — sans dépendre des sections suivantes.

**Scénarios d'acceptation** :

1. **Étant donné** un visiteur qui ouvre « Univers », **quand** le premier écran s'affiche, **alors** il
   voit un visuel hero et un encart titre identifiant le sujet de la page (les univers/secteurs
   adressés par Estuaire), au-dessus d'une navbar restant lisible sur le visuel.
2. **Étant donné** le visiteur qui fait défiler l'intro, **quand** la phrase de positionnement et le
   texte s'affichent, **alors** il comprend le périmètre d'intervention multisectoriel d'Estuaire (du
   retail aux espaces de travail, de la scénographie au résidentiel) et l'agilité revendiquée.
3. **Étant donné** la section secteurs, **quand** elle s'affiche, **alors** le visiteur parcourt les
   **quatre secteurs** (Retail, Bureau, Résidentiel, Scénographie), chacun présenté par un visuel
   plein-largeur, un titre, une phrase de promesse et un bouton « en savoir plus ».
4. **Étant donné** un visiteur ayant activé « réduire les animations », **quand** il ouvre la page,
   **alors** le contenu reste complet et lisible, sans mouvement automatique gênant.
5. **Étant donné** la page, **quand** elle s'affiche sur mobile, tablette ou desktop, **alors** la mise
   en page s'adapte au format sans perte de contenu ni de lisibilité.

---

### Scénario 2 - Se rassurer et approfondir un secteur (Priorité : P2)

En poursuivant le défilement, le visiteur découvre les **chiffres clés** (« 15 ans d'expérience »,
« +150 projets par an », « partenaires locaux », « atelier multimatériaux »), chacun accompagné d'une
phrase d'appui, qui **prouvent l'expérience et la capacité** d'Estuaire. Ayant repéré le secteur qui le
concerne, il clique sur **« en savoir plus »** pour approfondir, et est dirigé vers la page de détail de
ce secteur.

**Pourquoi cette priorité** : après la compréhension du périmètre, l'enjeu est de **convaincre par la
preuve** (expérience, volume, proximité, maîtrise technique) et de **router le visiteur vers le secteur
qui le concerne**. C'est ce qui transforme l'intérêt en confiance puis en parcours qualifié.

**Test indépendant** : faire défiler jusqu'au bas et vérifier que la section « infos clés » présente ses
quatre chiffres/promesses et que chaque bouton « en savoir plus » mène à la destination attendue (page
de détail du secteur).

**Scénarios d'acceptation** :

1. **Étant donné** la section « infos clés », **quand** elle s'affiche, **alors** le visiteur voit les
   **quatre chiffres/promesses**, chacun avec son intitulé fort et sa phrase d'appui.
2. **Étant donné** un secteur, **quand** le visiteur clique sur son bouton « en savoir plus », **alors**
   il est dirigé vers la page de détail de ce secteur (route prévue ; 404 temporaire accepté tant que la
   page de détail n'est pas livrée).
3. **Étant donné** chaque bande secteur, **quand** elle s'affiche, **alors** le titre, la phrase et le
   bouton restent **lisibles par-dessus le visuel** (traitement de contraste / voile préservé).
4. **Étant donné** n'importe quelle section, **quand** le visiteur la fait apparaître au scroll,
   **alors** une animation discrète accompagne son entrée (les visuels portent le mouvement, le texte
   reste l'ancre), sans jamais bloquer la lecture.

---

### Scénario 3 - Maîtrise éditoriale du contenu (Priorité : P3)

Un membre de l'équipe Estuaire met à jour le contenu de « Univers » (encart titre du hero, textes de
l'intro, libellés / phrases / visuels / liens des secteurs, intitulés et phrases des chiffres clés,
métadonnées SEO) depuis l'outil de gestion de contenu, sans intervention d'un développeur.

**Pourquoi cette priorité** : l'autonomie éditoriale est un objectif de fond du projet (contenu et
visuels pilotés par le CMS), mais la page reste exploitable avant même d'être éditée grâce aux valeurs
par défaut issues de la maquette. C'est donc une couche de valeur qui vient après le rendu lui-même.

**Test indépendant** : modifier un texte, un visuel ou l'ordre d'un secteur dans l'outil de contenu et
vérifier que le changement apparaît sur la page publiée, sans redéploiement.

**Scénarios d'acceptation** :

1. **Étant donné** un éditeur dans l'outil de contenu, **quand** il modifie un texte ou un visuel d'une
   section de la page, **alors** la page publiée reflète ce changement après revalidation.
2. **Étant donné** une page dont le contenu n'a pas encore été saisi, **quand** elle s'affiche, **alors**
   elle présente les textes et visuels par défaut issus de la maquette (aucune zone vide ni cassée).
3. **Étant donné** la liste des secteurs, **quand** l'éditeur modifie le texte, le visuel ou l'ordre d'un
   secteur, **alors** la section reflète le changement en conservant la mise en page et la numérotation
   d'affichage.

---

### Cas limites

- **Secteur sans visuel saisi** : la bande affiche le visuel par défaut de la maquette (jamais une bande
  vide), le voile de contraste restant appliqué.
- **Lisibilité par-dessus le visuel** : titre, phrase et bouton de chaque secteur restent lisibles quel
  que soit le visuel (voile sombre / traitement de contraste préservé), de même que tout texte posé sur
  une image.
- **Texte plus long que prévu** : titres, phrases de promesse et phrases d'appui des chiffres restent
  lisibles et ne débordent pas leur conteneur quel que soit le format.
- **Visuel manquant ou lent** : un placeholder de chargement (dominante de couleur) évite tout saut de
  mise en page le temps que l'image arrive.
- **Nombre de secteurs différent de quatre** : la section reste correcte si un secteur est ajouté ou
  retiré dans le CMS (la maquette en décrit quatre ; la mise en page ne doit pas casser pour 3 ou 5).
- **Destination « en savoir plus » non encore publiée** : tant que la page de détail du secteur n'existe
  pas, le bouton pointe vers la route prévue (404 temporaire accepté) ; la livraison des pages de détail
  relève de features distinctes (voir *Hors périmètre*).
- **Préférence « réduire les animations »** : toutes les animations (reveals au scroll, parallaxe) sont
  neutralisées au profit d'un rendu statique complet.
- **Navigation au clavier / lecteur d'écran** : toutes les sections, secteurs, chiffres et boutons sont
  atteignables et compréhensibles sans souris.

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : La page « Univers » DOIT être servie sur la route **`/univers`** (déjà déclarée dans la
  navigation) et présenter, dans l'ordre de défilement, les sections suivantes : (1) hero / slider avec
  encart titre, (2) intro de positionnement multisectoriel (phrase de positionnement + texte + visuel),
  (3) liste des **secteurs** (quatre dans la maquette : Retail, Bureau, Résidentiel, Scénographie),
  (4) **infos clés** (quatre chiffres/promesses), suivies du pied de page global existant.
- **FR-002** : Le hero DOIT afficher un **visuel** et un **encart (cartouche) titre** contenant le
  sur-titre, le titre de la page (avec son trait de séparation), conformément à la maquette. Sous
  « réduire les animations », il reste statique.
- **FR-003** : Le bloc **intro** DOIT présenter une **phrase de positionnement** mise en avant (le
  périmètre d'intervention multisectoriel), un **texte d'introduction** et un **visuel d'appui**.
- **FR-004** : La section **secteurs** DOIT présenter une **liste ordonnée de secteurs** ; chaque secteur
  comporte un **visuel plein-largeur** (avec voile de contraste), un **titre**, une **phrase de promesse**
  et un **bouton « en savoir plus »** menant vers la page de détail du secteur. La maquette en décrit
  quatre (Retail, Bureau, Résidentiel, Scénographie).
- **FR-005** : Chaque bouton **« en savoir plus »** DOIT mener vers la page de détail de son secteur
  (route prévue ; 404 temporaire accepté tant que la page de détail n'est pas livrée — feature distincte).
- **FR-006** : La section **infos clés** DOIT présenter une **liste de chiffres/promesses** ; chaque
  élément comporte un **intitulé fort** (chiffre ou promesse) et une **phrase d'appui**. La maquette en
  décrit quatre (15 ans d'expérience, +150 projets par an, partenaires locaux, atelier multimatériaux).
- **FR-007** : Le contenu éditorial de la page (encart titre du hero, textes de l'intro, libellés /
  phrases / visuels / liens des secteurs et leur ordre, intitulés et phrases des chiffres clés, **et les
  métadonnées SEO de la page** — titre, meta-description, image de partage) DOIT être **éditable via le
  CMS**, avec des **valeurs par défaut issues de la maquette** servant de repli quand le contenu n'est
  pas saisi.
- **FR-008** : La page DOIT s'afficher correctement et conserver sa lisibilité sur **mobile, tablette et
  desktop**. La maquette ne fournit que le **format desktop** (`51:3386`) ; les formats tablette et
  mobile sont **adaptés responsivement** selon les conventions de breakpoints du design system (voir
  *Hypothèses*).
- **FR-009** : Le rendu DOIT être **fidèle à la maquette** desktop sur les dimensions intrinsèques
  (typographie, espacements, proportions, composition, traitements de titres) ; les dimensions dynamiques
  (ex. hauteur du hero) peuvent s'adapter à l'écran.
- **FR-010** : La page DOIT s'intégrer dans le **shell de site existant** (navbar sticky, pied de page
  global, bouton flottant de retour en haut) sans les redéfinir ; elle DOIT déclarer la **tonalité de
  navigation** appropriée pour que la navbar transparente reste lisible au-dessus du hero.
- **FR-011** : Chaque section DOIT être accompagnée d'**animations cinématiques discrètes** au scroll (le
  texte reste l'ancre statique, les visuels et transitions portent le mouvement, les titres se révèlent
  par ligne), avec une seule motion focale à la fois.
- **FR-012** : Toutes les animations DOIVENT honorer la préférence **« réduire les animations »** : un
  visiteur l'ayant activée obtient un rendu statique complet et lisible.
- **FR-013** : La page DOIT être **accessible** : navigation et activation au clavier de toutes les
  sections / secteurs / boutons, contrastes suffisants (notamment des textes posés sur les visuels),
  alternatives textuelles des visuels, structure de titres sémantique.
- **FR-014** : La page DOIT respecter les attentes **SEO** : un titre principal (H1) unique, une
  hiérarchie de titres cohérente entre les sections, un titre et une description de page et une image de
  partage social. Le **titre de page, la meta-description et l'image de partage sont éditables via le
  CMS**, avec des valeurs par défaut issues de la maquette.
- **FR-015** : Le bouton flottant de **retour en haut** DOIT apparaître au fil du scroll et ramener en
  haut de page de façon fluide.
- **FR-016** : Le contenu de la page DOIT rester accessible et exploitable même si les visuels ou les
  animations ne se chargent pas (rendu de base d'abord, enrichissement ensuite).

### Entités clés *(incluses car la feature implique du contenu)*

- **Page « Univers » (contenu de page éditable)** : représente l'ensemble du contenu de la page — le
  hero (visuel + encart titre), l'intro, la liste des secteurs, la liste des chiffres clés, ainsi que les
  **métadonnées SEO de la page** (titre, meta-description, image de partage social).
- **Hero** : un visuel et un encart titre (sur-titre + titre de page + trait de séparation).
- **Bloc intro** : une phrase de positionnement multisectoriel, un texte d'introduction et un visuel
  d'appui.
- **Secteur** : un libellé (Retail / Bureau / Résidentiel / Scénographie), une phrase de promesse, un
  visuel (avec voile de contraste), un lien « en savoir plus » vers la page de détail, et un rang
  d'affichage. Liste ordonnable (4 dans la maquette). *La modélisation (liste embarquée dans la page vs.
  documents autonomes réutilisés par les pages de détail) est une décision de planification — voir
  Hypothèses.*
- **Chiffre clé / promesse** : un intitulé fort (chiffre ou promesse) et une phrase d'appui. Liste
  ordonnable (4 dans la maquette).
- **Appel à l'action « en savoir plus »** : un libellé et un lien de destination (page de détail du
  secteur).

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **SC-001** : Au moins 80 % des visiteurs testés citent correctement les **quatre univers/secteurs**
  adressés par Estuaire (Retail, Bureau, Résidentiel, Scénographie) après avoir parcouru la page.
- **SC-002** : Depuis « Univers », chaque secteur permet d'atteindre sa page de détail en **un seul
  clic** (« en savoir plus »), et la prise de contact (via le pied de page / la navigation) reste
  accessible.
- **SC-003** : Le rendu de la page correspond à la maquette **desktop**, validé par comparaison visuelle
  (diff) section par section ; les formats tablette et mobile sont vérifiés sur la cohérence et la
  lisibilité (pas de maquette de référence à différ — voir *Hypothèses*).
- **SC-004** : Avec « réduire les animations » activé, la totalité du contenu reste visible et lisible, et
  l'intégralité de la page est parcourable au clavier (0 piège clavier).
- **SC-005** : Un éditeur modifie un texte, un visuel ou l'ordre d'un secteur et constate le changement
  sur la page publiée **sans aucune intervention de développeur ni redéploiement**.
- **SC-006** : Avant toute saisie de contenu, la page s'affiche complète, sans zone vide ni élément cassé,
  grâce aux valeurs par défaut de la maquette.
- **SC-007** : Le premier écran devient lisible et le contenu principal apparaît en moins de 2,5 s sur une
  connexion mobile représentative, sans décalage de mise en page notable pendant le chargement.

## Hypothèses

- **URL / slug** *(réglé)* : la page est servie sur **`/univers`** — slug déjà câblé dans la navbar
  (`src/content/navigation.ts`, entrée « univers ») et listé dans le pied de page. La livrer rend cette
  entrée fonctionnelle. Le nom interne / design de la page est « secteurs » (fichier Figma
  *page-secteurs*) mais le **label public et la route sont « univers »**.
- **Formats responsive** : la maquette ne fournit que le **format desktop** (`51:3386`). Les formats
  tablette et mobile sont **adaptés responsivement** (mobile-first, base = mobile, `md` = tablette,
  `lg` = desktop, conformément à la convention du design system) ; la vérification pixel-perfect par diff
  ne s'applique qu'au desktop, les autres formats étant vérifiés sur la cohérence et la lisibilité.
- **Secteurs — modélisation** : modélisés comme une **liste ordonnée de secteurs** éditable (libellé,
  phrase, visuel, lien, rang), pré-remplie avec les quatre de la maquette. Le choix entre une liste
  embarquée dans la page et des **documents « secteur » autonomes** (potentiellement réutilisés par les
  futures pages de détail) est une **décision de planification** (`plan.md`), pas de spécification ; il
  n'affecte ni les scénarios ni les exigences ci-dessus.
- **Pages de détail des secteurs** : « en savoir plus » → page de détail du secteur (Retail / Bureau /
  Résidentiel / Scénographie), livrée par des **features distinctes** (maquettes Figma `secteurs/retail`
  `51:3520`, `secteurs/bureau` `51:3661`, `secteurs/residentiel` `51:3797`, `secteurs/scenographie`
  `51:3929`). La page « Univers » se contente de pointer vers les routes prévues (404 temporaire accepté).
- **Chiffres clés** : modélisés comme une **liste éditable** (intitulé + phrase d'appui), pré-remplie avec
  les quatre de la maquette ; ce sont des **valeurs éditoriales** (pas des compteurs calculés
  automatiquement).
- **H1 / SEO** : le H1 est le titre principal de la page (encart titre du hero, conformément à la
  maquette) ; titre de page, meta-description et image de partage sont **éditables via le CMS**,
  pré-remplis avec des valeurs par défaut issues de la maquette.
- **Contenu textuel et visuels** : les copies et visuels de référence de la maquette servent de valeurs
  par défaut et de source pour le pré-remplissage initial du contenu (copie partagée entre seed et repli
  front rangée une seule fois, conformément à la convention projet).
- **Langue** : contenu en français uniquement (pas d'internationalisation).

## Dépendances

- **Shell de site déjà livré** : navbar sticky responsive, pied de page global (avec diaporama, bouton
  plaquette PDF, bouton flottant de retour en haut) sont construits et montés dans le layout `(site)` ;
  la page s'y insère.
- **Navigation déjà câblée** : l'entrée « univers » (`/univers`) existe dans `src/content/navigation.ts`
  et le pied de page ; livrer cette page rend ce lien fonctionnel.
- **Design system** : les composants présentationnels nécessaires (hero / encart titre, bloc d'intro,
  bande secteur avec visuel + voile + titre + phrase + bouton, bouton « en savoir plus » à flèche, grille
  de chiffres clés, typographie de marque) existent dans le design system et sont consommés tels quels (ou
  étendus de façon délibérée si un composant manque).
- **Cinématiques d'animation** : les primitives de motion (reveals au scroll, parallaxe, révélation des
  titres par ligne) sont définies et réutilisées.
- **Outil de gestion de contenu + revalidation** : le mécanisme de publication/revalidation existant est
  réutilisé pour rendre le contenu éditable de la page.
- **Cache Figma local** : la maquette « Univers » (format desktop, `51:3386`) est disponible dans le cache
  local et fait foi pour la fidélité visuelle.

## Hors périmètre

- **Navbar et pied de page** : déjà construits et intégrés ; non re-spécifiés ici (sauf intégration /
  vérification de la tonalité de navigation au-dessus du hero).
- **Pages de détail des secteurs** (destinations des boutons « en savoir plus » : Retail, Bureau,
  Résidentiel, Scénographie) : relèvent de **features distinctes** ; la page se contente de pointer vers
  les routes prévues.
- **Formulaire de contact** et routage des e-mails : portés par la page Contact / le pied de page existant.
- **Plaquette PDF** : le bouton de téléchargement de la plaquette est déjà porté par le pied de page
  global ; non re-spécifié ici.
- **Maquettes tablette / mobile de la page** : non fournies dans le cache ; le rendu responsive est
  adapté, pas diffé pixel à pixel (voir *Hypothèses*).
- **Suppression du bac à sable `(lab)`** : nettoyage post-livraison, hors de cette feature.
