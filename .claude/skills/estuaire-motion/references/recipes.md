# Estuaire Motion — Recipes

Ready-to-use GSAP + Lenis code for the Estuaire primitives. All examples assume the
plugins are registered (`_lib/gsap.ts`) and the page is wrapped in `SmoothScroll`
(Lenis). Use inside `useGSAP(() => { … }, { scope: ref })`. **Scrub → `ease:'none'`.
Animate only transform/opacity. Text is never parallaxed.**

## Reduced-motion gate (always)

```ts
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Still split + apply fonts if needed, but skip every transform when `reduce`.
```

## 1. `Reveal` — title line-mask reveal (then static)

The signature title motion. Each line rises from a mask on enter, **once**, then never
moves. Works with `BrandText` inside (SplitText by line preserves the per-char font
spans).

```ts
const title = root.querySelector<HTMLElement>("[data-reveal]");
if (title) {
  const split = new SplitText(title, { type: "lines", mask: "lines" });
  if (!reduce) {
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.15,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: title, start: "top 85%", once: true },
    });
  }
  // cleanup: split.revert();  (useGSAP handles tween cleanup)
}
```

For the hero (on load, not scroll): drop the `scrollTrigger` and add `delay: 0.15`.

## 2. `ImageReveal` — clip-path reveal (then static)

Presents a key image on enter. Use `fromTo` so the start state is explicit.

```ts
for (const el of root.querySelectorAll<HTMLElement>("[data-image-reveal]")) {
  if (reduce) continue;
  gsap.fromTo(
    el,
    { clipPath: "inset(0 0 100% 0)" },
    {
      clipPath: "inset(0 0 0% 0)",
      duration: 1.3,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    },
  );
}
```

Sequence it **after** the section title (don't fire both at once).

## 3. Parallax — "slow rise into place" (images/panels only)

Good parallax = **depth + staggered arrival**, not movement for its own sake:
- **Depth via speed** — each layer moves a different amount. Background slow (small
  amplitude), foreground faster (larger). Subtle (amplitudes ≈ 6–18%) — never disorient.
- **Staggered arrival** — elements at different page positions naturally arrive at
  different moments; with different speeds too, two images rise one *after* the other.
  Never sync them.
- **Slow rise & settle** — an element rises from below as you scroll toward it, settles
  ~when centered, then drifts on slightly. Scrubbed (`ease:'none'`); Lenis smooths it.
- **Text never parallaxes.**

```tsx
// markup — bigger number = closer/faster layer
<div data-parallax="16"> … foreground image … </div>
<div data-parallax="9">  … background image … </div>
```

```ts
for (const node of root.querySelectorAll<HTMLElement>("[data-parallax]")) {
  if (reduce) continue;
  const amp = Number.parseFloat(node.dataset.parallax || "0");
  gsap.fromTo(
    node,
    { yPercent: amp },              // starts below its slot
    {
      yPercent: -amp * 0.5,         // rises through 0 (~centered) then drifts on
      ease: "none",
      scrollTrigger: { trigger: node, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    },
  );
}
```

Two images in one zone? Give them **different amplitudes** (e.g. 16 vs 9) so one rises
faster/arrives sooner than the other — that contrast is what reads as depth.

## 4. `SectionRecede` — gentle hero/section handoff

The transition that "carries the effect". As the hero scrolls away, its **visual layer**
(image + panel) recedes slightly — the text leaves naturally with the scroll (no
independent transform). No pinning, no stacking.

```ts
const heroVisuals = root.querySelector<HTMLElement>("[data-recede]");
const heroSection = root.querySelector<HTMLElement>("[data-hero]");
if (heroVisuals && heroSection && !reduce) {
  gsap.to(heroVisuals, {
    yPercent: -6,
    scale: 0.97,
    autoAlpha: 0.65,
    ease: "none",
    scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: true },
  });
}
```

For a section→section handoff, apply the same idea to the outgoing section's visuals.

## 5. Hover micro-interactions (feedback only)

Prefer CSS/Tailwind — cheap and reduced-motion-safe.

```tsx
// Button state fade (Estuaire buttons have defined hover states)
<button className="transition-colors duration-300 hover:bg-estuaire hover:text-white">…</button>

// Cas-study card — contextual signature: image zoom + slight blur
<article className="group relative overflow-hidden">
  <img className="transition-[transform,filter] duration-700 ease-out
                  group-hover:scale-105 group-hover:blur-[2px]" />
</article>
```

## Canonical restrained hero (putting it together)

```tsx
"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/motion/gsap"; // promoted from (lab)/_lib

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const root = ref.current; if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // load: title line reveal (then static) + image clip
    const title = root.querySelector<HTMLElement>("[data-reveal]");
    if (title) {
      const s = new SplitText(title, { type: "lines", mask: "lines" });
      if (!reduce) gsap.from(s.lines, { yPercent: 110, duration: 1.15, ease: "expo.out", stagger: 0.1, delay: 0.15 });
    }
    const img = root.querySelector<HTMLElement>("[data-image-reveal]");
    if (img && !reduce) gsap.fromTo(img, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.3, ease: "expo.out", delay: 0.3 });

    if (reduce) return;
    // scroll: hero visuals recede (text scrolls naturally), image parallax
    const heroVisuals = root.querySelector<HTMLElement>("[data-recede]");
    const hero = root.querySelector<HTMLElement>("[data-hero]");
    if (heroVisuals && hero) gsap.to(heroVisuals, { yPercent: -6, scale: 0.97, autoAlpha: 0.65, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  }, { scope: ref });

  return (/* markup with data-hero, data-reveal (title), data-image-reveal, data-recede */ null);
}
```

## Notes

- `useGSAP` auto-kills ScrollTriggers on unmount — never use a bare `useEffect`.
- Lenis is already driving `gsap.ticker`; do not add a second RAF loop.
- After dynamic content/layout changes, call `ScrollTrigger.refresh()`.
- For per-breakpoint differences, wrap in `gsap.matchMedia()` (desktop vs tablet/mobile).
