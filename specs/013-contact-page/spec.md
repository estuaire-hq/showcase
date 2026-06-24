# Feature Specification: Page contact

**Feature Branch**: `013-contact-page`  
**Created**: 2026-06-20  
**Status**: Draft  
**Input**: User description: "on va lancer la page contact"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Envoyer un message via le formulaire de contact (Priority: P1)

Un visiteur (prospect, client, partenaire) arrive sur la page contact, comprend
immédiatement qu'il peut joindre Estuaire, remplit le formulaire (nom, société, email,
type de demande, message, éventuelle pièce jointe) et l'envoie. Son message parvient à
l'équipe Estuaire et il reçoit une confirmation claire que sa demande a bien été transmise.

**Why this priority**: C'est la raison d'être de la page — convertir l'intérêt en prise de
contact qualifiée. Sans cela, la page n'a aucune valeur métier. C'est le MVP : une page qui
permet d'envoyer un message exploitable suffit déjà à générer des leads.

**Independent Test**: Remplir le formulaire avec des données valides, l'envoyer, et vérifier
(a) qu'un message de confirmation s'affiche pour le visiteur et (b) que l'équipe Estuaire
reçoit la demande complète (champs + pièce jointe). Testable de bout en bout sans les autres
sections.

**Acceptance Scenarios**:

1. **Given** un visiteur sur la page contact, **When** il renseigne au minimum les champs
   obligatoires (nom & prénom, email, message) avec des valeurs valides et envoie, **Then** la
   demande est transmise à Estuaire et un message de succès s'affiche.
2. **Given** un formulaire avec un email mal formé ou un champ obligatoire vide, **When** le
   visiteur tente d'envoyer, **Then** l'envoi est bloqué et des messages d'erreur précis
   indiquent les champs à corriger, sans perdre les données déjà saisies.
3. **Given** un visiteur qui sélectionne un type de demande et joint un fichier conforme,
   **When** il envoie, **Then** le type de demande et la pièce jointe parviennent à Estuaire
   avec le reste du message.
4. **Given** une indisponibilité temporaire du service d'envoi, **When** le visiteur envoie,
   **Then** un message d'erreur invite à réessayer (ou à utiliser l'email direct) et la saisie
   est conservée.

---

### User Story 2 - Trouver et joindre Estuaire (coordonnées + carte) (Priority: P2)

Un visiteur veut localiser Estuaire et disposer des coordonnées directes (adresse, email)
sans passer par le formulaire — par exemple pour écrire directement ou préparer une visite.
Il lit l'adresse, clique sur l'email, et visualise l'emplacement sur une carte interactive.

**Why this priority**: Complète la prise de contact pour les visiteurs qui préfèrent un canal
direct ou ont besoin de l'implantation géographique. Forte valeur, mais secondaire au
formulaire qui capte la majorité des demandes.

**Independent Test**: Charger la page, vérifier que l'adresse et l'email s'affichent
correctement, que l'email est actionnable (ouvre le client mail), et que la carte interactive
affiche le bon emplacement avec un marqueur.

**Acceptance Scenarios**:

1. **Given** la page contact chargée, **When** le visiteur consulte la section coordonnées,
   **Then** l'adresse postale complète et l'adresse email d'Estuaire sont affichées.
2. **Given** la section coordonnées, **When** le visiteur clique sur l'email, **Then** son
   client de messagerie s'ouvre avec le destinataire pré-rempli.
3. **Given** la carte interactive, **When** elle se charge, **Then** elle est centrée sur
   l'emplacement d'Estuaire avec un marqueur, et le visiteur peut zoomer/déplacer.

---

### User Story 3 - Gérer le contenu de la page contact (Priority: P3)

Un éditeur d'Estuaire (via le back-office) veut pouvoir mettre à jour les textes de la page
(titres, intitulés), les coordonnées (adresse, email), la position de la carte et la liste
des types de demande, sans intervention technique.

**Why this priority**: Garantit l'autonomie éditoriale dans la durée, cohérente avec le reste
du site (contenu piloté par le CMS). Non bloquant pour une première mise en ligne, mais
attendu pour l'exploitation courante.

**Independent Test**: Modifier un texte / une coordonnée / la liste des types de demande dans
le back-office, publier, et constater la mise à jour sur la page publique.

**Acceptance Scenarios**:

