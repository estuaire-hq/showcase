# Contrat — Surface CLI

La chaîne canonique est **une** commande à sous-commandes, invoquée par l'agent via Bash :

```bash
node --env-file=.env.development --import tsx .design/scripts/figma.ts <commande> [args] [--flags]
# raccourci : npm run figma -- <commande> [args]   (script package.json, encapsule --import tsx)
```

La chaîne est en **TypeScript**, exécutée par **`tsx`** (`--import tsx`, déjà devDep).
`--env-file=.env.development` n'est requis que pour les commandes **réseau** (`collect`, `status`).
`read` / `list` sont **offline** et ne lisent **aucun** secret (le `--env-file` y est inutile).

Conventions communes :
- **Sortie** : humaine sur `stdout` ; `--json` (où noté) pour une sortie machine.
- **Codes de sortie** : `0` succès ; `1` erreur d'usage/entrée (node introuvable, cache vide, nom
  ambigu) ; `2` erreur réseau/quota **subie** (429 épuisé, ou fraîcheur attendue mais Figma
  injoignable — **pas** `--offline`, qui est un renoncement volontaire) ; `3` cache incohérent
  (gate `status`, **prime sur `2`**). Un cache **partiel** (renders manquants après quota) est
  **signalé mais reste exit `0`** : la lecture des géométries demeure possible (EF-010).
- **Réseau** : seules `collect`/`status` appellent Figma. `read`/`list` n'émettent **jamais**
  d'appel (EF-002, CS-002 — vérifiable hors-ligne).

---

## `collect` — collecter & découper (P2 ; EF-006/007/008/009/010/011)

```bash
node --env-file=.env.development --import tsx .design/scripts/figma.ts collect [--page=<id>] [--no-images] [--only=<frameId>] [--images-only] [--json]
```

| Aspect | Contrat |
|---|---|
| **Entrée** | `config.json` (ou `--page=<canvasId>` / `FIGMA_PAGE_ID`). `--no-images` saute les images. `--only=<frameId>` recollecte une seule frame. `--images-only` récupère les images placées des frames **déjà en cache** (aucun re-pull de structure ; reprend les `missingAssets`). |
| **Appels Figma** | **1** `GET /nodes?ids=<page>` (structure) **+ 1** `GET /files/:key/images` (sources) **+ N** `GET /images?ids=…` (renders batchés). Borné, jamais 1/node (CS-004). |
| **Sorties** | écrit `frames/<safe-id>.json` (1/frame), `manifest.json`, `assets/*`. **Ne touche pas** `index.json`. |
| **Atomicité** | chaque fichier : write temp → rename. Jamais de fichier à moitié écrit (cas limite « cache corrompu »). |
| **Reprise** | renders déjà présents dans `assets/` **sautés** (EF-009) ; sur 429 honore `Retry-After` ; à l'abandon, structure complète + `missingAssets` rempli → relance **reprend** (CS-011). |
| **Sortie type** | `✓ page 51:2220 → 31 frames, 1428 nodes` / `✓ 42 assets (3 skipped)` / `⚠ 2 renders manquants (quota) — relancer collect`. |
| **Exit** | `0` complet · `2` quota atteint (cache partiel valide écrit) · `1` page introuvable. |

**Acceptation** (spec Scénario 2) : cache vide → `collect` → 1 fichier/frame autonome + images, appels
bornés ; relance → inchangé non re-téléchargé ; coupure quota → partiel conservé + reprenable.

---

## `read` — lecture lossless locale (P1 ; EF-001/002/003/004/005 ; EF-015)

```bash
node --import tsx .design/scripts/figma.ts read <nodeId|nom> [--depth=N] [--leaves] [--bp=desktop|tablet|mobile] [--raw] [--images]
```

| Aspect | Contrat |
|---|---|
| **Entrée** | un **id Figma** (`51:2339`) **ou** un **nom d'index** (`home`). `--bp` choisit la variante d'une cible nommée. |
| **Réseau** | **AUCUN** (100 % offline — EF-002). |
| **Résolution** | nom → `index.json` (+ `--bp`/défaut) → id ; id → `manifest.nodeToFrame` → `frames/<frame>.json` → extrait le sous-arbre. |
| **Sortie défaut** | digest lisible (façon `figma-node.mjs`) : en-tête `# <nom> [<type>] W×H — N nodes total` (+ `# render: .design/figma-cache/assets/<id>.png` si une référence visuelle est cachée), puis arbre indenté : géométrie **parent-relative** `@(x,y) w×h`, `opacity`, fills (+ per-paint opacity, gradients, IMAGE + `asset=<chemin>` si bitmap caché), strokes + weight + align, radii, auto-layout, effects, style TEXT complet + overrides par caractère, `characters`. **Tous les champs**, aucun filtrage (EF-001). |
| `--raw` | émet le node JSON **brut** (lossless intégral) plutôt que le digest. |
| `--images` | inventaire compact des slots d'image du sous-arbre : `id · position · taille · fit · asset` (chemin du bitmap caché ou `MISSING`) — le « quelles images & où » d'une page. |
| `--depth=N` / `--leaves` | borne l'affichage (EF-003) **sans** altérer l'exhaustivité par défaut. |
| **nb de nodes** | l'en-tête affiche le **total** du sous-arbre (EF-004, checklist de complétude). |
| **Erreurs** | id **absent du cache** → exit `1` « node absent — collecter d'abord » (EF-005, jamais de résultat partiel silencieux) ; nom **inconnu** → `1` « nom inconnu » ; nom **ambigu** (plusieurs bp, pas de `--bp`) → `1` « préciser --bp » (EF-017) ; variante **manquante** → `1` « variante <bp> absente ». |

