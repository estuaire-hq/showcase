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

export const ABOUT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "aboutPage"][0]{
    heroEyebrow,
    heroTitleOutline,
    heroTitleFill,
    heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introStatement,
    introText,
    introImagePrimary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introImageSecondary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introHighlight,
    visionTitleOutline,
    visionTitleFill,
    visionText,
    visionImages[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    atelierTitleOutline,
    atelierTitleFill,
    atelierText,
    atelierPillarsLead,
    atelierPillars,
    atelierCapabilities,
    atelierImages[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    atelierHighlight,
    processTitleOutline,
    processTitleFill,
    processIntro,
    processIntroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    processSteps[]{
      number,
      title,
      text,
      bullets,
      images[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
    },
    statementImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    statementText,
    ctaLabel,
    ctaHref,
    seoMetaTitle,
    seoMetaDescription,
    seoOgImage{ asset, alt }
  }
`);

export const EXPERTISES_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "expertisesPage"][0]{
    heroEyebrow,
    heroTitleOutline,
    heroTitleFill,
    heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introStatement,
    introText,
    introImagePrimary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introImageSecondary{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    levelsTitleOutline,
    levelsTitleFill,
    levelsImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    levels[]{
      title,
      ctaLabel,
      ctaHref,
      image{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
    },
    statementImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    statementText,
    seoMetaTitle,
    seoMetaDescription,
    seoOgImage{ asset, alt }
  }
`);

export const SECTORS_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "sectorsPage"][0]{
    heroEyebrow,
    heroTitleOutline,
    heroTitleFill,
    heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introStatement,
    introText,
    introImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    sectors[]{
      label,
      promise,
      href,
      image{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
    },
    keyFigures[]{ value, support },
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
