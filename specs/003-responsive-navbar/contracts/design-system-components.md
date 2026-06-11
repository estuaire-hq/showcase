# Contract — Design-system components (presentational, props only)

All three are **presentational** (Principle VIII): props in, no Sanity, no `next/navigation`, no
scroll logic. They may be `"use client"` because they receive handlers/state. Built from the Figma
nodes at build time (Principle VII); intrinsic geometry read losslessly, never guessed.

Reused as-is (already in the DS, match the KIT): `NavButton` (link pills, `tone`, `active`),
`ContactButton` (CTA pill, `tone`, `size`, `active`).

---

## `SiteHeader` — the bar

```ts
type NavTone = "onLight" | "onDark";

type SiteHeaderProps = {
  items: { label: string; href: string }[]; // from navigation.items
  cta: { label: string; href: string };     // navigation.cta
  brandHref: string;                          // "/"
  logo?: React.ReactNode;                     // logo slot (SVG or flagged placeholder)

  /** Visual state machine (data-model §2). */
  state: "top" | "hidden" | "pinned";
  /** Per-slot tone at rest (state="top") for the "ghost" slots (logo + links + toggle);
   *  ignored when pinned/hidden (fixed onLight). The CTA is NOT toned this way — see rules. */
  logoTone?: NavTone;
  linksTone?: NavTone;

  /** Active route highlighting (FR-016). */
  activeHref?: string;

  /** Mobile menu trigger (rendered as <MenuToggle> internally below `lg`). */
  isMenuOpen: boolean;
  onMenuToggle: () => void;

  /** Disable transitions (prefers-reduced-motion) → instant state changes. */
  reducedMotion?: boolean;
  className?: string;
};
```

Rules:

- Renders the brand/logo (left), the horizontal `items` + `cta` (right) **at `lg:` and up**; below
  `lg:`, hides the list and shows `<MenuToggle>` (FR-004, FR-007).
- `state` drives container styling (transparent/no-shadow when `top`; opaque + shadow + `fixed`
  when `pinned`; `-translate-y-full` when `hidden`).
- At `top`, pass `logoTone`→logo, `linksTone`→links + toggle; the CTA is always rendered as
  `<ContactButton tone="bleu">` (DS variant, never a hard-coded colour), independent of state/tone;
  when `pinned`/`hidden`, force links + toggle to `onLight`.
- An item is marked `active` when `item.href === activeHref` — where `activeHref` is the
  **already-resolved** matching entry's href (the wrapper does the prefix match), **never the raw
  pathname** (pills already emit `aria-current`).
- `reducedMotion` removes transition classes (no slide/fade).
- Intrinsic dims (height ≈160 desktop / ≈120 below, paddings, gaps, logo size) **read from Figma**.

---

## `MenuToggle` — hamburger / close button

```ts
type MenuToggleProps = {
  isOpen: boolean;
  onClick: () => void;
  tone?: NavTone;             // contrast when over the transparent header
  /** Accessible label, e.g. "Ouvrir le menu" / "Fermer le menu". */
  label: string;
  className?: string;
};
```

Rules (FR-011, SC-006):

- `<button type="button">` with `aria-expanded={isOpen}`, `aria-controls` pointing at the panel id,
  and an accessible name (`aria-label`/visually-hidden text) that reflects open/closed.
- Icon switches hamburger ↔ close based on `isOpen`.
- Focusable, keyboard-activable; `tone` sets icon colour over the transparent header.

---

## `NavPanel` — full-screen mobile/tablet panel

```ts
type NavPanelProps = {
  id: string;                                  // matches MenuToggle aria-controls
  isOpen: boolean;
  onClose: () => void;                         // close affordance (cross)
  items: { label: string; href: string }[];
  cta: { label: string; href: string };
  brandHref: string;
  logo?: React.ReactNode;
  activeHref?: string;
  /** Called when an entry is selected — wrapper navigates then closes (FR-010). */
  onSelect?: (href: string) => void;
  reducedMotion?: boolean;
};
```

Rules (FR-008, FR-009, FR-011):

- `role="dialog"` `aria-modal="true"` with an accessible label; semi-opaque dark backdrop (≈ 90%,
  read losslessly from nodes `77:3630` / `87:5893`).
- Shows logo + all entries stacked (same order as desktop) + `cta` + a close cross top-right (where
  the menu icon was).
- The wrapper owns focus-trap / scroll-lock / `inert` (not the DS component) — `NavPanel` only
  exposes the markup, the `id`, the close affordance, and `onSelect`.
- `reducedMotion` → appears/disappears instantly (no slide/fade).
- Entries link to `item.href`; selecting one calls `onSelect(href)` (navigate + close).

---

## Export surface (`src/design-system/index.ts`)

Add: `export { SiteHeader } from "./components/SiteHeader";`,
`export { MenuToggle } from "./components/MenuToggle";`,
`export { NavPanel } from "./components/NavPanel";` and the `NavTone` type.
