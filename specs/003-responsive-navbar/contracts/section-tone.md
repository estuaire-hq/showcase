# Contract — Section tone declaration (adaptive contrast)

How a page tells the transparent (at-rest) navbar what colour each slot should be, so content stays
legible over the header visual (FR-005, clarification Q1). Declarative, per-slot, deterministic
(research §1). Only consumed while the navbar is in the `top` state; once `pinned`, tone is fixed.

## Declaration

The page's **header region** (the element under the navbar at the top of the page — e.g. the hero)
declares its per-slot tone via data attributes:

```html
<header data-nav-logo-tone="onDark" data-nav-links-tone="onLight">
  …hero…
</header>
```

| Attribute | Values | Meaning |
|---|---|---|
| `data-nav-logo-tone` | `onLight` \| `onDark` | Tone for the logo slot (left). |
| `data-nav-links-tone` | `onLight` \| `onDark` | Tone for links + CTA + menu toggle (right). |

`onDark` = content is **light** (over a dark zone); `onLight` = content is **dark** (over a light
zone). Per-slot because the maquette hero splits dark-left / light-right.

## Resolution rules (wrapper `Navbar.tsx`)

1. While `state === "top"`: read the declared tones from the current header region; apply them.
2. If the page declares **no** header tone → default both slots to `onLight` (dark content, safe on
   a light surface).
3. While `state === "pinned"` or `"hidden"`: ignore declarations → fixed `onLight` (dark content on
   opaque light bar).

## Values per page

- **Home** (`51:2221`): `data-nav-logo-tone="onDark"`, `data-nav-links-tone="onLight"` — to be
  **confirmed losslessly** against the Figma node at build (do not hard-assume; read the node).
- **Other pages**: declare their own header tones when those pages are built (out of scope here).

## Non-goals

- No runtime background sampling / `mix-blend-mode` detection (research §1, rejected).
- No single-tone-per-bar model (would lose the per-slot split the maquette shows).
