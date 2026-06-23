# Quickstart — Réalisations

Comment construire, seeder et vérifier la feature. Suppose le worktree
`012-realisations-portfolio` (dev : `http://012-realisations-portfolio.estuaire.localhost:1355`,
ou `PORTLESS=0 npm run dev` → `localhost:3000`).

> **⚠️ Caduc depuis le réalignement v1.8.0 (ADR 0019/0020)** — les étapes ci-dessous décrivant un
> **seed git des réalisations** (`seed-assets/realisations/`, `realisation.build.ts`,
> `realisations.seed.ts`, `npm run seed -- realisation`) **ne s'appliquent plus** : les réalisations
> sont une **collection dynamique**, créées **dans Sanity** (Studio éditeur-first ou MCP ; dev libre,
> prod sur autorisation). Seul le **socle statique** (singletons) passe encore par le seed typé + CI.
> Le contenu est déjà peuplé en **dev `wje1fhkq` + prod `vbuzs69z`**. Le reste (schéma, queries,
> connecteur, pages, taxonomie, DS) reste valable.

## Ordre de build recommandé

1. **Schéma** — `src/sanity/schemas/documents/realisation.ts` (data-model.md), register dans
   `schemas/index.ts`, entrée `documentTypeList("realisation")` dans `structure.ts` (+ liste
   `EXPLICIT`).
2. **Types** — `npm run typegen` → régénère `src/sanity.types.ts` (commité). Vérifier que
   `Realisation` apparaît.
3. **Taxonomie partagée** — `src/content/realisations.ts` (`UNIVERS`, `EXPERTISE_SLUGS`, types).
   Brancher `UNIVERS` dans le `options.list` du champ `univers` du schéma (source unique).
4. **Queries** — ajouter les `defineQuery` (contracts §1) dans `src/lib/sanity/queries.ts` ;
   `npm run typegen` régénère les `*_QUERYResult`.
5. **Connecteur** — `src/lib/sanity/realisation.ts` (contracts §2), mapping via `mapImage`.
6. **Primitive DS** — `src/design-system/components/Carousel.tsx` + export dans `index.ts`.
7. **Routes** — `app/(site)/realisations/page.tsx` (+ `RealisationsBrowser.tsx` client) et
   `app/(site)/realisations/[slug]/page.tsx`. Construire **depuis les nodes Figma complets**
   (skill `estuaire-pixel-perfect` ; `portfolio` 51:4064, `case-study` 51:4386, `case-study-court`
   53:2745).
8. **Contenu seed** — remplir `realisationsContent` (23 études) depuis le pptx client, copier les
   photos renommées SEO dans `seed-assets/realisations/<slug>/` (dossier source intact, D13).
9. **Seed builder + registry** — `realisation.build.ts`, `realisations.seed.ts`, `registry.ts`.
10. **Demock** — home (`page.tsx`, supprimer `homeRealisations.ts`) et sous-pages expertises
    (contracts §4).
11. **Motion** — passe `estuaire-motion` (carrousel, reveals, transitions de section).
12. **Revue pixel-perfect** — skill `estuaire-pixel-review` (desktop + responsive par breakpoint).

## Commandes

```bash
npm run typegen            # régénère src/sanity.types.ts après tout changement de schéma/query
npm run seed -- --check    # dry-run offline : champs requis + assets présents (AVANT seed)
npm run seed -- realisation # seed du seul type realisation (dev project)
npm run lint               # Biome (lint + format)
npm run build              # build de prod (vérifie le typage de bout en bout)
```

> ⚠️ Dataset dev **partagé** entre worktrees — ne pas lancer `npm run seed -- --reset` si un autre
> worktree travaille. Le seed local ne touche **que** le projet *dev* ; la prod est seedée par la CI.

## Vérifications fonctionnelles (mapper aux scénarios du spec)

- `/realisations` : Dernières Réalisations (3 plus récentes) + grille ; filtres Univers/Expertises/
  Clients combinables, « charger d'autres », états vides (contact + « revenez bientôt »). (US1/US2)
- Clic carte → `/realisations/<slug>` ; fil d'ariane ; sections dans l'ordre (intro → missions →
  défis → [crédit photo] → savoir-faire) ; prev/suiv. (US1)
- Variante **fournie** : carrousel d'intro ; **légère** : intro compacte. Défis 1/2/3. (SC-008)
- `upcoming` : grisé non cliquable, `/realisations/<slug>` → 404 propre ; `draft` : invisible. (US4)
- Home : 3 cartes = 3 plus récentes du CMS ; boutons secteurs → `/realisations?univers=…`. (US3)
- Sous-pages expertises : case study = realisation la plus récente de l'expertise → CTA filtré ;
  repli propre si aucune. (US3)
- Zéro 404 sur les liens « réalisations » du site une fois ≥ 1 publiée par cible. (SC-002)

## Garde-fous Constitution

- Aucune couleur/typo en dur ; composants depuis `@/design-system` (Principe X).
- Types Sanity **générés** (jamais tapés) ; seed typé + `--check` (Principe IX).
- DS présentationnel ; mapping isolé dans `@/lib/sanity/realisation.ts` (Principe VIII).
- `_id = realisation-<slug>` (hyphen, jamais de point — post-mortem 0010).
- Tracking Umami décidé (research D14) — implémenter les `data-umami-event*` listés.
