---
tags: [decision, tooling, dev-workflow, worktrees, dispatch]
status: accepted
date: 2026-06-18
---
# 0015 — `/dispatch` : handoff worktree + tmux pour le travail ad-hoc (hors speckit)

## Context
L'ADR 0014 a câblé `/speckit.specify` pour créer un **worktree** (worktrunk) + ouvrir une **nouvelle
session Claude dans une fenêtre tmux**, enracinée dans ce worktree, qui enchaîne le flux spec-driven.
Mais ce handoff n'existait **que** par speckit. On veut le même bénéfice — détacher un travail dans son
propre worktree + session, en parallèle, sans encombrer la session courante — pour le travail **ad-hoc** :
une feature ou un changement qui ne mérite pas une spec complète (`spec.md` → `plan` → `tasks`).

Contrainte dure héritée de l'ADR 0014 : **une session Claude Code ne peut pas changer son cwd** ; ouvrir
une session dans le worktree est une action **shell** (tmux) ; **l'historique de chat ne traverse pas** la
frontière de session — il faut un artefact fichier pour porter le contexte (en speckit, c'est `spec.md`).

## Decision
Une commande **`/dispatch`** (`.claude/commands/dispatch.md`) + un script **`scripts/dispatch-worktree.sh`**,
qui réutilisent la plomberie worktrunk + tmux de l'ADR 0014, **sans** la machinerie speckit.

### 1. Pas de spec.md, pas de numérotation — un brief porte le contexte
Le script crée le worktree (`wt switch -c <slug> --yes`), démarre le serveur portless (hooks post-start),
résout le `WORKTREE_PATH` et renvoie un JSON. **Slug simple** (pas de préfixe `###-` : réservé à speckit,
donc zéro collision avec sa numérotation). **Pas d'in-place fallback** : un worktree est tout l'intérêt de
`/dispatch` ; si `wt` manque, on échoue clairement. Le contexte traverse la frontière via un **brief**
écrit dans **`<worktree>/.dispatch/brief.md`** (`.dispatch/` est gitignored → jamais commité ; robuste pour
un brief long, contrairement à un prompt inliné dans la commande tmux).

### 2. Claude décide pass-through vs enrichi, et direct vs reflect
La commande confie deux jugements à Claude (la session qui dispatche, qui a le contexte) :
- **pass-through vs enrichi** : demande nette one-shot → prompt brut ; demande retravaillée en discussion
  → brief synthétisé (décisions prises, alternatives écartées, contraintes, zones, critères).
- **`direct` vs `reflect`** : tâche mécanique claire → la nouvelle session implémente directement ; sujet
  qui demande conception/arbitrage → elle propose son approche, la fait valider, puis implémente. Le mode
  pilote la ligne de bootstrap tmux et la section « Approche » du brief.

### 3. Handoff tmux (même mécanisme que 0014) + offre proactive
Dans tmux : `tmux new-window -c <WORKTREE_PATH> "claude '<bootstrap court>'"` (bootstrap **sans apostrophe
ni guillemet double** — il est entre quotes simples dans un argument tmux entre guillemets ; le détail est
dans le brief). Hors tmux : fallback `wt switch <slug> -x claude`. Une **règle dans `CLAUDE.md`** demande
à Claude de **proposer `/dispatch` de façon proactive** quand une implémentation **substantielle** est
prête (feature / changement multi-fichiers — pas un one-liner, une question, ou un ajustement du diff
courant), avant d'éditer. La règle (toujours en contexte) porte le déclencheur proactif ; la commande
porte la procédure ; aucun skill (l'auto-trigger « prêt à implémenter » serait flou, et les commandes sont
le pattern des procédures dans ce repo — cf. speckit).

## Consequences
- ✅ `/dispatch [desc]` → slug (Claude) + worktree (worktrunk) + brief dedans + nouvelle fenêtre tmux avec
  Claude qui lit le brief et travaille. La session courante reste libre ; le travail part en parallèle.
- ✅ Couvre le cas non-speckit, avec le même modèle de frontière de session que l'ADR 0014.
- ✅ Offre proactive : on n'a plus à y penser — Claude propose le worktree au bon moment.
- ⚠️ **Frontière de session incontournable** (comme 0014) : c'est une NOUVELLE session ; le `brief.md`
  porte le contexte, pas l'historique de chat. Soigner le brief = qualité du handoff.
- ⚠️ `.dispatch/` doit être **gitignored sur la branche de base** pour que les worktrees l'héritent (fait
  ici). Le bootstrap rappelle malgré tout de ne jamais le commiter.
- ⚠️ Hors tmux → fallback manuel (`wt switch -x claude` puis « lis `.dispatch/brief.md` »).
- ⚠️ Nettoyer un worktree non commité : `wt remove --force`.

## Notes
- **Fichiers OWNED** (non vendored, contrairement à `create-new-feature.sh`/`speckit.specify.md` de
  l'ADR 0014) : `scripts/dispatch-worktree.sh`, `.claude/commands/dispatch.md` — pas de re-application à
  prévoir lors d'un upgrade spec-kit.
- **Base de branche** : `wt switch -c` part du HEAD courant → lancer `/dispatch` depuis `main` (cas normal).
- Évolution possible (déjà notée en 0014) : un hook `SessionStart` qui injecte le brief en
  `additionalContext` pour toute session ouverte dans un worktree, au lieu du bootstrap inliné dans tmux.
