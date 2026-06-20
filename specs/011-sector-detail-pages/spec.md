# Spécification : Pages de détail des secteurs (« univers / … »)

**Branche**: `011-sector-detail-pages`
**Créée le**: 2026-06-19
**Statut**: Draft
**Contexte**: La page « Univers » (`/univers`, feature 009) présente les **quatre secteurs** adressés par
Estuaire — **Retail**, **Bureau**, **Résidentiel**, **Scénographie** — chacun avec un bouton
**« en savoir plus »** qui pointe déjà vers une route de détail (`/univers/retail`, `/univers/bureau`,
`/univers/residentiel`, `/univers/scenographie`). **Ces pages de détail n'existent pas encore** : les
boutons mènent aujourd'hui à un 404 temporaire (assumé par la feature 009). Cette feature consiste à
**construire les quatre pages de détail de secteur**, destinations de ces boutons. Chaque page approfondit
**un** secteur : elle confirme au visiteur qu'il est au bon endroit (fil d'ariane « univers / &lt;Secteur&gt; »,
visuel fort), démontre qu'Estuaire **comprend les enjeux et les contraintes terrain propres à ce secteur**,
défend son **positionnement** et **rassure par des citations / témoignages**, avant d'inviter à la prise de
contact via le pied de page. Les quatre pages partagent un **template identique** ; seuls le contenu et les
visuels changent. Le socle est posé (design system, navbar sticky responsive, pied de page global, bouton
flottant de retour en haut, cinématiques d'animation) et monté dans le shell `(site)`. Cette feature
consiste à **construire ce gabarit** à partir des composants du design system (en étendant le design system
là où un composant manque), à **brancher son contenu sur le CMS** (par secteur), à appliquer les
**cinématiques d'animation** et à rendre chaque page **fidèle à la maquette** et **responsive**. Source de
vérité visuelle : maquettes Figma desktop `secteurs/retail` `51:3520`, `secteurs/bureau` `51:3661`,
`secteurs/residentiel` `51:3797`, `secteurs/scenographie` `51:3929` (desktop, seul format fourni dans le
cache ; voir *Hypothèses*).
**Input utilisateur** : « pages secteurs (/univers) retail, bureau, résidentiel, scénographie ».

Sections de la maquette (communes aux quatre pages, de haut en bas) : `HEADER + SLIDER` (hero : fil
d'ariane « univers / &lt;Secteur&gt; », titre du secteur, visuel fort, fond bi-ton blanc / sombre, sous la
navbar sticky), `INTRO` (deux encarts éditoriaux **« LES ENJEUX »** et **« LES CONTRAINTES TERRAIN »**, un
visuel et un texte d'introduction du secteur), `ARGUMENT` (un bloc de texte de positionnement fort —
« Nous agissons comme un point de convergence… » — décliné par secteur), `CITATIONS` (deux blocs de
citation / témoignage), `BIG FOOTER` (pied de page global avec son appel à l'action et le bouton de retour
en haut). Le header (navbar) et le footer sont **déjà construits** ; ils ne sont pas re-spécifiés ici (voir
*Hors périmètre*).

## Scénarios utilisateur & tests *(obligatoire)*

### Scénario 1 - Approfondir un secteur précis (Priorité : P1)

Un visiteur a repéré sur « Univers » le secteur qui le concerne (par ex. un dirigeant d'enseigne pour
**Retail**, une entreprise aménageant ses espaces pour **Bureau**, un particulier ou promoteur pour
**Résidentiel**, une agence d'événementiel pour **Scénographie**) et clique sur **« en savoir plus »**. Il
arrive sur la page dédiée à ce secteur. Le **hero** (fil d'ariane « univers / &lt;Secteur&gt; », titre du
secteur, visuel fort) lui confirme **immédiatement** qu'il est au bon endroit. En faisant défiler, l'**intro**
— **« les enjeux »**, **« les contraintes terrain »**, un visuel et un texte — lui démontre qu'Estuaire
**comprend les problématiques spécifiques de son secteur**. Il poursuit avec l'**argument de positionnement**
puis les **citations / témoignages**, et termine sur l'**appel à l'action** du pied de page.

**Pourquoi cette priorité** : c'est le cœur de la valeur de la feature — transformer l'intérêt né sur
« Univers » en **conviction qu'Estuaire est le bon partenaire pour ce secteur précis**. Une seule page de
secteur livrée de bout en bout (hero → intro → argument → citations → CTA), atteignable depuis « Univers »,
constitue déjà un MVP exploitable et déployable : elle prouve le gabarit que les trois autres réutilisent.

**Test indépendant** : ouvrir la page d'un secteur (par ex. `/univers/retail`) depuis le bouton « en savoir
plus » de « Univers » et vérifier qu'elle déroule, dans l'ordre, hero (fil d'ariane + titre + visuel), intro
(enjeux + contraintes terrain + visuel + texte), argument et citations, jusqu'au pied de page — chaque
section lisible et propre au secteur — sans dépendre des trois autres pages.

**Scénarios d'acceptation** :

1. **Étant donné** un visiteur sur « Univers » qui clique sur « en savoir plus » d'un secteur, **quand** la
   page de détail s'ouvre, **alors** elle s'affiche sur la route attendue (`/univers/&lt;secteur&gt;`) sans 404,
   avec un **hero** identifiant le secteur : fil d'ariane « univers / &lt;Secteur&gt; », titre du secteur et visuel
   fort, sous une navbar restant lisible sur le fond bi-ton.
2. **Étant donné** le visiteur qui fait défiler l'intro, **quand** les blocs **« les enjeux »** et **« les
   contraintes terrain »**, le visuel et le texte s'affichent, **alors** il comprend les **problématiques et
   contraintes propres à ce secteur** et la manière dont Estuaire les adresse.
3. **Étant donné** le visiteur qui poursuit, **quand** la section **argument** s'affiche, **alors** il lit un
   **texte de positionnement fort**, décliné pour ce secteur, qui explique l'approche d'Estuaire.
4. **Étant donné** la section **citations**, **quand** elle s'affiche, **alors** le visiteur voit **deux
   citations / témoignages** qui renforcent la confiance.
5. **Étant donné** la fin de la page, **quand** le visiteur atteint le pied de page, **alors** il dispose
   d'un **appel à l'action** (prise de contact) et du bouton de **retour en haut**.
6. **Étant donné** le fil d'ariane du hero, **quand** le visiteur active le segment « univers », **alors** il
   revient à la page « Univers » (`/univers`).
7. **Étant donné** un visiteur ayant activé « réduire les animations », **quand** il ouvre la page, **alors**
   le contenu reste complet et lisible, sans mouvement automatique gênant.
8. **Étant donné** la page, **quand** elle s'affiche sur mobile, tablette ou desktop, **alors** la mise en
   page s'adapte au format sans perte de contenu ni de lisibilité.

---

### Scénario 2 - Les quatre secteurs couverts, aucun lien mort (Priorité : P2)

Le visiteur peut accéder à **chacun des quatre secteurs** (Retail, Bureau, Résidentiel, Scénographie) :
chaque bouton « en savoir plus » de « Univers » résout vers **sa** page de détail, et chaque page porte un
**contenu propre au secteur** (titre, enjeux, contraintes terrain, texte d'intro, argument, citations,
visuels). Plus aucun bouton « en savoir plus » ne mène à un 404.

**Pourquoi cette priorité** : « Univers » promet quatre univers d'intervention ; tant qu'il manque une page,
la promesse est trouée et un lien est mort. Couvrir l'**ensemble des quatre secteurs** rend le parcours
complet et cohérent. C'est une mise à l'échelle du gabarit prouvé en P1, et elle vient juste après lui.

**Test indépendant** : depuis « Univers », activer successivement les quatre boutons « en savoir plus » et
vérifier que chacun ouvre une page de détail distincte, sans 404, avec le contenu et les visuels du secteur
correspondant.

**Scénarios d'acceptation** :

1. **Étant donné** les quatre boutons « en savoir plus » de « Univers », **quand** le visiteur les active
   l'un après l'autre, **alors** chacun ouvre la page de détail de **son** secteur
   (`/univers/retail`, `/univers/bureau`, `/univers/residentiel`, `/univers/scenographie`) — **aucun 404**.
2. **Étant donné** deux secteurs différents, **quand** le visiteur ouvre leurs pages, **alors** le **contenu**
   (titre, enjeux, contraintes terrain, texte, argument, citations, visuels) est **propre à chacun**, même si
   la **mise en page** (le gabarit) est identique.
3. **Étant donné** une URL de secteur inexistante (par ex. `/univers/inconnu`), **quand** le visiteur y
   accède, **alors** il obtient une page « introuvable » claire (pas une page vide ni cassée).

---

### Scénario 3 - Maîtrise éditoriale du contenu (Priorité : P3)

Un membre de l'équipe Estuaire met à jour le contenu d'une page de secteur (titre du hero, visuels,
intitulés et textes des encarts « enjeux » et « contraintes terrain », texte d'intro, texte d'argument,
citations et leurs attributions, métadonnées SEO) depuis l'outil de gestion de contenu, **par secteur**,
sans intervention d'un développeur.

**Pourquoi cette priorité** : l'autonomie éditoriale est un objectif de fond du projet (contenu et visuels
pilotés par le CMS), mais chaque page reste exploitable avant même d'être éditée grâce aux **valeurs par
défaut issues de la maquette**. C'est donc une couche de valeur qui vient après le rendu lui-même.

**Test indépendant** : modifier un texte, une citation ou un visuel d'un secteur dans l'outil de contenu et
vérifier que le changement apparaît sur la page publiée de **ce** secteur (et seulement celle-là), sans
redéploiement.

**Scénarios d'acceptation** :

1. **Étant donné** un éditeur dans l'outil de contenu, **quand** il modifie un texte, une citation ou un
   visuel d'un secteur, **alors** la page publiée de ce secteur reflète le changement après revalidation, et
   les autres secteurs restent inchangés.
2. **Étant donné** une page de secteur dont le contenu n'a pas encore été saisi, **quand** elle s'affiche,
   **alors** elle présente les textes et visuels par défaut issus de la maquette (aucune zone vide ni cassée).
3. **Étant donné** les métadonnées SEO d'un secteur, **quand** l'éditeur modifie le titre, la
   meta-description ou l'image de partage, **alors** la page publiée de ce secteur reflète ces valeurs.

---

### Cas limites

- **URL de secteur inexistante** : `/univers/&lt;slug-inconnu&gt;` renvoie une page « introuvable » claire (404),
  jamais une page vide ou cassée.
- **Secteur sans contenu saisi** : la page affiche les textes et visuels par défaut de la maquette (jamais
  une section vide), le traitement de contraste / voile restant appliqué sur les visuels.
- **Lisibilité par-dessus le visuel** : le titre du secteur, le fil d'ariane et tout texte posé sur une image
  (notamment dans le hero bi-ton) restent lisibles (voile / contraste préservé).
- **Texte plus long que prévu** : titres, encarts « enjeux » / « contraintes terrain », texte d'argument et
  citations restent lisibles et ne débordent pas leur conteneur quel que soit le format.
- **Citation sans attribution** : si l'auteur / le contexte d'une citation n'est pas saisi, la citation reste
  affichée proprement sans bloc d'attribution vide.
- **Visuel manquant ou lent** : un placeholder de chargement (dominante de couleur) évite tout saut de mise
  en page le temps que l'image arrive.
- **Préférence « réduire les animations »** : toutes les animations (reveals au scroll, parallaxe) sont
  neutralisées au profit d'un rendu statique complet.
- **Navigation au clavier / lecteur d'écran** : fil d'ariane, encarts, citations, appel à l'action et bouton
  de retour en haut sont atteignables et compréhensibles sans souris.

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : Le système DOIT servir **quatre pages de détail de secteur**, une par secteur, sur les routes
  **`/univers/retail`**, **`/univers/bureau`**, **`/univers/residentiel`** et **`/univers/scenographie`** —
  exactement les destinations déjà câblées par les boutons « en savoir plus » de la page « Univers »
  (feature 009).
- **FR-002** : Chaque bouton **« en savoir plus »** de « Univers » DOIT résoudre, **sans 404**, vers la page
  de détail de son secteur ; après livraison, plus aucun de ces boutons ne mène à une page absente.
- **FR-003** : Chaque page de secteur DOIT présenter, dans l'ordre de défilement, les sections suivantes :
  (1) **hero** (fil d'ariane « univers / &lt;Secteur&gt; », titre du secteur, visuel fort, fond bi-ton), (2)
  **intro** (encart « les enjeux », encart « les contraintes terrain », visuel, texte d'introduction du
  secteur), (3) **argument** (texte de positionnement décliné par secteur), (4) **citations** (deux blocs de
  citation / témoignage), suivies du **pied de page global existant** (avec son appel à l'action).
- **FR-004** : Le **hero** DOIT afficher le **titre du secteur**, un **fil d'ariane** « univers / &lt;Secteur&gt; »
  dont le segment « univers » **ramène à `/univers`**, et un **visuel fort**, conformément à la maquette
  (fond bi-ton blanc / sombre). Sous « réduire les animations », il reste statique.
- **FR-005** : La section **intro** DOIT présenter deux **encarts éditoriaux distincts** — **« les enjeux »**
  et **« les contraintes terrain »** —, un **visuel** et un **texte d'introduction** propres au secteur.
- **FR-006** : La section **argument** DOIT présenter un **bloc de texte de positionnement fort**, décliné
  pour chaque secteur.
- **FR-007** : La section **citations** DOIT présenter **deux citations / témoignages** ; chaque citation
  comporte un **texte** et une **attribution optionnelle** (auteur / rôle / contexte).
- **FR-008** : Les **quatre pages** DOIVENT partager un **gabarit (template) commun** : la mise en page est
  identique d'un secteur à l'autre ; seuls le **contenu** et les **visuels** changent par secteur.
- **FR-009** : Une URL de secteur **inexistante** (slug non prévu) DOIT renvoyer une **page « introuvable »
  (404)** claire, et non une page vide ou cassée.
- **FR-010** : Le **contenu éditorial de chaque secteur** (titre du hero, visuels, intitulés et textes des
  encarts « enjeux » et « contraintes terrain », texte d'intro, texte d'argument, citations et attributions,
  **et les métadonnées SEO** — titre, meta-description, image de partage) DOIT être **éditable via le CMS**,
  **par secteur**, avec des **valeurs par défaut issues de la maquette** servant de repli quand le contenu
  n'est pas saisi.
- **FR-011** : Chaque page DOIT s'afficher correctement et conserver sa lisibilité sur **mobile, tablette et
  desktop**. La maquette ne fournit que le **format desktop** ; les formats tablette et mobile sont
  **adaptés responsivement** selon les conventions de breakpoints du design system (voir *Hypothèses*).
- **FR-012** : Le rendu DOIT être **fidèle aux maquettes** desktop des quatre secteurs sur les dimensions
  intrinsèques (typographie, espacements, proportions, composition, traitements de titres) ; les dimensions
  dynamiques (ex. hauteur du hero) peuvent s'adapter à l'écran.
- **FR-013** : Chaque page DOIT s'intégrer dans le **shell de site existant** (navbar sticky, pied de page
  global, bouton flottant de retour en haut) sans les redéfinir ; elle DOIT déclarer la **tonalité de
  navigation** appropriée pour que la navbar reste lisible au-dessus du hero bi-ton.
- **FR-014** : Chaque section DOIT être accompagnée d'**animations cinématiques discrètes** au scroll (le
  texte reste l'ancre statique, les visuels et transitions portent le mouvement, les titres se révèlent par
  ligne), avec une seule motion focale à la fois.
- **FR-015** : Toutes les animations DOIVENT honorer la préférence **« réduire les animations »** : un
  visiteur l'ayant activée obtient un rendu statique complet et lisible.
- **FR-016** : Chaque page DOIT être **accessible** : navigation et activation au clavier de tous les
  éléments (fil d'ariane, encarts, citations, appel à l'action, retour en haut), contrastes suffisants
  (notamment des textes posés sur les visuels), alternatives textuelles des visuels, structure de titres
  sémantique.
- **FR-017** : Chaque page DOIT respecter les attentes **SEO** : un **titre principal (H1) unique** (le titre
  du secteur), une hiérarchie de titres cohérente entre les sections, un **titre de page, une
  meta-description et une image de partage social propres au secteur**, éditables via le CMS avec des valeurs
  par défaut issues de la maquette.
- **FR-018** : Le bouton flottant de **retour en haut** DOIT apparaître au fil du scroll et ramener en haut
  de page de façon fluide.
- **FR-019** : Le contenu de chaque page DOIT rester accessible et exploitable même si les visuels ou les
  animations ne se chargent pas (rendu de base d'abord, enrichissement ensuite).

### Entités clés *(incluses car la feature implique du contenu)*

- **Page de détail de secteur (contenu éditable, un par secteur)** : représente l'ensemble du contenu d'une
  page de secteur — le hero (titre + visuel + fil d'ariane), l'intro (enjeux, contraintes terrain, texte,
  visuel), l'argument, les deux citations, ainsi que les **métadonnées SEO** (titre, meta-description, image
  de partage social). Quatre instances : Retail, Bureau, Résidentiel, Scénographie.
- **Secteur** : identifié par un **slug** (`retail`, `bureau`, `residentiel`, `scenographie`) et un **titre /
  libellé** affiché.
- **Encart « enjeux »** et **encart « contraintes terrain »** : chacun un **intitulé** et un **texte**
  éditorial décrivant respectivement les enjeux et les contraintes terrain du secteur.
- **Bloc intro** : un texte d'introduction du secteur et un visuel d'appui.
- **Argument** : un bloc de texte de positionnement, décliné par secteur.
- **Citation / témoignage** : un **texte de citation** et une **attribution optionnelle** (auteur, rôle,
  contexte). Deux par page.
- **Métadonnées SEO** : titre de page, meta-description, image de partage social — par secteur.

  *La modélisation (documents « secteur » autonomes vs. un gabarit paramétré par secteur, et la réutilisation
  éventuelle des secteurs embarqués de la page « Univers ») est une décision de planification — voir
  Hypothèses.*

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **SC-001** : Les **quatre** boutons « en savoir plus » de « Univers » résolvent chacun vers une **page de
  détail dédiée**, sans 404 — **0 lien mort** restant après livraison.
- **SC-002** : Depuis « Univers », un visiteur atteint la page de détail d'un secteur en **un seul clic**, et
  la prise de contact (via l'appel à l'action du pied de page / la navigation) reste accessible depuis chaque
  page de secteur.
- **SC-003** : Le rendu des **quatre pages** correspond aux maquettes **desktop** respectives, validé par
  comparaison visuelle (diff) section par section ; les formats tablette et mobile sont vérifiés sur la
  cohérence et la lisibilité (pas de maquette de référence à différ — voir *Hypothèses*).
- **SC-004** : Au moins **80 %** des visiteurs testés déclarent, après avoir parcouru une page de secteur,
  **comprendre comment Estuaire aborde ce secteur** (enjeux, contraintes, positionnement).
- **SC-005** : Avec « réduire les animations » activé, la totalité du contenu de chaque page reste visible et
  lisible, et l'intégralité de la page est parcourable au clavier (**0 piège clavier**).
- **SC-006** : Un éditeur modifie un texte, une citation, un visuel ou une métadonnée SEO d'un secteur et
  constate le changement sur la page publiée de **ce** secteur **sans aucune intervention de développeur ni
  redéploiement** ; les autres secteurs restent inchangés.
- **SC-007** : Avant toute saisie de contenu, chaque page de secteur s'affiche complète, sans zone vide ni
  élément cassé, grâce aux valeurs par défaut de la maquette.
- **SC-008** : Une URL de secteur inexistante affiche une page « introuvable » claire (pas de page vide ni
  cassée, pas d'erreur serveur).
- **SC-009** : Le premier écran de chaque page devient lisible et le contenu principal apparaît en moins de
  **2,5 s** sur une connexion mobile représentative, sans décalage de mise en page notable pendant le
  chargement.

## Hypothèses

- **Routes / slugs** *(réglé)* : les pages sont servies sur **`/univers/retail`**, **`/univers/bureau`**,
  **`/univers/residentiel`**, **`/univers/scenographie`** — slugs **sans accent**, exactement les
  destinations déjà câblées par les boutons « en savoir plus » de la page « Univers » (feature 009,
  `src/content/sectorsPage.ts`). Livrer ces pages rend ces boutons fonctionnels.
- **Template commun** : les quatre pages partagent un **gabarit identique** (mêmes sections, même mise en
  page) ; seuls le contenu et les visuels varient. Un seul gabarit paramétré par secteur est donc visé.
- **Modélisation du contenu** : chaque secteur a son **propre contenu éditable**. Le choix entre des
  **documents « secteur » autonomes** (un document par secteur), un document unique multi-secteurs, ou la
  réutilisation des entrées « secteur » embarquées dans la page « Univers » (feature 009 : présentationnelles,
  le schéma `sectorsPage` notant explicitement que les pages de détail relèvent d'un modèle distinct) est une
  **décision de planification** (`plan.md`), pas de spécification ; elle n'affecte ni les scénarios ni les
  exigences ci-dessus.
- **Formats responsive** : les maquettes ne fournissent que le **format desktop** (`51:3520`, `51:3661`,
  `51:3797`, `51:3929`). Les formats tablette et mobile sont **adaptés responsivement** (mobile-first,
  base = mobile, `md` = tablette, `lg` = desktop, conformément à la convention du design system) ; la
  vérification pixel-perfect par diff ne s'applique qu'au desktop, les autres formats étant vérifiés sur la
  cohérence et la lisibilité.
- **Encarts « enjeux » / « contraintes terrain »** : deux **encarts éditoriaux** par secteur (intitulé +
  texte), pré-remplis avec les valeurs de la maquette.
- **Citations** : citations / témoignages **éditoriaux** (texte + attribution optionnelle : auteur / rôle /
  contexte) — des **valeurs éditoriales saisies**, pas un système d'avis dynamique ni des notes calculées.
  Deux par page, conformément à la maquette.
- **H1 / SEO** : le H1 de chaque page est le **titre du secteur** (dans le hero) ; titre de page,
  meta-description et image de partage sont **éditables via le CMS** par secteur, pré-remplis avec des valeurs
  par défaut issues de la maquette.
- **Contenu textuel et visuels** : les copies et visuels de référence des maquettes servent de valeurs par
  défaut et de source pour le pré-remplissage initial du contenu (copie partagée entre seed et repli front
  rangée une seule fois, conformément à la convention projet).
- **Langue** : contenu en français uniquement (pas d'internationalisation).

## Dépendances

- **Page « Univers » livrée (feature 009)** : fournit les boutons « en savoir plus » dont ces pages sont les
  destinations (routes `/univers/&lt;secteur&gt;` déjà câblées). Sans elle, les pages de détail n'auraient pas de
  point d'entrée naturel.
- **Shell de site déjà livré** : navbar sticky responsive, pied de page global (avec diaporama, bouton
  plaquette PDF, appel à l'action, bouton flottant de retour en haut) sont construits et montés dans le
  layout `(site)` ; chaque page de secteur s'y insère.
- **Design system** : les composants présentationnels nécessaires sont consommés tels quels, ou **étendus de
  façon délibérée** si un composant manque (hero bi-ton avec fil d'ariane, encarts « enjeux » / « contraintes
  terrain », bloc d'intro avec visuel, bloc d'argument, blocs de citation, typographie de marque).
- **Cinématiques d'animation** : les primitives de motion (reveals au scroll, parallaxe, révélation des
  titres par ligne) sont définies et réutilisées.
- **Outil de gestion de contenu + revalidation** : le mécanisme de publication / revalidation existant est
  réutilisé pour rendre le contenu de chaque secteur éditable.
- **Cache Figma local** : les maquettes des quatre secteurs (format desktop : `secteurs/retail` `51:3520`,
  `secteurs/bureau` `51:3661`, `secteurs/residentiel` `51:3797`, `secteurs/scenographie` `51:3929`) et leurs
  visuels sont disponibles dans le cache local et font foi pour la fidélité visuelle.

## Hors périmètre

- **Navbar et pied de page** : déjà construits et intégrés ; non re-spécifiés ici (sauf intégration /
  vérification de la tonalité de navigation au-dessus du hero bi-ton).
- **Page « Univers » (index des secteurs)** : feature 009, déjà livrée ; non re-spécifiée ici. Ces pages se
  contentent d'en être les destinations (ses boutons « en savoir plus » pointent vers elles).
- **Liste de projets / réalisations par secteur** : les maquettes de ces pages de détail n'en présentent pas ;
  un éventuel listing de projets filtré par secteur relève d'une feature distincte.
- **Navigation inter-secteurs** (passer directement d'une page de secteur à une autre, secteur précédent /
  suivant) : non prévue par les maquettes ; hors périmètre.
- **Formulaire de contact** et routage des e-mails : portés par la page Contact / le pied de page existant.
- **Plaquette PDF** : le bouton de téléchargement de la plaquette est déjà porté par le pied de page global ;
  non re-spécifié ici.
- **Maquettes tablette / mobile** des pages de secteur : non fournies dans le cache ; le rendu responsive est
  adapté, pas diffé pixel à pixel (voir *Hypothèses*).
- **Suppression du bac à sable `(lab)`** : nettoyage post-livraison, hors de cette feature.
