# Research — Réalisations (portfolio + pages projet)

Phase 0 du plan. Chaque décision résout une inconnue technique ou tranche un choix d'architecture,
avec sa justification et l'alternative écartée. Aucune inconnue ne reste « NEEDS CLARIFICATION ».

Références code lues (patterns à copier) :
`src/sanity/schemas/documents/sectorDetail.ts`, `src/sanity/structure.ts`,
`src/lib/sanity/{queries,sectorDetail,mapImage,live,client}.ts`,
`src/app/(site)/univers/[slug]/page.tsx`, `src/app/(site)/expertises/[expertise]/page.tsx`,
`src/sanity/seed/{define,registry}.ts`, `src/sanity/seed/documents/{sectorDetail.build,expertiseSubpages}.seed.ts`,
`src/design-system/index.ts` + `components/{CaseStudyCard,CaseStudyPanel,Filter,SubFilter}.tsx`,
`src/content/homeRealisations.ts`, `src/app/(site)/page.tsx`, `src/lib/motion/PinnedCaseStudies.tsx`.
Maquettes Figma cachées : `portfolio` (51:4064), `portfolio/case-study` (51:4386, **fournie**),
`portfolio/case-study-court` (53:2745, **légère**) — desktop only.

---

## D1 — `realisation` : premier type *collection* (multi-instance ouvert)

- **Décision** : nouveau `defineType("realisation", type:"document")` enregistré dans
  `schemas/index.ts` et exposé via `S.documentTypeList("realisation")` dans `structure.ts`
  (ajouté à la liste `EXPLICIT` pour ne pas doublonner après le divider). Identité par `slug`,
  `_id = realisation-<slug>`.
- **Rationale** : `sectorDetail` (4 docs) et `expertiseSubpage` (3 docs) sont déjà multi-instance ;
  on **réutilise leur pattern à l'identique**. La nouveauté n'est pas technique mais d'usage : la
  collection est **ouverte** (l'éditeur en crée librement, ~23 au seed et plus ensuite), le slug
  n'est pas tiré d'une liste fixe, la page liste **énumère tout** le type, et il faut une nav
  prev/suiv et des requêtes « N plus récentes ». Le squelette reste identique → Principe IV.
- **Alternative écartée** : un singleton `realisationsPage` contenant un array d'objets `realisation`.
  Rejeté : pas d'URL propre par projet (FR-001/FR-018), array géant ingérable dans le Studio, pas de
  revalidation granulaire.

## D2 — `univers` et `expertises` : listes contrôlées (string), pas des références

- **Décision** : `univers` = `string` avec `options.list` de **12** valeurs contrôlées ;
  `expertises` = `array` de `string` avec `options.list` de **3** valeurs = les slugs des sous-pages
  (`agencement-sur-mesure`, `mobiliers-sur-mesure`, `presentoirs-sur-mesure`). Les 12 valeurs
  d'univers vivent **une seule fois** dans `src/content/realisations.ts` (`UNIVERS`) et sont
  importées par le schéma **et** l'UI de filtre (source unique).
- **Rationale** : les requêtes de filtre/demock deviennent triviales (`$u == univers`,
  `$e in expertises`) — pas de `->` déréférencement, pas de couplage d'ordre d'écriture au seed
  (les réf. exigeraient que les 3 `expertiseSubpage` soient écrites avant). Une liste contrôlée
  empêche déjà les fautes de frappe. Symétrique entre univers (sans documents support) et expertises.
  Principe IV.
- **Alternative écartée** : `reference` vers `expertiseSubpage`. Rejeté : intégrité référentielle
  superflue (les 3 slugs sont stables = des URLs), surcoût de déréf. dans **chaque** query, couplage
  d'écriture. La note mémoire « références aux 3 expertises » est révisée ici en connaissance du code.
- **Note** : les 12 univers du **portfolio** restent distincts des 4 macro-secteurs de `/univers`
  (hors périmètre, FR-026). Renommer l'onglet « Univers » → « Secteurs » est laissé au design (non
  bloquant, Assumptions du spec).

## D3 — `status` et règles de visibilité

- **Décision** : champ `status` = `"published" | "upcoming" | "draft"` (publié | à venir | brouillon),
  `initialValue: "draft"`, liste radio.
  - **published** → dans la grille (cliquable) + page détail + éligible « plus récentes »/demock.
  - **upcoming** → aperçu **grisé non cliquable** dans la grille, **pas** de page détail (→ `notFound`),
    **exclu** des « plus récentes »/demock.
  - **draft** → **absent** de tout affichage public.
