# Data Model — Navbar responsive (Phase 1)

Aucun document Sanity dans cette version (FR-015) : « le modèle de données » est ici la **config
statique** + l'**état UI runtime** + le **contrat de tonalité**. Tous les identifiants sont en
anglais ; les libellés affichés sont en français (contenu).

## 1. Config statique — `src/content/navigation.ts`

Source unique des entrées et du CTA (forme compatible avec une future migration Sanity : un
`getNavProps()` renverrait la même forme).

### Entités

**`NavItem`** — une entrée de navigation principale.

| Champ | Type | Règle |
|---|---|---|
| `label` | `string` | Libellé affiché (FR). Non vide. |
| `href` | `string` (route interne) | Chemin absolu commençant par `/`. Pointe vers une page dédiée (FR-014), même non encore construite. |

**`NavCta`** — l'action *contact* (mise en avant).

| Champ | Type | Règle |
|---|---|---|
| `label` | `string` | Défaut `"contact"`. |
| `href` | `string` | Route interne `/contact`. |

**`NavConfig`** — l'agrégat exporté.

| Champ | Type | Règle |
|---|---|---|
| `items` | `NavItem[]` | Exactement 4, **dans l'ordre desktop** (FR-002 + Hypothèses) : Nous découvrir, Expertises, Univers, Réalisations. Ordre identique desktop ↔ panneau (Hypothèses). |
| `cta` | `NavCta` | L'action *contact*. |
| `brandHref` | `string` | `"/"` — le logo ramène à l'accueil (FR-003). |

### Valeurs (slugs figés ici — FR-015 ; pages cibles hors périmètre — FR-014)

| label | href (proposé, à figer) |
|---|---|
| Nous découvrir | `/nous-decouvrir` |
| Expertises | `/expertises` |
| Univers | `/univers` |
| Réalisations | `/realisations` |
| contact (CTA) | `/contact` |
| (logo / brand) | `/` |

> Les slugs suivent les libellés (Hypothèses spec). À confirmer avec Pierre si une convention de
> nommage de routes différente est souhaitée ; sans objection, ceux-ci font foi.

### Invariants

- `items.length === 4` ; chaque `href` unique ; tous commencent par `/`.
- L'ordre du tableau **est** l'ordre d'affichage (desktop et panneau).
- Aucune dépendance à Sanity / au runtime : module pur, importable côté client et serveur.

## 2. État UI runtime (wrapper `src/components/Navbar.tsx`)

### Machine d'états visuels de la barre (`NavbarVisualState`)

```text
            scroll au sommet (scrollY <= TOP_THRESHOLD)
        ┌───────────────────────────────────────────────┐
        ▼                                                │
   ┌─────────┐   scroll bas (hors sommet, Δ>seuil)  ┌─────────┐
   │  top    │ ───────────────────────────────────► │ hidden  │
   │(transp. │ ◄─────────────────────────────────── │(escamot.│
   │ repos)  │        retour au sommet               │  -100%) │
   └─────────┘                                        └─────────┘
        ▲                                                │
        │ retour au sommet            scroll haut (hors  │
        │                             sommet, Δ>seuil)   ▼
        │                                          ┌─────────┐
        └───────────────────────────────────────  │ pinned  │
              scroll bas (hors sommet) ──────────► │ (plein) │
                                                   └─────────┘
```

| État | Déclencheur | Rendu |
|---|---|---|
| `top` | `scrollY <= TOP_THRESHOLD` (≈ 8px) | Fond **transparent**, contenu en **contraste adaptatif** (§4), barre visible, pas d'ombre. (FR-005) |
| `hidden` | scroll **vers le bas**, hors sommet, delta > seuil (≈ 6–10px) | Barre **escamotée** hors écran (`-translate-y-full`). (FR-006) |
| `pinned` | scroll **vers le haut**, hors sommet, delta > seuil | Barre **plein/opaque** : fond clair, ombre portée, contenu sombre, `fixed` en haut. (FR-006) |

Transitions animées (`transform`/`opacity`, `power2.out`, ~0.3–0.4s) **sauf** `prefers-reduced-motion`
→ instantané (FR-012).

### État du panneau mobile (`PanelState`)

| Champ | Type | Notes |
|---|---|---|
| `isOpen` | `boolean` | `true` = panneau plein écran ouvert. |
| Transitions | `open()` (clic menu), `close()` (croix, Échap, sélection d'entrée, franchissement `lg` au resize) | À la fermeture par sélection : naviguer **puis** fermer (FR-010). |

Effets liés à `isOpen` :

- `useScrollLock(isOpen)` — `lenis.stop()` + `overflow:hidden` (§ research 3).
- `useFocusTrap(isOpen, panelRef, triggerRef)` — focus piégé, Échap, restauration (§ research 4).
- `inert`/`aria-hidden` sur le contenu hors panneau quand `isOpen`.

### État actif (`activeHref`)

Dérivé, non stocké : `pathname = usePathname()` ; une entrée est active si
`pathname === item.href || pathname.startsWith(item.href + "/")`. Le logo n'est « actif » que sur `/`.
→ prop `active` des pills → `aria-current="page"` (FR-016).

## 3. Tonalité (`NavTone`)

```ts
type NavTone = "onLight" | "onDark"; // axe de contraste des éléments « fantômes » : NavButton + MenuToggle
```

À l'état `top`, la barre reçoit une tonalité **par slot** (la maquette montre une frontière
horizontale clair/sombre) :

> Le CTA `ContactButton` n'utilise **pas** `NavTone` : pill *pleine* lisible sur fond clair comme
> sombre, il est rendu en toute situation avec la variante DS `tone="bleu"` (jamais une couleur en
> dur), indépendamment de l'état et du contraste de fond.

| Slot | Prop | Home (à confirmer losslessly) |
|---|---|---|
| Logo | `logoTone` (`NavTone`) | `onDark` (bloc sombre à gauche → logo clair) |
| Liens + toggle | `linksTone` (`NavTone`) | `onLight` (zone claire à droite → contenu sombre) |
| CTA *contact* | — (fixe) | `bleu` (variante DS `ContactButton`, en toute situation) |

Aux états `pinned`/`hidden` : liens + toggle → tonalité **fixe** `onLight` (contenu sombre sur fond
clair opaque) ; le CTA reste `bleu`. La question de lisibilité ne se pose plus.

## 4. Contrat de déclaration de tonalité (sommet de page)

La **zone d'en-tête de la page** déclare sa tonalité par slot (contrat détaillé :
`contracts/section-tone.md`). Le wrapper lit cette déclaration tant qu'il est à l'état `top`.

| Source | Valeur | Défaut si absente |
|---|---|---|
| `data-nav-logo-tone` sur l'en-tête de page | `onLight \| onDark` | `onLight` |
| `data-nav-links-tone` sur l'en-tête de page | `onLight \| onDark` | `onLight` |

Défaut sûr `onLight` = contenu sombre (lisible sur fond clair), pour toute page n'ayant pas encore
déclaré son en-tête.

## 5. Constantes de comportement (`src/lib/motion/useStickyNav.ts`)

| Constante | Valeur (indicative) | Rôle |
|---|---|---|
| `TOP_THRESHOLD` | `8` px | Frontière de l'état `top` (anti-scintillement au sommet). |
| `DIRECTION_DELTA` | `6–10` px | Delta minimal avant bascule `hidden`↔`pinned` (anti-vacillement micro-scroll). |
| Ease / durée | `power2.out` / `0.3–0.4`s | Transition show/hide (désactivée en reduced-motion). |

Valeurs à ajuster empiriquement à la vérification (cas limite « seuil de scroll »).
