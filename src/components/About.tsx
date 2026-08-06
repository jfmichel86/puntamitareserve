import Image from 'next/image'
import Link from 'next/link'

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

export default function About() {
  return (
    <section id="about">
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

      {/* ── Proof ────────────────────────────────────────────────────
          Same three stats as before, now framed as evidence for the
          journey above rather than a stand-alone bio block. */}
      <div className="journey-proof">
        <div className="journey-proof-inner">
          <p className="journey-proof-lead reveal">This isn&rsquo;t a promise — it&rsquo;s a track record.</p>
          <div className="about-stats-row">
            <div className="about-stat reveal">
              <svg className="stat-icon" viewBox="0 0 24 24"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
              <div className="stat-number">150+</div>
              <div className="stat-label">Properties across Mexico</div>
            </div>
            <div className="about-stat reveal">
              <svg className="stat-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
              <div className="stat-number">15 yrs</div>
              <div className="stat-label">Combined local expertise</div>
            </div>
            <div className="about-stat reveal">
              <svg className="stat-icon" viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
              <div className="stat-number">100%</div>
              <div className="stat-label">Homes personally visited before we recommend them</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── The People ───────────────────────────────────────────────
          Draft quote — this is the one section that should sound like
          you, not a copywriter. Swap the placeholder photo for a real
          one of you or the team, and edit the quote to match your own
          voice before this goes live. */}
      <div className="about-founder reveal">
        <div className="about-founder-photo about-founder-photo-placeholder">
          <span>Photo placeholder — you or your team, on-site at a property</span>
        </div>
        <div className="about-founder-text">
          <p className="about-founder-quote">&ldquo;Personally&rdquo; isn&rsquo;t a tagline for us — it&rsquo;s how we work. We&rsquo;ve walked through every property on this site, met the people who care for them, and built relationships we&rsquo;d trust with our own family&rsquo;s trip. That&rsquo;s what we bring to yours.</p>
          <p className="about-founder-name">Francisco Michel, Founder</p>
        </div>
      </div>

      {/* ── Bridge ───────────────────────────────────────────────────
          A quiet path deeper into the site for anyone who isn't ready
          to inquire yet — without this, the page had nowhere to go
          except straight to "email us". */}
      <p className="journey-bridge reveal">
        Curious what&rsquo;s available? <Link href="/villas" className="journey-bridge-link">Browse our properties</Link>
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
          <a className="help-btn help-btn-primary" href="https://wa.me/523313619889?text=Hi%2C%20I%27d%20like%20to%20start%20planning%20my%20stay" target="_blank" rel="noopener">WhatsApp us</a>
          <a className="help-btn help-btn-secondary" href="mailto:rentals@mexicanreserve.com">Email us</a>
        </div>
      </section>
    </section>
  )
}
