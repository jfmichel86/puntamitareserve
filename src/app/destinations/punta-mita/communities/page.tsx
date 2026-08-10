import type { Metadata } from 'next'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTIES_BY_DESTINATION_QUERY } from '@/lib/queries'
import { Property, LOC_TYPE_LABELS, startingRate, formatPriceRange } from '@/lib/utils'
import { PUNTA_MITA_COMMUNITIES } from '@/data/puntaMitaCommunities'
import { PUNTA_MITA_BEACH_CLUBS } from '@/data/puntaMitaBeachClubs'
import { CommunityPin } from '@/components/CommunityMap'
import CommunityExplorer from '@/components/CommunityExplorer'

export const revalidate = 60

// The 4 feature pills come straight from each community's real published
// properties — the same `viewsAndPool` and `bedrooms` fields already set
// on every listing in Sanity — rather than any outside research. A
// community with no listings yet never reaches these (see the `pins`
// filter below), so there's never a pill built from nothing.

// Location: which of the 4 physical-position tags (see LOC_TYPE_LABELS in
// utils.ts) any property in this community has, in priority order.
function aggregateLocation(props: Property[]): string {
  const all = new Set(props.flatMap((p) => p.viewsAndPool || []))
  const order: (keyof typeof LOC_TYPE_LABELS)[] = ['beachfront', 'oceanfront', 'golf-course', 'hillside']
  for (const key of order) if (all.has(key)) return LOC_TYPE_LABELS[key]
  return ''
}

// Views: which of the 3 "-view" tags any property in this community has —
// distinct from location above (a home can be inland but still tagged
// golf-course-view, for example).
function aggregateViews(props: Property[]): string {
  const all = new Set(props.flatMap((p) => p.viewsAndPool || []))
  const parts: string[] = []
  if (all.has('ocean-view')) parts.push('Ocean')
  if (all.has('golf-course-view')) parts.push('Golf')
  if (all.has('lake-view')) parts.push('Lake')
  if (parts.length === 0) return ''
  return `${parts.join(' & ')} ${parts.length > 1 ? 'Views' : 'View'}`
}

// Pool: private-pool / communal-pool tags, checked across every property
// in the community — if some have one and some the other, both show.
function aggregatePool(props: Property[]): string {
  const hasPrivate = props.some((p) => p.viewsAndPool?.includes('private-pool'))
  const hasCommunal = props.some((p) => p.viewsAndPool?.includes('communal-pool'))
  if (hasPrivate && hasCommunal) return 'Private & Communal Pools'
  if (hasPrivate) return 'Private Pool'
  if (hasCommunal) return 'Communal Pool'
  return ''
}

// Bedrooms: real min-to-max range across the community's actual listings,
// not a researched estimate.
function aggregateBedrooms(props: Property[]): string {
  const counts = props.map((p) => p.bedrooms).filter((n): n is number => typeof n === 'number')
  if (counts.length === 0) return ''
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  return min === max ? `${min} Bedroom${min === 1 ? '' : 's'}` : `${min}–${max} Bedrooms`
}

// What to call this community's listings in "View N ___" (Francisco's
// call — "villas" was wrong for condo-only communities like TAU
// Residences). Only names a specific type when every property in the
// community is that same type; a community that mixes villas, condos,
// and/or estates falls back to the generic "property"/"properties"
// rather than guessing which type to lead with.
function aggregatePropertyType(props: Property[]): CommunityPin['propertyTypeWord'] {
  const types = new Set(props.map((p) => p.propertyType))
  if (types.size === 1) {
    const only = [...types][0]
    if (only === 'villa' || only === 'condo' || only === 'estate') return only
  }
  return 'property'
}

// ── Compare-communities table facts ─────────────────────────────────
// These 4 only feed the compare table (see the "3 extra facts" comment
// on CommunityPin in CommunityMap.tsx) — the map hover card and grid
// pills above stay exactly as they were.

// Direct beach access: Sanity's own schema note distinguishes the two
// tags this reads — "oceanfront" = ocean-facing, no beach access,
// "beachfront" = direct beach access. Same tags aggregateLocation()
// above already reads, just interpreted for a different question.
function aggregateBeachAccess(props: Property[]): string {
  const all = new Set(props.flatMap((p) => p.viewsAndPool || []))
  if (all.has('beachfront')) return 'Direct beach access'
  if (all.has('oceanfront')) return 'Ocean-facing, no direct access'
  return 'No ocean frontage'
}

// Sunrise/Sunset/Both/None — not tracked in Sanity at all. Francisco
// confirmed each community's orientation by hand (2026-08-07); see the
// sunOrientation comment in puntaMitaCommunities.ts for the full story.
const SUN_LABELS: Record<string, string> = {
  sunset: 'Sunset',
  sunrise: 'Sunrise',
  both: 'Sunrise & Sunset',
  none: 'Neither',
}

// Price range: the real "starting from" rate on every property in the
// community, lowest to highest — not a single average, so a community
// with both entry-level and flagship villas shows its actual spread.
function aggregatePriceRange(props: Property[]): string {
  const rates = props.map((p) => startingRate(p)).filter((n): n is number => n != null)
  if (rates.length === 0) return ''
  return formatPriceRange({ min: Math.min(...rates), max: Math.max(...rates) }) || ''
}

