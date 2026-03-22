# Contrat : Webhook de revalidation Sanity

**Type** : API route (POST)
**Chemin** : `/api/revalidate`

## Description

Point d'entrée pour le webhook Sanity qui déclenche la revalidation ISR des pages dont le contenu a changé.

## Requête

**Méthode** : `POST`
**Authentification** : Header ou query param contenant le secret partagé (`REVALIDATION_SECRET`)

**Corps** (envoyé par Sanity automatiquement) :
```json
{
  "_type": "string",
  "_id": "string",
  "slug": "string | undefined"
}
```

## Réponse

**Succès (200)** :
```json
{
  "revalidated": true,
  "now": "2026-03-19T12:00:00.000Z"
}
```

**Secret invalide (401)** :
```json
{
  "message": "Invalid secret"
}
```

**Erreur (500)** :
```json
{
  "message": "Error revalidating"
}
```

## Notes

- Ce contrat est défini ici pour référence, mais l'implémentation complète de la revalidation viendra avec la première feature qui affiche du contenu Sanity
- Pour l'initialisation, seul le squelette de la route est créé
