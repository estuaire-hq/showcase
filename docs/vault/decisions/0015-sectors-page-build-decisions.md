# 0015 — Décisions de build : page « Univers » (secteurs)

- **Statut** : accepté
- **Date** : 2026-06-17
- **Feature** : `009-sectors-page` (`/univers`, node Figma `51:3386` desktop)
- **Liens** : [[0003-design-system]], [[0004-content-images-in-sanity]],
  [[0005-connected-components-for-global-sanity-content]],
  [[0006-schema-derived-types-and-typed-seeds]], [[0012-about-page-build-decisions]]

Décisions prises pendant l'implémentation de la page « Univers », au-delà de ce que le
`plan.md` figeait.

## 1. La bande secteur étend `FeatureBlock` (pas un nouveau `SectorBand`)

Le `plan.md` / `data-model.md` prévoyaient un **nouveau composant DS `SectorBand`**. À la
lecture du DS au build, `FeatureBlock` s'est révélé être **exactement** la bande secteur :
`aspect-[1920/718]` (dimensions maquette exactes), image plein-cadre + voile `bg-ink/25`
(opacité maquette 0.253), CTA `Button tone="light"` 398px (« en savoir plus »). Il manquait
seulement, entre le titre et le bouton, un **trait de séparation** + une **phrase de
promesse**.

**Décision** : *réutiliser avant créer* (Principe IV/X) — **étendre `FeatureBlock`** avec des
props **optionnelles** (`body`, `rule`, `blurDataURL`, `ctaUmamiEvent`/`ctaUmamiData`, titre
responsive `text-title-sm lg:text-title`, `image` rendu optionnel) plutôt que dupliquer une
bande quasi identique. Rétro-compatible : seul le lab (`(lab)/lab/kit`) le consommait, et il
ne passe aucune des nouvelles props. La promesse est dimensionnée `text-body` (≈25px
maquette), pas `text-lead`.

## 2. `PageHero` reçoit une variante `split`

Le hero secteurs (`02/ SLIDER`) n'est pas le hero *overlay* de « Nous découvrir » (image
plein-cadre + cartouche superposé) mais un **split** : panneau noir `bg-ink` à gauche avec le
cartouche (eyebrow + trait + titre contour/plein), image à droite. Le cartouche (eyebrow,
rule, H1 OutlineText/BrandText) étant identique, `PageHero` gagne une prop
`variant: "overlay" | "split"` (défaut `overlay`, donc « Nous découvrir » inchangé). En
`split`, sous `lg` le cartouche passe **au-dessus** de l'image (la navbar transparente
surplombe alors le cartouche sombre → `data-nav-logo-tone`/`toggle-tone = onDark`,
`links = onLight` sur le blanc de droite en desktop). Hauteur calée sur `lg:min-h-[49vw]`
(maquette 943/1920).

## 3. Secteurs & infos clés = listes embarquées dans le singleton

Conformément à `research.md §2` : `sectorsPage.sectors` (`array<sector>`) et
`sectorsPage.keyFigures` (`array<keyFigure>`) sont **embarqués**, pas des documents
autonomes. Listes présentationnelles ordonnées (précédent `aboutPage.processSteps`) ; les
pages de détail secteur (features distinctes) définiront leur propre modèle. `href` →
`/univers/<slug>` (404 temporaire accepté).

## 4. Cinématiques : le texte est l'ancre, les visuels portent le mouvement

- **Hero** : statique (lisibilité du premier écran, SC-007).
- **Intro** : clip-reveal du visuel à l'entrée (`data-reveal-clip` via `Parallax`).
- **Secteurs** : clip-reveal de chaque bande à l'entrée (séquencé, pas simultané).
- **Infos clés** : **statique** — aucun visuel à animer ; FR-011 place explicitement le
  mouvement sur les visuels, le texte reste l'ancre. Choix assumé (pas un oubli).
- `prefers-reduced-motion` honoré par `Parallax` (retour anticipé → contenu rendu au repos ;
  le SSR contient déjà tout le contenu).

## 5. Fidélité (desktop) & écarts assumés

Desktop diffé section par section contre le render `51-3386.png` (skill
`estuaire-pixel-review`) : hero (941≈943), intro, 4 bandes, infos clés (1246≈1244) alignés.
Écarts mineurs assumés : centrage vertical du cartouche hero (~4 % vs ancrage-haut Figma) ;
**images Bureau/Résidentiel** = exports maquette basse résolution (placeholders de seed, le
client les remplace via le CMS). Tablette/mobile : pas de frame de référence → vérifiés en
cohérence + lisibilité (SC-003), pas diffés.

## 6. Choix des visuels de seed (calques empilés)

Les bandes Retail et Scénographie ont **deux calques image** dans Figma ; le **premier listé
est le calque visible** (au-dessus). Donc : Retail ← `51-3454` (intérieur chaleureux, pas le
`51-3455` en dessous), Scénographie ← `51-3494` (structure bois, pas `51-3495`). Vérifié en
ouvrant les assets et en les comparant au render (cf. [[post-mortems/0009-reseed-not-reflected-cdn-and-next-fetch-cache]]
pour le piège de propagation au re-seed).
