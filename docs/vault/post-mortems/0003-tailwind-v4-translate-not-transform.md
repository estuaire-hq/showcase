---
tags: [post-mortem, motion, tailwind-v4, navbar]
status: actioned
date: 2026-06-11
---
# 0003 — Navbar hide didn't animate: Tailwind v4 animates `translate`, not `transform`

## What happened
The responsive navbar's "hide on scroll down / reveal on scroll up" was built with a
state-driven class swap: `hidden` → `-translate-y-full`, plus
`transition-[transform,background-color,box-shadow] duration-300`. It type-checked,
linted and looked right in code — but the bar **snapped** in/out with **no slide**.
Pierre caught it: *"tu n'as pas fait d'animation quand la nav disparaît."*

## Root cause
In **Tailwind CSS v4**, the transform utilities (`translate-x/y`, `scale`, `rotate`)
were refactored to emit the **individual CSS properties** — `-translate-y-full`
produces `translate: 0 -100%` (the `translate` property), **not** `transform:
translateY(-100%)`. Our transition listed `transform`, which never changed, so there
was nothing to tween → instant jump. (Transitioning `translate` is possible, but its
value is `var(--tw-translate-x) var(--tw-translate-y)`, and relying on a CSS-variable
change to tween a standard property is fragile across engines.)

## Fix
Drive the slide with **GSAP** (the project's motion stack — estuaire-motion), which
sets `transform` directly, sidestepping the property mismatch entirely and giving the
exact token ease:

```ts
useEffect(() => {
  const el = headerRef.current; if (!el) return;
  const yPercent = state === "hidden" ? -100 : 0;
  if (reducedMotion) { gsap.set(el, { yPercent }); return; }      // instant (a11y)
  const tween = gsap.to(el, { yPercent, duration: 0.4, ease: "power2.out", overwrite: "auto" });
  return () => tween.kill();
}, [state, reducedMotion]);
```

Background/shadow stay CSS transitions (`transition-[background-color,box-shadow]`) —
those are standard properties and tween fine; only the transform moved to GSAP. (Also
made `hidden` transparent so the bar slides up cleanly over the hero instead of
flashing white, revealing as solid `pinned`.)

## Lesson
- On **Tailwind v4**, never assume `transition-[transform]` covers `translate-*`
  utilities — they animate the **`translate`/`scale`/`rotate`** properties. Either
  transition those property names, or (preferred for real motion) drive the transform
  with GSAP and animate `transform` directly.
- A class swap that "should" transition is **not verified until seen moving**. tsc +
  lint + build-compile green says nothing about whether a CSS transition actually
  plays — and here the runtime was sandbox-blocked (no Sanity), so the gap reached
  Pierre. When runtime can't be exercised, call animation **UNVERIFIED**, don't imply
  it works.
