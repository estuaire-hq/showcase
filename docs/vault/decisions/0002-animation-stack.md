---
tags: [decision, animation]
status: accepted
date: 2026-06-09
---
# 0002 — Animation stack: GSAP + Lenis

## Context
Reference site **ocitocine.com** decoded (read its JS bundle): GSAP 3.14 + plugins
(ScrollTrigger, ScrollSmoother, SplitText, Flip) + **Lenis** smooth scroll, no WebGL.

## Decision
**GSAP 3.15 + @gsap/react (`useGSAP`) + Lenis (`lenis/react`)**. GSAP is now free for
commercial use including all plugins (Webflow, since 2025-04-30).

## Rationale
Mirrors the reference exactly; free; ScrollTrigger pin/scrub + SplitText cover our needs.
Lenis drives the GSAP ticker (one rAF loop); reduced-motion aware.

## Consequences
The motion *cinematics* (how/when to animate) are codified in [[motion-cinematics]] and the
**`estuaire-motion`** skill. To ratify in the constitution once the DS is integrated.
