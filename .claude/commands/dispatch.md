---
description: Send the current work (prompt + conversation context) off to a dedicated worktree + a fresh Claude session (tmux) that implements it — outside the speckit flow.
---

## User Input

```text
$ARGUMENTS
```

## Goal

Take a piece of work that is **ready to start** (a feature, a change) and send it off **in parallel**,
into its own git **worktree** + a **fresh Claude session** opened in a tmux window that implements it —
while THIS session stays free. This is the generalization, **outside speckit**, of the worktree+tmux
handoff from `/speckit.specify` (see **ADR 0015**; worktrunk + tmux plumbing from **ADR 0014**).

Key difference from speckit: **no spec.md, no branch numbering**. The context that crosses the session
boundary (chat history does NOT cross it — ADR 0014) is carried by a **brief** you write to
`<worktree>/.dispatch/brief.md`. The new session reads it and executes.

## Execution flow

### 1. Gather the work to dispatch

The task source is, in priority order:

1. **`$ARGUMENTS`** if non-empty (`/dispatch <description>`), **plus** the current conversation context
   if it enriches the request.
2. Otherwise, **the current conversation context**: what we just discussed / decided and that is
   "ready to implement".

If **neither** yields an identifiable task (bare command, no topic in progress), **ask** briefly what
to dispatch, then wait for the answer. Never dispatch into the void.

### 2. Check sufficiency — ask if needed

Assess whether you have enough to produce an actionable brief (clear goal, known constraints, bounded
scope). If something is missing **that changes what will be built** (not a detail with a reasonable
default): ask **at most 3 targeted questions** (via `AskUserQuestion` if clear options exist, otherwise
in text), wait for the answers, then continue. If everything is clear, don't interrupt — proceed.

### 3. Decide: raw prompt (pass-through) vs enriched brief

- **Pass-through** — the request was **clear and one-shot**, with no back-and-forth refinement: the
  brief = essentially the user's prompt, used as-is (possibly reformatted).
- **Enriched** — there was **discussion / decisions / clarifications**: synthesize a brief that
  **captures the outcome of the exchange**, not just the initial prompt (decisions made, alternatives
  rejected, constraints, files/areas identified, acceptance criteria).

### 4. Decide the new session's mode (direct vs reflect)

This is **your call**, based on the nature of the task:

- **`direct`** — clear, mechanical implementation, the approach is not up for debate → the new session
  **implements straight away**.
- **`reflect`** — a subject that needs design / trade-offs → the new session **proposes its approach
  first**, gets it validated, then implements.

Note the chosen mode; it drives the bootstrap line (step 8) **and** the "Expected approach" section of
the brief.

### 5. Pick the slug

A short-name of **2-4 words**, action-noun format, kebab-case, capturing the essence of the task
(e.g. "add a dark mode to the header" → `header-dark-mode`). Preserve acronyms/technical terms.
**No** numeric prefix (reserved for speckit). The script re-normalizes it anyway.

### 6. Create the worktree

Run the script with the slug, in JSON:

```bash
scripts/dispatch-worktree.sh --slug "<slug>" --json
```

It creates the worktree via worktrunk (`wt switch -c`), starts the portless dev server in the
background, and returns JSON `{"BRANCH_NAME","WORKTREE_PATH","DEV_URL"}`. **Parse this JSON** (absolute
reference — `WORKTREE_PATH` is the worktree's path). On error (slug already taken, `wt` missing…),
report the message and **stop**: do not switch the current checkout.

### 7. Write the brief into the worktree

Write the brief to **`<WORKTREE_PATH>/.dispatch/brief.md`** (absolute path). `.dispatch/` is gitignored
— it is a working file, **never committed**.

Do NOT repeat the project conventions in it: the new session is rooted in the worktree, so its
`CLAUDE.md` + skills + hooks load on their own. Put only the **task-specific** content. Structure:

```markdown
# Brief — <slug>

## Task
<Goal in 1-3 sentences: what to build / change, and why.>

## Context & decisions
<What was settled in the discussion: chosen options, rejected alternatives and why,
constraints. For a pass-through, the user's raw prompt is enough here.>

## Areas touched
<Anticipated files / components / routes, if known. Otherwise: "to explore".>

## Acceptance criteria
<Definition of done. Include the relevant project gates: lint (npm run lint), and
pixel-review / verify for any screen built from a maquette.>

## Expected approach
<If mode `direct`: "Direct implementation, the approach is not up for debate."
 If mode `reflect`: "Propose the approach/plan and get it validated BEFORE implementing,
 because <reason: design, trade-off, risk>.">
```

### 8. Handoff to the worktree session

The new session must run **inside** the worktree (this session can't move its cwd there).

- **If inside tmux** (`printenv TMUX` non-empty): open a new tmux window rooted in the worktree and
  launch Claude with a **short** bootstrap (the brief carries the detail). Substitute `<WORKTREE_PATH>`,
  `<slug>` and pick the mode sentence. The bootstrap must be **free of apostrophes and double quotes**
  (it sits in single quotes, inside a double-quoted tmux argument):

  - Mode `direct`:
    ```bash
    tmux new-window -c "<WORKTREE_PATH>" "claude 'Worktree dedie pour la tache <slug>. Lis ton briefing complet dans .dispatch/brief.md puis realise la tache directement (implementation claire). Respecte CLAUDE.md et les skills du projet, et termine par les gates (lint, pixel-review/verify selon le cas). Dev: http://<slug>.estuaire.localhost:1355 (PORTLESS=0 npm run dev pour localhost:3000). Ne commite jamais .dispatch/.'"
    ```
  - Mode `reflect`:
    ```bash
    tmux new-window -c "<WORKTREE_PATH>" "claude 'Worktree dedie pour la tache <slug>. Lis ton briefing complet dans .dispatch/brief.md. Le sujet demande de la reflexion: propose d abord ton approche et fais-la valider, puis implemente. Respecte CLAUDE.md et les skills du projet. Dev: http://<slug>.estuaire.localhost:1355 (PORTLESS=0 npm run dev pour localhost:3000). Ne commite jamais .dispatch/.'"
    ```

  A new tmux window opens (auto-focused) with Claude already in the worktree.

- **If NOT inside tmux**: launch nothing. Tell the user to continue with `wt switch <slug> -x claude`
  and then, in that session, ask Claude to read `.dispatch/brief.md`. (For the auto handoff, run the
  main session **inside tmux** — ADR 0014.)

### 9. Report, then STOP

Report: slug/branch, `WORKTREE_PATH`, `DEV_URL`, the chosen mode (`direct`/`reflect`), and pass-through
vs enriched.

**Then STOP.** Do NOT implement the task in THIS session — the worktree session owns it. This session's
role ends at the handoff.

## Notes

- **Branch base**: `wt switch -c` branches off the current HEAD. Run `/dispatch` from `main` for a clean
  base (the usual case).
- **Cleanup**: a worktree with nothing committed is removed via `wt remove --force`.
- **`.dispatch/` must be gitignored on the base branch** for worktrees to inherit it — which is the case
  in this repo (committed with the `/dispatch` feature). The bootstrap still reminds the session never to
  commit it.
