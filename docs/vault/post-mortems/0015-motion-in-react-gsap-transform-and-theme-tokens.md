# 0015 — Motion en React/Next : GSAP possède le transform + tokens `@theme` GSAP-only

- **Date** : 2026-06-23
- **Contexte** : construction de la DA des animations ([[../decisions/0021-motion-art-direction]]).
- **Voisins** : [[0013-verifying-during-seed-and-next-cache-purge]] (purge `.next` — déjà tracée, non
  redoublée ici), [[0014-gsap-lifecycle-soft-nav-and-hidden-tab]] (cycle de vie GSAP en soft-nav).

## Symptômes

1. **Rideau de page qui ne couvre jamais.** Le panneau (`PageTransition`) restait hors écran pendant la
   « couverture » puis se retrouvait à `translateY(200%)` au lieu de revenir. Transform observé :
   `translate(0%, 100%) translate(0px, 900px)` — deux translations **cumulées**.
2. **Fondu de page qui ne s'applique pas.** Après ajout des tokens `--animate-page-fade` /
   `--duration-*` dans `@theme`, l'utilitaire/animation ne s'appliquait pas (`animationName: none`,
   variables **absentes** de `:root`) — alors que d'autres tokens `@theme` plus anciens étaient bien là.

## Causes racines

1. **React ré-applique le `style` inline à chaque rendu ; GSAP écrit AUSSI le `transform`.** Le panneau
   portait `style={{ transform: "translateY(100%)" }}` (React) **et** GSAP animait `yPercent` (donc le
   `transform`). À chaque re-rendu (le composant lit `usePathname`), React ré-imposait sa valeur inline,
   et le `transform` final concaténait les deux → 100% + 100% = 200%, et pendant la « couverture » le
   100% de React annulait le 0% de GSAP (jamais couvert). **Deux systèmes propriétaires du même
   `transform`.**
2. **Tailwind v4 + `@theme` :** (a) **Turbopack ne recompile pas un changement `@theme` à chaud** → un
   token ajouté n'existe pas tant qu'on n'a pas redémarré le serveur (déjà noté dans CLAUDE.md). (b) Plus
   subtil : Tailwind v4 **élague les variables `@theme` non référencées en CSS** — une variable hors
   namespace connu (ex. `--duration-curtain`, `--clusterParallax`) **n'est émise dans `:root` que si elle
   est utilisée par une classe générée**. Les valeurs purement consommées par GSAP ne le sont jamais →
   elles n'apparaissent pas dans `:root`. (`--ease-expo` apparaît, lui, car le namespace `--ease-*`
   génère l'utilitaire `ease-expo`.)

## Corrections / règles

- **Un seul système possède un `transform` animé. Pour GSAP, c'est GSAP.** Ne **jamais** poser une
  transform animée via le `style` (ou un utilitaire de transform) React sur un élément que GSAP anime.
  L'état de repos se gère **autrement** : ici, le panneau est `opacity-0` au repos (invisible quel que
  soit son transform, donc pas de flash) et GSAP pose `yPercent` + `opacity` au déclenchement. Corollaire
  GSAP général : préférer `gsap.set()`/`fromTo()` pour l'état initial plutôt qu'un `style` React concurrent.
- **Les valeurs de motion lues par GSAP vivent dans `tokens.ts`** (source live). `@theme` reste la
  source de vérité **déclarée** (et pour ce que le CSS consomme : `--ease-expo`, transitions), mais ne
  comptez pas sur la présence d'une variable `@theme` GSAP-only dans `:root`. Si une valeur motion doit
  être lue en CSS **et** GSAP, la référencer dans une classe (ex. `duration-[var(--duration-line)]`) pour
  forcer son émission.
- **Après tout changement `@theme` : redémarrer le serveur dev** (Turbopack). Pour repartir propre après
  un kill brutal / cache douteux : `rm -rf .next` complet + `npm run dev` (cf. [[0013-verifying-during-seed-and-next-cache-purge]]).
- **Vérifier le mouvement en machine, pas à l'œil** : ces deux bugs ont été pris en **mesurant** le
  `transform`/l'opacité au navigateur (Playwright) à plusieurs positions de scroll, pas en regardant une
  vignette.
