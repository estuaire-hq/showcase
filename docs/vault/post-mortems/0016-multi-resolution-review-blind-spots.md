# 0016 — Angles morts de la revue multi-résolution (overflow clippé, sections pinned, fork mécanique)

- **Date** : 2026-06-23
- **Contexte** : passe de revue pixel multi-résolution sur tout le site + upgrade du skill
  `estuaire-pixel-review` ([[../decisions/0022-multi-resolution-pixel-review]]).
- **Voisins** : [[0007-percent-padding-and-thumbnail-signoff]] et
  [[0008-pixel-review-discipline-and-type-tokens]] (la revue par vignettes masque les écarts → par
  section) ; [[0011-portless-route-404-and-worktree-gate]] (gate OFF en worktree).

## Symptômes

1. **Une sonde « tout vert » qui rate un vrai débordement.** La sonde de lisibilité, basée sur
   `document.scrollWidth > innerWidth`, renvoyait `ok:true` partout — alors qu'à **univers @1024** le
   titre « Atelier multimatériaux » de la grille « Infos clés » débordait réellement de ~174px (capture
   full-page large de 1198px pour un viewport de 1024).
2. **Une grande bande blanche au milieu de la home**, prise pour « réalisations manquantes » par
   l'analyse — puis des **débordements fantômes** (`article h-svh` à droite du viewport) une fois la
   détection par bords ajoutée.
3. **Un sous-agent *fork* de capture qui ne capture rien** : 190k tokens dépensés à se mettre en
   attente d'un moniteur de fond au lieu d'exécuter la boucle.

## Causes racines

1. **`overflow-x: clip` sur `<html>` masque le débordement de `scrollWidth`.** Le socle pose
   `overflow-x: clip` (gate anti-scroll horizontal global). Un enfant qui déborde le viewport est alors
   **clippé sans barre de défilement** : `scrollWidth` reste = `innerWidth`, donc une sonde qui s'y fie
   ne voit rien — alors que le contenu (un titre) part **hors écran et est coupé**. Le signal fiable est
   le **bord droit réel** des éléments (`getBoundingClientRect().right`), et, vu de l'extérieur, une
   **capture full-page plus large que le viewport**.
2. **Les sections *pinned* (GSAP `pin:true`) ne sont pas analysables en statique.** `PinnedCaseStudies`
   (home) épingle un conteneur `100svh` et empile des panneaux **absolus/transformés** ; pendant le pin
   ils sont pré-décalés hors-canvas à droite pour glisser en scroll. Un screenshot full-page statique
   montre donc (a) une **bande blanche** (le spacer du pin) et (b) des **bords à droite du viewport**
   (les panneaux en attente) — deux artefacts, pas des bugs.
3. **Un *fork* hérite de tout le contexte de l'agent parent** — y compris le cadre « tâches de fond /
   moniteur » — et, sur une tâche **purement mécanique et longue**, sur-réfléchit : il a décidé d'attendre
   plutôt que d'exécuter.

## Corrections

1. **Sonde par bords réels + filtre d'ancêtre clippant.** On prend `max(getBoundingClientRect().right)`
   sur les éléments qui **chevauchent** le bord droit (`left < W < right`) et qui ne sont **pas contenus**
   par un ancêtre `overflow` hidden/clip/auto/scroll (un crop volontaire — image `scale-1xx` plein cadre,
   carousel — est légitime). Sinon faux positifs sur tous les crops. Le bord droit indépendant de
   `scrollWidth` attrape l'overflow clippé. (`probe.js` + `capture.js`.)
2. **Capturer/sonder les pages pinned sous `prefers-reduced-motion: reduce`.** Les panneaux retombent en
   **flux normal** (FR-016) : c'est la lecture **autoritaire** de leur contenu et de leur solidité, ET
   ça valide l'UX reduced-motion d'un coup. La home n'est jugée qu'ainsi ; la bande blanche / l'overflow
   fantôme hors reduced-motion sont étiquetés **artefacts**.
3. **Pour une capture mécanique longue, ne pas utiliser un *fork*.** Piloter le navigateur via
   `browser_run_code_unsafe` (une snippet Playwright qui boucle les largeurs d'une page : resize →
   settle → sonde → screenshot, ~5 appels pour tout le site), ou un agent *general-purpose* frais avec
   une liste d'étapes explicite — pas un fork qui hérite du contexte de méta-orchestration.

## Leçon

La sonde objective est nécessaire mais **pas suffisante**, et elle a des **angles morts dépendants du
socle** (ici `overflow-x: clip` + GSAP pin). Toujours **croiser** : sonde par bords réels + largeur de
la capture full-page + scan visuel ; et **isoler le mouvement** (reduced-motion) pour tout ce qui est
épinglé/scrubé. Encodé dans `estuaire-pixel-review` (skill + `probe.js`).
