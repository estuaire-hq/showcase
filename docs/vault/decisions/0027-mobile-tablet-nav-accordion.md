# 0027 : nav mobile / tablette, accordéon aligné à gauche

- **Statut** : accepté.
- **Date** : 2026-07-25
- **Origine** : travail ad hoc en worktree `mobile-nav-ux` (via `/dispatch`, pas de spec ; brief dans
  `.dispatch/`, non commité).
- **Périmètre** : le panneau plein écran `lg:hidden` (< 1024 px). Le desktop (`NavDropdown` + header
  sticky) n'est pas touché.
- **Contexte** : conséquence directe de l'ajout des sous-menus expertises / univers demandé en revue
  client 2026-06 (B2/B3). Voir [[0021-motion-art-direction]] pour la grammaire de motion réutilisée
  et [[0022-multi-resolution-pixel-review]] pour la gate de vérification appliquée.

## Contexte

La demande : *« depuis qu'il y a des sous-menus, le menu est devenu peu compréhensible en mobile et
tablette, c'est une longue liste et les entrées sont assez resserrées. Regarde ce qui se fait pour ce
cas-là, il faut quelque chose avec une bonne UX. »*

Les sous-pages avaient été ajoutées de la façon la plus économique possible : dans `NavPanel`, les
enfants étaient rendus dans un `<ul>` **frère** du bouton parent, centré comme lui et dans **la même
`text-caption` 16 px**, la seule variation étant `text-paper/70`. Mesures relevées sur la home avant
correction :

| | hauteur de cible | pitch | taille |
|---|---|---|---|
| parents (ghost pill) | 40 px | 60 px | 16 px |
| enfants | **19 px** | 30 px | **16 px** |

Quatre défauts, tous mesurés et non déduits :

1. **Aucun indice de hiérarchie.** Tout étant centré, l'indentation était structurellement
   impossible ; pas de chevron ; pas d'écart de taille. Le seul signal, une opacité 0.7 sur fond
   `bg-ink/90`, est quasi invisible. L'utilisateur lisait **12 entrées à plat**.
2. **Cibles tactiles.** WCAG 2.5.8 (AA, 24 px) passait de justesse via l'exception d'espacement
   (pitch 30 px > cercle de 24 px), mais 2.5.5 (AAA, 44 px), Apple HIG (44 pt) et Material (48 dp)
   échouaient tous, parents à 40 px inclus.
3. **Tablette.** Colonne étroite centrée, ~85 % de la largeur perdue, et la page transparaissant à
   travers l'overlay pile au milieu des libellés.
4. **Paysage téléphone (844×390).** Zone scrollable de 310 px pour 632 px de contenu : **322 px sous
   le pli**, dont « réalisations », le CTA contact et le logo, sans aucune affordance de scroll.

**La maquette ne fournit aucun oracle.** Les frames `nav/open` existent (tablet 77:3630, mobile
87:5893) mais ne contiennent que les 4 entrées + contact, **sans second niveau**, et la frame
tablette est un copier-coller exact de la mobile (même bloc 157×280 centré). Elles sont donc caduques
sur ce point : la proposition est une **création à justifier**, pas un pixel-perfect.

## Benchmark (sources vérifiées en ligne, pas de mémoire)

- **NN/g, *Mobile Subnavigation*** : algorithme explicite par nombre de sous-catégories :
  **< 6 → accordéon dans le menu** · 6-15 → section menu · > 15 → landing page. Le drill-down
  (« sequential menus ») est *« generally not recommended »* : désorientation (28 % chez les
  utilisateurs à faible capacité spatiale), conflit avec le bouton retour Android qui ferme le menu
  au lieu de remonter, effet « poupées russes ». Estuaire a **3 et 4 enfants**.
- **NN/g, *Menu-Design Checklist*** : #12 signaler un sous-menu par un caret/chevron ; #13 activation
  au clic ; *« clearly distinguish between main navigation items that lead directly to a new page and
  ones that expand into a submenu »* ; #11 cibles assez grandes ; alerte sur les items trop
  rapprochés.
- **ARIA APG, *Disclosure Navigation Menu*** : `<button>` réel + `aria-expanded` + `aria-controls`,
  enfants dans une `<ul>` **imbriquée** (*« the semantics of the list structure communicates the
  hierarchy to assistive technology users »*), `aria-current="page"`, Échap ferme, **pas de
  `role="menu"`** (*« does not provide the complex functionality that assistive technologies
  expect »*).
