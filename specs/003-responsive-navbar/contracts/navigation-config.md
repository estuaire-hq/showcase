# Contract — Static navigation config (`src/content/navigation.ts`)

The single source of navigation content for this version (FR-015). Pure module, no Sanity, no
runtime. Shape is intentionally Sanity-migration-friendly (a future `getNavProps()` returns the same
shape, exactly like `getFooterProps()`).

## Types

```ts
export type NavItem = {
  /** Displayed label (FR copy). Non-empty. */
  label: string;
  /** Internal route. Absolute path starting with "/". May not exist yet (FR-014). */
  href: string;
};

export type NavCta = {
  /** Defaults to "contact". */
  label: string;
  /** Internal route, e.g. "/contact". */
  href: string;
};

export type NavConfig = {
  /** Exactly 4 entries, desktop order (FR-002): Nous découvrir, Expertises, Univers, Réalisations. */
  items: NavItem[];
  /** The highlighted "contact" CTA. */
  cta: NavCta;
  /** Brand/logo target — "/" (FR-003). */
  brandHref: string;
};

export const navigation: NavConfig;
```

## Invariants

- `navigation.items.length === 4`.
- Every `href` starts with `/` and is unique across `items` + `cta`.
- Array order **is** display order (desktop list and mobile panel — same order, Hypothèses).
- No import from `@/lib/sanity`, no `"use client"`, no side effects.

## Consumers

- `src/components/Navbar.tsx` (client wrapper) imports `navigation` and feeds the DS components.
- Future Sanity migration: add `src/lib/sanity/navigation.ts` exposing `getNavProps(): NavConfig`
  (with defaults from this module) — call sites unchanged, behavior unchanged.
