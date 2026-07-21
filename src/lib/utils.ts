// ─────────────────────────────────────────────────────────────
// Utility helpers — Mexican Reserve
// ─────────────────────────────────────────────────────────────

// A season prices one of two ways, per Sanity's "Pricing by Season" field:
// either a single flat `nightlyRate` for the whole season, OR a `bedroomRates`
// array when the property charges differently depending on how many
// bedrooms are occupied (e.g. 6BR: $2,200 vs 7BR: $2,400) — in which case
// `nightlyRate` is left empty on that season. Both are optional at the type
// level for exactly that reason; code reading a season must check both.
export type Season = {
  seasonName: string
  nightlyRate?: number
  bedroomRates?: { bedrooms: number; nightlyRate: number }[]
  minimumStay: number
}

export type PhotoRef = { asset?: { _ref: string }; hotspot?: { x: number; y: number } }

export type Property = {
  _id: string
  title: string
  slug: string
  tagline?: string
  shortDescription?: string
  fullDescription?: unknown[]
  propertyType: 'condo' | 'villa' | 'estate'
  featured?: boolean
  collection?: string[]
  locationLabel: 'punta-mita' | 'punta-de-mita-area' | 'puerto-vallarta'
  communityPuntaMita?: string
  communityPuntaDeMita?: string
  bedrooms: number
  bathrooms: number
  maxAdults: number
  childOnlyBeds?: number
  viewsAndPool?: string[]
  golfCart6Seater?: number
  golfCart4Seater?: number
  memberships?: string
  bedConfiguration?: unknown[]
  seasons?: Season[]
  heroImage?: PhotoRef
  mosaicPhotos?: PhotoRef[]
  gallery?: unknown[]
  videoUrl?: string
  virtualTourUrl?: string
  amenities?: string[]
  staffServices?: { role: string; services: string[] }[]
  policies?: { noPets: boolean; noEvents: boolean; noSmoking: boolean }
  seoTitle?: string
  seoDescription?: string
  ogImage?: unknown
  promotions?: {
    limitedTimePromotion?: { active: boolean; label?: string; expiryDate?: string }
    propertyOfTheMonth?:   { active: boolean; month?: number; year?: number }
    lastMinuteDeal?:       { active: boolean; availableDates?: string; note?: string }
  }
}

// ─────────────────────────────────────────────────────────────
// Label maps — copied verbatim from shared.js (single source of truth
// on the current live site). Keep in sync if new communities/collections
// are added in Sanity.
// ─────────────────────────────────────────────────────────────

export const COMM_LABELS: Record<string, string> = {
  // Inside the gates — Punta Mita
  '7-eight-bahia-golf-residences': '7 Eight Bahia',
  '7-eight':                       '7 Eight',
  'bahia-signature-estates':       'Bahia Signature Estates',
  'bellavista-residences':         'Bellavista Residences',
  'bellavista':                    'Bellavista',
  'cuora':                         'Cuora',
  'el-encanto':                    'El Encanto',
  'el-encanto-villas':             'El Encanto Villas',
  'four-seasons-residences':       'Four Seasons Residences',
  'hacienda-de-mita':              'Hacienda de Mita',
  'iyari-estates':                 'Iyari Estates',
  'iyari-villas':                  'Iyari Villas',
  'iyari':                         'Iyari',
  'kupuri':                        'Kupuri',
  'kupuri-beach-residences':       'Kupuri Beach Residences',
  'la-punta-estates':              'La Punta Estates',
  'la-serenata':                   'La Serenata',
  'lagos-del-mar':                 'Lagos del Mar',
  'las-marietas':                  'Las Marietas',
  'las-palmas':                    'Las Palmas',
  'las-palmas-golf-estates':       'Las Palmas Golf Estates',
  'las-palmas-selva':              'Las Palmas Selva',
  'las-terrazas':                  'Las Terrazas',
  'las-vistas-estates':            'Las Vistas Estates',
  'pacifico-estates':              'Pacifico Estates',
  'porta-fortuna':                 'Porta Fortuna',
  'porta-fortuna-golf':            'Porta Fortuna Golf',
  'porta-fortuna-zen-casitas':     'Porta Fortuna Zen Casitas',
  'ranchos-estates':               'Ranchos Estates',
  'signature-estates':             'Signature Estates',
  'tau-residences':                'TAU Residences',
  'tau':                           'TAU Residences',
  'the-surf-residences':           'The Surf Residences',
  // Outside the gates — Punta de Mita area
  'bolongo':                       'Bolongo',
  'el-farallon':                   'El Farallón',
  'kirah':                         'Kiráh',
  'litibu':                        'Litibú',
  'los-veneros':                   'Los Veneros',
  'maena':                         'Maena',
  'naya':                          'Naya',
  'nayama':                        'Nayamá',
  'paradise-coves':                'Paradise Coves',
  'pontoquito':                    'Pontoquito',
  'punta-del-burro':               'Punta del Burro',
  'real-del-mar':                  'Real del Mar',
  'san-pancho':                    'San Pancho',
  'sayulita':                      'Sayulita',
  'susurros-del-corazon':          'Susurros del Corazón',
  'uavi':                          'Uavi',
  // Legacy slugs
  'bahia':                         'Bahía',
  'la-colina':                     'La Colina',
  'corales':                       'Corales',
  'punta-caracol':                 'Punta Caracol',
  'el-eden':                       'El Edén',
  'tres-vistas':                   'Tres Vistas',
  'golf-villas':                   'Golf Villas',
  'agave':                         'Agave Azul',
  'mesquite':                      'Mesquite',
  'casa-de-campo':                 'Casa de Campo',
  'la-punta-residences':           'La Punta Residences',
  'flamingos':                     'Flamingos',
  'la-cruz':                       'La Cruz de Huanacaxtle',
}

