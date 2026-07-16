# 0019 — Webhook de revalidation à 200 mais sans effet : mismatch de tag Sanity

- **Date** : 2026-07-16
- **Branche** : `sanity-cache-staleness`
- **Lien** : [[decisions/0026-sanity-cache-revalidation-and-isr-quota-model]], [[post-mortems/0010-reseed-not-reflected-cdn-and-next-fetch-cache]]

> Numéros 0019 (post-mortem) et 0026 (ADR) choisis au-dessus du plus haut présent sur `main`.
> Renuméroter au merge si collision avec un worktree parallèle, skill `estuaire-branch-sync`.

## Symptôme

En **production** (estuaire.fr), une modification de contenu **publiée** dans le Studio Sanity
n'apparaissait **pas** sur le site, même après un rechargement avec vidage du cache navigateur.
Le contenu ne bougeait qu'au **redéploiement**. C'est une **réouverture de I4** (« contenu pas à
jour sans redéploiement »), qu'une note antérieure (mémoire + ADR 0024 de `client-feedback-fixes`)
croyait résolu parce que le webhook renvoyait **200**.

## Diagnostic (preuves, du moins cher au plus cher)

1. **En-têtes HTTP** : `cf-cache-status: DYNAMIC` partout → Cloudflare ne cache pas le HTML (écarté).
   `/` + `/expertises` : `x-nextjs-cache: HIT` + `x-nextjs-prerender: 1` + `s-maxage=31536000` (Full
   Route Cache figé). `/realisations` : `no-store` (rendu dynamique) — et pourtant périmé aussi.
2. **Sanity publié ↔ HTML servi** : la réalisation `distillerie-generale` publiée en prod (`vbuzs69z`,
   perspective `published`) avait pour titre **« Distillerie Générale 4 »** (publié 2 jours plus tôt),
   alors que le site servait **« Distillerie Générale »** (liste + détail + `<title>` + JSON-LD).
   Divergence prouvée sur une page **dynamique** → la staleness n'est pas dans le Full Route Cache
   seul, mais **sous** lui, dans le **Next Data Cache** du résultat `sanityFetch`.

## Cause racine — mismatch de tag de revalidation

`next-sanity@13` : `sanityFetch` (issu de `defineLive`) tague chaque entrée de Data Cache avec
`next: { revalidate: false, tags: [...customTags, "sanity:<syncTag>"] }` (`revalidate:false` = figé
indéfiniment). Il n'attache **aucun tag littéral `"sanity"`**, et aucun de nos appels ne passait de
`tags` custom. Le webhook `/api/revalidate` appelait `revalidateTag("sanity", "max")`. Or
`revalidateTag` matche **au caractère près** : `"sanity"` ne matche **aucun** `"sanity:<hash>"`.
→ **200 mais revalidation sans effet.** Le contenu ne se rafraîchissait qu'au rebuild (Data Cache neuf).

Le commentaire du code (« defineLive attaches a parent "sanity" tag ») était **faux**. La croyance
venait probablement du [[post-mortems/0010-reseed-not-reflected-cdn-and-next-fetch-cache]], qui parlait
d'un « fetch-cache Next, tag `sanity` » — vrai à une époque antérieure de l'intégration, plus avec
`defineLive`. La doc officielle next-sanity (MIGRATE-v12-to-v13) le dit noir sur blanc : *« sanityFetch
… prefixes its cacheTag calls with `sanity:` »*.

Aggravant (quota) : 3 pages étaient rendues **dynamiquement** (`/realisations`, `/realisations/[slug]`,
`/univers/[slug]`) alors que `/expertises/[expertise]` prouvait qu'on pouvait les prérendre. En
dynamique, `sanityFetch` fait une sonde « sync-tags » **par requête** → coût Sanity qui scale avec le trafic.

## Fix

1. **Tag stable** : `sanityFetch` est enveloppé (`@/lib/sanity/live`) pour injecter `tags: ["sanity"]`
   à **chaque** appel ; le webhook fait `revalidateTag("sanity", { expire: 0 })` (immédiat). Un publish
   invalide alors toutes les pages Sanity d'un coup, refetchées **une fois** puis re-cachées.
2. **Pages statiques (ISR)** : `generateStaticParams` sur `/realisations/[slug]` (slugs publiés) et
   `/univers/[slug]` (ensemble fermé `SECTOR_SLUGS`, `dynamicParams=false`) ; liste `/realisations`
   rendue statique (lecture du deep-link `?univers=`/`?expertise=` déplacée côté client). Serveur =
   0 requête Sanity par visite. ⚠️ `generateStaticParams` doit passer `perspective:"published"` +
   `stega:false` sinon `defineLive` appelle `draftMode()` — interdit au build.
3. `<SanityLive />` était **déjà** gaté draft-only (aucune connexion live pour un visiteur public).

## Preuve end-to-end (build prod contre projet dev + webhook signé)

Publish d'un titre en dev → page **toujours périmée** (caché, 0 fetch/requête) ; après le webhook
signé (`revalidateTag("sanity", {expire:0})`) → contenu **à jour sans rebuild** (détail + liste).

## Leçon

**Un webhook à 200 ne prouve PAS la revalidation.** Toujours vérifier que le tag revalidé
**correspond exactement** au tag réellement posé par `sanityFetch` — en **lisant la source de la
version installée** (`node_modules/next-sanity`), pas la doc ni la mémoire. Pour un webhook, revalider
un **tag stable qu'on contrôle** (ajouté à chaque fetch), jamais un tag deviné : les `syncTags` de
`defineLive` sont des hashes de contenu, **non reconstructibles** depuis un payload de webhook document.
Corollaire quota : garder les pages **statiques (ISR)** — la fraîcheur vient du webhook, pas d'un fetch
par requête.
