---
tags: [post-mortem, speckit, worktrees, tooling, method]
status: actioned
date: 2026-06-17
---
# 0009 — /speckit.specify numbering skipped worktree-resident branches → duplicate feature number

## What happened
Running `/speckit.specify "nouvelle feature : page secteurs"`, the create-new-feature
script auto-assigned the branch number **008** and created `008-sectors-page` — even
though **`008-expertises-page` already existed** (an open feature worktree). Two distinct
features ended up sharing the `008` prefix. Caught immediately after creation by comparing
the script's JSON output against `git worktree list`.

## Root cause
The next-number scan (`get_highest_from_branches`) parses `git branch -a` and cleans each
line with:

```sh
clean_branch=$(echo "$branch" | sed 's/^[* ]*//; s|^remotes/[^/]*/||')
```

That class `[* ]` strips the leading `*` (current branch) and spaces, but **not `+`**.
Git marks a branch that is **checked out in another worktree** with a `+` prefix:

```
+ 008-expertises-page
* main
```

So `+ 008-expertises-page` survives as `+ 008-expertises-page`, fails the
`^[0-9]\{3\}-` match, and is **invisible** to the highest-number computation. The scan saw
only `007-*` as the max and returned `008`.

This is a direct interaction with the **ADR 0014 worktree customization**: before it,
feature branches were checked out in place (no `+`); now every in-progress feature lives in
its own worktree, so its branch *always* carries the `+` prefix and is silently ignored by
the numbering — guaranteeing a collision for any feature created while another feature
worktree is open.

## Fix
1. **Renumbered** the new feature `008-sectors-page → 009-sectors-page` (`wt remove`
   the freshly-created worktree+branch, then `wt switch -c 009-sectors-page`, fixing the
   number by hand). No content lost — only the blank template had been copied.
2. **Patched the script** (`.specify/scripts/bash/create-new-feature.sh`): the sed class is
   now `[*+ ]`, so `+`-prefixed worktree branches are cleaned and counted. Added a comment
   tying the fix to ADR 0014 so it survives a spec-kit re-vendor.

## Prevention
- **The `+` prefix is load-bearing once branches live in worktrees.** Any logic that parses
  `git branch`/`git branch -a` to read branch names must strip `[*+ ]`, not just `[* ]`.
- **Sanity-check the auto-assigned number** against `git worktree list` right after
  `/speckit.specify` — a duplicate prefix means the scan missed a worktree branch.
- When re-vendoring spec-kit, **re-apply both** the ADR 0014 worktree block *and* this sed
  fix (they are coupled: the worktree block is what introduces the `+` lines).
- Echoes the project rule: record the methodology lesson + the fix before moving on, so the
  next `/speckit.specify` during parallel worktree work doesn't recreate the collision.