- **Rationale** : encode FR-017 / FR-022 / US4. La grille récupère `status in ["published","upcoming"]` ;
  toutes les autres surfaces (Dernières Réalisations, home, expertises, détail, prev/suiv) filtrent
  `status == "published"`. Le grisé/non-clic est piloté par l'UI selon `status`.
- **Alternative écartée** : un simple booléen `published`. Rejeté : impossible d'exprimer l'état « à
  venir » (annoncé mais sans contenu) demandé par le client (Cambaceres, Ibis).

## D4 — Filtrage + affichage progressif : **client-side en mémoire**

- **Décision** : la page liste (RSC) fait **un seul** `sanityFetch` de toutes les réalisations
  non-brouillon (projection légère : slug, title, client, univers, expertises, status, order, cover,
  meta) et hydrate un composant client `RealisationsBrowser` qui : filtre en mémoire (Univers ·
  Expertises · Clients), révèle progressivement (6 + « charger d'autres »), gère les états vides, et
  **initialise son filtre actif depuis l'URL** (`?univers=` / `?expertise=` pour les deep-links home
  & expertises).
- **Rationale** : ~23 items → coût mémoire négligeable ; satisfait SC-004 (« perçu comme instantané,
  sans rechargement de page ») sans round-trip serveur par filtre ni state global (Principe IV).
  Les filtres se **combinent entre dimensions** (univers ET expertise ET client) ; **un seul** choix
  par dimension ; chaque dimension réinitialisable (« tous »).
