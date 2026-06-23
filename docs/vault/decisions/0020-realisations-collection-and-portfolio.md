# 0020 — Réalisations : premier type *collection* + portfolio filtrable + demock

- **Statut** : accepté (D6/D8 amendés — voir « Mise à jour »)
- **Date** : 2026-06-20 (mise à jour 2026-06-21)
- **Feature** : `012-realisations-portfolio` ([spec](../../../specs/012-realisations-portfolio/spec.md))
- **Contexte** : voir [[0011-static-homepage-realisation-cards]] (mock home à rebrancher),
  [[0005-connected-components-for-global-sanity-content]], [[0006-schema-derived-types-and-typed-seeds]],
  [[0019-dynamic-content-in-sanity-and-mcp-write-access]] (frontière socle/dynamique).

## Mise à jour (2026-06-21) — alignement sur la frontière v1.8.0

Cette feature a d'abord été construite selon l'ancien modèle « tout en seed typé + CI » : 23 études
extraites du pptx (`realisationsContent`) + **188 images dans `seed-assets/realisations/` (432 Mo, LFS)**
+ un seed git enregistré (`realisation.build.ts` / `realisations.seed.ts` / registry). Entre-temps, la
**constitution v1.8.0** ([[0019-dynamic-content-in-sanity-and-mcp-write-access]]) a tracé une **frontière** :
les **collections dynamiques (réalisations)** vivent **directement dans Sanity** (éditeur-first, assets
au CDN Sanity, **jamais** git/LFS ni `seed-assets/`, **non seedées depuis git**).

