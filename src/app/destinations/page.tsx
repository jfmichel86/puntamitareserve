import type { Metadata } from 'next'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import { DESTINATION_SHOWCASE_QUERY } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Destinations',
  description: 'Punta Mita, the Punta de Mita area, and Puerto Vallarta — every Mexican Reserve destination, one local team.',
}

type HeroOnly = { heroImage?: { asset?: { _ref: string }; hotspot?: { x: number; y: number } } }
type ShowcaseResult = { puntaMita: HeroOnly | null; puntaDeMita: HeroOnly | null; puertoVallarta: HeroOnly | null }

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
    description: 'Mexico’s most exclusive gated peninsula, home to the Four Seasons, St. Regis, and two Jack Nicklaus signature golf courses. Every villa here sits inside that same private gate, with the quiet beaches, security, and polish that come with it — not added on, built in.',
    tags: ['Gated', 'Golf', 'Beachfront'],
    fallback: 'linear-gradient(160deg,#1A6A8A 0%,#0E4A65 55%,#071E2A 100%)',
  },
  {
    key: 'puntaDeMita' as const,
    href: '/destinations/punta-de-mita',
    name: 'Punta de Mita Area',
    suffix: undefined as string | undefined,
    description: 'Just outside the gates, a laid-back village built around some of the Pacific coast’s best surf breaks. Expect open-air seafood, sunset sessions in the water, and a slower, barefoot pace minutes from the private peninsula.',
    tags: ['Village', 'Surf', 'Laid-back'],
    fallback: 'linear-gradient(160deg,#2A6040 0%,#163C28 55%,#081A12 100%)',
  },
  {
    key: 'puertoVallarta' as const,
    href: '/destinations/puerto-vallarta',
    name: 'Puerto Vallarta',
    suffix: undefined as string | undefined,
    description: 'A historic beach city with cobblestone streets, a lively malecón, and a livelier pace than the peninsula’s quiet exclusivity. Restaurants, nightlife, and boutique shopping sit alongside beachfront living, minutes south by car or boat.',
    tags: ['City', 'Dining', 'Nightlife'],
    fallback: 'linear-gradient(160deg,#8A6A1A 0%,#5A4410 55%,#2A2008 100%)',
  },
]

export default async function DestinationsIndexPage() {
  const photos = await client.fetch<ShowcaseResult>(DESTINATION_SHOWCASE_QUERY)

  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Where We Operate</p>
        <h1 className="pg-title">Our <em>Destinations</em></h1>
        <p className="pg-sub">Three destinations, one local team — every property is minutes from world-class beaches, golf, and dining.</p>
      </section>

      <div className="destinations-index">
        <div className="dest-feature-list">
          {DESTINATIONS.map((d, i) => {
            const doc = photos[d.key]
            // .dest-feature-media renders at a 4:3 box (~620px wide max) — the
            // old 1000x1000 square request didn't match that shape at all,
            // under-supplying width and over-supplying height. Sized to the
            // real ratio with retina headroom, plus an explicit quality.
            const bg = doc?.heroImage?.asset?._ref
              ? `url('${urlFor(doc.heroImage!).width(1400).height(1050).quality(88).url()}')`
              : d.fallback

            const media = (
              <div className="dest-feature-media" key="media">
                <div className="dest-feature-bg" style={{ background: bg, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              </div>
            )

            const content = (
              <div className="dest-feature-content" key="content">
                <span className="dest-feature-index">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="dest-feature-name">
                  {d.name}
                  {d.suffix && <span className="dest-card-name-suffix"> — {d.suffix}</span>}
                </h2>
                <p className="dest-feature-desc">{d.description}</p>
                <div className="dest-feature-tags">
                  {d.tags.map((tag) => <span key={tag} className="dest-feature-tag">{tag}</span>)}
                </div>
                <Link href={d.href} className="dest-feature-link">
                  Explore {d.name}
                  <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>
              </div>
            )

            return (
              <div className="dest-feature-row" key={d.key}>
                {i % 2 === 0 ? <>{media}{content}</> : <>{content}{media}</>}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
