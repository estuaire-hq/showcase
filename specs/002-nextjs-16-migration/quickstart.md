# Quickstart / Runbook — Migration Next 16 + Sanity v5

> Procédure d'exécution en **paliers vérifiables**. Ne pas passer au palier suivant tant que
> son *gate* (lint + build verts + smoke) n'est pas franchi. Branche : `002-nextjs-16-migration`.
> Convention git : commits Conventional Commits en anglais (un commit par palier, au minimum).

## Palier 0 — Baseline (point de comparaison)

```bash
npm run lint        # biome — doit être vert
npm run build       # next build (v15) — doit être vert ; noter le temps de build
```
Capturer l'état visuel de référence (pages clés) pour le diff final (Principe VII).

---

## Palier 1 — Cœur Next.js 16 (Sanity reste en v4)

1. **Codemod** (relire chaque diff avant commit) :
   ```bash
   npx @next/codemod@canary upgrade latest
   ```
2. **Vérifier / forcer les versions** (si le codemod ne les a pas posées) :
   ```bash
   npm install next@16.2.9 react@^19.2.7 react-dom@^19.2.7
   npm install -D @types/react@^19.2.17 @types/react-dom@^19.2.3
   ```
   *(Sanity, `next-sanity@11` inchangés à ce palier — compatibles Next 16.)*
3. **`package.json`** : script `dev` → `next dev` (retirer `--turbopack`). Vérifier que
   `build`, `start`, `lint`, `typegen`, `seed*` sont intacts.
4. **`middleware.ts` → `proxy.ts`** (si non fait par le codemod) :
   - renommer `src/middleware.ts` → `src/proxy.ts`
   - fonction `export function middleware` → `export function proxy`
   - retirer `runtime: "nodejs"` du `config` exporté
   - réécrire le commentaire d'en-tête (runtime `proxy`)
5. **`revalidateTag`** : `src/app/api/revalidate/route.ts` →
   `revalidateTag("sanity", "max")`.
6. **`next.config.ts`** : revue (cf. research § D6) — a priori aucune modif.
7. **Gate palier 1** :
   ```bash
   npm run lint
   npm run build           # confirmer .next/standalone généré ; sinon → next build --webpack
   npm run dev             # smoke local
   ```
   Smoke : gate « coming soon » (4 états, cf. C2), images Sanity, scroll/animations,
   `/studio` (encore v4) monte. *Un warning peer React 19.2 ↔ Sanity v4 est toléré ici.*

---

## Palier 2 — Stack Sanity v5

1. **Bumps Sanity** :
   ```bash
   npm install sanity@^5.31.1 @sanity/vision@^5.31.1 next-sanity@^13.0.12 \
               @sanity/image-url@^2.1.1 styled-components@^6.1.15
   ```
   *(`@sanity/client@7` arrive en transitif ; `@sanity/locale-fr-fr` inchangé.)*
2. **Régénérer les types** (Principe IX) :
   ```bash
   npm run typegen        # extract schema + generate → src/sanity.types.ts
   ```
3. **Vérifications ciblées** (cf. research § D8) :
   - `src/lib/sanity/client.ts` + `live.ts` : lecture publié (CDN) vs brouillon (token) OK
     sous `@sanity/client@7`.
   - `urlFor(...)` (`@sanity/image-url@2`) : URLs `cdn.sanity.io` identiques (taille/format/qualité).
4. **Gate palier 2** :
   ```bash
   npm run lint
   npm run build           # typecheck vert avec types régénérés
   npm run seed:check      # dry-run seeds vert
   npm run dev             # smoke
   ```
   Smoke : `/studio` **v5** monte (desk, Vision, locale fr-FR) ; éditer/publier → webhook →
   contenu à jour ; draft mode + Visual Editing en direct.

---

## Palier 3 — Documentation & gouvernance

- **ADR 0008** (`docs/vault/decisions/0008-nextjs-16-sanity-5-migration.md`) : cibles de
  version, Sanity v5 (pas v6), périmètre *lift*, Turbopack, pivot React 19.2.
- **ADR 0007** (coming-soon gate) : référence `middleware` → `proxy`.
- **Constitution** (suivi, amendement séparé) : table « Stack » Next 15→16, Sanity v4→v5,
  lever `TODO(ANIMATION_LIB)` (GSAP) — avec Sync Impact Report + bump de version.

---

## Palier 4 — Vérification finale & déploiement

1. **Régression complète** : dérouler `contracts/regression-contracts.md` (C1→C8).
2. **Scan APIs retirées** (FR-017) : aucune occurrence de `next/amp`/`useAmp`,
   `serverRuntimeConfig`/`publicRuntimeConfig`/`next/config`, `next/legacy/image`,
   `unstable_rootParams`, `next lint`.
3. **Build Docker local** (sortie standalone) :
   ```bash
   docker build -t estuaire:next16 .
   docker run --rm -p 3000:3000 estuaire:next16   # vérifier démarrage + service
   ```
4. **CI** : pousser la branche → jobs `lint` + `build` verts.
5. **Déploiement** : merge sur `main` → Coolify build & deploy → smoke prod (gate, contenu,
   animations). Confirmer Node ≥ 20.9 côté build Coolify.

---

## Critères de sortie (rappel SC)

- SC-001 parité visuelle · SC-002 gate 4 états · SC-003 Studio v5 éditable · SC-004 TypeGen
  compile + contenu intact · SC-005 revalidation+draft OK · SC-006 CI verte · SC-007 Docker
  démarre · SC-008 zéro nouvelle erreur · SC-009 animations OK · SC-010 zéro API retirée.

## Rollback

Migration confinée à une branche. En cas de blocage : `git revert` du/des commit(s) de palier,
ou abandon de branche. Coolify redéploie le dernier état `main` (v15) inchangé.
