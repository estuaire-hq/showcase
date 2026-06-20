# Spécification : Sous-pages « Expertise » (agencement / mobiliers / présentoirs sur mesure)

**Branche**: `010-expertise-subpages`
**Créée le**: 2026-06-19
**Statut**: Draft
**Contexte**: La page « Expertises » (`/expertises`, feature 008) présente l'offre d'Estuaire (marque
de Mosaique Production) structurée en **3 niveaux d'expertise** et porte, sur chaque carte de niveau,
un appel « en savoir plus » vers une **sous-page dédiée**. Cette feature **livre ces trois sous-pages
de détail** :
- **agencement sur mesure** → `/expertises/agencement-sur-mesure`
- **mobiliers sur mesure et en série** → `/expertises/mobiliers-sur-mesure`
- **présentoirs sur mesure** → `/expertises/presentoirs-sur-mesure`

Les livrer rend **fonctionnels** les liens « en savoir plus » de la page « Expertises » (aujourd'hui en
404 temporaire accepté, voir spec 008). Le socle est posé : design system construit et consommé, navbar
sticky responsive, bloc CTA + pied de page global, bouton flottant de retour en haut et cinématiques
d'animation existent déjà et sont montés dans le shell `(site)`; les pages home, « Nous découvrir »,
« Expertises » et « Univers » sont livrées. Cette feature consiste à **construire les trois sous-pages**
à partir des composants du design system, à **brancher leur contenu sur le CMS**, à appliquer les
**cinématiques d'animation** et à les rendre **fidèles à la maquette** et **responsives**.

Les trois sous-pages partagent **un même gabarit** (sections, dans l'ordre de défilement) :
1. `02/ SLIDER` — **hero** : visuel plein cadre + **encart titre** sur fond sombre + **fil d'Ariane**
   en haut (« univers / agencement sur-mesure », « … / mobiliers sur-mesure », « … / présentoirs
   sur-mesure »).
2. `03/ INTRO` — **phrase phare** + **texte d'introduction** au métier + **visuel** d'appui (sur
   agencement, le bloc est posé sur un demi-fond bleu).
3. `04/ RESPONSABLE` — **phrase d'engagement** (objectif du métier, soulignée d'un trait) + **visuels**.
4. `05/ NOS ENGAGEMENTS` — titre **« Nos engagements »** + **6 engagements numérotés** (`01/`…`06/`)
   disposés en grille (3 colonnes × 2 lignes) séparés par des traits.
5. `06/ CAS STUDY` — titre **« Découvrez notre dernier projet … »** + **bande visuelle** de la
   réalisation + **bouton** menant à la réalisation correspondante.
6. `BIG FOOTER` — **bloc CTA** + **pied de page global** (shell existant, non re-spécifié).

Source de vérité visuelle : maquettes Figma dans le cache local —
*agencement* `51:3008` (desktop), `87:6762` (tablette), `87:6964` (mobile) ;
*mobiliers* `51:3134` (desktop) ; *présentoirs* `51:3259` (desktop).
**Input utilisateur** : « nouvelle feature : les pages agencement sur mesures, mobiliers sur mesure,
présentoirs sur mesure. »

Le header (navbar) et le footer sont **déjà construits** ; ils ne sont pas re-spécifiés ici (voir
*Hors périmètre*).

## Scénarios utilisateur & tests *(obligatoire)*

### Scénario 1 - Approfondir une expertise précise (Priorité : P1)

