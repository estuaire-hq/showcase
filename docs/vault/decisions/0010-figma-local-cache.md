---
tags: [decision, figma, pixel-perfect, tooling, cache, architecture]
status: accepted
date: 2026-06-12
---
# 0010 — Cache Figma local & lecteur offline (remplacement du MCP Figma)

## Context
La méthode pixel-perfect (Principe VII) impose de lire le **node Figma complet, lossless**
au moment du build. Jusqu'ici cela passait par le Dev Mode MCP (plafonné par le plan
Starter) puis par une grappe de **6 scripts prototypes** ad hoc dans `.design/scripts/`
(`figma-pull`, `figma-node`, `figma-fills`, `figma-render`, `figma-frames`, `kit-inventory`)
écrivant un monolithe `figma-data/nodes.json` (2,3 Mo pour 6 frames) + des renders dans
`public/figma/`. Problèmes : lecture qui charge tout le monolithe pour un seul node ;
rate-limit Figma (10 req/min, Tier 1) subi sans reprise ; assets de **référence design**
servis en prod (`public/`, image Docker) ; redondance des scripts ; aucune détection de
péremption. Feature `004-figma-local-cache`.

## Decision
Remplacer le MCP + les scripts par un **cache local versionné** + un **lecteur offline**,
piloté par **une seule chaîne canonique** TypeScript exécutée via `tsx` (aucune dépendance
nouvelle) : `.design/scripts/figma.ts` à **4 commandes** — `collect` / `read` / `list` /
`status`.

### 1. Unité de découpe : une frame de premier niveau = un fichier autonome
`collect` rapatrie **toute la page désignée en 1 requête** (`GET /files/:key/nodes?ids=<canvasId>`
sans `depth` → tout le sous-arbre), puis la **découpe par frame de premier niveau** en
`frames/<safe-id>.json` **lossless et autosuffisants** (sous-arbre brut verbatim + tables
styles/components référencées). Lire un node ne charge **qu'une** frame (< 1 s, 0 appel).
La granularité plus fine (sections métier) passe par l'index, pas par la découpe.

### 2. Deux index aux rôles orthogonaux
- `manifest.json` (**auto-généré**) : `nodeToFrame` (routage machine O(1)), `frames[]`,
  `source{version,lastModified,collectedAt}`, `missingAssets`. Source de la lecture par id,
  de la cohérence et de la fraîcheur.
- `index.json` (**curé dev + agent**) : noms métier → `{description, node{desktop,tablet,mobile}}`.
  Point d'entrée IA (« quelles cibles existent, ce qu'elles représentent »). `read <nom>` ≡
  `read <id>` ; description obligatoire (aucune cible anonyme).

### 3. Assets hors de `public/`, mais **versionnés** (révision 2026-06-12)
Les binaires (renders de page + sources image-fills) vont dans `.design/figma-cache/assets/`,
**hors `public/`** : `public/` est servi en prod et copié dans l'image Docker — de la référence
de build n'a rien à y faire (Principe II). `.design/` est **dev-only** (jamais servi, exclu du
build Docker), donc les y versionner ne fuite pas en prod.

