# 0010 — Un re-seed dev ne se reflète pas : CDN Sanity + fetch-cache Next

- **Date** : 2026-06-17
- **Feature** : `009-sectors-page`
- **Lien** : [[decisions/0016-sectors-page-build-decisions]], [[decisions/0006-schema-derived-types-and-typed-seeds]]

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

## Addendum (2026-06-19, feature `010-expertise-subpages`) — premier seed d'un type NEUF

Variante observée en seedant un **tout nouveau type de document** (`expertiseSubpage`, jamais
présent dans le dataset auparavant) : après `npm run seed`, le document est **invisible aux
lectures NON authentifiées** (chemin **public**, qu'utilise `sanityFetch` via `useCdn:true`),
y compris sur `api.sanity.io` (pas seulement le CDN), et ce pendant un temps **notablement long**
(≫ les ~60 s habituels du CDN). Symptôme trompeur : `count(*[_type=="expertiseSubpage"])` = **0**
sans token, alors que le doc **existe bien** (publié, non-draft).

Diagnostic clé — **distinguer « pas créé » de « pas encore propagé en public »** :

- Lecture **authentifiée** (token de lecture/écriture) : `count(...)` = **1**, `getDocument(id)`
  renvoie le doc avec ses assets → le seed a **réussi**.
- Lecture **non authentifiée** (`api`/`apicdn`, perspective `published`) : **0** tant que le
  chemin public n'a pas indexé le nouveau type.
- `aclMode` du dataset = `public` (vérifiable via
  `GET api.sanity.io/v<api>/projects/<id>/datasets` avec le token) → **aucune** allowlist de types
  en cause ; c'est bien de la **propagation/indexation du chemin de lecture public** pour un type
  jusque-là inexistant. Un **type frère** créé plus tôt le même jour (`sectorDetail`, feature 011)
  était, lui, déjà visible en public → la différence est le **temps écoulé**, pas la config.

Conséquence : l'app (qui lit en `published`/CDN) rend la page avec ses **repli texte maquette**
mais **sans les images** (les visuels ne viennent que de Sanity) tant que la propagation publique
n'a pas eu lieu — ce n'est PAS un bug de code (build/lint/typegen au vert, Studio + lectures
authentifiées OK).

**Méthode** : avant de conclure « le seed a échoué » ou « la page est cassée », faire une lecture
**authentifiée** (token) / ouvrir le **Studio**. Puis attendre la propagation publique (re-`curl`
`api`+`apicdn` non authentifiés jusqu'à obtenir le doc), et **alors seulement** purger + relancer
en une commande (`rm -rf .next && SITE_PREVIEW_TOKEN= npm run dev`) pour la revue pixel. Option de
contournement si l'attente est inacceptable (revue immédiate) : faire lire l'app en **authentifié**
(client `useCdn:false` + `token` de lecture, ou `serverToken` réellement appliqué à la query) —
décision d'infra hors périmètre d'une feature de page, à ne pas changer à la légère.
