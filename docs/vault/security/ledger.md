# Registre sécurité

Mémoire de la revue de sécurité Estuaire. **Ce fichier est lu au début de chaque passage** de la
skill `estuaire-security-review`, avant toute présentation : un item écarté sciemment ne doit pas
revenir comme s'il était neuf.

Statuts : `ouvert` (présenté, pas encore décidé) · `accepté` (à traiter) · `refusé` (écarté
sciemment, **le motif est obligatoire**) · `corrigé` (avec le commit) · `régressé`.

La colonne **état observé** est ce que le passage suivant compare pour détecter une régression :
un nombre d'avis qui monte, une sévérité qui monte, ou un cran qui descend rouvre l'item même s'il
avait été refusé.

Passages : [[2026-08-01-audit]] · [[2026-09-12-audit]].

| ID | statut | prio | état observé (dernier passage) | vu depuis | décidé le | motif / suite |
|---|---|---|---|---|---|---|
| CODE-ORIGIN-EXPOSURE | **ouvert** | **P1** | **CONFIRMÉ** : `57.128.251.108:443` sert `estuaire.fr` en direct (200, 182 Ko) hors Cloudflare, et accepte un `cf-connecting-ip` forgé | 2026-09-12 | | le limiteur de contact prend `cf-connecting-ip` comme clé (`rateLimit.ts:36`). L'origine étant joignable, un attaquant forge l'en-tête, obtient un seau neuf à chaque tir et **annule le correctif `CODE-CONTACT-ABUSE`**. Vérifié en SSH le 2026-09-12 : écoute sur `0.0.0.0` en 80/443/2727, ports 6001/6002/8000/8080 filtrés depuis l'extérieur. Correctif : restreindre 80/443 aux plages Cloudflare. **Non traité, demande une décision et un accès root sur le VPS** |
| DEP-next | **corrigé** | P1 | **0 avis propre** (2 critiques avant) / cran 2 | 2026-08-01 | 2026-09-12 | `next@16.3.5` (mineure dans `^16`), plancher relevé dans `package.json`. Portée mesurée nulle avant correctif (runtime Linux, `/_next/image` en 404), montée faite parce qu'elle coûte une commande et que l'inapplicabilité tenait à deux faits de configuration |
| DEP-nodemailer | **corrigé** | P1 | **0 avis propre** (4 hauts avant) / cran 2 | 2026-09-12 | 2026-09-12 | `nodemailer@9.1.1` (patch dans `^9` ; `9.1.0` insuffisant, plage `<=9.1.0`). Aucun chemin exploitable démontré avant correctif : 3 avis sur 4 supposent une liste blanche de domaines qu'on n'a pas, le 4e est borné par le plafond email 200 car. et le limiteur. Test d'injection d'en-tête **rejoué sur 9.1.1** : CRLF toujours replié, aucun en-tête forgé |
| DEP-sharp | **corrigé** | P2 | **0 avis propre** (2 hauts avant) / cran 2 réel via `src/lib/nav/luminance.ts` | 2026-08-01 | 2026-09-12 | ⚠️ **le motif de 2026-08-01 était faux** : il disait « pas de chemin de requête » alors que `sharp` est appelé **au rendu serveur** de 3 pages. Ce qui limitait la portée était l'origine des octets (le LQIP généré par Sanity), pas l'absence de chemin. Corrigé en `0.35.4` (mineure 0.x, hors de `^0.34.5`, éditée à la main). **Non-régression vérifiée** : bandes de luminance identiques au bit près sur 5 images entre libvips 8.17.3 et 8.18.6, donc aucune teinte de navbar déplacée |
| CODE-SANITY-DATASET | ouvert | P2 | prod `vbuzs69z/production` : **305 docs anonymes, 0 brouillon** ; dev 287 (inchangé) | 2026-08-01 | | re-confirmé en anonyme le 2026-09-12. Aucune fuite active, brouillons exposés dès qu'il en existera. Dataset privé = plan Growth payant |
| CODE-HEADERS-CSP | ouvert | P2 | pas de CSP (inchangé) | 2026-08-01 | | à mener en report-only d'abord |
| DEP-sanity | ouvert | P2 | 0 avis propre / moderate / cran 3, major **6.13.2** (6.8.0 au passage précédent) | 2026-08-01 | | solde le stock cran 3 et 4, migration Studio. ⚠️ npm propose `sanity@5.14.1` comme « correctif » alors que `5.31.1` est installé : **rétrogradation de 17 mineures**, ne pas appliquer |
| HEALTH-react-leaflet | ouvert | P2 | publication **2024-12-14 (21 mois)**, 1 mainteneur, 2,7 M dl/sem, cran 1 | 2026-08-01 | | aucune CVE connue, risque prospectif. L'écart s'est creusé (8 mois au passage précédent) |
| CODE-HEADERS-BASE | corrigé | P1 | 4 en-têtes servis **par `estuaire.fr`**, `x-powered-by` absent, 301 http→https | 2026-08-01 | 2026-08-01 | `headers()` + `poweredByHeader: false`. **Vérifié en production le 2026-09-12** : Cloudflare n'en filtre aucun. La réserve d'août est levée |
| CODE-CONTACT-ABUSE | corrigé | P1 | 5 envois / 10 min / IP, 429 + `Retry-After` | 2026-08-01 | 2026-08-01 | limiteur applicatif (`src/lib/contact/rateLimit.ts`), décision Pierre. ⚠️ son efficacité réelle dépend de `CODE-ORIGIN-EXPOSURE` |
| CODE-XPOWEREDBY | corrigé | P3 | en-tête retiré (confirmé en prod) | 2026-08-01 | 2026-08-01 | embarqué avec CODE-HEADERS-BASE |
| CODE-WEBHOOK | vérifié | — | échoue **fermé** ; 401 en prod sans signature | 2026-09-12 | | `parseBody` renvoie `null` sans secret, la route rejette sur falsy. À re-vérifier chaque passage |
| CODE-CONTACT-TS | ouvert | P3 | `_ts` fourni par le client, non signé (inchangé) | 2026-08-01 | | le limiteur couvre l'abus, `_ts` n'est plus qu'un filtre de confort |
| CODE-SANITY-STAGING | ouvert | P3 | dataset `staging` du projet prod, `public` et **toujours vide** | 2026-08-02 | | surface ouverte inutilisée : supprimer, ou documenter comme public |
| DEP-tar | ouvert | P3 | 5 avis / critical / cran 4 (inchangé) | 2026-08-01 | | critique **et** hors chemin de requête (CLI Sanity) |
| DEP-undici | ouvert | P3 | **12 avis** / high / cran 4 (7 au passage précédent) | 2026-08-01 | | CLI Sanity |
| DEP-js-yaml | ouvert | P3 | **5 avis** / high / cran 4 (3 au passage précédent) | 2026-08-01 | | CLI Sanity |
| DEP-brace-expansion | ouvert | P3 | **3 avis** / high / cran 4 (2 au passage précédent) | 2026-08-01 | | CLI Sanity |
| DEP-adm-zip | ouvert | P3 | **2 avis** / high / cran 4 (1 au passage précédent) | 2026-08-01 | | CLI Sanity |
| DEP-browserslist | ouvert | P3 | 2 avis / high / cran 4 | 2026-09-12 | | nouveau, CLI Sanity (`@sanity/codegen` > babel) |
| DEP-smol-toml | ouvert | P3 | 1 avis / high / cran 4 | 2026-09-12 | | nouveau, CLI Sanity |
| DEP-ws | ouvert | P3 | 2 avis / high / cran 4 (inchangé) | 2026-08-01 | | CLI Sanity |
| DEP-form-data | ouvert | P3 | 1 avis / high / cran 4 (inchangé) | 2026-08-01 | | CLI Sanity |
| DEP-esbuild | ouvert | P3 | 1 avis / low / cran 4 (inchangé) | 2026-08-01 | | CLI Sanity, exploit Windows uniquement |
| DEP-@sanity/cli | ouvert | P3 | 0 avis propre / high / cran 4 | 2026-08-01 | | hérité, CLI Sanity |
| DEP-@sanity/runtime-cli | ouvert | P3 | 0 avis propre / high / cran 4 | 2026-08-01 | | hérité, CLI Sanity |
| DEP-@vercel/frameworks | ouvert | P3 | 0 avis propre / moderate / cran 4 | 2026-08-01 | | hérité, CLI Sanity |
| DEP-typeid-js | ouvert | P3 | 0 avis propre / moderate / cran 4 | 2026-08-01 | | hérité, CLI Sanity |
| DEP-dompurify | ouvert | P3 | **14 avis** / moderate / cran 3 (13 au passage précédent) | 2026-08-01 | | Studio uniquement, session éditeur requise |
| DEP-nanoid | ouvert | P3 | 3 avis / high / cran 3 | 2026-09-12 | | nouveau, Studio uniquement |
| DEP-linkify-it | ouvert | P3 | 1 avis / high / cran 3 (inchangé) | 2026-08-01 | | Studio uniquement |
| DEP-json-2-csv | ouvert | P3 | 1 avis / moderate / cran 3 (inchangé) | 2026-08-01 | | Studio uniquement |
| DEP-uuid | ouvert | P3 | 1 avis / moderate / cran 3 (inchangé) | 2026-08-01 | | Studio uniquement |
| DEP-@sanity/uuid | ouvert | P3 | 0 avis propre / moderate / cran 3 | 2026-08-01 | | Studio uniquement |
| DEP-styled-components | ouvert | P3 | 0 avis propre / moderate / cran 3 | 2026-08-01 | | Studio uniquement, hérité de postcss |
| DEP-postcss | ouvert | P3 | **4 avis** / high / cran 2 (3 au passage précédent) ; `8.5.28` publiée corrige tout | 2026-08-01 | | outillage de build, ne traite que **notre** CSS. ⚠️ npm propose toujours `next@9.3.3` comme correctif, soit une **rétrogradation** : ne pas appliquer |
| DEP-valibot | ouvert | P3 | 1 avis / moderate / cran 2 (inchangé) | 2026-08-01 | | validation interne visual editing |
| DEP-baseline-browser-mapping | ouvert | P3 | 1 avis / moderate / cran 2 | 2026-09-12 | | nouveau, arrêt de processus sur entrée invalide, au build |
| DEP-@sanity/preview-url-secret | ouvert | P3 | 0 avis propre / moderate / cran 2 | 2026-08-01 | | hérité de @sanity/uuid |
| DEP-next-sanity | ouvert | P3 | 0 avis propre / moderate / cran 2 | 2026-08-01 | | hérité de sanity, suit DEP-sanity |
| HEALTH-@gsap/react | ouvert | P3 | publication **2025-01-15 (20 mois)**, 1 mainteneur, 1 M dl/sem, cran 1 | 2026-09-12 | | nouveau. Même profil que react-leaflet, mais surface minuscule (un hook), réécrivable en quelques lignes |
| LAG-@portabletext/react | ouvert | P3 | 3.2.4 vers **8.0.1** (MAJOR) (7.0.1 au passage précédent) | 2026-08-01 | | aucune portée sécurité identifiée |
| LAG-@sanity/vision | ouvert | P3 | 5.31.1 vers **6.13.2** (MAJOR) | 2026-08-01 | | suit DEP-sanity |
| LAG-typescript | ouvert | P3 | 5.9.3 vers 7.0.2 (MAJOR) | 2026-08-01 | | devDependency |
| LAG-@types/node | ouvert | P3 | **non listé par la sonde au 2026-09-12** | 2026-08-01 | | devDependency, l'écart est sorti du seuil de la sonde |
| CODE-ZOD-DEVDEP | ouvert | — | `zod` en `devDependencies`, importé par `POST /api/contact` | 2026-09-12 | | **hors grille** : défaut de correction, pas de sécurité. Marche via `npm ci` sans `--omit=dev` + tracé standalone. Noté pour ne pas le perdre |
| CODE-ENV-EXAMPLE-DRIFT | ouvert | — | `.env.example:25` documente encore `SITE_PREVIEW_TOKEN` comme gate | 2026-09-12 | | **hors grille** : documentation dérivée, le gate est supprimé (ADR 0007 / 0031) et plus rien ne lit la variable |
