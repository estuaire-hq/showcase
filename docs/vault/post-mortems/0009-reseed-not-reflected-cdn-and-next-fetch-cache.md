# 0009 — Un re-seed dev ne se reflète pas : CDN Sanity + fetch-cache Next

- **Date** : 2026-06-17
- **Feature** : `009-sectors-page`
- **Lien** : [[decisions/0015-sectors-page-build-decisions]], [[decisions/0006-schema-derived-types-and-typed-seeds]]

## Symptôme

Après avoir corrigé un visuel de seed (`npm run seed -- sectorsPage --reset`, qui remplace
bien le document — l'API live renvoyait le nouvel asset), la page dev `/univers` continuait à
servir **l'ancienne image**, malgré **plusieurs redémarrages** du serveur dev et une purge de
`.next/cache`.

## Cause racine (deux caches en série)

1. **CDN Sanity** (`useCdn: true` dans `client.ts`) : après une écriture, la réponse de query
   sur `apicdn.sanity.io` met un certain temps à se purger/expirer. Tant qu'elle est périmée,
   un fetch serveur récupère l'**ancien** document.
2. **Fetch-cache persistant de Next** (`.next/cache`, tag `sanity`) : il **survit au
   redémarrage** du serveur. Pire, il se **re-remplit** : un serveur démarré pendant que le
   CDN est encore périmé ré-écrit l'ancienne réponse dans le cache disque, qu'un redémarrage
   ultérieur relit.

Résultat : redémarrer « pour rafraîchir » ne suffit pas, et peut même reverrouiller l'état
périmé.

## Fix / méthode

Après un re-seed dont on veut voir l'effet en dev :

1. **Attendre la propagation CDN** et la confirmer hors-ligne du serveur :
   `curl "https://<projectId>.apicdn.sanity.io/v<api>/data/query/<dataset>?query=…"`
   (comparer à `…api.sanity.io…`, non-CDN). Tant que le CDN diverge, ne rien conclure.
2. **Une fois le CDN frais**, purger le fetch-cache Next **et** relancer dans la foulée :
   `rm -rf .next && SITE_PREVIEW_TOKEN= PORTLESS=0 npm run dev` (en une commande, sinon le
   serveur encore vivant recrée `.next`).
3. Vérifier le hash d'asset réellement servi dans le HTML
   (`curl … | grep -oE '[0-9a-f]{40}-[0-9]+x[0-9]+'`), pas seulement l'aperçu visuel.

## Leçon

Lors d'une revue pixel après re-seed, **vérifier la fraîcheur de la donnée à la source (CDN
vs API live) avant de soupçonner le code**. Deux caches en série (CDN Sanity → fetch-cache
Next sur disque) peuvent faire croire à un bug de rendu alors que le document est correct.
Le `gate` doit aussi être désactivé (`SITE_PREVIEW_TOKEN=`) sinon `/univers` → `/coming-soon`.