1. **Given** un éditeur dans le back-office, **When** il modifie l'adresse ou l'email et
   publie, **Then** la page publique reflète la nouvelle valeur (formulaire, coordonnées, et
   destinataire des demandes restant cohérents).
2. **Given** un éditeur, **When** il ajoute/retire/réordonne un type de demande, **Then** la
   liste déroulante du formulaire est mise à jour en conséquence.

---

### Edge Cases

- **Champ obligatoire manquant ou email invalide** → blocage de l'envoi + message d'erreur
  ciblé, saisie conservée.
- **Pièce jointe trop volumineuse ou format non autorisé** → refus avec message explicite
  avant envoi.
- **Soumissions automatisées / spam** → filtrées sans dégrader l'expérience d'un humain.
- **Service d'envoi indisponible** → message d'erreur clair, saisie conservée, canal email
  direct toujours visible en repli.
- **Double envoi (clics multiples / renvoi)** → une seule demande transmise, bouton neutralisé
  pendant l'envoi.
- **Carte indisponible (réseau, fournisseur)** → l'adresse textuelle reste lisible et constitue
  un repli suffisant pour localiser Estuaire.
- **Coordonnées non renseignées dans le CMS** → la page reste cohérente avec un repli de
  contenu neutre, sans zone vide cassée.
- **Lecteur d'écran / navigation clavier** → tous les champs sont labellisés, l'ordre de
  tabulation est logique, les erreurs sont annoncées.
- **`prefers-reduced-motion`** → les animations d'entrée sont neutralisées.

## Requirements *(mandatory)*

### Functional Requirements

**Présentation & intégration**

- **FR-001**: La page contact MUST être accessible à une URL dédiée stable et reproduire
  fidèlement la maquette (hero, formulaire + visuel, coordonnées + carte, pied de page).
- **FR-002**: La page MUST réutiliser la barre de navigation et le pied de page partagés du
  site (aucune duplication de ces composants).
- **FR-003**: La maquette de référence existe en format desktop uniquement ; la page MUST
  rester lisible et cohérente sur tablette et mobile via une déclinaison responsive dérivée.
- **FR-004**: La page MUST présenter un titre d'accroche (« Nous sommes à votre écoute ») et
  le visuel d'accompagnement du formulaire.

**Formulaire de contact**

- **FR-005**: Le formulaire MUST proposer les champs : nom & prénom (obligatoire), société,
  email, type de demande (choix dans une liste), message (texte long), et pièce jointe
  (optionnelle).
- **FR-006**: Le système MUST valider, côté visiteur et côté serveur, la présence des champs
  obligatoires et la validité du format email avant toute transmission.
- **FR-007**: Le champ « type de demande » MUST offrir une liste de choix prédéfinie et
  gérable par l'éditeur.
- **FR-008**: Le visiteur MUST pouvoir joindre un fichier dont le format et la taille sont
  contraints et vérifiés ; un fichier non conforme MUST être refusé avec un message explicite.
- **FR-009**: À l'envoi d'un formulaire valide, le système MUST transmettre la demande complète
  (tous les champs + pièce jointe) à l'adresse de contact d'Estuaire.
- **FR-010**: Après un envoi réussi, le système MUST afficher une confirmation claire au
  visiteur et réinitialiser le formulaire.
- **FR-011**: En cas d'échec de transmission, le système MUST afficher un message d'erreur
  compréhensible, conserver la saisie, et laisser le canal email direct visible en repli.
- **FR-012**: Le système MUST se prémunir contre les soumissions automatisées (anti-spam) sans
  imposer de friction excessive à un visiteur humain.
- **FR-013**: Le système MUST empêcher l'envoi en double (neutralisation du bouton pendant le
  traitement).
