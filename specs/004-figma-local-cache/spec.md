# Spécification : Cache Figma local & lecteur offline (remplacement du MCP Figma)

**Branche**: `004-figma-local-cache`
**Créée le**: 2026-06-11
**Statut**: Draft
**Contexte**: Le MCP Figma (Dev Mode) est plafonné par des quotas très restrictifs (plan Starter),
ce qui bloque régulièrement la lecture des nodes au moment d'implémenter une page/section en
pixel-perfect. L'idée : **collecter toute la maquette d'un coup** depuis Figma (le moins d'appels
possible), la **stocker en local**, puis **lire les nodes localement** — sans aucun appel à Figma.
La lecture locale est *le vrai remplacement du MCP*. Le développeur et l'agent **associent ensemble**
un nom de page/section/fonction à un node, pour pouvoir lire « le hero de la home » plutôt que de
retenir des identifiants bruts comme `51:2339`.

> **Note d'existant & cap d'industrialisation** — Un socle **prototype** existe déjà sous
> `.design/scripts/` : `figma-pull.mjs` (collecte le JSON des nodes + images dans
> `.design/figma-data/nodes.json`, un **monolithe** de ~2,3 Mo regroupant plusieurs roots) et
> `figma-node.mjs` (lit un sous-arbre complet en local, sans API). Cette feature vise à
> **l'industrialiser nettement** : le nouveau système devient l'**unique chaîne canonique** —
> les scripts utiles sont **absorbés/migrés**, les redondants retirés (clarif. 2026-06-11). Les
> **invariants** (le besoin, ce que la spec fige) sont :
> (1) **un minimum de requêtes — idéalement une seule** — pour rapatrier toute la page du fichier ;
> (2) cette collecte unique est **ensuite découpée en plusieurs fichiers locaux**, chacun **décrit**,
> pour un cache **bien plus lisible et exploitable par une IA** (charger exactement la partie utile,
> savoir ce qu'on lit) — pas seulement un contournement de quota.
>
> ⚠️ **Solution non figée** : « un fichier **par frame** » est la **piste principale envisagée**, pas
> une exigence. La *façon* de découper (unité, structure, format) reste **ouverte pour le
> `/speckit.plan`**, qui pourra retenir une meilleure approche tant que les invariants ci-dessus
> tiennent. Dans la suite, « frame » désigne l'unité de découpe candidate.

## Clarifications

### Session 2026-06-11

- Q: Sous quelle forme l'agent consomme-t-il le lecteur local (le « remplacement du MCP ») ? → A: **Commandes CLI locales** (faire évoluer l'approche `figma-node.mjs`), invoquées via Bash — **pas** de serveur MCP local, aucun cycle de vie serveur à gérer.
- Q: Que récupère une collecte « en une requête » ? → A: **Une page Figma désignée** (la page de design principale = la maquette), pas le fichier entier ni une liste de frames. Les autres pages du fichier (brouillons, archives) sont hors périmètre.
- Q: Le nouveau système remplace-t-il les scripts `.design/scripts/` actuels ou coexiste-t-il ? → A: **Remplacer / faire évoluer** : le nouveau système est l'**unique chaîne canonique**. Les scripts utiles (collecte, lecture, rendu, image-fills, inventaire KIT) sont **absorbés/migrés**, les redondants **retirés**, et la skill `estuaire-figma` est **mise à jour** pour pointer sur les nouvelles commandes.

### Session 2026-06-12

