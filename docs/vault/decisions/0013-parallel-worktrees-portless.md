---
tags: [decision, tooling, dev-workflow, worktrees, parallel]
status: accepted
date: 2026-06-17
---
# 0013 — Développement parallèle : worktrees (worktrunk) + URLs nommées (portless)

## Context
Le travail en parallèle (plusieurs features, plusieurs agents IA simultanés) passe par les
**git worktrees** : chacun son répertoire de travail, aucun conflit de fichiers. Deux
frictions subsistent : (1) l'UX git worktree est verbeuse (créer / lister / supprimer / merger
à la main) ; (2) surtout, chaque `npm run dev` veut le **port 3000** → collision dès le 2ᵉ
worktree.

Deux outils répondent à ces frictions, à **deux couches distinctes** :
- **worktrunk** (`wt`, CLI Rust) — cycle de vie des worktrees + hooks de lifecycle.
- **portless** (Vercel Labs) — reverse-proxy local qui donne à chaque app une **URL nommée
  stable** (`<nom>.localhost`) au lieu d'un port, avec **détection automatique du worktree**
  (la branche devient un sous-domaine, sans config).

worktrunk a *aussi* sa propre réponse au conflit de ports (le filtre `hash_port`, port
déterministe par branche). On a donc deux solutions au même problème — d'où l'arbitrage ci-dessous.

## Decision

### 1. portless possède les URLs/ports ; on n'utilise PAS `hash_port`
portless détecte le worktree tout seul et expose des URLs **nommées**
(`feat-x.estuaire.localhost`), bien plus lisibles qu'un port opaque (`localhost:16460`), et
**stables au restart** (routage par nom, pas par port → couper/relancer le serveur ne change
jamais l'URL). worktrunk se contente de *lancer* le serveur ; les deux ne se recouvrent pas.

### 2. Proxy en HTTP sur `:1355`, sans TLS (choix Pierre)
`portless service install --port 1355 --no-tls` : pas de sudo, pas de CA à faire confiance (y
compris pour les navigateurs headless de charlotte/playwright du pixel-review), au prix du HTTPS
— inutile en dev (le gate `SITE_PREVIEW_TOKEN` est off en local). URLs :
`http://[<branche>.]estuaire.localhost:1355`. Chromium résout `*.localhost` en loopback tout seul.

### 3. `npm run dev` passe par portless partout ; sortie de secours `PORTLESS=0`
`"dev": "portless run next dev"`. Main → `http://estuaire.localhost:1355` ; worktree `feat-x` →
`http://feat-x.estuaire.localhost:1355`. **Foolproof** : un agent qui tape `npm run dev` dans un
worktree ne peut PAS retomber sur le `:3000` partagé (sinon collision). Sortie de secours :
`PORTLESS=0 npm run dev` rebranche le classique `http://localhost:3000` (utile pour l'outillage
qui suppose encore `:3000`, ex. les skills pixel-review / run / verify). portless installé
globalement devient donc un **prérequis dev**.

### 4. worktrunk : config projet committée, install propre, serveur auto-démarré et « tethered »
`.config/wt.toml` (committé) : `[list] url` affiche l'URL portless par worktree ; pipeline
`[[post-start]]` = `npm ci` (install propre, préférée à la copie de `node_modules`) puis
`wt step tether -- npm run dev`. Le `tether` lie le process au worktree → tué au `wt remove`,
sans hook `pre-remove`. La `worktree-path` reste en **config utilisateur** (non committée ;
défaut sibling `../showcase.<branche>`).

### 5. Logs accessibles à l'agent nativement
La sortie du hook `server` (= stdout/stderr du dev server : compilation, erreurs, HMR) est
capturée par worktrunk :
`tail -f "$(wt config state logs get --hook=user:post-start:server)"`. Restart (obligatoire après
un changement `@theme` Turbopack, ou serveur planté) : `portless run --force next dev` (URL
inchangée). Nettoyage d'orphelins : `portless prune`.

### 6. git-crypt × worktrees : résoudre la clé depuis le git-dir commun
git-crypt 0.7.0 résout sa clé depuis le `GIT_DIR` du worktree lié
(`.git/worktrees/<nom>/git-crypt/keys/`), où elle n'est pas → tout `git worktree add` **avorte** sur
le smudge de `.env.development` (filtre `required`), bloquant `wt switch -c`. Fix **(Option A,
validé end-to-end)** : réécrire les filtres git-crypt du `.git/config` **local** pour forcer `GIT_DIR`
vers le dir commun avant d'appeler git-crypt —
`filter.git-crypt.smudge = GIT_DIR="$(git rev-parse --path-format=absolute --git-common-dir)" git-crypt smudge`
(+ `clean`, + `diff.textconv`). `filter.git-crypt.required` **reste à `true`** : aucun affaiblissement,
le chiffrement sur le checkout principal est inchangé. Config **locale** uniquement (non committée ;
CI et autres clones intacts). Alternatives écartées : `required=false` + hook de symlink de clé
(affaiblit le filet « avorter si le filtre échoue ») ; helper one-shot `git -c …` (perd le pur `wt switch -c`).

### 7. Approbation des hooks worktrunk
worktrunk exige une **approbation** des commandes de hook d'un config projet committé (protection
anti-config-malveillant), stockée dans `~/.config/worktrunk/approvals.toml`. Pré-approuver une fois :
`wt config approvals add` (ou passer `--yes` à `wt switch`). Sans ça, le premier `wt switch -c`
demande confirmation et **avorte** en shell non-interactif.

