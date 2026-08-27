import type { Metadata } from 'next'
import Link from 'next/link'
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
    href: '/punta-mita',
    name: 'Punta Mita',
    suffix: 'Inside the Gates',
    // Short hook for the map's hover card — same line Destination.tsx uses
    // on the homepage, so the two stay consistent.
    hook: 'Where the Four Seasons, St. Regis, and two Jack Nicklaus courses share one private peninsula.',
    // Private Beach Clubs and Dining are more distinctive/valuable to lead
    // with here than the generic Gated/Beachfront — per Francisco's call.
    tags: ['Golf', 'Private Beach Clubs', 'Dining'],
    fallback: 'linear-gradient(160deg,#1A6A8A 0%,#0E4A65 55%,#071E2A 100%)',
  },
  {
    key: 'puntaDeMita' as const,
    href: '/punta-de-mita',
    name: 'Punta de Mita Area',
    suffix: undefined as string | undefined,
    hook: 'Village life and surf breaks, just outside the gates.',
    tags: ['Village', 'Surf', 'Laid-back'],
    fallback: 'linear-gradient(160deg,#2A6040 0%,#163C28 55%,#081A12 100%)',
  },
  {
    key: 'puertoVallarta' as const,
    href: '/puerto-vallarta',
    name: 'Puerto Vallarta',
    suffix: undefined as string | undefined,
    hook: 'A historic beach city with a livelier pace, minutes south.',
    tags: ['City', 'Dining', 'Nightlife'],
    fallback: 'linear-gradient(160deg,#8A6A1A 0%,#5A4410 55%,#2A2008 100%)',
  },
]

// Short two-word eyebrow for each destination's photo triptych card below
// the map — deliberately separate from the map's `suffix` field (only
// Punta Mita has one, "Inside the Gates", used to disambiguate its page
// title) so all three triptych cards get an equally-weighted label instead
// of two of them having none.
const TRIPTYCH_EYEBROW: Record<RegionalMapDest['key'], string> = {
  puntaMita: 'Inside the Gates',
  puntaDeMita: 'Village & Surf',
  puertoVallarta: 'City & Nightlife',
}

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

  // One real photo per destination (or its gradient fallback) — reused by
  // both the map's destination-list panel AND the photo triptych below it,
  // so this is the only photo size this page needs.
  const mapDests: RegionalMapDest[] = DESTINATIONS.map((d) => {
    const doc = photos[d.key]
    const bg = doc?.heroImage?.asset?._ref
      ? `url('${urlFor(doc.heroImage!).width(900).height(600).quality(85).url()}')`
      : d.fallback
    const priceRange = formatPriceRange(destinationPriceRange(ratesByKey[d.key] || [])) ?? undefined
    return { key: d.key, href: d.href, name: d.name, suffix: d.suffix, hook: d.hook, tags: d.tags, bg, priceRange }
  })

  // Real published-property count, not a placeholder — the same "...Rates"
  // arrays the map's price ranges are built from already have exactly one
  // entry per published property in that destination (see the query
  // comment above), so summing their lengths is the true villa count
  // rather than a number someone has to remember to update by hand.
  const totalVillas = (photos.puntaMitaRates?.length || 0) + (photos.puntaDeMitaRates?.length || 0) + (photos.puertoVallartaRates?.length || 0)

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

      {/* One-line trust strip — a second, quieter beat of authority between
          the header and the map, using the real published-property count
          computed above rather than a placeholder figure. */}
      <div className="dest-stat-strip">
        <div className="dest-stat-item"><b>3</b> Destinations</div>
        <span className="dest-stat-dot" aria-hidden="true" />
        <div className="dest-stat-item"><b>{totalVillas}+</b> Private Villas</div>
        <span className="dest-stat-dot" aria-hidden="true" />
        <div className="dest-stat-item">One Concierge Team, <b>24/7</b></div>
      </div>

      {/* Map (right) + destination list (left) in one split, 16:9 frame.
          Clicking the pin reveals all three destinations at once, each
          connected to its shape on the map by a thin line — this replaces
          both the old hover-card popup AND the separate photo/copy grid
          that used to sit below the map, since the list panel already
          carries a photo, hook, and tags for every destination. */}
      <div className="destinations-index">
        <DestinationsRegionalMap destinations={mapDests} />
      </div>

      {/* Photo triptych — reintroduces real destination photography below
          the map (reusing the exact same bg/hook/tags data the map's list
          panel already has, so there's no extra Sanity fetch), and doubles
          as a second navigation path for visitors who'd rather scroll and
          click a photo than click the map pin. */}
      <div className="dest-triptych-wrap">
        <div className="dest-triptych-head">
          <p className="dest-triptych-eyebrow">Three Ways to Stay</p>
          <h2 className="dest-triptych-title">Every destination, <em>at a glance</em></h2>
        </div>
        <div className="dest-triptych">
          {mapDests.map((d) => (
            <Link key={d.key} href={d.href} className="dest-trip-card" style={{ background: d.bg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="dest-trip-content">
                <p className="dest-trip-eyebrow">{TRIPTYCH_EYEBROW[d.key]}</p>
                <p className="dest-trip-name">{d.name}</p>
                {/* Punta Mita's hook is the one noticeably longer sentence
                    of the three — at the same narrow width as the other
                    two cards it wrapped to 3 lines instead of 2, throwing
                    off the row's alignment. Widening it just for this card
                    (dest-trip-hook--wide) gets it back to 2 lines without
                    changing how Punta de Mita Area / Puerto Vallarta wrap —
                    those two already read as 2 lines at the narrower width
                    and stay that way. */}
                <p className={`dest-trip-hook${d.key === 'puntaMita' ? ' dest-trip-hook--wide' : ''}`}>{d.hook}</p>
                <span className="dest-trip-cta">Explore {d.name} →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Short narrative band — a beat of brand voice between the practical
          (map, photos) and the transactional (Welcome Offer right below),
          explaining briefly why Mexican Reserve operates across three
          destinations instead of one. */}
      <div className="dest-narrative">
        <blockquote>&ldquo;One local team, three coastlines — so wherever you land, the villa, the welcome, and the standard of service are exactly the same.&rdquo;</blockquote>
        <cite>The Mexican Reserve Promise</cite>
      </div>
    </>
  )
}
