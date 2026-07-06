# Plan d'action SEO off-page — Estuaire

**Date** : 2026-07-05 · **Branche** : `seo-improvements` · **Voir aussi** :
[[decisions/0025-seo-metadata-structured-data-and-off-page]]

Ce document sépare **ce que l'agent a automatisé** (livré dans le PR SEO) de **ce qui reste une
manip humaine pour Pierre**, avec les étapes exactes et le contenu prêt à coller. L'off-page
(autorité, présence, citations) ne se code pas entièrement : la partie « signal envoyé au moteur »
est outillée dans le repo, la partie « présence et liens » demande des actions sur des comptes
tiers (Google, annuaires) que l'agent ne peut pas créer à la place du propriétaire.

---

## A. Fait par l'agent (dans ce PR, déployable tel quel)

| Levier | Ce qui est en place | Fichier |
|---|---|---|
| **Données structurées** | `Organization`+`LocalBusiness` (NAP + geo), `WebSite`, `BreadcrumbList`, `CreativeWork` — testables Rich Results | `src/lib/seo/jsonld.ts`, `src/components/JsonLd.tsx` |
| **Sitemap** | `/sitemap.xml` dynamique (36 URLs : statiques + expertises + univers + réalisations), soumettable à GSC/Bing | `src/app/sitemap.ts` |
| **robots.txt** | `allow /`, `disallow /studio /api /lab`, `Host`, lien `Sitemap` | `src/app/robots.ts` |
| **Canonicals + OG + Twitter** | sur toutes les pages, image OG de secours brandée | `src/lib/seo/metadata.ts`, `src/app/opengraph-image.tsx` |
| **`llms.txt`** | `/llms.txt` : description métier + structure du site pour les crawlers LLM (ChatGPT, Perplexity…) | `public/llms.txt` |

**Rien à faire côté code** pour ces points : ils partent au prochain déploiement.

---

## B. À faire par Pierre (manip humaine — étapes exactes)

### B.1 — Google Search Console / Bing Webmaster Tools — REPORTÉ

**Décision Pierre (2026-07-06) : pas maintenant.** Les comptes webmaster (GSC = tableau de bord
Google : requêtes, indexation, soumission du sitemap ; Bing = idem pour Bing, qui alimente aussi
ChatGPT Search) sont gratuits et utiles pour monitorer + accélérer l'indexation, mais non
prioritaires pour l'instant. Le hook de vérification par balise `<meta>` a été **retiré du code**
(pas de code mort). Le jour où on active : soit la **validation DNS TXT** dans Cloudflare (aucun
code requis), soit re-câbler un `<meta>` de vérification en 2 min. Puis soumettre `sitemap.xml`.

### B.2 — Google Business Profile / fiche établissement (LEVIER LOCAL FORT) — 30 min

MOSAIQUE PRODUCTION a une adresse physique unique (atelier) → une fiche GBP est le levier local le
plus rentable (pack local, Google Maps, panneau de connaissance). **L'agent ne peut pas la créer**
(compte Google + validation par courrier/téléphone du propriétaire). Contenu **prêt à coller** :

- **Créer / revendiquer** : https://business.google.com → « Ajouter votre établissement ».
- **Nom** : `Estuaire` (la marque publique). Mentionner MOSAIQUE PRODUCTION comme entité légale
  ailleurs, pas dans le nom (règle GBP : le nom = celui utilisé dans le monde réel).
- **Adresse** :
  ```
  ZI La Seiglerie 3, 2 rue Henri Giffard
  44270 Machecoul-Saint-Même
  France
  ```
- **Téléphone** : `02 85 52 62 02`
- **Site web** : `https://estuaire.fr`
- **Catégorie principale** (choisir dans la liste GBP, la plus proche) :
  `Fabricant de mobilier` **ou** `Entreprise d'agencement`.
- **Catégories secondaires** (en ajouter 3-5 parmi celles proposées) :
  `Menuiserie`, `Ébéniste`, `Agencement de magasins`, `Bureau d'études`, `Fabricant de PLV /
  présentoirs`.
- **Zone desservie** : France entière (installations multisites) — activer « Je dessers mes
  clients à leur adresse » si l'atelier n'accueille pas de public spontané.
