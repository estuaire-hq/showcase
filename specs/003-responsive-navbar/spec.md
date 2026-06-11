# Spécification : Navbar responsive

**Branche**: `003-responsive-navbar`
**Créée le**: 2026-06-11
**Statut**: Draft
**Contexte**: Mise en place de la barre de navigation principale du site Estuaire, complète et
responsive (desktop, tablette, smartphone), avec son comportement sticky au scroll. Source de
vérité visuelle : maquette Figma *Webdesign-ESTUAIRE* — navbar `51:2221`, sticky `51:2585`,
tablette `77:3149` / ouverte `77:3630`, smartphone `77:3150` / ouvert `87:5893`.

## Clarifications

### Session 2026-06-11

- Q: Quel style « au repos » sur une page sans en-tête sombre (la navbar étant site-wide et le mode
  transparent supposant un fond sombre) ? → A: **Contraste adaptatif**. En mode transparent, chaque
  élément (logo, liens) adopte une couleur blanche ou noire selon le fond qu'il recouvre (clair →
  contenu sombre, sombre → contenu clair). Une fois en sticky, la navbar a un fond plein : la
  question de lisibilité ne se pose plus (contenu sombre sur fond clair). C'est aussi ce que montre
  la maquette du hero (logo clair sur le bloc sombre à gauche, menu sombre sur la zone claire).
- Q: Comment se comporte le sticky au scroll ? → A: La barre sticky (style plein) **n'apparaît que
  lorsque l'utilisateur remonte** dans la page. En défilement vers le bas (hors sommet), la navbar
  est **masquée** (escamotée hors écran) pour maximiser la lecture. Au sommet de page, elle revient
  à son état transparent au repos. Motif « masquer au scroll vers le bas / révéler au scroll vers
  le haut ».
- Q: La navbar indique-t-elle la page courante (état actif) ? → A: **Oui**. La maquette comporte un
  état « page active » (référence Figma node `51:2699`) : l'entrée correspondant à la page courante
  est mise en évidence. Le traitement visuel exact est à lire losslessly sur le node `51:2699` au
  moment de l'implémentation (pixel-perfect ; non lu ici — API Figma en 429/rate-limit).

## Scénarios utilisateur & tests *(obligatoire)*

### Scénario 1 - Naviguer vers les grandes parties du site (Priorité : P1)

Un visiteur arrive sur le site et trouve, en haut de page, une barre de navigation persistante
affichant la marque Estuaire (logo) et l'accès aux grandes parties du site — *Nous découvrir*,
*Expertises*, *Univers*, *Réalisations* — ainsi qu'une action mise en avant *contact*. Il
sélectionne un élément et est conduit vers la destination correspondante.

**Pourquoi cette priorité** : sans navigation, le visiteur ne peut pas circuler dans le site.
C'est le cœur de la fonctionnalité et le plus petit incrément qui apporte déjà de la valeur (une
navigation desktop opérationnelle).

**Test indépendant** : afficher la page sur un écran large, vérifier la présence du logo, des 4
liens et de l'action *contact*, et confirmer que chaque élément mène à la bonne destination.

**Scénarios d'acceptation** :

1. **Étant donné** un écran large, **quand** la page se charge, **alors** la navbar affiche le
   logo, les 4 liens (*Nous découvrir*, *Expertises*, *Univers*, *Réalisations*) et l'action
   *contact* visuellement distincte.
2. **Étant donné** la navbar affichée, **quand** le visiteur sélectionne un lien, **alors** il est
   conduit à la destination associée.
3. **Étant donné** la navbar affichée, **quand** le visiteur sélectionne le logo, **alors** il est
   ramené à l'accueil / en haut de page.
4. **Étant donné** une page dédiée correspondant à une entrée, **quand** le visiteur est sur cette
   page, **alors** l'entrée correspondante est mise en évidence (état « page active »).

---

### Scénario 2 - Naviguer depuis un mobile ou une tablette (Priorité : P1)

