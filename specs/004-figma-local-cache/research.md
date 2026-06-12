# Phase 0 — Recherche & décisions

**Feature** : Cache Figma local & lecteur offline (remplacement du MCP Figma)
**Branche** : `004-figma-local-cache` · **Date** : 2026-06-11

Ce document résout les points laissés ouverts par la spec (notamment l'**unité de découpe**,
explicitement déléguée au `/speckit.plan`) et fige les choix techniques. Chaque section suit le
format **Décision / Justification / Alternatives rejetées**. Les faits sur l'API Figma ont été
**vérifiés en direct** (doc officielle + sondes REST sur le fichier réel), conformément à la règle
« Verify Before Acting ».

---

## 0. Faits vérifiés sur l'API REST Figma (socle des décisions)

> Sondés le 2026-06-11 sur le fichier réel `Rv5HxXNkF6VkTke0ttdAbe` + doc officielle
> (`developers.figma.com/docs/rest-api`).

| Fait | Valeur vérifiée | Conséquence |
|---|---|---|
| `GET /v1/files/:key/nodes?ids=<id>` sans `depth` | « Not setting this parameter returns **all nodes** » (doc) | **1 requête** sur l'id du canvas → **tout le sous-arbre de la page** (EF-006). |
| `depth=N` | « how deep to traverse ; 1 = direct children only » | Utilisé pour `pages`/découverte légère, pas pour la collecte. |
| `GET /v1/files/:key/images` (image-fills) | renvoie `meta.images` = **tous** les `imageRef → URL S3** du fichier, **1 appel** (URLs valides ≤ 14 j) | Sources d'images placées en **1 requête** (EF-008). |
| `GET /v1/images/:key?ids=…&format=png&scale=2` (render) | multi-ids, formats png/jpg/svg/pdf, scale 0.01–4 ; **timeouts sur gros lots** | Phase **coûteuse** → batchs + reprise (EF-010). |
| Rate-limit **plan Starter** (Tier 1 : file / file nodes / images) | **10 req/min**, leaky bucket partagé ; 429 + header **`Retry-After`** (s) | Stratégie « 1 requête / page » est exactement le bon levier ; backoff = `Retry-After`. |
| Objet fichier | `lastModified` (ISO 8601) **+ `version`** (id monotone) | Détection de péremption (EF-019/021) ; `version` = comparaison fiable. |

**Canvas désigné** (la maquette principale) = **`51:2220` « Webdesign-ESTUAIRE-V3 »**. Il contient
toutes les pages du site (homepage, nous-découvrir, expertises ×4, secteurs ×5, portfolio, cas-study,
contact) **× 3 breakpoints** (1920 / 768 / 390) + le **KIT** (`75:2963`) + variantes menu ouvert +
marqueurs `REPÈRE`. Les pages « Page 1 » (vide) et « Webdesign-ESTUAIRE-V2 (old) » (archive) sont
**hors périmètre**.

> ⚠️ Au moment du plan, la mesure live de la taille exacte du sous-arbre complet de `51:2220` a été
> bloquée par le rate-limit (bucket épuisé par les sondes). Estimation à partir du monolithe actuel
> (6 frames = 2,3 Mo) : la page V3 (~30 frames de premier niveau, dont 7 pages longues × 3 bp)
> pèsera vraisemblablement **10–30 Mo en une réponse**. C'est précisément ce qui **impose la découpe**
> (un fichier par frame borne chaque lecture). La réponse one-shot reste servie par Figma sans
> problème (le 429 rencontré était du rate-limiting, pas une limite de taille).

---

## 1. Unité de découpe du cache (le point ouvert N°1)

**Décision** : **une frame de premier niveau du canvas = un fichier de cache autonome**. Le canvas
V3 a ~30 enfants directs : chacun est *« une page du site à un breakpoint »* (ex. `homepage-desktop`,
`homepage-tablet`, `contact-mobile`), ou le KIT, ou une variante de menu, ou un marqueur. On écrit
**un fichier JSON par frame de premier niveau**, contenant le **sous-arbre complet (lossless)** de
cette frame + les styles/components qu'elle référence.

**Justification** :
- Chaque fichier est **autosuffisant** (EF-007, CS-005) : lire « homepage desktop » ne charge que
  cette frame, jamais le monolithe ni les autres pages.
- C'est l'unité **naturelle** du fichier (les enfants directs du canvas sont déjà les pages-écrans),
  donc la découpe est mécanique et sans ambiguïté — pas de heuristique fragile.
- La taille de chaque fichier est **bornée** par une page-écran (cf. cas limite « frame volumineuse »).

**Granularité plus fine via l'index, pas via la découpe** : les cibles métier de la spec
(« home/hero », « footer », « kit/bouton-envoyer ») sont **plus fines** qu'une frame (ce sont des
sections *à l'intérieur* d'une frame). On ne découpe **pas** à ce grain (cela exploserait le nombre de
fichiers et dupliquerait des sous-arbres). À la place : **l'index nommé** (P3) mappe un nom métier →
un **node id** (qui vit dans une frame), et le **manifeste** (auto) sait dans **quelle frame** se
trouve chaque node id → la lecture par id ou par nom charge le **bon fichier de frame** et y extrait
le sous-arbre demandé. C'est exactement le comportement de `figma-node.mjs`, mais ciblé sur une frame.

**Alternatives rejetées** :
- *Un fichier par section/composant* : rejeté — grain non défini par Figma (où s'arrête une
  « section » ?), explosion du nombre de fichiers, sous-arbres dupliqués, découpe heuristique fragile.
- *Garder le monolithe* `nodes.json` : rejeté par la spec (illisible, charge 2,3 Mo pour un node).
- *Découper par profondeur fixe* : rejeté — coupe arbitrairement des sous-arbres (perte de lossless).

---

## 2. Deux index distincts (le point ouvert N°2 : structure)

**Décision** : **deux** artefacts d'index aux rôles séparés.

1. **Manifeste** (`manifest.json`) — **auto-généré** à la collecte. Contient :
   `nodeToFrame` (chaque node id → sa frame de cache), la liste des frames (id, fichier, nom, type,
   dimensions, nombre de nodes, refs d'images), et les **métadonnées de collecte** (fileKey, pageId,
   `lastModified`, `version`, `collectedAt`). C'est la **table de routage machine** : « read par id »
   en O(1), détection d'incohérences, péremption.
2. **Index nommé** (`index.json`) — **curé à la main** (dev + agent). Mappe un **nom métier** →
   `{ description, node: { desktop, tablet?, mobile? } }`. C'est le **point d'entrée IA** (P3) :
   *quelles cibles existent et ce qu'elles représentent*.

**Justification** : les deux index répondent à des besoins **orthogonaux** — l'un est mécanique et
exhaustif (résolution/cohérence/fraîcheur), l'autre est éditorial et sélectif (découverte humaine/IA).
Les fusionner forcerait soit à décrire à la main les ~milliers de nodes (impossible), soit à polluer
l'index curé avec du routage machine. La spec elle-même liste **séparément** « Métadonnées de
collecte » et « Entrée d'index (mapping) » dans ses entités clés. Le `status`/consistency check
réconcilie les deux (EF-018).

**Alternatives rejetées** :
- *Un seul index fusionné* : rejeté (cf. ci-dessus — mélange deux préoccupations, ingérable).
- *Pas de manifeste, scan des frames à la lecture* : rejeté — « read par id » devrait ouvrir toutes
  les frames pour trouver le node (viole CS-003 < 1 s et CS-005 charge bornée).

---

## 3. Format & emplacement des fichiers

**Décision** :
- **Cache structurel** (versionné, texte/JSON) → **`.design/figma-cache/`** :
  `config.json`, `manifest.json`, `index.json`, `frames/<safe-id>.json`.
- **Assets binaires** (renders PNG + sources d'image-fills) → **`.design/figma-cache/assets/`**,
  **gitignorés** (lourds, ré-téléchargeables, non nécessaires au dépôt — EF-011).
- `<safe-id>` = id Figma avec `:` et `;` remplacés par `-` (cas limite « identifiants à séparateurs
  spéciaux » → correspondance node ↔ fichier ↔ asset univoque, déjà fait par les scripts actuels).

**Justification** :
- Conforme à la convention `.design/.gitignore` existante (JSON committés, `*.png` + `images/`
  ignorés) et à l'esprit du **post-mortem seed** (ne jamais faire dépendre un gate d'un binaire absent
  d'un checkout neuf). Un checkout neuf / la CI lit le cache **sans token ni appel** (EF-011, CS-009).
- **Corrige un défaut de l'existant** : `figma-pull.mjs` et `figma-fills.mjs` écrivent dans
  `public/figma/` — or `public/` est **servi en prod** et copié dans l'image Docker. Les assets de
  **référence design** n'ont rien à y faire (Principe II : seul le contenu Sanity est servi ; ces
  PNG sont de la *référence de build*, locale). On les déplace donc **hors de `public/`**. Le
  groupe `(lab)` + `public/figma` est de toute façon marqué « à supprimer » dans CLAUDE.md.

**Alternatives rejetées** :
- *Assets dans `public/figma/`* (statu quo) : rejeté — fuite en prod, gonfle l'image Docker, viole
  l'isolation contenu/référence.
- *Tout versionner (PNG inclus)* : rejeté par EF-011 (binaires lourds hors-versionnement).

---

## 4. Surface CLI (industrialisation des 6 scripts en une chaîne canonique)

**Décision** : **une seule chaîne** `node --env-file=.env.development --import tsx .design/scripts/figma.ts <commande>`
avec sous-commandes, remplaçant les scripts ad hoc :

| Commande | Rôle (EF / scénario) | Absorbe |
|---|---|---|
| `collect [--page=<id>] [--no-images] [--only=<frameId>]` | one-shot : pull page (1 req) → découpe frames → manifeste → image-fills (1 req) → renders (batchés, `Retry-After`, reprenables, skip existants) | `figma-pull`, `figma-fills`, `figma-render` (collecte), `figma-frames` (découverte) |
| `read <nodeId\|nom> [--depth=N] [--leaves] [--bp=desktop\|tablet\|mobile]` | lecture **lossless** locale (sous-arbre complet + nb de nodes), résout le nom via l'index + la frame via le manifeste | `figma-node` |
| `list` | liste les cibles de l'index nommé (nom, description, node, variantes) pour découverte IA (EF-016) | — (nouveau) |
| `status` | fraîcheur (1 appel `?depth=1` : compare `version`/`lastModified`) **+** cohérence index↔frames (EF-018/019/021) | — (nouveau) |

**Justification** : la spec exige une **unique chaîne canonique** (clarif. 2026-06-11) ; consolider les
scripts de collecte/lecture en sous-commandes d'un même outil supprime la redondance (`figma-pull`/
`figma-fills`/`figma-render` faisaient chacun un bout de collecte) et donne un point d'entrée unique
pour l'agent via Bash (clarif. : **CLI locales, pas de serveur MCP**). `collect`/`read`/`list`/`status`
couvrent P2/P1/P3/P4 — **4 commandes**.

> **Retrait `render`/`kit`** (clarif. 2026-06-12) : la commande `render` (rendu ad hoc pour *verify*)
> et la commande `kit` (régénération de `kit-inventory.md`) sont **retirées du périmètre**. Les
> captures de référence du diff pixel-perfect sont **fournies manuellement** (PNG Figma), et le KIT se
> lit en lossless via `read 75:2963` + cibles `kit/…` de l'index (plus de MAP dérivée). `figma-render.mjs`,
> `kit-inventory.mjs` et `kit-inventory.md` sont **supprimés**. La capacité de rendu (`renderImages()`
> dans `figma-api.ts`) survit, mais utilisée **uniquement** par `collect` (image-fills placés, EF-008).

**Alternatives rejetées** :
- *Garder les scripts séparés* : rejeté par la spec (redondants → retirés).
- *Serveur MCP local* : rejeté par la clarif. (cycle de vie serveur à gérer, à l'inverse du besoin).

---

## 5. Runtime & langage : TypeScript via `tsx` (décision révisée — retour utilisateur 2026-06-11)

**Décision** : écrire la chaîne en **TypeScript**, exécutée via **`tsx`** (déjà devDep, `^4.22.4`),
sur le modèle de l'outillage de seed (`src/sanity/seed/*.ts` lancé par
`node --env-file=.env.development --import tsx …`). Les contrats du cache (config/manifeste/frame/index)
sont des **interfaces TypeScript** partagées (`.design/scripts/lib/types.ts`), vérifiées au type-check
et **gardées à l'exécution** par `status`. Invocation :
`node [--env-file=.env.development] --import tsx .design/scripts/figma.ts <cmd>` (le `--env-file` n'est
requis que pour les commandes réseau ; un script npm `figma` l'encapsule).

**Justification** : les **formes du cache sont l'artefact central** de la feature — les typer en dur
(et non en prose) empêche la dérive entre `collect` (écrit), `read` (lit) et `status` (valide), dans
l'esprit du Principe IX (types dérivés / validés). `tsx` est **déjà** présent (aucune dépendance
nouvelle), transpile **à la volée** (pas d'étape de build), et le pattern `--import tsx` est déjà
éprouvé par le seed tooling. Préférence explicite de l'utilisateur : « si la CLI peut être en TS,
c'est encore mieux ». Principe IV reste satisfait (pas de nouvelle dep, pas de build).

**Découplage du build Next** : `.design` est **exclu du `tsconfig.json` racine** (le type-check du
build Next ne doit pas dépendre du tooling de design) ; un `.design/scripts/tsconfig.json` dédié
(`extends` la racine, `strict`, `noEmit`) sert l'éditeur, `tsx` et un script `figma:check`
(`tsc --noEmit`). Biome **ignore déjà `.design`** (`files.includes: "!**/.design"`) — aucun friction
lint/format.

