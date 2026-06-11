# Research — Navbar responsive (Phase 0)

Décisions techniques résolvant les inconnues laissées par la spec (champ *Hypothèses* :
« mécanisme de contraste & seuil de scroll … décidé à l'étape de planification »). Format par
décision : **Décision / Justification / Alternatives écartées**.

Contexte vérifié dans le code existant :

- Stack motion déjà câblée : `@/lib/motion/gsap` (GSAP + `ScrollTrigger` + `SplitText` + `useGSAP`
  enregistrés une fois), `@/lib/motion/SmoothScroll` (Lenis piloté par `gsap.ticker`,
  `prefers-reduced-motion`-aware → repli scroll natif). `lenis.on("scroll", ScrollTrigger.update)`.
- DS : `NavButton` (pill liens, `tone: onLight|onDark`, `active` → `aria-current="page"`) et
  `ContactButton` (pill CTA, `tone: bleu|noir`, `size: sm|lg`, `active`) existent et correspondent au
  KIT. Tous deux rendent `<Link>` si `href`, sinon `<button onClick>`.
- `(site)/layout.tsx` : `SmoothScroll` → `FooterReveal` → `children`. Commentaire : « The header …
  will join this shell later ». Tokens `breakpoint = { mobile:390, tablet:768, desktop:1024 }`.
- 6 frames navbar en cache dans `.design/figma-data/nodes.json` : `51:2221` (desktop), `51:2585`
  (sticky), `77:3149` (tablette), `77:3630` (tablette ouverte), `77:3150` (smartphone), `87:5893`
  (smartphone ouvert). Le node **état-actif `51:2699`** n'est PAS en cache → à pull au build.

---

## 1. Mécanisme de contraste adaptatif (transparent au repos)

**Décision** — **Tonalité déclarée par la zone d'en-tête, lue par la navbar ; par élément
(slot), pas par barre entière.** Le contraste adaptatif n'opère **qu'à l'état transparent au repos
(sommet de page)** : dès que la barre passe en sticky/plein (scroll vers le haut), le fond est opaque
clair et le contenu est sombre — fixe (FR-006). La maquette du hero montre une frontière
clair/sombre **horizontale** (bloc sombre à gauche → logo blanc ; zone claire à droite → menu
sombre), donc le contraste est **par slot** :

- Le DS expose, pour l'état transparent, une tonalité **par slot** : `logoTone` et `linksTone`
  (`onLight | onDark`). `NavButton`/`ContactButton` ont déjà l'axe `tone`.
- La **page / section d'en-tête déclare sa tonalité** de façon déclarative via deux attributs
  **par slot** `data-nav-logo-tone` / `data-nav-links-tone` (contrat `contracts/section-tone.md`).
  Pour la home, le hero déclare
  `logo=onDark`, `links=onLight` — ce qui reproduit exactement la maquette (valeurs intrinsèques à
  **lire losslessly** sur les nodes au build, non devinées).
- Le wrapper `Navbar` lit la tonalité de la **zone d'en-tête courante** (au sommet) et la passe en
  props au `SiteHeader`. Mécanique : la première section/`<header>` porte les attributs ; tant
  qu'on est au sommet, la navbar utilise ces tonalités. Une page sans déclaration tombe sur un
  défaut sûr (`onLight` — contenu sombre).

**Justification** — déterministe (exigé par le cas limite « contraste adaptatif »), pixel-exact
(les tonalités viennent de Figma, pas d'une heuristique), et **simple** (Principe IV) : la seule
surface transparente connue aujourd'hui est le hero home ; on n'a pas besoin d'un moteur de
détection runtime. La forme « par slot » couvre la frontière horizontale de la maquette sans
sur-ingénierie. C'est aussi extensible : une future page déclare ses propres tonalités d'en-tête.

**Alternatives écartées** :

- **Détection runtime du fond (sampling de pixels / `mix-blend-mode: difference`)** — fragile sur
  image/dégradé, coûteux, non déterministe ; viole Principe IV pour un seul hero connu. `difference`
  donnerait un rendu non conforme à la maquette (couleurs inversées, pas blanc/noir nets).
- **`IntersectionObserver` multi-sections déterminant une tonalité unique de barre** — perd la
  nuance **par slot** que montre la maquette (logo et menu de tonalités différentes au même
  instant). Conservé en réserve si, plus tard, des pages ont des en-têtes mono-tonalité longs.
- **Tonalité figée en dur dans la navbar** — casse la portée site-wide (FR-005 : « quelle que soit
  la page ») dès qu'une 2ᵉ page a un en-tête de tonalité différente.

---

## 2. Comportement sticky « masquer en descente / révéler en remontée »

**Décision** — **`ScrollTrigger` (déjà synchronisé à Lenis) pilote une machine à 3 états** lue par
le wrapper, qui applique des classes Tailwind (transform/opacity) :

- `top` : `scrollY <= TOP_THRESHOLD` → barre **transparente au repos** (contraste adaptatif §1),
  pleinement visible, non escamotée.
- `hidden` : scroll **vers le bas** hors sommet → barre **escamotée** (`-translate-y-full`).
- `pinned` : scroll **vers le haut** hors sommet → barre **plein/opaque** (fond clair, ombre,
  contenu sombre), `translate-y-0`, `position: fixed`.

Direction via `ScrollTrigger.create({ onUpdate: self => self.direction })` (1 = bas, -1 = haut) +
lecture de `self.scroll()`. **Seuils** : `TOP_THRESHOLD ≈ 8px` (zone « sommet ») et un
**delta minimal ≈ 6–10px** avant de basculer hidden↔pinned (anti-vacillement, cas limite « seuil de
scroll »). Transition `transform`/`opacity` only, ease `power2.out`, ~0.3–0.4s.

`prefers-reduced-motion` : la machine d'états reste active (la barre se montre/cache **fonctionne**),
mais **sans transition** (changement instantané — FR-012, SC-005). Sous reduced-motion,
`SmoothScroll` retombe déjà sur le scroll natif ; on lit alors `window.scrollY` via un listener
`scroll` passif au lieu de `ScrollTrigger` (qui dépend du ticker GSAP), pour rester robuste.

**Justification** — `ScrollTrigger` est **déjà installé, enregistré et synchronisé à Lenis** : zéro
nouvelle dépendance, intégration native au smooth-scroll (Principe IV). `onUpdate.direction` donne la
direction sans tracking manuel de `lastScroll`. Les seuils répondent directement aux cas limites de
la spec.

**Alternatives écartées** :

- **Listener `scroll` brut + rAF + suivi manuel de la direction** — réimplémente ce que
  `ScrollTrigger` fournit déjà ; risque de désync avec Lenis. (Conservé uniquement comme **repli
  reduced-motion**, où Lenis/ticker est inactif.)
- **`position: sticky` CSS pur** — ne couvre pas « masquer en descente / révéler en remontée » (la
  direction n'est pas exprimable en CSS) ni la bascule transparent↔plein. Insuffisant.
- **IntersectionObserver sentinelle** — détecte « pas au sommet » mais pas la **direction** ; ne
  suffit pas seul.

---

## 3. Verrou de défilement à l'ouverture du panneau (avec Lenis)

**Décision** — hook `useScrollLock` : à l'ouverture, **`lenis.stop()`** + `documentElement`/`body`
`overflow: hidden` en filet de sécurité ; à la fermeture, **`lenis.start()`** + restauration. Sous
`prefers-reduced-motion` (pas de Lenis), seul `overflow: hidden` (+ compensation de la largeur de
scrollbar masquée — ici nulle, la scrollbar est déjà cachée site-wide) s'applique. **Accès à
l'instance Lenis** : `SmoothScroll` expose le `lenis` courant via un **contexte React léger**
(`LenisContext`) — petit ajout non cassant ; le hook consomme le contexte (et no-op proprement si
absent). **Au resize** (cas limite) : si on franchit le breakpoint desktop alors que le panneau est
ouvert, on **ferme le panneau et on libère le verrou** (effet sur `matchMedia('(min-width:1024px)')`).

**Justification** — Lenis « hijacke » le scroll : un simple `overflow:hidden` ne suffit pas à
l'arrêter, il faut `lenis.stop()`. Exposer l'instance par contexte est l'idiome React et évite un
singleton global (Principe IV). La fermeture au resize traite explicitement le cas limite « verrou
résiduel / panneau fantôme ».

**Alternatives écartées** :

- **`overflow:hidden` seul** — insuffisant tant que Lenis tourne (le wheel reste capté).
- **Dépendance `body-scroll-lock` / `react-remove-scroll`** — résout iOS edge-cases mais ajoute une
  dépendance pour un besoin déjà couvert par l'API Lenis native + la scrollbar déjà masquée
  (Principe IV). Réévaluable si un bug tactile iOS apparaît à la vérification.
- **Singleton Lenis global importable** — couplage caché ; le contexte est plus testable et
  cohérent avec l'isolation du DS.

---

## 4. Piège de focus + sémantique dialog du panneau

**Décision** — **hand-rolled**, hook `useFocusTrap` + sémantique dialog sur `NavPanel` :
`role="dialog"` `aria-modal="true"` `aria-label`, focus initial sur la croix (ou le 1er lien),
**boucle Tab/Shift-Tab** sur les éléments focusables du panneau, **Échap** ferme, **restauration du
focus** sur le déclencheur (le bouton menu) à la fermeture, arrière-plan rendu non focusable
(`inert` sur le contenu hors panneau quand ouvert, avec repli `aria-hidden` si `inert` indisponible).

**Justification** — un seul « modal » dans toute l'app aujourd'hui ; le pattern est borné et connu.
Le hand-rolling respecte Principe IV et la politique de dépendances (« si le besoin est trivial …
on l'écrit nous-mêmes, petit et possédé »), et garde un contrôle total du markup/des classes DS.
`inert` est largement supporté (Baseline 2023) ; repli `aria-hidden` pour les anciens moteurs.

**Alternatives écartées** :

- **`focus-trap-react`** (mûr, très adopté) — alternative bas-risque si le hand-roll s'avère
  fragile à la vérification a11y (SC-006). On documente ce repli ; on ne l'ajoute pas par défaut.
- **`@radix-ui/react-dialog`** — apporte trap + Échap + scroll-lock + ARIA complets, mais : nouvelle
  dépendance, surface plus large que nécessaire, et il faudrait neutraliser son propre scroll-lock
  pour cohabiter avec Lenis. Sur-dimensionné pour un panneau de nav unique (Principe IV).

> Note dépendances (politique CLAUDE.md) : la décision par défaut est **0 nouvelle dépendance**. Si
> la vérification a11y révèle un défaut du trap maison, **promouvoir `focus-trap-react`** (santé :
> mainteneurs actifs, fort usage npm, typé) plutôt que de bricoler — à acter dans le PR.

---

## 5. État « page active »

**Décision** — le wrapper client lit **`usePathname()`** (`next/navigation`) et marque l'entrée
correspondante `active` (les pills exposent déjà `active` → `aria-current="page"`). Correspondance :
égalité exacte du pathname, plus préfixe pour les sous-routes (`pathname === href || pathname.startsWith(href + "/")`),
le logo/accueil n'étant actif que sur `/`. Le **traitement visuel exact** de l'état actif est à lire
**losslessly sur le node `51:2699`** au build (FR-016) puis mappé sur la variante `active` des pills
(ajuster la variante DS si le node révèle un traitement différent de l'actuel `ring`).

**Justification** — `usePathname` est l'API App Router idiomatique, déjà disponible côté client.
Aucune dépendance. Le détail visuel reste piloté par Figma (Principe VII), pas deviné.

**Alternatives écartées** : passer l'`activeHref` en prop depuis chaque page (threading inutile,
contre l'esprit du wrapper global) ; déduire l'actif d'un state global (pas de besoin → Principe IV).

---

## 6. Source statique du contenu de navigation

**Décision** — `src/content/navigation.ts` : un export typé (entrées `{ label, href }` dans
**l'ordre desktop** retenu par la spec — *Nous découvrir, Expertises, Univers, Réalisations* — + le
CTA `contact { label, href }`). Les **slugs de routes sont figés ici** (cf. data-model.md). Pattern
calqué sur `src/content/footer.ts` (copie de maquette en un seul endroit). Le DS reçoit ces valeurs
en props ; aucune route cible n'est créée (FR-014, hors périmètre).

**Justification** — FR-015 (statique, pas de CMS), source unique (Principe IX par analogie — une
seule source de valeurs), forme **compatible migration Sanity** (un futur `getNavProps()` renverrait
la même forme). Cohérent avec l'existant `content/footer.ts`.

**Alternatives écartées** : config inline dans le composant (pas de source unique, dispersion) ;
schéma Sanity immédiat (hors périmètre + abstraction prématurée — cf. plan §Complexity Tracking).

---

## 7. Asset logo (vecteur)

**Décision** — le logo Estuaire est un **vecteur** et aucun SVG n'est présent dans `public/`. Au
build : tenter l'export via `.design/scripts/figma-render.mjs` / récupération du node logo ; si
indisponible, poser un **placeholder clairement flaggé** (texte de marque via `BrandText` ou SVG
provisoire) et **ne pas revendiquer pixel-perfect** pour le logo (règle skill `estuaire-figma`). Le
logo est un **slot** du `SiteHeader` (prop `logo`/`brandHref`) pour rester découplé.

**Justification** — conforme à la règle « vecteurs non exportables → placeholder flaggé, jamais de
fausse géométrie » (Principe VII / skill). Le slot évite de coupler la barre à un asset précis.

**Alternatives écartées** : recréer le logo à la main en SVG (risque de dérive vs marque ; à éviter
sans source vectorielle officielle).

---

## 8. Tracking (Principe VI — décision obligatoire en plan)

**Décision** :

- **Clic CTA *contact*** → **événement custom Umami** (ex. `nav_contact_click`). C'est un CTA
  principal explicitement visé par le Principe VI.
- **Clics sur les liens de navigation** (Nous découvrir, Expertises, Univers, Réalisations) → **pas
  d'événement custom** : la navigation est couverte par le **pageview** de la page cible.
- **Ouverture du panneau mobile** → **non tracée** (faible valeur métier, risque de bruit) — choix
  documenté, pas un oubli.
- Aucune **PII** dans le nom/les propriétés. Déclenchement **côté client** (interaction navigateur)
  via le tracker Umami déjà injecté dans `app/layout.tsx` : `window.umami?.track("nav_contact_click")`,
  **guardé** (no-op si le script est absent, ex. dev sans env Umami). Un petit util
  `trackEvent(name)` pourra être introduit s'il n'existe pas encore.

**Justification** — Umami est déjà câblé en `<script>` (tracker client) dans le layout racine ; le
*contact* est la conversion clé d'un site vitrine. Tracer les liens nav dupliquerait le pageview.

**Alternatives écartées** : tracer chaque clic nav (pollue les données, contre la nuance du
Principe VI) ; API serveur Umami (réservée aux événements déclenchés serveur — ici tout est client).

---

## 9. Breakpoints & bascule desktop ↔ menu

**Décision** — mobile-first, conventions DS (`tokens.ts`) : **base → mobile (390)**, **`md:` →
tablette (768)**, **`lg:` → desktop (≥1024 ; frame 1920)**. Liste horizontale visible **`lg:` et
plus** ; **sous `lg`** (mobile **et** tablette) → liste masquée, **bouton menu** visible et panneau
plein écran. Hauteurs d'en-tête de référence (à confirmer losslessly au build) : ≈ **160px** desktop,
≈ **120px** tablette/smartphone ; logo réduit sous desktop (Hypothèses spec).

**Justification** — la spec range tablette **et** smartphone dans « écran réduit » avec menu
hamburger (FR-007, scénario 2) ; le breakpoint `lg` (1024) est le point de bascule DS documenté.

**Alternatives écartées** : bascule à `md` (laisserait la tablette en mode desktop, contraire au
scénario 2 et aux frames Figma 768 « opened-menu »).

---

## Inconnues restantes (résolues au build, pas en plan)

Ces points sont **intrinsèques à Figma** et seront lus losslessly au moment de l'implémentation
(skill `estuaire-figma`), pas devinés ici :

- Géométrie exacte des barres (hauteurs, paddings, gaps, tailles logo par frame) — nodes `51:2221`,
  `77:3149`, `77:3150`, `51:2585`.
- Traitement visuel de l'**état actif** — node `51:2699` (à **pull**, absent du cache).
- Apparence exacte du **panneau ouvert** (opacité du fond ≈ 90 %, position croix, ordre/espacement
  des entrées) — nodes `77:3630`, `87:5893`.
- Asset **logo** (export ou placeholder flaggé).
