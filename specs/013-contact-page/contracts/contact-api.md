# Contract — `POST /api/contact`

Endpoint de soumission du formulaire de contact. Route Handler Next.js (runtime Node),
exempté du gate Coming-Soon (matcher exclut `api/*`).

## Requête

- **Méthode** : `POST`
- **URL** : `/api/contact`
- **Content-Type** : `multipart/form-data` (FormData — supporte le `File` de la pièce jointe)

### Champs du FormData

| Clé | Type | Requis | Contrainte |
|---|---|:---:|---|
| `name` | string | ✓ | 2–120 car. |
| `company` | string | – | ≤ 160 car. |
| `email` | string | ✓ | format email, ≤ 200 car. |
| `requestType` | string | – | **libellé** ∈ liste CMS → résout le destinataire côté serveur (sinon fallback `contact@`). Le client n'envoie PAS l'email destinataire. |
| `message` | string | ✓ | 10–5000 car. |
| `attachment` | File | – | ≤ 10 Mo ; MIME/ext autorisés (pdf, png, jpg, jpeg, webp, doc, docx, xls, xlsx, ppt, pptx) |
| `website` | string | – | **honeypot** — doit être vide |
| `_ts` | string (number) | ✓ | horodatage de rendu (ms) ; delta < 2500 ms ⇒ rejet |

## Réponses

| Statut | Body | Cas |
|---|---|---|
| `200` | `{ "ok": true }` | Envoi réussi (FR-009/010). **Aussi** retourné en cas de spam détecté (honeypot/time-trap) — réponse feinte pour ne pas informer le bot (SC-007). |
| `400` | `{ "ok": false, "errors": { "<field>": "<message>" } }` | Validation zod échouée (champ requis, email invalide) — FR-006. Saisie conservée côté client. |
| `422` | `{ "ok": false, "errors": { "attachment": "<message>" } }` | Pièce jointe non conforme (taille/format) — FR-008. |
| `429` | `{ "ok": false, "error": "rate_limited" }` | (Optionnel) trop de soumissions depuis la même origine. |
| `503` | `{ "ok": false, "error": "mail_unavailable" }` | Échec du transport SMTP (FR-011). Le client affiche « réessayez / email direct » + conserve la saisie. |
| `405` | — | Méthode ≠ POST. |

## Comportement serveur (route.ts)

1. `request.formData()` → extraire les champs.
2. **Anti-spam** : si `website` non vide OU `now - _ts < 2500ms` → répondre `200 { ok:true }`
   sans envoyer (rejet silencieux).
3. **Validation** : `contactSchema.safeParse(...)` (zod partagé) ; champs invalides → `400`.
4. **Pièce jointe** : si présente, vérifier taille + MIME/ext ; non conforme → `422`.
5. **Routage destinataire** : `sanityFetch(CONTACT_PAGE_QUERY)` côté serveur → map
   `label → recipient` ; `to = map[requestType] ?? CONTACT_TO` (fallback `contact@` si libellé
   inconnu / email invalide). Le `recipient` n'est jamais lu depuis le client.
6. **Envoi** : `mailer.ts` (Nodemailer) → `to` (routé), `replyTo` = email visiteur, sujet +
   corps récapitulatif, `attachments` si fichier. Échec → `503`.
7. Succès → `200 { ok:true }`.

> Le client (`ContactForm`) déclenche `trackEvent("contact_form_submit", { status })` sur la
> réponse (`success` pour 200, `error` sinon) — Principe VI.

## Sécurité / RGPD

- Aucune persistance des données (transmission email uniquement).
- `replyTo` = email visiteur ; pas de stockage de PII côté site.
- Logs serveur : ne PAS logger le contenu du message ni l'email en clair (au plus un id/anonyme).

## Variables d'environnement consommées (server-only)

`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO`.
- `SMTP_*` → relais **OVH Email Pro** (`pro1.mail.ovh.net:587`), boîte d'envoi `@estuaire.fr`.
- `CONTACT_TO` = **destinataire par défaut / fallback** (`contact@estuaire.fr`). Le routage par
  type de demande vient du **CMS** (`contactPage.requestTypes[].recipient`), `CONTACT_TO` ne sert
  que de filet quand le libellé est inconnu ou l'email CMS invalide.
- Si `SMTP_HOST` absent (dev sans secrets) → fallback `jsonTransport` (message loggé, `200`).

## Vérification manuelle (curl)

```bash
# Succès (sans pièce jointe) — en dev avec fallback jsonTransport
# requestType = un LIBELLÉ du CMS → route vers projet@estuaire.fr
curl -i -X POST http://localhost:3000/api/contact \
  -F 'name=Jean Dupont' -F 'email=jean@example.com' \
  -F "message=Bonjour, j'ai un projet d'agencement." \
  -F "requestType=J'ai un projet" -F 'website=' -F "_ts=$(($(date +%s%3N)-5000))"
# → 200 {"ok":true}  (logs: to=projet@estuaire.fr)

# requestType inconnu / absent → fallback to=contact@estuaire.fr
# Email invalide → 400 avec errors.email
# Honeypot rempli (website=bot) → 200 {"ok":true} mais aucun envoi
```