- **FR-014**: Le système MUST traiter les données du formulaire conformément au RGPD (finalité
  de prise de contact uniquement, pas de réutilisation hors objet ; information de
  l'utilisateur via le lien Politique de confidentialité déjà présent dans le pied de page).

**Coordonnées & carte**

- **FR-015**: La page MUST afficher l'adresse postale complète d'Estuaire et son adresse email.
- **FR-016**: L'adresse email affichée MUST être actionnable (ouverture du client mail).
- **FR-017**: La page MUST afficher une carte interactive centrée sur l'emplacement d'Estuaire,
  avec un marqueur de localisation, permettant zoom et déplacement.
- **FR-018**: Si la carte ne peut pas se charger, l'adresse textuelle MUST rester un repli
  suffisant pour localiser Estuaire.

**Contenu & édition**

- **FR-019**: Les textes de la page, les coordonnées (adresse, email), la position de la carte
  et la liste des types de demande MUST être éditables via le back-office, sans intervention
  technique.
- **FR-020**: La page MUST rester cohérente même lorsque le contenu éditorial n'est pas
  renseigné (replis neutres, aucune zone cassée).

**Accessibilité & animation**

- **FR-021**: Tous les champs MUST être correctement labellisés, navigables au clavier, et les
  erreurs de validation MUST être perceptibles par un lecteur d'écran.
- **FR-022**: Les éventuelles animations d'entrée MUST respecter `prefers-reduced-motion`.

### Key Entities *(include if feature involves data)*

- **Contenu de la page contact** : les éléments éditoriaux de la page — titres/intitulés,
  visuel du formulaire, coordonnées (adresse postale, email), emplacement de la carte
  (localisation), et liste ordonnée des types de demande proposés dans le formulaire.
- **Demande de contact (soumission)** : les données envoyées par un visiteur — nom & prénom,
  société, email, type de demande, message, pièce jointe optionnelle. Donnée transmise à
  Estuaire (et non un contenu persisté côté site, sauf décision contraire en phase de
  conception).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visiteur peut remplir et envoyer le formulaire avec succès en moins de
  2 minutes, sans aide extérieure.
- **SC-002**: 100 % des demandes valides envoyées parviennent à l'équipe Estuaire avec
  l'intégralité des champs et la pièce jointe le cas échéant.
- **SC-003**: 100 % des erreurs de saisie (champ obligatoire manquant, email invalide, pièce
  jointe non conforme) sont signalées avant transmission, sans perte de la saisie.
- **SC-004**: Le rendu de la page correspond à la maquette de référence sur desktop (revue
  pixel-perfect section par section validée), et reste cohérent sur tablette et mobile.
- **SC-005**: Un visiteur peut localiser Estuaire (adresse lisible + carte fonctionnelle) dès
  le premier affichage de la section coordonnées.
- **SC-006**: Un éditeur peut mettre à jour un texte, une coordonnée ou la liste des types de
  demande et voir le changement en ligne sans intervention technique.
- **SC-007**: Les soumissions automatisées de spam sont écartées tandis que les demandes
  humaines légitimes aboutissent (aucun faux blocage observé sur un parcours humain standard).

## Assumptions

Hypothèses retenues (informent la planification ; à confirmer/ajuster via `/speckit.clarify`) :

- **Destinataire des demandes** : les soumissions sont envoyées à l'adresse de contact
  publique d'Estuaire (`contact@estuaire.fr` d'après la maquette). Pas de stockage des
  soumissions côté site dans cette version (transmission par email uniquement).
- **Accusé de réception au visiteur** : confirmation à l'écran après envoi ; pas d'email de
  réponse automatique au visiteur dans cette version (extension possible ultérieurement).
- **Types de demande** : jeu de valeurs par défaut proposé (ex. *Demande de devis*,
  *Renseignement*, *Partenariat*, *Recrutement*, *Autre*), éditable dans le back-office — la
  maquette n'affiche qu'un libellé générique « Type de demande ».
- **Pièce jointe** : optionnelle, formats courants (PDF, images, documents bureautiques) et
  taille raisonnable plafonnée ; un seul fichier. Limites précises arrêtées en conception.
- **Carte** : carte interactive via un fournisseur de cartographie ; le choix précis de la
  solution est une décision de conception (`/speckit.plan`).
- **Coordonnées** : l'adresse et l'email sont déjà modélisés au niveau du pied de page ; la
  page contact réutilise/centralise cette source pour éviter la duplication (à arbitrer en
  conception).
- **Responsive** : faute de frame tablette/mobile dans la maquette contact, la déclinaison
  responsive est dérivée des conventions des autres pages du site.

## Dependencies

- Composants partagés existants : barre de navigation et pied de page.
- Service d'envoi d'email (à mettre en place — aucune infrastructure d'email transactionnel
  ni d'API de contact n'existe encore dans le projet).
- Fournisseur de cartographie pour la carte interactive.
- Source de contenu (back-office) pour les textes, coordonnées et types de demande.