- Q: Faut-il une commande `render` (rendu Figma ad hoc pour l'étape *verify*) dans la chaîne ? → A: **Non — retirée du périmètre**. Les **captures de référence** pour le diff pixel-perfect sont **fournies manuellement** par le développeur (PNG exportés de Figma). Affine la clarif. 2026-06-11 : « rendu » n'est **pas** migré vers l'outil ; `figma-render.mjs` est **supprimé**. La collecte des **images placées** dans la maquette (image-fills, EF-008) reste, elle, dans le périmètre.
- Q: Faut-il régénérer un inventaire KIT (`kit-inventory.md`) ? → A: **Non — retiré du périmètre**. Puisque `collect` rapatrie **toute la page d'un coup** (KIT inclus, frame `75:2963`), le KIT se lit **en lossless via `read`** + des cibles nommées `kit/…` dans l'index — plus besoin d'une MAP dérivée. Affine la clarif. 2026-06-11 : « inventaire KIT » n'est **pas** migré ; `kit-inventory.mjs` et `kit-inventory.md` sont **supprimés**. La chaîne canonique se réduit à **4 commandes** : `collect`/`read`/`list`/`status`.

## Scénarios utilisateur & tests *(obligatoire)*

<!--
  Histoires priorisées (P1 = le plus critique). Chacune doit être testable indépendamment :
  si on n'implémente qu'elle, on a déjà un incrément utile.
-->

### Scénario 1 — Lire n'importe quel node en local, sans quota (Priorité : P1)

L'agent (ou le développeur) doit implémenter une section en pixel-perfect. Plutôt que d'interroger
le MCP Figma — souvent en échec de quota —, il demande au système **toutes les données d'un node**
(géométrie exacte parent-relative, texte, typographie, fills/strokes, rayons, opacités de calque,
auto-layout, effets, overrides par caractère, et le **sous-arbre complet**) à partir du **cache
local**. La réponse est **instantanée, exhaustive (sans perte de champ) et n'engendre aucun appel à
Figma**. C'est le remplacement direct du MCP.

**Pourquoi cette priorité** : c'est le cœur de la valeur. Sans lecture locale fiable et exhaustive,
le travail pixel-perfect reste otage des quotas Figma. Cette histoire seule, sur un cache déjà
présent, débloque tout le flux de build.

**Test indépendant** : déconnecter tout accès réseau à Figma, demander les données d'un node connu
du cache → obtenir le sous-arbre complet avec tous les champs ; comparer le nombre de nodes et un
échantillon de valeurs (position, opacité, fontSize, rayon) à la source → identiques.

**Scénarios d'acceptation** :

1. **Étant donné** un cache local peuplé, **quand** on demande les données d'un node par son
   identifiant, **alors** le système renvoie le sous-arbre complet de ce node avec **tous** ses
   champs, sans aucun appel réseau.
2. **Étant donné** un node de type TEXT avec des styles par caractère, **quand** on le lit,
   **alors** les overrides par caractère (couleur, contour, graisse) sont restitués.
3. **Étant donné** un identifiant absent du cache, **quand** on le demande, **alors** le système
   répond par une erreur explicite indiquant que le node doit d'abord être collecté (et non un
   résultat partiel ou silencieux).
4. **Étant donné** une demande de lecture, **quand** on la sert, **alors** **zéro** appel à Figma
   est émis (vérifiable hors-ligne).

---

### Scénario 2 — Collecter en un minimum de requêtes, puis découper le cache (Priorité : P2)

Le développeur lance **une seule opération** qui récupère **toute la page de design désignée** (la
maquette) en **un minimum d'appels** à Figma — **idéalement une seule requête** — puis **éclate ce
résultat unique en plusieurs fichiers locaux** individuellement lisibles (découpe
**par frame** envisagée), chacun **autonome** et **léger** comparé au monolithe actuel. La collecte
récupère aussi les **images placées**. Relancée plus tard, l'opération **rafraîchit** le cache sans
re-télécharger l'inchangé ; une coupure de quota laisse un cache **partiel exploitable** et
**reprenable**.

**Pourquoi cette priorité** : la lecture (P1) n'a de valeur que sur un cache à jour, et un cache
**par frame** est ce qui le rend exploitable par une IA (charger la bonne frame, pas 2,3 Mo). La
collecte « one-shot » et économe en quota garantit qu'on n'est plus jamais bloqué pendant un build.