export const COLL_LABELS: Record<string, string> = {
  'exceptional-value': 'Exceptional Value',
  'family-villas':     'Family Villa',
  'oceanfront':        'Oceanfront',
}

export const COLL_NAMES: Record<string, string> = {
  'exceptional-value': 'Exceptional Value',
  'family-villas':     'Family Villas',
  'oceanfront':        'Oceanfront Collection',
}

export const VIEW_LABELS: Record<string, string> = {
  'ocean-view':       'Ocean view',
  'golf-course-view': 'Golf course view',
  'lake-view':        'Lake view',
  'oceanfront':       'Oceanfront',
  'beachfront':       'Beachfront',
  'golf-course':      'Golf course',
  'hillside':         'Hillside',
  'private-pool':     'Private pool',
  'communal-pool':    'Communal pool',
}

export const DEST_LABELS: Record<string, string> = {
  'punta-mita':      'Punta Mita',
  'punta-de-mita':   'Punta de Mita Area',
  'puerto-vallarta': 'Puerto Vallarta',
}

// URL slug (used by /destinations/[slug] and DEST_LABELS above) -> the raw
// value Sanity actually stores on both the property schema's locationLabel
// field and the activity schema's destinations field. Only "punta-de-mita"
// differs from its own slug. Centralized here since both /destinations/[slug]
// and /experiences need the same mapping.
export const LOCATION_LABEL_BY_SLUG: Record<string, Property['locationLabel']> = {
  'punta-mita':      'punta-mita',
  'punta-de-mita':   'punta-de-mita-area',
  'puerto-vallarta': 'puerto-vallarta',
}

// Mirrors the category list in sanity-studio/schemas/activity.js — the
// query only returns the raw value, so this maps it back to a display label.
// Order here is also the display order for category filter chips.
export const EXPERIENCE_CATEGORIES: [string, string][] = [
  ['ocean-water', 'Ocean & Water'],
  ['wellness-beach-lifestyle', 'Wellness & Beach Lifestyle'],
  ['sports-adventure', 'Sports & Adventure'],
  ['beach-clubs-day-clubs', 'Beach Clubs & Day Clubs'],
  ['food-dining', 'Food & Dining'],
  ['high-end-vip', 'High-End & VIP'],
]
export const EXPERIENCE_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(EXPERIENCE_CATEGORIES)

// One bullet under an Activity (e.g. "Sunset cruise aboard a catamaran").
// destinationOverride is only set when this specific experience is more
// limited than the activity as a whole — e.g. within "Private Yacht &
// Sailing Charters" (offered broadly), only "Marietas Islands boat tour"
// carries an override narrowing it to Punta de Mita + Puerto Vallarta.
// A bullet with no override simply inherits the parent Activity's own
// `destinations` field.
export type ExperienceItem = {
  text: string
  destinationOverride?: string[]
}

// One "Concierge & Experiences" card — what Sanity calls an "activity"
// document (e.g. "Private Yacht & Sailing Charters"). `destinations` is its
// broadest scope; `experiences` are the specific bookable bullets under it,
// each optionally narrowed further via ExperienceItem.destinationOverride.
export type Activity = {
  _id: string
  title: string
  category: string
  description: string
  photo?: PhotoRef
  destinations?: string[]
  experiences: ExperienceItem[]
}

export const LOC_TYPE_LABELS: Record<string, string> = {
  'oceanfront':  'Oceanfront',
  'beachfront':  'Beachfront',
  'golf-course': 'Golf Course',
  'hillside':    'Hillside',
}

/** Community label for the card's eyebrow ("Kupuri", "Sayulita", etc.)
 *  Falls back to humanizing the raw slug (dashes → spaces, title case)
 *  instead of showing it verbatim, in case a new community gets added in
 *  Sanity before COMM_LABELS is updated to match. */
