# 0020 : le tracé du logomark ne terminait pas la marque (sous-forme perdue à la recopie)

- **Date** : 2026-07-25
- **Branche** : `logomark-trace-completion`
- **Lien** : [[post-mortems/0015-motion-in-react-gsap-transform-and-theme-tokens]], [[decisions/0021-motion-art-direction]]

> Numéro 0020 choisi au-dessus du plus haut présent sur `main`. Renuméroter au merge en cas de
> collision avec un worktree parallèle, skill `estuaire-branch-sync`.

## Symptôme

À la **dernière frame** de l'animation du logomark (`LogomarkLoader`, la marque qui « s'écrit »),
il manquait **un petit bout de la queue** par rapport au logo statique (`BrandLogo`) : la marque
n'était jamais restituée intégralement, ni dans l'intro home (`HeroIntro`) ni dans le rideau
inter-pages (`PageTransition`).

## Diagnostic (par l'observation, pas par la lecture du code)

1. **Diff des géométries source** : extraction des `d` des deux composants et comparaison chaîne par
   chaîne : les tracés `top` et `bot` sont **identiques au caractère** ; `mid` diverge sur les 49
   derniers caractères. `BrandLogo` porte une **sous-forme supplémentaire** que le clip du loader
   n'a pas : `M53.1582 52.6367H46.8164V49.6406H53.1582V52.6367Z`, un rectangle de 6,34 × 3,00
   unités de viewBox.
2. **Rendu + diff pixel** (Chrome headless à 10×, masques binaires) : union du clip du loader vs
   symbole `BrandLogo` : **une seule** zone manquante, bbox `(46.8, 49.6)–(53.2, 52.6)`, 1918 px à
   10× ; zéro pixel en excès. Le manque est exactement cette sous-forme, rien d'autre.
3. **Contrôle maquette** : le nœud Figma `logo_header` (`75:3554`, rendu 1:1 dans le cache) **porte
   bien** ce bout : le logo statique est conforme, l'animation non. Le favicon (`src/app/icon.svg`)
   et l'image OG (`src/app/opengraph-image.tsx`) en sont **aussi** dépourvus (même recopie fautive).

## Cause racine (double)

Le bout manquant est la **pointe du brin bas-droit** : le brin remonte du crochet, passe **derrière**
le bras horizontal du bas et dépasse d'environ 3 unités au-dessus. Les deux interruptions de
croisement (~0,95 unité) en font une **île détachée** dans le SVG. D'où deux ratés cumulés :

1. **Le clip** (`FILLS`) a été recopié forme par forme depuis `BrandLogo` ; une **sous-forme
   détachée** en fin de chaîne (après un `Z`, sans `M` visible à l'œil dans un `d` de 759
   caractères) est passée à la trappe. Sans elle, aucun stroke ne pouvait peindre cette zone.
2. **La centerline** `BOT1` s'arrêtait au crochet (angle 553° de l'arc) sans remonter la jambe
   jusqu'à la pointe. Même clip corrigé, le tracé n'aurait pas atteint le bout : les deux
   corrections sont nécessaires.

## Correction

- Ajout de la pointe au clip comme entrée `tail` explicite et commentée (l'union du clip est
  désormais **pixel-identique** au symbole `BrandLogo` : 0 px d'écart à 10×).
- `BOT1` prolongée d'un segment `L 49.99 49.64` : le front remonte la jambe, reste masqué derrière
  le bras (déjà peint) puis émerge dans la pointe. Le tracé finit sur la marque complète.
- `TRACE_DUR` **inchangée** (1,0 s, miroir `tokens.ts` `introTraceDur`) : seule la longueur totale
  bouge (383,0 → 395,9 unités, +3,4 %), absorbée par la même durée.

## Leçons

1. **Recopier une géométrie vectorielle d'un fichier à l'autre ne se relit pas, ça se diffe.** Un `d`
   de plusieurs centaines de caractères cache une sous-forme entière. Quand un composant reproduit un
   asset déjà présent ailleurs dans le repo, la garantie n'est pas « j'ai relu », c'est **l'union
   rendue et diffée au pixel** contre la référence.
2. **Un tracé animé a deux conditions d'exhaustivité, pas une** : la zone doit être *dans le clip*
   **et** *atteinte par une centerline*. Vérifier l'une sans l'autre laisse le bug entier.
3. **Vérifier la dernière frame d'une animation, pas l'état statique du composant.** Méthode
   reproductible et déterministe (`scratchpad/cdp.mjs` de cette branche) : piloter Chrome en CDP,
   installer un hook via `Page.addScriptToEvaluateOnNewDocument`, surveiller les
   `strokeDashoffset` des segments, et **geler la frame** en neutralisant `requestAnimationFrame`
   dès qu'ils atteignent 0 (le ticker GSAP se redemande une frame à chaque tick : un rAF no-op
   l'arrête net). On capture alors la vraie dernière frame, dans les vrais consommateurs. À préférer
   à un screenshot « au bon moment » : les fenêtres utiles font 100–200 ms
   ([[post-mortems/0016-verifying-transient-transitions]]).

## Reste ouvert (hors périmètre de la demande)

- `src/app/icon.svg` et `src/app/opengraph-image.tsx` portent la **même** géométrie tronquée
  (pointe absente). Impact minime à la taille d'un favicon, mais c'est la même divergence de marque.
- Deux encoches concaves d'environ 1,1 × 0,9 unité subsistent aux **extrémités gauches du ruban
  médian** (x ≈ 13,5–14,6 ; y ≈ 20,5–21,4 et 53,6–54,4), soit ~1,5 px de côté à la taille servie.
  **Préexistantes**, sans lien avec la queue : le cap rond de `MID` n'atteint pas le coin du talon.
  Les corriger en déplaçant les extrémités de `MID` déborderait davantage sur la jambe voisine de
  `BOT2`, non encore peinte à cet instant du tracé : arbitrage à faire, pas un correctif gratuit.