**Test indépendant** : sur un cache vide, lancer la collecte une fois → vérifier qu'on obtient **un
fichier par frame** (chacun lisible isolément, contenant l'arbre complet de sa frame) + les images,
avec un nombre d'appels réseau **borné et faible**.

**Scénarios d'acceptation** :

1. **Étant donné** un cache vide, **quand** on lance la collecte, **alors** la maquette est récupérée
   en un **nombre d'appels borné (idéalement une requête)** puis **découpée en plusieurs fichiers**
   individuellement lisibles, chacun contenant le sous-arbre **complet** de son unité.
2. **Étant donné** un fichier de cache, **quand** on l'ouvre isolément, **alors** il est
   **autosuffisant** (lisible sans charger les autres unités ni le reste de la maquette).
3. **Étant donné** un cache déjà peuplé, **quand** on relance la collecte, **alors** le contenu
   inchangé n'est pas re-téléchargé (assets déjà présents conservés/sautés).
4. **Étant donné** un plafond de quota atteint en cours de collecte, **quand** l'erreur survient,
   **alors** le système conserve ce qui a été collecté, le signale clairement, et une relance
   **reprend** là où elle s'était arrêtée.
5. **Étant donné** le cache produit, **quand** on inspecte le dépôt, **alors** les fichiers de frames
   (texte/JSON) et l'index sont **versionnés** — un checkout neuf ou la CI lit sans token ni appel.

---

### Scénario 3 — Index nommé et **décrit**, lisible par une IA (Priorité : P3)

Le développeur et l'agent **maintiennent ensemble** un **index** qui, pour chaque frame, associe un
**nom métier** (p. ex. « home/hero », « footer », « kit/bouton-envoyer »), une **description en clair
de ce que c'est** (« hero de la home, variante desktop »), l'**identifiant de node**, et les
**variantes responsive** (mobile / tablette / desktop). Cet index est le **point d'entrée** : une IA
y lit *quelles frames existent et ce qu'elles représentent*, puis charge le bon fichier — sans
mémoriser `51:2339` ni deviner le contenu d'un fichier.

**Pourquoi cette priorité** : c'est ce qui transforme un dump technique en **cache compréhensible**.
La description par frame est exactement le levier de lisibilité IA demandé. Utile mais non bloquant :
on peut lire par identifiant (P1) sans l'index.

**Test indépendant** : ajouter une entrée d'index « home/hero → \<id\>, desc, variantes », puis (a)
lire la cible **par son nom**, (b) lister l'index → on retrouve le nom **et** sa description, et la
lecture par nom renvoie les mêmes données que par identifiant.

**Scénarios d'acceptation** :

1. **Étant donné** une entrée « home/hero → \<id\> » avec description, **quand** on lit « home/hero »,
   **alors** le système renvoie les données du node correspondant.
2. **Étant donné** l'index, **quand** une IA le consulte, **alors** elle obtient pour **chaque** frame
   un nom **et** une description en clair de ce qu'elle représente (aucune frame anonyme).
3. **Étant donné** une cible déclarée avec 3 variantes responsive, **quand** on lit la cible pour un
   breakpoint donné, **alors** le node/fichier de ce breakpoint est servi.
4. **Étant donné** un nom absent ou ambigu, **quand** on le résout, **alors** le système le signale
   (nom inconnu / ambiguïté) au lieu de choisir arbitrairement.

---

### Scénario 4 — Savoir quand le cache est périmé (Priorité : P4)

Avant de s'appuyer sur le cache, le développeur (ou l'agent) peut vérifier en **un geste** si la
copie locale est **à jour** par rapport à la maquette Figma. Le système compare l'état local à
l'état distant (date de dernière modification de la source) et indique clairement « à jour » ou
« périmé — relancer la collecte ». Le rafraîchissement reste **manuel / à la demande** (« quand
nécessaire »), jamais automatique en continu.

**Pourquoi cette priorité** : évite deux écueils symétriques — bâtir sur des données obsolètes sans
le savoir, ou re-collecter inutilement (et brûler du quota). C'est un confort qui sécurise P1/P2 ;
non indispensable au premier incrément.

**Test indépendant** : modifier la maquette côté Figma, lancer la vérification de fraîcheur → le
système rapporte « périmé » ; après une nouvelle collecte → il rapporte « à jour ».

**Scénarios d'acceptation** :

1. **Étant donné** un cache aligné sur la source, **quand** on vérifie la fraîcheur, **alors** le
   système rapporte « à jour ».
2. **Étant donné** une maquette modifiée depuis la dernière collecte, **quand** on vérifie la
   fraîcheur, **alors** le système rapporte « périmé » et recommande une collecte.
3. **Étant donné** l'absence d'accès réseau, **quand** on vérifie la fraîcheur, **alors** le système
   le signale (état « inconnu ») sans planter ni invalider le cache local.

---

### Cas limites

- **Maquette modifiée depuis la dernière collecte** : la lecture sert des données obsolètes ; le
  système doit pouvoir signaler la péremption (Scénario 4), mais ne bloque pas la lecture.
- **Frame sans description dans l'index** : signalé comme incomplet (l'objectif « aucune frame
  anonyme » n'est pas atteint) plutôt que toléré silencieusement.
- **Index désynchronisé du cache** : un fichier de frame présent sans entrée d'index (ou l'inverse)
  est détecté et signalé.
