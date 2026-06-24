# Data Model — Page contact

Phase 1. Deux entités : le **contenu éditorial** (singleton Sanity `contactPage`) et la
**soumission** (donnée transitoire transmise par email, non persistée).

---

## Entité 1 — `contactPage` (singleton Sanity)

`defineType({ name: "contactPage", type: "document" })`, instance unique
`documentId("contactPage")`. Schéma = source de vérité ; types générés par TypeGen
(`npm run typegen` → `ContactPage` dans `src/sanity.types.ts`) — jamais tapés à la main
(Principe IX). Images via le helper `imageField(name, title, group)`. Groupes Studio :
`hero`, `form`, `coordinates`, `seo`.

| Champ | Type | Groupe | Requis | Notes / défaut maquette |
|---|---|---|:---:|---|
| `heroTitleOutline` | `string` | hero | ✓ | « Nous sommes » (rendu outline : fill paper, stroke ink) |
| `heroTitleFill` | `string` | hero | ✓ | « à votre écoute » (rendu fill ink) |
| `formImage` | `image` (`imageField`) | form | ✓ | Visuel à gauche du formulaire (asset `51-4607.jpg`), hotspot/crop/alt/LQIP |
| `formTitleOutline` | `string` | form | ✓ | « Une question, Un projet ? » |
| `formTitleFill` | `string` | form | ✓ | « Tout commence ici. » |
| `requestTypes` | `array<object{ label: string (req), recipient: string (req, `Rule.email()`) }>` | form | ✓ | Liste **ordonnée** des « Type de demande » + **routage email** (éditable, réordonnable — FR-007/FR-019). Chaque entrée : un libellé affiché dans le `Select` + l'**email destinataire** vers lequel router. Défaut (4 entrées) : « J'ai un projet » → `projet@estuaire.fr` · « Je souhaite vous rejoindre » → `recrutement@estuaire.fr` · « Je souhaite collaborer avec vous » → `partenariat@estuaire.fr` · « J'ai une autre demande » → `contact@estuaire.fr` |
| `findTitleOutline` | `string` | coordinates | ✓ | « Nous » (outline) |
| `findTitleFill` | `string` | coordinates | ✓ | « trouver » (fill) — titre de la sous-section adresse |
| `address` | `text` (rows 2–3) | coordinates | ✓ | « Zi la seiglerie 3, 2 rue Henri Giffard\n44270 machecoul » (multi-lignes ; sans la ligne copyright du footer) |
| `contactTitleOutline` | `string` | coordinates | ✓ | « Nous » (outline) |
| `contactTitleFill` | `string` | coordinates | ✓ | « contacter » (fill) — titre de la sous-section email |
| `email` | `string` (validé email) | coordinates | ✓ | « contact@estuaire.fr » — **affiché + mailto** (≠ destinataire serveur `CONTACT_TO`) |
| `mapLocation` | `geopoint` | coordinates | ✓ | Lat/Lng du marqueur (défaut Machecoul ≈ 46.9931, -1.8221) |
| `mapZoom` | `number` (8–18) | coordinates | – | Défaut 15 |
| `seoMetaTitle` | `string` | seo | – | Fallback : « Contact — Estuaire » |
| `seoMetaDescription` | `text` | seo | – | Fallback neutre |
| `seoOgImage` | `image` (`imageField`) | seo | – | OG image (fallback : `formImage`) |

**Validation schéma** : `heroTitle*`, `formTitle*`, `formImage`, `requestTypes` (min 1, chaque
entrée `label` + `recipient` requis, `recipient` validé `Rule.email()`), `address`, `email`
(format), `mapLocation` marqués `required` → contrôlés par `npm run seed:check` (dry-run) avant
écriture (Principe IX).

**Repli contenu vide (FR-020)** : le mapping `getContactPageProps()` applique des défauts
issus de `src/content/contactPage.ts` (`sanityValue ?? default`), donc aucune zone cassée si un
champ n'est pas renseigné. La liste `requestTypes` retombe sur la liste par défaut (4 entrées) si vide.

