import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import { DESTINATION_SHOWCASE_QUERY } from '@/lib/queries'

// The real "who we are" page — took over the /about address from what's
// now GuestJourney.tsx at /guest-journey (Francisco's call, 2026-08-31:
// "/about" should present the team and the company, not the guest-journey
// story). Upgraded 2026-08-31 after Francisco's "too simple, kind of dull"
// feedback on the first minimal pass — added the "Where We Operate" photo
// triptych (real destination photos, same query/pattern /destinations
// already uses) and moved the stats band to the dark .dest-numbers
// treatment used on destination pages, so the page alternates light/dark/
// photo instead of reading as one long stack of plain text. The founder
// quote and every fact here is still exactly what was already verified
// elsewhere on the site — no invented history, team bios, or headcount.

type HeroOnly = { heroImage?: { asset?: { _ref: string }; hotspot?: { x: number; y: number } } }
type ShowcasePhotos = { puntaMita: HeroOnly | null; puntaDeMita: HeroOnly | null; puertoVallarta: HeroOnly | null }

// Same three destinations, hrefs, and hook copy as the DESTINATIONS array
// on /destinations/page.tsx — copied verbatim rather than re-written, so
// this page's "Where We Operate" section never says something different
// about a destination than the destinations page itself does.
const OPERATE = [
  {
    key: 'puntaMita' as const,
    href: '/punta-mita',
    name: 'Punta Mita',
    eyebrow: 'Inside the Gates',
    hook: 'Where the Four Seasons, St. Regis, and two Jack Nicklaus courses share one private peninsula.',
    fallback: 'linear-gradient(160deg,#1A6A8A 0%,#0E4A65 55%,#071E2A 100%)',
  },
  {
    key: 'puntaDeMita' as const,
    href: '/punta-de-mita',
    name: 'Punta de Mita Area',
    eyebrow: 'Village & Surf',
    hook: 'Village life and surf breaks, just outside the gates.',
    fallback: 'linear-gradient(160deg,#2A6040 0%,#163C28 55%,#081A12 100%)',
  },
  {
    key: 'puertoVallarta' as const,
    href: '/puerto-vallarta',
    name: 'Puerto Vallarta',
    eyebrow: 'City & Nightlife',
    hook: 'A historic beach city with a livelier pace, minutes south.',
    fallback: 'linear-gradient(160deg,#8A6A1A 0%,#5A4410 55%,#2A2008 100%)',
  },
]

async function getDestinationPhotos(): Promise<ShowcasePhotos> {
  return client.fetch(DESTINATION_SHOWCASE_QUERY)
}