- **Entrée d'index pointant vers un node non collecté** : la résolution du nom réussit mais la
  lecture échoue proprement (« node absent du cache — collecter d'abord »).
- **Node présent mais image non téléchargée** (rendu coupé par le quota) : les données géométriques
  restent lisibles ; l'asset manquant est signalé, pas inventé.
- **429 / quota atteint pendant la collecte** : cache partiel conservé, relance reprenable, message
  explicite (jamais un cache corrompu ou à moitié écrit).
- **Node renommé ou supprimé dans Figma** : une association par identifiant reste valide tant que le
  node existe ; une association par nom peut casser → la vérification de fraîcheur / re-collecte doit
  permettre de le détecter.
- **Frame très volumineuse** : le découpage par frame borne la taille de chaque fichier ; une frame
  exceptionnellement lourde reste lisible (pas de retour au monolithe).
- **Cible responsive incomplète** : un nom déclaré avec des variantes manquantes (p. ex. pas de
  frame tablette) répond clairement « variante absente » pour le breakpoint concerné.
- **Identifiants à séparateurs spéciaux** (`:` / `;`) : la correspondance node ↔ fichier ↔ asset
  reste univoque (pas de collision de noms de fichiers).

## Exigences *(obligatoire)*

### Exigences fonctionnelles

**Lecture locale (le remplacement du MCP) — P1**

- **EF-001** : Le système DOIT restituer, pour un node demandé, son **sous-arbre complet** avec la
  **totalité des champs** présents à la source (géométrie parent-relative, dimensions, opacité de
  calque, fills/strokes + poids/alignement, rayons, auto-layout, effets, style de texte complet et
  overrides par caractère), **sans présélection ni perte** (lecture *lossless*).
- **EF-002** : Le système DOIT servir toute lecture **sans émettre aucun appel** au service Figma
  (fonctionne entièrement hors-ligne sur le cache).
- **EF-003** : Le système DOIT permettre de **borner la lecture** (profondeur, feuilles seulement)
  pour cibler une partie d'un sous-arbre, sans jamais altérer l'exhaustivité par défaut.
- **EF-004** : Le système DOIT indiquer le **nombre total de nodes** d'un sous-arbre lu (sert de
  checklist de complétude pour le build pixel-perfect).
- **EF-005** : Pour un identifiant **absent du cache**, le système DOIT répondre par une **erreur
  explicite** invitant à collecter, et ne JAMAIS renvoyer un résultat partiel silencieux.

**Collecte & découpe du cache — P2**

- **EF-006** : Le système DOIT permettre de **collecter en une seule opération** une **page Figma
  désignée** (la maquette principale) avec un **nombre d'appels Figma minimal — idéalement une seule
  requête** (collecte et stockage **découplés** : récupération en masse, puis découpe locale). Les
  autres pages du fichier sont hors périmètre.
- **EF-007** : Le système DOIT **découper le résultat de collecte en plusieurs fichiers locaux**,
  chacun **autonome** (sous-arbre complet de son unité) et lisible sans charger les autres. *(Unité de
  découpe : la **frame** est le candidat principal ; le choix exact relève du `/speckit.plan`.)*
- **EF-008** : La collecte DOIT récupérer **à la fois** les données structurelles des nodes **et**
  les **images placées** nécessaires au build (rendus et/ou sources d'image).
- **EF-009** : Une nouvelle collecte DOIT **rafraîchir** le cache en **évitant de re-télécharger**
  les assets déjà présents et inchangés.
- **EF-010** : Le système DOIT **résister aux coupures de quota** : sur erreur de limite, conserver
  le cache déjà constitué, le signaler clairement, et permettre une **reprise** ultérieure.
- **EF-011** : Les **fichiers de frames et l'index** DOIVENT être **versionnables** (formats
  texte/JSON) afin qu'un checkout neuf ou la CI puisse lire **sans token ni appel** Figma ; les
  binaires lourds non nécessaires au dépôt restent hors-versionnement (conforme aux conventions
  `.design/` existantes).

**Index nommé & décrit (lisible par une IA) — P3**

- **EF-012** : Le système DOIT maintenir un **index** des frames, **maintenu manuellement** par le
  développeur et l'agent, servant de **point d'entrée** au cache.
- **EF-013** : Chaque entrée d'index DOIT porter un **nom métier**, une **description en clair** de
  ce que la frame représente, l'**identifiant de node**, et ses **variantes responsive** éventuelles.