// Straight-line ("as the pelican flies") distance in meters between two
// coordinates — plenty accurate for a same-peninsula "how close is the
// beach club" comparison, without needing a real routing/directions API.
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// Closest of the 5 real beach clubs to a community's pin, shown as an
// estimated walk time (~80 meters/minute, a relaxed pace) — every
// distance on the peninsula comes out under 20 minutes, so a walk-time
// estimate reads more useful here than raw meters or kilometers would.
function closestBeachClub(lat: number, lng: number): string {
  if (PUNTA_MITA_BEACH_CLUBS.length === 0) return ''
  let best = PUNTA_MITA_BEACH_CLUBS[0]
  let bestMeters = haversineMeters(lat, lng, best.lat, best.lng)
  for (const b of PUNTA_MITA_BEACH_CLUBS.slice(1)) {
    const d = haversineMeters(lat, lng, b.lat, b.lng)
    if (d < bestMeters) { best = b; bestMeters = d }
  }
  const minutes = Math.max(1, Math.round(bestMeters / 80))
  return `${minutes} min walk to ${best.name}`
}

const TITLE = 'Explore the Communities — Punta Mita'
const DESCRIPTION = 'Punta Mita is made up of distinct communities, each with its own character. Explore the peninsula and find the one that fits how you travel.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['https://www.mexicanreserve.com/og-image-1.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

async function getProperties(): Promise<Property[]> {
  return client.fetch(PROPERTIES_BY_DESTINATION_QUERY, { locationLabel: 'punta-mita' })
}

export default async function CommunitiesPage({
  searchParams,
}: {
  // ?calibrate=1 switches the map into the drag-to-correct setup mode —
  // see the comment on CommunityMap's `calibrate` prop. Not linked
  // anywhere on the site; it's a URL Francisco visits directly while
  // fixing pin positions, then removes once done.
  searchParams: Promise<{ calibrate?: string }>
}) {
  const { calibrate } = await searchParams
  const properties = await getProperties()

  // Only a community with at least one published property today actually
  // gets a pin/card — the data file above lists every community we have
  // rough position data for, but inventory changes over time and this
  // keeps the page honest about what's actually bookable right now.
  const pins: CommunityPin[] = PUNTA_MITA_COMMUNITIES
    .map((c): CommunityPin | null => {
      const matches = properties.filter((p) => p.communityPuntaMita === c.slug)
      if (matches.length === 0) return null
      const withPhoto = matches.find((p) => p.heroImage?.asset?._ref)
      return {
        slug: c.slug,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        description: c.description,
        location: aggregateLocation(matches),
        views: aggregateViews(matches),
        pool: aggregatePool(matches),
        bedrooms: aggregateBedrooms(matches),
        propertyTypeWord: aggregatePropertyType(matches),
        count: matches.length,
        // Sized for the map hover card's full-width 16:9 photo: up to
        // 380px wide on screen, doubled to 760px+ to stay sharp on
        // retina/high-DPI displays (the previous 600x400 fetch was both
        // too small at full size and the wrong aspect ratio — a 3:2 crop
        // being stretched into a 16:9 box — which is what was reading as
        // blurry/soft).
        photoUrl: withPhoto?.heroImage?.asset?._ref
          ? urlFor(withPhoto.heroImage!).width(800).height(450).quality(90).url()
          : undefined,
        // A separate, larger fetch — now used in two places: the "Every
        // Community" grid card's full-width photo (CommunityExplorer.tsx)
        // and the compare table's thumbnail (up to ~650px wide at a
        // 2-column comparison). Sized to match the sitewide PropertyCard's
        // own villa-photo fetch (1300x867 @ quality 90) rather than a
        // smaller one-off size, so a community photo stays sharp on a
        // retina display at both of those widths — a single-column grid
        // card (a rare case, but possible when a view filter narrows the
        // results to one community) can stretch close to this ceiling.
        comparePhotoUrl: withPhoto?.heroImage?.asset?._ref
          ? urlFor(withPhoto.heroImage!).width(1300).height(867).quality(90).url()
          : undefined,
        beachAccess: aggregateBeachAccess(matches),
        sunOrientation: SUN_LABELS[c.sunOrientation || ''] || '',
        priceRange: aggregatePriceRange(matches),
        beachClubDistance: closestBeachClub(c.lat, c.lng),
      }
    })
    .filter((p): p is CommunityPin => p !== null)

  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Punta Mita — Inside the Gates</p>
        <h1 className="pg-title">Explore the Communities</h1>
        <p className="pg-sub">A 1,500-acre peninsula made up of distinct communities — each with its own character, its own view, its own pace.</p>
      </section>

      <div className="dest-wrap dest-wrap--redesigned">
        <CommunityExplorer
          pins={pins}
          destinationSlug="punta-mita"
          calibrate={calibrate === '1'}
          beachClubs={calibrate === '1' ? PUNTA_MITA_BEACH_CLUBS : undefined}
        />

        <div className="bottom-cta">
          <div className="bottom-cta-inner">
            <div className="bottom-cta-text">
              <h3>Not sure which community is right for you?</h3>
              <p>Tell us how you like to travel and we&rsquo;ll point you to the right one.</p>
            </div>
            <div className="bottom-cta-btns">
              <Link href="/villas?destination=punta-mita" className="bottom-cta-btn bcb-primary">
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                Browse all Punta Mita villas
              </Link>
              <Link href="/contact" className="bottom-cta-btn bcb-secondary">
                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Contact our team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
