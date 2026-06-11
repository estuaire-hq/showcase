---
tags: [decision, navbar, content, sanity, architecture]
status: accepted
date: 2026-06-11
---
# 0009 — Static navbar content (with a non-breaking Sanity migration path)

## Context
The responsive navbar (feature `003-responsive-navbar`) needs four primary entries
(*nous découvrir, expertises, univers, réalisations*) plus a *contact* CTA and a
brand/home link. Constitution **Principle II** ("CMS as the single content source —
no hard-coded content") would normally push this into Sanity.

But this content is **navigation chrome bound to the app's route structure**, not
volatile editorial copy: the labels mirror the site's sections, and the target pages
do not even exist yet (FR-014, out of scope). The spec settled the question
explicitly: **FR-015 prescribes static content in code for this version.** Putting
navigation in Sanity now would add a schema + a typed seed + a connected wrapper for
content that does not change until the site's IA changes — premature abstraction
(Principle IV) for zero current gain.

## Decision
Keep the navbar content **static, in one typed module**: `src/content/navigation.ts`
(`NavConfig` = `items[]` in desktop order, `cta`, `brandHref`). Pure module — no
Sanity import, no `"use client"`, no side effects. Mirrors the existing
`src/content/footer.ts` pattern (maquette copy in one place).

This is a **conscious, bounded deviation from Principle II**, sanctioned by the spec
(FR-015) and tracked in the plan's *Complexity Tracking*. Logo SVG + nav icons are UI
assets (allowed in the repo by II).

## Migration path (non-breaking)
The **shape** of `navigation.ts` is deliberately Sanity-migration-friendly. When/if
the navbar moves to the CMS, follow exactly the `Footer` pattern (ADR 0005):

1. Add a `navigation` singleton schema → `npm run typegen` (ADR 0006).
2. Add `src/lib/sanity/navigation.ts` exposing `getNavProps(): NavConfig` — same
   shape, with these static values as DEFAULTS (front fallback).
3. The connected wrapper `src/components/Navbar.tsx` swaps its import from
   `@/content/navigation` to `await getNavProps()`; the presentational `SiteHeader`
   props and all behaviour stay **identical**.

So the source of the props changes; the component contract and behaviour do not. The
deviation is reversible with no change to the design system.

## Consequences
- ✅ No premature schema/seed/wrapper; the navbar ships now with the rest of the
  socle.
- ✅ Route slugs are fixed in one place (`/nous-decouvrir`, `/expertises`, `/univers`,
  `/realisations`, `/contact`) — to confirm with Pierre if a different convention is
  wanted.
- ⚠️ The labels are not editor-editable until the migration above is done — accepted
  for navigation chrome.

## Notes / open points (read losslessly from Figma, surfaced here)
- The Figma opened-panel frames (`77:3630` / `87:5893`) order the entries *nous
  découvrir, **univers, expertises**, réalisations* — i.e. Univers/Expertises swapped
  vs the desktop bar. We keep a **single desktop order everywhere** (consistent with
  `footer.ts` and the `navigation-config.md` invariant "same order desktop ↔ panel");
  the panel swap is treated as a maquette inconsistency — **to validate with Pierre.**
