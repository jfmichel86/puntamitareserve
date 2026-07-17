import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import { DESTINATION_SHOWCASE_QUERY } from '@/lib/queries'

type HeroOnly = { heroImage?: { asset?: { _ref: string }; hotspot?: { x: number; y: number } } }
type ShowcaseResult = { puntaMita: HeroOnly | null; puntaDeMita: HeroOnly | null; puertoVallarta: HeroOnly | null }

const DESTINATIONS = [
  {
    key: 'puntaMita' as const,
    href: '/destinations/punta-mita',
    name: 'Punta Mita',
    suffix: 'Inside the Gates',
    hook: 'Where the Four Seasons, St. Regis, and two Jack Nicklaus courses share one private gate.',
    fallback: 'linear-gradient(160deg,#1A6A8A 0%,#0E4A65 55%,#071E2A 100%)',
  },
  {
    key: 'puntaDeMita' as const,
    href: '/destinations/punta-de-mita',
    name: 'Punta de Mita Area',
    suffix: undefined as string | undefined,
    hook: 'Village life and surf breaks, just outside the gates.',
    fallback: 'linear-gradient(160deg,#2A6040 0%,#163C28 55%,#081A12 100%)',
  },
  {
    key: 'puertoVallarta' as const,
    href: '/destinations/puerto-vallarta',
    name: 'Puerto Vallarta',
    suffix: undefined as string | undefined,
    hook: 'A historic beach city with a livelier pace, minutes south.',
    fallback: 'linear-gradient(160deg,#8A6A1A 0%,#5A4410 55%,#2A2008 100%)',
  },
]

export default async function Destination() {
  const photos = await client.fetch<ShowcaseResult>(DESTINATION_SHOWCASE_QUERY)

  return (
    <section id="destination">
      <div className="dest-showcase-hdr">
        <p className="s-eye">Where we operate</p>
        <div className="s-div" />
        <h2 className="s-title">Three destinations, <em>one local team</em></h2>
        <p className="s-body">From the private peninsula we&rsquo;re named for to the historic streets of Puerto Vallarta — every property is minutes from world-class beaches, golf, and dining, and every stay is supported by the same local team.</p>
      </div>

      <div className="dest-grid">
        {DESTINATIONS.map((d) => {
          const doc = photos[d.key]
          // Requested well above the card's actual on-screen size (capped around
          // 380px wide on desktop, up to ~450px on mobile) so it still looks sharp
          // on retina/high-DPI screens — plus an explicit quality, matching the
          // 85-92 standard used for photos elsewhere on the site (this had none).
          const bg = doc?.heroImage?.asset?._ref
            ? `url('${urlFor(doc.heroImage!).width(1200).height(1600).quality(88).url()}')`
            : d.fallback
          return (
            <Link key={d.key} href={d.href} className="dest-card">
              <div className="dest-card-bg" style={{ background: bg, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="dest-card-overlay" />
              <div className="dest-card-body">
                <div className="dest-card-name">
                  {d.name}
                  {d.suffix && <span className="dest-card-name-suffix"> — {d.suffix}</span>}
                </div>
                <p className="dest-card-hook">{d.hook}</p>
                <span className="dest-card-link">
                  Explore
                  <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
