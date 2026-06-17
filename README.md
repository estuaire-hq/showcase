# Estuaire

Site vitrine pour Mosaique Production / marque Estuaire. Construit avec Next.js 15, Sanity Cloud et Tailwind CSS v4, deploye via Coolify sur VPS OVH.

## Prerequis

- **Node.js** 20+ (LTS)
- **npm** 10+
- **git-crypt** (`sudo apt install git-crypt` ou `brew install git-crypt`)
- Cle symetrique git-crypt (demander au lead dev)
- **portless** (`npm i -g portless`) — proxy de dev requis par `npm run dev` (voir « Développement parallèle »)

## Installation

```bash
# 1. Cloner le depot
git clone <repo-url> estuaire
cd estuaire

# 2. Deverrouiller les fichiers chiffres (une seule fois)
git-crypt unlock /chemin/vers/estuaire.key

# 3. Installer les dependances
npm install

# 4. Installer portless (proxy de dev) et son proxy local — une seule fois
npm i -g portless
portless service install --port 1355 --no-tls

# 5. Lancer le serveur de developpement
npm run dev
```

Le serveur démarre sur **`http://estuaire.localhost:1355`** (via portless). Le Studio Sanity est à `http://estuaire.localhost:1355/studio`. Pour revenir au classique `localhost:3000` (ou si portless n'est pas installé) : `PORTLESS=0 npm run dev`.

## Scripts disponibles

| Commande | Action |
|----------|--------|
| `npm run dev` | Serveur de dev avec Turbopack |
| `npm run build` | Build de production (sortie standalone) |
| `npm run start` | Demarrer le serveur de production |
| `npm run lint` | Verification Biome (lint + format) |
| `npm run format` | Correction automatique Biome |

## Développement parallèle (worktrees)

Pour mener plusieurs features de front sans que les serveurs de dev se marchent dessus, on combine **worktrunk** (`wt` — `cargo install worktrunk` ou `brew install worktrunk`) et **portless**. Chaque worktree obtient une URL nommée stable : `http://<branche>.estuaire.localhost:1355`.

Setup machine (une seule fois) : voir le guide [`docs/worktrees-portless-setup.md`](docs/worktrees-portless-setup.md).

```bash
wt switch -c ma-feature   # cree branche + worktree, installe les deps, demarre le serveur
wt list                   # liste les worktrees et leur URL de dev
wt remove                 # supprime le worktree (son serveur est arrete automatiquement)
```

Logs du serveur, restart et autres détails : voir la section « Parallel Dev — Worktrees » de [`CLAUDE.md`](CLAUDE.md) et l'[ADR 0013](docs/vault/decisions/0013-parallel-worktrees-portless.md).

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