**Réalignement effectué** (D6/D8 ci-dessous sont donc amendés) :
- Le contenu (25 docs + images) a été **peuplé dans Sanity** : **dev `wje1fhkq`** (seed local) puis
  **prod `vbuzs69z`** (bootstrap **one-shot** via le job CI `seed-sanity.yml`, `only=realisation`,
  `createIfNotExists` — seule voie d'upload d'assets disponible, le MCP n'uploadant pas de fichier local).
- **Retirés de git** : `seed-assets/realisations/` (432 Mo), `realisation.build.ts`,
  `realisations.seed.ts`, l'entrée du registry, et les records `realisationsContent` + leurs types
  (seule la **taxonomie** reste dans `src/content/realisations.ts`).
- **Désormais** : les réalisations sont **éditeur-first** (Studio) ou ajoutées par l'agent via le **MCP
  Sanity** (dev libre / prod sur autorisation explicite — ADR 0019 D4) ; elles ne sont **plus** dans le
  seed CI (qui ne porte que le socle statique borné). Le pptx client reste la source d'extraction si une
  re-population est nécessaire (via MCP).

## Contexte

Les « réalisations » (études de cas) n'existaient que **mockées** (3 cartes en dur sur la home,
1 projet par sous-page d'expertise), pointant vers une route `/realisations` **inexistante**. Cette
feature crée la vraie section : page liste `/realisations` + page détail `/realisations/[slug]`,
alimentées par un nouveau type Sanity, puis rebranche les emplacements mockés.

C'est le **premier type de nature *collection*** du projet (éditeur-créé, cardinalité ouverte) — tout
le reste est singleton (`homePage`, `footer`…) ou multi-instance à cardinalité fixe (`sectorDetail` ×4,
`expertiseSubpage` ×3).

## Décisions

### D1 — `realisation` = collection, pattern `sectorDetail` étendu
Type document multi-instance, identité par `slug`, `_id = realisation-<slug>` (hyphen, **jamais** de
point — [[0010-reseed-not-reflected-cdn-and-next-fetch-cache]] / post-mortem 0010 addendum). Exposé via
`S.documentTypeList("realisation")` (desk), `defaultOrdering` `order desc`. Routes dynamiques ISR sans
`generateStaticParams` (perspective cookie dynamique), comme `univers/[slug]`.

### D2 — `univers` (12) et `expertises` (3) = listes contrôlées (string), pas des références
Les 12 univers (secteurs-clients) et les 3 slugs d'expertise sont des `string` à `options.list`, pas des
`reference`. Rationale : requêtes triviales (`$u == univers`, `$e in expertises`), pas de déréférencement,
pas de couplage d'ordre d'écriture au seed ; une liste contrôlée empêche déjà les fautes. Source unique
des 12 univers : `src/content/realisations.ts` (`UNIVERS`), importée par le **schéma** ET l'UI de filtre.
⚠️ Ces 12 univers du portfolio sont **distincts** des 4 macro-secteurs de `/univers` ([[0016-sectors-page-build-decisions]]) — hors périmètre.

### D3 — `status` (publié / à venir / brouillon) pilote la visibilité
`published` → liste cliquable + détail ; `upcoming` → aperçu grisé non cliquable, **pas** de détail
(→ `notFound`) ; `draft` → invisible partout. `context`/`enjeu` requis **conditionnellement** (publié
uniquement, via `validation.custom`) — sinon structurellement requis, le dry-run `--check` du seed
rejetterait les états volontairement incomplets (Cambacérès, Ibis = upcoming sans contenu).

### D4 — Filtrage + affichage progressif **côté client** (en mémoire)
La page liste (RSC) fait **un** fetch de toutes les réalisations non-brouillon et hydrate
`RealisationsBrowser` (client) : filtres Univers · Expertises · Clients **combinés en ET**, un choix
par dimension, « charger d'autres » (6 + N), états vides (contact / « revenez bientôt »). Perçu
instantané, sans rechargement (SC-004). Filtre initial lu depuis l'URL (`?univers=` / `?expertise=`)
pour les deep-links home & expertises. Évite un state manager (Principe IV).

### D5 — Variante `layout` (fournie / légère)
Champ explicite. **Règle tracée** : *fournie* (intro avec carrousel) quand ≈ ≥ 9 photos exploitables ;
*légère* (intro compacte) sinon. Pré-réglé au seed depuis le nombre de photos, surclassable par l'éditeur.
Seule l'**intro** change entre les deux ; le reste des sections est identique.

### D6 — Modèle d'image : `cover` + `gallery[]` ordonnée
Couverture (carte + featured) + galerie ordonnée (gère 2 → 26 photos). Le builder de seed **énumère les
images depuis le disque** (`seed-assets/realisations/<slug>/`, triées → cover = 1ère) plutôt que de lister
des centaines de chemins à la main — déterministe, supporte les extensions mixtes. Nommage SEO
`estuaire-agencement-<client>-NN.<ext>` ; dossier client source laissé intact.

### D7 — Demock (3 points d'intégration)
- **Home** : 3 cartes = `getLatestRealisations(3)` ; visuels décoratifs = covers suivantes ; 12 boutons
  secteurs → `/realisations?univers=<label>`. `src/content/homeRealisations.ts` **supprimé**.
- **Sous-pages d'expertises** : section « cas study » = `getLatestRealisationForExpertise(slug)`
  (la publiée la plus récente de l'expertise), CTA → `/realisations?expertise=<slug>` ; **repli dégradé
  propre** sur le contenu du doc si aucune.
- `/univers/<secteur>` : **inchangé** (hors périmètre).

### D8 — Contenu : 23 études extraites du pptx client par programme
Les 23 records (`realisationsContent`) sont extraits du pptx client par script (fidélité exacte, pas de
paraphrase : run-level XML → titre de défi = run **gras**, savoir-faire = runs séparés). Univers tiré du
slide-sommaire ; expertises pré-remplies par heuristique (agencement = quasi tous ; mobiliers = objet/
mobilier ; présentoirs = PLV), ajustables dans le Studio. 21 publiées + 2 brouillons + 2 « à venir ».

## Conséquences

- 188 images seedées dans le projet *dev* ; la prod se seede via la CI ([[0006-schema-derived-types-and-typed-seeds]]).
- Nouvelle primitive DS `Carousel` (client, présentationnel) — ajoutée au design system, pas ad hoc (Principe X).
- Événements Umami décidés (Principe VI) : `realisation_card_open`, `realisation_filter`,
  `realisation_load_more`, `realisation_nav`, `realisation_empty_contact`.
- **Revue pixel-perfect non encore effectuée** (`estuaire-pixel-review`) : les pages sont fonctionnelles
  et fidèles en structure aux maquettes (`portfolio` 51:4064, `case-study` 51:4386, `case-study-court`
  53:2745) mais leur fidélité pixel reste **UNVERIFIED** — gate à passer avant clôture (FR-032 / SC-007),
  + passe motion (`estuaire-motion`) et responsive par breakpoint.
- Le récit détail ne distingue pas titre outline/fill (donnée non structurée ainsi) → titre en `fill` ;
  les `infos` (lieu/année/superficie) sont vides au seed (absentes du pptx) → masquées, à compléter au Studio.
