# Estuaire Design System

The single source of truth for Estuaire's visual language, in code. **Isolated on
purpose**: importing from `@/design-system` means you are *consuming* the system;
editing a file in here means you are *changing* the system (a deliberate design act).

## Boundary rule

- Pages and features import design only from `@/design-system` — never hard-code
  colors, fonts, radii, or re-implement a button / pill / card.
- A change to a token or component here propagates everywhere. Treat every edit as a
  design decision.

## Structure

- `tokens.ts` — colors, fonts, named title styles, radii (mirrors the `@theme` tokens
  in `src/app/globals.css`; extracted from the Figma KIT `75:2963`).
- `typography/` — `BrandText` (per-character brand rule: UPPERCASE → Montserrat,
  lowercase → Montserrat Alternates), title styles, outline text.
- `components/` — KIT components with their states (Button, Pill, filters, form, cas
  study card, footer elements, …).
- `motion/` — the estuaire-motion primitives (see the `estuaire-motion` skill).

## Source of truth

Figma `Rv5HxXNkF6VkTke0ttdAbe` (Webdesign-ESTUAIRE), KIT node `75:2963`. The design
source files (`.pen`, exported JSON/images, pull scripts) live in the hidden `.design/`
folder at the repo root.
