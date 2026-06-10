---
tags: [post-mortem, motion, footer, scroll]
status: actioned
date: 2026-06-10
---
# 0002 — Footer "reveal from behind": guessing the mechanic vs decoding the reference

## What happened
Building the footer reveal (the page slides up to uncover the footer behind it,
ocitocine-style), the first implementation pinned the footer with `position: fixed;
bottom: 0` + a measured spacer (`margin-bottom = footerHeight`) so the opaque page
scrolled over it. It worked — until Pierre tested it: the **big footer is ~1398px,
taller than the viewport (~900px)**, so its top ~500px (CTA banner) was permanently
clipped above the fold and **unreachable** (you cannot scroll *inside* a fixed
element). The legal links / CTA could never be seen.

## Root cause
A `position: fixed` element is laid out relative to the viewport and **cannot be
scrolled through**. For any footer taller than the viewport, fixing it means part of
it is always off-screen with no way to reach it. The "reveal" only worked because the
footer happened to fit when I tested at a tall-enough viewport / shorter footer.

## Fix
Keep the footer in **normal flow** (so it is fully scrollable at any height) and make
it the *lower* z-layer:
- Page content = opaque top layer (`relative z-10 bg-paper`).
- Footer = normal flow behind it (`relative z-0`), fully scrollable.
- Entrance = a **scrubbed parallax lag** (footer offset upward, hidden behind the
  opaque page, scrubbing back to `y:0` as the page lifts away) — reads as "emerging
  from behind", then `y:0` and the footer scrolls normally. One block, never per-line
  text parallax (estuaire-motion rule holds). Reduced motion → footer just flows,
  static. See `src/lib/motion/FooterReveal.tsx`.

## Detour: a wasted `ScrollTrigger` pin
Chasing "make it bigger / come from further", I cranked the parallax amplitude (toward
a full viewport). It *inverted*: a bigger offset over the same scroll makes the footer
move SLOWER, so it looked like LESS motion ("transition légère"), and with an `inOut`
ease it nearly froze mid-reveal. I then reached for a `ScrollTrigger` pin to
manufacture scroll — which **held the footer still for a moment**. Pierre: "le footer
derrière est complètement arrêté". Both were wrong turns from guessing instead of
checking the reference.

## What the reference actually does (decoded live)
Launched ocitocine.com with the browser MCP and measured the footer's `translateY` vs
scroll. It is **none of the above**: the footer is `position: static` in normal flow,
`z` BEHIND the content (`main { z-index: 2 }`, footer `z: auto`), with a scroll-driven
`translateY` that is **never pinned** — constant offset (≈ −½ its height) during entry,
then a roughly **linear ramp to 0 ending at max scroll** (footer moves ≈ 0.5× there).
It is **continuous — it never stops**. Their footer is also *shorter than the viewport*
(695 vs 900), so it just rests at the bottom; ours is taller, so after the settle you
scroll through it.

## Fix (final)
In-flow footer BEHIND the content with a **continuous, never-pinned** scrubbed
`translateY` (`sine.inOut` → speed-matched at both ends, no snap). The settle ends when
the footer's **top reaches the viewport top** (not at max scroll). See
`src/lib/motion/FooterReveal.tsx` (`REVEAL_LAG`, trigger on the content with
`start: "bottom bottom"`, `end: "bottom top"`).

Settling at max scroll (`end: "bottom bottom"`/`"max"`) was wrong for a footer TALLER
than the viewport: the negative offset stays non-zero until the very bottom, so the
footer's top (the CTA) is **cropped the whole time** — covered by the page while the
content is on screen, then already pulled above the fold once it isn't. Ending the
settle when the footer top hits the viewport top presents the footer's top IN FULL,
then you scroll through the rest. (ocitocine can settle at the bottom only because its
footer is *shorter* than the viewport, so it fully fits there.)

## Lessons
1. **Reveal/parallax effects must assume the revealed element can exceed the viewport.**
   Prefer in-flow + z-index + a scrubbed transform over `position: fixed`/`sticky`
   pinning whenever the content is variable-height or scroll-through.
2. **Decode the reference empirically before iterating.** One `charlotte_evaluate`
   reading the live `transform` vs scroll on ocitocine answered in minutes what several
   guess-and-tweak rounds (and a pin detour) failed to. When a site is the spec, go
   measure it.
3. **A parallax couples amplitude and speed.** More offset over fixed scroll = slower,
   not "more". To go bigger without freezing, lengthen the scroll (or keep it linear).

## Side change
Promoted `SmoothScroll` + `gsap.ts` out of `src/app/(lab)/_lib/` to `src/lib/motion/`
and wrapped the public site (`(site)/layout.tsx`) with Lenis — the lab now imports the
same shared motion home. (Docs still referencing the old `(lab)/_lib/gsap.ts` path —
CLAUDE.md, the estuaire-motion skill, recipes.md — are now stale.)
