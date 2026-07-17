import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'The general terms that govern use of this website and reservations booked with Mexican Reserve.',
}

export default function TermsAndConditionsPage() {
  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Legal</p>
        <h1 className="pg-title">Terms and <em>Conditions</em></h1>
        <p className="pg-sub">The general terms that govern your use of this website and any reservation made with us.</p>
      </section>

      <div className="legal-wrap">
        <p className="legal-updated">Last updated July 2026</p>

        <p className="legal-intro">
          These terms apply whenever you browse this website or book a stay through Mexican Reserve
          (&ldquo;we,&rdquo; &ldquo;us&rdquo;). By using this site or submitting an inquiry, you agree to the terms
          below. For how we handle your personal information, see our{' '}
          <Link href="/privacy-policy">Privacy Policy</Link>. For deposit, refund, and date-change terms, see our{' '}
          <Link href="/cancellation-policy">Cancellation Policy</Link> — those two pages are part of these terms by
          reference.
        </p>

        <div className="detail-section">
          <span className="sec-label">01</span>
          <h2 className="sec-title">Who We Are</h2>
          <p className="legal-body-text">
            Mexican Reserve is a vacation rental and concierge service based in Punta de Mita, Nayarit,
            México. We represent a curated portfolio of privately owned villas, estates, and condos — the properties
            themselves are independently owned, and we act as your booking agent and on-the-ground concierge
            throughout your stay.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">02</span>
          <h2 className="sec-title">Booking Process</h2>
          <p className="legal-body-text">
            Availability and rates shown on this site are indicative and not a confirmed reservation. A booking is
            only confirmed once we&rsquo;ve issued written confirmation and received your deposit, at which point the
            deposit, payment, and cancellation terms in our{' '}
            <Link href="/cancellation-policy">Cancellation Policy</Link> apply. A refundable security deposit equal
            to one night&rsquo;s rental rate, independent of season, applies to reservations. Any property-specific
            rules — house rules, minimum-stay requirements — will be outlined in your written booking confirmation
            prior to arrival.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">03</span>
          <h2 className="sec-title">Rates &amp; Availability</h2>
          <p className="legal-body-text">
            We make every effort to keep rates, availability, photos, and descriptions accurate and current. Even so,
            details on this site are subject to change without notice until a booking is confirmed in writing, and
            individual properties may vary slightly from their photos over time (seasonal landscaping, furnishing
            updates, and similar minor changes made by the owner). All rates are quoted in U.S. dollars unless stated
            otherwise, and exclude any applicable taxes or fees unless specified.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">04</span>
          <h2 className="sec-title">Guest Conduct &amp; Property Use</h2>
          <p className="legal-body-text">
            Guests are expected to treat each property with the same care as their own home, respect the maximum
            occupancy and any house rules provided at booking, and comply with local laws while in Punta Mita. Events
            or gatherings beyond the confirmed guest count require our prior written consent. Pets are not permitted
            at our properties as a general policy; an exception is occasionally possible on a case-by-case basis, but
            only with the property owner&rsquo;s prior written authorization and a photo of the pet submitted in
            advance — arriving with an unauthorized pet is treated as a violation of these terms. We reserve the
            right to end a stay without refund if these terms are seriously or repeatedly violated.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">05</span>
          <h2 className="sec-title">Liability &amp; Assumption of Risk</h2>
          <p className="legal-body-text">
            Pools, ocean access, golf carts, and other property amenities are used at each guest&rsquo;s own risk. To
            the fullest extent permitted by law, Mexican Reserve and the property owners are not liable for
            injury, loss, or damage arising from a guest&rsquo;s use of a property or its amenities, except where
            caused by our own negligence. We strongly recommend travel insurance, as noted in our{' '}
            <Link href="/cancellation-policy">Cancellation Policy</Link>.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">06</span>
          <h2 className="sec-title">Website Content &amp; Intellectual Property</h2>
          <p className="legal-body-text">
            The text, photography, and design on this site belong to Mexican Reserve or are used under
            license from the respective property owners and photographers. Please don&rsquo;t reproduce or
            redistribute this content without our written permission.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">07</span>
          <h2 className="sec-title">Governing Law</h2>
          <p className="legal-body-text">
            These terms are governed by the laws of México and the state of Nayarit. Any dispute arising from these
            terms or a reservation will be handled under that jurisdiction.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">08</span>
          <h2 className="sec-title">Changes to These Terms</h2>
          <p className="legal-body-text">
            We may update these terms from time to time as our practices change. The &ldquo;last updated&rdquo; date
            at the top of this page reflects the most recent revision. Terms in effect at the time you book apply to
            that reservation.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">09</span>
          <h2 className="sec-title">Contact Us</h2>
          <p className="legal-body-text">
            Questions about these terms? Reach us at{' '}
            <a href="mailto:rentals@mexicanreserve.com">rentals@mexicanreserve.com</a>.
          </p>
          <Link href="/contact" className="legal-cta">
            Contact our team
            <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
        </div>
      </div>
    </>
  )
}
