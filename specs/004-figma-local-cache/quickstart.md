# Quickstart — Cache Figma local & lecteur offline

Comment utiliser la chaîne canonique au quotidien (build pixel-perfect). Remplace l'ancien duo
`figma-pull.mjs` / `figma-node.mjs`. Pré-requis : `FIGMA_TOKEN` dans `.env.development` (git-crypt,
déjà en place).

> Toutes les commandes : `node --env-file=.env.development --import tsx .design/scripts/figma.ts <cmd>`.
> `read` et `list` sont **offline** — le `--env-file` y est inutile.

---

## 1. Collecter la maquette (une fois, puis à la demande) — Scénario 2

```bash
node --env-file=.env.development --import tsx .design/scripts/figma.ts collect
```

→ 1 requête rapatrie **toute la page** « Webdesign-ESTUAIRE-V3 », découpée en `frames/*.json`
(une frame = une page-écran à un breakpoint), + `manifest.json` + les images dans `assets/`.

- **Coupé par le quota ?** Le cache structurel est complet ; relancez la même commande : elle
  **reprend** (sauter les assets déjà là, finir les manquants). Rien n'est re-téléchargé inutilement.
- **Juste rafraîchir la structure, sans images** : `… collect --no-images`.
- **Une seule frame a changé** : `… collect --only=51:2221`.

## 2. Lire un node en local, sans quota — Scénario 1 (le remplacement du MCP)

Par **id** Figma :

```bash
node --import tsx .design/scripts/figma.ts read 51:2339
```

→ le **sous-arbre complet** du hero, **tous les champs** (géométrie parent-relative, opacité de
calque, fills/strokes, rayons, auto-layout, effets, style de texte + overrides par caractère), et
l'en-tête `… — N nodes total` (votre checklist de complétude). **0 appel réseau**, < 1 s.

- Cibler une partie : `… read 51:2339 --depth=2` ou `--leaves`.
- JSON brut intégral (lossless) : `… read 51:2339 --raw`.
- Node pas encore collecté → message explicite « collecter d'abord » (jamais un résultat partiel).

## 3. Lire « le hero de la home » par son nom — Scénario 3

D'abord, découvrir ce qui existe :

```bash
node --import tsx .design/scripts/figma.ts list
```

→ chaque cible avec sa **description** et ses variantes responsive — une IA choisit la bonne unité
**en une étape**, sans ouvrir les fichiers.

Puis lire par **nom** (équivalent à lire par id) :

```bash
node --import tsx .design/scripts/figma.ts read home/hero            # variante desktop par défaut
node --import tsx .design/scripts/figma.ts read home/hero --bp=mobile # variante mobile
```

### Déclarer une nouvelle cible (< 1 min, une seule édition)

Ajouter une entrée à `.design/figma-cache/index.json` :

```jsonc
"about/intro": {
  "description": "Intro éditoriale de la page Nous découvrir, titre + paragraphe.",
  "node": { "desktop": "51:2710", "tablet": "78:4390", "mobile": "78:4640" }
}
```

`read about/intro` fonctionne aussitôt. (`status` vérifiera que les ids sont bien collectés et que la
description est présente.)

## 4. Le cache est-il à jour ? — Scénario 4

```bash
node --env-file=.env.development --import tsx .design/scripts/figma.ts status
```

→ **fraîcheur** (1 appel léger : `à jour` / `périmé — relancer collect` / `inconnu` si pas de réseau)
**+ cohérence** (cibles d'index sans description, pointant vers un node non collecté, frames
orphelines, variantes responsive manquantes). C'est le **gate qualité** du cache (analogue à
`seed --check`). Sans réseau : `status --offline` ne fait que la cohérence.

---

## Vérification des critères de succès (recette)

| Critère | Comment le vérifier |
|---|---|
| **CS-002 / EF-002** (0 appel en lecture) | couper le réseau, `read 51:2339` → réussit. |
| **CS-001** (lossless) | `read <id> --raw` vs node source → 100 % des champs présents. |
| **CS-003** (< 1 s) | `time read <id>` → < 1 s. |
| **CS-005** (charge bornée) | la lecture n'ouvre **qu'**un `frames/*.json`, pas le monolithe. |
| **CS-006 / CS-007** (découverte, aucune anonyme) | `list` → chaque cible a nom + description. |
| **CS-008** (cible nommée 1 étape) | `read home/hero` sans connaître `51:2339`. |
| **CS-009** (checkout neuf sans token) | `git clone` frais (sans `.env`) → `read <id collecté>` réussit. |
| **CS-010** (fraîcheur) | éditer Figma → `status` = périmé ; `collect` → `status` = à jour. |
| **CS-011** (reprise) | tuer `collect` en plein render → relancer → complète sans repartir de zéro. |

## Migration depuis l'ancienne chaîne (à faire une fois)

L'ancien duo et ses artefacts sont **remplacés** :
- `figma-pull.mjs` + `figma-fills.mjs` + `figma-render.mjs` + `figma-frames.mjs` → `collect`.
- `figma-node.mjs` → `read`.
- `figma-render.mjs` (render ad hoc) et `kit-inventory.mjs` → **supprimés sans remplacement**
  (clarif. 2026-06-12) : captures de référence du diff *verify* **fournies manuellement** (PNG Figma) ;
  KIT lu via `read 75:2963` + cibles `kit/…` de l'index. `.design/figma-data/kit-inventory.md` supprimé.
- `.design/figma-data/nodes.json` (monolithe 2,3 Mo) + `images.json` → supprimés (remplacés par
  `figma-cache/`).
- Assets quittent `public/figma/` pour `.design/figma-cache/assets/` (gitignoré).
- La skill **`estuaire-figma`** et le Principe VII de la constitution (qui citent nommément les
  anciens scripts) sont **mis à jour** vers les nouvelles commandes. Un **ADR** consigne la décision.
