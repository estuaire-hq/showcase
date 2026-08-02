---
name: estuaire-security-review
description: >-
  Produce a security state of play for the Estuaire site (estuaire.fr), dependencies first then
  application code, and STOP for a human decision. Trigger on "revue de sécurité", "audit de
  sécurité", "audit des dépendances", "est-ce qu'on a des vulnérabilités / des CVE", "npm audit",
  "security review", "est-ce que le site est sûr", "vérifie la sécu avant la PR", or any ask to
  review secrets handling, the contact form's abuse surface, the revalidation webhook, the Sanity
  tokens, /studio exposure, or HTTP security headers. Two modes, one grid: `socle` audits the
  existing codebase (the default, periodic), `diff` reviews a branch and delegates the diff to
  the built-in /security-review. Findings are presented as decidable items (reach, exploitability,
  fix cost, cost of doing nothing), written to a dated report plus a persistent ledger in
  docs/vault/security/, and NOTHING is fixed, bumped or cleaned up until the owner picks item by
  item. Do NOT use this to evaluate a dependency you are about to ADD (that is CLAUDE.md's
  Dependencies rule), nor as a general code review.
---

# Estuaire: security state of play (with a human gate)

This skill **observes, qualifies and prioritises**. It does not repair. Its output is a decision
document; the owner picks what gets treated, item by item. Autonomy ends at the gate.

## The three rules

> **1. The gate is absolute.** Present the state of play, then **stop**. Do not fix, do not bump a
> dependency, do not run `npm audit fix`, do not "while we're here" clean anything up. Act only on
> the items explicitly selected, and only on those.
>
> **2. Never open a `.env*` file** (`.env.example` excepted), least of all in the name of a
> security audit. Secrets handling is audited by reading the code that *reads* the secrets. No
> exception, whatever the phrasing of the request.
>
> **3. Read the ledger before presenting anything.** An item the owner knowingly rejected must not
> come back as if it were new. That is the entire point of the persistent artifact.

## Scope: what this covers, and what it deliberately does not

Estuaire is a **showcase site**: no authentication, no user accounts, no persisted user data, no
payments. The real risk is not a SaaS's risk, so size the review accordingly. Covered:

- **Dependencies**: vulnerabilities placed on a reachability cran, health and maintenance, version lag.
- **Application code**: the nine rows of `references/grid.md`.

**Not covered, deliberately: the supply chain** (postinstall scripts, publish provenance,
typosquatting). Stated so the gap is a visible choice rather than an oversight. Widening the scope
means updating [[decisions/0030-recurring-security-review]] first.

## Two modes, one grid

The grid in `references/grid.md` is the single source. The mode decides only **which rows are in
scope** and **whether the built-in runs**.

| | `socle` (default) | `diff` |
|---|---|---|
| Ask looks like | "revue de sécurité", "audit des dépendances", periodic check-up, "où on en est" | "vérifie ce que je viens de faire", before opening a PR |
| Dependencies | full axis (`deps.sh`) | only if `package.json` or `package-lock.json` changed |
| Code | **every** grid row, against the existing code | only the rows the changed files touch |
| Built-in `/security-review` | not run | **run**, it owns the diff |
| Report | new dated report plus ledger update | ledger update only, plus a short chat summary |

Ambiguous ask, so **ask one question** rather than guessing the mode.

### Why the built-in is used this way

The built-in `/security-review` hardcodes its scope to `git diff origin/HEAD...`. There is no scope
parameter, so it cannot be pointed at existing code without bending git refs. More decisively, its
own prompt **hard-excludes** *"vulnerabilities related to outdated third-party libraries"*, *"a lack
of hardening measures"*, *"DoS / rate limiting / resource exhaustion"* and *"secrets stored on
disk"*. Those exclusions are most of what actually matters on this project. So the built-in is used
at the scope where it is strong (a diff, hunting concrete exploitable vulnerabilities with a low
false-positive bar) and this grid covers the rest. Overlap is near zero and it is one row deep: in
`diff` mode, `CODE-CONTACT-INJECTION` belongs to the built-in, so do not duplicate that analysis.

## Procedure

### 0. Read the ledger first

`docs/vault/security/ledger.md`. For every ID it already knows, note the status and the recorded
reason. This determines how each finding is presented in step 4. It is not optional context.

### 1. Establish the mode

Branch and diff state (`git status`, `git diff --stat origin/main...HEAD`) plus the phrasing of the
ask. Say which mode you picked and why, in one line.

### 2. Dependency axis

