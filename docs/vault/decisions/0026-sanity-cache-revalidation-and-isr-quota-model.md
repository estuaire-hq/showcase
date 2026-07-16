# 0026 — Fraîcheur du contenu Sanity : ISR statique + revalidation on-demand par tag stable (quota-safe)

**Statut** : accepté · **Date** : 2026-07-16 · **Branche** : `sanity-cache-staleness`

> Numéro 0026 : `0024` est pris par un worktree parallèle non mergé (`client-feedback-fixes`,
> webhook de revalidation — cf. la note de l'ADR 0025), `0025` par le SEO. **Cette ADR corrige la
> conclusion « I4 résolu » de l'ADR 0024** : le webhook renvoyait 200 mais ne revalidait rien
> (mismatch de tag). Réconcilier / renuméroter au merge, skill `estuaire-branch-sync`.

## Contexte

I4 (« contenu pas à jour sans redéploiement ») était **rouvert** : une modification publiée en prod
n'apparaissait pas sur estuaire.fr sans rebuild. Cause racine et preuves : voir
[[post-mortems/0019-revalidate-tag-mismatch-200-not-revalidated]]. En résumé : `next-sanity@13`
tague les fetches avec `sanity:<syncTag>` (jamais un `"sanity"` littéral), et le webhook revalidait
`"sanity"` → **200 sans effet**.

Contrainte forte posée par Pierre : **ne pas re-fetcher Sanity à chaque chargement**, sinon on épuise
le quota du plan **Free** Sanity, qui est un **hard cap** (à 100 %, l'API publique est **bloquée** et
le site ne charge plus le contenu) :

- **API requests** (`api.sanity.io`, non-caché) : ~**100 000/mois**.
- **API CDN requests** (`apicdn.sanity.io`, service aux visiteurs) : ~**1 000 000/mois**.

## Décisions

### 1. Revalidation on-demand par **tag stable** (coarse), pas par sync-tags

`sanityFetch` est enveloppé (`@/lib/sanity/live`) pour injecter `tags: ["sanity"]` sur **chaque**
appel (en plus des `sanity:<syncTag>` automatiques). Le webhook `/api/revalidate` fait
`revalidateTag("sanity", { expire: 0 })`. Un publish invalide alors **toutes** les pages Sanity d'un
coup, refetchées **une fois** à la requête suivante puis re-cachées.

- **Pourquoi coarse** : petit site vitrine, publications rares → « revalider tout à chaque publish »
  est négligeable (le volume Sanity suit la **fréquence éditoriale**, pas le trafic). L'alternative
  granulaire (webhook lisant les `tags` du payload → `revalidateTag(`sanity:${tag}`)`, pattern
  officiel next-sanity) est écartée : les `syncTags` sont des **hashes de contenu non reconstructibles**
  depuis un payload de webhook document, et le câblage (projection dans manage.sanity.io) est fragile
  pour un gain marginal ici.

### 2. `{ expire: 0 }` (immédiat) plutôt que le profil `"max"`

Après un publish, le **premier** rafraîchissement sert déjà la nouvelle valeur (colle au modèle mental
« je publie, je rafraîchis, je vois »). Le nombre de requêtes Sanity est **identique** à `"max"`
(un refetch par page par publish) : c'est un choix d'UX, pas de quota.

### 3. Toutes les pages de contenu en **STATIC / SSG** (ISR)

`generateStaticParams` ajouté sur `/realisations/[slug]` (slugs publiés) et `/univers/[slug]`
(`SECTOR_SLUGS`, ensemble fermé → `dynamicParams = false`) ; liste `/realisations` rendue statique
(le deep-link `?univers=`/`?expertise=` est lu **côté client** après montage, plus via `searchParams`
serveur). `/expertises/[expertise]` l'était déjà.

- **Pourquoi** : une page servie depuis le cache = **0 requête Sanity**, quel que soit le trafic ;
  la fraîcheur vient du webhook. Avant, 3 pages dynamiques faisaient une sonde « sync-tags » **par
  requête** (coût qui scale avec le trafic).
- **Gotcha** : `generateStaticParams` s'exécute au build **sans contexte requête** → il doit passer
  `perspective: "published"` + `stega: false` à `sanityFetch`, sinon `defineLive` appelle `draftMode()`
  qui **lève une erreur** dans `generateStaticParams`. Le **rendu de page**, lui, peut appeler
  `draftMode()` (autorisé — c'est ce que fait déjà `/expertises/[expertise]`).

### 4. `<SanityLive />` reste **gaté draft-only**

Déjà le cas (`layout.tsx`, bloc `isDraftMode`) : un visiteur public **n'ouvre aucune** connexion
temps réel (aucun coût Live Content API lié au trafic). La fraîcheur publique repose entièrement sur
le webhook côté serveur, indépendant des clients connectés.

## Conséquences

- Une modif publiée en prod apparaît **sans redéploiement**, dès la requête suivante (webhook →
  `expire:0`), sur singletons **et** collections (réalisations). Vérifié end-to-end (post-mortem 0019).
- **Régime en régime permanent** : Sanity n'est lu **qu'au build et au publish** ; le trafic public =
  **0 requête Sanity**. Le volume mensuel reste très en deçà du plan Free, indépendamment du trafic.
- Une réalisation publiée **après** le build est rendue à la demande une fois (`dynamicParams` par
  défaut sur `[slug]`), puis mise en cache ; la liste (statique) se régénère au webhook et l'inclut.
- Un slug d'univers inconnu renvoie **404 immédiat** (ensemble fermé, `dynamicParams=false`), sans fetch.
- **Prérequis opérationnel** : le webhook prod doit être configuré et actif dans manage.sanity.io
  (URL `/api/revalidate`, secret = `REVALIDATION_SECRET`, déclenché à create/update/delete). Le fix
  code ne sert que si le webhook tire réellement.
