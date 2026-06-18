---
tags: [post-mortem, portless, worktrees, coming-soon-gate, dev-server, methodology]
status: resolved
date: 2026-06-17
---
# 0010 — Portless named-URL 404 + the coming-soon gate blocking worktree review

## Symptom
During the pixel review of feature `008-expertises-page` (in a `wt` worktree), the running dev
server could not be reached at its **named portless URL** `http://008-expertises-page.estuaire.localhost:1355`
— every route (`/`, `/expertises`, `/nous-decouvrir`) returned **404**. The agent fell back to
hitting the raw `http://localhost:4340` directly to capture screenshots, abandoning the project's
named-URL convention.

## Two compounding causes

### 1. The coming-soon gate was ON in the worktree dev server
The shared `.env.development` (one file for all worktrees) carried a `SITE_PREVIEW_TOKEN`. The
`wt` post-start hook started the dev server via `npm run dev` **without** overriding it, so the
gate rewrote every page to `/coming-soon`. CLAUDE.md says the dev *default* is gate-off, but the
token being present made every worktree dev server unreviewable. The agent can't read
`.env.development` (git-crypt) to get the token for `/v/<token>`, so it tried to restart the server
with the gate disabled.

### 2. `portless run --force` left the route unregistered
To disable the gate, the agent ran `SITE_PREVIEW_TOKEN= portless run --force next dev`. `--force`
killed the tethered server and started a new one **on a new port**, but the route did **not**
re-register on the machine-wide `:1355` proxy. The new server answered on its raw `localhost:<port>`
(200, gate correctly off) while the named URL 404'd. **The machine-wide portless proxy returns 404
for any subdomain it has no live route for** — so the 404 was "no route", *not* "app broken". The
agent misread it and bypassed via the raw port instead of fixing the route.

## Fix (durable)
1. **`.config/wt.toml`** — the tethered dev server now starts gate-off by default:
   `server = "wt step tether -- env SITE_PREVIEW_TOKEN= npm run dev"`. Process-env wins over `.env`
   files in Next, so the gate is a no-op and the **named URL serves the real site**, with no restart
   and no `--force` needed. Testing the gate itself is still possible by starting the server
   explicitly without the override.
2. **CLAUDE.md "Driving the dev server"** — recorded that (a) a `*.estuaire.localhost:1355` 404 means
   *no portless route* (check `portless list`), not a broken app; (b) the reliable restart is **stop
   + `npm run dev`** (re-registers the route), not `portless run --force` (can drop the route); (c)
   worktree dev servers are gate-off.

## Lessons
- **A 404 on the portless named URL ≠ app bug.** It almost always means the subdomain has no live
  route. `portless list` first; restart cleanly; never silently bypass to the raw port.
- **Don't `portless run --force` to restart a tethered server when you need the named URL.** Stop
  it, then `npm run dev` — the route re-registers reliably.
- **Dev should be gate-off by default.** A `SITE_PREVIEW_TOKEN` leaking into the shared
  `.env.development` silently breaks local review for every worktree; force it off at the launcher
  (wt.toml) rather than fighting it per-session.
- The empirical recipe that works (verified): nothing running → `SITE_PREVIEW_TOKEN= npm run dev` →
  `portless list` shows the route → named URL returns 200 with the real page.
