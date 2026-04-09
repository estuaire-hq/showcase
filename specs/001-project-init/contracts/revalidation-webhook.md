# Contrat : Webhook de revalidation Sanity

**Type** : API route (POST)
**Chemin** : `/api/revalidate`

## Description

Point d'entrée pour le webhook Sanity qui déclenche la revalidation ISR des pages dont le contenu a changé.

## Authentification

Sanity signe chaque requête avec un HMAC-SHA256 envoyé dans le header `sanity-webhook-signature` au format `t=<timestamp>,v1=<hmac>`. La vérification est assurée par `parseBody()` de `next-sanity/webhook` qui valide la signature contre `REVALIDATION_SECRET`.

Le secret est configuré dans le champ "Secret" du webhook Sanity Cloud (sanity.io/manage > API > Webhooks).

## Requête

**Méthode** : `POST`

**Header** : `sanity-webhook-signature: t=<unix-timestamp>,v1=<base64url-hmac>`

**Corps** (envoyé par Sanity automatiquement, configurable via "Projection") :
```json
{
  "_type": "string",
  "_id": "string"
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

**Signature invalide (401)** :
```json
{
  "message": "Invalid signature"
}
```

**Erreur (500)** :
```json
{
  "message": "Error revalidating"
}
```

## Configuration du webhook Sanity Cloud

| Champ | Valeur |
|-------|--------|
| Name | `Revalidate` |
| URL | `https://estuaire.fr/api/revalidate` |
| Secret | Meme valeur que `REVALIDATION_SECRET` dans Coolify |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Projection | `{_type, _id}` |

## Notes

- Le webhook ne sert qu'en **production** — en dev, Next.js ne cache pas les pages (pas de revalidation nécessaire)
- Le webhook sera créé sur le projet Sanity `showcase` (prod), pas `showcase-dev`
- La variable `REVALIDATION_SECRET` n'est pas nécessaire en `.env.development`
- L'implémentation complète de la revalidation viendra avec la première feature qui affiche du contenu Sanity
