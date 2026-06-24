# 0023 — Envoi des emails du formulaire de contact : OVH Email Pro (SMTP), réception M365

**Statut** : accepté · **Date** : 2026-06-23 · **Feature** : [[013-contact-page]]

> Renuméroté 0019 → 0023 au merge de `main` (collision avec l'ADR 0019 « Sanity MCP »
> d'un worktree parallèle ; skill `estuaire-branch-sync`).

## Contexte

La page contact (feature 013) doit transmettre chaque demande par email. La constitution
(table de stack) supposait un envoi **SMTP Microsoft 365 « du client »**. L'inventaire de
l'infrastructure (CLI OVH + DNS public, 2026-06-23) a montré une réalité plus nuancée :

- Le domaine `estuaire.fr` a ses **MX chez OVH** (`mx*.mail.ovh.net`), un service **Email
  Pro** OVH (`emailpro-ls132877-1`, hôte `pro1.mail.ovh.net`), **pas de MX Plan**, et le
  DNS est géré chez **Cloudflare** (NS Cloudflare). SPF = `v=spf1 include:mx.ovh.com -all`
  (OVH autorisé) ; **DKIM non activé** ; pas de DMARC.
- Les **boîtes que l'équipe relève** sont sur le **tenant Microsoft 365 « Mosaique
  Production »** (boîtes partagées : commande@, facturation@, contact@…). Les adresses de
  réception du formulaire (`recrutement@`, `projet@`, `partenariat@`, `contact@`) seront des
  **boîtes partagées Exchange**.

Décision produit (Pierre, 2026-06-20/23) : router la demande vers **4 destinataires selon
le type de demande**, le routage étant **éditable dans Sanity**.

## Décision

Architecture **hybride**, découplant envoi et réception :

- **Envoi** : **Nodemailer → SMTP OVH Email Pro** (`pro1.mail.ovh.net`, 587 STARTTLS / 465
  SSL), authentifié par un compte Email Pro dédié (`noreply@…`, déjà créé). `From` =
  adresse `@estuaire.fr` (SPF OVH aligné) ; email du visiteur en `Reply-To`.
- **Réception** : les 4 destinataires sont des **boîtes partagées Exchange (M365)**.
  Transparent côté code : on envoie un email normal vers une adresse, Exchange le livre.
  Aucune intégration Graph/API requise.
- **Routage** : `contactPage.requestTypes[] = { label, recipient }` dans Sanity (éditable —
  FR-007/FR-019). Le client n'envoie **que le libellé** ; la route `POST /api/contact`
  re-fetche le mapping côté serveur et résout `to = map[label].recipient ?? CONTACT_TO`
  (anti-falsification). `CONTACT_TO` = fallback ops-contrôlé.
- **Dev** : si `SMTP_HOST` est absent, Nodemailer bascule en `jsonTransport` (le message
  est loggé, pas envoyé) → parcours testable sans secrets.

## Pourquoi pas…

- **M365 pour l'envoi** (l'hypothèse d'origine) : Microsoft retire le **SMTP AUTH Basic**
  (désactivé par défaut fin 2026, suppression 2027) → seul OAuth2/Graph resterait, soit un
  *app registration* Azure + code Graph. OVH Email Pro fait du SMTP AUTH classique, simple
  et pérenne pour notre besoin. On garde donc M365 **uniquement pour la réception** (boîtes
  partagées), là où il est excellent.
- **MTA local sur le VPS** : délivrabilité faible (IP datacenter, port 25 souvent bloqué).
- **Relais tiers** (Brevo/Mailjet/SES) : inutile, OVH Email Pro suffit ; éviterait une
  dépendance externe + une clé.

## Conséquences

- Le code reste **agnostique** : tout l'envoi passe par `src/lib/contact/mailer.ts`
  (Nodemailer SMTP). Changer de relais = changer les variables d'env, pas le code.
- **Variables d'env** (server-only, prod Coolify / dev `.env.development`) : `SMTP_HOST`,
  `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_TO`.
- **Cohérence de domaine / anti-spoofing** : éviter d'envoyer « en tant que `@estuaire.fr` »
  VERS un Exchange qui détiendrait `estuaire.fr` (mail de son propre domaine venu d'un
  serveur externe = marqué spoof). Comme les destinataires sont éditables dans Sanity, on y
  met les adresses réelles des boîtes partagées (à valider en test réel d'envoi).
- **À faire côté ops (hors code)** : créer les 4 boîtes partagées Exchange ; activer **DKIM**
  pour `estuaire.fr` (records OVH à publier chez Cloudflare) ; DMARC optionnel (`p=none`).
- **Constitution** : amendement PATCH (1.8.0 → 1.8.1) de la table de stack — « Formulaire
  contact : SMTP M365 » → **OVH Email Pro (envoi) + réception M365**.
