# Contrat — Formats de fichiers du cache

Contrats de **forme** (au-delà des exemples de `data-model.md`) : ce qu'un consommateur (l'agent, la
CI, un futur outil) peut **tenir pour acquis** sur chaque fichier. Tout est JSON UTF-8, indenté 2
espaces, **versionné** sauf `assets/`.

## Invariants transverses

- **Encodage des ids** : un id Figma brut conserve `:` dans les **clés JSON** (`nodeToFrame`,
  `index.json`) ; un id devient `<safe-id>` (`:`/`;` → `-`) **uniquement** dans les **noms de
  fichiers** (`frames/51-2221.json`, `assets/51-2380.png`). Correspondance univoque (cas limite
  « séparateurs spéciaux »).
- **Lisible sans token** : aucun fichier versionné ne contient de secret ; un checkout neuf lit tout
  le cache hors-ligne (EF-011, CS-009).
- **Lossless** : `frames/*.json#document` est le node Figma **verbatim** — un consommateur retrouve
  100 % des champs source (CS-001). Toute vue « digest » est dérivée à la lecture, jamais substituée.

## `config.json`
- Champs requis : `fileKey` (string), `pageId` (string, node `CANVAS`), `pageName` (string).
- Optionnel : `breakpoints` (objet `{desktop,tablet,mobile}` → largeurs px).
- Stable : modifié manuellement seulement si le fichier/canvas Figma cible change.

## `manifest.json`
- `source` : `{ fileKey, pageId, pageName, lastModified, version, collectedAt }` — tous requis après
  une collecte réussie. `version` = clé d'autorité pour la fraîcheur.
- `frames[]` : chaque entrée `{ id, file, name, type, width, height, nodeCount, imageRefs[], assets[] }` ;
  `file` pointe vers un fichier existant sous `frames/`.
- `nodeToFrame` : map **exhaustive** (tout node id de la page → id de sa frame de premier niveau).
- `missingAssets[]` : ids de nodes à image dont le render a échoué ; **vide** ⇔ collecte complète.
- **Auto-généré** : réécrit en entier à chaque `collect`. Ne jamais éditer à la main.

## `frames/<safe-id>.json`
- `meta` : `{ id, name, breakpoint, width, height, nodeCount, collectedAt, sourceVersion }`.
- `document` : node Figma brut, sous-arbre complet (récursif via `children`).
- `styles` / `components` / `componentSets` : sous-ensembles référencés par la frame (peuvent être
  vides). Garantissent l'**autonomie** de lecture (EF-007).
- **Autosuffisant** : interprétable sans charger `manifest.json` ni une autre frame.

## `index.json`
- `targets` : map `nom métier → { description, node, image? }`.
  - `description` : string **non vide** (CS-007).
  - `node` : objet à **1–3** clés parmi `desktop|tablet|mobile`, chaque valeur = id Figma brut présent
    dans `manifest.nodeToFrame`.
  - `image` (optionnel) : mêmes breakpoints que `node` → chemin du render de référence versionné
    (`assets/<id>.png`). `status` vérifie l'existence du fichier déclaré.
- **Curé à la main** (dev + agent). `collect` ne le réécrit jamais.
- Une nouvelle cible = une entrée ajoutée (une seule édition, < 1 min — CS-008).

## `assets/` (**versionné** — révision 2026-06-12)
- Renders de page (exports pleine page, fournis manuellement) + sources d'image-fills, nommés
  `<safe-id>.<ext>` → **1:1 avec leur node** (lien infaillible).
- **Trackés** (versionnés) : sous quota, le re-download n'est pas fiable et l'IA a besoin des
  références visuelles ; `.design/` est dev-only (jamais servi), donc aucun impact prod. Un asset
  manquant reste **signalé**, jamais inventé.
- `read` surface le lien (`# render: …` en en-tête, `asset=…` sur les nodes à fill IMAGE) ; `status`
  vérifie que tout render déclaré dans `index.json.image` existe.

## Garanties de compatibilité

- Un consommateur DOIT pouvoir : (a) `read` un node par id en lisant `manifest.nodeToFrame` puis la
  frame ; (b) découvrir les cibles via `index.json` seul ; (c) juger la fraîcheur via
  `manifest.source.version` ; (d) détecter une collecte partielle via `manifest.missingAssets`.
- L'ajout de champs **optionnels** à `meta`/`source` est non-cassant ; retirer un champ requis ou
  changer l'encodage des ids est **cassant** (exigerait une recollecte complète).
