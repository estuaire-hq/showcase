import { defineQuery } from "next-sanity";

export const HOME_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "homePage"][0]{
    title,
    tagline
  }
`);

export const FOOTER_QUERY = defineQuery(/* groq */ `
  *[_id == "footer"][0]{
    ctaTitleOutline,
    ctaTitleFill,
    ctaButtonLabel,
    ctaButtonHref,
    ctaImages[]{
      asset,
      hotspot,
      crop,
      alt,
      "lqip": asset->metadata.lqip
    },
    tagline,
    address,
    contactHref,
    linkedInUrl,
    plaquetteLabel,
    "plaquetteUrl": plaquetteFile.asset->url,
    navLinks[]{ label, href },
    legalLinks[]{ label, href }
  }
`);

export { defineQuery };
