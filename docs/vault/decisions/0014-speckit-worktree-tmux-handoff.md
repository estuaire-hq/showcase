---
tags: [decision, tooling, dev-workflow, speckit, worktrees]
status: accepted
date: 2026-06-17
---
# 0014 — `/speckit.specify` crée un worktree + handoff de session via tmux

## Context
Depuis l'ADR 0013, le dev parallèle passe par des worktrees (worktrunk + portless). `/speckit.specify`
faisait un `git checkout -b` qui bascule le checkout courant sur la nouvelle branche — pas un worktree.
On veut qu'il **crée directement un worktree**, et que le travail (plan/tasks/implement) continue
**dans** ce worktree. Contrainte dure (vérifiée — recherche Claude Code v2.1) : **une session Claude Code
ne peut pas changer son cwd en cours de route** ; pas de hand-off programmatique entre sessions ; ouvrir
une session dans le worktree est une action **shell**. `--add-dir` ne charge ni le `CLAUDE.md` ni les
skills/hooks du dossier ajouté.

## Decision

### 1. specify crée un worktree via worktrunk (slug dérivé par Claude)
`create-new-feature.sh` : Claude génère le short-name (slug, exigence « c'est Claude qui trouve le slug ») ;
le script remplace `git checkout -b` par `wt switch -c <slug> --yes` (worktrunk → worktree frère + `npm ci`
+ serveur portless via les hooks post-start). **main reste sur sa branche.** Le `spec.md` est écrit **dans
le worktree** (`<worktree>/specs/<slug>/spec.md`) ; le script renvoie `WORKTREE_PATH` dans son JSON.
Fallback en branche in-place si `wt` est absent.

### 2. Handoff vers la session worktree via tmux (frontière de session incontournable)
La commande `.claude/commands/speckit.specify.md` finit par ouvrir la session worktree : si dans tmux
(`$TMUX` défini), `tmux new-window -c <WORKTREE_PATH> "claude '<bootstrap>'"` ouvre une nouvelle fenêtre
tmux avec Claude **dans** le worktree, amorcée pour enchaîner `/speckit.plan` → `/speckit.tasks` →
`/speckit.implement`. Hors tmux : fallback `wt switch <slug> -x claude` (lancé par l'utilisateur). Le
**contexte traverse la frontière via le `spec.md`** (+ le prompt initial), pas via l'historique de chat —
by design spec-kit.

### 3. Prérequis : Claude lancé dans tmux
Le `tmux new-window` du skill s'attache à la session tmux courante (il hérite de `$TMUX`). La session
Claude principale doit donc tourner **dans tmux** (sinon fallback manuel). tmux 3.4 installé.

## Consequences
- ✅ `/speckit.specify <desc>` → slug (Claude) + worktree (worktrunk) + spec dedans + nouvelle fenêtre
  tmux avec Claude dans le worktree, en une commande. main reste propre.
- ✅ plan/tasks/implement tournent nativement dans le worktree (cwd = worktree, branche = feature →
  chemins speckit corrects via `get_feature_paths`).
- ⚠️ **Frontière de session incontournable** : c'est une NOUVELLE session (pas l'historique courant) ;
  le `spec.md`/plan/tasks portent le contexte. Claude Code ne sait pas déplacer une session.
- ⚠️ **Fichiers vendored** : `create-new-feature.sh` et `.claude/commands/speckit.specify.md` sont des
  fichiers spec-kit ; les modifs (bloc worktree, étape 8) sont à **re-appliquer si on upgrade spec-kit**
  (elles sont marquées en commentaire / par cette ADR).
- ⚠️ Hors tmux → fallback manuel (`wt switch -x claude`).
- ⚠️ Nettoyer un worktree dont le spec n'est pas commité : `wt remove --force` (sinon refus sur untracked).

## Notes
- Alternatives écartées : `claude --worktree` natif (`.claude/worktrees/`, `--tmux` orienté iTerm2/macOS,
  met worktrunk de côté) ; `claude --bg` autonome (moins de contrôle aux gates) ; `--add-dir` (file-access
  only, config non chargée).
- Évolution possible : un hook `SessionStart` qui injecte `additionalContext`/`initialUserMessage` pour
  bootstrapper toute session ouverte dans un worktree, au lieu du prompt embarqué dans la commande tmux.