- **EF-014** : Une cible nommée DOIT pouvoir porter **jusqu'à 3 variantes responsive** (mobile /
  tablette / desktop) et le système DOIT servir la variante demandée.
- **EF-015** : Le système DOIT permettre de **lire une cible par son nom** et renvoyer exactement les
  mêmes données qu'une lecture par identifiant brut.
- **EF-016** : Le système DOIT **lister les cibles connues** (nom, description, node, variantes) pour
  qu'une IA découvre *ce qui existe et ce que c'est* sans ouvrir les fichiers.
- **EF-017** : Le système DOIT signaler clairement un **nom inconnu** et un **nom ambigu** plutôt que
  de résoudre arbitrairement.
- **EF-018** : Le système DOIT pouvoir **détecter les incohérences** entre l'index et les fichiers de
  frames (frame sans entrée, entrée sans fichier, frame sans description).

**Fraîcheur du cache — P4**

- **EF-019** : Le système DOIT permettre de **comparer l'état du cache local** à l'état de la source
  (date de dernière modification) et rapporter **à jour / périmé / inconnu**.
- **EF-020** : Le rafraîchissement DOIT rester **à la demande** (déclenché explicitement), jamais en
  continu/automatique.
- **EF-021** : Le système DOIT exposer des **métadonnées de collecte** (identifiant de fichier
  source, date de dernière modification source, horodatage de collecte) lisibles localement.

### Entités clés

- **Cache de design** : la représentation locale complète de la maquette — un **ensemble de fichiers
  découpés** + un **index** + des métadonnées de collecte. Source unique de la lecture locale.
- **Unité de découpe (candidat : la frame)** : la portion de maquette qu'un fichier de cache couvre
  isolément ; porteuse d'un **sous-arbre complet** et d'une **description**. Le candidat principal est
  la **frame** (artboard / frame de premier niveau : variante de page ou bloc majeur) ; l'unité exacte
  sera fixée au `/speckit.plan`.
- **Node** : un élément de design avec l'ensemble exhaustif de ses champs (type, géométrie, styles,
  texte, effets, layout) et son sous-arbre d'enfants, au sein d'une frame.
- **Asset d'image** : une image placée dans la maquette, stockée localement, reliée de façon univoque
  au node qui la porte.
- **Entrée d'index (mapping)** : `nom métier + description + identifiant(s) de node`, avec
  optionnellement des variantes par breakpoint (mobile/tablette/desktop). Maintenue collaborativement.
- **Métadonnées de collecte** : informations permettant de détecter la péremption (identifiant du
  fichier source, dernière modification de la source, horodatage de la dernière collecte).

## Critères de succès *(obligatoire)*

### Résultats mesurables

- **CS-001** : **100 %** des champs présents dans un node source sont disponibles en local après
  collecte (lecture *lossless* — aucun champ perdu sur un échantillon de contrôle).
- **CS-002** : Une lecture de node engendre **0** appel au service de design (vérifiable hors-ligne).
- **CS-003** : Le temps pour obtenir les données complètes d'un node passe d'un état « bloqué par le
  quota / plusieurs secondes avec relances » à **moins d'1 seconde** en local.
- **CS-004** : Un **rafraîchissement complet** de la maquette s'effectue via **une seule commande**
  et un **nombre d'appels borné** (pas un appel par node).
- **CS-005** : Lire/charger une unité ne charge **que** les données de cette unité (taille bornée,
  sans charger le monolithe ni les autres unités).
- **CS-006** : Depuis l'index seul, une IA identifie la **bonne unité** pour une section du site
  donnée **en une étape**, grâce au nom + à la description (sans ouvrir les fichiers).
- **CS-007** : **100 %** des unités du cache portent une **description** (aucune unité anonyme).
- **CS-008** : Le développeur ou l'agent obtient les données d'une **cible nommée en une étape**,
  **sans connaître** l'identifiant brut du node ; déclarer une **nouvelle cible** prend **moins d'1
  minute** et **une seule** édition de l'index.
- **CS-009** : Sur un **checkout neuf sans token Figma**, la lecture locale d'une frame déjà
  collectée **réussit** (cache + index versionnés).
- **CS-010** : La vérification de fraîcheur classe correctement « à jour » vs « périmé » sur **100 %**
  des cas testés (cache aligné / maquette modifiée).