```bash
bash .claude/skills/estuaire-security-review/references/deps.sh
```
Read-only, it never installs or fixes. It emits vulnerabilities (one row per package, ordered by
**reachability cran**), major version lag, and lag that carries a security fix.

The cran is what makes `npm audit` decidable here. `sanity` is a production dependency (the
embedded Studio), so its whole CLI subtree sits in the production tree while nothing on a request
path ever loads it. "Is it in `dependencies`?" answers nothing:

| Cran | Meaning | Weight |
|---|---|---|
| **1-browser** | in the public pages' client bundle | highest |
| **2-server** | in the running Next server, on the public request path | high |
| **3-studio** | in the prod tree but only loaded by `/studio` | conditioned: needs an editor, or a crafted document |
| **4-tooling** | CLI, build or dev only, never on a request path | informational |

The cran comes from the installed dependency graph rather than a runtime trace: a strong signal,
not proof. When a case is genuinely ambiguous, escalate to the CI build and inspect
`.next/standalone` (a local `npm run build` is not usable on this project).

**Then qualify each advisory against this app.** A package being vulnerable does not mean the app
is: an advisory about Server Actions is moot with no `"use server"` anywhere, one about middleware
is moot with no `src/middleware.ts`, one about the image optimizer is moot if `/_next/image`
answers 404 because a custom loader replaced it. Check the precondition before promoting a finding.
This is where most of the noise dies, and skipping it is what makes a security report unread.

Finish with `DEP-HEALTH` from the grid, which needs a live per-package lookup the probe cannot do.

### 3. Code axis

Walk `references/grid.md`. In `diff` mode, run `/security-review` first and fold its findings in,
then walk only the rows the changed files touch.

Two standing obligations, both from the project's brownfield rule:
- **Observe, do not infer.** Headers and rate limiting are answered by the real response from the
  edge in front of the app, not by reading `next.config.ts`. Library behaviour is answered by
  reading the installed package or running it, never from memory.
- **Record what you checked and found clean.** A state of play whose value is comparability must
  say "examined, no finding", otherwise the next pass cannot tell an absence from an omission.

### 4. Qualify, prioritise, reconcile with the ledger

Every finding is presented **decidably**. Four fields, no exceptions:

- **What is at stake**: the concrete thing, with `file:line` or the package path.
- **Real reach**: exploitable *how*, by *whom*. An anonymous visitor? An authenticated editor? Only
  whoever runs `npm run typegen` locally? This field is what separates the three items worth
  reading from the twenty-two that are not.
- **Fix cost**: the actual move (a non-breaking patch bump, a major with a migration, a `headers()`
  block, a rate limiter to choose and wire in) and what it risks breaking.
- **Cost of doing nothing**: the realistic consequence, stated without inflation.

Priority follows from reach, not from the CVSS score:

| | Criterion |
|---|---|
| **P1** | reachable by an anonymous visitor with a concrete abuse path, **or** a served-runtime CVE with a non-breaking fix |
| **P2** | real but conditioned: needs an editor session, a specific configuration, or a breaking change to fix |
| **P3** | no path from a visitor's request (cran 4), or hardening with no demonstrated abuse |

Split an item whose halves have wildly different costs (the four simple headers versus a full CSP),
otherwise the cheap half is held hostage by the expensive one.

Then reconcile each ID against the ledger:

- **new**: present in full.
- **already rejected, unchanged**: do **not** present as a decision. One collapsed line in an
  "already rejected" section, with the date and the recorded reason.
- **already rejected but changed** (severity up, advisory count up, reach moved to a lower cran):
  present as **régressé**, naming the previous decision and exactly what changed. This is the only
  way a rejected item legitimately comes back.
- **fixed, and back**: same treatment, as a regression.

A flat table of forty undifferentiated rows is not a decision document. If P1 plus P2 does not fit
on one readable screen, the prioritisation is not finished.

### 5. Write the artifacts

