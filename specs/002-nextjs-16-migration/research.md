# Research — Migration Next.js v15 → v16 + Sanity v4 → v5

**Date**: 2026-06-11 · **Sources** : guide officiel Next.js 16, blog/docs Sanity, `npm view`
(versions/peers vérifiés en direct le 2026-06-11).

Toutes les décisions ci-dessous lèvent les inconnues : aucune `NEEDS CLARIFICATION` ne subsiste.

---

## D1 — Versions cibles (épinglage)

**Decision** : monter aux dernières stables, en restant sur Sanity **v5** (pas v6).

| Package | Actuel (range) | Cible | Note |
|---|---|---|---|
| `next` | `^15.3.0` | `^16.2.9` | dernière stable (`latest`) |
| `react` / `react-dom` | `^19.1.0` | `^19.2.7` | requis par Next 16 **et** Sanity v5 |
| `@types/react` | `^19.1.0` | `^19.2.17` | |
| `@types/react-dom` | *(absent)* | `^19.2.3` | **à ajouter** (devDeps) — typage react-dom |
| `sanity` | `^4.22.0` | `^5.31.1` | dernière stable v5 |
| `@sanity/vision` | `^4.22.0` | `^5.31.1` | peer `sanity ^4 || ^5` |
| `next-sanity` | `^11.6.0` | `^13.0.12` | peer `sanity ^5.29 || ^6`, `next ^16`, `@sanity/client ^7.22.1` |
| `@sanity/client` | *(transitif)* | `^7.22.1` | résolu via `next-sanity`/`sanity` — pas de dép directe |
| `@sanity/image-url` | `^1.1.0` | `^2.1.1` | aucun peer ; **vérifier `urlFor`** (cf. D8) |
| `@sanity/locale-fr-fr` | `^1.2.32` | `^1.2.32` | inchangé — peer `sanity ^3||^4||^5||^6` |
| `styled-components` | `^6.1.0` | `^6.1.15`+ | peer Sanity v5 = `^6.1.15` (latest 6.4.2 OK) |
| `@portabletext/react` | `^3.2.0` | inchangé | peer `react ^18.2 || ^19` ✅ |
| `gsap` / `@gsap/react` / `lenis` | inchangés | inchangés | aucun conflit React 19.2 |

**Rationale** : `next-sanity@13` (latest) supporte explicitement `sanity ^5.29 || ^6`, donc
on peut prendre la dernière ligne `next-sanity` **tout en restant en Sanity v5** — pas besoin
de figer `next-sanity@12`. `@sanity/client` n'est pas une dépendance directe (il arrive via
`sanity` + `next-sanity`) : le lockfile le portera en `^7.22.1`.

**Alternatives** : (a) `next-sanity@12` + sanity v5 → ligne plus ancienne, rejeté (13 supporte
v5). (b) Sanity v6 → rejeté : seulement `6.0.0-next` (pré-version `next-major`), non stable.

---

## D2 — Méthode : codemod officiel + ajustements manuels

**Decision** : lancer `npx @next/codemod@canary upgrade latest`, puis compléter à la main.

Le codemod prend en charge : config `turbopack`, `middleware → proxy` (fichier + flags),
retrait des préfixes `unstable_`, retrait de `experimental_ppr`. Les points qu'il ne couvre
pas / à vérifier (D3–D9) sont faits manuellement.

**Rationale** : la migration officielle est outillée et réduit le risque d'oubli. **Verify
Before Acting** : le codemod modifie du code → relire chaque diff avant de committer.

**Alternatives** : tout manuel — rejeté (plus risqué, plus lent). MCP `next-devtools-mcp` —
optionnel, non requis ici.

---

## D3 — `middleware.ts` → `proxy.ts`

**Decision** : renommer `src/middleware.ts` → `src/proxy.ts`, renommer la fonction exportée
`middleware` → `proxy`, **supprimer `runtime: "nodejs"`** du `config` (en proxy, le runtime
est `nodejs` et n'est pas configurable). Conserver le `matcher` et toute la logique du gate.

**Impact code** : le commentaire d'en-tête (« Runs in the Node.js runtime (stable since Next
15.5)… ») est réécrit pour refléter le runtime `proxy`. Le comportement (rewrite placeholder,
lien `/v/<token>`, cookie 30 j, comparaison constant-time) est **strictement préservé**.

**Rationale** : `proxy` est le successeur de `middleware` en v16 ; le edge runtime n'est pas
supporté en proxy, mais le gate tourne déjà en `nodejs` → aucun changement de comportement.

**Vérification** : 4 états du gate (cf. contrats). Risque = exposer/verrouiller le site →
testé en priorité.

---

## D4 — `revalidateTag` à deux arguments

**Decision** : `revalidateTag("sanity")` → `revalidateTag("sanity", "max")` dans
`src/app/api/revalidate/route.ts`.

**Rationale** : en v16, la forme à un argument est dépréciée et lève une **erreur TypeScript**.
Le profil `"max"` donne une sémantique *stale-while-revalidate* : le contenu publié peut être
servi « périmé » un court instant pendant le rafraîchissement — comportement adapté à une
vitrine (vs `updateTag`, réservé aux Server Actions « read-your-writes »).

**Vérification** : la revalidation doit rester **effective de bout en bout** (publier →
webhook → contenu à jour côté site), pas seulement compiler.

**Alternatives** : `updateTag` — rejeté (sémantique Server-Action, pas un webhook). Adopter
Cache Components pour un contrôle fin — hors périmètre.

---

## D5 — Turbopack par défaut (dev + build) & sortie standalone

**Decision** : adopter Turbopack (défaut v16). `package.json` : `dev` perd `--turbopack`
(redondant), `build` reste `next build` (Turbopack implicite).