**Alternatives rejetées** :
- *Node ESM `.mjs` + `@typedef` JSDoc* (choix initial du plan) : revu — fonctionnel et zéro config,
  mais le typage par documentation est plus faible que de vraies interfaces sur l'artefact central ;
  `tsx` étant déjà là, le surcoût est minime.
- *Réécrire en script unique géant* : rejeté — des modules `lib/` typés restent plus lisibles/testables.

---

## 6. Collecte one-shot, reprise & atomicité (EF-009/010, CS-011)

**Décision** : `collect` procède en phases, du moins coûteux au plus coûteux :
1. **Structure** (1 req) : `GET /nodes?ids=<page>` → écrit chaque frame + manifeste **atomiquement**
   (write temp → rename). C'est la partie qui ne 429 quasi jamais (1 appel).
2. **Sources d'images** (1 req) : `GET /files/:key/images` → mappe `imageRef → URL`.
3. **Renders** (N batchs, partie coûteuse) : pour chaque node porteur d'image non déjà présent en
   `assets/`, render par petits lots (batch=3, fallback 1-à-1 puis scale 1, comme l'existant), en
   honorant **`Retry-After`** sur 429. **Skip** des assets déjà téléchargés (EF-009). Sur abandon
   (quota), le cache **structurel reste complet** ; seuls des PNG manquent → signalés par `status`,
   **jamais inventés** (cas limite). Re-lancer `collect` **reprend** (skip existants) — CS-011.

**Justification** : découple « récupération en masse » (structure, 2 appels robustes) de « rendu »
(coûteux, reprenable). Le cache n'est jamais à moitié écrit (rename atomique → cas limite « jamais un
cache corrompu »). Le backoff `Retry-After` (fourni par Figma) est plus juste que le `15s×attempt`
fixe de l'actuel `figma-pull`.

