---
tags: [decision, sanity, typegen, seeds, types, anti-drift]
status: accepted
date: 2026-06-10
---
# 0006 — Schema-derived types & typed, validated seeds

## Context
Pre-filling Sanity with the maquette values is the practice (see [[0004-content-images-in-sanity]]).
But it lived as **one ad-hoc script** (`scripts/seed-footer.mjs`) with no convention, and the
content types were **hand-typed** (`FooterData` in `lib/sanity/footer.ts`, with a "no TypeGen
yet" note). That left four drift surfaces, all silent:

1. **Schema ↔ seed** — the seed's object literal was checked against nothing. A renamed/added
   required field in the schema would not surface in the seed.
2. **Seed ↔ front** — the maquette copy was duplicated between the seed script and the front
   `DEFAULTS`. Two "sources of the maquette".
3. **Schema ↔ front types** — `FooterData` was re-derived by hand from the schema + query.
4. **Boilerplate** — `_key` / `_type` / `reference` were hand-managed; unscalable past one doc,
   and **the seeds are authored by the agent**, which invents field names and drifts without a gate.

## Decision
The **schema (`defineType`) is the single source of truth**; types are *derived*, and seeds are
*typed against them and validated before write*.

- **Types via Sanity TypeGen.** `npm run typegen` (`sanity schema extract && sanity typegen
  generate`) → `src/sanity.types.ts` (committed). Config in `sanity.cli.ts`
  (`overloadClientMethods: true` so `sanityFetch` is auto-typed). The front consumes the generated
  query-result types; the hand-typed `FooterData` is gone. We do **not** pass
  `--enforce-required-fields` to the main generation — that would make *query-result* types claim
  non-null fields that a draft can legitimately leave empty.
- **Typed seeds** in `src/sanity/seed/`. `defineSeed<Footer>({…})` checks a declarative seed
  against the generated document type via the `Seed<T>` bridge (`define.ts`): image/file objects
  become upload *intents* (`image()` / `file()`), array members shed `_key`, system fields are
  dropped. A renamed/removed field is now a **compile error** in the seed.
- **Runtime `--check` gate.** TypeGen leaves fields optional, so the type alone can't force
  required coverage. `npm run seed -- --check` (offline, no token) reads an **enforced** schema
  extract (`sanity schema extract --enforce-required-fields` → `.sanity/schema.strict.json`, where
  a required field is one *without* `optional: true`) and fails if a required field is missing or a
  referenced asset is absent on disk.
- **Write policy.** `createIfNotExists` by default (never clobbers editor edits); `--reset` →
  `createOrReplace` to reset to the maquette. The runner uploads assets idempotently (Sanity is
  content-addressed; a local manifest skips the round-trip) and injects stable `_key`s.
- **Scaffolder.** `npm run seed:scaffold -- <doc>` emits a typed `*.seed.ts` stub from the schema
  (real field structure, image/file intents, no invented names) to fill with maquette values.
- **Maquette copy lives once**, in `src/content/<doc>.ts` — a *neutral* location belonging to
  neither the Studio/model side (`src/sanity/`) nor the runtime consumption side
  (`src/lib/sanity/`), imported "downward" by both the seed and the front fallback. No seed ↔ front
  duplication, no sideways tree dependency.
- **`tsx`** (devDependency) runs the typed seed scripts (TS + `@/` aliases, no build step). Dev
  tooling only — never shipped.

## Consequences
- Drift is mechanically caught: schema ↔ types/seed → compile error; missing required field or
  asset → `--check` failure. The four silent surfaces above are closed.
- **Workflow for a new content type** (agent-facing): scaffold → fill from the Figma maquette
  (read the node via the `estuaire-figma-cli` skill; content images → Sanity, ADR 0004) → `seed -- --check` → `seed`.
  Register the seed in `src/sanity/seed/registry.ts` (order matters for cross-document refs).
- **Boundary map**: `src/sanity/` defines the model · `src/lib/sanity/` consumes it at runtime ·
  `src/content/` holds neutral maquette copy · `src/sanity.types.ts` is the generated contract above
  all three. Reconciles with [[0003-design-system]] (DS stays presentational) and
  [[0005-connected-components-for-global-sanity-content]].
- **Seed source images live in `seed-assets/`** (committed, *outside* `public/`, excluded from the
  Docker build context via `.dockerignore`): the `--check` requires every referenced asset on disk,
  so they must be in the repo to be reproducible in CI — but they must NOT ship (the runtime image
  only copies `public/`, and `public/` is also served). The runner uploads them to Sanity; the app
  reads them from Sanity (ADR 0004). The footer's are maquette images for now — swap for the curated
  set when ready. Never reference `public/` from a seed.
- **Two separate Sanity projects** (dev vs prod, distinct projectId — see the constitution's
  Variables d'environnement): seeding is *per project*. A local `npm run seed` populates only the
  dev project; the prod project is seeded by the CI job (`.github/workflows/seed-sanity.yml`,
  `createIfNotExists`) with the prod projectId + a write token held as a GitHub Actions secret —
  the write token never reaches the prod runtime (which keeps only a read token).
- Intermediate schema files (`schema.json`, `.sanity/`) are gitignored; `src/sanity.types.ts` is
  committed (diffs visible in PRs, no regeneration needed on pull).
- Codified as **constitution Principle IX** (v1.6.0) and in CLAUDE.md (Adding a New Sanity Content
  Type + the Types & Seeding pattern).
