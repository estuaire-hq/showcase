# CLAUDE.md — Estuaire

## Project

Site vitrine Next.js + Sanity pour Mosaique Production / marque Estuaire, deploye via Coolify sur VPS OVH.

## Stack

- **Framework**: Next.js 15, App Router, TypeScript
- **CMS**: Sanity Cloud (embedded Studio)
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP, Framer Motion
- **Email**: Nodemailer
- **Analytics**: Umami (self-hosted)

## Commands

```bash
npm run dev       # Dev server via portless → http://estuaire.localhost:1355 (PORTLESS=0 → :3000)
npm run build     # Production build
npm run lint      # Biome check (lint + format)
```

**Deploy**: `git push` on main → Coolify auto-deploys on OVH VPS. No manual Docker/Coolify config changes without explicit mention.

## Parallel Dev — Worktrees (worktrunk + portless)

Run several features/agents at once, each in its own git worktree, **without dev servers
fighting over port 3000**. Two complementary tools (see **ADR 0013**):

- **worktrunk** (`wt`) — git worktree lifecycle (create / switch / list / remove) + hooks.
- **portless** — local reverse proxy on `:1355` giving each worktree a **named, stable URL**
  instead of a port. `npm run dev` is wired to `portless run next dev`.

### Dev URL changed — `npm run dev` no longer uses `localhost:3000`

portless routes by **name** (stable across restarts — by name, not port):

- main checkout → `http://estuaire.localhost:1355` (Studio: append `/studio`)
- worktree on branch `feat-x` → `http://feat-x.estuaire.localhost:1355`

**Escape hatch**: `PORTLESS=0 npm run dev` bypasses the proxy → classic `http://localhost:3000`
(use this for tooling that still assumes `:3000`, e.g. the pixel-review / run / verify skills).
**portless must be installed** for `npm run dev` to work at all (dev prerequisite).

### One-time machine setup

Install (worktrunk + portless), the `:1355` proxy, the git-crypt×worktree fix, worktrunk hook
approvals, and the **dev** Sanity CORS origins — all documented in
**[`docs/worktrees-portless-setup.md`](docs/worktrees-portless-setup.md)**.

### Worktree workflow

```bash
wt switch -c feat-x     # new branch+worktree → hook runs `npm ci`, then starts the dev server
wt list                 # all worktrees + their portless dev URL
wt switch feat-x        # jump into an existing worktree
wt remove               # delete worktree (its tethered dev server is killed automatically)
```

The `post-start` hook in `.config/wt.toml` installs deps then starts the server **tethered**
(`wt step tether`), so it dies on `wt remove`. The first `wt switch -c` per machine asks to approve
those hook commands — pre-approve once with `wt config approvals add` (see setup), or pass `--yes`.

### Spec-driven features get their own worktree (`/speckit.specify`)

