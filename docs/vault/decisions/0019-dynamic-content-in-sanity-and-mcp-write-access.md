# 0019 — Contenu dynamique dans Sanity & accès d'écriture par MCP

- **Date** : 2026-06-21
- **Statut** : accepté
- **Liens** : [[decisions/0004-content-images-in-sanity]], [[decisions/0006-schema-derived-types-and-typed-seeds]],
  [[decisions/0010-figma-local-cache]]

## Contexte

Le dépôt utilise **git LFS** pour deux arbres binaires : `seed-assets/` (images de maquette du
socle, lues par le seed) et `.design/figma-cache/assets/` (cache Figma, dev-only). Le plan GitHub
gratuit n'offre que **1 GB de stockage LFS + 1 GB de bande passante/mois**. Constat (2026-06-21) :

- Empreinte LFS dédupliquée sur tout l'historique ≈ **620 MB** (le checkout courant ≈ 195 MB ; le
  reste = anciennes versions du cache Figma, re-collecté plusieurs fois — GitHub ne fait pas de GC).
- La contrainte qui mord en premier est la **bande passante**, pas le stockage : la CI re-télécharge
  le LFS à chaque run (`seed-sanity.yml`, `actions/checkout` avec `lfs: true`).

Surtout : mettre du **contenu éditorial dynamique** (les réalisations — 1ʳᵉ *collection*, cf.
[[realisations-feature-plan]]) dans git LFS est une **impasse structurelle** — chaque réalisation
gonflerait l'historique git **pour toujours** (un objet supprimé reste stocké/facturé), et le
volume est **non borné** dans le temps. Le socle, lui, est borné (un seul jeu, ~48 MB).

## Décision

### D1 — Frontière : socle statique (git+CI) vs contenu dynamique (Sanity direct)

- **Socle statique** (singletons : home, expertises, secteurs, footer, about + leurs images de
  maquette) → reste géré par le pattern **seed typé + CI** ([[decisions/0006-schema-derived-types-and-typed-seeds]]).
  Assets dans `seed-assets/` (LFS, **borné**), uploadés vers Sanity par le runner.
- **Contenu dynamique / collections** (réalisations…) → vit **dans Sanity directement**. Les images
  vont aux **assets Sanity** (CDN), **jamais** dans git/LFS ni `seed-assets/`. Étend
  [[decisions/0004-content-images-in-sanity]] (images de contenu dans Sanity) à la dimension
  *stockage du dynamique* : la marge Sanity (Free : 100 GB assets + 100 GB bande passante/mois) est
  **100× celle de LFS**, avec un CDN d'images natif (resize/format à la volée).

### D2 — Réalisations : éditeur-first, non seedées

Le client crée ses réalisations dans le **Studio** ; les photos sont uploadées aux assets Sanity.
Elles **ne sont pas** dans le seed CI (qui ne porte que le socle statique). L'agent **peut** aussi
ajouter du contenu réalisation si besoin (via le MCP — cf. D3/D4).

### D3 — Accès d'écriture de l'agent : MCP Sanity officiel

Adoption du **serveur MCP Sanity officiel distant** (`https://mcp.sanity.io`, OAuth, hébergé par
Sanity), ajouté en **scope projet** (`.mcp.json` committé → proposé dans chaque worktree/session
Estuaire ; chacun s'authentifie avec son compte). ~40 outils (CRUD documents, GROQ, schéma,
releases, upload d'assets).

- **Quotas/limites** : le MCP n'a **pas de quota propre**. Seules s'appliquent les limites de l'API
  Sanity (25 req/s en mutation, 25 req/s en upload d'asset, corps 100 MB) — sans objet à notre
  échelle — et les quotas de plan (ci-dessus). **Aucun plan payant requis.**
- **Rejeté** : (a) le `@sanity/mcp-server` **local — déprécié** (repo archivé, remplacé par le
  distant) ; (b) un **MCP custom** — la règle « évaluer avant d'ajouter » (Principe IV /
  Dépendances) penche pour l'officiel, sain et maintenu, plutôt que du fait-maison à maintenir. On
  ne le reconsidérera que si un besoin concret manque (ex. écritures validées *côté CI*, que
  l'OAuth interactif du MCP distant ne couvre pas en headless).

### D4 — Garde-fou prod : dev libre, prod sur autorisation explicite

- **Projet dev** = `wje1fhkq` (*showcase-dev*) → écriture libre (create/update/upload), sans accord.
- **Projet prod** = `vbuzs69z` (*showcase*) → uniquement sur **autorisation explicite et par
  action** de Pierre. Tout appel MCP vise le projet **dev par défaut** ; bascule sur prod seulement
  sur consigne claire, pour cette action précise.
- ⚠️ **Les deux projets ont un dataset nommé `production`** : c'est le **`projectId`** qui distingue
  dev de prod, **jamais** le nom du dataset (sinon on écrirait en prod en croyant être en dev).

Cela **amende** la conséquence d'[[decisions/0006-schema-derived-types-and-typed-seeds]] (« il n'y
a pas de chemin local pour écrire prod ») : il existe désormais un chemin (le MCP, via l'OAuth de
Pierre), mais il est **gardé par une autorisation humaine explicite**, plus par l'impossibilité. Le
**write token prod reste CI-only** (le MCP n'utilise pas ce token mais l'OAuth) ; la **CI demeure
le seul chemin pour seeder/réinitialiser le socle reproductible**.

### D5 — Bande passante LFS : la CI ne pull que `seed-assets/`

`seed-sanity.yml` passe en `actions/checkout` `lfs: false` + un `git lfs pull --include="seed-assets/**"`
explicite : le seed ne lit que `seed-assets/` (~48 MB), jamais `.design/figma-cache/` (dev-only,
~150 MB). Économie ≈ **147 MB de bande passante LFS par run**.

## Conséquences

- **Marge de stockage** : le contenu dynamique n'aggrave plus l'empreinte LFS ; Sanity (100 GB)
  remplace LFS (1 GB) pour tout ce qui croît dans le temps.
- **Posture sécurité** : ADR 0006 mis à jour (prod n'est plus *strictement* CI-only en écriture ;
  désormais CI pour le socle + agent-via-MCP-sur-autorisation pour le reste).
- **Constitution** : Principe IX étendu (frontière socle/dynamique) et section « Variables
  d'environnement » mise à jour (chemin d'écriture prod + garde-fou). Bump MINOR.
- **CLAUDE.md** : nouvelle section « Sanity Write Access (MCP) » + entrée « Do NOT ».
- **Mémoire agent** : règle gravée (`sanity-write-strategy` — dev libre / prod sur autorisation).
- **À vérifier hors-code** : si **Coolify** clone le repo avec LFS activé, chaque déploiement tire
  ~195 MB — bien plus que la CI. Le `.dockerignore` exclut `seed-assets/`+`.design/` du *build*,
  pas du *clone*. À regarder dans l'UI Coolify (pas de modif config sans mention — CLAUDE.md).
