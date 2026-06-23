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
| `data-nav-links-tone` | `onLight` \| `onDark` | Tone for the desktop links (right, `lg`+). |
| `data-nav-toggle-tone` | `onLight` \| `onDark` | *Optional.* Mobile toggle tone (< `md`). Defaults to the links tone. |
| `data-nav-toggle-tone-tablet` | `onLight` \| `onDark` | *Optional.* Tablet toggle tone (`md`–`lg`). Defaults to the links tone. |
| `data-nav-cta-tone` | `bleu` \| `noir` | *Optional.* CTA "contact" rest colour at `top`. Defaults to `bleu`. |

`onDark` = content is **light** (over a dark zone); `onLight` = content is **dark** (over a light
zone). Per-slot because the maquette hero splits dark-left / light-right.

The **toggle** and the **CTA** are their own slots, not a sub-aspect of the links: the toggle
replaces the links below `lg` and can sit over a different part of the header visual (so it carries
**independent** mobile/tablet tones, each defaulting to the links tone for back-compat), and the
CTA's rest colour doesn't track the links tone (Home: links ink + CTA `bleu`; « Nous découvrir »:
links ink + CTA `noir`). When an optional attribute is absent, the slot falls back to the links tone
(toggle) or `bleu` (CTA), so existing pages are unchanged.

## Resolution rules (wrapper `Navbar.tsx`)

1. While `state === "top"`: read the declared tones from the current header region; apply them.
2. If the page declares **no** header tone → default both slots to `onLight` (dark content, safe on
   a light surface).
3. While `state === "pinned"` or `"hidden"`: ignore declarations → fixed `onLight` (dark content on
   opaque light bar). The CTA is `noir`.
4. While `overlay` (full-bleed dark section): all slots `onDark`, CTA `bleu` (ignores declarations).

## Values per page

- **Home** (`51:2221`): `data-nav-logo-tone="onDark"`, `data-nav-links-tone="onLight"` (CTA `bleu`,
  tablet toggle ink — both via defaults) — confirmed losslessly against the Figma node.
- **« Nous découvrir »** (`51:2699` desktop / `78:4374` tablet / `78:4626` mobile):
  `logo="onDark"`, `links="onLight"`, `toggle-tone="onDark"`, `toggle-tone-tablet="onDark"`,
  `cta-tone="noir"` — the logo + toggle stay white over the visual while the desktop links and CTA
  are ink/black over the light right of the hero (the case that motivated the per-slot toggle/CTA
  decoupling).
- **Other pages**: declare their own header tones when those pages are built.

## Non-goals

- No runtime background sampling / `mix-blend-mode` detection (research §1, rejected).
- No single-tone-per-bar model (would lose the per-slot split the maquette shows).
