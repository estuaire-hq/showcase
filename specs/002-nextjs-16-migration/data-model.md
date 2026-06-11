# Data Model — Migration Next.js v16 + Sanity v5

> Cette migration **ne modifie pas** le modèle de contenu. Il n'y a pas de nouvelle entité.
> Le « modèle » pertinent ici est (a) la matrice de dépendances/versions, (b) le modèle de
> contenu Sanity **inchangé** mais dont les **types sont régénérés**, (c) les artefacts
> générés/commités impactés.

## A. Matrice de versions (état cible)

Voir [research.md § D1](./research.md#d1--versions-cibles-épinglage) pour la table complète et
le rationale. Invariants :

- `next-sanity@13` ⇒ exige `next ^16`, `sanity ^5.29 || ^6`, `react ^19.2.3`,
  `@sanity/client ^7.22.1`, `styled-components ^6.1`.
- `sanity@5.31` ⇒ exige `react ^19.2.2`, `styled-components ^6.1.15`.
- React 19.2 est le **nœud commun** : il satisfait simultanément Next 16 et Sanity v5.
- `@sanity/client` reste **transitif** (aucune dépendance directe à ajouter).

## B. Modèle de contenu Sanity — INCHANGÉ

- Schémas (`src/sanity/schemas/`, `defineType`) : **aucune modification**.
- Structure desk (`src/sanity/structure.ts`) : inchangée.
- Locale `@sanity/locale-fr-fr` : inchangée.
- Seeds (`src/sanity/seed/`) : inchangés ; valeurs de maquette (`src/content/`) inchangées.
- Documents de contenu existants (dev + prod) : **non altérés** par la montée (pas de
  migration de données, pas de remodelage).

**Conséquence Principe IX** : le schéma reste la source de vérité unique ; seule la **dérivation
de types** doit être rejouée.

## C. Artefacts générés / commités impactés

| Artefact | Action | Déclencheur |
|---|---|---|
| `src/sanity.types.ts` | **Régénéré** (`npm run typegen`) | montée Sanity v5 (TypeGen) |
| `.sanity/schema*.json` | Ré-extrait (étape `seed:schema`) | `npm run typegen` / `seed:check` |
| `package.json` | Bumps deps + script `dev` | paliers 1 & 2 |
| `package-lock.json` | Recalculé (`npm install`) | tous bumps |
| `src/proxy.ts` | **Nouveau** (renommage de `middleware.ts`) | palier 1 |
| `src/middleware.ts` | **Supprimé** (renommé) | palier 1 |

## D. Règles de validation (issues des exigences)

- **TypeGen** (FR-012, Principe IX) : après `npm run typegen`, le projet **compile**
  (`next build` typecheck vert) avec `sanity.types.ts` régénéré ; aucun type de contenu tapé
  à la main n'est introduit.
- **Seeds** (FR-012, Principe IX) : `npm run seed:check` (dry-run, offline, sans token) reste
  **vert** — champs `required` présents, assets référencés existants.
- **Revalidation** (FR-004, Principe I) : `revalidateTag("sanity", "max")` invalide
  effectivement les caches `sanityFetch` (tag parent `sanity` posé par `defineLive`).
- **Aucune perte de contenu** (SC-004) : les documents Sanity restent intacts après montée.