Sur un écran réduit (tablette, smartphone), la liste horizontale des liens est remplacée par une
icône « menu » (hamburger). En l'activant, un panneau plein écran s'ouvre, présentant le logo et
les mêmes entrées de navigation empilées verticalement, plus une croix de fermeture. Le visiteur
choisit une entrée (ce qui referme le panneau et l'emmène à destination) ou ferme le panneau.

**Pourquoi cette priorité** : la demande est explicitement « complète, avec responsif ». La
majorité du trafic d'un site vitrine est mobile ; une navigation inutilisable sur petit écran
rend le site inexploitable pour ce public. P1 au même titre que la navigation desktop.

**Test indépendant** : réduire la fenêtre sous le seuil desktop, vérifier que les liens
horizontaux disparaissent au profit de l'icône menu, l'activer, vérifier l'ouverture du panneau
plein écran avec toutes les entrées, en sélectionner une et confirmer la fermeture + navigation.

**Scénarios d'acceptation** :

1. **Étant donné** un écran tablette ou smartphone, **quand** la page se charge, **alors** la
   navbar affiche le logo et une icône menu, et masque la liste horizontale des liens.
2. **Étant donné** l'icône menu visible, **quand** le visiteur l'active, **alors** un panneau plein
   écran s'ouvre avec le logo, toutes les entrées de navigation et une croix de fermeture, et
   l'arrière-plan de la page ne défile plus.
3. **Étant donné** le panneau ouvert, **quand** le visiteur sélectionne une entrée, **alors** le
   panneau se ferme et le visiteur est conduit à la destination.
4. **Étant donné** le panneau ouvert, **quand** le visiteur active la croix de fermeture (ou la
   touche Échap), **alors** le panneau se ferme et la page redevient défilable.

---

### Scénario 3 - Retrouver la navigation en remontant (sticky au scroll) (Priorité : P2)

En haut de page, la navbar se fond sur le visuel d'en-tête (fond transparent, contraste adaptatif).
Quand le visiteur défile vers le bas, la navbar s'escamote (masquée) pour laisser toute la place au
contenu. Dès qu'il amorce un retour vers le haut, la navbar réapparaît en style « plein » (fond
opaque, ombre portée, contenu contrasté), immédiatement accessible. De retour tout en haut, elle
reprend son état transparent au repos.

**Pourquoi cette priorité** : améliore fortement l'usage (navigation à portée dès qu'on remonte,
sans encombrer la lecture en descente) mais n'est pas indispensable à une première version
fonctionnelle ; la navigation marche déjà sans cet affinage. D'où P2.

**Test indépendant** : charger la page, constater la navbar transparente sur l'en-tête ; défiler
vers le bas et vérifier qu'elle se masque ; amorcer une remontée et vérifier qu'elle réapparaît en
style plein ; revenir au sommet et vérifier le retour au style transparent.

**Scénarios d'acceptation** :

1. **Étant donné** le visiteur en haut de page, **quand** la page est au repos, **alors** la navbar
   a un fond transparent, son contenu en contraste adaptatif reste lisible sur le visuel d'en-tête.
2. **Étant donné** le visiteur qui défile vers le bas (hors sommet), **quand** le défilement
   continue, **alors** la navbar est masquée (escamotée hors de l'écran).
3. **Étant donné** le visiteur qui défile vers le haut (hors sommet), **quand** il amorce la
   remontée, **alors** la navbar réapparaît, fixée en haut de l'écran, en style plein (fond opaque,
   ombre, contenu contrasté).
4. **Étant donné** le visiteur qui atteint de nouveau le sommet, **quand** la page est tout en haut,
   **alors** la navbar revient à son état transparent au repos.
