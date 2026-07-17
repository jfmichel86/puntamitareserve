import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Welcome Offer Terms',
  description: 'Terms and conditions for the 10% welcome offer for new newsletter subscribers.',
}

export default function WelcomeOfferTermsPage() {
  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Legal</p>
        <h1 className="pg-title">Welcome Offer <em>Terms</em></h1>
        <p className="pg-sub">The terms below apply to the 10% welcome offer for new newsletter subscribers.</p>
      </section>

      <div className="legal-wrap">
        <p className="legal-updated">Last updated July 2026</p>

        <p className="legal-intro">
          Thank you for subscribing. The terms below explain how the 10% welcome offer works, and are intended to
          keep things clear and fair for everyone.
        </p>

        <div className="detail-section">
          <span className="sec-label">01</span>
          <h2 className="sec-title">The Offer</h2>
          <p className="legal-body-text">
            New newsletter subscribers receive 10% off their first stay booked directly with Luxury Rentals Punta
            Mita. The offer is available to first-time guests only and applies to the total accommodation cost of
            one reservation.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">02</span>
          <h2 className="sec-title">Eligible Properties</h2>
          <p className="legal-body-text">
            The offer applies to select properties in our collection, at our discretion. Our reservations team will
            confirm whether your chosen villa qualifies when you request your quote.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">03</span>
          <h2 className="sec-title">Blackout Dates</h2>
          <p className="legal-body-text">
            The offer excludes peak weeks, including major holidays (such as Christmas, New Year, and Easter /
            Semana Santa) and other high-demand periods as determined by us.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">04</span>
          <h2 className="sec-title">How to Redeem</h2>
          <p className="legal-body-text">
            Mention your welcome offer when you reach out to book, using the same email address you subscribed
            with. Our team will confirm eligibility and apply the discount to your reservation quote.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">05</span>
          <h2 className="sec-title">Restrictions</h2>
          <p className="legal-body-text">
            Limited to one redemption per person or household. The offer has no cash value, cannot be transferred or
            resold, and cannot be combined with any other offer, promotion, or discount.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">06</span>
          <h2 className="sec-title">Changes to This Offer</h2>
          <p className="legal-body-text">
            We may modify or discontinue this offer at any time without prior notice. Bookings already confirmed
            with the discount applied are not affected by a later change.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">07</span>
          <h2 className="sec-title">Questions</h2>
          <p className="legal-body-text">
            If you have any questions about the welcome offer, reach us at{' '}
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
