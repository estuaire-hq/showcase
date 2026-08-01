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

## Extension: measured tone (ADR 0029, 2026-07-31)

The declarations above remain the contract, the server-rendered value, and the **only** source on
pages whose bar sits on a solid surface. But a declaration copied off the maquette is only true while
the hero image matches the one the maquette was drawn on: on « Nous découvrir » the editorial image
was replaced by a wider crop, the dark timber rack left the frame, and the white logo dropped to
**1,44:1** (WCAG 2.2 SC 1.4.11 asks 3:1). See ADR 0029 and post-mortem 0023.

So pages whose bar floats over a **photo** additionally emit the sampled luminance of the strip under
the bar, and each slot resolves its own tone from it:

| Attribute | Values | Meaning |
|---|---|---|
| `data-nav-band-sm` | 32 comma-separated ints 0-255 | Luminance of the header strip, left→right, at the mobile hero aspect. |
| `data-nav-band-md` | idem | Same at the tablet hero aspect. |
| `data-nav-band-lg` | idem | Same at the desktop hero aspect. |

Produced by `pageHeroBandAttributes()` (`@/lib/nav/luminance`, server-only) from the image's already
fetched LQIP, with `PageHero`'s ink veil composited per breakpoint. Consumed by `useMeasuredTones`,
which reads each slot's box (`data-nav-slot`, the logo, each link's href, `cta`, `toggle`) and picks
the tone whose side of `TONE_THRESHOLD` the covered columns fall on. A slot straddling the threshold
also gets a legibility halo. Absent attributes → declared tones apply unchanged.

Emitting pages: `/nous-decouvrir`, `/expertises`, `/expertises/[expertise]`. Deliberately NOT
emitting (contrast guaranteed by construction, measuring would swap a guarantee for an estimate):
`/`, `/univers`, `/univers/[slug]`, `/realisations`, `/realisations/[slug]`, the legal pages.

## Non-goals

- No single-tone-per-bar model (would lose the per-slot split the maquette shows).
- No `mix-blend-mode` detection: it yields **zero** contrast on mid-tones (~128, precisely the risky
  band) and turns the logo cyan over warm timber.
- ~~No runtime background sampling~~ : **reversed by ADR 0029.** The original rejection (research §1)
  assumed sampling meant decoding the image in the browser at runtime: CORS-dependent, costly, and
  visible as a colour flash after hydration. The measurement adopted is not that: it happens
  **server-side** on the LQIP already in hand, so it costs no request and no client image decode, and
  the resolved tone is server-rendered. Only the box geometry is read client-side, because a pill's
  width depends on the rendered font.
