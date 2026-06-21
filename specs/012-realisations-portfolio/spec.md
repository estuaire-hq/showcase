# Feature Specification: Réalisations (portfolio + pages projet)

**Feature Branch**: `012-realisations-portfolio`
**Created**: 2026-06-20
**Status**: Draft
**Input**: User description: "Construire la fonctionnalité « Réalisations » du site Estuaire : page liste `/realisations` + page détail `/realisations/[slug]`, et rebrancher sur de vraies données les réalisations affichées en dur (home + 3 sous-pages d'expertises). Premier type Sanity de nature collection."

## Contexte

Le site Estuaire présente l'activité de menuisier-agenceur de la marque (agencement, mobilier et présentoirs sur mesure). Jusqu'ici, les « réalisations » (études de cas client) n'existaient que sous forme **mockée** : 3 cartes en dur sur la page d'accueil et 1 projet en dur sur chacune des 3 sous-pages d'expertises, toutes pointant vers une route `/realisations` **inexistante** (404 temporaire assumé).

Cette fonctionnalité crée la **vraie section Réalisations** : une page liste (portfolio filtrable) et une page détail par projet, alimentées par un nouveau type de contenu **collection** dans le CMS (le premier du projet — tout le reste est singleton). Elle remplace ensuite tous les contenus mockés par ces données réelles.

Le contenu provient d'un dossier client : un document de présentation (textes des 23 études de cas) et un dossier photos organisé par projet. Les maquettes desktop existent pour les trois écrans (liste, détail « version fournie », détail « version légère »).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Découvrir les réalisations et explorer un projet (Priority: P1)

Un visiteur (prospect, architecte, client potentiel) arrive sur la page Réalisations, voit les projets récents et le portfolio complet, puis ouvre une étude de cas pour comprendre en détail le contexte, l'enjeu, l'intervention, les défis relevés et les savoir-faire mobilisés, avec les photos du projet.

**Why this priority**: C'est le cœur de la valeur : montrer le travail réalisé. Sans la page liste qui mène à une page détail lisible, la fonctionnalité n'existe pas. C'est le MVP livrable et démontrable seul.

**Independent Test**: Avec au moins une réalisation publiée dans le CMS, naviguer vers `/realisations`, voir la réalisation listée, cliquer dessus, atterrir sur `/realisations/<slug>` et y lire l'intégralité du récit (contexte → enjeu → missions → défis → savoir-faire) avec ses images. Testable de bout en bout sans filtres ni intégrations externes.

**Acceptance Scenarios**:

1. **Given** des réalisations publiées existent, **When** le visiteur ouvre `/realisations`, **Then** il voit la section « Dernières Réalisations » (les 3 plus récentes en avant) puis la grille du portfolio, chaque entrée affichant l'image, le nom et — s'ils sont renseignés — le lieu, l'année et la superficie.
2. **Given** la page liste est affichée, **When** le visiteur clique sur une réalisation, **Then** il arrive sur la page détail correspondante (`/realisations/<slug>`) avec un fil d'ariane « réalisations / <nom du projet> ».
3. **Given** une page détail, **When** elle s'affiche, **Then** les sections apparaissent dans l'ordre : intro (contexte + enjeu), nos missions (interventions), défis relevés (1 à 3 blocs), crédit photo s'il existe, savoir-faire mobilisés (pastilles).
4. **Given** une réalisation marquée « version fournie » (beaucoup de photos), **When** la page détail s'affiche, **Then** l'intro inclut un carrousel photo (grande visuelle + navigation précédent/suivant) ; **Given** une réalisation « version légère », **Then** l'intro est compacte, sans carrousel.
5. **Given** une page détail, **When** le visiteur cherche à poursuivre, **Then** une navigation « précédent / suivant » lui permet de passer à une autre réalisation.
6. **Given** une réalisation sans crédit photo, **When** la page détail s'affiche, **Then** aucun bloc crédit photo n'apparaît (et aucun espace vide).

---

### User Story 2 — Filtrer et parcourir le portfolio (Priority: P2)

Un visiteur veut affiner le portfolio pour ne voir que les projets qui l'intéressent : par univers (secteur d'activité du client), par expertise ou par client. Il peut aussi charger davantage de résultats au-delà des premiers affichés.