`/speckit.specify` is wired (ADR 0014) to create a **worktree** (not just a branch) via worktrunk,
write the spec inside it, and — when Claude runs **inside tmux** — open a new tmux window with Claude
rooted in that worktree, ready to continue `/speckit.plan → /speckit.tasks → /speckit.implement` there.
Out of tmux it prints `wt switch <slug> -x claude` instead. The session boundary is inherent (Claude
can't move its own cwd); the spec/plan/tasks files carry the context across it. So: **run Claude inside
tmux** to get the auto-opened worktree session (see the setup guide).

### Ad-hoc work gets its own worktree too (`/dispatch`)

`/speckit.specify` is the spec-driven path; **`/dispatch`** is the **same worktree+tmux handoff for
ad-hoc work** — a feature or change that doesn't warrant a full spec (ADR 0015, generalizes ADR 0014).
It derives a slug, creates a worktree via worktrunk, writes a **brief** to `<worktree>/.dispatch/brief.md`
(the context carrier across the session boundary — there is no spec.md), and — inside tmux — opens a
new tmux window with a fresh Claude rooted in the worktree that reads the brief and works. Out of tmux
it prints the `wt switch <slug> -x claude` fallback. The command itself decides:

- **pass-through vs enriched brief** — a clean one-shot request → the raw prompt; a request refined
  through discussion → a synthesized brief capturing the decisions made;
- **`direct` vs `reflect` mode** — a clear mechanical task → the new session implements straight away;
  a task needing design/trade-offs → it proposes its approach first, then implements.

**Proactively offer `/dispatch`** when, in a normal conversation, a **substantial** implementation is
ready to start (a feature or a multi-file change — NOT a one-line fix, a quick question, or a tweak to
the current diff): before editing, ask whether to run it in a worktree + tmux session via `/dispatch`,
so this session stays free and the work runs in parallel. If they decline, implement here as usual.

### Driving the dev server (as the agent)

- **Find the URL**: `wt list` or `portless list`.
- **Read its logs** (compile errors, runtime, HMR) of the auto-started server:
  `tail -f "$(wt config state logs get --hook=user:post-start:server)"`
- **Restart** — required after a Tailwind **`@theme`** change (Turbopack won't recompile it live)
  or a crash. Prefer a **clean restart**: stop the running server, then `npm run dev` (re-registers
  the portless route reliably). `portless run --force next dev` can leave the route **unregistered**
  after killing a tethered server — the dev server then answers on its raw `localhost:<port>` but the
  named URL 404s (see next point). If you instead launch it in your own background shell, read its
  logs from that shell.
- **A 404 on `*.estuaire.localhost:1355` means NO portless route**, not a broken app — the
  machine-wide proxy 404s any subdomain it has no live route for. Check `portless list`; if the
  route is missing, restart cleanly (above). Don't conclude the page is broken and bypass via the
  raw port — that abandons the named-URL convention. (Post-mortem 0011.)
- **Gate is OFF in worktree dev servers** — the `.config/wt.toml` server hook runs with
  `SITE_PREVIEW_TOKEN=` empty, so the named URL serves the **real** site (not `/coming-soon`), even
  when the shared `.env.development` carries a token. No restart needed to review. (Post-mortem 0011.)
- **Cleanup**: `portless prune` kills orphaned dev servers from crashed sessions.

### Gotchas

- **Shared dev dataset** — every worktree uses the same `.env.development` → the **same dev
  Sanity project**. Don't `npm run seed -- --reset` while another worktree is working.
- `.env.development` (git-crypt) decrypts in a fresh worktree **thanks to the one-time git-crypt
  filter config above** — without it, `git worktree add` aborts on the smudge filter. ADR 0013.
- New origins are already in `allowedDevOrigins` (`next.config.ts`); they must also be in the
  dev project's Sanity CORS (above) for the embedded Studio to authenticate.
- A worktree checks out the **committed** branch state — the portless wiring (`package.json`'s
  `dev` script, `.config/wt.toml`) must be **committed** on the base branch, else `npm run dev`
  in a worktree falls back to plain `next dev` on `:3000` (no portless route).

## Project Structure

```
src/
  app/                    # App Router routes
    (site)/               # Public-facing pages
    studio/[[...tool]]/   # Embedded Sanity Studio
    api/                  # API routes (revalidation, contact form)
  components/             # Connected components: RSC wrappers that self-fetch
                          #   Sanity & render a (pure) @/design-system component
  content/                # Neutral maquette copy (seed source + front fallback)
  design-system/          # Isolated visual module — presentational, never fetches
  lib/
    sanity/               # CONSUMPTION side: how the app reads Sanity at runtime
      client.ts           # Sanity client config
      live.ts             # sanityFetch wrapper (ISR tags); auto-typed via TypeGen
      queries.ts          # GROQ queries (defineQuery → typed results)
      <doc>.ts            # Sanity → props mapping (+ defaults, urlFor)
    utils/                # Shared utilities
  sanity/                 # MODEL side: how content is defined (Studio)
    schemas/              # Sanity document & object schemas
    structure.ts          # Studio desk structure
    seed/                 # Typed, schema-validated seeds + runner + scaffolder
  sanity.types.ts         # GENERATED by TypeGen (committed) — shared content types
```

## Language Conventions

- **French**: documentation only (README, docs, specs)
- **English**: code, commits, branch names, code comments, **and pull request titles + descriptions**
- **Pull requests**: written in **English**, and MUST follow `.github/PULL_REQUEST_TEMPLATE.md`
  (fill the sections, delete those that don't apply). `gh pr create` does NOT auto-apply the
  template, so paste it into `--body` explicitly.

## Code Conventions

- Server Components by default; `"use client"` only when needed
- **Naming**: PascalCase components, camelCase functions/variables, kebab-case files
- No `any` in TypeScript — use proper types
- Absolute imports with `@/`
- One component per file

## Dependencies

Adding a dependency is allowed and often **better than hand-rolling** logic we would
then have to maintain ourselves. The goal is not to restrict — it is to add deps
**deliberately and in a controlled way**. Reinventing a well-solved problem is a cost;
so is an unmaintained dependency. Choose with eyes open.

**Before adding any package, evaluate it** (cross-check live — see the global "Verify
Before Acting" rule — never from memory):

- **Maintenance**: recent releases and commits? Or abandoned (last publish years ago)?
- **Bus factor**: how many maintainers / active contributors? A one-person package is a risk.
- **Adoption**: GitHub stars, npm weekly downloads, who depends on it.
- **Health**: open vs. closed issues, stale PRs, responsiveness, breaking-change history.
- **Footprint**: bundle size, tree-shakeability, number of transitive dependencies.
- **License** compatible with a commercial site, and **TypeScript** support (typed or `@types/*`).
- **Security**: known CVEs, supply-chain surface.

**Decision rule**: if a healthy, well-adopted library does the job, prefer it over a
home-made version. If the need is trivial, or no candidate is healthy, write it ourselves
(small, owned, tested). **Record the rationale** in the commit / PR that introduces the dep.
Reuse what is already installed before reaching for a new package.

## Environment Variables

- **Dev source**: `.env.development` at the root — encrypted in git via git-crypt, plaintext on disk after `git-crypt unlock`
- **Use vs. read**: the agent may **use** the dev secrets — never **read** the file. Tooling
  that loads them via `--env-file=.env.development` (`npm run seed` / `seed:ci`, `npm run figma`,
  `node --env-file=…`) is fine; this includes the **dev write token**, so the agent CAN seed the
  *dev* Sanity project (`npm run seed [-- <doc>] [--reset]`) without ever opening the file.
  Forbidden: `cat`/Read/`grep`/`source` of `.env*` (except `.env.example`) — anything that surfaces
  a secret value. (Prod write token stays CI-only — no local path to write prod.)
- **Prod source**: Coolify UI only — no `.env.production` file in the repo
- **Two separate Sanity projects**: local dev and prod point at **different Sanity
  projects** (distinct `projectId`), not just different datasets. `NEXT_PUBLIC_SANITY_PROJECT_ID`
  is the *dev* project in `.env.development`, the *prod* project in Coolify. A local
  `npm run seed` only populates the *dev* project; **prod is seeded via the CI job**
  (`.github/workflows/seed-sanity.yml`) with the prod `projectId` + a write token for the
  *prod* project (stored as a GitHub Actions secret — never in the prod runtime). See ADR 0006.
- **Prefixes by domain**: `NEXT_PUBLIC_SANITY_`, `SMTP_`, `NEXT_PUBLIC_SITE_`, `REVALIDATION_`, `UMAMI_`
- **`NEXT_PUBLIC_` rule**: reserved for variables actually consumed client-side. A variable injected into the HTML by a Server Component MUST NOT carry this prefix — Next.js inlines `NEXT_PUBLIC_*` at build time, which breaks runtime flexibility across Docker environments (Coolify).
- **Documented** in `.env.example` with comments for every expected variable
- Never create additional `.env` files (no `.env.production`, no `.env.local`, no per-service `.env`)

## Key Patterns

### Fetching Sanity Content

Use the `sanityFetch()` wrapper from `@/lib/sanity/sanityFetch`. It wraps `client.fetch()` with ISR cache tags for on-demand revalidation. All Sanity fetches happen server-side — never fetch Sanity content from the client.

### Data/Presentation Boundary — Connected Components

The design system (`@/design-system`) is **presentational only**: components take props and
NEVER touch Sanity (`sanityFetch`, GROQ, `@/lib/sanity`, `urlFor`). Data loading lives outside
the DS, split into three roles (constitution Principle VIII; ADR 0005):

| Role | Where | Responsibility |
|---|---|---|
| Presentation | `@/design-system` | props only — no Sanity |
| Sanity → props mapping | `@/lib/sanity/<doc>.ts` | `sanityFetch` + defaults + `urlFor` |
| Connection | `src/components/<Doc>.tsx` | async RSC: self-fetch + render the DS component |

- **Global / singleton content** (footer, header, settings) → a **connected Server Component**
  in `src/components/` self-fetches and renders the DS component. Layouts/pages then render
  `<Footer />` with **no props threaded**. Reference: `src/components/Footer.tsx`.
- **Page-specific content** → the page (Server Component) is the connector: it fetches and
  passes props to the DS component.
- `src/components/` is for connected wrappers (a defined role), not a catch-all dump.

### Revalidation

Sanity webhook → `POST /api/revalidate` → `revalidateTag(tag)`. Each query declares its cache tags via `sanityFetch()`.

### Adding a New Page

1. Create a route in `src/app/(site)/`
2. Create a Sanity schema in `src/sanity/schemas/`
3. Write a GROQ query in `src/lib/sanity/queries.ts`
4. Fetch data with `sanityFetch()` in the page's Server Component

### Adding a New Sanity Content Type

1. Define the schema in `src/sanity/schemas/`
2. Register it in the schema index
3. `npm run typegen` → regenerates `src/sanity.types.ts` (the shared content types)
4. Add a GROQ query (`defineQuery`) in `@/lib/sanity/queries.ts` — its result type is generated
5. Add the desk structure entry if needed
6. For **global/singleton** content: add the mapping in `@/lib/sanity/<doc>.ts` and a
   connected wrapper in `src/components/<Doc>.tsx` (see Data/Presentation Boundary above)
7. **Seed it** (the agent authors seeds): `npm run seed:scaffold -- <doc>` → fill the TODOs with
   the maquette values (read the Figma node via the `estuaire-figma-cli` skill; put copy shared with the front
   fallback in `src/content/<doc>.ts`) → register
   in `src/sanity/seed/registry.ts` → `npm run seed -- --check` → `npm run seed`.

### Sanity Types & Seeds (TypeGen)

The schema is the single source of truth; types are **generated, never hand-written**
(constitution Principle IX; ADR 0006).

- `src/sanity.types.ts` is generated by `npm run typegen` and **committed**. Never hand-type a
  content shape that duplicates the schema — import the generated `Footer` / `FOOTER_QUERYResult`.
- Seeds live in `src/sanity/seed/documents/<doc>.seed.ts`, typed via `defineSeed<T>` against the
  generated document type. Declare assets with `image()` / `file()` (upload intents — the runner
  resolves them and injects `_key`).
- `npm run seed -- --check` is a dry-run gate (offline, no token): it fails on a missing required
  field or a referenced asset absent on disk. Run it before `npm run seed`.
- Write policy: `npm run seed` = `createIfNotExists` (never clobbers editor edits); add `--reset`
  to reset documents to the maquette. Restrict to one type with a positional arg (`-- footer`).
- **NEVER put a `.` in a seed document `_id`.** Sanity reserves the dot as an `_id` namespace
  (`drafts.…`, `versions.<release>.…`): a dotted `_id` is treated as a *version*, so it is
  **never served on the public `published` perspective** — the doc reads fine with a token (Studio
  + authenticated reads) but is **invisible to anonymous/SSR reads**, so the front renders text
  fallback **without** the Sanity images. Use a hyphen for multi-instance ids
  (`expertiseSubpage-agencement-sur-mesure`, like `sectorDetail-retail`), never
  `expertiseSubpage.<slug>`. Symptom + decisive test in post-mortem 0010 (addendum).
- Maquette copy shared between a seed and the front fallback lives once in `src/content/<doc>.ts`.
- **Seed source images live in `seed-assets/`** — committed (so a fresh checkout / CI has them),
  **outside `public/`** (so they are never served by Next nor copied into the runtime image),
  and excluded from the Docker build context via `.dockerignore`. Never reference `public/` assets
  from a seed: `public/` ships to prod, and `--check` would fail on a fresh CI checkout.
- **Two Sanity projects**: a local `npm run seed` writes to the *dev* project only; prod is seeded
  by the CI job (see Environment Variables). A push only ever runs `createIfNotExists`; `--reset`
  on prod is a deliberate, pre-launch action via a manual `workflow_dispatch` (`reset=true`) — the
  prod write token lives only in CI, so there is no local path to reset prod.

## Do NOT

- Fetch Sanity content client-side (everything server-side)
- Hand-type a Sanity content shape that duplicates the schema (import the generated types), or
  write an ad-hoc seed script (use the typed seed tooling under `src/sanity/seed/`) — see ADR 0006
- Write custom CSS — use Tailwind utilities (exceptions must be justified)
- Add a dependency without evaluating it first (see **Dependencies** above — evaluate, don't ban)
- Modify Coolify/Docker config without mentioning it
- Create additional `.env` files (dev goes in `.env.development`, prod in Coolify UI)
- Read `.env.development` or any `.env*` file (except `.env.example`) — strictly forbidden, secrets are protected by git-crypt and permissions.deny

## Design System

All visuals come from the isolated **`@/design-system`** module — never hard-code colors,
fonts, radii, or re-implement a button / pill / card. Importing = consuming; editing files in
`src/design-system/` = changing the design system (a deliberate act).

- **Tokens** live in the Tailwind v4 `@theme` (`src/app/globals.css`) — the source of truth
  (palette + type scale `text-display/title/subtitle/lead/body/caption`). `tokens.ts` is a thin
  TS mirror for JS/GSAP. Style with Tailwind utilities (`bg-estuaire`, `font-display`, `text-title`).
- **Presentational only**: DS components take props and NEVER fetch Sanity. Data loading
  lives in a connected wrapper (`src/components/`) or the page — see *Data/Presentation
  Boundary* under Key Patterns (constitution Principle VIII; ADR 0005).
- Component variants use **`tailwind-variants` (`tv`)**; `cn` is in `src/lib/utils.ts`.
- Build components by reading the KIT frame losslessly: `figma.ts read 75:2963` (+ curated
  `kit/…` targets in `.design/figma-cache/index.json`) — see the `estuaire-figma-cli` skill.
- Brand type rule: UPPERCASE → Montserrat, lowercase → Montserrat Alternates (`BrandText`).
- ⚠️ Turbopack: **restart `npm run dev` after `@theme` changes** (CSS not recompiled live).

## Pixel-Perfect & Animation (skills)

- **Any research around the maquettes** (a node's geometry/styles, an image, what targets exist,
  cache freshness): use the local Figma cache CLI `.design/scripts/figma.ts` (`read`/`list` offline;
  `collect`/`status` hit Figma) — **a skill, `estuaire-figma-cli`, documents how to use it**. Figma is
  the source of truth, mirrored into the versioned cache (`.design/figma-cache/`); **never guess a
  design value — query the cache** (not the rate-limited MCP). See ADR 0010.
- Before building a page/section: load the **`estuaire-pixel-perfect`** skill — build from the full
  lossless node (never infer), exact intrinsic geometry, `@/design-system` + `@theme` tokens,
  responsive per breakpoint, content images → Sanity, verify against the cached Figma render.
- Before animating: load the **`estuaire-motion`** skill — text static; visuals + section
  transitions carry the motion; line-mask title reveals; honor `prefers-reduced-motion`.
- **At the END of every maquette-based feature, before any pixel-perfect sign-off: load the
  **`estuaire-pixel-review`** skill** (MANDATORY). It is the verify counterpart of the build
  skill: capture the dev page per breakpoint, then **align the two images section by section**
  (cached Figma render ↔ dev screenshot, same width) with the Pillow helper (side-by-side +
  overlay + diff) and a per-section checklist — **never sign off from a whole-page thumbnail**.
  Loop fix→recapture→re-diff until zero gap; name any remaining gap as UNVERIFIED.
- Pixel-perfect = exact **intrinsic** dims; **dynamic** dims (full-height hero) may deviate;
  responsive **per breakpoint** (Figma frames).

## Project Memory & Vault

- Durable project knowledge (the *why*) → **`docs/vault/`** (Obsidian): decisions as ADRs in
  `docs/vault/decisions/`, R&D, content inventory. Record decisions as they are made.
- **Post-mortems & methodology lessons → `docs/vault/post-mortems/`.** After any mistake,
  rework, or change to how we work (a method, a skill, a convention), write the lesson down
  there — root cause + the fix — *before moving on*. A lesson that isn't recorded will recur.
- Design source files (`.pen`, Figma cache + toolchain) → hidden **`.design/`**.
- Frontier: *project understanding → repo (vault / specs / DS) · law → constitution · agent
  state & how-to-assist → local memory.* See the constitution's **Memory & Knowledge Architecture**.

## Coming Soon Gate (temporary)

A pre-launch access gate lets the site ship to prod **before it is finished**: the public
sees a "Site en construction…" placeholder while the owner/client browse the real site via a
secret link. Implemented in `src/proxy.ts` (a Next.js **`proxy`** — the v16 successor to
`middleware`, runs in the Node runtime so the token is read at request time, not inlined at
build). Driven by ONE server-only env var, **`SITE_PREVIEW_TOKEN`** (not `NEXT_PUBLIC_`). See
**ADR 0007** (`docs/vault/decisions/0007-coming-soon-preview-gate.md`).

- **Token set** → every public route is `rewrite`n to `/coming-soon` (URL preserved, real
  routes never leak) and `robots.ts` makes the whole site `noindex`. Unlock by visiting the
  permanent link **`/v/<token>`** once: it drops a long-lived (30 d) `httpOnly` cookie and
  redirects to a clean `/`; thereafter you browse normal URLs. The link is shareable.
- **Token absent/empty** → the gate is a **no-op**, the site is fully open and indexable.

**Bypassing it locally**: by default `SITE_PREVIEW_TOKEN` is unset in dev → the gate is
already a no-op, you reach the real site directly at the dev URL (`http://estuaire.localhost:1355`;
`PORTLESS=0` → `localhost:3000`). **In worktrees the gate is forced OFF** by the `.config/wt.toml`
server hook (`SITE_PREVIEW_TOKEN=`), so the named portless URL serves the real site even if
`.env.development` carries a token — no action needed (post-mortem 0011). If you start the dev
server **yourself** (outside the hook) and the token *is* set, prefix your command with
`SITE_PREVIEW_TOKEN=` (do **not** use `portless run --force`, which can drop the route — stop +
`npm run dev` instead), or visit `http://<branch>.estuaire.localhost:1355/v/<token>` once to unlock.
(`.env.development` is git-crypt'd and off-limits to the agent — never read it; assume the gate is
off unless told otherwise.)

**Be aware of the matcher** (`src/proxy.ts` `config.matcher`): it gates page routes but
exempts `api`, `studio`, `coming-soon`, `_next`, and **any path with a file extension**. That
last exemption is load-bearing — the Next image optimizer fetches local `public/` images over
an internal cookie-less request; without it the gate rewrites those to `/coming-soon` (HTML)
and every optimized local image 400s (post-mortem 0005). Keep new gated routes extension-less.

**Temporary — remove at public launch.** The gate is a launch convenience, not a permanent
feature. Going public = **remove `SITE_PREVIEW_TOKEN` in Coolify** (no code change, no
rebuild). Afterwards the proxy/placeholder/robots logic can stay dormant (no-op) or be deleted
outright (`src/proxy.ts`, `src/app/coming-soon/`, the gate branch of `robots.ts`).

## Lab (temporary)

The `src/app/(lab)/` route group is a temporary playground (validating pixel-perfect + motion).
**Remove it and its served assets (`public/lab`) once the homepage is fully built.** Production
pages live under `(site)` and consume `@/design-system`. (Figma reference assets no longer live
under `public/` — they are versioned in `.design/figma-cache/assets/`, named by node id and linked
per target in `index.json.image`; `read` surfaces `# render: …`. `.design/` is dev-only, never
served. See ADR 0010.)