Un visiteur (architecte, designer, marque, donneur d'ordre, partenaire) a compris l'offre d'Estuaire
sur la page « Expertises » et veut **approfondir un niveau précis**. Depuis la carte « en savoir plus »
de ce niveau (ou via une URL directe / la navigation), il arrive sur la **sous-page dédiée**. Le
**hero** (visuel fort + fil d'Ariane + encart titre) lui confirme qu'il est sur la bonne expertise ;
l'**intro** lui explique le métier (phrase phare + texte) ; le bloc **« Nos engagements »** détaille,
en six points numérotés, **ce qu'Estuaire s'engage à faire** sur cette expertise. En quelques écrans,
le visiteur comprend en profondeur **comment Estuaire pratique** cette expertise.

**Pourquoi cette priorité** : c'est le cœur de la valeur de la feature — donner, pour chaque niveau
d'expertise, une page de détail crédible et complète qui transforme l'intérêt en confiance. **Une
seule sous-page livrée** (l'agencement, la seule dont la maquette fournit les trois formats) est déjà
un MVP exploitable et déployable : elle rend fonctionnel le premier lien « en savoir plus » de la page
« Expertises ». Les deux autres réutilisent le **même gabarit**.

**Test indépendant** : afficher une sous-page (p. ex. agencement sur mesure) et vérifier que le hero,
l'intro et le bloc « Nos engagements » communiquent l'expertise et ses engagements, que le contenu est
lisible et que les chemins de navigation restent accessibles — sans dépendre des deux autres sous-pages
ni de la section « cas study ».

**Scénarios d'acceptation** :

1. **Étant donné** un visiteur qui ouvre une sous-page d'expertise, **quand** le premier écran
   s'affiche, **alors** il voit un visuel hero plein cadre, un **fil d'Ariane** situant la page dans le
   site et un **encart titre** sur fond sombre identifiant l'expertise, au-dessus d'une navbar restant
   lisible sur le visuel.
2. **Étant donné** le visiteur qui fait défiler l'intro, **quand** la phrase phare et le texte
   d'introduction s'affichent, **alors** il comprend la vision du métier propre à cette expertise
   (p. ex. « Des espaces conçus dans leur ensemble et jusque dans les moindres détails. » pour
   l'agencement, « Des mobiliers pour tous les goûts » pour les mobiliers), accompagnés d'un visuel.
3. **Étant donné** le bloc **« Nos engagements »**, **quand** il s'affiche, **alors** le visiteur voit
   le titre de section et **6 engagements numérotés** (`01/` à `06/`), chacun avec son intitulé, propres
   à l'expertise.
4. **Étant donné** le bloc **« 04/ Responsable »**, **quand** il s'affiche, **alors** le visiteur lit
   la **phrase d'engagement** de synthèse du métier (soulignée d'un trait) accompagnée de ses visuels.
5. **Étant donné** un visiteur ayant activé « réduire les animations », **quand** il ouvre une
   sous-page, **alors** le contenu reste complet et lisible, sans mouvement automatique gênant.
6. **Étant donné** une sous-page, **quand** elle s'affiche sur mobile, tablette ou desktop, **alors** la
   mise en page s'adapte au format sans perte de contenu ni de lisibilité.

---

### Scénario 2 - Passer à l'action depuis une sous-page (Priorité : P2)

Convaincu par le détail d'une expertise, le visiteur veut **voir une réalisation concrète** ou
**prendre contact**. La section **« 06/ Cas study »** met en avant un dernier projet (titre
« Découvrez notre dernier projet … » + bande visuelle) avec un **bouton** menant à la réalisation
correspondante. En bas de page, le **bloc CTA** du pied de page global invite à la prise de contact.
Le visiteur peut aussi naviguer **entre sous-pages** d'expertise via la navigation.

**Pourquoi cette priorité** : après la compréhension de l'expertise, l'enjeu est de **router** le
visiteur vers une preuve (la réalisation) ou vers le contact. C'est ce qui transforme la confiance en
parcours. La page reste un MVP utile sans ce routage (Scénario 1), mais c'est lui qui crée la
conversion.

**Test indépendant** : faire défiler une sous-page jusqu'au bas et vérifier que le bouton du cas study
mène à la destination attendue, que le bloc CTA du pied de page mène à la prise de contact et que la
navigation permet d'atteindre les autres sous-pages.

**Scénarios d'acceptation** :

1. **Étant donné** la section « cas study » et son bouton, **quand** le visiteur l'active, **alors** il
   est dirigé vers la **réalisation** mise en avant (route de réalisation prévue ; 404 temporaire
   accepté tant que la page de réalisation n'est pas livrée — voir *Hypothèses*).
2. **Étant donné** la bande visuelle du cas study et son titre en incrustation, **quand** ils
   s'affichent, **alors** le message reste lisible par-dessus l'image (traitement de contraste
   préservé).
3. **Étant donné** le bloc CTA du pied de page, **quand** le visiteur l'active, **alors** il est dirigé
   vers la prise de contact (réutilise le pied de page global existant).
4. **Étant donné** n'importe quelle section, **quand** le visiteur la fait apparaître au scroll,
   **alors** une animation discrète accompagne son entrée (les visuels portent le mouvement, le texte
   reste l'ancre), sans jamais bloquer la lecture.
5. **Étant donné** une sous-page d'expertise, **quand** le visiteur ouvre la navigation, **alors** il
   peut atteindre les autres sous-pages d'expertise et la page « Expertises ».

---

### Scénario 3 - Maîtrise éditoriale du contenu (Priorité : P3)

Un membre de l'équipe Estuaire met à jour le contenu d'une sous-page d'expertise (fil d'Ariane et
encart titre du hero, phrase phare et texte d'intro, phrase d'engagement et visuels du bloc
« responsable », les 6 engagements numérotés, le cas study mis en avant et son lien, métadonnées SEO)
depuis l'outil de gestion de contenu, **page par page**, sans intervention d'un développeur.

**Pourquoi cette priorité** : l'autonomie éditoriale est un objectif de fond du projet (contenu et
visuels pilotés par le CMS), mais chaque sous-page reste exploitable avant même d'être éditée grâce aux
valeurs par défaut issues de la maquette. C'est donc une couche de valeur qui vient après le rendu
lui-même.

**Test indépendant** : modifier un texte, un visuel, un engagement ou le lien du cas study d'une
sous-page dans l'outil de contenu et vérifier que le changement apparaît sur la page publiée, sans
redéploiement, et **sans affecter les deux autres sous-pages**.

**Scénarios d'acceptation** :

1. **Étant donné** un éditeur dans l'outil de contenu, **quand** il modifie un texte ou un visuel d'une
   section d'une sous-page, **alors** la page publiée correspondante reflète ce changement après
   revalidation.
2. **Étant donné** une sous-page dont le contenu n'a pas encore été saisi, **quand** elle s'affiche,
   **alors** elle présente les textes, visuels et liens par défaut issus de la maquette (aucune zone
   vide ni cassée).
3. **Étant donné** la liste des **6 engagements** d'une sous-page, **quand** l'éditeur modifie
   l'intitulé d'un engagement ou son ordre, **alors** la section reflète le changement en conservant la
   numérotation cohérente.
4. **Étant donné** trois sous-pages distinctes, **quand** l'éditeur modifie le contenu de l'une,
   **alors** les deux autres ne sont pas affectées (contenus indépendants par page).

---

### Cas limites

- **Hero sans visuel saisi** : la sous-page affiche le visuel et l'encart titre par défaut de la
  maquette (jamais un hero vide).
- **Visuel manquant ou lent** : un placeholder de chargement (dominante de couleur) évite tout saut de
  mise en page le temps que l'image arrive.
- **Texte plus long que prévu** : fil d'Ariane, titre de l'encart, phrase phare, texte d'intro,
  intitulés des 6 engagements et titre du cas study restent lisibles et ne débordent pas leur conteneur
  quel que soit le format.
- **Lisibilité des textes en incrustation** : l'encart titre du hero, le titre du cas study (posés sur
  visuel) restent lisibles quel que soit le visuel.
- **Nombre d'engagements** : la maquette en présente exactement **six** par expertise ; la grille reste
  correcte si un engagement est temporairement masqué ou réordonné dans le CMS (la numérotation reste
  cohérente).
- **Destination du cas study non encore publiée** : tant que la page de réalisation cible n'existe pas,
  le bouton pointe vers la route prévue (404 temporaire accepté) ; la livraison des réalisations relève
  de features distinctes (voir *Hors périmètre*).
- **Responsive des pages sans frame dédiée** : les maquettes *mobiliers* et *présentoirs* ne fournissent
  que le format desktop ; leur comportement responsive est **dérivé** des variantes tablette/mobile de
  l'*agencement* (gabarit commun), voir *Hypothèses*.
- **Cohérence du fil d'Ariane** : le premier segment du fil d'Ariane reproduit la maquette ; son lien
  parent mène à la page « Expertises » (parent établi par la feature 008), voir *Hypothèses*.
- **Préférence « réduire les animations »** : toutes les animations (reveals au scroll, parallaxe) sont
  neutralisées au profit d'un rendu statique complet.
- **Navigation au clavier / lecteur d'écran** : toutes les sections, visuels, engagements, le bouton du
  cas study et le CTA sont atteignables et compréhensibles sans souris.

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : La feature DOIT livrer **trois sous-pages d'expertise**, servies sur les routes
  **`/expertises/agencement-sur-mesure`**, **`/expertises/mobiliers-sur-mesure`** et
  **`/expertises/presentoirs-sur-mesure`** ; leur livraison DOIT rendre fonctionnels les liens
  « en savoir plus » correspondants de la page « Expertises » (404 temporaire avant cette feature).
- **FR-002** : Les trois sous-pages DOIVENT partager **un même gabarit** présentant, dans l'ordre de
  défilement : (1) hero / slider avec fil d'Ariane et encart titre, (2) intro (phrase phare + texte +
  visuel), (3) bloc « responsable » (phrase d'engagement + visuels), (4) « Nos engagements » (titre +
  6 engagements numérotés), (5) cas study (titre + bande visuelle + bouton), suivis du **bloc CTA** et
  du **pied de page global** existants.
- **FR-003** : Le **hero** DOIT afficher un **visuel plein cadre**, un **fil d'Ariane** (p. ex.
  « univers / agencement sur-mesure ») situant la page, et un **encart (cartouche) titre** sur fond
  sombre identifiant l'expertise, conformément à la maquette. Sous « réduire les animations », il reste
  statique.
