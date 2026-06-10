---
tags: [decision, sanity, design-system, architecture]
status: accepted
date: 2026-06-10
---
# 0005 — Connected components for global Sanity content (data/presentation boundary)

## Context
The footer was wired by fetching its Sanity singleton in `(site)/layout.tsx`
(`getFooterProps()`) and spreading the result into the design-system `<SiteFooter>`.
That threads CMS data through the layout for content that is global and identical
everywhere. The instinct was to let "the component load its own Sanity document".
Two things were being conflated: **where** the data is fetched, and **which**
component does the fetching. Putting the fetch *inside the DS component* would reach
the same call-site ergonomics but couple `@/design-system` to Sanity — breaking the
isolation the DS exists for (ADR [[0003-design-system]]) and the decoupling stance of
ADR [[0004-content-images-in-sanity]] ("DS components stay source-agnostic").

## Decision
Adopt the **container / presentational split**, RSC-flavoured. Three roles, clearly
separated:

| Role | Where | Responsibility |
|---|---|---|
| Presentation | `@/design-system` | props only — NEVER touches Sanity |
| Sanity → props mapping | `@/lib/sanity/<doc>.ts` | `sanityFetch` + defaults + `urlFor` |
| Connection | `src/components/<Doc>.tsx` | async Server Component: self-fetch + render the DS component |

- **DS components stay pure** (props only). No `sanityFetch`, GROQ, `@/lib/sanity`
  or `urlFor` inside `@/design-system`. This keeps the DS isolable, testable, and
  renderable in isolation (lab / Storybook).
- **Global / singleton content** (footer, header, site settings) is loaded by a
  **connected Server Component** in `src/components/` that self-fetches and renders the
  DS component. Layouts and pages then consume `<Footer />` with **no props threaded**.
- **Page-specific content** stays fetched by the page (Server Component), which passes
  props to the DS component — same boundary, the page is the connector.

First application: `src/components/Footer.tsx` wraps `<SiteFooter>`;
`(site)/layout.tsx` renders `<Footer />`. `getFooterProps()` (in
`@/lib/sanity/footer.ts`) and `SiteFooter` are unchanged.

## Consequences
- New convention for every global/singleton document — the header and a future `settings`
  doc follow this exact gabarit.
- `src/components/` is **not** a catch-all: it holds connected wrappers (a defined role),
  consistent with the intent of constitution Principle III (no junk-drawer `components/`).
- The lab page that renders `<SiteFooter>` with hard-coded props keeps working — the DS
  component never changed.
- Codified as constitution **Principle VIII — Data/Presentation Boundary** (v1.5.0) and in
  CLAUDE.md (Key Patterns + Design System).
- Workflow: **Sanity doc → `@/lib/sanity/<doc>.ts` (fetch + map) → connected `<Doc>` (RSC) → pure DS component.**
