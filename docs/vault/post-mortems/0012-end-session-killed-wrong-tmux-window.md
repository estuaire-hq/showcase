# 0012 — `/end-session` a tué la mauvaise fenêtre tmux (`kill-window` sans cible)

- **Date** : 2026-06-20
- **Commande** : `/end-session` (ADR 0015 ; inverse de `/dispatch` & `/speckit.specify`)
- **Liens** : [[decisions/0014-speckit-worktree-tmux-handoff]], [[decisions/0015-dispatch-adhoc-worktree-handoff]],
  [[post-mortems/0011-portless-route-404-and-worktree-gate]]

## Symptôme

À la fin de la feature 011, `/end-session` a correctement supprimé le worktree + la branche locale,
puis a exécuté son étape 3 (fermeture tmux) avec **`tmux kill-window`** (sans cible). Résultat : ce
n'est **pas** la fenêtre de la session worktree qui s'est fermée, mais une **autre fenêtre du
client, où un travail était en cours** — perdu (une fenêtre tmux tuée envoie SIGHUP à ses process,
aucun « undo »).

## Cause racine

`tmux kill-window` **sans `-t`** ne vise pas la fenêtre de l'appelant : il tue la **fenêtre active
du client attaché** — celle que l'utilisateur regarde à cet instant. tmux détermine la « fenêtre
courante » via `$TMUX_PANE` *s'il est défini* ; sinon il retombe sur la fenêtre active de la session.

Deux facteurs ont aligné le piège :
1. L'agent lance `kill-window` depuis un **sous-shell** (l'outil bash), pas depuis le pane interactif.
2. Juste avant, le script avait supprimé le répertoire courant (le worktree) → le shell de l'agent a
   vu son `cwd` « récupéré » vers `$HOME`, contexte dans lequel `$TMUX_PANE` pouvait être absent →
   `kill-window` est retombé sur la **fenêtre active du client** = le travail en cours de
   l'utilisateur, dans une autre fenêtre.

La commande `/end-session` **prescrivait** explicitement la forme nue `tmux kill-window` (étape 3),
en supposant à tort qu'elle viserait « cette fenêtre ». C'est le défaut.

## Fix

Fermer la fenêtre **par identifiant explicite**, capturé de façon déterministe **avant** tout
teardown (environnement intact) :

1. **`scripts/end-session.sh`** capture, juste après ses guards, l'id de fenêtre et de session de
   **cette** session via `$TMUX_PANE` :
   ```bash
   TMUX_WINDOW=$(tmux display-message -p -t "$TMUX_PANE" '#{window_id}')   # ex. @2
   TMUX_SESSION=$(tmux display-message -p -t "$TMUX_PANE" '#{session_id}') # ex. $0
   ```
   et les renvoie dans son JSON (`TMUX_WINDOW` / `TMUX_SESSION`, vides hors tmux).
2. **La commande `/end-session`** (étape 3) ferme par id explicite :
   `tmux kill-window -t "<TMUX_WINDOW>"` (ou `kill-session -t "<TMUX_SESSION>"` avec `--kill-session`).
   **Interdiction** d'exécuter une forme nue `kill-window` / `kill-session`. Si `TMUX_WINDOW` est
   vide → on ne ferme **rien** (on n'invente pas de cible), on demande à l'utilisateur de fermer.

Pourquoi capturer dans le **script** et non dans la commande : le script s'exécute en premier,
`$TMUX_PANE` y est fiable (hérité du pane de la session), et la valeur traverse le teardown via le
JSON — insensible à la perte ultérieure du `cwd`/de l'environnement.

## Leçon

- Une commande de destruction tmux/process **ne doit jamais** s'appuyer sur une notion implicite de
  « courant » (`kill-window`/`kill-session`/`kill-pane` sans `-t`, `kill %%`, etc.). **Toujours une
  cible explicite**, résolue tôt, pendant que l'environnement est intact.
- `$TMUX_PANE` (le pane de l'appelant) ≠ « fenêtre active du client » (ce que regarde l'utilisateur).
  Pour agir sur *sa propre* fenêtre, résoudre par `$TMUX_PANE`, pas par défaut implicite.
- Quand une étape est irréversible (kill, `rm -rf`, `wt remove -D`), préférer **échouer franchement**
  (ne rien fermer si la cible est incertaine) plutôt que deviner.