- **Alternative écartée** : filtrage par requête serveur (param d'URL → refetch). Rejeté : latence
  perçue, rechargement, complexité de cache ; inutile à cette échelle.
- **Composants** : `Filter` (onglets 122px) + `SubFilter` (puces 61px) **existent déjà** dans le DS
  (kit « btn filtres » / « btn sous-filtre ») → réutilisés tels quels. La grille réutilise
  `CaseStudyCard` (1920×718, image + title + meta) — à confirmer contre la maquette `portfolio`
  (peut nécessiter une variante ratio/2-colonnes).

## D5 — Variante d'affichage `layout` : « fournie » vs « légère »

- **Décision** : champ explicite `layout` = `"fournie" | "legere"`, éditable, `initialValue`
  calculé au seed depuis le nombre de photos.
  **Règle tracée** : *fournie* quand la réalisation a assez de photos pour remplir la composition
  standard **et** alimenter le carrousel d'intro (**≈ ≥ 9 photos exploitables**) ; *légère* sinon.
- **Rationale** : encode FR-006 / FR-020 / SC-008 et la décision déléguée à Claude (mémoire). Seed
  pré-réglé, surclassable par l'éditeur. Différence de layout limitée à l'**intro** (carrousel ou
  non) ; le reste des sections est identique (FR-020).
- **Alternative écartée** : déduire la variante du `count(gallery)` à l'exécution. Rejeté : retire le
  contrôle éditorial (un éditeur doit pouvoir forcer « légère » même avec beaucoup de photos).

## D6 — Modèle d'image : `cover` + `gallery[]` ordonnée (2 → 26)

- **Décision** : `cover` (image principale, requise) + `gallery` (array d'images ordonné). Le template
  détail **remplit les emplacements composés** de la maquette dans l'ordre du `gallery` ; en version
  *fournie* le surplus alimente le **carrousel d'intro**. `cover` sert la carte liste + les featured
  home/expertises. Repli neutre si une image manque (jamais d'image cassée — `mapImage` renvoie
  `undefined`, le slot devient un no-op).
- **Rationale** : encode FR-007 ; gère 2→26 photos sans champ par emplacement (fragile). Le binding
  slot↔image est finalisé **au build** contre la maquette (estuaire-pixel-perfect).
- **Alternative écartée** : un champ image par emplacement nommé (introMain, mission1…). Rejeté : ne
  s'adapte pas au nombre variable de photos (2 vs 26) ni au carrousel.

## D7 — Récit structuré

- **Décision** : champs du document —
  `context` (text), `enjeu` (text), `interventions` (array<string> — « nos missions »),
  `challenges` (array d'objet `{ title, body }`, `validation.max(3)` — 1 à 3 défis),
  `skills` (array<string> — pastilles savoir-faire & engagements),
  `photoCredit` (string, **optionnel**), `location` / `year` / `area` (string, **optionnels**).
- **Rationale** : encode FR-004 / FR-005. Le **crédit photo** est rendu **entre** le dernier défi et
  les savoir-faire (FR-019), masqué si absent (FR-006/edge case). Les infos complémentaires sont
  masquées si vides (FR-004 — l'UI ne rend que ce qui est renseigné, comme `CaseStudyCard.meta`).
- **Alternative écartée** : Portable Text pour le récit. Rejeté : surdimensionné (texte simple,
  pas de rich-text imbriqué dans la maquette) — Principe IV. Des `text` multi-lignes (`whitespace-
  pre-line`, idiome déjà utilisé partout) suffisent.

## D8 — Navigation précédent / suivant

- **Décision** : nav entre réalisations **publiées**, ordonnées par récence (`order` desc, voir D12).
  **Bornée** (pas de boucle) : sur la première, pas de lien « précédent » ; sur la dernière, pas de
  « suivant » — l'élément manquant est masqué. Les liens sont des `<Link>` calculés côté serveur
  depuis la liste ordonnée des slugs.
- **Rationale** : encode FR-021 + edge case « première/dernière sans lien cassé » par le choix le plus
  simple et sans surprise. RSC (pas de JS).
- **Alternative écartée** : boucle (wrap). Acceptable mais moins lisible (revenir au début depuis la
  fin surprend) ; bornes retenues.

## D9 — Nouvelle primitive DS : `Carousel` (client)

- **Décision** : ajouter `src/design-system/components/Carousel.tsx` (`"use client"`) — grande visuelle
  + navigation précédent/suivant via le `CarouselArrow` **déjà existant**. Présentationnel (reçoit
  `images: ResolvedImage[]` en props, gère son index en interne), honore `prefers-reduced-motion`
  (pas d'autoplay agressif). Exporté depuis `@/design-system`.
- **Rationale** : aucun `Carousel` n'existe (l'index n'exporte que `CarouselArrow`). Principe X : on
  **ajoute la primitive au DS** (acte délibéré), on ne la duplique pas dans la route.
- **Alternative écartée** : une lib de carrousel (embla/swiper). Évaluée mais rejetée par défaut : le
  besoin (grande image + 2 flèches) est trivial et déjà outillé (`CarouselArrow`) — Principe IV. À
  reconsidérer seulement si le swipe tactile/lazy s'avère non trivial au build (à tracer alors via la
  règle « Dependencies » du CLAUDE.md).

## D10 — Demock home

- **Décision** : dans `src/app/(site)/page.tsx` (+ son connecteur) —
  1. les **3 cartes** (`homeRealisationCards` → `PinnedCaseStudies`) ← les **3 réalisations publiées
     les plus récentes** (cover/title/meta), chaque panneau pointant vers `/realisations/<slug>` ;
  2. les **12 boutons secteurs** (`homeRealisationSectors`) ← href `/realisations?univers=<slug>`
     (au lieu du `REALISATIONS_HREF` plat), libellés depuis `UNIVERS` (source unique) ;
  3. les **2 images décoratives** (`feature`/`wide`, en-tête de section) ← covers de réalisations
     récentes du CMS (suppression totale de `public/home/realisations/`), pour honorer SC-005
     pleinement.
  → `src/content/homeRealisations.ts` est **supprimé**.
- **Rationale** : encode FR-023 / SC-005 (« plus aucune réalisation en dur »). Le fetch des dernières
  réalisations est ajouté au connecteur home (`getHomePageProps` ou un helper `getLatestRealisations(3)`).
- **Alternative écartée** : garder `feature`/`wide` en illustration statique. Plus simple mais laisse
  des photos de réalisation en dur → tension avec SC-005 ; on les rebranche aussi. (Si le rendu visuel
  l'exige, repli documenté possible au build.)

## D11 — Demock sous-pages d'expertises

- **Décision** : la section « cas study » (06/) de chaque sous-page met en avant **la réalisation
  publiée la plus récente taguée de cette expertise** : `cover`→image, `title`→projectTitle,
  `location/year/area`→meta, CTA→`/realisations?expertise=<slug>`. Le **titre de section**
  (`caseStudyTitleOutline/Fill`) reste piloté par le doc `expertiseSubpage`.
  **Repli dégradé propre** (FR-024 sc.4) : si aucune réalisation pour l'expertise, on conserve les
  `caseStudy*` statiques actuels du doc + CTA `/realisations` (pas de lien cassé, pas de bloc vide).
- **Rationale** : encode FR-024 / SC-005. Sélection **auto par récence** (pas de flag manuel —
  cohérent avec la home, décision Pierre). Ajout d'une query `EXPERTISE_LATEST_REALISATION_QUERY($expertise)`
  consommée par le connecteur `getExpertiseSubpageProps` (ou la page).
- **Alternative écartée** : sélection manuelle d'un projet featured par expertise. Hors périmètre
  (Out of Scope du spec).

## D12 — Routes, rendu et ordonnancement « plus récent »

- **Décision** : `/realisations` (liste) et `/realisations/[slug]` (détail) = RSC connecteurs,
  **ISR via `sanityFetch`** (cache tags revalidés par webhook), **sans `generateStaticParams`**
  (perspective cookie = dynamique), exactement comme `univers/[slug]`. `notFound()` si slug absent ou
  non publié. Ordonnancement « plus récent » via un champ **`order`** (number) +/ou `publishedAt`
  (datetime) ; tri `order desc` (ou `publishedAt desc`). `generateMetadata` par slug (SEO).
- **Rationale** : aligne le rendu sur le reste du site (Principe I) ; la revalidation reflète les
  édits sans rebuild. Le champ d'ordre couvre « 3 sur l'accueil / 3 Dernières / 1 par expertise »
  sans sélection manuelle (Assumptions du spec).
- **Alternative écartée** : SSG via `generateStaticParams` + slugs query. Rejeté : `sanityFetch` lit
  le cookie de perspective → prerender build-time impossible/inutile ici (cf. commentaire de
  `univers/[slug]/page.tsx`).

## D13 — Intégration & nommage SEO des images

- **Décision** : images sources copiées (dossier client **laissé intact**) dans
  `seed-assets/realisations/<slug>/` (committé, hors `public/`, exclu du build Docker via
  `.dockerignore` — ADR 0006), renommées `estuaire-agencement-<client>-<n>.<ext>`. Le runner uploade
  et le **filename SEO devient celui de l'asset Sanity**.
- **Rationale** : encode FR-030. C'est à l'intégration dans `seed-assets/` que le nom SEO compte.
- **Note NVH** : publié avec ses `.avif` basse définition existantes (FR / Assumptions) —
  remplaçables plus tard sans changement de code.

## D14 — Tracking Umami (Principe VI — décision explicite)

- **Décision — événements à tracer** (sans PII : noms/valeurs = slugs/labels de taxonomie, pas de
  données perso) :
  - `realisation_card_open` (prop : `slug`) — ouverture d'une fiche depuis la liste ;
  - `realisation_filter` (props : `dimension` ∈ {univers,expertise,client}, `value`) — sélection de filtre ;
  - `realisation_load_more` (prop : `shown`) — « charger d'autres réalisations » ;
  - `realisation_nav` (props : `direction` ∈ {prev,next}, `from`) — navigation prev/suiv en détail ;
  - `realisation_empty_contact` — clic « contactez-nous » depuis l'état vide.
  - Conservés : `home_realisation_click`, `home_sector_click` (home), `case_study_click` (expertises).
- **Décision — NON tracé (choix documenté)** : survols de carte, défilement du carrousel d'intro
  (engagement micro, bruit > signal).
- **Rationale** : ces événements mesurent l'engagement portfolio (ce qui est ouvert, filtré, ce qui
  mène au contact). Implémentés via `data-umami-event*` (idiome existant `umamiAttrs`).

---

## Synthèse des points à vérifier au build (pixel-perfect)

1. La carte de grille du `portfolio` correspond-elle exactement à `CaseStudyCard`, ou faut-il une
   variante (ratio 2-colonnes, méta) ? → lire 51:4064.
2. Composition d'images de l'intro **fournie** (carrousel) vs **légère** (compacte) → 51:4386 / 53:2745.
3. Emplacements composés des sections missions / défis (ratios des images) → 51:4386.
4. Barre de filtres : disposition des 3 onglets + ouverture des sous-filtres → 51:4064.
5. Bandeau « Dernières Réalisations » (3 plus récentes en full-width) → 51:4064.
6. Bloc logos clients (présent dans la maquette liste) — confirmer s'il est en périmètre ou décoratif.
