#!/usr/bin/env bash
# dispatch-worktree.sh — create a dedicated git WORKTREE (via worktrunk) for an
# ad-hoc parallel implementation session, OUTSIDE the spec-kit flow. See ADR 0015.
#
# Unlike .specify/scripts/bash/create-new-feature.sh, this script:
#   - does NOT scaffold a spec,
#   - does NOT number the branch (plain slug → never collides with speckit's ###- numbering),
#   - has NO in-place fallback: a worktree is the whole point of /dispatch.
# Claude derives the slug and writes the brief; this script only does the mechanical
# worktree creation + path resolution, then returns JSON for the command to parse.
#
# Usage: scripts/dispatch-worktree.sh --slug <slug> [--json]

set -e

JSON_MODE=false
SLUG=""

while [ $# -gt 0 ]; do
  case "$1" in
    --json) JSON_MODE=true ;;
    --slug)
      shift
      [ $# -gt 0 ] || { echo "Error: --slug requires a value" >&2; exit 1; }
      SLUG="$1"
      ;;
    --help|-h)
      echo "Usage: $0 --slug <slug> [--json]"
      echo ""
      echo "Creates a dedicated git worktree (via worktrunk) for an ad-hoc parallel"
      echo "implementation session. Outputs BRANCH_NAME / WORKTREE_PATH / DEV_URL."
      exit 0
      ;;
    *) echo "Error: unknown argument '$1'" >&2; exit 1 ;;
  esac
  shift
done

[ -n "$SLUG" ] || { echo "Error: --slug is required" >&2; exit 1; }

# Normalize slug: lowercase, non-alnum → '-', collapse and trim dashes.
SLUG=$(echo "$SLUG" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g; s/-\+/-/g; s/^-//; s/-$//')
[ -n "$SLUG" ] || { echo "Error: slug is empty after normalization" >&2; exit 1; }

git rev-parse --show-toplevel >/dev/null 2>&1 || { echo "Error: not inside a git repository" >&2; exit 1; }
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

# Branch must not already exist (a worktree can't be created on an existing branch here).
if git show-ref --verify --quiet "refs/heads/$SLUG"; then
  echo "Error: branch '$SLUG' already exists. Pick a different slug." >&2
  exit 1
fi

# `wt` is a shell function (from `wt config shell install`) → reachable only via a login shell.
if ! bash -lic 'command -v wt >/dev/null 2>&1'; then
  echo "Error: worktrunk (wt) not found. A worktree is required for /dispatch — see docs/worktrees-portless-setup.md." >&2
  exit 1
fi

# Create the worktree + branch. worktrunk's post-start hooks run `npm ci` then start the
# portless dev server tethered (killed on `wt remove`). The branch is created from the
# CURRENT HEAD — run /dispatch from `main` for a clean base (the usual case).
if ! bash -lic "cd '$REPO_ROOT' && wt switch -c '$SLUG' --yes" >/dev/null 2>&1; then
  echo "Error: 'wt switch -c $SLUG' failed (worktrunk). Check the worktrunk + git-crypt worktree setup (docs/worktrees-portless-setup.md)." >&2
  exit 1
fi

# Resolve the new worktree's absolute path from git's worktree registry.
WORKTREE_PATH=$(git worktree list --porcelain | awk -v b="refs/heads/$SLUG" '$1=="worktree"{p=$2} $1=="branch" && $2==b{print p; exit}')
if [ -z "$WORKTREE_PATH" ] || [ ! -d "$WORKTREE_PATH" ]; then
  echo "Error: could not resolve the worktree path for '$SLUG'." >&2
  exit 1
fi

# portless dev URL convention (mirrors .config/wt.toml `list.url`).
DEV_URL="http://$SLUG.estuaire.localhost:1355"

if $JSON_MODE; then
  printf '{"BRANCH_NAME":"%s","WORKTREE_PATH":"%s","DEV_URL":"%s"}\n' "$SLUG" "$WORKTREE_PATH" "$DEV_URL"
else
  echo "BRANCH_NAME: $SLUG"
  echo "WORKTREE_PATH: $WORKTREE_PATH"
  echo "DEV_URL: $DEV_URL"
fi
