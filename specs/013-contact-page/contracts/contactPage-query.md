# Contract — `CONTACT_PAGE_QUERY` (GROQ)

Requête du singleton `contactPage`, déclarée avec `defineQuery` dans
`src/lib/sanity/queries.ts` (résultat typé `CONTACT_PAGE_QUERYResult` généré par TypeGen).
Consommée via `sanityFetch` (ISR tags) dans `getContactPageProps()`.

## GROQ (forme cible)

```groq
*[_type == "contactPage"][0]{
  heroTitleOutline,
  heroTitleFill,
  formImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
  formTitleOutline,
  formTitleFill,
  requestTypes[]{ label, recipient },   // routage type → email destinataire
  findTitleOutline,
  findTitleFill,
  address,
  contactTitleOutline,
  contactTitleFill,
  email,
  mapLocation,            // { _type: "geopoint", lat, lng, alt? }
  mapZoom,
  seoMetaTitle,
  seoMetaDescription,
  seoOgImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
}
```

## Props rendues (sortie de `getContactPageProps()`)

Après mapping (defaults depuis `src/content/contactPage.ts` + `mapImage` + extraction geopoint) :

```ts
type ContactPageProps = {
  hero: { titleOutline: string; titleFill: string };
  form: {
    image: { src: string; alt: string; blurDataURL?: string };
    titleOutline: string;
    titleFill: string;
    requestTypes: { label: string; recipient: string }[];  // ≥ 1 (fallback liste par défaut, 4 entrées)
    // NB : la page ne passe que les `label` au <Select> (client) ; la route /api/contact
    // utilise la map complète label→recipient côté serveur (le recipient ne transite pas par le client).
  };
  coordinates: {
    find: { titleOutline: string; titleFill: string };
    address: string;                  // multi-lignes
    contact: { titleOutline: string; titleFill: string };
    email: string;                    // affiché + mailto
    map: { lat: number; lng: number; zoom: number; markerLabel: string };
  };
  seo: { metaTitle: string; metaDescription: string; ogImage?: { src: string; alt: string } };
};
```

## Revalidation

- Tag de cache déclaré via `sanityFetch` (cohérent avec les autres queries — ex.
  `{ tags: ["contactPage"] }`), revalidé par le webhook Sanity → `POST /api/revalidate`.

## Règles de mapping

- Chaque champ : `sanityValue ?? defaultFromContent` (FR-020 — aucune zone vide cassée).
- `requestTypes` : si absent/vide → 4 entrées par défaut de `src/content/contactPage.ts`
  (libellé + recipient). Chaque `recipient` re-validé (email) ; si invalide → exclu du routage
  (retombe sur `CONTACT_TO`).
- `requestTypes` : si absent/vide → liste par défaut de `src/content/contactPage.ts`.
- `mapLocation` : si absent → coordonnées Machecoul par défaut ; `mapZoom` → 15.
- `formImage` / `seoOgImage` : `mapImage(source, width, alt)` → `{ src, alt, blurDataURL }` ;
  `seoOgImage` retombe sur `formImage` si absent.
- `address` : fallback = constante partagée (réutilise la valeur de `src/content/footer.ts`,
  sans la ligne copyright).