> **Révision (2026-06-12, retour Pierre — « un loupé dans le plan ») :** les assets étaient
> initialement **gitignorés** (« lourds, ré-téléchargeables »). Mais sous quota Starter le
> re-téléchargement n'est **pas fiable** (c'est tout le problème de cette feature), et l'IA a
> besoin des références visuelles à chaque build. On les **versionne** donc : un checkout neuf /
> la CI a toute la référence visuelle, sans token ni quota. Les binaires (~141 Mo) sont stockés en
> **git-lfs** (`.gitattributes` : `.design/figma-cache/assets/**` + `seed-assets/**` — seuls dossiers
> d'images committés, le contenu vivant dans Sanity). **`public/` est exclu** de LFS (servi + copié
> dans l'image Docker ; un clone déploiement/CI peut ne pas récupérer les blobs). Le job CI
> `seed-sanity.yml` checkout en `lfs: true` (il lit `seed-assets/`). Les JSON du cache restent en git brut.

**Lien node ↔ image infaillible.** Un asset est nommé par **node id** (`assets/<safe-id>.png`),
donc 1:1 avec son node. Le lien est rendu **explicite à trois endroits** : (a) `index.json` porte
`image: { <bp>: "assets/<id>.png" }` par cible/breakpoint ; (b) `read` affiche en en-tête
`# render: .design/figma-cache/assets/<id>.png` et `asset=…` sur chaque node à fill IMAGE ;
(c) `status` valide que chaque render déclaré existe sur disque. Les **renders de page** (export
manuel d'une frame entière) sont la référence du *verify* ; les **sources image-fills** (photos
placées, via l'API, quota-bound) sont une capacité distincte de `collect`.

### 4. Collecte bornée, atomique, reprenable
Phases du moins au plus coûteux : 1 structure + 1 image-fills + N renders batchés. Écriture
**atomique** (temp → rename, jamais de cache corrompu). Backoff **honorant `Retry-After`**,
mais **plafonné** (`MAX_RETRY_WAIT_S`) : au-delà, quota considéré comme durablement épuisé →
échec rapide `exit 2`, cache intact, **ré-exécutable** (skip des assets déjà présents). La
fraîcheur (`status`) compare la `version` distante (1 appel `?depth=1`) à la locale.

### 5. Retrait de `render` et `kit` (clarif. 2026-06-12)
- `render` (rendu ad hoc pour *verify*) → **retiré**. Les captures de référence du diff
  pixel-perfect sont **fournies manuellement** (PNG exporté de Figma). La capacité de rendu
  survit dans `figma-api.ts#renderImages`, utilisée **uniquement** par `collect` (images placées).
- `kit` (régénération de `kit-inventory.md`) → **retiré**. Le KIT se lit en lossless via
  `read 75:2963` + cibles `kit/…` de l'index. `kit-inventory.md` supprimé.

## Consequences
- ✅ Lecture pixel-perfect **offline, sans quota, < 1 s, lossless** — le vrai remplacement du MCP.
- ✅ 6 scripts → 1 chaîne ; un seul point d'entrée Bash pour l'agent. Contrats du cache
  **typés** (`lib/types.ts`), gardés à l'exécution par `status` (analogue à `seed --check`).
- ✅ Plus de fuite de référence design en prod ; checkout neuf lisible sans token.
- ✅ Résilience quota : collecte reprenable, péremption détectable, aucun cache à moitié écrit.
- ⚠️ La fraîcheur est au niveau **fichier** Figma (pas page) : une édition sur une autre page
  marque « périmé » à tort — conservateur, acceptable (refresh manuel, skip des assets ≈ gratuit).
- ⚠️ Companion changes appliqués : Principe VII (réf. opérationnelles, bumps **1.7.1** puis **1.7.2**),
  skills `estuaire-pixel-perfect` (méthode) + `estuaire-figma-cli` (CLI) — scission de `estuaire-figma`,
  retirée —, `CLAUDE.md`.

## Notes
- Runtime : **TS via `tsx`** (déjà devDep), pas d'étape de build ; `.design` exclu du
  `tsconfig.json` racine (découplage du build Next), `tsconfig` dédié + script `figma:check`.
- **Quota & copie temporaire.** Le bucket « file nodes » de l'original (`Rv5Hx…`) étant épuisé
  (cooldown ~42 h), la structure complète (**36 frames, 6542 nodes**) a été collectée depuis une
  **COPIE** du fichier (`FE2OuSaCNV74ZqenKZy8gh`, ids préservés) — contournement **temporaire**,
  l'original restant canonique. `config.fileKey` pointe la copie ; rebasculer + recollecter quand
  le quota de l'original revient (cf. mémoire `figma-temporary-copy-source`).
- **Renders de référence.** Les 28 exports pleine page (par frame × breakpoint) ont été **fournis
  manuellement** par Pierre et **versionnés** (`assets/<id>.png`), liés dans `index.json.image` —
  pas téléchargés via l'API (quota). Les **sources image-fills** (photos placées) restent à
  collecter via `collect` quand utile.