## Consequences
- ✅ N worktrees en parallèle, **zéro collision de port** ; URL nommée + stable par worktree.
- ✅ Création d'un worktree = deps installées + serveur up + URL dans `wt list`, en une commande
  (`wt switch -c <branche>`). Logs lisibles par l'agent.
- ✅ `.env.development` (git-crypt) **déchiffré** dans un worktree neuf grâce au fix de filtre (§6,
  validé end-to-end) ; sans lui, `git worktree add` avorte. `required` reste à `true`.
- ⚠️ **Prérequis dev** : portless global + worktrunk (`cargo install worktrunk`) + le proxy lancé
  (`portless service install …`). Documenté dans README + CLAUDE.md. Sans portless installé,
  `npm run dev` échoue → utiliser `PORTLESS=0 npm run dev`.
- ⚠️ **Dataset Sanity dev partagé** : tous les worktrees pointent le même projet Sanity *dev*
  (même `.env.development`) → pas de `npm run seed -- --reset` pendant qu'un autre worktree travaille.
- ⚠️ **CORS Sanity dev** : les nouvelles origines (`http://estuaire.localhost:1355` et
  `http://*.estuaire.localhost:1355`) doivent être ajoutées au projet *dev* (Studio embarqué →
  credentials) — étape manuelle (UI manage.sanity.io ou `sanity cors add`, en étant loggé sur le
  projet dev). `allowedDevOrigins` (`next.config.ts`) couvre déjà ces hôtes côté Next.
- ⚠️ Outillage supposant `localhost:3000` (skills pixel-review / run / verify) : utiliser
  `PORTLESS=0 npm run dev`, ou cibler l'URL portless (`portless list`).

## Notes
- Versions épinglées à l'ajout : **portless 0.14.0**, **worktrunk** via `cargo install` (cargo 1.95).
  portless est **pré-1.0** : le format du state-dir peut changer entre versions (re-`portless trust`
  possible) — on n'utilise pas TLS, l'impact est donc limité.
- HMR Next à travers le proxy : à confirmer empiriquement au 1er worktree (très probable — portless
  proxifie aussi les WebSockets des dev servers).
- Alternative écartée : copie de `node_modules` entre worktrees (`wt step copy-ignored`) — plus
  rapide au cold start, mais on a préféré l'isolation d'un `npm ci` propre.