**Routage destinataire (sécurité)** : le `recipient` n'est JAMAIS envoyé par le client — le
formulaire ne transmet que le **libellé** choisi. La route `/api/contact` re-fetche
`contactPage.requestTypes` côté serveur, construit la map `label → recipient`, et résout le
destinataire : `to = map[label] ?? CONTACT_TO` (fallback `contact@estuaire.fr` si libellé inconnu
ou email invalide). Empêche tout détournement via un champ falsifié.

**Preview Studio** : `preview` simple (title fixe « Page contact »).

---

## Entité 2 — Demande de contact (soumission) — transitoire

Données envoyées par le visiteur, **validées par un schéma zod partagé**
(`src/lib/contact/schema.ts`), transmises par email au **destinataire routé selon le type de
demande** (résolu côté serveur depuis `contactPage.requestTypes`, fallback `CONTACT_TO`),
**non persistées** côté site (cf. Assumptions du spec).

| Champ (form field) | Type | Requis | Règle de validation (zod, client + serveur) |
|---|---|:---:|---|
| `name` | string | ✓ | trim, 2–120 car. (« Nom & prénom* ») |
| `company` | string | – | trim, ≤ 160 car. (« Société ») |
| `email` | string | ✓ | format email, ≤ 200 car. |
| `requestType` | string | – | **le libellé** choisi ; doit appartenir aux `requestTypes` du CMS → résout le destinataire côté serveur (sinon fallback `contact@`). Le client n'envoie PAS l'email destinataire. |
| `message` | string | ✓ | trim, 10–5000 car. |
| `attachment` | File | – | ≤ 10 Mo ; MIME/ext ∈ { pdf, png, jpg/jpeg, webp, doc, docx, xls, xlsx, ppt, pptx } |
| `consent` | (implicite) | – | RGPD : finalité contact uniquement ; mention via lien Politique de confidentialité du footer (FR-014) — pas de case bloquante dans cette version |
| `website` | string (honeypot) | — | **doit être vide** (anti-spam) ; non rendu visuellement |
| `_ts` | number (caché) | — | horodatage de rendu ; rejet si soumission < ~2,5 s (anti-spam) |

**États & transitions (côté `ContactForm`)** :

```
idle → (submit) → validating
  ├─ erreurs client → invalid (messages par champ, saisie conservée)   [FR-002, SC-003]
  └─ ok → submitting (bouton disabled — FR-013)
        → POST /api/contact
            ├─ 200 ok      → success (message de confirmation, reset du form — FR-010)
            ├─ 400/422     → invalid (erreurs serveur mappées par champ, saisie conservée)
            └─ 429/503/5xx → error (message « réessayez / email direct visible », saisie conservée — FR-011)
  Umami: trackEvent("contact_form_submit", { status: "success" | "error" })
```

**Mapping email (Nodemailer)** :
- `to`: **destinataire routé** = `map[requestType].recipient ?? CONTACT_TO` (résolu serveur depuis le CMS — cf. routage ci-dessus) ; `from`: `SMTP_FROM` (boîte Email Pro @estuaire.fr) ; `replyTo`: email du visiteur.
- `subject`: `[Contact estuaire.fr] <requestType ?? "Demande"> — <name>`.
- `text`/`html`: récapitulatif de tous les champs (name, company, email, requestType, message).
- `attachments`: `[{ filename, content }]` si pièce jointe (sinon aucune).

---

## Flux de données (vue d'ensemble)

```
Sanity (contactPage)
  └─ sanityFetch(CONTACT_PAGE_QUERY)  [ISR tag]
       └─ getContactPageProps()  (lib/sanity/contactPage.ts : defaults + mapImage + geopoint)
            └─ page.tsx (RSC)
                 ├─ Hero / Coordinates (RSC, texte = repli carte)
                 ├─ <ContactForm requestTypes=… />        ("use client")
                 │     └─ fetch POST /api/contact (FormData)
                 │           └─ route.ts: zod + fichier + anti-spam → mailer.ts (Nodemailer → CONTACT_TO)
                 └─ <ContactMap lat lng zoom markerLabel /> ("use client", dynamic ssr:false)
```
