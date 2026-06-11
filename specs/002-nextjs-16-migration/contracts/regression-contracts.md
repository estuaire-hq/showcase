# Regression Contracts — invariants à préserver

> Pour une migration, les « contrats » ne sont pas de nouvelles interfaces mais les
> **comportements observables qui DOIVENT rester identiques** après la montée. Chacun est
> testable et tracé à un critère de succès (SC) / une exigence (FR).

---

## C1 — Webhook de revalidation `POST /api/revalidate`  (FR-004, SC-005, Principe I)

**Entrée** : requête POST signée par Sanity (`REVALIDATION_SECRET`), corps `{ _type?, _id? }`.

**Contrat** (inchangé en surface) :
| Cas | Réponse attendue |
|---|---|
| Signature invalide | `401 { message: "Invalid signature" }` |
| Corps manquant | `400 { message: "Missing request body" }` |
| Signature valide | `200 { revalidated: true, type, id, now }` **et** caches Sanity invalidés |
| Erreur interne | `500 { message: "Error revalidating" }` |

**Changement interne autorisé** : `revalidateTag("sanity")` → `revalidateTag("sanity", "max")`.
**À vérifier** : publier un document → recevoir le webhook → la valeur publiée apparaît côté
site (revalidation effective, pas seulement compilation).

---

## C2 — Gate « coming soon » (`proxy`)  (FR-003, SC-002)

**Contrat des 4 états** (strictement identique à la v15) :
| État | Condition | Comportement attendu |
|---|---|---|
| Désactivé | `SITE_PREVIEW_TOKEN` absent | site **ouvert** (gate no-op) |
| Verrouillé | token défini, pas de cookie valide | **placeholder** (rewrite vers `/coming-soon`, URL préservée) |
| Déverrouillage | visite `/v/<token>` valide | pose cookie `estuaire_preview` (30 j, httpOnly, sameSite lax), **redirige** vers `/` |
| Déverrouillé | cookie valide présent | site **réel** accessible |
| Mauvais token | `/v/<wrong>` | **placeholder** (ne jamais confirmer l'existence du chemin) |

**Invariants** : comparaison constant-time (SHA-256 + `timingSafeEqual`) ; `matcher`
inchangé (exclut `api`, `studio`, `coming-soon`, `_next/*`, métadonnées) ; runtime `nodejs`.
**Changement autorisé** : fichier `middleware.ts`→`proxy.ts`, fonction `middleware`→`proxy`,
retrait de `runtime: "nodejs"` du `config`.

---

## C3 — Draft mode / Visual Editing / SanityLive  (FR-011, SC-005)

**Contrat** : en draft mode activé, `layout.tsx` rend `<SanityLive />` + `<VisualEditing />` ;
l'aperçu se met à jour en direct ; le contenu publié (hors draft) est servi via le CDN.

**À vérifier sous `@sanity/client@7` / `next-sanity@13`** : la stratégie cache/live
(`useCdn: true` + `serverToken` via `defineLive`) sert la bonne source — publié = CDN caché,
brouillon = live via token (cf. research § D8).

---

## C4 — Studio embarqué `/studio`  (FR-010, SC-003)

**Contrat** : `/studio` monte le Studio Sanity ; auth, navigation desk (structure custom),
édition, plugin Vision et locale `fr-FR` fonctionnent. `export const dynamic = "force-static"`
de la route conservé.
**Changement de fond** : Studio v4 → v5 (mêmes schémas/structure, aucun *breaking* d'API).

---

## C5 — TypeGen & seeds  (FR-012, SC-004, Principe IX)

**Contrat** : `npm run typegen` régénère `src/sanity.types.ts` ; `next build` (typecheck)
reste vert avec les types régénérés ; `npm run seed:check` reste vert (dry-run, champs
required + assets). Aucun type de contenu tapé à la main introduit.

---

## C6 — Sitemap & robots  (FR-013)

**Contrat** : `src/app/sitemap.ts` (statique, pas de `generateSitemaps`) et `src/app/robots.ts`
(`force-dynamic`, keyé sur `SITE_PREVIEW_TOKEN` pour le noindex) génèrent la même sortie qu'en
v15. Le changement v16 « `id` asynchrone pour `generateSitemaps` » ne s'applique pas (non utilisé).

---

## C7 — Build standalone & Docker  (FR-006, SC-007)

**Contrat** : `next build` (Turbopack) produit `.next/standalone` + `.next/static` ; le
Dockerfile (multi-stage, `node:22-alpine`, `CMD ["node","server.js"]`) construit une image qui
démarre et sert le site sur `:3000`. **Repli documenté** : `next build --webpack` si échec dû
à une config webpack implicite.

---

## C8 — Parité visuelle & animations  (FR-014, SC-001, SC-009, Principe VII)

**Contrat** : rendu **identique** page à page (intrinsèque) à la v15 ; scroll fluide Lenis +
reveals GSAP fonctionnent, y compris sur les transitions inter-pages (refonte navigation v16) ;
`prefers-reduced-motion` respecté ; aucune erreur console / hydratation.