- **FR-004** : Le bloc **intro** DOIT présenter une **phrase phare** mise en avant propre à l'expertise
  (p. ex. « Des espaces conçus dans leur ensemble et jusque dans les moindres détails. »), un **texte
  d'introduction** au métier et un **visuel** d'appui (avec, sur l'agencement, le demi-fond bleu de la
  maquette).
- **FR-005** : Le bloc **« responsable »** DOIT présenter une **phrase d'engagement** de synthèse du
  métier (soulignée d'un trait, p. ex. « Donner vie à des mobiliers sur-mesure ou reproductibles… »)
  accompagnée de ses **visuels**.
- **FR-006** : Le bloc **« Nos engagements »** DOIT présenter un **titre de section** (« Nos
  engagements ») et une **liste ordonnée de 6 engagements**, chacun rendu avec un **numéro** (`01/` à
  `06/`) et un **intitulé**, disposés en grille (3 colonnes × 2 lignes) séparés par des traits,
  conformément à la maquette.
- **FR-007** : Le bloc **« cas study »** DOIT afficher un **titre** (« Découvrez notre dernier projet
  … »), une **bande visuelle** de la réalisation mise en avant et un **bouton** menant à la
  **réalisation** correspondante (route de réalisation prévue ; 404 temporaire accepté tant que la page
  de réalisation n'est pas livrée).
- **FR-008** : Le contenu éditorial de **chaque** sous-page (fil d'Ariane + encart titre du hero,
  phrase phare et texte d'intro + visuel, phrase d'engagement + visuels du bloc « responsable », les 6
  engagements numérotés, le cas study mis en avant + son lien, **métadonnées SEO de la page** — titre,
  meta-description, image de partage) DOIT être **éditable via le CMS**, **indépendamment par page**,
  avec des **valeurs par défaut issues de la maquette** servant de repli quand le contenu n'est pas
  saisi.
- **FR-009** : Chaque sous-page DOIT s'afficher correctement et conserver sa lisibilité sur les **trois
  formats** : mobile (~390), tablette (~768) et desktop (~1920). Pour *mobiliers* et *présentoirs*
  (maquette desktop uniquement), le comportement responsive DOIT être **dérivé** des variantes
  tablette/mobile de l'*agencement* (gabarit commun).
- **FR-010** : Le rendu DOIT être **fidèle à la maquette** sur les dimensions intrinsèques (typographie,
  espacements, proportions, composition, traitements de titres) ; les dimensions dynamiques (ex. hauteur
  du hero) peuvent s'adapter à l'écran.
- **FR-011** : Chaque sous-page DOIT s'intégrer dans le **shell de site existant** (navbar sticky, bloc
  CTA + pied de page global, bouton flottant de retour en haut) sans les redéfinir ; elle DOIT déclarer
  la **tonalité de navigation** appropriée pour que la navbar transparente reste lisible au-dessus du
  hero.
- **FR-012** : Chaque section DOIT être accompagnée d'**animations cinématiques discrètes** au scroll
  (le texte reste l'ancre statique, les visuels et transitions portent le mouvement, les titres se
  révèlent par ligne), avec une seule motion focale à la fois.
- **FR-013** : Toutes les animations DOIVENT honorer la préférence **« réduire les animations »** : un
  visiteur l'ayant activée obtient un rendu statique complet et lisible.
- **FR-014** : Chaque sous-page DOIT être **accessible** : navigation et activation au clavier de toutes
  les sections / visuels / engagements / bouton du cas study / CTA, contrastes suffisants, alternatives
  textuelles des visuels, structure de titres sémantique.
- **FR-015** : Chaque sous-page DOIT respecter les attentes **SEO** : un titre principal (H1) unique,
  une hiérarchie de titres cohérente, un titre et une description de page et une image de partage
  social. Le **titre de page, la meta-description et l'image de partage sont éditables via le CMS** (par
  page), avec des valeurs par défaut issues de la maquette.
