# Recherche : Initialisation du projet

**Branche** : `001-project-init` | **Date** : 2026-03-22

## R1 — Gestion des secrets avec git-crypt

**Décision** : Utiliser git-crypt pour chiffrer les fichiers `.env` de manière transparente dans git.

**Mécanisme** :
- git-crypt utilise les filtres smudge/clean natifs de git pour chiffrer/déchiffrer automatiquement
- Sur disque : le fichier est en **clair** (Next.js le lit nativement)
- Dans git : le fichier est **chiffré** (binaire illisible)
- `git diff` fonctionne normalement — pas de faux "modifié"
- Aucune commande manuelle au quotidien — le chiffrement est transparent

**Structure des fichiers** :

| Fichier | Rôle | Dans git ? |
|---------|------|------------|
| `.env.development` | Variables pour le projet Sanity `showcase-dev` | Oui (chiffré par git-crypt) |
| `.gitattributes` | Déclare quels fichiers sont chiffrés par git-crypt | Oui |
| Clé symétrique git-crypt | Clé de déverrouillage | Non (stockée hors projet, ex: `~/.config/git-crypt/estuaire.key`) |

**Intégration npm scripts** : Aucune. Next.js charge `.env.development` nativement en mode dev. Les scripts sont simplement :
```json
{
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start"
}
```

**Protection agent IA** : Règles `permissions.deny` dans `.claude/settings.json` pour bloquer la lecture des fichiers `.env*` par Claude Code.

**Alternatives considérées** :
- dotenvx : nécessite un wrapper dans les scripts npm, cycle encrypt/decrypt complexe avec hooks, fichier "modifié" dans git après déchiffrement — rejeté pour complexité
- SOPS (Mozilla) : plus manuel, nécessite GPG/age — rejeté pour complexité
- Infisical/Doppler : SaaS externe — rejeté car dépendance tiers inutile pour un projet solo

---

## R1b — Déploiement Docker via Coolify

**Décision** : Fournir un Dockerfile multi-stage explicite plutôt que de laisser Coolify auto-détecter via Nixpacks.

