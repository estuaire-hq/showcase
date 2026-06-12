---
description: "Task list — Cache Figma local & lecteur offline"
---

# Tasks: Cache Figma local & lecteur offline (remplacement du MCP Figma)

**Input** : design documents dans `/specs/004-figma-local-cache/`
**Prerequisites** : plan.md, spec.md (requis) ; research.md, data-model.md, contracts/, quickstart.md

**Tests** : aucun framework de test n'est demandé (ni dans la spec, ni en TDD) et le projet n'a pas de
runner (cf. plan.md « Testing »). La vérification se fait par la commande **`status`** (gate
cohérence/fraîcheur) + les **tests indépendants** de la spec exécutés manuellement (quickstart.md).
Les tâches `Validate …` ci-dessous sont ces vérifications manuelles, **pas** des tests automatisés.

**Organisation** : tâches groupées par user story (P1→P4) pour une livraison incrémentale et un test
indépendant de chaque story.

## Format : `[ID] [P?] [Story?] Description + chemin`

- **[P]** : parallélisable (fichiers différents, aucune dépendance sur une tâche incomplète)
- **[Story]** : US1=lecture · US2=collecte · US3=index nommé · US4=fraîcheur
- Tous les chemins sont relatifs à la racine du dépôt.

## Conventions de chemins (cf. plan.md « Project Structure »)

- Entrée CLI : `.design/scripts/figma.ts` · modules : `.design/scripts/lib/*.ts` (dont `types.ts`)
- Cache versionné : `.design/figma-cache/{config,manifest,index}.json`, `frames/*.json`
- Assets gitignorés : `.design/figma-cache/assets/`
- Runtime : **TypeScript via `tsx`** (`node [--env-file=.env.development] --import tsx …`), aucune
  dépendance nouvelle (`tsx` déjà devDep ; `fetch` natif + `node:fs`/`node:stream`) — cf. research §5.

---

## Phase 1 : Setup (infrastructure partagée)

**But** : initialiser l'arborescence du cache et le squelette de la chaîne CLI.

- [X] T001 Créer le dossier `.design/figma-cache/` et `.design/figma-cache/config.json` avec `fileKey` (`Rv5HxXNkF6VkTke0ttdAbe`), `pageId` (`51:2220`), `pageName` (`Webdesign-ESTUAIRE-V3`), `breakpoints` (`{desktop:1920,tablet:768,mobile:390}`) — cf. data-model.md §1
- [X] T002 [P] Mettre à jour `.design/.gitignore` pour ignorer `figma-cache/assets/` (et nettoyer les entrées obsolètes `images/`, `*.png` si plus pertinentes) — cf. research.md §3
- [X] T003 Mettre en place le **runtime TS** + le squelette du routeur : créer `.design/scripts/figma.ts` (table de dispatch des sous-commandes `collect`/`read`/`list`/`status`, parsing d'arguments positionnels + `--flags`, codes de sortie `0/1/2/3`, message d'usage, erreur pour commande inconnue) ; créer `.design/scripts/tsconfig.json` (`extends` la racine, `strict`, `noEmit`) ; **exclure `.design` du `tsconfig.json` racine** (découpler du build Next) ; ajouter les scripts npm `figma` (`node --env-file=.env.development --import tsx .design/scripts/figma.ts`) et `figma:check` (`tsc --noEmit -p .design/scripts`) dans `package.json` — cf. research §5, contracts/cli-commands.md

---

## Phase 2 : Foundational (prérequis bloquant)

**But** : le module d'I/O du cache, utilisé par **toutes** les commandes.

**⚠️ CRITIQUE** : aucune user story ne peut commencer avant la fin de cette phase.