**Rationale** : aucun `webpack` custom dans le projet (`next.config.ts` n'en déclare pas) →
le build Turbopack devrait réussir et produire `output: standalone`. **Point de vérification
critique** : confirmer que `.next/standalone` est bien généré (le Dockerfile en dépend).

**Repli** : si le build échoue à cause d'une config webpack injectée par un plugin →
`next build --webpack` (documenté), sans bloquer la migration.

**Alternatives** : forcer `--webpack` par défaut — rejeté (on veut les gains Turbopack, et
rien ne l'empêche ici).

---

## D6 — `next.config.ts` : revue v16

**Decision** : revue confirmée **conforme**, a priori **aucune modification**.

État actuel : `output: "standalone"` (OK), `images.remotePatterns` (déjà la forme recommandée,
pas de `images.domains` déprécié), **pas** de `webpack`, **pas** d'`experimental.turbopack`
(rien à remonter au niveau racine), **pas** de PPR, **pas** de `serverRuntimeConfig`/
`publicRuntimeConfig`, **pas** d'`amp`, **pas** d'option `eslint`.

**Rationale** : le projet n'utilise aucune des options renommées/retirées en v16 → la config
passe telle quelle. Confirmation par scan (FR-017).

---

## D7 — Défauts `next/image` v16

**Decision** : ne rien changer par défaut ; **vérifier** le rendu des images Sanity et
n'ajuster la config que si dégradation perçue.

Changements de défauts v16 : `qualities` → `[75]` uniquement, `minimumCacheTTL` → 4 h,
`16` retiré de `imageSizes`, restriction IP locale, `maximumRedirects` → 3.

**Rationale** : le projet ne passe **aucune** prop `quality=` (scan négatif) et sert les
images depuis `cdn.sanity.io` via `remotePatterns` ; la qualité d'image est pilotée côté CDN
par `urlFor`. Les nouveaux défauts (cache 4 h, qualité 75) sont sans impact attendu. Si une
image apparaît dégradée → ajouter `images.qualities`/`imageSizes` explicitement.

---

## D8 — `@sanity/client` v6 → v7 (cache/live) & `@sanity/image-url` v1 → v2

**Decision** : accepter les bumps majeurs transitifs, **vérifier** deux points précis.

1. **`@sanity/client@7`** : le *breaking change* notable est que `token` + `useCdn: true`
   utilise désormais l'API **CDN** (cachée) au lieu de l'API « live ». Notre `client.ts` a
   `useCdn: true` **sans token** ; le token est injecté séparément via
   `defineLive({ serverToken })` (`live.ts`). À **valider** : contenu publié servi via CDN,
   brouillons servis en live via le token — `sanityFetch`, `SanityLive`, `VisualEditing` OK.
   Confirmer aussi l'`apiVersion` (`2026-03-01`) et `stega`.
2. **`@sanity/image-url@2`** : bump majeur d'un pur constructeur d'URL (pas de peer sur
   `sanity`). À **valider** : `urlFor(...)` génère les mêmes URLs `cdn.sanity.io` qu'en v1
   (taille, format, qualité). Repli possible : rester en v1 (compatible Sanity v5) si v2
   change la sortie de façon indésirable.

**Rationale** : ces deux paquets sont les seuls bumps majeurs « cachés » de la montée Sanity
v5. Les isoler et les vérifier explicitement évite une régression silencieuse de la lecture
de contenu / des images.

---

## D9 — Sanity v4 → v5 : pas de breaking d'API Studio + TypeGen

**Decision** : monter Sanity v5 sans toucher schémas / structure desk / seeds ;
**régénérer** les types (`npm run typegen`) et **revalider** les seeds (`seed:check`).

**Rationale** : officiellement, « comme v3→v4, v4→v5 n'apporte aucun *breaking change* à
l'API Studio ; le seul prérequis est React 19.2 ». Schémas (`defineType`), structure, plugins
et locale `fr-FR` fonctionnent à l'identique. Par le **Principe IX**, les types sont **dérivés
par génération** : la montée v5 impose de **régénérer** `src/sanity.types.ts` (extraction du
schéma + génération) et de vérifier que le code consommateur compile, et que `seed:check`
(dry-run, champs required + assets) reste vert.

**Rationale de séquencement** : React 19.2 étant requis par Next 16 **et** Sanity v5, on
l'introduit au palier 1 (Next 16), ce qui rend le palier 2 (Sanity v5) quasi « gratuit ».

---

## D10 — Node, CI, Docker

**Decision** : aucun changement Node requis ; **confirmer** ≥ 20.9 partout.

État : `Dockerfile` `node:22-alpine`, CI `ci.yml` et `seed-sanity.yml` en `node-version: 22`.
Tous ≥ 20.9 (minimum v16) → conformes. Le CI build passe désormais via Turbopack (vérifier
le job `build`). Aucun environnement résiduel en Node 18.

---

## D11 — Lint, scroll, tracking (non-régression)

- **Lint** : Biome reste le linter (`npm run lint` = `biome check`). La suppression de
  `next lint` en v16 est **sans effet** (non utilisé) ; pas de migration ESLint flat config.
- **Scroll** : le site n'utilise pas `scroll-behavior: smooth` en CSS (scan négatif) → le
  changement v16 (non-surcharge de `scroll-behavior`) est sans impact. Vérifier Lenis + GSAP
  sur les transitions inter-pages (refonte navigation v16).
- **Tracking (Principe VI)** : la migration n'ajoute **aucune interaction** → aucun nouvel
  événement Umami. Vérifier que le `<Script>` Umami (layout) charge toujours.
