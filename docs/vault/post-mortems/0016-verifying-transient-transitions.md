---
tags: [post-mortem, motion, gsap, verification, playwright]
status: actioned
date: 2026-06-23
---
# 0016 — Vérifier une transition TRANSITOIRE (rideau) au navigateur : la figer, ne pas la chronométrer

- **Contexte** : intégration du `LogomarkLoader` centré dans le rideau `PageTransition`
  ([[../decisions/0021-motion-art-direction]]).
- **Voisin** : [[0015-motion-in-react-gsap-transform-and-theme-tokens]] (« vérifier le mouvement
  en machine, pas à l'œil »). Ce post-mortem en est le corollaire pour les motions **transitoires**.

## Symptôme

Capturer le rideau en plein écran (panneau couvrant + logomark centré) via Playwright MCP par
`click le lien → screenshot` donnait **systématiquement la page d'arrivée déjà révélée**, jamais
l'état couvert. On en concluait à tort « le rideau ne joue pas » (alors qu'il jouait : l'URL
commitait bien pendant la couverture).

## Cause racine

La **latence entre deux appels d'outils** (raisonnement du modèle + aller-retour réseau, plusieurs
secondes) **dépasse la durée de la transition** (couverture 0,8 s + maintien + révélation ≈ 2 s).
Quand le `browser_take_screenshot` part enfin, la transition est terminée depuis longtemps. Un
`wait_for(0.5s)` n'y change rien : il est noyé dans la latence inter-appels, non contrôlable.

Autre faux-ami écarté en chemin : `window.gsap` **n'est pas exposé** (plugins enregistrés en module
`@/lib/motion/gsap`), donc impossible de `gsap.globalTimeline.pause()` depuis un `evaluate`. Et le
navigateur de test n'a **pas** `prefers-reduced-motion: reduce` par défaut (le loader bouclait).

## Corrections / règles

- **Pour screenshoter un état transitoire, le FIGER, pas le chronométrer.** Gonfler temporairement
  le token de durée qui tient l'état voulu — ici `motion.curtainLogoHold` (tokens.ts) porté à `30`
  (s) : le maintien retarde la révélation, le panneau **reste couvrant ~30 s**, on capture à loisir,
  puis on **rétablit la valeur** (1,2). HMR suffit (tokens.ts est TS, pas `@theme`). Vérifié, puis
  reverté.
- **Émuler `prefers-reduced-motion` via `browser_run_code_unsafe`** (`page.emulateMedia({
  reducedMotion: 'reduce' })`) puis recharger : le composant lit `matchMedia` au montage → on teste
  le chemin statique pour de vrai. Décisif : comparer l'état des `path` à t=0,6 s et t=2,1 s (>
  une période de boucle) — **identiques** ⇒ aucune boucle (mark statique plein).
- **Vérifier les mécaniques par `evaluate`, pas seulement par capture** : lire `strokeDasharray`
  (forme `"L  L+4"` ?), `strokeDashoffset` (le front avance-t-il segment par segment ?),
  `getBoundingClientRect`, `getComputedStyle().stroke`. Décisif et insensible à la phase
  d'animation, là où une capture unique peut tomber dans un creux (gap `repeatDelay`) et paraître
  « vide » à tort.
