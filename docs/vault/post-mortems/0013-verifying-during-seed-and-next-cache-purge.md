# 0013 — Vérifier pendant un seed en cours + purge `.next` qui casse tout

- **Date** : 2026-06-20
- **Feature** : `012-realisations-portfolio`
- **Voisins** : [[0010-reseed-not-reflected-cdn-and-next-fetch-cache]] (cache de fetch Next),
  [[0011-portless-route-404-and-worktree-gate]] (404 portless).

## Symptômes

En vérifiant la page liste `/realisations` pendant que le seed des 188 images **tournait encore** en
arrière-plan, la section « Dernières Réalisations » montrait les réalisations d'`order` 18-20 au lieu de
21-23 (les plus récentes). Le home (rendu **après** la fin du seed) affichait, lui, le bon top 3.
Diagnostic initial erroné : « bug d'ordonnancement GROQ ». En réalité, **aucun bug de code**.

Puis, en tentant de purger le cache, `rm -rf .next/cache` sur un serveur Turbopack → **toutes** les
routes (y compris `/studio`, exempt du gate) ont renvoyé **404** sans erreur de compilation.

## Causes racines

1. **Cache de données Next figé pendant le seed.** Le premier rendu SSR d'une route met en cache le
   résultat de `sanityFetch` (data cache Next, persistant **sur disque** dans `.next/cache`, survit à un
   redémarrage du serveur). Curler `/realisations` à mi-seed a figé une liste partielle. Le home, curlé
   après la fin du seed, a caché la bonne. Même clause `order desc` dans les deux → le code était correct.
   (Même famille que post-mortem 0010 : reseed non reflété tant que le cache n'est pas invalidé.)
2. **Purge partielle de `.next/cache` = manifestes Turbopack désynchronisés.** Supprimer seulement
   `.next/cache` (pas tout `.next`) laisse les manifestes de routes incohérents → Next sert son 404
   global pour toutes les routes.
3. **`next build` local ne charge pas `.env.development`.** Next charge `.env` / `.env.production` /
   `.env.local` au build, **pas** `.env.development` (dev-only). Sans creds Sanity, `projectId="placeholder"`
   → les pages **SSG** (sous-pages d'expertises, `generateStaticParams`) échouent au prerender
   (« Dataset not found »). Contourner via `node --env-file=.env.development next build` **échoue aussi** :
   `--env-file` est interdit dans le `NODE_OPTIONS` des workers de build.

## Corrections / règles

- **Ne pas conclure à un bug tant que le seed n'est pas terminé.** Attendre la fin du seed (notification
  d'exit), puis vérifier. Pour forcer des données fraîches sans attendre l'invalidation : **purger tout
  `.next` et redémarrer** (voir ci-dessous), pas se fier au rendu mis en cache à mi-seed.
- **Pour purger le cache : `rm -rf .next` en entier (serveur arrêté), jamais `.next/cache` seul** sur un
  build Turbopack. Séquence sûre : stop dev → `rm -rf .next` → `npm run dev` (cold build, re-enregistre la
  route portless de façon fiable).
- **Le gate `npm run build` est CI/Coolify (vraies creds), pas local.** En local, sans `.env.development`
  chargeable au build, le build SSG échoue par design. Les gates locaux praticables : `npx tsc --noEmit`
  (0 erreur), `npm run lint` (Biome), et la **vérification du rendu sur le dev server** (HTTP + contenu).
- Côté produit, la fraîcheur en prod est assurée par le webhook Sanity → `revalidateTag` (ISR) ; ce
  problème de cache est un artefact **dev**.

## Leçon

Un écart constaté pendant qu'un job d'écriture (seed) tourne encore n'est pas une preuve de bug : isoler
la variable « données en cours d'écriture / en cache » **avant** de soupçonner le code. Et sur Turbopack,
le cache se purge en supprimant **tout** `.next`, jamais un sous-dossier.