**Why this priority**: Avec 20+ projets, le tri augmente fortement l'utilité de la page, mais la liste reste consultable sans (US1 livre déjà de la valeur). C'est donc un enrichissement prioritaire mais non bloquant.

**Independent Test**: Sur `/realisations`, activer un filtre d'univers et vérifier que seules les réalisations de cet univers restent ; combiner avec un filtre ; déclencher « charger d'autres réalisations » et voir d'autres entrées apparaître ; choisir un filtre sans résultat et voir l'état vide.

**Acceptance Scenarios**:

1. **Given** la barre de filtres (onglets Univers · Expertises · Clients), **When** le visiteur choisit un univers, **Then** la grille n'affiche que les réalisations publiées de cet univers.
2. **Given** un filtre actif, **When** le visiteur sélectionne « Tous les univers » (ou réinitialise), **Then** l'ensemble des réalisations publiées réapparaît.
3. **Given** plus de réalisations que le nombre affiché par défaut, **When** le visiteur clique « charger d'autres réalisations », **Then** des réalisations supplémentaires s'affichent sans quitter la page.
4. **Given** une combinaison de filtres qui ne correspond à aucune réalisation publiée, **When** le résultat est vide, **Then** un message d'état vide invitant à prendre contact s'affiche, avec un bouton « contactez-nous ».
5. **Given** un univers sans aucune réalisation publiée, **When** le visiteur le filtre, **Then** un message « revenez bientôt » s'affiche pour cet univers.

---

### User Story 3 — Réalisations réelles intégrées au reste du site (demock) (Priority: P2)

Les emplacements qui affichent aujourd'hui des réalisations en dur (page d'accueil et sous-pages d'expertises) affichent désormais de vraies réalisations issues du CMS, et leurs liens mènent à la vraie section Réalisations.

**Why this priority**: Supprime des données mockées et des liens en 404 visibles publiquement. Dépend de l'existence des réalisations (US1) mais apporte une valeur de cohérence forte sur tout le site.

**Independent Test**: Sur la page d'accueil, vérifier que les cartes « réalisations » correspondent aux 3 plus récentes réalisations publiées et que les boutons d'univers mènent à `/realisations` filtré ; sur chaque sous-page d'expertise, vérifier que le projet mis en avant est la réalisation publiée la plus récente de cette expertise et que son bouton mène à `/realisations`.

**Acceptance Scenarios**:

1. **Given** des réalisations publiées, **When** la page d'accueil s'affiche, **Then** la section réalisations présente les 3 réalisations publiées les plus récentes (et non plus des cartes en dur).
2. **Given** la page d'accueil, **When** le visiteur clique un bouton d'univers, **Then** il atterrit sur `/realisations` filtré sur cet univers.
3. **Given** une sous-page d'expertise, **When** elle s'affiche, **Then** la section « cas study » met en avant la réalisation publiée la plus récente associée à cette expertise (image, nom, méta), et son bouton mène vers `/realisations` filtré sur l'expertise.
4. **Given** aucune réalisation publiée pour une expertise donnée, **When** sa sous-page s'affiche, **Then** la section « cas study » se comporte de façon dégradée propre (pas de lien cassé ni de bloc vide incohérent).

---

### User Story 4 — Gérer les réalisations dans le CMS (Priority: P3)

Un éditeur (équipe Estuaire) crée et gère les réalisations depuis le Studio : rédige le récit, classe le projet (univers, expertises, client), renseigne les infos complémentaires, choisit la variante d'affichage et le statut, et ordonne/ajoute des photos — sans intervention de développeur.

**Why this priority**: Indispensable à terme pour l'autonomie éditoriale, mais le contenu initial des 23 études de cas est pré-rempli par seed ; l'édition fine peut suivre. Donc prioritaire mais après l'affichage public.

**Independent Test**: Dans le Studio, créer une réalisation, la passer en « publié », ajouter des images et un statut, et vérifier que la page liste et la page détail reflètent le changement après revalidation.

**Acceptance Scenarios**:

1. **Given** le Studio, **When** l'éditeur crée une réalisation et la publie, **Then** elle apparaît sur `/realisations` et dispose d'une page détail accessible.
2. **Given** une réalisation, **When** l'éditeur la marque « à venir », **Then** elle apparaît en aperçu grisé/non cliquable dans la liste mais n'a pas de page détail publique.
3. **Given** une réalisation, **When** l'éditeur la laisse « brouillon », **Then** elle n'apparaît nulle part publiquement.
4. **Given** une réalisation, **When** l'éditeur laisse vide le lieu, l'année ou la superficie, **Then** ces informations sont simplement masquées à l'affichage (pas d'étiquette vide).
5. **Given** une réalisation, **When** l'éditeur change sa variante (fournie/légère), **Then** la page détail adopte la mise en page correspondante.

---

### Edge Cases

- **Univers sans réalisation publiée** (ex. Hôtellerie & restauration) → message « revenez bientôt », pas de grille vide.
- **Réalisation « à venir »** (ex. Cambaceres, Ibis — projets annoncés mais sans contenu) → aperçu grisé non cliquable dans la liste, pas de page détail.
- **Réalisation « brouillon »** (ex. Bureaux Lumière, Bureaux Publicis — titres seuls, contenu à finaliser) → invisible publiquement.
- **Réalisation à 1 seul défi** vs 2 vs 3 → la section « défis relevés » s'adapte au nombre réel de blocs.
- **Très peu de photos** (2) vs **beaucoup** (26) → la composition d'images et le carrousel doivent rester cohérents dans les deux cas.
- **Crédit photo absent** → aucun bloc crédit.
- **Infos complémentaires partielles** (ex. lieu + année sans superficie) → n'afficher que ce qui est renseigné.
- **Navigation précédent/suivant** sur la première / dernière réalisation → comportement défini (boucle ou bornes, sans lien cassé).
- **Slug en doublon ou caractères spéciaux** (accents, apostrophes) → slugs uniques et URL propres.
- **Image manquante sur une réalisation publiée** → visuel de repli neutre, jamais d'image cassée.
- **NVH** publié avec des photos basse définition existantes → accepté tel quel, remplaçable plus tard.

## Requirements *(mandatory)*

### Functional Requirements

**Type de contenu & modèle**

- **FR-001**: Le système MUST introduire un type de contenu « réalisation » sous forme de **collection** (plusieurs documents distincts, chacun avec une URL propre), distinct des contenus singleton existants.
- **FR-002**: Chaque réalisation MUST porter : un nom de projet, un identifiant d'URL (slug) unique, un nom de client (distinct du nom de projet et éditable), un statut (publié | à venir | brouillon).
- **FR-003**: Chaque réalisation MUST porter un classement : exactement un **univers** parmi une liste contrôlée de 12 secteurs-clients, une ou plusieurs **expertises** parmi les 3 expertises existantes du site, et une donnée d'ordonnancement permettant de déterminer les « plus récentes ».
- **FR-004**: Chaque réalisation MUST pouvoir porter des informations complémentaires optionnelles : lieu, année, superficie — affichées uniquement si renseignées.
- **FR-005**: Chaque réalisation MUST porter le récit structuré : contexte, enjeu, liste d'interventions (« nos missions »), 1 à 3 défis (chacun = titre + corps), savoir-faire mobilisés (liste de pastilles), et un crédit photo optionnel.
- **FR-006**: Chaque réalisation MUST porter une variante d'affichage « fournie » ou « légère » sous forme de champ explicite et éditable.
- **FR-007**: Chaque réalisation MUST porter une image principale (cover) et une galerie ordonnée d'images, dimensionnée pour gérer de 2 à 26 photos.
- **FR-008**: Les 12 univers du filtre MUST être : Banque & assurance, Culture, Hôtellerie & restauration, Joaillerie, Mode, Optique, Parfums, Résidentiel, Soin & cosmétique, Spiritueux, Sport & lifestyle, Technologie & communication.

**Page liste `/realisations`**