**Alternatives rejetées** :
- *Tout télécharger d'un bloc sans skip* : rejeté (re-brûle le quota à chaque relance — viole EF-009).
- *Backoff fixe* : remplacé par `Retry-After` (donnée autoritative de Figma).

---

## 7. Détection de péremption (EF-019/021, P4)

**Décision** : `status` fait **un** appel léger `GET /v1/files/:key?depth=1` (renvoie `lastModified`
+ `version` sans le contenu), compare au manifeste : **`version` identique → à jour** ; différente →
**périmé** ; échec réseau → **inconnu** (sans planter ni invalider le cache local — cas limite).
`version` (id monotone) fait foi ; `lastModified` sert à l'affichage.

**Justification** : `depth=1` minimise le coût (et le risque 429). `version` est plus fiable qu'une
date pour détecter un changement. **Nuance documentée** : `lastModified`/`version` sont au niveau
**fichier**, pas page — une édition sur une autre page (brouillon) marquera « périmé » à tort. C'est
**conservateur** et acceptable (refresh manuel, jamais auto — EF-020) : au pire on recollecte une page
inchangée (skip des assets → quasi gratuit).

**Alternatives rejetées** :
- *Re-pull complet pour comparer* : rejeté (coûteux, absurde pour une simple vérif de fraîcheur).
- *Hash par frame côté distant* : non exposé par l'API au niveau page sans re-télécharger.

