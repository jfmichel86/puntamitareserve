import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cancellation Policy',
  description: 'Deposit, cancellation, refund, and date-change terms for direct bookings with Mexican Reserve.',
}

export default function CancellationPolicyPage() {
  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Booking Terms</p>
        <h1 className="pg-title">Cancellation <em>Policy</em></h1>
        <p className="pg-sub">The terms below govern deposits, cancellations, and date changes for reservations booked directly with us.</p>
      </section>

      <div className="legal-wrap">
        <p className="legal-updated">Last updated July 2026</p>

        <p className="legal-intro">
          Every booking with Mexican Reserve is handled personally by our team, from your first inquiry
          through checkout. Because we hold a property exclusively for you once your dates are confirmed,
          cancellations affect both the owner and future guests — the policy below is designed to be fair to
          everyone involved, while remaining as flexible as we can reasonably offer. If your circumstances are
          unusual, reach out; we review requests individually and are glad to help where we can.
        </p>

        <div className="legal-note">
          This policy applies to reservations booked directly with Mexican Reserve. Bookings made through
          a third-party platform (Airbnb, Vrbo, or similar) are governed by that platform&rsquo;s own cancellation
          terms, not the terms below.
        </div>

        <div className="detail-section">
          <span className="sec-label">01</span>
          <h2 className="sec-title">Deposit &amp; Payment Schedule</h2>
          <p className="legal-body-text">
            A deposit of 50% of the total reservation cost is due at the time of booking to confirm your dates. The
            remaining balance is due 90 days prior to arrival. For reservations made within 90 days of arrival, full
            payment is required at the time of booking.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">02</span>
          <h2 className="sec-title">Cancellation Windows &amp; Refunds</h2>
          <table className="rates-table">
            <thead>
              <tr><th>Cancellation window</th><th>Refund</th></tr>
            </thead>
            <tbody>
              <tr><td>90+ days before arrival</td><td>100% refund, less a 5% processing fee</td></tr>
              <tr><td>60–89 days before arrival</td><td>50% refund, less a 5% processing fee</td></tr>
              <tr><td>Within 60 days of arrival</td><td>No refund</td></tr>
            </tbody>
          </table>
          <ul className="rates-note">
            <li>Refunds are issued to the original form of payment within 15 business days of written cancellation.</li>
            <li>Balance payments follow the same cancellation schedule as the deposit.</li>
          </ul>
        </div>

        <div className="detail-section">
          <span className="sec-label">03</span>
          <h2 className="sec-title">Date Changes</h2>
          <p className="legal-body-text">
            We&rsquo;re happy to accommodate one date change per reservation at no additional fee, provided the
            request is made at least 90 days before the original arrival date and the new dates fall within the
            same calendar year, subject to availability. Rate differences between original and new dates may apply.
            Requests made within 90 days of arrival are treated as a cancellation under the policy above.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">04</span>
          <h2 className="sec-title">Force Majeure &amp; Extraordinary Circumstances</h2>
          <p className="legal-body-text">
            In the event of circumstances beyond a guest&rsquo;s control — natural disasters, government-mandated
            travel restrictions, or similar extraordinary events directly affecting Punta Mita or your ability to
            travel — we will work in good faith to offer a rebooking credit valid for 12 months rather than apply
            the standard cancellation schedule above. This applies only where the circumstance is in effect
            immediately before or during your confirmed reservation dates. If a travel restriction, advisory, or
            similar event has been lifted or resolved before your arrival date, standard cancellation terms apply
            instead — this includes natural disasters and other extraordinary circumstances that occur well in
            advance of your stay. Each situation is reviewed individually.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">05</span>
          <h2 className="sec-title">Travel Protection</h2>
          <p className="legal-body-text">
            Because cancellation fees can be significant, we strongly recommend purchasing travel insurance at the
            time of booking to protect against unforeseen circumstances, including illness, injury, or changes in
            travel plans.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">06</span>
          <h2 className="sec-title">No-Shows &amp; Early Departure</h2>
          <p className="legal-body-text">
            No refund is issued for no-shows or for guests who depart earlier than their confirmed checkout date.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">07</span>
          <h2 className="sec-title">How to Cancel or Modify a Reservation</h2>
          <p className="legal-body-text">
            All cancellation and date-change requests must be submitted in writing to{' '}
            <a href="mailto:rentals@mexicanreserve.com">rentals@mexicanreserve.com</a>. We
            confirm receipt within 24 hours and will outline exactly what applies to your reservation.
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