**Acceptation** (Scénario 1 & 3) : cache peuplé → sous-arbre complet tous champs, 0 appel ; TEXT à
overrides par caractère restitués ; id absent → erreur explicite ; `read <nom>` == `read <id>`.

---

## `list` — découverte des cibles nommées (P3 ; EF-016)

```bash
node --import tsx .design/scripts/figma.ts list [--json]
```

| Aspect | Contrat |
|---|---|
| **Réseau** | aucun. Lit `index.json` (+ vérifie l'existence dans `manifest`). |
| **Sortie** | pour **chaque** cible : `nom · description · node(s) par bp`. Une IA y lit *ce qui existe et ce que c'est* **sans ouvrir les fichiers** (CS-006). |
| **Exemple** | `home  — Page d'accueil (frame pleine page) … [desktop 51:2221 · tablet 77:3149 · mobile 77:3150]`. |
| **Signale** | une cible sans description / dont un node n'est pas collecté est marquée `⚠` (renvoie vers `status`). |

---

## `status` — fraîcheur + cohérence (P4 ; EF-018/019/021)

```bash
node --env-file=.env.development --import tsx .design/scripts/figma.ts status [--offline] [--json]
```

| Aspect | Contrat |
|---|---|
| **Fraîcheur** (réseau) | **1** appel `GET /files/:key?depth=1` → compare `version` distante à `manifest.source.version`. Identique → **à jour** ; différente → **périmé** (recommande `collect`) ; **`--offline`** → fraîcheur **non évaluée** (renoncement volontaire, pas une erreur) ; **échec réseau subi** (online attendu) → **inconnu**. N'invalide jamais le cache. |
| **Cohérence** (offline) | réconcilie `index.json` ↔ `frames/*` ↔ `manifest`. **Erreurs** (exit `3`) : cible **sans description** (CS-007) ; node d'une cible **non collecté** ; **fichier de frame manquant** pour une entrée du manifeste. **Avertissements** (`⚠`, exit `0`) : variante responsive manquante — **certaines cibles n'ont légitimement pas tous les breakpoints** (ex. `nav/open` n'a pas de desktop : aucun menu ouvrable en desktop) ; render de référence absent ou déclaré-mais-introuvable ; `slotNote` pointant un node hors cache. |
| **Sortie** | bloc fraîcheur (`à jour`/`périmé`/`inconnu`/`non évaluée` + dates) + résumé (`N frames`, `M cibles`, `reference renders H/T` [exports `index.image` pour le diff visuel], `placed-image assets` collectés/manquants, `annotated slots` [slots `slotNotes` non récupérés : map / content]) + bloc cohérence (erreurs `✗` + avertissements `⚠`). `--json` pour la sortie machine. |
| **Exit** | `0` cohérent — **à jour**, **ou** `--offline`, **ou** seulement des `⚠` (variante manquante légitime, render absent…), **ou** cache **partiel** signalé · `2` fraîcheur **inconnue subie** (Figma injoignable alors qu'attendu) · `3` **erreurs** de cohérence (**prime sur `2`**). |

**Acceptation** (Scénario 4) : aligné → « à jour » ; maquette modifiée → « périmé » ; pas de réseau →
« inconnu » sans planter.

---

## Hors chaîne (clarif. 2026-06-12)

- **Captures de référence pour *verify*** (ex-commande `render`) : **fournies manuellement** (PNG
  exportés de Figma par le développeur). Pas une commande de l'outil ; `figma-render.mjs` supprimé.
  La capacité de rendu (`figma-api.ts#renderImages`) survit, mais n'est utilisée que par `collect`
  pour les **images placées** (EF-008).
- **Inventaire KIT** (ex-commande `kit`) : retiré. Le KIT se lit via `read 75:2963` + cibles `kit/…`
  de l'index ; `kit-inventory.mjs` et `kit-inventory.md` supprimés.
