# Estuaire

Site vitrine pour Mosaique Production / marque Estuaire. Construit avec Next.js 15, Sanity Cloud et Tailwind CSS v4, deploye via Coolify sur VPS OVH.

## Prerequis

- **Node.js** 20+ (LTS)
- **npm** 10+
- **git-crypt** (`sudo apt install git-crypt` ou `brew install git-crypt`)
- Cle symetrique git-crypt (demander au lead dev)

## Installation

```bash
# 1. Cloner le depot
git clone <repo-url> estuaire
cd estuaire

# 2. Deverrouiller les fichiers chiffres (une seule fois)
git-crypt unlock /chemin/vers/estuaire.key

# 3. Installer les dependances
npm install

# 4. Lancer le serveur de developpement
npm run dev
```

Le serveur demarre sur `http://localhost:3000`. Le Studio Sanity est accessible a `http://localhost:3000/studio`.

## Scripts disponibles

| Commande | Action |
|----------|--------|
| `npm run dev` | Serveur de dev avec Turbopack |
| `npm run build` | Build de production (sortie standalone) |
| `npm run start` | Demarrer le serveur de production |
| `npm run lint` | Verification Biome (lint + format) |
| `npm run format` | Correction automatique Biome |

## Structure du projet

```
src/
  app/                    # Routes App Router
    (site)/               # Pages publiques
    studio/[[...tool]]/   # Sanity Studio embarque
    api/                  # Routes API (revalidation)
  lib/
    sanity/               # Client, fetch wrapper, requetes GROQ
  sanity/
    schemas/              # Schemas Sanity (document & object)
```

## Gestion des secrets

| Environnement | Source des variables | Mecanisme |
|---------------|---------------------|-----------|
| Local (dev) | `.env.development` | git-crypt (clair sur disque, chiffre dans git) |
| Production | UI Coolify | Variables injectees dans le conteneur Docker |

Voir [`.env.example`](.env.example) pour la liste des variables attendues.

## Deploiement

Le push sur `main` declenche un deploiement automatique via Coolify sur le VPS OVH. Le `Dockerfile` multi-stage est fourni a la racine du projet.
