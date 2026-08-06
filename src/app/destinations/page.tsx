import type { Metadata } from 'next'
import { client, urlFor } from '@/lib/sanity'
import { DESTINATION_SHOWCASE_QUERY } from '@/lib/queries'
import { destinationPriceRange, formatPriceRange } from '@/lib/utils'
import DestinationsRegionalMap, { type RegionalMapDest } from '@/components/DestinationsRegionalMap'

type HeroOnly = { heroImage?: { asset?: { _ref: string }; hotspot?: { x: number; y: number } } }
type RateOnly = { priceOnRequest?: boolean; seasons?: { nightlyRate?: number; bedroomRates?: { nightlyRate?: number }[] }[] }
type ShowcaseResult = {
  puntaMita: HeroOnly | null; puntaDeMita: HeroOnly | null; puertoVallarta: HeroOnly | null
  puntaMitaRates: RateOnly[]; puntaDeMitaRates: RateOnly[]; puertoVallartaRates: RateOnly[]
}

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Destinations'
  const description = 'Punta Mita, the Punta de Mita area, and Puerto Vallarta — every Mexican Reserve destination, one local team.'
  // Punta Mita is the flagship destination, so its photo stands in for the
  // group in social share previews.
  const photos = await client.fetch<ShowcaseResult>(DESTINATION_SHOWCASE_QUERY)
  // Falls back to the sitewide default photo (set in layout.tsx) rather than
  // no image, on the unlikely chance Punta Mita has no hero photo set.
  const ogImage = photos.puntaMita?.heroImage?.asset?._ref
    ? urlFor(photos.puntaMita.heroImage).width(1200).height(630).quality(85).url()
    : 'https://www.mexicanreserve.com/og-image-1.jpg'

  return {
    title,
    description,
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// Same three destinations as Destination.tsx (homepage) and Nav.tsx — this
// small list is duplicated across all three rather than shared, matching
// how the codebase already handles it elsewhere. Richer copy + tags here
// than the homepage's compact card version, since this page's whole job is
// to sell the three destinations, not tease them.
const DESTINATIONS = [
  {
    key: 'puntaMita' as const,
    href: '/destinations/punta-mita',
    name: 'Punta Mita',
    suffix: 'Inside the Gates',
    // Short hook for the map's hover card — same line Destination.tsx uses
    // on the homepage, so the two stay consistent.
    hook: 'Where the Four Seasons, St. Regis, and two Jack Nicklaus courses share one private gate.',
    // Private Beach Clubs and Dining are more distinctive/valuable to lead
    // with here than the generic Gated/Beachfront — per Francisco's call.
    tags: ['Golf', 'Private Beach Clubs', 'Dining'],
    fallback: 'linear-gradient(160deg,#1A6A8A 0%,#0E4A65 55%,#071E2A 100%)',
  },
  {
    key: 'puntaDeMita' as const,
    href: '/destinations/punta-de-mita',
    name: 'Punta de Mita Area',
    suffix: undefined as string | undefined,
    hook: 'Village life and surf breaks, just outside the gates.',
    tags: ['Village', 'Surf', 'Laid-back'],
    fallback: 'linear-gradient(160deg,#2A6040 0%,#163C28 55%,#081A12 100%)',
  },
  {
    key: 'puertoVallarta' as const,
    href: '/destinations/puerto-vallarta',
    name: 'Puerto Vallarta',
    suffix: undefined as string | undefined,
    hook: 'A historic beach city with a livelier pace, minutes south.',
    tags: ['City', 'Dining', 'Nightlife'],
    fallback: 'linear-gradient(160deg,#8A6A1A 0%,#5A4410 55%,#2A2008 100%)',
  },
]

export default async function DestinationsIndexPage() {
  const photos = await client.fetch<ShowcaseResult>(DESTINATION_SHOWCASE_QUERY)

  // Cheapest property's lowest season -> priciest property's highest
  // season, across every published property in the destination (not just
  // the one whose photo we show) — see destinationPriceRange in utils.ts.
  const ratesByKey: Record<RegionalMapDest['key'], RateOnly[]> = {
    puntaMita: photos.puntaMitaRates,
    puntaDeMita: photos.puntaDeMitaRates,
    puertoVallarta: photos.puertoVallartaRates,
  }

  // One real photo per destination (or its gradient fallback) — shown in
  // the map's own destination-list panel now, so this is the only photo
  // size this page needs.
  const mapDests: RegionalMapDest[] = DESTINATIONS.map((d) => {
    const doc = photos[d.key]
    const bg = doc?.heroImage?.asset?._ref
      ? `url('${urlFor(doc.heroImage!).width(900).height(600).quality(85).url()}')`
      : d.fallback
    const priceRange = formatPriceRange(destinationPriceRange(ratesByKey[d.key] || [])) ?? undefined
    return { key: d.key, href: d.href, name: d.name, suffix: d.suffix, hook: d.hook, tags: d.tags, bg, priceRange }
  })

  return (
    <>
      {/* Plain .pg-header, same pattern every other simple page on the site
          uses (villas, experiences, about, etc.) — the map below is the
          page's real visual centerpiece now, so the header just needs to
          introduce it in text, not carry its own graphic. */}
      <section className="pg-header">
        <p className="pg-eyebrow">Where We Operate</p>
        <h1 className="pg-title">Our <em>Destinations</em></h1>
        <p className="pg-sub">Three destinations, one local team — every property is minutes from world-class beaches, golf, and dining. Click the map to explore.</p>
      </section>

      {/* Map (right) + destination list (left) in one split, 16:9 frame.
          Clicking the pin reveals all three destinations at once, each
          connected to its shape on the map by a thin line — this replaces
          both the old hover-card popup AND the separate photo/copy grid
          that used to sit below the map, since the list panel already
          carries a photo, hook, and tags for every destination. */}
      <div className="destinations-index">
        <DestinationsRegionalMap destinations={mapDests} />
      </div>
    </>
  )
}