export default async function AboutUs() {
  const photos = await getDestinationPhotos()

  return (
    <section id="about-us-body">
      {/* Same eyebrow/headline/rule/support pattern as .dest-why on the
          Destinations page (the "Why Punta Mita" statement), not a plain
          paragraph — a flat centered paragraph was the single biggest
          reason this page read as generic (Francisco's feedback,
          2026-08-31): every other brand-statement moment on the site opens
          with a confident stated headline before the supporting detail,
          and this one didn't. */}
      <div className="dest-why reveal">
        <span className="dest-why-eyebrow">Why Mexican Reserve</span>
        <p className="dest-why-headline">An exceptional collection across Mexico, represented by one team — every villa personally vetted, every stay booked direct.</p>
        <span className="dest-why-rule" />
        <p className="dest-why-support">Currently Punta Mita, Punta de Mita, and Puerto Vallarta, with more destinations on the way. Every stay is booked directly with us rather than through a listing platform — so there&rsquo;s always a real person, not a platform, on the other end of your reservation.</p>
      </div>

      {/* ── Where We Operate ────────────────────────────────────────
          Real destination photos (same query /destinations uses), so the
          company story is anchored in the actual places we operate rather
          than staying purely textual. */}
      <div className="dest-triptych-wrap">
        <div className="dest-triptych-head">
          <p className="dest-triptych-eyebrow">Where We Operate</p>
          <h2 className="dest-triptych-title">One local team, <em>every destination</em></h2>
        </div>
        <div className="dest-triptych">
          {OPERATE.map((d) => {
            const doc = photos[d.key]
            const bg = doc?.heroImage?.asset?._ref
              ? `url('${urlFor(doc.heroImage!).width(900).height(600).quality(85).url()}')`
              : d.fallback
            return (
              <Link key={d.key} href={d.href} className="dest-trip-card" style={{ background: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="dest-trip-content">
                  <p className="dest-trip-eyebrow">{d.eyebrow}</p>
                  <p className="dest-trip-name">{d.name}</p>
                  <p className="dest-trip-hook">{d.hook}</p>
                  <span className="dest-trip-cta">Explore {d.name} →</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Proof ────────────────────────────────────────────────────
          Same three stats as the old combined page, now in the dark
          .dest-numbers treatment already used on destination pages —
          more visual contrast than the original light card row, and one
          consistent "in numbers" language across the site. */}
      <div className="au-proof-lead-wrap">
        <p className="journey-proof-lead reveal">This isn&rsquo;t a promise — it&rsquo;s a track record.</p>
      </div>
      <div className="dest-numbers reveal">
        <div className="dest-numbers-grid">
          <div className="dest-numbers-item">
            <span className="dest-numbers-icon"><svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg></span>
            <span className="dest-numbers-value">150+</span>
            <span className="dest-numbers-label">Properties</span>
            <span className="dest-numbers-sub">Across Punta Mita, Punta de Mita, and Puerto Vallarta</span>
          </div>
          <div className="dest-numbers-item">
            <span className="dest-numbers-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg></span>
            <span className="dest-numbers-value">15 yrs</span>
            <span className="dest-numbers-label">Combined Expertise</span>
            <span className="dest-numbers-sub">One local team, working every destination we serve</span>
          </div>
          <div className="dest-numbers-item">
            <span className="dest-numbers-icon"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg></span>
            <span className="dest-numbers-value">100%</span>
            <span className="dest-numbers-label">Personally Visited</span>
            <span className="dest-numbers-sub">Every home vetted before we recommend it</span>
          </div>
        </div>
      </div>

      {/* ── The Founder ──────────────────────────────────────────────
          Quote text moved here as-is from the old combined /about page —
          still the one section that should sound like Francisco, not a
          copywriter, same note as before applies if it's ever revised.
          Layout changed 2026-08-31 (Francisco: "still boring"): a giant
          faint quote mark replaces the centered "--no-photo" treatment,
          pulling the block left instead of centering it — this page's one
          deliberate asymmetric moment, everything else here is a centered,
          symmetric block. */}
      <div className="about-founder about-founder--statement reveal">
        <span className="about-founder-mark-quote" aria-hidden="true">&ldquo;</span>
        <div className="about-founder-text">
          <span className="s-div" />
          <p className="about-founder-quote">&ldquo;Personally&rdquo; isn&rsquo;t a tagline for us — it&rsquo;s how we work. We&rsquo;ve walked through every property on this site, met the people who care for them, and built relationships we&rsquo;d trust with our own family&rsquo;s trip. That&rsquo;s what we bring to yours.</p>
          <p className="about-founder-name">Francisco M., Founder</p>
        </div>
      </div>

      {/* ── Bridge ───────────────────────────────────────────────────
          Mirrors GuestJourney.tsx's own bridge link back the other way,
          so the two pages point at each other instead of either one
          being a dead end. */}
      <p className="journey-bridge reveal">
        Curious how a stay actually works? <Link href="/guest-journey" className="journey-bridge-link">Read The Guest Journey</Link>
      </p>

      <section className="help-cta">
        <div className="help-cta-text">
          <h2>Ready to start planning?</h2>
          <p>Tell us your dates, your group, and what matters most — we&rsquo;ll take it from there.</p>
        </div>
        <div className="help-cta-btns">
          <a className="help-btn help-btn-primary" href="https://wa.me/523224341968?text=Hi%2C%20I%27d%20like%20to%20start%20planning%20my%20stay" target="_blank" rel="noopener">WhatsApp us</a>
          <a className="help-btn help-btn-secondary" href="mailto:rentals@mexicanreserve.com">Email us</a>
        </div>
      </section>
    </section>
  )
}