- **GOV.UK / Get Into Teaching** : ont comparé deux patterns mobiles à sous-catégories et retenu
  l'accordéon, pour « explorer par sections sans s'engager sur une page ». *Réserve : c'est une design
  history, la nav n'était pas construite à la rédaction → intention documentée, pas résultat mesuré.*

## Options considérées

| | A : accordéon aligné à gauche | B : accordéon centré | C : drill-down |
|---|---|---|---|
| Lisibilité de la structure | forte (indentation + chevron + taille) | moyenne (taille + conteneur, pas d'indentation) | vue d'ensemble perdue |
| Interactions vers un enfant | 2 | 2 | 3 (+ retour à construire) |
| Accessibilité | APG au mot | idem A | la plus risquée (focus inter-panneaux, retour Android) |
| Tenue en tablette | bonne | moyenne | bonne |
| Coût | moyen | faible | élevé (machine à états + 2 transitions) |
| Fidélité maquette | rompt le centrage | la préserve | rompt tout |

## Décisions

### D1. Accordéon aligné à gauche, une section ouverte à la fois (option A)

Retenue parce que 3 et 4 enfants tombent exactement là où NN/g recommande l'accordéon et déconseille
le drill-down ; parce que A est la seule des trois qui autorise une **indentation** (l'indice de
hiérarchie le plus robuste, et un meilleur scan vertical que des lignes centrées de longueurs
inégales) ; et parce que le repli par défaut résout mécaniquement le débordement en paysage.

**L'alignement à gauche est le cœur de la décision, pas un détail de goût** : le centrage de la
maquette est précisément ce qui interdit l'indentation. Écart assumé vs `nav/open`, d'autant que ces
frames ignorent les sous-menus.

**Une seule section ouverte à la fois** : borne la hauteur du panneau (4 lignes + max 4 enfants au
lieu de 12 lignes), comportement usuel d'une nav mobile.

### D2. Ligne parente scindée : le libellé navigue, le chevron déplie

Deux cibles distinctes côte à côte (libellé `flex-1`, chevron 56 px, séparées par un filet vertical).
C'est ce qui satisfait *« une page parente reste atteignable »* sans transformer un vrai lien en
en-tête muet, et c'est le pattern APG. Le chevron porte son propre `aria-label` nommant la section
(« Afficher / Masquer les pages de expertises »), car plusieurs lignes portent le même contrôle.

### D3. Chevron vers le bas, pas la flèche du kit

Le kit spécifie un disclosure par `arrow-right-1` **tournant à 90° au clic**. Écarté ici : dans une
ligne scindée, une flèche pointant à droite à côté d'un libellé qui **est déjà un lien** lit
« aller à cette page » et entre en concurrence avec le lien réel. Un chevron vers le bas (180° à
l'ouverture) est le signal non ambigu de « déplier ». Nouveau glyphe `ChevronIcon`, même facture que
`CloseIcon`.

### D4. Ce qui est abandonné du kit dans le panneau (et ce qui reste)

- **Abandonné** : les ghost pills sur les parents (sur une ligne pleine largeur, une pill devient une
  barre) ; l'état actif se marque désormais par le poids 600 + un filet vertical à gauche.
- **Grossi** : les parents passent de `text-caption` 16 px à `text-lead-sm` 20 px, pour un vrai
  contraste typographique avec les enfants restés à 16 px.
- **Conservé** : le CTA contact reste une pill `bleu` centrée, seul élément à garder ce traitement ;
  le fond `bg-ink/90`, la croix de fermeture et le logo centré restent ceux de la maquette.

### D5. Colonne bornée à 420 px, centrée, plutôt que deux colonnes en tablette

Deux colonnes exploiteraient mieux la largeur mais casseraient l'ordre de lecture unique d'une nav et
introduiraient un layout que rien d'autre sur le site n'utilise. La largeur de liste progresse
320 px (360) → 350 px (390) → 380 px (≥ 768).

### D6. Le fond reste à 90 % d'opacité

Arbitrage explicite de Pierre. Conséquence connue et acceptée : la page continue de transparaître
derrière les libellés, donc le contraste du fond varie d'une ligne à l'autre selon ce qui se trouve
dessous. Les libellés eux-mêmes restent largement au-dessus du seuil (blanc sur ink à 90 %), mais le
bruit visuel subsiste. **À rouvrir si la lisibilité est jugée insuffisante en usage réel.**

### D7. Le focus se marque en `paper` dans le panneau, pas en `estuaire`

Le pattern site-wide est `focus-visible:ring-estuaire`. Sur le fond ink du panneau, `estuaire`
(#003787) ne dépasse pas **~1,7:1**, sous les 3:1 que WCAG 1.4.11 demande d'un indicateur de focus.
Le panneau utilise donc `ring-paper` (~19:1). Correction locale : le reste du site est hors périmètre.

### D8. La sous-page courante est enfin signalée (`activeChildHref`)

`resolveActiveHref` ne pouvait retourner que le href du **parent** (`/expertises` pour
`/expertises/agencement-sur-mesure`), si bien que le test `activeHref === child.href` n'était
**jamais vrai** : une sous-page était atteignable mais jamais marquée comme courante. `resolveActive`
retourne maintenant `{ href, childHref }`. `href` est inchangé (le desktop se comporte exactement
comme avant) ; `childHref` n'est passé qu'au `NavPanel`, qui s'en sert pour `aria-current` **et** pour
ouvrir d'office la bonne section.

**Le dropdown desktop garde le défaut** : lui passer `activeChildHref` sortirait du périmètre
« le desktop ne change pas ». À traiter séparément.

### D9. L'animation de hauteur est en GSAP, `display:none` au repos

`display:none` sur la liste repliée est **load-bearing pour l'accessibilité**, pas cosmétique :
`useFocusTrap` exclut les cibles du cycle Tab en filtrant sur `offsetWidth/offsetHeight`, et un enfant
simplement en `height:0 overflow:hidden` continue de rapporter sa propre boîte : les 7 sous-liens
repliés resteraient tabulables. GSAP possède `height` et `display` (jamais le `style` React), le
chevron tourne en CSS pur : les deux canaux ne se superposent jamais (post-mortem 0015).

**Piège Tailwind v4 rencontré** : `--duration-nav-disclosure` est déclaré dans `@theme`, mais **v4
n'a pas de namespace `--duration-*`** (seul `--ease-*` existe pour les transitions). La classe
`duration-nav-disclosure` ne résolvait rien et retombait silencieusement sur les 150 ms par défaut
(mesuré, pas supposé). La syntaxe correcte est `duration-(--duration-nav-disclosure)`. Les
`--duration-reveal` / `--duration-curtain` existants ne sont jamais consommés comme utilitaires, ce
qui explique que le piège n'était pas encore apparu.

## Conséquences

**Vérifié par mesure** (7 largeurs de panneau × 3 états, plus 6 largeurs desktop) :

- cible tactile minimale **44 px** partout (contre 19 px) ;
- **zéro débordement vertical** sur toutes les résolutions portrait, contre 322 px auparavant ;
- zéro débordement horizontal, zéro libellé rogné (y compris le blind-spot « flex centré » du
  post-mortem 0017, ici hors sujet puisque tout est aligné à gauche) ;
- clavier : les 7 sous-liens repliés sont **hors du cycle Tab** ; Entrée déplie sans déplacer le
  focus ; l'ordre de tabulation suit la hiérarchie visuelle ; Échap ferme et rend le focus au toggle ;
- `prefers-reduced-motion` : état atteint instantanément, contenu intégralement présent ;
- desktop 1024 → 1920 : panneau et toggle en `display:none`, nav desktop intacte, dropdowns
  fonctionnels.

**Limite subsistante, assumée** : en **paysage téléphone** (844×390) le panneau déborde encore de
~333 px section ouverte. La zone utile n'y fait que 310 px : aucune mise en page ne peut y loger
4 entrées à 56 px, leurs enfants, le CTA et le logo. Les 4 entrées principales et le CTA sont
désormais visibles sans scroller (ce n'était pas le cas avant) ; seul le logo décoratif exige un
scroll.

**L'arborescence n'a pas été touchée** (`src/content/navigation.ts` inchangé) : le travail porte sur
la présentation et l'interaction, conformément au périmètre.

## Fichiers

- `src/design-system/components/NavPanelItem.tsx` *(nouveau)* : la ligne scindée + le disclosure.
- `src/design-system/components/ChevronIcon.tsx` *(nouveau)* : le glyphe de disclosure.
- `src/design-system/components/NavPanel.tsx` : liste refondue, état d'ouverture, colonne bornée.
- `src/components/Navbar.tsx` : `resolveActive` retourne `{ href, childHref }`.
- `src/design-system/tokens.ts` + `src/app/globals.css` : `navDisclosureDuration` / `--duration-nav-disclosure`.
