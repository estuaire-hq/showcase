# Quickstart — Navbar responsive

Comment construire, lancer et **vérifier** la navbar. Suit les skills `estuaire-figma`
(pixel-perfect) et `estuaire-motion` (cinématique), et les conventions DS du projet.

## Prérequis

- `git-crypt unlock` fait (FIGMA_TOKEN dans `.env.development`).
- `npm install` à jour.

## 1. Lire la source Figma (AVANT de coder — Principe VII)

Charger la skill **`estuaire-figma`**, puis lire **losslessly** chaque node (jamais un résumé) :

```bash
# Les 6 frames navbar sont déjà en cache dans .design/figma-data/nodes.json :
#   51:2221 desktop · 51:2585 sticky · 77:3149 tablette · 77:3630 tablette ouverte
#   77:3150 smartphone · 87:5893 smartphone ouvert
node .design/scripts/figma-node.mjs 51:2221    # barre desktop (au repos)
node .design/scripts/figma-node.mjs 51:2585    # barre sticky (plein)
node .design/scripts/figma-node.mjs 77:3149    # tablette
node .design/scripts/figma-node.mjs 77:3150    # smartphone
node .design/scripts/figma-node.mjs 77:3630    # panneau ouvert (tablette)
node .design/scripts/figma-node.mjs 87:5893    # panneau ouvert (smartphone)

# À PULL (absent du cache) : l'état « page active » + l'asset logo
node --env-file=.env.development .design/scripts/figma-pull.mjs 51:2699
node .design/scripts/figma-node.mjs 51:2699
```

Passer le **completeness gate** : énumérer tous les nodes, relever hauteurs/paddings/gaps, tailles
de logo par frame, opacité du fond du panneau, position de la croix, traitement de l'état actif.
**Aucune valeur devinée.**

## 2. Construire — dans cet ordre

1. **Config statique** — `src/content/navigation.ts` (contrat `contracts/navigation-config.md`).
2. **Composants DS** (présentationnels, props only — contrat `contracts/design-system-components.md`) :
   - `src/design-system/components/SiteHeader.tsx` (la barre)
   - `src/design-system/components/MenuToggle.tsx` (hamburger / croix)
   - `src/design-system/components/NavPanel.tsx` (panneau plein écran)
   - réutiliser `NavButton` (liens) + `ContactButton` (CTA) tels quels.
   - exporter les nouveaux dans `src/design-system/index.ts`.
   - styliser **exclusivement** avec les utilitaires Tailwind + tokens `@theme` (jamais de couleur/
     police/radius en dur). Mobile-first : base → mobile, `md:` → tablette, `lg:` → desktop.
3. **Hooks de comportement** (`src/lib/`) :
   - `lib/motion/useStickyNav.ts` — direction de scroll via `ScrollTrigger` (+ repli listener natif
     en reduced-motion) → état `top|hidden|pinned` (data-model §2, §5).
   - `lib/a11y/useScrollLock.ts` — `lenis.stop()/start()` + `overflow:hidden` (research §3).
   - `lib/a11y/useFocusTrap.ts` — focus piégé + Échap + restauration + `inert` (research §4).
   - exposer l'instance Lenis depuis `SmoothScroll` via un `LenisContext` léger (consommé par
     `useScrollLock`).
4. **Wrapper client** — `src/components/Navbar.tsx` (`"use client"`) : assemble état d'ouverture,
   `useStickyNav`, `usePathname()` → `activeHref`, tonalités par slot (contrat
   `contracts/section-tone.md`), `prefers-reduced-motion`, et rend `<SiteHeader>` + `<NavPanel>`.
   Tracking : `window.umami?.track("nav_contact_click")` sur le CTA contact (research §8).
5. **Layout** — `src/app/(site)/layout.tsx` : rendre `<Navbar />` dans le shell `SmoothScroll`
   (au-dessus de `FooterReveal`).
6. **Déclaration de tonalité** — sur l'en-tête de la home, poser `data-nav-logo-tone` /
   `data-nav-links-tone` (valeurs confirmées au node `51:2221`).
7. **Logo** — slot `logo` : export Figma si possible, sinon **placeholder flaggé** (ne pas
   revendiquer pixel-perfect pour le logo).
8. **(Optionnel, recommandé)** page d'isolation `src/app/(lab)/lab/navbar/page.tsx` rendant les 4
   états × 3 breakpoints pour le diff visuel.

## 3. Appliquer la motion (skill `estuaire-motion`)

- Hide/reveal de la barre : `transform`/`opacity` only, ease `power2.out`, ~0.3–0.4s.
- Ouverture du panneau : une transition focale (fade/slide du fond), pas d'empilement d'effets.
- **`prefers-reduced-motion`** : aucun glissement → changements instantanés (FR-012, SC-005).

## 4. Vérifier (gate « pixel-perfect » + a11y)

```bash
npm run dev      # tester manuellement
npm run lint     # Biome (lint + format)
npm run build    # build de production
```

Checklist de vérification :

- [ ] **Screenshot-diff par breakpoint** (390 / 768 / 1920) contre un render Figma
      (`node --env-file=.env.development .design/scripts/figma-render.mjs <nodeId>`), pour les états :
      transparent/repos (contraste adaptatif), sticky/plein, **page active**, **panneau ouvert**
      (SC-002). Si `/images` renvoie 429 → marquer **« pixel-perfect non vérifié »**, ne pas l'affirmer.
- [ ] **Scénario 1 (desktop)** : logo + 4 liens + CTA contact visibles ; chaque lien mène à sa route ;
      logo → `/`. (SC-001)
- [ ] **Scénario 2 (mobile/tablette)** : sous `lg`, liste masquée + bouton menu ; ouverture =
      panneau plein écran (logo + entrées + croix), fond non défilable ; sélection = navigation +
      fermeture ; croix/Échap ferment et restaurent le scroll. (SC-003)
- [ ] **Scénario 3 (sticky)** : transparent au sommet ; masquée en descente ; plein en remontée ;
      retour transparent au sommet ; pas de vacillement sur micro-scroll. (SC-004)
- [ ] **Reduced-motion** : aucune animation, navbar pleinement fonctionnelle. (SC-005)
- [ ] **A11y** : tout focusable/activable clavier ; focus piégé dans le panneau ; Échap ferme ;
      `aria-expanded` sur le toggle, `aria-current="page"` sur l'entrée active, libellés accessibles
      sur menu/croix. (SC-006)
- [ ] **Resize panneau ouvert** : franchir `lg` ferme le panneau et libère le verrou (pas de panneau
      fantôme ni de scroll bloqué).
- [ ] ⚠️ **Turbopack** : si le `@theme` a changé, **redémarrer `npm run dev`**.

## Notes

- Aucune nouvelle dépendance (objectif). Si le focus-trap maison s'avère fragile → promouvoir
  `focus-trap-react` (acté dans le PR).
- Pas de contenu Sanity : la migration future ajouterait `lib/sanity/navigation.ts` (même forme de
  props) + un wrapper connecté, sans changer le comportement.
