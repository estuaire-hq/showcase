/**
 * Cross-component motion coordination (one document, module-scoped).
 *
 * `viaCurtain` answers: did the home page mount because the user clicked an internal link
 * and the `PageTransition` curtain is carrying the navigation? The curtain already shows
 * the logomark writing itself, so when the destination is the home, `HomeHero` skips its
 * own black entry intro (no double logomark moment). Set by `PageTransition` around a
 * navigation; read by `HomeHero` on mount. On a hard load nobody sets it → it stays
 * `false` → the full entry intro plays (the impactful "ouverture du site").
 */
export const navState = { viaCurtain: false };
