import Image from 'next/image'
import Link from 'next/link'

// The four-stage guest experience narrative — lives at /guest-journey now,
// split out of what used to be the single /about page (see AboutUs.tsx for
// the real company/team content that took over the /about address). The
// proof stats and founder quote that used to close this page moved to
// AboutUs.tsx too — they're "who we are" credibility markers, not part of
// the guest-journey story itself.
const JOURNEY = [
  {
    num: '01',
    title: 'Before You Arrive',
    desc: 'Your concierge already knows your travel dates, your group, and your preferences — the villa is matched to you, not the other way around. A private chef, a stocked bar, an early check-in — arranged before you land.',
    photo: '/images/about/journey-01-before-you-arrive.jpg',
  },
  {
    num: '02',
    title: 'Upon Arrival',
    desc: 'A private transfer meets you at the airport. The villa is open, cooled, and stocked exactly as requested. Staff are introduced by name — not left for you to figure out.',
    photo: '/images/about/journey-02-upon-arrival.jpg',
    // Only this stage gets a taller crop — same source photo, just a
    // different box shape — so the sequence doesn't read as four
    // identical template tiles in a row.
    tall: true,
  },
  {
    num: '03',
    title: 'During Your Stay',
    desc: 'A private chef, a boat charter, a last-minute reservation — one message to your concierge is all it takes. The same team that greeted you handles everything, start to finish.',
    photo: '/images/about/journey-03-during-your-stay.jpg',
  },
  {
    num: '04',
    title: 'Beyond the Villa',
    desc: 'Relationships built over years get you the table that’s fully booked, the tee time that isn’t listed online, the excursion no one else can arrange. That network is yours the moment you book.',
    photo: '/images/about/journey-04-beyond-the-villa.jpg',
  },
]

export default function GuestJourney() {
  return (
    <section id="guest-journey-body">
      {/* ── The Guest Journey ─────────────────────────────────────────
          Four stages, alternating photo/text. Photos live in
          /public/images/about/ — same static-file approach as the
          destination pages' beach club/golf photos. Uses next/image
          (fill + sizes) instead of a plain background-image div so each
          photo is served at the right size for the visitor's screen and
          only loads once it's about to scroll into view. */}
      <div className="journey-wrap">
        <div className="journey-lead reveal">
          <p className="journey-eyebrow">The Guest Journey</p>
          <h2 className="journey-heading">What &ldquo;personally&rdquo; actually means</h2>
          <p className="journey-sub">Four stages, one team, zero details left to chance.</p>
        </div>

        {JOURNEY.map((stage, i) => (
          <div className={`journey-stage reveal${i % 2 === 1 ? ' is-reverse' : ''}`} key={stage.num}>
            <div className={`journey-photo${stage.tall ? ' journey-photo--tall' : ''}`}>
              <Image
                src={stage.photo}
                alt={stage.title}
                fill
                sizes="(max-width: 960px) 100vw, 50vw"
                className="journey-photo-bg"
              />
            </div>
            <div className="journey-text">
              <span className="journey-ghost-num" aria-hidden="true">{stage.num}</span>
              <span className="journey-num">{stage.num}</span>
              <h3 className="journey-title">{stage.title}</h3>
              <p className="journey-desc">{stage.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bridge ───────────────────────────────────────────────────
          Points to the new About Us page now — that's where the proof
          stats and founder quote that used to sit right here now live,
          so a reader curious "who's actually behind this" has somewhere
          to go instead of the page just ending. */}
      <p className="journey-bridge reveal">
        Curious who&rsquo;s behind it? <Link href="/about" className="journey-bridge-link">Meet Mexican Reserve</Link>
      </p>

      {/* ── Close ────────────────────────────────────────────────────
          Same dark CTA band the Villas page ends on, so the site's
          closing gesture feels consistent from page to page. */}
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
