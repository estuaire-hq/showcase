# Phase 1 — Modèle de données (formes du cache)

**Feature** : Cache Figma local & lecteur offline · **Branche** : `004-figma-local-cache`

Le « modèle » de cette feature n'est pas un schéma de base de données mais l'**ensemble des formes
de fichiers** du cache local, sur disque. Toutes les formes sont **JSON** (versionnables, lisibles
sans token). Les types sont décrits ici et reflétés en **interfaces TypeScript** dans
`.design/scripts/lib/types.ts` (`Config`, `Manifest`, `FrameFile`, `IndexEntry`) — vérifiées au
type-check, gardées à l'exécution par `status`.

Mapping vers les entités de la spec : **Cache de design** = l'arborescence entière ;
**Unité de découpe** = un *Frame file* ; **Node** = un nœud Figma brut (préservé tel quel) ;
**Asset d'image** = un fichier sous `assets/` + son entrée manifeste ; **Entrée d'index** = une
entrée de `index.json` ; **Métadonnées de collecte** = le bloc `source` du `manifest.json`.

---

## Arborescence du cache

```text
.design/figma-cache/
├── config.json          # constantes structurelles (fileKey, pageId désigné)        [versionné]
├── manifest.json        # auto-généré : routage node→frame + méta de collecte        [versionné]
├── index.json           # curé (dev+agent) : noms métier → nodes + descriptions      [versionné]
├── frames/
│   ├── 51-2221.json     # 1 frame de premier niveau = 1 fichier (sous-arbre lossless)[versionné]
│   ├── 77-3149.json
│   └── …                # ~30 fichiers (pages × breakpoints + KIT + variantes)
└── assets/              # renders PNG + sources d'image-fills, ré-téléchargeables     [GITIGNORÉ]
    ├── 51-2380.png
    └── …
```

---

## 1. `config.json` — constantes structurelles

Désigne **quoi** collecter. Édité rarement (≈ jamais), versionné.

```jsonc
{
  "fileKey": "Rv5HxXNkF6VkTke0ttdAbe",   // fichier Webdesign-ESTUAIRE
  "pageId": "51:2220",                    // canvas désigné « Webdesign-ESTUAIRE-V3 »
  "pageName": "Webdesign-ESTUAIRE-V3",    // pour auto-détection si l'id change
  "breakpoints": { "desktop": 1920, "tablet": 768, "mobile": 390 }
}
```

- `fileKey` / `pageId` surchargeable par `--page` ou env (`FIGMA_FILE_KEY`, `FIGMA_PAGE_ID`).
- **Règles** : `pageId` DOIT être un node `CANVAS`. Si absent, `collect` auto-détecte par `pageName`.

---

## 2. `manifest.json` — routage + métadonnées de collecte (auto-généré)

**Jamais édité à la main.** Réécrit atomiquement à chaque `collect`. C'est la **source de la lecture
par id** et de la **détection de péremption**.

```jsonc
{
  "source": {                              // ── Métadonnées de collecte (entité spec) ──
    "fileKey": "Rv5HxXNkF6VkTke0ttdAbe",
    "pageId": "51:2220",
    "pageName": "Webdesign-ESTUAIRE-V3",
    "lastModified": "2026-06-11T14:10:34Z", // de l'objet fichier Figma (affichage)
    "version": "2363833675921194926",       // id monotone Figma (comparaison de fraîcheur)
    "collectedAt": "2026-06-11T22:59:00Z"    // horodatage local de la collecte
  },
  "frames": [                              // une entrée par fichier frames/<safe-id>.json
    {
      "id": "51:2221",
      "file": "frames/51-2221.json",
      "name": "01/Webdesign-homepage-ESTUAIRE-V1",
      "type": "FRAME",
      "width": 1920,
      "height": 10666,
      "nodeCount": 487,                    // checklist de complétude (EF-004)
      "imageRefs": ["a1b2c3…", "d4e5f6…"], // imageRef présents dans cette frame
      "assets": ["assets/51-2380.png"]     // assets effectivement téléchargés pour cette frame
    }
    // …
  ],
  "nodeToFrame": {                         // ── table de routage : tout node id → sa frame ──
    "51:2221": "51:2221",
    "51:2339": "51:2221",                  // le hero vit dans la frame homepage-desktop
    "51:2380": "51:2221"
    // … une entrée par node de la page
  },
  "missingAssets": ["51:2999"]             // nodes à image dont le render a échoué (quota) — signalés
}
```

**Règles / invariants** :
- `nodeToFrame` couvre **tous** les nodes de la page (clé = id Figma brut avec `:`).
- `frames[*].file` pointe vers un fichier existant ; `status` détecte un fichier orphelin / manquant.
- `version` est la **clé de fraîcheur** (EF-019). `lastModified`/`collectedAt` pour l'humain.
- `missingAssets` ≠ vide ⇒ collecte **partielle** (reprenable) — `status` le signale, ne plante pas.

---

## 3. `frames/<safe-id>.json` — une frame autonome (sous-arbre **lossless**)

Un fichier **par frame de premier niveau** du canvas. **Autosuffisant** (EF-007) : contient le
sous-arbre Figma **complet, sans présélection** (EF-001), plus les tables référencées par cette frame
(pour rester lisible isolément). Le `document` est le **node Figma brut**, préservé tel quel.

