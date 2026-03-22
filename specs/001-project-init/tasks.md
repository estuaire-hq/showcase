# Tasks: Initialisation du projet & base de déploiement

**Input**: Design documents from `/specs/001-project-init/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/revalidation-webhook.md, quickstart.md

**Tests**: Non demandés dans la spécification — pas de tâches de test générées.

**Organisation**: Tâches groupées par user story pour permettre l'implémentation et le test indépendant de chaque scénario.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallélisable (fichiers différents, pas de dépendances sur des tâches incomplètes)
- **[Story]**: User story concernée (US1, US2, US3)
- Chemins exacts inclus dans chaque description

---

## Phase 1: Setup (Infrastructure partagée)

**Objectif** : Scaffolding du projet, dépendances et fichiers de configuration

- [x] T001 Initialiser package.json avec les dépendances du projet : next, react, react-dom, next-sanity, @sanity/image-url, @sanity/vision, @portabletext/react (prod) et typescript, @types/react, @types/node, tailwindcss, @tailwindcss/postcss, @biomejs/biome (dev). Configurer les scripts npm : `dev` (`next dev --turbo`), `build` (`next build`), `start` (`next start`), `lint` (`biome check .`), `format` (`biome check --write .`) dans package.json
- [x] T002 [P] Configurer TypeScript strict mode avec path alias `@/` vers `./src/` dans tsconfig.json
- [x] T003 [P] Configurer Next.js avec `output: 'standalone'` et `images.remotePatterns` pour `cdn.sanity.io` dans next.config.ts
- [x] T004 [P] Configurer le plugin PostCSS `@tailwindcss/postcss` dans postcss.config.mjs
- [x] T005 [P] Configurer Biome avec les domaines `next` et `react` en mode `recommended`, formatter activé dans biome.json
- [x] T006 Mettre à jour .gitignore : ignorer tous les fichiers `.env*` sauf `.env.development` (git-crypt) et `.env.example` (documentation). Pattern : `.env*` puis `!.env.development` et `!.env.example`

---

## Phase 2: Fondations (Prérequis bloquants)

**Objectif** : Infrastructure de base nécessaire AVANT toute implémentation de user story

**⚠️ CRITIQUE** : Aucune user story ne peut commencer avant la fin de cette phase

- [x] T007 [P] Créer le fichier CSS global avec import Tailwind v4 (`@import "tailwindcss"`) et bloc `@theme` minimal dans src/app/globals.css
- [x] T008 [P] Créer le fichier de configuration Sanity Studio avec `'use client'`, `basePath: '/studio'`, plugins `structureTool()` et `visionTool()`, schémas importés depuis `@/sanity/schemas` dans sanity.config.ts
- [x] T009 [P] Créer le client Sanity avec `projectId`, `dataset`, `apiVersion`, `useCdn` dans src/lib/sanity/client.ts
- [x] T010 [P] Créer le wrapper `sanityFetch()` avec support ISR cache tags dans src/lib/sanity/sanity-fetch.ts
- [x] T011 [P] Créer le fichier de requêtes GROQ (export vide pour l'instant) dans src/lib/sanity/queries.ts
- [x] T012 [P] Créer l'index des schémas Sanity (tableau vide exporté) dans src/sanity/schemas/index.ts
- [x] T013 Créer le layout racine avec import CSS, metadata de base (title, description), et structure HTML dans src/app/layout.tsx

**Checkpoint** : Le serveur de dev doit démarrer sans erreurs. La fondation est prête.

---

## Phase 3: User Story 1 - Le visiteur voit une page d'accueil provisoire (Priorité : P1) 🎯 MVP

**Objectif** : Livrer une page d'accueil placeholder stylisée et le Dockerfile pour le déploiement

**Test indépendant** : Visiter l'URL racine en local (`localhost:3000`) et en production — la page affiche le nom Estuaire, un message "bientôt disponible", et les bonnes balises meta

### Implémentation

- [x] T014 [US1] Créer la page d'accueil provisoire en Server Component avec le nom Estuaire, message "bientôt disponible", metadata (title, description, Open Graph) dans src/app/(site)/page.tsx
- [x] T015 [P] [US1] Créer la page 404 stylisée cohérente avec l'identité visuelle dans src/app/not-found.tsx
- [x] T016 [US1] Créer le Dockerfile multi-stage (deps → builder → runner) basé sur le pattern officiel Next.js standalone, utilisateur non-root, copie de `.next/standalone`, `.next/static` et `public` dans Dockerfile

**Checkpoint** : La homepage s'affiche en local, `npm run build` produit une sortie standalone, le Dockerfile build avec succès

---

## Phase 4: User Story 2 - L'éditeur de contenu accède à Sanity Studio (Priorité : P2)

**Objectif** : Rendre le Studio Sanity accessible à `/studio` et poser le squelette de revalidation

**Test indépendant** : Naviguer vers `/studio`, se connecter avec des identifiants Sanity, voir le dashboard Studio vide

### Implémentation

- [x] T017 [US2] Créer la route Studio avec composant `NextStudio`, export metadata et viewport depuis `next-sanity/studio`, directive `'use client'` dans src/app/studio/[[...tool]]/page.tsx
- [x] T018 [P] [US2] Créer le squelette de la route API de revalidation : vérification du secret, réponse JSON success/error, corps minimal dans src/app/api/revalidate/route.ts

**Checkpoint** : Le Studio se charge à `/studio`, la connexion Sanity fonctionne, la route `/api/revalidate` répond correctement

---

## Phase 5: User Story 3 - Le développeur lance le projet en local (Priorité : P1)

**Objectif** : Configurer git-crypt, les permissions Claude Code, et documenter les variables d'environnement

**Test indépendant** : Depuis un clone frais, exécuter `git-crypt unlock` puis `npm install && npm run dev` — le serveur démarre avec toutes les variables disponibles

### Implémentation

- [x] T019 [US3] ⚠️ **ACTION MANUELLE (lead dev)** : Initialiser git-crypt (`git-crypt init`), déclarer `.env.development` dans `.gitattributes`, créer `.env.development` avec les vrais secrets Sanity `showcase-dev`, exporter la clé (`git-crypt export-key`), commiter. Procédure détaillée dans quickstart.md section "Premier setup"
- [x] T020 [P] [US3] Créer le fichier `.env.example` documentant toutes les variables attendues avec commentaires explicatifs (publiques et serveur) dans .env.example
- [x] T021 [P] [US3] Configurer les règles `permissions.deny` dans `.claude/settings.json` pour bloquer la lecture des fichiers `.env*` sauf `.env.example`, ET ajouter une interdiction explicite dans CLAUDE.md (section "Do NOT") : toute tentative de lecture de `.env.development` ou de fichiers `.env*` (hors `.env.example`) est strictement interdite
- [x] T022 [US3] Valider que git-crypt fonctionne : vérifier que `.env.development` est en clair localement et chiffré dans git (`git-crypt status`)

**Checkpoint** : Un développeur avec la clé git-crypt peut aller du `git clone` au serveur local fonctionnel en moins de 5 minutes

---

## Phase 6: Polish & vérifications transversales

**Objectif** : Vérifications finales affectant toutes les user stories

- [x] T023 Créer le README.md à la racine du projet (en français, Principe V) : présentation du projet, prérequis (Node, git-crypt), procédure d'installation (clone → git-crypt unlock → npm install → npm run dev), scripts disponibles, structure du projet, gestion des secrets (git-crypt pour dev, Coolify pour prod), lien vers `.env.example` pour les variables attendues
- [x] T024 Exécuter `npm run lint` (Biome check) et corriger toute erreur de lint ou formatage restante
- [x] T025 Valider le flow README.md complet : clone → git-crypt unlock → npm install → npm run dev → homepage + studio fonctionnels
- [x] T026 Vérifier que `npm run build` produit la sortie standalone dans `.next/standalone` et que le Dockerfile build correctement via `docker build .`
- [x] T027 Exécuter un audit Lighthouse sur la homepage locale (`localhost:3000`) et vérifier un score 90+ en performance et SEO (SC-005)

---

## Dépendances & ordre d'exécution

### Dépendances entre phases

- **Setup (Phase 1)** : Pas de dépendances — démarrage immédiat
- **Fondations (Phase 2)** : Dépend de la fin du Setup — **BLOQUE** toutes les user stories
- **US1 - Homepage (Phase 3)** : Dépend de la fin des Fondations
- **US2 - Studio (Phase 4)** : Dépend de la fin des Fondations — peut être parallélisée avec US1
- **US3 - Dev experience (Phase 5)** : T019 (git-crypt init) est une action manuelle du lead dev, indépendante du reste. T022 (validation git-crypt) dépend de T019.
- **Polish (Phase 6)** : Dépend de la fin de toutes les user stories

### Dépendances entre user stories

- **US1 (Homepage)** : Indépendante après les Fondations
- **US2 (Studio)** : Indépendante après les Fondations — parallélisable avec US1
- **US3 (Dev experience)** : T019 (git-crypt) peut être fait à tout moment par le lead dev. T020-T021 sont parallélisables. T022 (validation) dépend de T019.

### Opportunités de parallélisme

- T002, T003, T004, T005 peuvent tourner en parallèle (Phase 1, fichiers différents)
- T007 à T012 peuvent tourner en parallèle (Phase 2, fichiers différents)
- T015 parallélisable avec T014 (Phase 3)
- T018 parallélisable avec T017 (Phase 4)
- T020 et T021 parallélisables (Phase 5, fichiers différents)
- T019 (action manuelle) peut être fait en parallèle de tout le reste
- **US1 et US2 peuvent être implémentées en parallèle** après les Fondations

---

## Exemple parallèle : Phase 2 (Fondations)

```bash
# Lancer tous les fichiers indépendants en parallèle :
Task: T007 "Créer globals.css dans src/app/globals.css"
Task: T008 "Créer sanity.config.ts à la racine"
Task: T009 "Créer client Sanity dans src/lib/sanity/client.ts"
Task: T010 "Créer wrapper sanityFetch dans src/lib/sanity/sanity-fetch.ts"
Task: T011 "Créer queries.ts dans src/lib/sanity/queries.ts"
Task: T012 "Créer index des schémas dans src/sanity/schemas/index.ts"

# Puis le layout qui dépend de globals.css :
Task: T013 "Créer layout racine dans src/app/layout.tsx"
```

---

## Stratégie d'implémentation

### MVP d'abord (US1 uniquement)

1. Compléter Phase 1 : Setup
2. Compléter Phase 2 : Fondations (CRITIQUE — bloque tout)
3. Compléter Phase 3 : US1 - Homepage
4. **STOP et VALIDER** : La homepage s'affiche, le build passe, le Dockerfile fonctionne
5. Déployer sur Coolify pour valider SC-006

### Livraison incrémentale

1. Setup + Fondations → Base technique prête
2. US1 (Homepage) → Déployer (MVP !)
3. US2 (Studio) → Éditeurs peuvent se connecter
4. US3 (Dev experience) → git-crypt configuré, permissions Claude Code, flow validé
5. Polish → Lint clean, quickstart validé, build Docker vérifié

---

## Notes

- [P] = fichiers différents, pas de dépendances
- [Story] = traçabilité vers la user story (US1, US2, US3)
- Chaque user story est testable indépendamment
- Commiter après chaque tâche ou groupe logique
- Pas de tests automatisés demandés dans la spécification
- git-crypt est transparent : pas de commande manuelle au quotidien après le `unlock` initial