- **Description** (≤ 750 caractères, prête à coller) :
  ```
  Estuaire (MOSAIQUE PRODUCTION) est un agenceur-concepteur qui conçoit et fabrique, dans son
  propre atelier, de l'agencement, du mobilier et des présentoirs sur mesure. Full-service, nous
  accompagnons nos clients de l'analyse du besoin à l'installation multisite, en passant par la
  co-conception et la fabrication : banque et assurance, culture, mode, beauté et soin,
  spiritueux, joaillerie, optique, parfums, retail, bureau, résidentiel et scénographie. Notre
  atelier intégré garantit maîtrise technique, qualité et respect des délais, du concept unique
  à la série, avec un SAV assuré.
  ```
- **Horaires** : **ne pas renseigner** (décision Pierre 2026-07-06). Laisser vide sur GBP ; le
  JSON-LD `LocalBusiness` n'émet pas d'`openingHours`.
- **Photos** : ajouter logo, façade/atelier, 5-10 réalisations (fort impact sur l'engagement GBP).
- **Attributs** : « Sur devis », « Entreprise détenue en France », etc. selon disponibilité.
- Après création : demander la **validation** (courrier/téléphone), puis publier des **posts** GBP
  régulièrement (nouvelles réalisations) — signal de fraîcheur local.

### B.3 — Netlinking / annuaires métier (autorité) — en continu

Objectif : quelques **citations NAP cohérentes** (même nom/adresse/téléphone que la fiche GBP →
renforce le local) + des backlinks thématiques de qualité. Pas de volume, de la pertinence.

- **Annuaires génériques FR fiables** (citations NAP) : Pages Jaunes, Kompass, société.com,
  Cylex. Utiliser **exactement** le même NAP que GBP.
- **Annuaires / réseaux métier** (agencement, PLV, retail design, fabricants) : chambres de
  commerce locales (CCI Nantes / Loire-Atlantique), fédérations du secteur (ex. agencement /
  menuiserie), plateformes B2B design d'espace. Cibler ceux qui donnent un lien réel (dofollow).
- **RP / contenu** : études de cas des réalisations relayées (LinkedIn de l'entreprise + de
  Sébastien Lajoye, presse spécialisée retail/design). Les pages réalisations sont maintenant en
  `CreativeWork` structuré → citables.
- **Partenaires / clients** : demander un lien depuis les sites des clients/architectes avec qui
  Estuaire travaille (« réalisé par Estuaire »), très qualitatif.

### B.4 — Profils sociaux (`sameAs`) — FAIT

LinkedIn entreprise (`https://www.linkedin.com/company/estuaire-agencement/`) ajouté dans
`SAME_AS` (`src/lib/seo/config.ts`) → présent dans le JSON-LD `Organization.sameAs`. Pierre :
pas d'autre profil pour l'instant (2026-07-06). Ajouter d'autres URLs = 1 ligne dans ce fichier.

---

## C. Informations encore à trancher

- **Décision sur le nom GBP** (« Estuaire » recommandé) et l'affichage ou non de l'adresse (atelier
  visitable ou service-area only).

(Horaires : tranché — ne pas mettre. Profils sociaux : tranché — LinkedIn seul, déjà intégré.)

---

## D. Ce que l'agent POURRAIT automatiser en plus (si outillage fourni)

- **Audit mots-clés / concurrence / backlinks via Semrush** : le MCP Semrush est présent dans
  l'environnement mais **gaté derrière un abonnement Semrush payant** (vérifié en live). Arbitrage
  Pierre : pas d'abonnement → non exploité. **Si** Pierre obtient un plan (SEO/Pro+/Advanced) et
  authentifie le MCP (`/mcp` → « claude.ai Semrush »), je peux produire un audit live : mots-clés à
  cibler, positions, profil de backlinks, site audit technique — pour prioriser le contenu et le
  netlinking.
- **Contenu éditorial SEO** (pages/études de cas optimisées sur des requêtes cibles) : une fois les
  mots-clés connus (Semrush ou GSC après quelques semaines de données), je peux rédiger/optimiser.
