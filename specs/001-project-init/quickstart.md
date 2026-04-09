# Quickstart : Démarrage local du projet Estuaire

**Branche** : `001-project-init` | **Date** : 2026-03-22

## Prérequis

- Node.js 20+ (LTS)
- npm 10+
- git-crypt installé (`sudo apt install git-crypt` ou `brew install git-crypt`)
- Accès à la clé symétrique git-crypt (demander au lead dev)

## Installation

```bash
# 1. Cloner le dépôt
git clone <repo-url> estuaire
cd estuaire

# 2. Déverrouiller les fichiers chiffrés (une seule fois)
git-crypt unlock /chemin/vers/estuaire.key

# 3. Installer les dépendances
npm install

# 4. Lancer le serveur de développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000`. Le Studio Sanity est accessible à `http://localhost:3000/studio`.

**Note** : Après `git-crypt unlock`, le fichier `.env.development` est automatiquement en clair sur ton disque. Next.js le charge nativement. Aucune commande supplémentaire n'est nécessaire au quotidien.

## Scripts disponibles

| Commande | Action |
|----------|--------|
| `npm run dev` | Serveur de dev (Next.js charge `.env.development` nativement) |
| `npm run build` | Build de production (en prod, Coolify injecte les variables) |
| `npm run lint` | Vérification ESLint |

## Gestion des secrets

```
.env.development    # En clair sur disque, chiffré dans git (via git-crypt)
.env.local.example  # Documentation des variables attendues (non chiffré)
```

- **git-crypt** gère le chiffrement/déchiffrement de manière transparente
- Pas de commande manuelle pour chiffrer/déchiffrer — git le fait automatiquement
- Les variables de production vivent exclusivement dans l'UI Coolify

## Premier setup (lead dev uniquement)

Cette procédure ne se fait **qu'une seule fois**, par le lead dev.

```bash
# 1. Initialiser git-crypt dans le dépôt
git-crypt init

# 2. Déclarer les fichiers à chiffrer dans .gitattributes
echo ".env.development filter=git-crypt diff=git-crypt" >> .gitattributes

# 3. Créer .env.development avec les vrais secrets Sanity showcase-dev

# 4. Exporter la clé symétrique pour la partager
mkdir -p ~/.config/git-crypt
git-crypt export-key ~/.config/git-crypt/estuaire.key

# 5. Commiter
git add .gitattributes .env.development
git commit -m "chore: add git-crypt encrypted dev environment"

# 6. Partager la clé
#    Communiquer le fichier estuaire.key aux autres développeurs
#    via un canal sécurisé (gestionnaire de mots de passe, clé USB, etc.)
```

## Dépannage

**`.env.development` contient du binaire illisible** : git-crypt n'a pas été déverrouillé. Exécuter `git-crypt unlock /chemin/vers/estuaire.key`.

**Le Studio ne se charge pas** : Vérifier que `NEXT_PUBLIC_SANITY_PROJECT_ID` et `NEXT_PUBLIC_SANITY_DATASET` sont bien définis dans `.env.development`. Vérifier que le projet Sanity `showcase-dev` existe bien.

**Erreur de build TypeScript** : Exécuter `npm run lint` pour identifier les erreurs.
