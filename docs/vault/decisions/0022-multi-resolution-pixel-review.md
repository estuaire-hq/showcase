# 0022 — Revue pixel multi-résolution (deux régimes de vérification)

- **Statut** : accepté.
- **Date** : 2026-06-23
- **Origine** : travail ad hoc en worktree `multi-resolution-pixel-review` (via `/dispatch`, pas de
  spec ; brief dans `.dispatch/`, non commité).
- **Contexte** : fait évoluer le skill **`estuaire-pixel-review`** (maison canonique de la revue
  pixel — voir [[0010-figma-local-cache]] pour la source de vérité design, et le skill
  `estuaire-pixel-perfect` pour la construction). Prolonge les leçons de
  [[../post-mortems/0007-percent-padding-and-thumbnail-signoff]] et
  [[../post-mortems/0008-pixel-review-discipline-and-type-tokens]] *(une revue par vignettes pleine
  page masque les écarts → comparer par section)* en ajoutant l'axe **résolution**.

## Contexte

La demande : *« travailler avec toutes les résolutions phares, pas juste les breakpoints ; le site
doit être lisible sur toutes les résolutions phares ; et cette relecture sur TOUTES les pages, sans
exception. »*

Le skill `estuaire-pixel-review` ne vérifiait jusqu'ici **que les largeurs de breakpoint** — celles
où une frame Figma existe (1920 / 768 / 390). Or **le layout ne bascule pas aux largeurs Figma** : il
bascule aux **breakpoints Tailwind par défaut** (sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536), et
le code n'utilise en pratique que `base` / `md:` / `lg:` (aucun `xl:`/`2xl:`). Conséquence : **la
maquette desktop dessinée à 1920 est servie sur toute la plage 1024→1919**. Un portable à
1280/1366/1440/1536 affiche donc une mise en page jamais dessinée à cette largeur ; les éléments à
**largeur fixe en px** (`max-w-[536px]`, `max-w-[812px]`…) qui ne rétrécissent pas y produisent
débordements et proportions cassées — invisibles à une revue breakpoint-only.

**La tension de fond** : à une résolution intermédiaire **il n'existe aucune référence pixel**
(la maquette se *recompose* par breakpoint, elle ne se contente pas de se *redimensionner*). On ne
peut donc pas diffuser un diff partout. La revue doit se scinder en deux régimes.

## Décisions

### D1 — Deux régimes de vérification, selon qu'une frame Figma existe ou non
- **Régime A — pixel-match** (cellule *(page, largeur)* où une frame Figma existe) : méthode
  inchangée — alignement référence ↔ screenshot dev à la **même largeur**, comparaison **section par
  section** (side + overlay + diff via le helper Pillow `compare.py`), checklist géométrie / typo /
  images / couleurs. Boucle correction → recapture → re-diff jusqu'à zéro écart.
