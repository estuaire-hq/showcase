<!--
Estuaire PR template. Fill the sections, delete those that don't apply,
and remove the HTML comments before submitting. Keep it short: describe
the WHAT and the WHY, not the diff (it speaks for itself).
-->

## Summary

<!-- 1-2 sentences: what this PR does and why now. -->

## Spec & decisions

<!-- Link the artifacts of record. Remove lines that don't apply. -->
- Spec: `specs/<feature>/` (spec, plan, tasks)
- ADR: `docs/vault/decisions/<id>-<slug>.md`
- Constitution: affects / complies with version <x.y.z>
- Issue / context: #<num>

## Key changes

<!-- Bullet the significant changes, grouped by area (deps, runtime, content, docs...). -->
-

## Validation

<!-- Check what was actually run. For a manual gate not yet passed, keep [ ] and say who/what. -->
- [ ] `npm run lint` (Biome) green
- [ ] `npm run build` (prod / standalone build) green
- [ ] `npm run typegen` up to date if the Sanity schema changed (`src/sanity.types.ts` committed)
- [ ] `npm run seed -- --check` green if a seed changed
- [ ] Smokes / visual parity vs reference (detail below)

<!-- Detail the manual checks and any gates still pending (e.g. pixel-perfect judgment, editorial pass, integration gate requiring a token). -->

## Project compliance

<!-- Constitution / CLAUDE.md guardrails. Check what applies. -->
- [ ] Server Components by default; `"use client"` only when needed
- [ ] Data/presentation boundary respected — `@/design-system` stays presentational (never fetches Sanity); fetching lives in a connected wrapper or the page (Principle VIII, ADR 0005)
- [ ] Sanity types generated (never hand-written); seeds via the typed tooling (Principle IX, ADR 0006)
- [ ] Tailwind utilities — no unjustified custom CSS; tokens from the `@theme`
- [ ] Env vars: `NEXT_PUBLIC_` rule respected, no new `.env` file, `.env.example` documented
- [ ] No unmentioned Coolify/Docker config changes
- [ ] Any added dependency is evaluated and justified (commit/PR)

## Out of scope

<!-- What was deliberately left out, to frame the review. -->
-

## Deployment & risks

<!-- Expected effects of merging (Coolify auto-deploys on main), content migrations, rollback points, what to watch in prod. -->
-
