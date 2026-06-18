---
name: estuaire-branch-sync
description: >-
  Sync a feature branch with `main` on the Estuaire repo, the safe way, AND fix the
  sequential-number collisions that parallel worktrees create. Trigger whenever you need to
  update / sync / catch up a feature branch from main, bring main into the branch, resolve
  "branch is behind main", or before merging a PR. Estuaire runs many features in parallel
  git worktrees (worktrunk + portless), so two branches independently grab the SAME next
  ADR / post-mortem / feature number — after merging main you MUST detect those collisions
  and renumber your docs (`docs/vault/decisions/`, `docs/vault/post-mortems/`, `specs/`),
  fixing every cross-reference. Merge (never rebase/force-push) to keep the open PR intact.
---

# Estuaire — branch sync (with vault-number collision repair)

Bring `main` into a feature branch safely, then repair the **sequential-number collisions**
that parallel worktrees inevitably cause. This is the project-specific gotcha: while you
worked on your branch, another worktree merged to `main` and took the **same next number**
you used for an ADR, a post-mortem, or a feature.

## The two rules

1. **Merge, never rebase.** The branch usually has an **open PR** and is already pushed.
   `git merge origin/main` (a merge commit) keeps the PR and its commits intact. Do NOT
   rebase or `--force` push a pushed PR branch (global git rule: no force-push without an
   explicit ask).
2. **After merging, re-check the numbers.** Sequential IDs (`NNNN-`/`NNN-`) are assigned
   per-branch with no central lock, so collisions are the norm, not the exception. Always
   run the collision check below — a clean merge does NOT mean clean numbering.

## Procedure

### 1. Fetch & assess

```bash
git fetch origin main
echo "behind: $(git rev-list --count HEAD..origin/main) | ahead: $(git rev-list --count origin/main..HEAD)"
git log --oneline HEAD..origin/main          # what's new on main
```

If `behind` is 0, you're already up to date — skip to the collision check anyway only if a
recent merge happened.

### 2. Merge main into the branch

```bash
git merge origin/main --no-edit
```

- Filename-level collisions DON'T conflict (e.g. `0015-dispatch….md` vs
  `0015-sectors….md` are different files → git keeps both, no conflict) — that's exactly why
  step 3 is mandatory: the merge looks clean but the **numbers** now clash.
- Real conflicts (same file edited both sides, e.g. `CLAUDE.md`, `queries.ts`,
  `schemas/index.ts`, `structure.ts`, `seed/registry.ts`): resolve by keeping BOTH additions
  (these are append-style registries/sections), then `git add` + commit.

### 3. Detect number collisions (the project-specific step)

Sequential numbers that parallel branches increment independently:

| Artifact | Path | Pattern |
|---|---|---|
| ADR (decision) | `docs/vault/decisions/` | `NNNN-<slug>.md` |
| Post-mortem | `docs/vault/post-mortems/` | `NNNN-<slug>.md` |
| Feature spec | `specs/` | `NNN-<slug>/` (usually fixed at branch creation, but verify) |

A **collision** = two files share the same `NNNN` but have different slugs — one yours, one
just merged from main.

```bash
# any duplicated 4-digit prefix? (lists numbers appearing more than once)
for d in docs/vault/decisions docs/vault/post-mortems; do
  echo "== $d =="; ls "$d" | grep -oE '^[0-9]{4}' | sort | uniq -d
done
# see your branch's new files vs what main brought
git diff --name-status origin/main...HEAD -- docs/vault specs
```

### 4. Renumber YOUR colliding docs to the next free slot

The doc that already shipped on `main` keeps its number; **yours moves** to the next free
number. For each collision:

```bash
git mv docs/vault/decisions/0015-mine-slug.md docs/vault/decisions/0016-mine-slug.md
```

Then fix EVERY reference to the moved doc (and leave the other branch's same-number refs
untouched):

- **In-file header**: `# 0015 — …` → `# 0016 — …` (first line).
- **Cross-links** (`[[…]]` wikilinks), in both directions — your ADR ↔ your post-mortem, and
  any other doc pointing at them: `[[decisions/0015-mine-slug]]` → `[[…/0016-mine-slug]]`,
  `[[post-mortems/0009-mine]]` → `[[…/0010-mine]]`.
- **Prose references**: `specs/<feature>/plan.md`, `tasks.md`, `quickstart.md` (e.g. "ADR 0015",
  "post-mortem 0009").
- **The PR body** (step 7).

Find them all, then verify nothing stale and nothing belonging to the other branch was touched:

```bash
grep -rn "0015-mine-slug\|0009-mine-slug\|ADR 0015\|post-mortem 0009" --include='*.md' . | grep -v node_modules
```

⚠️ "ADR 0015" / "post-mortem 0009" are now **ambiguous** — the same string may refer to the
OTHER branch's doc (e.g. main's `0015-dispatch…`, referenced from `CLAUDE.md` /
`.claude/commands/`). Only rewrite the references that point at YOUR slug. Inspect each hit.

### 5. Re-run the gates

The merge pulls in others' code — re-verify:

```bash
npx biome check .            # lint
npx tsc --noEmit             # types
npm run typegen              # if the Sanity schema changed (commit src/sanity.types.ts)
npm run seed:check           # if a seed changed
```

### 6. Commit & push (no force)

The merge made a merge commit; the renumber is a separate commit:

```bash
git add -A
git commit -m "chore(<scope>): renumber ADR 00XX→00YY / post-mortem 00XX→00YY after syncing main"
git push                      # plain push — never --force on a pushed PR branch
```

Earlier commit messages keep the old numbers (history is not rewritten) — that's fine; the
`chore` commit documents the renumber. The **files + PR body** are the artifacts of record.

### 7. Update the PR body references

```bash
gh pr view <n> --json body -q .body \
  | sed 's#0015-mine-slug#0016-mine-slug#g; s#0009-mine-slug#0010-mine-slug#g' \
  | gh pr edit <n> --body-file -
gh pr checks <n>              # confirm lint/build state; MERGEABLE + UNSTABLE = checks pending
```

## Sign-off checklist

- [ ] `git rev-list --count HEAD..origin/main` == 0 (branch contains all of main).
- [ ] No duplicated `NNNN` prefix in `docs/vault/decisions` or `docs/vault/post-mortems`.
- [ ] Every reference to a renumbered doc updated (headers, `[[wikilinks]]`, specs prose, PR
      body); no other branch's same-number refs touched.
- [ ] Gates green (`biome`, `tsc`, + `typegen`/`seed:check` if relevant).
- [ ] Pushed without `--force`; PR still OPEN + MERGEABLE.

## Notes

- **Worktrees**: this branch is likely a worktrunk worktree. `git fetch`/`merge`/`push` work
  the same; the merge commit lands on the worktree's branch. `.env.development` stays
  git-crypt'd and decrypts via the per-worktree filter (ADR 0013) — the merge doesn't touch it.
- **Why merge over rebase here**: an open PR + a pushed branch. Rebase rewrites the pushed
  commits → forces a force-push → breaks review history and violates the no-force rule. Use
  rebase only on a private, unpushed branch with no PR.