5. **Étant donné** un visiteur ayant activé « réduire les animations », **quand** la navbar se masque
   ou réapparaît, **alors** le changement est instantané (pas d'animation de glissement).

---

### Cas limites

- **Préférence « réduire les animations »** : aucune animation pour le passage transparent↔plein ni
  pour l'ouverture/fermeture du panneau ; les changements restent instantanés et fonctionnels.
- **Clavier & lecteurs d'écran** : tous les éléments sont focusables et activables au clavier ;
  panneau ouvert = focus piégé dans le panneau, Échap pour fermer ; l'icône menu et la croix
  portent un libellé accessible et un état ouvert/fermé annoncé.
- **Redimensionnement avec panneau ouvert** : passer du mobile au desktop alors que le panneau est
  ouvert ne doit pas laisser le site dans un état bloqué (verrou de défilement résiduel, panneau
  fantôme).
- **Seuil de scroll** : le masquage/réapparition de la barre ne doit pas vaciller sur de micro-
  mouvements de scroll (petit seuil de tolérance) ni scintiller autour du sommet de page.
- **Verrou de défilement** : à l'ouverture du panneau, l'arrière-plan ne défile pas ; à la
  fermeture, le défilement et la position sont restaurés.
- **Contraste adaptatif (transparent)** : un élément qui chevauche une frontière clair/sombre, ou un
  fond ambigu (image, dégradé), doit rester lisible ; la règle de bascule clair↔sombre du contenu
  doit être définie de façon déterministe (cf. *Hypothèses* — mécanisme de contraste à préciser au
  plan).
- **Route cible pas encore construite** : tant que la page dédiée d'une entrée n'existe pas, le lien
  pointe vers sa route prévue (qui peut renvoyer une page « introuvable » / un état provisoire) ;
  la création de ces pages est hors périmètre (cf. *Hors périmètre*).

## Exigences *(obligatoire)*

### Exigences fonctionnelles

- **FR-001** : Le site DOIT présenter une barre de navigation persistante en haut de chaque page,
  contenant le logo de la marque, les liens de navigation principaux et l'action *contact*.
- **FR-002** : La navbar DOIT proposer les entrées suivantes : *Nous découvrir*, *Expertises*,
  *Univers*, *Réalisations*, et l'action *contact* présentée comme un appel à l'action distinct.
- **FR-003** : Le logo DOIT ramener à l'accueil (et, en haut de l'accueil, au sommet de page).
- **FR-004** : Sur grand écran (référence desktop), la navbar DOIT afficher l'ensemble des entrées
  sur une seule ligne horizontale, avec l'action *contact* visuellement distincte des autres liens.
- **FR-005** : En haut de page, la navbar DOIT avoir un fond transparent se fondant sur le visuel
  d'en-tête. En l'absence de fond plein, chaque élément (logo, liens, action) DOIT adopter une
  couleur contrastée selon le fond qu'il recouvre — contenu **clair** sur zone sombre, contenu
  **sombre** sur zone claire — afin de rester lisible quelle que soit la page ou la zone survolée.
- **FR-006** : La barre sticky (style « plein » : fond opaque, ombre portée, contenu contrasté
  sombre) NE DOIT apparaître QUE lorsque le visiteur défile vers le **haut** (hors sommet). En
  défilement vers le **bas** hors sommet, la navbar DOIT être masquée (escamotée hors écran). Au
  **sommet** de page, la navbar DOIT revenir à son état transparent au repos (FR-005).
- **FR-007** : Sur écran réduit (référence tablette et smartphone), la navbar DOIT masquer la liste
  horizontale des liens et afficher à la place une icône « menu » (hamburger).
- **FR-008** : L'activation de l'icône menu DOIT ouvrir un panneau plein écran (fond sombre semi-
  opaque) présentant le logo, toutes les entrées de navigation empilées et une croix de fermeture.
- **FR-009** : Le panneau DOIT pouvoir être fermé par la croix, par la touche Échap, et par la
  sélection d'une entrée ; pendant qu'il est ouvert, l'arrière-plan de la page NE DOIT PAS défiler.
- **FR-010** : La sélection d'une entrée (desktop comme panneau mobile) DOIT conduire le visiteur à
  la destination associée et, sur mobile/tablette, refermer le panneau.
- **FR-011** : La navbar DOIT être entièrement utilisable au clavier et compatible lecteurs d'écran
  (éléments focusables, libellés accessibles, focus piégé dans le panneau ouvert, état ouvert/fermé
  annoncé).
- **FR-012** : Tout mouvement (masquage/réapparition de la barre sticky, bascule de style,
  ouverture/fermeture du panneau) DOIT respecter la préférence « réduire les animations ».
- **FR-013** : La navbar DOIT reproduire fidèlement la maquette Figma à chacun des trois points de
  rupture (smartphone 390, tablette 768, desktop 1920) : dimensions, espacements, typographies,
  couleurs et positions intrinsèques conformes à la référence.
- **FR-014** : Chaque entrée de navigation DOIT pointer vers une **page dédiée** (route distincte —
  ex. *Expertises*, *Univers*, *Réalisations*, *contact* mènent chacune à leur propre page). La
  navbar câble ces destinations même si la page cible n'est pas encore construite (cf. *Hors
  périmètre* — création des pages).
- **FR-015** : Le contenu de la navbar (libellés des liens, libellé et cible de l'action *contact*,
  destinations) DOIT être **défini en statique dans le code** pour cette version (pas de gestion via
  le CMS). Une migration ultérieure vers Sanity reste possible sans changer le comportement décrit.
