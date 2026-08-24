# Setup dev — une fois par machine

Ce que le dépôt suppose déjà en place avant le premier `npm run dev`.

## 1. Clé git-crypt

`.env.development` est chiffré dans git par git-crypt, en **clé symétrique** (pas de trousseau GPG
dans le dépôt) : un clone neuf ne l'a pas et le fichier reste illisible.

```bash
git-crypt unlock <chemin de la clé>   # sauvegardée hors dépôt
```

Si le dépôt est utilisé avec des worktrees git, ajouter ceci une fois : git-crypt 0.7.0 cherche sa
clé dans le git-dir du worktree lié, où elle n'est pas, et `git worktree add` avorte sur le smudge.
Les filtres de la config **locale** la résolvent depuis le git-dir commun (`required` reste à `true`,
aucun affaiblissement ; CI et autres clones intacts) :

```bash
git config filter.git-crypt.smudge 'GIT_DIR="$(git rev-parse --path-format=absolute --git-common-dir)" git-crypt smudge'
git config filter.git-crypt.clean  'GIT_DIR="$(git rev-parse --path-format=absolute --git-common-dir)" git-crypt clean'
git config diff.git-crypt.textconv 'GIT_DIR="$(git rev-parse --path-format=absolute --git-common-dir)" git-crypt diff'
```

## 2. portless (prérequis de `npm run dev`)

`npm run dev` est câblé sur `portless run next dev` : le serveur est servi par le proxy local sous
un nom stable, `http://estuaire.localhost:1355`, plutôt que sur un port. Sans portless installé, la
commande échoue — sortie de secours `PORTLESS=0 npm run dev` (classique `localhost:3000`).

```bash
npm i -g portless
sudo env "PATH=$PATH" portless service install --port 1355 --no-tls   # démon global à la machine
# sans sudo, à relancer par session : portless proxy start -p 1355 --no-tls
```

## 3. CORS du projet Sanity *dev*

Le Studio embarqué (`/studio`) est servi via ces URLs → les origines doivent être déclarées dans les
CORS du projet Sanity **dev** (credentials requis). Via l'UI manage.sanity.io (projet dev → API →
CORS origins), ou en CLI après `npx sanity login` :

```bash
node --env-file=.env.development ./node_modules/.bin/sanity cors add http://estuaire.localhost:1355 --credentials
node --env-file=.env.development ./node_modules/.bin/sanity cors add 'http://*.estuaire.localhost:1355' --credentials
```

(le wildcard demande une confirmation interactive → répondre oui ; `allowedDevOrigins` dans
`next.config.ts` couvre déjà ces hôtes côté Next)

## Au quotidien (portless)

- **Un 404 sur `estuaire.localhost:1355` n'est pas une app cassée** : le proxy renvoie 404 pour tout
  nom dont il n'a pas de route vivante. Vérifier `portless list` ; si la route manque, relancer
  proprement (couper le serveur, puis `npm run dev` — ce qui ré-enregistre la route de façon
  fiable). `portless run --force next dev` peut laisser la route **non enregistrée** : le serveur
  répond alors sur son `localhost:<port>` brut pendant que le nom 404e. Post-mortem 0011.
- **Nettoyage** : `portless prune` tue les serveurs orphelins laissés par des sessions plantées.
