# Développement parallèle — worktrees (worktrunk) + portless

Installation **une seule fois par machine** pour mener plusieurs features de front (un worktree par
feature / par agent) sans que les serveurs de dev se marchent dessus.

- Le *pourquoi* et les arbitrages → [ADR 0013](vault/decisions/0013-parallel-worktrees-portless.md).
- Le workflow au quotidien (commandes, URLs, logs, restart) → section « Parallel Dev — Worktrees »
  de [`CLAUDE.md`](../CLAUDE.md).

## 1. Outils

```bash
cargo install worktrunk && wt config shell install     # ou : brew install worktrunk
npm i -g portless                                       # version connue-bonne : 0.14.0
```

`wt config shell install` pose l'intégration shell (la fonction `wt`, qui permet le `cd` entre worktrees).

## 2. Proxy portless (port 1355, HTTP, sans TLS)

Le proxy est **global à la machine** — un seul démon, partagé par tous les projets. Installation
persistante en service systemd (**nécessite sudo**) :

```bash
sudo env "PATH=$PATH" portless service install --port 1355 --no-tls
```

Alternative sans sudo, à relancer par session :

```bash
portless proxy start -p 1355 --no-tls
```

## 3. git-crypt × worktrees

git-crypt 0.7.0 résout sa clé depuis le git-dir du worktree lié (où elle n'est pas) → `git worktree
add` avorterait sur le déchiffrement de `.env.development`. On réécrit les filtres git-crypt du
`.git/config` **local** pour résoudre la clé depuis le git-dir **commun**. `filter.git-crypt.required`
reste à `true` (aucun affaiblissement) ; config locale uniquement (CI / autres clones intacts).

```bash
git config filter.git-crypt.smudge 'GIT_DIR="$(git rev-parse --path-format=absolute --git-common-dir)" git-crypt smudge'
git config filter.git-crypt.clean  'GIT_DIR="$(git rev-parse --path-format=absolute --git-common-dir)" git-crypt clean'
git config diff.git-crypt.textconv 'GIT_DIR="$(git rev-parse --path-format=absolute --git-common-dir)" git-crypt diff'
```

## 4. Approbation des hooks worktrunk

worktrunk demande à approuver les commandes de hook du projet (`.config/wt.toml`) au premier
`wt switch -c`. Pré-approuver une fois (terminal interactif requis) :

```bash
wt config approvals add
```

Alternative : passer `--yes` à chaque `wt switch` (`wt switch --yes -c <branche>`) — bypasse l'approbation.

## 5. CORS du projet Sanity *dev*

Le Studio embarqué (`/studio`) est servi via les URLs portless → ajouter ces origines aux CORS du
projet Sanity **dev** (credentials requis). Le plus simple via l'UI manage.sanity.io (projet dev →
API → CORS origins), sinon en CLI après `npx sanity login` :

```bash
node --env-file=.env.development ./node_modules/.bin/sanity cors add http://estuaire.localhost:1355 --credentials
node --env-file=.env.development ./node_modules/.bin/sanity cors add 'http://*.estuaire.localhost:1355' --credentials
```

(le wildcard demande une confirmation interactive → répondre oui)

## 6. tmux — pour le handoff `/speckit.specify` (recommandé)

`/speckit.specify` crée un worktree et, si Claude tourne **dans tmux**, ouvre une nouvelle fenêtre tmux
avec Claude dans ce worktree (sinon il imprime `wt switch <slug> -x claude` à lancer à la main). Pour en
profiter, lance ta session Claude dans tmux :

```bash
sudo apt install tmux     # 3.4+
tmux                      # puis, dans tmux :
claude
```

Voir l'[ADR 0014](vault/decisions/0014-speckit-worktree-tmux-handoff.md).

## Vérifier

```bash
wt switch -c test-setup     # crée un worktree, installe les deps, démarre le serveur
wt list                     # affiche l'URL : http://test-setup.estuaire.localhost:1355
# ouvrir l'URL → la page Estuaire doit s'afficher, puis :
wt remove                   # nettoie (serveur arrêté automatiquement)
```
