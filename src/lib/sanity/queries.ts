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

export const EXPERTISE_SUBPAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "expertiseSubpage" && slug.current == $slug][0]{
    "slug": slug.current,
    breadcrumb,
    heroEyebrow,
    heroTitleOutline,
    heroTitleFill,
    heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introStatement,
    introText,
    introImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    responsableTitleOutline,
    responsableTitleFill,
    responsableText,
    responsableImages[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    engagementsTitleOutline,
    engagementsTitleFill,
    engagements[]{ title },
    caseStudyTitleOutline,
    caseStudyTitleFill,
    caseStudyImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    caseStudyProjectTitle,
    caseStudyMeta,
    caseStudyCtaLabel,
    caseStudyCtaHref,
    seoMetaTitle,
    seoMetaDescription,
    seoOgImage{ asset, alt }
  }
`);

export const EXPERTISE_SUBPAGE_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "expertiseSubpage" && defined(slug.current)]{ "slug": slug.current }
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

export const SECTOR_DETAIL_QUERY = defineQuery(/* groq */ `
  *[_type == "sectorDetail" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    heroEyebrow,
    heroTitleOutline,
    heroTitleFill,
    heroImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introStatement,
    introText,
    introImageMain{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introImagePortrait{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    introImageSquare{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    enjeuxTitleOutline,
    enjeuxTitleFill,
    enjeux,
    contraintesTitleOutline,
    contraintesTitleFill,
    contraintes[]{ label, emphasis },
    argument,
    citations[]{
      quote,
      attribution,
      image{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
    },
    seoMetaTitle,
    seoMetaDescription,
    seoOgImage{ asset, alt }
  }
`);

// — Réalisations (collection) —

// Page liste : projection légère de toutes les réalisations sauf brouillon, triées par récence.
// `published` = cliquables ; `upcoming` = aperçu grisé non cliquable. Le filtrage (Univers /
// Expertises / Clients) + l'affichage progressif se font côté client (research D4).
export const REALISATIONS_LIST_QUERY = defineQuery(/* groq */ `
  *[_type == "realisation" && status in ["published","upcoming"]] | order(order desc, publishedAt desc){
    "slug": slug.current,
    title,
    client,
    status,
    univers,
    expertises,
    location,
    year,
    area,
    cover{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
  }
`);

// Page détail : une réalisation PUBLIÉE par slug (récit complet + galerie). Le filtre `status ==
// "published"` garantit qu'une URL « à venir »/« brouillon »/inexistante renvoie null → notFound.
export const REALISATION_QUERY = defineQuery(/* groq */ `
  *[_type == "realisation" && slug.current == $slug && status == "published"][0]{
    "slug": slug.current,
    title,
    client,
    univers,
    expertises,
    layout,
    location,
    year,
    area,
    context,
    enjeu,
    interventions,
    challenges[]{ title, body },
    skills,
    photoCredit,
    cover{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    gallery[]{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    seoMetaTitle,
    seoMetaDescription,
    seoOgImage{ asset, alt }
  }
`);

// Liste ordonnée des slugs publiés — sert à calculer les voisins précédent/suivant (bornés).
export const REALISATION_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "realisation" && status == "published"] | order(order desc, publishedAt desc){
    "slug": slug.current,
    title
  }
`);

// Réalisations publiées les plus récentes (home + « Dernières Réalisations »). Renvoie jusqu'à 6
// (le connecteur tranche : 3 cartes + visuels décoratifs de la home — demock, FR-023).
export const LATEST_REALISATIONS_QUERY = defineQuery(/* groq */ `
  *[_type == "realisation" && status == "published"] | order(order desc, publishedAt desc)[0...6]{
    "slug": slug.current,
    title,
    client,
    location,
    year,
    area,
    cover{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
  }
`);

// Réalisation publiée la plus récente rattachée à une expertise (demock des sous-pages, FR-024).
// `null` si aucune → repli dégradé propre côté connecteur.
export const EXPERTISE_LATEST_REALISATION_QUERY = defineQuery(/* groq */ `
  *[_type == "realisation" && status == "published" && $expertise in expertises]
    | order(order desc, publishedAt desc)[0]{
    "slug": slug.current,
    title,
    location,
    year,
    area,
    cover{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip }
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

export const CONTACT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "contactPage"][0]{
    heroTitleOutline,
    heroTitleFill,
    formImage{ asset, hotspot, crop, alt, "lqip": asset->metadata.lqip },
    formTitleOutline,
    formTitleFill,
    requestTypes[]{ label, recipient },
    findTitleOutline,
    findTitleFill,
    address,
    contactTitleOutline,
    contactTitleFill,
    email,
    mapLocation,
    mapZoom,
    seoMetaTitle,
    seoMetaDescription,
    seoOgImage{ asset, alt }
  }
`);

export { defineQuery };