**Raisonnement** : Un Dockerfile explicite garantit un contrôle total sur le build (version Node, étapes de cache, taille de l'image) et évite les surprises d'auto-détection. C'est un fichier qu'on écrit une fois et qu'on modifie rarement.

**Pattern** : Dockerfile multi-stage basé sur le modèle officiel Next.js (`vercel/next.js/examples/with-docker`) :
1. **Stage `deps`** : installe les `node_modules`
2. **Stage `builder`** : exécute `next build`, produit la sortie `standalone`
3. **Stage `runner`** : copie uniquement `.next/standalone`, `.next/static` et `public`, lance `node server.js` en tant qu'utilisateur non-root

**Variables de prod** : Coolify injecte les variables d'environnement dans le conteneur au runtime via son UI. Pas de fichier `.env.production`, pas de git-crypt côté prod.

**Alternatives considérées** :
- Nixpacks (auto-détection Coolify) : moins de contrôle, risque de surprises au premier déploiement — rejeté

---

## R2 — Next.js 15 + Sanity Studio embarqué

**Décision** : Setup manuel Next.js 15 + `next-sanity` avec Studio embarqué à `/studio`.

**Packages nécessaires** :

| Package | Rôle |
|---------|------|
| `next-sanity` | Toolkit Sanity pour Next.js (inclut `sanity` et `styled-components` en dépendances) |
| `@sanity/image-url` | Génération d'URLs pour les images Sanity |
| `@sanity/vision` | Plugin GROQ playground pour le Studio |
| `@portabletext/react` | Rendu du Portable Text (rich text) |

**Route Studio** : `src/app/studio/[[...tool]]/page.tsx` — le segment catch-all `[[...tool]]` capture les sous-routes internes du Studio.

**Configuration Sanity** (`sanity.config.ts` à la racine) :
- Directive `'use client'` obligatoire (chargé côté client par le Studio)
- `basePath: '/studio'` doit correspondre à la route App Router
- Plugins : `structureTool()`, `visionTool()`
- `presentationTool()` non inclus dans cette initialisation (pas de visual editing pour l'instant)

**Configuration Next.js** (`next.config.ts`) :
- `output: 'standalone'` pour le déploiement Docker/Coolify
- `images.remotePatterns` pour `cdn.sanity.io` (pour les futures images)

**Pattern de fetch** : Wrapper `sanityFetch()` manuel avec ISR tags — plus simple que `defineLive` pour un site vitrine sans live preview.

**Contrainte React** : Sanity 5.x nécessite React 19.2+. Next.js 15 inclut React 19, vérifier la sous-version exacte à l'installation.

**Alternatives considérées** :
- Template `sanity-io/sanity-template-nextjs-clean` : trop opinionated, inclurait du code inutile — rejeté
- `defineLive` pour le fetch : orienté live editing/temps réel — overkill pour un site vitrine, rejeté

---

## R3 — Tailwind CSS v4

**Décision** : Tailwind CSS v4 avec configuration CSS-first (pas de `tailwind.config.ts`).

**Changements majeurs vs v3** :
- Moteur réécrit en Rust (Oxide) — builds ~3.5x plus rapides
- Configuration dans le CSS via `@theme` au lieu de `tailwind.config.ts`
- Détection automatique du contenu (plus de tableau `content: [...]`)
- `autoprefixer` et `postcss-import` intégrés (plus besoin de les installer)
- Propriétés CSS custom natives pour toutes les valeurs du thème

**Packages nécessaires** (dev dependencies) :

| Package | Rôle |
|---------|------|
| `tailwindcss` | Framework CSS v4 |
| `@tailwindcss/postcss` | Plugin PostCSS pour v4 (remplace l'ancien plugin) |

**Fichiers de configuration** :
- `postcss.config.mjs` : plugin `@tailwindcss/postcss`
- `src/app/globals.css` : `@import "tailwindcss";` + `@theme { ... }`
- Pas de `tailwind.config.ts` (supprimé)
- Pas d'`autoprefixer` (intégré)

**Syntaxe CSS** :
```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(...);
  --font-sans: "Inter", sans-serif;
}
```

**Compatibilité navigateurs** : Safari 16.4+, Chrome 111+, Firefox 128+ — acceptable pour un site vitrine.

**Breaking changes notables** :
- `shadow-sm` → `shadow-xs`, `shadow` → `shadow-sm`
- `ring` → `ring-3`
- `@layer utilities { ... }` → `@utility my-util { ... }`
- `!flex` → `flex!` (important en suffixe)

**Alternatives considérées** :
- Tailwind v3 : stable mais en maintenance, pas de raison de partir sur une version obsolète pour un nouveau projet — rejeté

---

## R4 — Biome (lint + formatting)

**Décision** : Biome (`@biomejs/biome`) remplace ESLint + Prettier. Un seul outil pour le linting et le formatage.

**Raisonnement** :
- Next.js 15.5 a déprécié `next lint` et propose Biome dans `create-next-app`
- Next.js 16 supprime `next lint` complètement
- `next-forge` (template Vercel) utilise Biome
- Biome v2 inclut un domaine `next` intégré avec 12 règles Next.js spécifiques
- Un seul package au lieu de 3+ (ESLint + Prettier + eslint-config-prettier + eslint-config-next)
- Écrit en Rust, beaucoup plus rapide qu'ESLint

**Configuration** (`biome.json`) :
- Domaine `next: "recommended"` : auto-activé quand `next` est dans `package.json`
- Domaine `react: "recommended"` : règles React hooks + JSX
- Formatter activé avec les options par défaut

**Alternatives considérées** :
- ESLint + Prettier : 3+ packages à configurer, conflits possibles entre plugins, direction dépréciée par Vercel — rejeté pour complexité (Principe IV)
- ESLint seul (sans Prettier) : pas de formatage automatique — rejeté