- [X] T004 Créer `.design/scripts/lib/types.ts` (**interfaces TypeScript** des contrats : `Config`, `Manifest`, `FrameFile`, `IndexEntry` — d'après data-model.md) **et** `.design/scripts/lib/cache.ts` : résolution des chemins du cache ; `safeId()` (`:`/`;` → `-`) ; écriture **atomique** (temp → rename) ; lecture/écriture typées de `manifest.json`, `index.json`, `frames/<safe-id>.json` ; helper `findFrameForNode(id)` (via `manifest.nodeToFrame`) — cf. data-model.md, contracts/cache-files.md

**Checkpoint** : socle prêt — les user stories peuvent démarrer.

---

## Phase 3 : User Story 1 — Lire n'importe quel node en local, sans quota (P1) 🎯 MVP

**Goal** : `read <nodeId>` restitue le **sous-arbre complet et lossless** d'un node depuis le cache,
**0 appel réseau**, < 1 s — le vrai remplacement du MCP.

**Independent Test** : couper le réseau ; `read 51:2339` → sous-arbre complet avec tous les champs +
« N nodes total » ; un node TEXT à overrides par caractère restitue ces overrides ; un id absent →
erreur explicite « collecter d'abord » (jamais de résultat partiel silencieux).

- [X] T005 [P] [US1] Créer `.design/scripts/lib/paints.ts` : formatage `fills`/`strokes` (SOLID/GRADIENT/IMAGE + per-paint opacity), texte (`style` complet) et **overrides par caractère** (`characterStyleOverrides` + `styleOverrideTable`), helper `hex()` — extrait de l'actuel `figma-node.mjs`
- [X] T006 [US1] Créer `.design/scripts/lib/read.ts` (lecture **par id**) : `manifest.nodeToFrame` → `frames/<frame>.json` → extraire le sous-arbre du node ; rendre le **digest lossless** (géométrie parent-relative `@(x,y) w×h`, `opacity`, fills, strokes+weight+align, `cornerRadius`/`rectangleCornerRadii`, auto-layout, effects, style TEXT + overrides + `characters`) ; en-tête `# <nom> [<type>] W×H — N nodes total` ; flags `--raw` (JSON brut intégral), `--depth=N`, `--leaves` ; erreur exit `1` si id **absent du cache** (message « collecter d'abord ») — cf. contracts/cli-commands.md `read`, EF-001..005 (dépend de T004, T005)
- [X] T007 [US1] Enregistrer la commande `read` dans le routeur `.design/scripts/figma.ts` (dépend de T003, T006)
- [X] T008 [P] [US1] Créer une **fixture de cache** pour le test indépendant : dériver `.design/figma-cache/frames/51-2221.json` + un `manifest.json` minimal (`nodeToFrame` de la homepage) depuis l'existant `.design/figma-data/nodes.json` — permet de tester `read` **avant** que `collect` existe (sera remplacée par la vraie collecte en US2) (dépend de T004)
- [X] T009 [US1] **Validate US1** (quickstart.md) : hors-ligne, `read 51:2339` → sous-arbre complet, **0 appel** ; un TEXT à overrides par caractère est restitué ; id absent → erreur explicite ; `time read <id>` < 1 s ; la lecture n'ouvre **qu'un** `frames/*.json` (CS-001/002/003/005)

**Checkpoint** : US1 fonctionne et se teste indépendamment sur la fixture (MVP).

---

## Phase 4 : User Story 2 — Collecter en un minimum de requêtes, puis découper (P2)

**Goal** : `collect` rapatrie **toute la page désignée** en un minimum d'appels (1 structure + 1
image-fills + N renders), la découpe **par frame** en fichiers autonomes, télécharge les images,
résiste au quota et reprend.

**Independent Test** : cache vide → `collect` → un fichier par frame (lisible isolément, sous-arbre
complet) + images, appels bornés ; relance → inchangé non re-téléchargé ; coupure de quota → partiel
conservé et reprenable.

- [X] T010 [US2] Créer `.design/scripts/lib/figma-api.ts` : client REST (`X-Figma-Token`), wrapper `fetch` avec backoff **429 honorant le header `Retry-After`**, helpers `getNodes(ids)`, `getImageFills(key)`, `renderImages(ids,scale)`, `getFileMeta(key)` (`?depth=1`) — cf. research.md §0/§6
- [X] T011 [US2] `.design/scripts/lib/collect.ts` — **phase structure** : `GET /nodes?ids=<pageId>` (1 requête) → découper **par frame de premier niveau** → écrire chaque `frames/<safe-id>.json` (`document` brut + `styles`/`components`/`componentSets` référencés + `meta` dont `breakpoint` dérivé) et `manifest.json` (`frames[]`, `nodeToFrame`, `source{version,lastModified,collectedAt}`) **atomiquement** — cf. data-model.md §2/§3 (dépend de T004, T010)
- [X] T012 [US2] `.design/scripts/lib/collect.ts` — **phase images** : image-fills `GET /files/:key/images` (1 requête) → map `imageRef→URL` ; rendre les nodes porteurs d'image par lots (batch 3, fallback 1-à-1 puis scale 1), honorer `Retry-After`, **sauter** les assets déjà présents dans `assets/`, remplir `manifest.missingAssets` ; flags `--no-images`, `--only=<frameId>`, `--json` (résumé machine) — EF-008/009/010 (dépend de T011)
- [X] T013 [US2] `collect` : auto-détection de la page par `pageName` si `pageId` absent ; surcharge `--page=<id>` / `FIGMA_PAGE_ID` ; écrire les binaires sous `.design/figma-cache/assets/` (**jamais** `public/`) — research.md §3 (dépend de T011)
- [X] T014 [US2] Enregistrer la commande `collect` dans `.design/scripts/figma.ts` (dépend de T003, T012)
- [X] T015 [US2] **Validate US2** (quickstart.md) : cache vide → `collect` → 1 fichier autonome/frame + images, appels bornés (CS-004) ; relance → inchangé sauté (EF-009) ; simuler un 429 en plein render → cache structurel complet + `missingAssets` rempli → relance reprend sans repartir de zéro (CS-011)

**Checkpoint** : la vraie collecte remplace la fixture T008 ; US1 + US2 fonctionnent sur cache réel.

---

## Phase 5 : User Story 3 — Index nommé et décrit, lisible par une IA (P3)

**Goal** : un index curé mappe des **noms métier décrits** → nodes (avec variantes responsive) ;
`read <nom>` équivaut à `read <id>` ; `list` expose ce qui existe.

**Independent Test** : ajouter « home/hero → id, desc, variantes » → `read home/hero` == `read <id>` ;
`list` montre nom + description ; nom inconnu/ambigu signalé.

> Dépendance douce : le **contenu** de `index.json` (ids réels) vient de la collecte (US2) ; le
> **mécanisme** (résolution de nom, `list`) est indépendant et pourrait s'appuyer sur la fixture T008.

- [X] T016 [US3] Créer `.design/figma-cache/index.json` avec des cibles curées initiales (`home/hero`, `footer`, `kit/bouton-envoyer`, …), chacune avec `description` non vide + `node` par breakpoint, ids vérifiés via `read`/`manifest` — cf. data-model.md §4 (dépend de T011 pour les ids réels)
- [X] T017 [US3] Étendre `.design/scripts/lib/read.ts` : **résolution par nom** via `index.json` → id ; sélection `--bp=desktop|tablet|mobile` (défaut `desktop`, sinon variante unique) ; erreurs `1` pour **nom inconnu**, **nom ambigu** (plusieurs bp sans `--bp`), **variante manquante** — EF-015/017 (dépend de T006, T016)
- [X] T018 [US3] Créer `.design/scripts/lib/index-status.ts` avec la commande `list` (nom + description + node(s) par bp ; marquer `⚠` si description manquante ou node non collecté ; option `--json`) et l'enregistrer dans le routeur — EF-016, CS-006/007 (dépend de T004, T003)
- [X] T019 [US3] **Validate US3** (quickstart.md) : ajouter une entrée → `read <nom>` renvoie les mêmes données que `read <id>` ; `list` affiche nom + description pour chaque cible ; nom inconnu/ambigu signalé (CS-006/007/008)

**Checkpoint** : lecture par nom + découverte IA opérationnelles.

---

## Phase 6 : User Story 4 — Savoir quand le cache est périmé (P4)

**Goal** : `status` rapporte la **fraîcheur** (à jour / périmé / inconnu) et la **cohérence**
index↔cache, en un geste, rafraîchissement à la demande uniquement.

**Independent Test** : aligné → « à jour » ; maquette modifiée → « périmé » ; pas de réseau →
« inconnu » sans planter ni invalider le cache.

> Dépendance douce : la partie **fraîcheur** réutilise `lib/figma-api.ts` (construit en US2 — T010) ;
> la partie **cohérence** est entièrement offline et indépendante.

- [X] T020 [US4] Étendre `.design/scripts/lib/index-status.ts` — `status` **fraîcheur** : 1 appel `getFileMeta` (`?depth=1`) → comparer `version` distante à `manifest.source.version` → `à jour`/`périmé`/`inconnu` ; flag `--offline` = fraîcheur **non évaluée** (renoncement volontaire, **pas** un exit `2`) vs **échec réseau subi** → `inconnu` + exit `2` ; cache **partiel** (`missingAssets`) signalé mais **exit `0`** (EF-010) ; afficher dates `lastModified`/`collectedAt` — EF-019/021 (dépend de T004, T010)
- [X] T021 [US4] Étendre `.design/scripts/lib/index-status.ts` — `status` **cohérence** (offline) : réconcilier `index.json` ↔ `frames/*` ↔ `manifest`. **Erreurs** → exit `3` (**prime sur `2`**) : description manquante, node non collecté, fichier de frame manquant. **Avertissements** (`⚠`, exit `0`) : variante responsive manquante (légitime pour certaines cibles, ex. `nav/open` sans desktop), render de référence absent, `slotNote` hors cache. Option `--json` (sortie machine combinée fraîcheur+cohérence) — EF-018 (dépend de T004)
- [X] T022 [US4] Enregistrer la commande `status` dans `.design/scripts/figma.ts` (dépend de T003, T020, T021)
- [X] T023 [US4] **Validate US4** (quickstart.md) : cache aligné → `à jour` ; éditer la maquette → `périmé` ; couper le réseau (online attendu) → `inconnu` + exit `2` sans planter ; `--offline` → fraîcheur non évaluée + exit `0` si cohérent ; cache partiel (`missingAssets`) → signalé en exit `0` ; injecter une incohérence (entrée → node non collecté) → signalée avec exit `3` (CS-010)

**Checkpoint** : les 4 user stories sont indépendamment fonctionnelles.

---

## Phase 7 : Polish, migration & gouvernance (transverse)

**But** : retirer le prototype, et mettre à jour les références (constitution / skill / docs) comme
exigé par la décision de remplacement.

> **Retrait `render`/`kit`** (clarif. 2026-06-12) : la commande `render` et la commande `kit` ne sont
> **pas** implémentées. Les captures de référence du diff *verify* sont **fournies manuellement** (PNG
> Figma) ; le KIT se lit via `read 75:2963` + cibles `kit/…` de l'index. `figma-render.mjs`,
> `kit-inventory.mjs` et `.design/figma-data/kit-inventory.md` sont **supprimés** sans remplacement.

- [X] T024 Supprimer les scripts migrés/retirés : `.design/scripts/{figma-pull,figma-node,figma-fills,figma-render,figma-frames,kit-inventory}.mjs` (dépend de T007, T014, T022 — les commandes équivalentes `read`/`collect`/`status` existent ; `figma-render`/`kit-inventory` retirés sans remplacement)
- [X] T025 Supprimer les artefacts obsolètes : `.design/figma-data/nodes.json`, `.design/figma-data/images.json`, `.design/figma-data/kit-inventory.md` (et le dossier `.design/figma-data/` une fois vidé), et toute écriture/dossier `public/figma/` (dépend de T015 — cache réel en place)
- [X] T026 [P] Mettre à jour la skill `.claude/skills/estuaire-figma/SKILL.md` : remplacer les commandes (`figma-pull.mjs`/`figma-node.mjs`/`figma-render.mjs`) par `figma.ts collect/read/list/status` ; l'étape *verify* utilise des **captures fournies manuellement** (plus de commande `render`) ; le KIT se découvre via `read` + cibles `kit/…` (plus de `kit-inventory.md`) (sections « Source of truth », étapes 1 & 5)
- [X] T027 [P] Mettre à jour `CLAUDE.md` : section « Pixel-Perfect & Animation » (nouvelles commandes) ; section « Lab » (assets hors `public/figma`) ; section « Design System » — remplacer « Build components from the KIT inventory: `.design/figma-data/kit-inventory.md` » par la lecture de la frame KIT via `read 75:2963` + cibles `kit/…`
- [X] T028 [P] Mettre à jour le **Principe VII** de `.specify/memory/constitution.md` (références `figma-pull.mjs`/`figma-node.mjs` → `figma.ts collect`/`read`) + ajouter une entrée **Sync Impact Report** (bump **PATCH** → **1.7.1**, correction de références opérationnelles)
- [X] T029 [P] Écrire l'ADR `docs/vault/decisions/00XX-figma-local-cache.md` (cache découpé par frame + 2 index + chaîne canonique 4 commandes + assets hors `public/` + retrait render/kit) — assigner le prochain numéro libre (≥ 0009)
- [X] T030 Exécuter la **recette complète de quickstart.md** : valider les 11 critères de succès, dont **CS-009** (checkout neuf sans token Figma → `read <id collecté>` réussit)

---

## Dépendances & ordre d'exécution

### Dépendances de phase

- **Setup (Ph.1)** : aucune dépendance — démarre immédiatement.
- **Foundational (Ph.2 / T004)** : dépend du Setup — **bloque toutes les user stories**.
- **User Stories (Ph.3–6)** : dépendent de T004.
  - US1 (P1) est **100 % offline**, ne dépend d'aucune autre story (MVP).
  - US2 (P2) ajoute `lib/figma-api.ts` (T010), réutilisé ensuite par US4 (fraîcheur).
  - US3 (P3) : mécanisme indépendant ; **contenu** d'`index.json` dépend de US2 (ids réels).
  - US4 (P4) : cohérence offline indépendante ; fraîcheur réutilise T010 (US2).
- **Polish (Ph.7)** : dépend des stories concernées (suppressions après que les commandes
  équivalentes existent).

### Au sein d'une story

- `paints.ts`/`figma-api.ts` (modules) avant les commandes qui les consomment.
- Module de commande avant son enregistrement dans le routeur.
- Implémentation avant la tâche `Validate …`.

### Opportunités de parallélisme

- T002 ∥ T001 (gitignore vs config — fichiers différents).
- Dans US1 : T005 (paints.ts) ∥ T008 (fixture) — fichiers différents ; T006 dépend de T005.
- Dans Polish : T026 ∥ T027 ∥ T028 ∥ T029 (docs différents — skill / CLAUDE.md / constitution / ADR).

---

## Exemple parallèle : User Story 1

```bash
# Modules/fixtures indépendants de US1 (fichiers différents) :
Task: "Créer lib/paints.ts (formatage fills/strokes/text + overrides)"     # T005
Task: "Dériver une fixture frames/51-2221.json + manifest depuis nodes.json" # T008
# puis T006 (read.ts) consomme paints.ts, T007 enregistre la commande.
```

## Exemple parallèle : Polish (docs/gouvernance)

```bash
Task: "MAJ skill estuaire-figma"        # T026
Task: "MAJ CLAUDE.md"                   # T027
Task: "MAJ Principe VII constitution"   # T028
Task: "Écrire ADR figma-local-cache"    # T029
```

---

## Stratégie d'implémentation

### MVP d'abord (User Story 1)

1. Phase 1 (Setup) → Phase 2 (Foundational, T004).
2. Phase 3 (US1) sur la **fixture** (T008) → `read` lossless offline fonctionne.
3. **STOP & VALIDATE** : T009 (tests indépendants US1).
4. C'est déjà le remplacement du MCP pour les nodes déjà en cache.

### Livraison incrémentale

1. Setup + Foundational → socle prêt.
2. US1 (lecture) → tester → **MVP**.
3. US2 (collecte) → la vraie collecte remplace la fixture → tester.
4. US3 (index nommé) → lecture par nom + `list` → tester.
5. US4 (fraîcheur) → `status` → tester.
6. Polish : suppression du prototype (dont `figma-render`/`kit-inventory`, retirés), MAJ skill/constitution/ADR.

### Notes

- `[P]` = fichiers différents, aucune dépendance incomplète.
- Chaque story est complétable et testable indépendamment (US1 via fixture, US2+ sur cache réel).
- `read`/`list` ne DOIVENT jamais émettre d'appel réseau (vérifiable hors-ligne).
- Commiter après chaque tâche ou groupe logique ; messages en anglais (Principe V).
- Éviter : tâches floues, conflits sur un même fichier, dépendances inter-stories cassant l'indépendance.
