// ─────────────────────────────────────────────────────────────
// GROQ Queries — Mexican Reserve
// ─────────────────────────────────────────────────────────────

// All published properties (for villas listing page). featured desc must
// come first — without it, Featured status is never actually applied and
// properties just alphabetize once sortOrder ties (which it does for every
// Featured property, since they're all tagged sortOrder 1).
export const PROPERTIES_QUERY = `
  *[_type == "property" && status == "published"] | order(featured desc, sortOrder asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    tagline,
    shortDescription,
    propertyType,
    featured,
    collection,
    locationLabel,
    communityPuntaMita,
    communityPuntaDeMita,
    bedrooms,
    bathrooms,
    maxAdults,
    childOnlyBeds,
    viewsAndPool,
    golfCart6Seater,
    golfCart4Seater,
    memberships,
    "seasons": seasons[]{ seasonName, nightlyRate, minimumStay },
    heroImage,
    "mosaicPhotos": mosaicPhotos[]{ asset, hotspot },
    amenities,
    "staffServices": staffServices[]{ role, services },
    policies,
    "promotions": promotions {
      limitedTimePromotion { active, label, expiryDate },
      propertyOfTheMonth   { active, month, year       },
      lastMinuteDeal        { active, availableDates, note }
    }
  }
`

// Single property by slug (for property detail page)
export const PROPERTY_BY_SLUG_QUERY = `
  *[_type == "property" && slug.current == $slug && status == "published"][0] {
    _id,
    title,
    "slug": slug.current,
    tagline,
    shortDescription,
    fullDescription,
    propertyType,
    featured,
    collection,
    locationLabel,
    communityPuntaMita,
    communityPuntaDeMita,
    bedrooms,
    bathrooms,
    maxAdults,
    childOnlyBeds,
    viewsAndPool,
    golfCart6Seater,
    golfCart4Seater,
    memberships,
    bedConfiguration,
    "seasons": seasons[]{ seasonName, nightlyRate, minimumStay },
    heroImage { asset, hotspot },
    "gallery": gallery[]{ asset, hotspot, roomTag, isMosaic },
    videoUrl,
    virtualTourUrl,
    amenities,
    "staffServices": staffServices[]{ role, services },
    policies,
    seoTitle,
    seoDescription,
    ogImage,
    "promotions": promotions {
      limitedTimePromotion { active, label, expiryDate },
      propertyOfTheMonth   { active, month, year       },
      lastMinuteDeal        { active, availableDates, note }
    }
  }
`

// All slugs (for static generation of property pages)
export const PROPERTY_SLUGS_QUERY = `
  *[_type == "property" && status == "published" && defined(slug.current)].slug.current
`

// Hero background photos (homepage): featured VILLAS only — no condos — so
// the very first image a visitor sees is the most aspirational thing we
// rent, not our broadest inventory.
export const HERO_PHOTOS_QUERY = `
  *[_type == "property" && status == "published" && featured == true && propertyType == "villa" && defined(heroImage)] | order(sortOrder asc, title asc) [0...4] {
    heroImage
  }
`

// Featured properties (for homepage)
// Field set matches PROPERTIES_QUERY's card-relevant fields exactly, since the
// homepage now renders the same PropertyCard component as the villas listing page.
export const FEATURED_PROPERTIES_QUERY = `
  *[_type == "property" && status == "published" && featured == true] | order(sortOrder asc, title asc) [0..5] {
    _id,
    title,
    "slug": slug.current,
    tagline,
    propertyType,
    collection,
    locationLabel,
    communityPuntaMita,
    communityPuntaDeMita,
    bedrooms,
    bathrooms,
    maxAdults,
    childOnlyBeds,
    viewsAndPool,
    "seasons": seasons[]{ nightlyRate },
    heroImage,
    "mosaicPhotos": mosaicPhotos[]{ asset, hotspot },
    amenities,
    "promotions": promotions {
      limitedTimePromotion { active, label, expiryDate },
      lastMinuteDeal        { active, availableDates, note }
    }
  }
`

// Homepage Collections tiles: rotate real property photos through each tile
// (falls back to the tile's static gradient placeholder when a collection
// has no matching photos yet — mirrors the original static site's behavior).
// Fetches up to 16 candidates per collection — more than the ~6 a carousel
// actually displays — so that when a property belongs to more than one
// collection, there's enough headroom to pick a different lead photo per
// tile instead of being forced to reuse the same one everywhere.
export const COLLECTION_PHOTOS_QUERY = `{
  "exceptionalValue": *[_type == "property" && status == "published" && "exceptional-value" in coalesce(collection, [])] | order(featured desc, sortOrder asc, title asc) [0...16] { _id, heroImage },
  "familyVillas": *[_type == "property" && status == "published" && "family-villas" in coalesce(collection, [])] | order(featured desc, sortOrder asc, title asc) [0...16] { _id, heroImage },
  "oceanfront": *[_type == "property" && status == "published" && "oceanfront" in coalesce(collection, [])] | order(featured desc, sortOrder asc, title asc) [0...16] { _id, heroImage }
}`

// Homepage destination showcase: one representative photo per destination —
// the same locationLabel values used by /destinations/[slug].
export const DESTINATION_SHOWCASE_QUERY = `{
  "puntaMita": *[_type == "property" && status == "published" && locationLabel == "punta-mita" && defined(heroImage)] | order(featured desc, sortOrder asc, title asc) [0] { heroImage },
  "puntaDeMita": *[_type == "property" && status == "published" && locationLabel == "punta-de-mita-area" && defined(heroImage)] | order(featured desc, sortOrder asc, title asc) [0] { heroImage },
  "puertoVallarta": *[_type == "property" && status == "published" && locationLabel == "puerto-vallarta" && defined(heroImage)] | order(featured desc, sortOrder asc, title asc) [0] { heroImage }
}`

// Destination pages (/destinations/[slug]): every published property in a
// given locationLabel, with the same card-relevant field set as
// PROPERTIES_QUERY so PropertyCard and the hero-photo fallback both work.
// $locationLabel is the raw Sanity value: 'punta-mita' | 'punta-de-mita-area' | 'puerto-vallarta'.
export const PROPERTIES_BY_DESTINATION_QUERY = `
  *[_type == "property" && status == "published" && locationLabel == $locationLabel] | order(featured desc, sortOrder asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    tagline,
    propertyType,
    featured,
    collection,
    locationLabel,
    communityPuntaMita,
    communityPuntaDeMita,
    bedrooms,
    bathrooms,
    maxAdults,
    childOnlyBeds,
    viewsAndPool,
    "seasons": seasons[]{ nightlyRate },
    heroImage,
    "mosaicPhotos": mosaicPhotos[]{ asset, hotspot },
    amenities,
    "promotions": promotions {
      limitedTimePromotion { active, label, expiryDate },
      lastMinuteDeal        { active, availableDates, note }
    }
  }
`
