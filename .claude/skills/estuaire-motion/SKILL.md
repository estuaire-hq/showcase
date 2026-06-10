---
name: estuaire-motion
description: >-
  Use BEFORE animating or building ANY page of the Estuaire site (estuaire.fr).
  Defines the Estuaire motion cinematics — a deliberate, restrained scroll
  choreography where the TEXT stays static (the anchor) while images, panels and
  section transitions carry the motion; titles reveal by line-mask; one focal
  motion at a time; signature effects are contextual, never repeated mechanically.
  Includes the motion tokens, the page-level cinematics (beats), a per-page
  choreography checklist to run before coding, and the reusable GSAP + Lenis
  primitives. Triggers: scroll animation, parallax, reveal, entrance animation,
  page/section transition, hero motion, "animate this page", "make it feel like
  ocitocine" on the Estuaire project.
---

# Estuaire Motion

The deliberate animation system for estuaire.fr. Motion is **designed before it is
coded**: think the cinematics of the whole page first (like a film edit), then
implement. ocitocine.com (the reference) works because it is **restrained** — each
animation has one precise purpose.

## Golden rule

> **The text is the anchor — it stays static.** Reveal each title **once** on entry
> (line-mask), then it never moves again. Body text is static. **Never parallax text.**
> The motion is carried by the **visuals** (images, panels, sections) and by the
> **transitions between sections**. The effect lives in the transitions and in image
> detail — not in moving text.

## The 4 rules

1. **One focal motion at a time.** At any moment, one element leads; the rest stays
   calm. Never animate everything together.
2. **Every motion has a purpose** — guide the eye, signal hierarchy, create rhythm, or
   give feedback. No purpose → no motion.
3. **Restraint > accumulation.** Perfection is in the detail and timing, not the number
   of effects. When unsure, remove.
4. **Signatures are contextual.** Vary the "wow" by section (cas-study hover zoom+blur;
   a Flip thumbnail→detail where it fits). Only **two recurring effects** are constant:
   the **line-mask title reveal** and the **image clip-reveal**.

## Motion tokens

| Token | Value |
|---|---|
| Ease — reveals | `expo.out` |
| Ease — micro-interactions | `power2.out` |
| Ease — scrub (scroll-linked) | `none` (always) |
| Duration — title reveal | 1.0–1.3s |
| Duration — image clip-reveal | 1.1–1.4s |
| Duration — micro-interaction | 0.2–0.3s |
| Stagger — title lines | 0.08–0.12s |
| Parallax — image amplitude | ≤ 8–12% (yPercent) — subtle |
| Parallax — text | **never** |
| Reduced motion | skip all transforms; text/visuals shown instantly |

**Good-parallax craft** (the detail that makes it feel right): depth = layers at
*different* speeds (subtle); elements arrive at *different moments* (stagger by position
+ speed); each rises slowly and *settles near center* instead of popping in; Lenis
smooths it. Never on text. See recipe 3.

## The page cinematics (beats)

1. **Load — the statement.** Header fades in; the hero title reveals **line by line**
   (mask), then is static; the hero image clip-reveals (secondary, slightly delayed).
   Nothing else moves.
2. **Hero → content.** The hero **recedes gently** (image/panel scale-fade or slight
   drift) as the first section arrives. **One** transition. No heavy stacking.
3. **Each section (on enter).** Its title reveals by line (then static); its key
   image(s) clip-reveal **after** the title (sequenced, not simultaneous); supporting
   text fades in calmly; at most **one** subtle image parallax.
4. **Section → section.** A visual handoff — outgoing visuals recede subtly while
   incoming visuals reveal. The transition is the moment.
5. **Signature (per section, optional).** One contextual effect max — e.g. cas-study
   hover (zoom + blur), or a Flip thumbnail→detail where it has meaning.
6. **Micro-interactions.** Hovers only (button state fade, link underline, card lift).

## Per-page checklist — run BEFORE coding

1. Read the page's sections + content from Figma.
2. For each section, pick **the** focal motion and its purpose (usually: title
   line-reveal + key image clip-reveal).
3. Define the inter-section handoff (recede / reveal).
4. Identify **≤ 1** image parallax layer per section.
5. Choose the contextual signature per section (or none).
6. **Audit:** text static everywhere? nothing moves without a purpose? nothing competes
   at the same instant? If not, calm it down.
7. Implement with the primitives + tokens. Verify `prefers-reduced-motion`.

## Primitives (see `references/recipes.md` for the GSAP code)

| Primitive | Purpose |
|---|---|
| `Reveal` (by line) | Title line-mask reveal on enter, then static |
| `ImageReveal` | Clip-path reveal for a key image on enter |
| `data-parallax` / `data-parallax-x` | Subtle scrubbed parallax on **images/panels only** |
| `SectionRecede` | Hero→content & section handoffs (scrubbed recede) |
| hover utilities | Button state fade, card image scale + blur |

## Stack & critical rules (Estuaire)

- **GSAP + `@gsap/react` (`useGSAP`) + Lenis.** Plugins registered once in
  `src/app/(lab)/_lib/gsap.ts` (ScrollTrigger, SplitText, useGSAP). Smooth scroll:
  `SmoothScroll.tsx` (Lenis driven by `gsap.ticker`, reduced-motion aware).
  *(Promote both to `src/lib/motion/` when leaving the lab.)*
- Always use **`useGSAP`** (auto-cleans ScrollTriggers), scoped to a ref.
- **Scrub animations → `ease: 'none'`** and animate **only `transform` / `opacity`**.
- Guard **`prefers-reduced-motion`**: when set, no transforms — reveal content instantly.
- For deep ScrollTrigger / pin / horizontal API, defer to the installed
  **`gsap-framer-scroll-animation`** skill.
