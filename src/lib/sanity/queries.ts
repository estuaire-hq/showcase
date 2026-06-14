import { defineQuery } from "next-sanity";

export const HOME_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "homePage"][0]{
    heroLabel,
    heroSlides[]{
      titleOutline,
      titleFill,
      image{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
    },
    introTitleOutline,
    introTitleFill,
    introText,
    introImagePrimary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introImageSecondary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    expertisesTitleOutline,
    expertisesTitleFill,
    expertisesText,
    expertisesImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    expertisesCtaLabel,
    expertisesCtaHref,
    universSectors[]{ label, href },
    realisationsTitleOutline,
    realisationsTitleFill,
    realisationsCtaLabel,
    realisationsCtaHref,
    visionTitleOutline,
    visionTitleFill,
    visionText,
    visionImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    visionCtaLabel,
    visionCtaHref,
    seoMetaTitle,
    seoMetaDescription,
    seoOgImage{ asset, alt }
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