---

## 8. Cohérence index ↔ cache (EF-018, cas limites)

**Décision** : `status` détecte et **signale** (sans planter) :
- frame présente sans entrée d'index (info, pas erreur — toutes les frames n'ont pas à être nommées) ;
- entrée d'index → node **non collecté** (erreur : « collecter d'abord ») ;
- entrée d'index → frame **absente** du cache (erreur) ;
- entrée d'index **sans description** (manquement à « aucune cible anonyme » — CS-007) ;
- cible responsive avec **variante manquante** (ex. pas de mobile) → signalée pour ce breakpoint.

**Justification** : couvre directement les cas limites de la spec (« index désynchronisé »,
« frame sans description », « entrée pointant vers un node non collecté », « cible responsive
incomplète ») et fait de `status` le gate de qualité du cache (analogue à `seed --check`).

---

## Récapitulatif des décisions

| # | Sujet | Décision |
|---|---|---|
| 1 | Unité de découpe | 1 fichier / frame de premier niveau (sous-arbre lossless) |
| 2 | Index | 2 artefacts : `manifest.json` (auto) + `index.json` (curé) |
| 3 | Emplacement | `.design/figma-cache/` (JSON committés) ; `assets/` gitignorés (hors `public/`) |
| 4 | CLI | 1 chaîne `figma.ts` : `collect`/`read`/`list`/`status` (`render`/`kit` retirés — clarif. 2026-06-12) |
| 5 | Runtime | **TypeScript via `tsx`** (devDep déjà présent, pas de build) — contrats du cache typés |
| 6 | Collecte | phases structure→images→renders, atomique, reprenable, `Retry-After` |
| 7 | Fraîcheur | `status` : 1 appel `depth=1`, compare `version` ; à jour/périmé/inconnu |
| 8 | Cohérence | `status` réconcilie index ↔ frames, signale les manques |

**Aucune clarification non résolue ne subsiste.** Tous les `NEEDS CLARIFICATION` de la spec étaient
soit tranchés par les clarifications du 2026-06-11, soit délégués au plan (résolus ci-dessus).