```jsonc
{
  "meta": {
    "id": "51:2221",
    "name": "01/Webdesign-homepage-ESTUAIRE-V1",
    "breakpoint": "desktop",               // dérivé du nom/width (desktop|tablet|mobile|null)
    "width": 1920, "height": 10666,
    "nodeCount": 487,
    "collectedAt": "2026-06-11T22:59:00Z",
    "sourceVersion": "2363833675921194926" // pour repérer un fichier frame périmé isolément
  },
  "document": { /* node Figma BRUT, sous-arbre entier, TOUS les champs :
                   id, name, type, absoluteBoundingBox, opacity, fills (+per-paint opacity,
                   gradients, IMAGE+imageRef), strokes+strokeWeight+strokeAlign,
                   cornerRadius/rectangleCornerRadii, layoutMode/padding/itemSpacing/align,
                   effects, style (TEXT) + characters + characterStyleOverrides +
                   styleOverrideTable, children[…] récursif. AUCUN champ filtré. */ },
  "styles":        { /* styles référencés dans cette frame (id → {key,name,styleType}) */ },
  "components":    { /* components référencés (id → meta) */ },
  "componentSets": { /* componentSets référencés (id → meta) */ }
}
```

**Règles / invariants** :
- **Lossless** : `document` est copié **verbatim** depuis la réponse Figma — aucun champ retiré
  (CS-001 = 100 % des champs). Le *formatage* lisible (le « digest » façon `figma-node.mjs`) est
  produit **à la lecture**, jamais stocké à la place du brut.
- `breakpoint` est une **commodité** dérivée (width 1920→desktop, 768→tablet, 390→mobile, sinon null) ;
  n'altère pas le brut.
- Le fichier se lit **sans** charger `manifest.json` ni les autres frames (autonomie).

---

## 4. `index.json` — cibles nommées (curé dev + agent)

**Édité collaborativement.** Point d'entrée IA (P3). Mappe un **nom métier** → description + node(s)
par breakpoint.

```jsonc
{
  "targets": {
    "home/hero": {
      "description": "Hero de la page d'accueil : titre line-mask + slideshow plein écran.",
      "node": {
        "desktop": "51:2339",
        "tablet":  "77:3160",
        "mobile":  "77:3158"
      }
    },
    "footer": {
      "description": "BIG FOOTER : bandeau CTA + footer (4 col. légales) + bouton retour haut.",
      "node": { "desktop": "51:2222", "tablet": "77:3629", "mobile": "78:4371" }
    },
    "kit/bouton-envoyer": {
      "description": "Bouton 'envoyer' du KIT (état par défaut), flèche à droite.",
      "node": { "desktop": "75:3001" }     // une cible peut n'avoir qu'un breakpoint
    }
  }
}
```

**Règles / invariants** :
- Clé = **nom métier** stable (`domaine/élément`), insensible aux ids Figma bruts (EF-015/CS-008).
- `description` **obligatoire et non vide** (EF-013 ; CS-007 « aucune cible anonyme ») — `status`
  signale une description manquante.
- `node` porte **1 à 3** variantes parmi `desktop|tablet|mobile` (EF-014). `desktop` recommandé comme
  défaut. Lire sans `--bp` → `desktop` si présent, sinon l'unique variante, sinon erreur « ambigu ».
- Chaque id de `node` DOIT exister dans `manifest.nodeToFrame` — sinon `status` signale « node non
  collecté » et `read` échoue proprement (EF-005, cas limite).
- Déclarer une nouvelle cible = **une seule édition** de ce fichier, **< 1 min** (CS-008).

---

## Relations & cycle de vie

```text
config.json ──(collect)──► Figma REST ──► manifest.json + frames/*.json + assets/*
                                                  ▲                 ▲
index.json ──(read <nom>)──► nodeToFrame ─────────┘                 │
                                  │                                 │
                                  └──► frames/<frame>.json ──(extrait sous-arbre)──► stdout
status ──(1 appel depth=1)──► compare manifest.source.version  + réconcilie index.json ↔ frames/*
```

- **collect** (ré)écrit `manifest.json`, `frames/*.json`, `assets/*` ; **ne touche pas** `index.json`
  (curé) ni `config.json`.
- **read** est **100 % offline** (EF-002) : `index.json` → `manifest.nodeToFrame` → `frames/<id>.json`.
- **status** est le seul à toucher le réseau (1 appel léger), et seulement pour la fraîcheur ; la
  partie cohérence est offline.

## États du cache

| État | Condition | Détecté par |
|---|---|---|
| **Vide** | pas de `manifest.json` | `read`/`status` → « collecter d'abord » |
| **Complet** | `missingAssets` vide, frames cohérentes | `status` → OK |
| **Partiel** (reprenable) | `missingAssets` non vide | `status` → « renders manquants, relancer collect » |
| **Périmé** | `version` distante ≠ `manifest.source.version` | `status` (réseau) |
| **Incohérent** | entrée d'index → node/frame absent, ou frame orpheline | `status` (offline) |
| **Fraîcheur inconnue** | échec réseau **subi** (online attendu) | `status` → « inconnu », cache local intact |

**Codes de sortie `status`** : `0` cohérent (**Complet**, **Partiel** signalé, ou `--offline`) ·
`2` **Fraîcheur inconnue** subie (Figma injoignable alors qu'attendu) · `3` **Incohérent** (**prime
sur `2`**). Le cache **Partiel** n'est **pas** un échec de gate — la lecture des géométries reste
possible (EF-010), `status` le signale en exit `0`. `--offline` est un renoncement volontaire à la
fraîcheur (pas un `2`).