- **CS-011** : Une collecte interrompue par un quota est **reprenable** : la relance ne re-télécharge
  pas l'existant et complète le manquant **sans repartir de zéro**.

## Hypothèses

- **Source = Figma**, fichier *Webdesign-ESTUAIRE* (`Rv5HxXNkF6VkTke0ttdAbe`), accédé via l'API REST
  avec un **token personnel déjà configuré** (`FIGMA_TOKEN` dans `.env.development`, git-crypt). La
  REST API n'est pas soumise au plafond du MCP Dev Mode — c'est le levier qui rend la collecte
  économe possible.
- **Invariants tranchés** (retour utilisateur) : (a) collecte en **un minimum de requêtes, idéalement
  une seule** ; (b) le résultat unique est **découpé en plusieurs fichiers locaux décrits** — pas un
  monolithe (collecte et stockage **découplés**). **Non figé** : « par frame » est le candidat
  principal de découpe ; l'unité/structure exacte est **ouverte au `/speckit.plan`** (une meilleure
  approche est recevable si les invariants tiennent).
- **Périmètre de collecte** (clarif. 2026-06-11) : **une page Figma désignée** (la maquette
  principale), identifiée par configuration ; les autres pages du fichier (brouillons, archives) ne
  sont pas collectées. Les **frames de cette page** fournissent les unités de découpe.
- **Descriptions par frame** : rédigées **collaborativement** (dev + agent) ; le nom de la frame côté
  Figma peut amorcer, mais ne remplace pas une description métier en clair.
- **Cache et index versionnés** dans le dépôt (formats texte/JSON), cohérent avec la convention
  existante (`.design/figma-data/*.json` committés, images lourdes ignorées).
- **Consommateurs** : l'**agent IA** pendant les builds pixel-perfect (skill `estuaire-figma`) et le
  **développeur**. Cette feature fournit la **couche de données** de la méthode pixel-perfect.
- **Interface de consommation** (clarif. 2026-06-11) : **commandes CLI locales** (évolution de
  `figma-node.mjs`), invoquées par l'agent via Bash. **Pas de serveur MCP local** : le « remplacement
  du MCP » est une commande locale instantanée, sans serveur à démarrer/maintenir.
- **Responsive** : convention à 3 frames (mobile **390** / tablette **768** / desktop **1920**) déjà
  en usage ; une cible nommée peut porter ces 3 variantes.
- **Détection de péremption** via la **date de dernière modification** exposée par la source (déjà
  présente dans les données collectées : `lastModified`).

## Hors périmètre

- **Écriture vers Figma** : le système est **strictement en lecture** (one-way). Aucune modification
  de la maquette.
- **Synchronisation temps réel / webhooks Figma** : le rafraîchissement est **manuel, à la demande**.
- **Pipeline de rendu/diff pixel-perfect** lui-même (étape « verify » de la skill `estuaire-figma`) :
  hors périmètre en tant que mécanisme de comparaison ; la **collecte des images** reste, elle, dans
  le périmètre (elle alimente cette étape). La **production des captures de référence** pour le diff
  (ex-commande `render`) est **manuelle** — PNG fournis par le développeur, pas une commande de
  l'outil (clarif. 2026-06-12).
- **Inventaire KIT régénéré** (`kit-inventory.md`, ex-commande `kit`) : **retiré du périmètre** — le
  KIT se lit en lossless via `read` sur la frame KIT collectée (`75:2963`) + cibles nommées `kit/…`
  dans l'index, plus besoin d'une MAP dérivée (clarif. 2026-06-12).
- **Refonte de la *méthode* de build `estuaire-figma`** : cette feature en fournit la **couche de
  données** et **met à jour les références de commandes** de la skill vers le nouveau système (suite
  à la décision de remplacement), mais ne **redéfinit pas la méthode** pixel-perfect elle-même.
- **Auto-génération des descriptions** par analyse de contenu : l'amorce par nom Figma est tolérée,
  mais la curation reste humaine/agent (hors périmètre l'inférence automatique « intelligente »).
- **Généralisation à d'autres outils de design** que Figma.

## Dépendances

- Token Figma en lecture (`FIGMA_TOKEN`, `.env.development` git-crypt) — déjà en place.
- Conventions de versionnement `.design/` (JSON committés, binaires ignorés) et la skill
  `estuaire-figma` qui consomme la lecture.
- L'identifiant de fichier Figma *Webdesign-ESTUAIRE* et la structure de ses pages/frames.
