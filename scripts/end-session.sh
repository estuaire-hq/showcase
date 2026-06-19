#!/usr/bin/env bash
# end-session.sh — tear down the CURRENT worktree session: stop ONLY this branch's
# portless dev server, then remove the worktree + its local branch (via worktrunk).
# This is the inverse of dispatch-worktree.sh / .specify/.../create-new-feature.sh
# (the worktree+tmux handoff — ADR 0014 / 0015).
#
# Run it from INSIDE the worktree you want to tear down (cwd = that worktree). It
# REFUSES to run on the main checkout or the main/master branch (guard against nuking
# your primary tree).
#
# Scope, on purpose:
#   - stops ONLY this branch's portless server, by pid — NEVER `portless prune`;
#   - removes the worktree AND deletes its local branch (`-D`, so a squash-merged PR
#     whose branch git still considers "unmerged" is removed too — honoring the
#     explicit "delete the branch" intent). Run it only after your work is merged/pushed.
#   - does NOT touch tmux — the /end-session command closes the window as its final step,
#     and only on success, so a failure here leaves the window open with the error.
#
# Usage: scripts/end-session.sh [--force] [--json]
#   --force   also remove a DIRTY worktree (uncommitted/untracked changes) — passes -f
#             to `wt remove`. Without it, an unclean worktree blocks removal (the safety net).
#   --json    machine-readable result on stdout.

set -e

JSON_MODE=false
FORCE=false

while [ $# -gt 0 ]; do
  case "$1" in
    --json) JSON_MODE=true ;;
    --force) FORCE=true ;;
    --help|-h)
      echo "Usage: $0 [--force] [--json]"
      echo ""
      echo "Tears down the CURRENT worktree session: stops this branch's portless dev"
      echo "server (by pid, no prune), then removes the worktree + its local branch."
      echo "Refuses to run on the main checkout or the main/master branch."
      echo "  --force  also remove a dirty worktree (uncommitted/untracked changes)."
      echo "  --json   machine-readable result."
      exit 0
      ;;
    *) echo "Error: unknown argument '$1'" >&2; exit 1 ;;
  esac
  shift
done

git rev-parse --show-toplevel >/dev/null 2>&1 || { echo "Error: not inside a git repository" >&2; exit 1; }
CURRENT=$(git rev-parse --show-toplevel)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
# The main working tree is always the FIRST entry of the worktree registry.
MAIN_ROOT=$(git worktree list --porcelain | awk '$1=="worktree"{print $2; exit}')

# Guard 1: never tear down the MAIN checkout.
if [ "$CURRENT" = "$MAIN_ROOT" ]; then
  echo "Error: /end-session must run from a feature WORKTREE, not the main checkout." >&2
  echo "       You are on the main checkout ($MAIN_ROOT) — nothing to tear down here." >&2
  exit 1
fi
# Guard 2: never delete the main/master branch (nor a detached HEAD).
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ] || [ "$BRANCH" = "HEAD" ]; then
  echo "Error: refusing to tear down branch '$BRANCH'." >&2
  exit 1
fi

# --- 1. Stop ONLY this branch's portless dev server (if running). No prune. ---
# A worktree is served at http://<branch>.estuaire.localhost:1355 (see .config/wt.toml).
# `portless list` is the authoritative route->pid map; grab the pid for THIS branch's host.
# `portless`/`wt` are reachable through a login shell; `index()` matches the host literally.
SERVER_PID=$(bash -lic 'portless list' 2>/dev/null \
  | awk -v host="http://$BRANCH.estuaire.localhost" '
      index($0, host) { for (i = 1; i <= NF; i++) if ($i == "(pid") { gsub(/[^0-9]/, "", $(i+1)); print $(i+1); exit } }') || true

PORTLESS_STOPPED=false
if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
  kill "$SERVER_PID" 2>/dev/null && PORTLESS_STOPPED=true
fi

# --- 2. Remove the worktree + its LOCAL branch (worktrunk). ---
# git refuses to remove the worktree that is the process CWD → operate from the main root.
cd "$MAIN_ROOT"

# `wt` is a shell function (from `wt config shell install`) → reachable only via a login shell.
if ! bash -lic 'command -v wt >/dev/null 2>&1'; then
  echo "Error: worktrunk (wt) not found — cannot remove the worktree. See docs/worktrees-portless-setup.md." >&2
  exit 1
fi

# -D            delete the local branch even if git deems it unmerged (squash-merged PRs).
# -f            (only with --force) allow removing a DIRTY worktree; else uncommitted work blocks.
# --foreground  block until removal completes so our exit status is meaningful.
# --yes         skip approval prompts (we are non-interactive).
REMOVE_FLAGS="-D --foreground --yes"
$FORCE && REMOVE_FLAGS="-D -f --foreground --yes"

if ! bash -lic "cd '$MAIN_ROOT' && wt remove $REMOVE_FLAGS '$BRANCH'"; then
  echo "Error: 'wt remove' failed for '$BRANCH'." >&2
  echo "       If the worktree has uncommitted/untracked changes, commit/stash them, or" >&2
  echo "       re-run '/end-session --force' (this DISCARDS those changes)." >&2
  exit 1
fi

# --- 3. Report. tmux teardown is the /end-session command's job (only on success). ---
if $JSON_MODE; then
  printf '{"BRANCH":"%s","WORKTREE_PATH":"%s","MAIN_ROOT":"%s","PORTLESS_STOPPED":%s,"SERVER_PID":"%s"}\n' \
    "$BRANCH" "$CURRENT" "$MAIN_ROOT" "$PORTLESS_STOPPED" "$SERVER_PID"
else
  echo "Stopped portless server: $PORTLESS_STOPPED${SERVER_PID:+ (pid $SERVER_PID)}"
  echo "Removed worktree:        $CURRENT"
  echo "Deleted local branch:    $BRANCH"
  echo "MAIN_ROOT:               $MAIN_ROOT"
fi