export function communityLabel(p: Property): string {
  const raw = p.communityPuntaMita || p.communityPuntaDeMita || ''
  if (COMM_LABELS[raw]) return COMM_LABELS[raw]
  return raw.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Which destination a property belongs to, for the Destination filter */
export function destinationOf(p: Property): 'punta-mita' | 'punta-de-mita' | '' {
  if (p.communityPuntaMita) return 'punta-mita'
  if (p.communityPuntaDeMita) return 'punta-de-mita'
  return ''
}

/**
 * Collection badge shown top-left on the photo (excludes golf/membership
 * entries). A property can legitimately belong to more than one collection
 * (e.g. both "Exceptional Value" and "Oceanfront") — when a specific
 * collection filter is active (villas listing, filtered by the header's
 * Properties dropdown), `activeCollection` makes the badge show THAT
 * collection instead of whichever one happens to come first in the
 * property's own list. Without it, filtering by "Oceanfront" could still
 * show "Exceptional Value" badges on every result, which reads as if the
 * filter isn't working even though the result list itself is correct.
 */
export function collectionBadge(p: Property, activeCollection?: string): string {
  const list = p.collection || []
  if (activeCollection && list.includes(activeCollection) && COLL_LABELS[activeCollection]) {
    return COLL_LABELS[activeCollection]
  }
  const coll = list.find(c => !/golf|membership/i.test(c) && COLL_LABELS[c])
  return coll ? COLL_LABELS[coll] : ''
}

/**
 * Location/view badge — shown alongside the collection badge on every
 * property card sitewide (homepage, villas listing, similar properties).
 * Standardized on the villas-listing page's version, per Francisco's call:
 * one consistent card everywhere. Deliberately does not cover
 * golf-course-view/hillside — only these three.
 */
export function locationBadge(p: Property): string {
  const views = p.viewsAndPool || []
  if (views.includes('beachfront')) return 'Beachfront'
  if (views.includes('oceanfront')) return 'Oceanfront'
  if (views.includes('ocean-view')) return 'Ocean View'
  return ''
}

/** All photos for the card carousel: hero image first, then mosaic photos */
export function allPhotos(p: Property): PhotoRef[] {
  const list = [p.heroImage, ...(p.mosaicPhotos || [])].filter(
    (ph): ph is PhotoRef => Boolean(ph?.asset?._ref)
  )
  return list
}

/** Compute total max guests from maxAdults + childOnlyBeds */
export function totalGuests(p: Property): number {
  return (p.maxAdults || 0) + (p.childOnlyBeds || 0)
}

/** Every real nightly rate across every season, flattened into one list.
 *  A season contributes its flat `nightlyRate` if set, or every tier's
 *  `nightlyRate` from `bedroomRates` if it uses bedroom-tiered pricing
 *  instead (see the Season type above) — a season can only have one or the
 *  other, but both are checked since either can be what's actually filled in.
 *  Single source of truth for "all the numbers a property actually charges,"
 *  so startingRate() and the villa page's rate-variance check can't quietly
 *  drift apart and handle tiered seasons differently (which is exactly what
 *  happened before this function existed — one handled tiers, one didn't). */
export function allSeasonRates(p: Property): number[] {
  const rates: number[] = []
  for (const s of p.seasons || []) {
    if (s.nightlyRate) rates.push(s.nightlyRate)
    for (const br of s.bedroomRates || []) {
      if (br.nightlyRate) rates.push(br.nightlyRate)
    }
  }
  return rates
}

/** Compute starting rate = lowest nightly rate across all seasons */
export function startingRate(p: Property): number | null {
  const rates = allSeasonRates(p)
  return rates.length ? Math.min(...rates) : null
}

/** Format price as $1,800. Guards against a missing rate (a season entered in
 *  Sanity without its nightly rate filled in) — every other call site in the
 *  codebase already checks for this before calling formatPrice, but the
 *  villas/[slug] season table didn't, which crashed the entire production
 *  build the moment one property (villa-kismet) had an incomplete season. */
export function formatPrice(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—'
  return '$' + n.toLocaleString('en-US')
}

/** Check if property has pool */
export function hasPool(p: Property): boolean {
  return p.viewsAndPool?.includes('private-pool') ?? false
}

/** Check if property has ocean view */
export function hasOceanView(p: Property): boolean {
  return (p.viewsAndPool?.includes('ocean-view') || p.viewsAndPool?.includes('oceanfront') || p.viewsAndPool?.includes('beachfront')) ?? false
}

/** Check if property has beachfront */
export function isBeachfront(p: Property): boolean {
  return p.viewsAndPool?.includes('beachfront') ?? false
}

/** Human-readable location label */
export function locationDisplay(p: Property): string {
  const map: Record<string, string> = {
    'punta-mita':         'Punta Mita',
    'punta-de-mita-area': 'Punta de Mita Area',
    'puerto-vallarta':    'Puerto Vallarta',
  }
  return map[p.locationLabel] || p.locationLabel
}

/** Check if a limited time promotion is still active */
export function hasActivePromotion(p: Property): boolean {
  const promo = p.promotions?.limitedTimePromotion
  if (!promo?.active) return false
  if (!promo.expiryDate) return true
  return new Date(promo.expiryDate) >= new Date()
}

/** Check if property has an active last minute deal */
export function hasLastMinuteDeal(p: Property): boolean {
  return p.promotions?.lastMinuteDeal?.active ?? false
}