- **Régime B — lisibilité / solidité** (résolution intermédiaire, **pas d'oracle pixel**) : le
  critère est la **correction**, pas un diff. Pass = aucun défaut objectif (sonde) + scan visuel sain.

La **carte d'oracle** (quelle cellule relève de A) est dérivée de `index.json` du cache Figma et
figée dans le skill : home / nous-decouvrir / expertises / expertises[…] ont les 3 frames
(1920+768+390) ; univers, univers[…], realisations, realisations[…] n'ont que la frame desktop ;
les pages légales (`mentions-legales`, `confidentialite`) n'ont **aucune** frame → Régime B partout.

### D2 — Matrice des résolutions phares, justifiée par des données réelles (pas de mémoire)
Conformément à la règle « Verify Before Acting », la matrice est dérivée de **StatCounter Global
Stats — France** (desktop + mobile, relevé le 2026-06-23), public d'un site français, **croisée** avec
les largeurs qui *stressent* le layout (frontières de breakpoint + extrêmes de plage de design) :

| Classe | W×H | Régime | Justification |
|---|---|---|---|
| Desktop | **1920×1080** | ancre | #1 desktop FR (~21 %). Frame Figma. |
| Desktop | 1536×864 | phare | #2 FR (~9,5 %). Frontière `2xl`. |
| Laptop | 1440×900 | phare | Largeur MacBook très répandue. |
| Laptop | 1366×768 | phare | #3 FR (~5,4 %). Laptop d'entrée de gamme. |
| Laptop | 1280×800 | phare | Frontière `xl` — **compression max** du design 1920. |
| iPad-L | 1024×768 | phare (spot) | Frontière `lg/md` + iPad paysage. |
| Tablette | 820×1180 | phare | iPad Air portrait. |
| Tablette | **768×1024** | ancre | Frame Figma. |
| Mobile | 414×896 | phare | #1 mobile FR (~14 %). |
| Mobile | **390×844** | ancre | Frame Figma. #2 mobile FR (~10 %). |
| Mobile | 360×800 | phare | #3 mobile FR (~7 %). **Test de débordement.** |

Largeurs en **px CSS** (1536 = un écran 1920 à 125 % de mise à l'échelle OS). **Hauteurs réelles** des
appareils (un hero `100svh` reflète l'appareil réel). Exclus : desktop 800×600 (~5 %, bots/crawlers) ;
393 mobile ≈ 390 (replié sur l'ancre). **À reconfirmer** à chaque re-exécution (les parts évoluent).

### D3 — Vérifier la lisibilité sans oracle : une sonde objective + un scan visuel
Régime B se prouve par une **sonde JS** (`references/probe.js`) injectée via le MCP Playwright, qui
renvoie par largeur un rapport de défauts **objectifs et déterministes** :
- `h-overflow` — contenu débordant le bord droit du viewport → **bug** (sauf scroll volontaire).
  ⚠️ Le socle pose `overflow-x: clip` sur `<html>`, donc `scrollWidth` ne voit pas l'overflow clippé :
  la sonde mesure les **bords réels** (`getBoundingClientRect().right`) en ignorant les crops contenus
  par un ancêtre `overflow` (images plein cadre, carousels). Oracle complémentaire : une **capture
  full-page plus large que le viewport**. Voir [[../post-mortems/0017-multi-resolution-review-blind-spots]] ;
- `img-distortion` — `<img>` au ratio rendu ≠ ratio naturel avec `object-fit` ∉ {cover, contain} ;
- `tiny-text` — texte visible sous le plancher de lisibilité (11px) ;
- `text-clip` — feuille dont le **texte propre** est coupé par `overflow:hidden` (les crops
  d'**images** — full-bleed, hover-zoom — sont **volontaires** ici et ne sont pas signalés).

Le subjectif (équilibre des espacements, bloc à largeur fixe « perdu » dans un conteneur trop large,
veuves/orphelines, proportion du hero) reste un **scan visuel** du screenshot. La sonde fournit le
signal objectif à toutes les largeurs ; le scan se concentre sur le desktop le plus comprimé (1280),
le mobile le plus étroit (360) et toute cellule signalée.

### D4 — Gaps voulus : recensés, jamais « corrigés »
Certaines divergences avec la frame sont **intentionnelles** et ne doivent pas être ramenées au node :
hero en pleine hauteur (`min-h-[100svh]`, dimension **dynamique**), panneaux rétrécis pour la
lisibilité de la navbar, etc. Elles sont marquées **déviation voulue** (⚪️) dans le tracker, jamais
traitées comme des bugs. (Rappel `estuaire-pixel-perfect` §3 : intrinsèque exact, **dynamique flexible**.)

### D5 — Couverture page × résolution traçable, aucun skip silencieux
Chaque cellule *(page, largeur)* reçoit un statut : `✅ pass` / `🔧 corrigé` / `⚠️ UNVERIFIED + raison`
/ `⚪️ déviation voulue`. La matrice remplie est livrée avec la feature (corps de PR). Un plafond
silencieux se lit comme « tout va bien » — donc tout est explicite. Périmètre : **toutes** les pages
`(site)` ; hors périmètre : `(lab)`, `/studio`, et `/coming-soon` (gate temporaire, sans frame).

### D6 — Outillage : MCP Playwright, pas de nouvelle dépendance
La capture (resize → sonde → screenshot full-page) passe par le **MCP Playwright déjà connecté**
(chemin browser-automation du projet), pas par un Playwright ajouté en dépendance (lourd, contraire à
la règle « deps délibérées » pour un harnais de revue). Les ~120 cellules de capture sont **déléguées
à un sous-agent / fork** pour garder les échos d'outils hors du contexte principal ; les fichiers
vont dans `.playwright-mcp/pp/` (gitignoré).

## Conséquences

- **Positif** : le site est vérifié là où les utilisateurs réels le voient, pas seulement aux
  largeurs de design ; les régressions de débordement/lisibilité sont détectées **objectivement** et
  **reproductiblement** (sonde) ; la couverture est auditable.
- **Coût** : ~120 captures + analyse par feature complète ; atténué par l'automatisation (sonde) et
  la délégation de capture. Pour une feature mono-page, n'exécuter que les colonnes pertinentes.
- **À maintenir** : la matrice est datée et sourcée — la reconfirmer périodiquement ; si le code
  introduit des variantes `xl:`/`2xl:`, la carte d'oracle reste valable (les frames Figma ne changent
  pas), mais les largeurs phares à scruter peuvent évoluer.
