---
tags: [decision, tooling, dev-workflow, worktrees, parallel]
status: accepted
date: 2026-08-24
supersedes: ["0014", "0015"]
amends: ["0013"]
---
# 0031 — Le développement parallèle sort du dépôt

## Context
Les ADR 0013, 0014 et 0015 ont installé **dans le dépôt** tout un dispositif de développement
parallèle : documentation d'installation machine, section dédiée dans `CLAUDE.md`, commandes
`/dispatch` et `/end-session`, scripts, et un handoff de session par **tmux** greffé sur
`/speckit.specify`.

Deux choses ont changé.

**La contrainte qui justifiait le handoff n'existe plus.** Les ADR 0014 et 0015 reposaient sur un
fait alors vérifié : *une session Claude Code ne peut pas changer son répertoire de travail*. D'où
la fenêtre tmux, la nouvelle session, et le `brief.md` chargé de porter le contexte à travers la
frontière. Aujourd'hui Claude Code expose `EnterWorktree` / `ExitWorktree`, et le **plugin Claude de
worktrunk** implémente les hooks `WorktreeCreate` / `WorktreeRemove` : la création d'un worktree est
routée vers `wt switch --create` (les hooks du dépôt s'exécutent, le worktree atterrit au chemin
configuré) et la session **adopte** ce chemin. Plus de frontière, donc plus rien à faire traverser.

**Le reste n'était pas une décision de projet.** La disposition des worktrees, l'outillage, le
plugin, la façon d'ouvrir une session : ce sont des choix de **poste de travail**, propres au
développeur, pas au dépôt. Les décrire ici les figeait pour tout le monde et les dupliquait avec la
méthode générale, qui vit hors dépôt (skill `parallel-dev` du layer `claude-base`).

## Decision

### 1. Toute la documentation du dispositif quitte le dépôt
Supprimés : `docs/worktrees-portless-setup.md`, la section « Parallel Dev — Worktrees » de
`CLAUDE.md`, la section « Développement parallèle » du `README`. La méthode — structure du dépôt,
`worktree-path`, choix d'un port ou d'un nom d'hôte, pièges — est décrite une fois, hors dépôt.

Ce qui reste ici est ce que **seul le dépôt sait**, et qui a été regroupé dans un
`docs/dev-setup.md` court : la clé git-crypt, portless comme prérequis de `npm run dev`, et les
origines CORS du projet Sanity *dev*.

### 2. Les commandes de handoff sont supprimées
Supprimés : `/dispatch`, `scripts/dispatch-worktree.sh`, l'entrée `.dispatch/` du `.gitignore`,
`/end-session`, `scripts/end-session.sh`, et la règle de `CLAUDE.md` qui demandait de proposer
`/dispatch` de façon proactive. Le nettoyage d'un worktree se fait par l'outil (`wt remove`), pas
par une commande du projet.

`/speckit.specify` ne lance plus de fenêtre tmux : après avoir écrit le spec, il appelle
`EnterWorktree` sur le `WORKTREE_PATH` renvoyé par `create-new-feature.sh`, et **la même session**
poursuit `plan → tasks → implement` dans le worktree.

### 3. Ce qui reste au dépôt, et pourquoi
- **`.config/wt.toml`** (committé) : les hooks de bootstrap d'un worktree — `npm ci`, puis le
  serveur de dev `tether`é. Seul le dépôt sait quel gestionnaire de paquets et quel serveur. Le
  fichier est **inerte** pour qui n'utilise pas worktrunk : il n'impose rien à un contributeur en
  dev classique. `[list] url` y reste aussi par contrainte technique — worktrunk ne lit cette clé
  qu'en config projet (vérifié, v0.74).
- **`npm run dev` = `portless run next dev`** : convention de projet, pas de poste. Le port ne fait
  pas partie de la portée d'un cookie ([RFC 6265](https://datatracker.ietf.org/doc/html/rfc6265)) :
  deux serveurs sur `localhost:1xxxx` partagent le même pot de cookies et la session du **Studio
  Sanity embarqué** ouverte dans l'un écrase celle de l'autre. C'est ce qui justifie les URLs
  nommées plutôt qu'un port par branche — pas la lisibilité. Sortie de secours : `PORTLESS=0`.

Au passage, le hook n'exporte plus `SITE_PREVIEW_TOKEN=` : le gate de pré-lancement a été retiré au
lancement du site (ADR 0007), l'override était devenu un no-op.

## Consequences
- ✅ Une seule commande pour partir sur un sujet : la session crée le worktree et s'y déplace. Plus
  de brief, plus de fenêtre tmux, plus de contexte perdu au passage.
- ✅ Le dépôt s'allège de deux commandes, deux scripts et deux documents qui doublonnaient
  l'outillage du poste. Ce qui reste tient en un `wt.toml` de 20 lignes et un `dev-setup.md`.
- ⚠️ **Un seul saut de worktree par session** : la première entrée accepte tout worktree listé par
  `git worktree list`, pas la suivante. Une session, un sujet.
- ⚠️ Les hooks d'un plugin se chargent au **démarrage** : installer le plugin worktrunk n'a aucun
  effet sur la session en cours.
- ⚠️ Un nouveau poste ne trouve plus dans le dépôt comment installer le dev parallèle. C'est
  assumé : il n'y a pas de « bonne » installation à imposer, et la méthode est décrite ailleurs.

## Notes
- **ADR 0014 et 0015 sont `superseded`** par celle-ci. L'**ADR 0013** ne garde de sa portée que ce
  qui est incarné dans le dépôt (script `dev` via portless, hooks `wt.toml`, filtres git-crypt) ;
  son §2 (proxy `:1355`), son §5 (logs) et sa disposition des worktrees relèvent désormais du poste.
- Le **post-mortem 0012** (`kill-window` sans cible, qui a détruit une fenêtre tierce) devient
  historique : plus aucun code du dépôt ne pilote tmux. Sa leçon — jamais de commande destructrice
  sans cible explicite — ne l'est pas.
- Les ADR 0021, 0022, 0028 et 0029 mentionnent `/dispatch` comme **origine** du travail qu'elles
  décrivent. Ce sont des faits datés : on ne les réécrit pas.
