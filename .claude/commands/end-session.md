---
description: Tear down the CURRENT worktree session — stop only this branch's portless dev server, remove the worktree + its local branch, then close the tmux window. The inverse of /dispatch & /speckit.specify.
---

## User Input

```text
$ARGUMENTS
```

## Goal

End the **current** worktree session and clean up after it. This is the inverse of the
worktree+tmux handoff created by `/dispatch` and `/speckit.specify` (ADR 0014 / 0015): run it
from **inside** the feature worktree when its work is done (merged/pushed). It:

1. **Stops only this branch's portless dev server** (by pid — never `portless prune`, never the
   other worktrees' servers), if it is currently running;
2. **Removes the worktree and deletes its local branch** (via worktrunk);
3. **Closes the current tmux window** (returning focus to the window you launched from; if it was
   the session's last window, the session ends with it).

Steps 1–2 are mechanical and safety-critical → done by `scripts/end-session.sh`. Step 3 (tmux) is
this command's job, run **last and only on success**, so a failure leaves the window open with the
error in view.

⚠️ This **deletes the local branch even if git considers it unmerged** (a squash-merged PR leaves
the local branch "unmerged"). Run `/end-session` only once the branch's work is merged or pushed.

## Execution flow

### 1. Run the teardown script

Forward **only** `--force` to the script (if present in `$ARGUMENTS`) and request JSON. `--kill-session`
is a command-level flag interpreted in step 3 — it is NOT a script argument, so do not pass it on:

```bash
scripts/end-session.sh --json [--force]
```

The script guards against running on the **main checkout** or the **main/master branch** and exits
non-zero if so. It returns JSON
`{"BRANCH","WORKTREE_PATH","MAIN_ROOT","PORTLESS_STOPPED","SERVER_PID","TMUX_WINDOW","TMUX_SESSION"}`.
`TMUX_WINDOW` / `TMUX_SESSION` are the **explicit tmux ids of THIS session's window/session**,
captured by the script up front from `$TMUX_PANE` (the pane running this session) while the
environment is intact. They are empty when not running inside tmux. **Step 3 closes the window by
these ids — never by a bare command.**

### 2. On failure — report and STOP (do NOT touch tmux)

If the script exits non-zero, relay its error message and **stop**. The window stays open. Common cases:

- **On the main checkout / main branch** → there is nothing to tear down here; the user ran it from
  the wrong place.
- **Dirty worktree** (uncommitted/untracked changes) → tell the user to commit/stash, **or** re-run
  `/end-session --force` (which DISCARDS those changes). Do not force on your own initiative.

### 3. On success — confirm, then close the tmux window **by explicit id**

Briefly confirm what was torn down (branch, worktree path, whether the portless server was stopped).

Then close the session window. The worktree directory no longer exists (the script deleted it), so
this is a `tmux` IPC call that does not depend on the working directory.

⚠️ **NEVER run a bare `tmux kill-window` / `tmux kill-session`.** With no `-t`, tmux targets the
attached client's **active window** — which is whatever the user happens to be looking at, NOT
necessarily this session's window. That destroyed an unrelated in-progress window once
(post-mortem 0012). ALWAYS pass the explicit id captured by the script.

Use the `TMUX_WINDOW` / `TMUX_SESSION` ids from the script's JSON:

- **If `TMUX_WINDOW` is non-empty** (we were inside tmux):
  - default → `tmux kill-window -t "<TMUX_WINDOW>"` (closes exactly this window; ends the session
    if it was the last window);
  - if the user passed `--kill-session` in `$ARGUMENTS` → `tmux kill-session -t "<TMUX_SESSION>"`
    instead (closes the whole session — use only when the worktree had its own dedicated session).

  Substitute the literal id from the JSON (e.g. `tmux kill-window -t @7`). This is the **final**
  action: it terminates this Claude session, so do it last, after the confirmation.

- **If `TMUX_WINDOW` is empty** (not inside tmux, or the pane could not be resolved): there is no
  window to close — and you MUST NOT guess one. Just confirm the worktree + branch are gone and tell
  the user they can close the window manually.

## Notes

- **Why by pid, not `portless prune`**: `portless` has no per-route stop; `prune` would kill every
  orphaned dev server, including other worktrees'. The script reads this branch's pid from
  `portless list` (route `http://<branch>.estuaire.localhost:1355`) and kills only that one. The dev
  server is also tethered to the worktree, so `wt remove` would reap it anyway — stopping it first is
  the explicit, scoped step.
- **Why `cd` to the main root first**: git refuses to remove the worktree that is the process's
  current directory, so the script operates from the main checkout (`MAIN_ROOT`) and targets the
  branch by name.
- **`--force`**: passes `-f` to `wt remove` to drop a dirty worktree. The default (no `-f`) lets
  uncommitted work block removal — the safety net.
- **Why kill the window by explicit id (`-t <TMUX_WINDOW>`), never bare**: `tmux kill-window` with
  no target kills the attached client's *active* window — the one the user is focused on, which may
  be a different worktree's session or unrelated work, not this one. The script captures this
  session's own window id from `$TMUX_PANE` up front (env intact, before teardown) and returns it,
  so the close is deterministic and scoped. A bare `kill-window` once destroyed an unrelated
  in-progress window — see [[post-mortems/0012-end-session-killed-wrong-tmux-window]].
