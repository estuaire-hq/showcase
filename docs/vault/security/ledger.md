# Registre sécurité

Mémoire de la revue de sécurité Estuaire. **Ce fichier est lu au début de chaque passage** de la
skill `estuaire-security-review`, avant toute présentation : un item écarté sciemment ne doit pas
revenir comme s'il était neuf.

Statuts : `ouvert` (présenté, pas encore décidé) · `accepté` (à traiter) · `refusé` (écarté
sciemment, **le motif est obligatoire**) · `corrigé` (avec le commit) · `régressé`.

La colonne **état observé** est ce que le passage suivant compare pour détecter une régression :
un nombre d'avis qui monte, une sévérité qui monte, ou un cran qui descend rouvre l'item même s'il
avait été refusé.

Passages : [[2026-08-01-audit]].

| ID | statut | prio | état observé (dernier passage) | vu depuis | décidé le | motif / suite |
|---|---|---|---|---|---|---|
| CODE-HEADERS-BASE | corrigé | P1 | 4 en-têtes servis, `x-powered-by` retiré | 2026-08-01 | 2026-08-01 | `headers()` + `poweredByHeader: false` dans `next.config.ts`, vérifié au curl en dev. **À re-vérifier sur estuaire.fr après déploiement.** |
| CODE-CONTACT-ABUSE | corrigé | P1 | 5 envois / 10 min / IP, 429 + `Retry-After` | 2026-08-01 | 2026-08-01 | limiteur **applicatif** (`src/lib/contact/rateLimit.ts`), décision Pierre : un limiteur qu'on contrôle dans tous les cas, indépendamment de Cloudflare. Vérifié en dev (5 passent, 6e en 429). |
| CODE-CONTACT-TS | ouvert | P3 | `_ts` fourni par le client, non signé | 2026-08-01 | | issu de CODE-CONTACT-ABUSE, laissé de côté : le limiteur couvre l'abus, `_ts` n'est plus qu'un filtre de confort |
| DEP-next | corrigé | P1 | **0 avis propre** (était 9) / cran 2 | 2026-08-01 | 2026-08-01 | `next@16.2.12`, bump de patch non cassant. `postcss` et `sharp` restent en P3, suivis séparément. |
| CODE-XPOWEREDBY | corrigé | P3 | en-tête retiré | 2026-08-01 | 2026-08-01 | embarqué avec CODE-HEADERS-BASE |
| CODE-HEADERS-CSP | ouvert | P2 | pas de CSP | 2026-08-01 | | à mener en report-only d'abord |
| CODE-SANITY-DATASET | ouvert | P2 | dev + **prod** `aclMode: public` ; prod `production` = 305 docs anonymes, 0 brouillon | 2026-08-01 | | confirmé en prod le 2026-08-02. Aucune fuite active, mais brouillons exposés dès qu'il en existe. Dataset privé = plan Growth payant |
| CODE-SANITY-STAGING | ouvert | P3 | dataset `staging` sur le projet prod, `public` et **vide** | 2026-08-02 | | surface ouverte inutilisée : supprimer, ou documenter comme public avant que quelqu'un s'en serve |
| DEP-sanity | ouvert | P2 | 0 avis propre / moderate / cran 3, major 6.8.0 | 2026-08-01 | | solde le stock cran 3 et 4, migration Studio |
| HEALTH-react-leaflet | ouvert | P2 | publication 2024-12-14, 1 mainteneur, cran 1 | 2026-08-01 | | aucune CVE connue, risque prospectif |
| DEP-tar | ouvert | P3 | 5 avis / critical / cran 4 | 2026-08-01 | | critique mais hors chemin de requête (CLI Sanity) |
| DEP-undici | ouvert | P3 | 7 avis / high / cran 4 | 2026-08-01 | | CLI Sanity |
| DEP-adm-zip | ouvert | P3 | 1 avis / high / cran 4 | 2026-08-01 | | CLI Sanity |
| DEP-ws | ouvert | P3 | 2 avis / high / cran 4 | 2026-08-01 | | CLI Sanity |
| DEP-js-yaml | ouvert | P3 | 3 avis / high / cran 4 | 2026-08-01 | | CLI Sanity |
| DEP-brace-expansion | ouvert | P3 | 2 avis / high / cran 4 | 2026-08-01 | | CLI Sanity |
| DEP-form-data | ouvert | P3 | 1 avis / high / cran 4 | 2026-08-01 | | CLI Sanity |
| DEP-esbuild | ouvert | P3 | 1 avis / low / cran 4 | 2026-08-01 | | CLI Sanity, exploit Windows uniquement |
| DEP-@sanity/cli | ouvert | P3 | 0 avis propre / high / cran 4 | 2026-08-01 | | hérité, CLI Sanity |
| DEP-@sanity/runtime-cli | ouvert | P3 | 0 avis propre / high / cran 4 | 2026-08-01 | | hérité, CLI Sanity |
| DEP-@vercel/frameworks | ouvert | P3 | 0 avis propre / moderate / cran 4 | 2026-08-01 | | hérité, CLI Sanity |
| DEP-typeid-js | ouvert | P3 | 0 avis propre / moderate / cran 4 | 2026-08-01 | | hérité, CLI Sanity |
| DEP-dompurify | ouvert | P3 | 13 avis / moderate / cran 3 | 2026-08-01 | | Studio uniquement, session éditeur requise |
| DEP-linkify-it | ouvert | P3 | 1 avis / high / cran 3 | 2026-08-01 | | Studio uniquement |
| DEP-json-2-csv | ouvert | P3 | 1 avis / moderate / cran 3 | 2026-08-01 | | Studio uniquement |
| DEP-uuid | ouvert | P3 | 1 avis / moderate / cran 3 | 2026-08-01 | | Studio uniquement |
| DEP-@sanity/uuid | ouvert | P3 | 0 avis propre / moderate / cran 3 | 2026-08-01 | | Studio uniquement |
| DEP-styled-components | ouvert | P3 | 0 avis propre / moderate / cran 3 | 2026-08-01 | | Studio uniquement |
| DEP-sharp | ouvert | P3 | 1 avis / high / cran 2 | 2026-08-01 | | `/_next/image` en 404, pas de chemin de requête. Même piège de rétrogradation que `DEP-postcss` |
| DEP-postcss | ouvert | P3 | 3 avis / high / cran 2 | 2026-08-01 | | outillage de build. ⚠️ depuis le bump next, npm propose `next@9.3.3` comme correctif, soit une **rétrogradation** : ne pas appliquer |
| DEP-valibot | ouvert | P3 | 1 avis / moderate / cran 2 | 2026-08-01 | | validation interne visual editing |
| DEP-@sanity/preview-url-secret | ouvert | P3 | 0 avis propre / moderate / cran 2 | 2026-08-01 | | hérité de @sanity/uuid |
| DEP-next-sanity | ouvert | P3 | 0 avis propre / moderate / cran 2 | 2026-08-01 | | hérité de sanity, suit DEP-sanity |
| LAG-@portabletext/react | ouvert | P3 | 3.2.4 vers 7.0.1 (MAJOR) | 2026-08-01 | | aucune portée sécurité identifiée |
| LAG-@sanity/vision | ouvert | P3 | 5.31.1 vers 6.8.0 (MAJOR) | 2026-08-01 | | suit DEP-sanity |
| LAG-typescript | ouvert | P3 | 5.9.3 vers 7.0.2 (MAJOR) | 2026-08-01 | | devDependency |
| LAG-@types/node | ouvert | P3 | 22.19.15 vers 26.1.2 (MAJOR) | 2026-08-01 | | devDependency |
