---
tags: [post-mortem, motion, gsap, scrolltrigger, footer, hero, app-router]
status: actioned
date: 2026-06-23
---
# 0014 — GSAP lifecycle on soft-nav & hidden tab: stale footer ScrollTrigger + `from()` corruption

Two distinct homepage motion bugs reported by the client, both rooted in GSAP
lifecycle events the code never handled (App Router soft navigation; tab visibility).
Both were reproduced in-browser with instrumentation before fixing.

## Bug 1 — Footer: white band + dead reveal after soft navigation

### What happened
On a page, click a footer link (soft nav), land on the new page, scroll back to the
bottom → a **white band below the footer** and the reveal effect is gone (the footer no
longer "emerges from behind"). A hard reload of the same page fixes it. Before any soft
nav, everything works.

### Root cause
`FooterReveal` lives in `(site)/layout.tsx`, which **persists** across soft navigations
inside the segment (App Router only swaps `{children}`, never the layout). Its `useGSAP`
runs **once** and builds the reveal `ScrollTrigger` with its range (`trigger: content`,
`start: "bottom bottom"`, `end: "bottom top"`) measured against the **first page's
height**. Soft nav changes the page height but **nothing recomputes that trigger**. When
the new page is shorter, its entire max-scroll range falls *below* the stale (taller)
range, so the trigger never fires → the footer stays frozen at its start offset
(`y = -innerHeight · REVEAL_LAG`).

Measured: home → `/expertises` soft nav, at max scroll → footer `translateY = -198px`
(= `0.22 × 900`, the start offset) and a **198px white band** (the body is `bg-paper` =
white). After a hard reload of `/expertises` (fresh `FooterReveal` mount): `translateY:0`,
**0 gap**. The contrast proves it is the stale range, not the page.

The page-level triggers (`Parallax`, `PinnedCaseStudies`) remount per page and call
`ScrollTrigger.refresh()` on mount, but relying on that to fix the *persistent* footer
trigger is fragile and demonstrably did not work (stale after settle; not every page
wraps a `Parallax`).

### Fix
`src/lib/motion/RouteScrollRefresh.tsx`: a tiny client component in `(site)/layout.tsx`
that watches `usePathname()` and calls `ScrollTrigger.refresh()` after the new page has
committed + laid out (double `requestAnimationFrame`). It skips the first mount (fresh
triggers measure themselves) via a `lastPath` ref comparison (also a no-op under Strict
Mode's double-invoked effect). `refresh()` is global and all triggers already set
`invalidateOnRefresh: true`, so ranges **and** function-based offsets recompute. Verified
across 4 successive soft navs (tall↔short): `translateY:0`, 0 band everywhere.

## Bug 2 — Hero: title returns half-built after a tab switch

### What happened
Switch browser tabs, come back → **sometimes** the hero title reconstruction is shown
incomplete (only some letters), permanently. The bug is intermittent and worse the
longer the tab was backgrounded.

### Root cause
The rotating title reconstructs changed glyphs with `gsap.from(changed, {autoAlpha:0, …})`
(`immediateRender` is true by default for `.from()`). A backgrounded tab **suspends the
GSAP ticker (rAF) but not `setInterval`**, so the 6 s autoplay keeps advancing slides
while the ticker is frozen. Each advance creates a new `from()` on the **same reused
glyph DOM nodes** (positional keys). `from()` records the *current* value as the tween's
**destination**; for a glyph a previous (frozen, un-rendered) `from()` already set to
`autoAlpha:0`, the destination becomes `autoAlpha:0`. The "natural end" gets corrupted in
cascade across several frozen slide changes. On return, the ticker catches up (it jumps,
because `SmoothScroll` sets `gsap.ticker.lagSmoothing(0)` → no delta clamping), but those
glyphs animate to their **corrupted** `autoAlpha:0` end → stay invisible.

Reproduced with a controllable rAF + visibility harness:
- **One** frozen slide change → self-heals on return (single tween, clean end). 0 stuck.
- **~4** frozen slide changes (≈19 s background) → **17 glyphs stay hidden permanently**
  after return (the half-built title). This is the bug.

### Fix (`HeroSlideshow.tsx`)
1. **Pause autoplay while the tab is hidden** — gate the `setInterval` on
   `document.visibilityState` (stop on hidden, restart on visible). No slides advance
   while frozen → no stacked `from()` tweens → no cascade. Also the correct carousel
   behaviour (don't cycle slides nobody watches).
2. **Idempotency safety on return** — a `visibilitychange → visible` handler kills any
   in-flight title tween and snaps the current glyphs to their resting state
   (`autoAlpha:1, yPercent:0`). Covers the remaining case (switch away *mid-reveal*) and
   guarantees a complete title regardless of ticker timing.

The validated text effect (letter-by-letter rebuild) is **unchanged** in normal use.
`prefers-reduced-motion` stays honored (no autoplay, no reveal, no listener). Verified:
long background → title intact; mid-reveal freeze → complete on return; normal reveal
still completes.

## Lessons
1. **A persistent App Router layout makes its ScrollTriggers go stale on soft nav.**
   Anything built once in a `layout.tsx` (here `FooterReveal`) measures the first page
   forever. Refresh `ScrollTrigger` on route change (watch `usePathname()`), after layout
   settles. Don't rely on child pages' incidental `refresh()`.
2. **`gsap.from()` reads its destination from the live DOM — never create one on an
   element another `from()` already moved but hasn't rendered.** When the ticker can be
   starved (hidden tab) while state still mutates (timers/React), the destination gets
   corrupted. Prefer `fromTo()` with an explicit end, and/or don't let loops fire while
   hidden.
3. **A backgrounded tab freezes rAF but not `setInterval`/React.** Any rAF-driven
   animation loop (GSAP ticker) paired with a non-rAF driver (timers, state) will desync.
   Gate animation loops on `document.visibilityState`, and make reveals idempotent
   (guarantee the final state on return).
4. **Reproduce visibility/lifecycle bugs deterministically.** Playwright tabs don't truly
   background each other (rAF keeps running, no `visibilitychange`). A controllable-rAF +
   overridden `document.visibilityState` harness reproduced both the freeze and the
   corruption exactly, and proved the fix — far better than eyeballing.