Two files under `docs/vault/security/`, **in French** (vault docs are French while this skill and
the grid are English, per `CLAUDE.md`'s language convention).

`YYYY-MM-DD-audit.md`, the snapshot of what was observed that day plus the narrative that the git
history of a single living file would not preserve (counts, versions, what was checked clean):

```markdown
# État des lieux sécurité, YYYY-MM-DD

**Mode** : socle | diff · **Branche** : `x` · **Commit** : `abc1234`

## Synthèse
<3 to 5 lines: the headline, and what the reader must decide today.>

## P1, à traiter
### <ID> : <title>
- **En cause** : ... (`fichier:ligne`)
- **Portée réelle** : ... (exploitable comment, par qui)
- **Coût du correctif** : ...
- **Risque de ne rien faire** : ...

## P2, à décider
## P3, informationnel
## Vérifié, sans finding
<the rows walked that came back clean: this is what makes the next pass comparable>
## Déjà écarté (rappel, non re-soumis)
## Surface publique observée
<the CODE-PUBLIC-SURFACE inventory, verbatim, so the next pass can diff it>
## Non couvert
Supply-chain (scripts postinstall, provenance de publication, typosquat), exclusion assumée.
<+ anything left UNVERIFIED, and why>
```

`ledger.md`, the memory, one row per ID, **the file consulted at step 0**:

```markdown
| ID | statut | prio | état observé (dernier passage) | vu depuis | décidé le | motif / suite |
|---|---|---|---|---|---|---|
| DEP-next | ouvert | P1 | 9 avis / high / cran 2, fix non cassant | 2026-08-01 | | |
| DEP-adm-zip | refusé | P3 | 1 avis / high / cran 4 | 2026-08-01 | 2026-08-01 | CLI dev uniquement |
```

Statuses: `ouvert` (presented, not yet decided), `accepté` (to be treated), `refusé` (knowingly
rejected, **the reason is mandatory**), `corrigé` (with the commit), `régressé`. Keep IDs stable:
`DEP-<package>`, `LAG-<package>`, `HEALTH-<package>`, `CODE-<row>`, and for a built-in diff finding
`DIFF-<YYYY-MM-DD>-<n>`.

**État observé** is the regression detector: advisory count, max severity and cran for a `DEP-` row,
the observed state in one phrase for a `CODE-` row. Step 4 compares it against what the current pass
measures. A count that rises, a severity that rises or a cran that drops reopens the item **even if
it was rejected**, and that comparison is the only mechanism that keeps a rejection from silently
outliving its reason.

### 6. Present, then STOP

Post the prioritised summary in chat (P1 and P2 in full, P3 as counts), say where the report was
written, and ask which items to treat. **Then stop.** No fix, no bump, no commit until the choice
comes back. When it does, treat the selection **and only the selection**, then update the ledger
with the decision and its date, including a `refusé` with its reason, which is as valuable a record
as a fix.

## Notes and gotchas

- **Do not run `npm audit fix`** as part of a review, not even to "see" what it would do, because
  it rewrites `package-lock.json`. The probe already reports each fix and whether it is breaking.
- **`npm`'s suggested fix is sometimes a DOWNGRADE.** After `next` was bumped to 16.2.12, npm
  started reporting `fix: next@9.3.3 (MAJOR, breaking)` for the `postcss` and `sharp` advisories,
  i.e. seven majors backwards. `fixAvailable` is a resolver suggestion, not advice: always read the
  proposed version against the installed one before quoting a fix cost, and never let
  `npm audit fix --force` act on it.
- **Never load-test `/api/contact` in production.** Every accepted request emails the client. Prove
  app-layer behaviour against a local dev server, where `SMTP_HOST` is unset and nodemailer's
  `jsonTransport` keeps everything on the machine.
- **`/api/revalidate` is one refactor from failing open.** `parseBody` returns
  `isValidSignature: null` when no secret is configured, and the route rejects on falsy, which is
  why it currently fails closed. Re-check that comparison every pass (grid row `CODE-WEBHOOK`).
- **A cran-4 CRITICAL outranks nothing.** `tar` is critical *and* unreachable from any request. Say
  both, and put it in P3. Reporting it as critical without the reach is exactly the noise that
  makes a review unread.
- **New direct dependency, so update `CRAN` in `deps.sh`.** An unmapped direct dep defaults to
  cran 2 and is flagged "confirm by hand", failing loud rather than silently optimistic.
- **Prod Sanity project: reads are free, writes are gated.** Querying the prod project
  (`vbuzs69z`) for a diagnosis, listing its datasets, reading its schema: do it, that is what an
  audit is for. Only **mutations** need the owner's explicit per-action authorization. Do not test
  anonymous *write* access against prod as part of a review.
- **Number collisions**: this repo runs parallel worktrees, so a new ADR or post-mortem number may
  already be taken on `main`. See the `estuaire-branch-sync` skill.
- References: `references/deps.sh` (the dependency probe), `references/grid.md` (the nine code rows
  plus `DEP-HEALTH`), [[decisions/0030-recurring-security-review]] (why this exists, scope,
  exclusions).