- **FR-016** : La navbar DOIT indiquer la **page courante** : l'entrée correspondant à la page
  active est mise en évidence selon le traitement de la maquette (référence Figma node `51:2699`).
  Le style exact (à lire losslessly au build) est intrinsèque et conforme à la référence.

## Critères de réussite *(obligatoire)*

### Résultats mesurables

- **SC-001** : Depuis n'importe quelle position de défilement et sur n'importe quel appareil, un
  visiteur peut atteindre l'une des 4 grandes parties du site ou l'action *contact* en au plus une
  interaction avec la navbar.
- **SC-002** : Le rendu de la navbar correspond à la maquette Figma aux trois points de rupture
  (390, 768, 1920) — vérifié par comparaison visuelle (diff) sur chaque largeur, pour les états par
  défaut (transparent, contraste adaptatif), sticky, page active, et panneau ouvert.
- **SC-003** : Sur tablette et smartphone, le panneau de navigation s'ouvre et se ferme de manière
  fluide et reste entièrement opérable au toucher comme au clavier (ouverture, sélection,
  fermeture).
- **SC-004** : Depuis n'importe quelle position dans la page, la navigation redevient accessible en
  un seul geste de remontée (la barre sticky réapparaît dès le scroll vers le haut), et elle est
  toujours présente au sommet de page.
- **SC-005** : Lorsque « réduire les animations » est activé, aucun mouvement n'est joué ; la navbar
  reste pleinement fonctionnelle.
- **SC-006** : La navbar satisfait aux critères d'accessibilité de navigation : tous les éléments
  sont atteignables et activables au clavier, le panneau ouvert piège le focus et se ferme avec
  Échap, et les commandes portent un libellé accessible.

## Hypothèses

- **Portée site-wide** : la navbar est l'en-tête global du site et apparaît sur toutes les pages
  (pas seulement l'accueil). Une seule navbar, partagée, pas une instance par page.
- **Mêmes entrées partout** : les entrées de navigation sont identiques sur desktop et dans le
  panneau mobile/tablette (même ensemble de liens + *contact*). La maquette présente un léger écart
  d'ordre entre desktop et panneau ouvert ; l'ordre de référence retenu est celui du desktop
  (*Nous découvrir*, *Expertises*, *Univers*, *Réalisations*, *contact*).
- **Destinations en routes, définies en statique** : chaque entrée mène à une page dédiée ; les
  libellés et les routes sont définis en dur dans le code (pas de schéma Sanity pour cette version).
  Les slugs des routes suivent les libellés et seront figés au moment de la planification.
- **Points de rupture** : convention du design system — base → mobile (390), `md:` → tablette (768),
  `lg:` → desktop (≥1024, frame 1920).
- **Dimensions de référence** : hauteur d'en-tête ≈ 160 px sur desktop et ≈ 120 px sur
  tablette/smartphone ; le logo passe à une taille réduite sous le desktop ; ces valeurs
  intrinsèques sont issues de la maquette et font foi.
- **Panneau plein écran** : fond sombre semi-opaque (≈ 90 %) recouvrant la page, logo et entrées
  centrés, croix de fermeture en haut à droite (à la place de l'icône menu).
- **Mécanisme de contraste & seuil de scroll** : le *comportement* (contraste adaptatif en
  transparent ; masquer au scroll bas / révéler au scroll haut) est fixé ; la *mise en œuvre* — par
  quoi le fond est connu (sections déclarant leur tonalité, détection au scroll…) et le seuil de
  tolérance du masquage — est décidée à l'étape de planification.
- **Pas d'éléments additionnels dans le panneau** : la maquette ne montre ni réseaux sociaux ni
  coordonnées dans le panneau ouvert — uniquement logo + entrées + croix.
- **Indicateur d'état actif** : requis (cf. FR-016) — la maquette le prévoit (node `51:2699`). Le
  traitement visuel précis sera lu sur ce node au build (méthode `estuaire-figma`), n'ayant pas pu
  être récupéré ici (API Figma en rate-limit 429). Un retour visuel au survol/au focus est par
  ailleurs attendu sur les entrées.

## Hors périmètre

- Recherche dans le site, sélecteur de langue, autres commandes d'en-tête non présentes sur la
  maquette.
- Création des pages cibles ou des sections vers lesquelles pointent les liens (cf. FR-014) — seule
  la navbar et son câblage vers des cibles existantes ou définies est concerné.
- Animations « signature » au-delà des transitions décrites (sticky + ouverture du panneau), qui
  relèvent de la chorégraphie globale de la page (skill `estuaire-motion`).