- **FR-016** : Le bouton flottant de **retour en haut** DOIT apparaître au fil du scroll et ramener en
  haut de page de façon fluide (réutilise le comportement existant du shell).
- **FR-017** : Le contenu de chaque sous-page DOIT rester accessible et exploitable même si les visuels
  ou les animations ne se chargent pas (rendu de base d'abord, enrichissement ensuite).
- **FR-018** : Le **fil d'Ariane** de chaque sous-page DOIT permettre de **remonter** à la page parente
  « Expertises » ; le libellé du premier segment reproduit la maquette (voir *Hypothèses* sur la mention
  « univers »).

### Entités clés *(incluses car la feature implique du contenu)*

- **Sous-page d'expertise (contenu)** : représente l'ensemble du contenu éditable d'**une** expertise —
  identifiée par son expertise (agencement / mobiliers / présentoirs) et sa route. Contient le hero (fil
  d'Ariane + visuel + encart titre), l'intro (phrase phare + texte + visuel), le bloc « responsable »
  (phrase d'engagement + visuels), la liste des 6 engagements, le cas study mis en avant (titre + visuel
  + lien de réalisation), ainsi que les **métadonnées SEO** (titre, meta-description, image de partage).
  Il existe **trois** contenus de ce type, **indépendants** les uns des autres.
- **Hero** : un fil d'Ariane, un visuel plein cadre et un encart titre (sur fond sombre).
- **Bloc intro** : une phrase phare, un texte d'introduction et un visuel.
- **Bloc « responsable »** : une phrase d'engagement de synthèse et des visuels.
- **Engagement** : un numéro d'ordre et un intitulé. Liste ordonnable (6 dans la maquette).
- **Cas study mis en avant** : un titre, une bande visuelle et un lien vers une réalisation.

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **SC-001** : Depuis la page « Expertises », chacun des **3 liens « en savoir plus »** mène à sa
  sous-page de détail (plus aucun 404 sur ces trois routes).
- **SC-002** : Sur chaque sous-page, un visiteur testé identifie correctement **l'expertise concernée**
  et au moins **trois des six engagements** d'Estuaire pour cette expertise après avoir parcouru la
  page.
- **SC-003** : Depuis chaque sous-page, la **réalisation** mise en avant (cas study) et la prise de
  **contact** (via le bloc CTA / le pied de page) sont atteignables en un seul clic ; les autres
  sous-pages d'expertise sont atteignables via la navigation.
- **SC-004** : Le rendu de chaque sous-page correspond à la maquette sur les **trois formats** (mobile,
  tablette, desktop), validé par comparaison visuelle (diff) section par section.
- **SC-005** : Avec « réduire les animations » activé, la totalité du contenu de chaque sous-page reste
  visible et lisible, et l'intégralité de la page est parcourable au clavier (0 piège clavier).
- **SC-006** : Un éditeur modifie un texte, un visuel, un engagement ou le lien du cas study d'une
  sous-page et constate le changement sur la page publiée **sans aucune intervention de développeur ni
  redéploiement**, et **sans impact** sur les deux autres sous-pages.
- **SC-007** : Avant toute saisie de contenu, chaque sous-page s'affiche complète, sans zone vide ni
  élément cassé, grâce aux valeurs par défaut de la maquette.
- **SC-008** : Sur chaque sous-page, le premier écran devient lisible et le contenu principal apparaît
  en moins de 2,5 s sur une connexion mobile représentative, sans décalage de mise en page notable
  pendant le chargement.

## Hypothèses

- **Périmètre = les 3 sous-pages d'expertise** *(défaut motivé)* : cette feature livre uniquement les
  trois sous-pages `/expertises/{agencement-sur-mesure, mobiliers-sur-mesure, presentoirs-sur-mesure}`.
  La page parente « Expertises » est déjà livrée (feature 008) ; elle pointe déjà vers ces routes.
- **Gabarit partagé** : les trois pages reposent sur **un même gabarit** (6 sections identiques) ; seul
  le **contenu** (textes, visuels, engagements, cas study) diffère par page. L'implémentation est
  attendue comme **un gabarit réutilisable** alimenté par trois contenus distincts (à confirmer en phase
  plan : composant(s) de design system + modèle de contenu unique paramétré par l'expertise).
- **MVP = la sous-page « agencement sur mesure »** : c'est la seule dont la maquette fournit les trois
  formats (desktop `51:3008`, tablette `87:6762`, mobile `87:6964`) ; elle sert de **référence
  responsive** et de premier livrable. *mobiliers* (`51:3134`) et *présentoirs* (`51:3259`) n'ont qu'une
  frame desktop : leur responsive est **dérivé** des variantes de l'agencement (analogue à la note
  `home/slideshow` du cache Figma).
- **Engagements** : modélisés comme une **liste ordonnée éditable** de 6 éléments (numéro + intitulé),
  pré-remplie avec les engagements de la maquette propres à chaque expertise ; la numérotation `01/`…
  `06/` est dérivée de l'ordre.
- **Cas study → réalisation** : le bouton du cas study mène vers la **route d'une réalisation**
  (portfolio / case study) ; ces pages relèvent de **features distinctes** (404 temporaire accepté tant
  qu'elles ne sont pas livrées), par analogie avec le traitement des sous-pages dans la feature 008.
- **Fil d'Ariane** : le libellé reproduit fidèlement la maquette, qui écrit « **univers** / <expertise>
  sur-mesure ». Le **parent cliquable** retenu est la page **« Expertises »** (parent établi par la
  feature 008 : ce sont les cartes d'Expertises qui pointent vers ces sous-pages). La mention « univers »
  du libellé est traitée comme une **copie de maquette à confirmer** avec le client ; en cas de doute,
  le segment renvoie vers « Expertises ».
- **H1 / SEO** : le H1 de chaque page est l'encart titre du hero ; titre de page, meta-description et
  image de partage sont **éditables via le CMS** (par page), pré-remplis avec des valeurs par défaut
  issues de la maquette.
- **Contenu textuel et visuels** : les copies et visuels de référence de la maquette servent de valeurs
  par défaut et de source pour le pré-remplissage initial du contenu (copie partagée entre seed et repli
  front rangée une seule fois, conformément à la convention projet).
- **Langue** : contenu en français uniquement (pas d'internationalisation).
- **Breakpoints** : mobile-first, base = mobile (390), `md` = tablette (768), `lg` = desktop (≥1024,
  référence 1920), conformément à la convention du design system.

## Dépendances

- **Page « Expertises » livrée** (feature 008) : porte les liens « en savoir plus » vers ces trois
  routes ; la livraison de cette feature les rend fonctionnels.
- **Shell de site déjà livré** : navbar sticky responsive, bloc CTA + pied de page global (avec
  diaporama, bouton plaquette PDF, bouton flottant de retour en haut) sont construits et montés dans le
  layout `(site)` ; les sous-pages s'y insèrent.
- **Design system** : les composants présentationnels nécessaires (hero de page avec encart titre, fil
  d'Ariane, phrase phare, bloc texte + visuels, grille d'engagements numérotés, bande cas study + bouton,
  bouton, typographie de marque) existent dans le design system et sont consommés tels quels (ou étendus
  de façon délibérée si un composant manque).
- **Cinématiques d'animation** : les primitives de motion (reveals au scroll, parallaxe, révélation des
  titres par ligne) sont définies et réutilisées.
- **Outil de gestion de contenu + revalidation** : le mécanisme de publication/revalidation existant est
  réutilisé pour rendre le contenu éditable des trois pages.
- **Cache Figma local** : les maquettes (agencement 3 formats ; mobiliers et présentoirs desktop) sont
  disponibles dans le cache local et font foi pour la fidélité visuelle.

## Hors périmètre

- **Page « Expertises » (landing)** : déjà livrée (feature 008) ; non re-spécifiée. Cette feature se
  contente de rendre fonctionnels ses liens « en savoir plus ».
- **Pages de réalisation (portfolio / case study)** : la cible du bouton « cas study » relève de features
  distinctes ; cette feature se contente de pointer vers leur route (404 temporaire accepté).
- **Navbar et pied de page** : déjà construits et intégrés ; non re-spécifiés ici (sauf intégration /
  vérification de la tonalité de navigation au-dessus du hero).
- **Formulaire de contact** et routage des e-mails : portés par la page Contact / le pied de page
  existant.
- **Plaquette PDF** : le bouton de téléchargement de la plaquette est déjà porté par le pied de page
  global ; non re-spécifié ici.
- **Suppression du bac à sable `(lab)`** : nettoyage post-livraison, hors de cette feature.