- **FR-009**: Le système MUST exposer une page liste à l'URL `/realisations`.
- **FR-010**: La page liste MUST présenter une section « Dernières Réalisations » mettant en avant les 3 réalisations publiées les plus récentes.
- **FR-011**: La page liste MUST présenter le portfolio des réalisations publiées sous forme de grille, avec affichage progressif (un sous-ensemble visible + action « charger d'autres réalisations »).
- **FR-012**: La page liste MUST proposer un filtrage par Univers, par Expertise et par Client.
- **FR-013**: Le filtrage MUST n'afficher que des réalisations **publiées** ; il MUST pouvoir être réinitialisé (« tous »).
- **FR-014**: Lorsqu'un filtre ne renvoie aucun résultat, la page MUST afficher un état vide invitant à la prise de contact (avec un bouton de contact).
- **FR-015**: Pour un univers sans réalisation publiée, le système MUST afficher un message « revenez bientôt » plutôt qu'une grille vide.
- **FR-016**: Chaque carte de la liste MUST afficher l'image, le nom et les informations complémentaires renseignées (lieu, année, superficie).
- **FR-017**: Les réalisations « à venir » MUST apparaître en aperçu visuellement atténué et non cliquable ; les « brouillon » MUST être absentes de l'affichage public.

**Page détail `/realisations/[slug]`**

- **FR-018**: Le système MUST exposer une page détail par réalisation publiée à l'URL `/realisations/<slug>`.
- **FR-019**: La page détail MUST afficher, dans l'ordre : fil d'ariane (« réalisations / <projet> »), intro (contexte + enjeu), nos missions, défis relevés, crédit photo (si présent, **entre** le dernier défi et les savoir-faire), savoir-faire mobilisés.
- **FR-020**: La page détail MUST adopter la mise en page correspondant à la variante de la réalisation : « fournie » = intro avec carrousel photo (grande visuelle + navigation précédent/suivant) ; « légère » = intro compacte sans carrousel ; le reste des sections est identique entre les deux.
- **FR-021**: La page détail MUST proposer une navigation précédent/suivant entre réalisations.
- **FR-022**: Une URL de réalisation non publiée (à venir / brouillon) ou inexistante MUST mener à un comportement défini (page introuvable propre), jamais à une page cassée.

**Intégration au reste du site (demock)**

- **FR-023**: La page d'accueil MUST afficher, dans sa section réalisations, les 3 réalisations publiées les plus récentes issues du CMS (en remplacement des cartes en dur) ; ses boutons d'univers MUST mener à `/realisations` filtré sur l'univers correspondant.
- **FR-024**: Chaque sous-page d'expertise MUST mettre en avant, dans sa section « cas study », la réalisation publiée la plus récente associée à cette expertise (image, nom, méta), avec un bouton menant à `/realisations` filtré sur l'expertise.
- **FR-025**: Aucun lien vers `/realisations` (ni `/realisations/<slug>`) ne MUST aboutir en 404 une fois la fonctionnalité livrée avec au moins une réalisation publiée par cible.
- **FR-026**: La fonctionnalité MUST NE PAS modifier les pages de secteurs `/univers/<secteur>` (hors périmètre) ni leur taxonomie à 4 macro-secteurs.

**Contenu & édition**

- **FR-027**: Le système MUST permettre de peupler les 23 études de cas du dossier client (21 à contenu complet publiables, 2 brouillons à finaliser, 2 « à venir »).
- **FR-028**: Le système MUST permettre l'édition complète d'une réalisation par un éditeur depuis le Studio, sans intervention de développeur, et la mise à jour des pages doit se refléter après revalidation.
- **FR-029**: Le rattachement initial aux expertises (absent du document source) MUST être pré-rempli par une estimation raisonnable, puis restable/corrigeable par l'éditeur.
- **FR-030**: Les images sources MUST être intégrées avec un nommage optimisé SEO (`estuaire-agencement-<client>-<numéro>`), sans altérer le dossier source du client.

**Responsive & qualité visuelle**

- **FR-031**: Les pages liste et détail MUST être responsives (desktop, tablette, mobile), le responsive étant interprété par breakpoint à partir des maquettes desktop disponibles.
- **FR-032**: Les écrans bâtis depuis les maquettes MUST être validés en revue pixel-perfect contre la référence design avant clôture.

### Key Entities *(include if feature involves data)*

- **Réalisation (étude de cas)** : un projet client présenté en portfolio. Attributs : nom de projet, slug, client, statut (publié/à venir/brouillon), univers (1 parmi 12), expertises (parmi 3), ordre/date pour le « plus récent », infos complémentaires optionnelles (lieu, année, superficie), variante d'affichage (fournie/légère), récit (contexte, enjeu, interventions, 1–3 défis {titre, corps}, savoir-faire, crédit photo optionnel), image de couverture + galerie ordonnée. Relations : référence une ou plusieurs **Expertises** ; appartient à un **Univers**.
- **Univers (secteur-client)** : l'une des 12 catégories de filtrage. Distinct des 4 macro-secteurs de la page `/univers` (hors périmètre).
- **Expertise** : l'une des 3 expertises existantes du site (agencement / mobiliers / présentoirs sur mesure), réutilisée comme dimension de filtre et cible de rattachement des réalisations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visiteur peut, depuis `/realisations`, atteindre le détail complet d'une étude de cas en 1 clic.
- **SC-002**: 100 % des liens « réalisations » présents sur le site (accueil, sous-pages d'expertises, fil d'ariane, navigation) aboutissent à une page valide (zéro 404) une fois la fonctionnalité livrée.
- **SC-003**: Les 21 études de cas à contenu complet sont consultables (liste + détail) avec leur récit et leurs photos.
- **SC-004**: Le filtrage par univers/expertise/client renvoie un résultat (liste filtrée ou état vide explicite) de façon perçue comme instantanée, sans rechargement de page.
- **SC-005**: La page d'accueil et les 3 sous-pages d'expertises n'affichent plus aucune réalisation en dur : 100 % de leur contenu réalisation provient du CMS.
- **SC-006**: Un éditeur peut créer et publier une nouvelle réalisation de bout en bout depuis le Studio sans assistance technique.
- **SC-007**: Les pages liste et détail sont validées en revue pixel-perfect sur desktop, et fonctionnelles/cohérentes sur tablette et mobile.
- **SC-008**: Les deux variantes d'affichage (fournie avec carrousel / légère sans carrousel) et les nombres de défis (1 à 3) s'affichent correctement, vérifiés sur au moins un exemple de chaque.

## Assumptions

- Le périmètre couvre **uniquement** la section Réalisations et le rebranchement de ses points d'affichage (accueil + sous-pages d'expertises). Les pages de secteurs `/univers/<secteur>` ne listent pas de réalisations (décision actée, hors périmètre).
- La taxonomie de filtrage « Univers » du portfolio (12 secteurs-clients) est **distincte** des 4 macro-secteurs de la page `/univers`. Un éventuel renommage de l'onglet « Univers » en « Secteurs » pour lever l'ambiguïté est laissé à l'appréciation lors du design (non bloquant).
- La règle de choix fournie/légère (à tracer pour cohérence future) : « fournie » lorsque la réalisation dispose d'assez de photos pour remplir la composition standard **et** alimenter un carrousel (~≥ 9 photos exploitables) ; « légère » sinon. Pré-réglée au seed depuis le nombre de photos, surclassable par l'éditeur.
- Le « plus récent » (3 sur l'accueil, 3 en « Dernières Réalisations », 1 par expertise) s'appuie sur la donnée d'ordonnancement/date des réalisations ; aucune sélection manuelle de mise en avant n'est requise pour cette version.
- Le rattachement aux expertises est pré-rempli par estimation (la plupart = agencement ; mobiliers pour les projets centrés objet/mobilier ; présentoirs pour la PLV), confirmé par les projets déjà mis en avant sur les sous-pages d'expertises, puis ajustable dans le Studio.
- Les tâches de finalisation côté client (révision de certains titres, complétion des infos lieu/année/superficie, finalisation des 2 brouillons) sont **non bloquantes** : les champs vides restent masqués et sont complétés dans le Studio après livraison.
- NVH est publié avec ses photos basse définition actuelles, remplaçables ultérieurement.

## Out of Scope

- Modification des pages `/univers/<secteur>` et de leur taxonomie (4 macro-secteurs).
- Listing de réalisations à l'intérieur des pages de secteurs (mapping 12 univers → 4 secteurs).
- Sélection manuelle/éditoriale des projets mis en avant (au-delà du « plus récent » automatique).
- Production de nouvelles photos (ex. shooting NVH) et rédaction du contenu des 2 brouillons (Lumière, Publicis) — côté client.
- Fonctionnalités de recherche plein texte ou de pagination paginée classique (le portfolio utilise un « charger d'autres » incrémental).
