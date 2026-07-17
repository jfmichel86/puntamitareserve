import type { Metadata } from 'next'
import Link from 'next/link'
import FaqAccordion from '@/components/FaqAccordion'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about booking, staying, and getting the most out of a Mexican Reserve villa.',
  alternates: { canonical: 'https://www.mexicanreserve.com/faq' },
}

export default function FaqPage() {
  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Good to Know</p>
        <h1 className="pg-title">Frequently Asked <em>Questions</em></h1>
        <p className="pg-sub">Answers to what guests ask us most. Can&rsquo;t find what you&rsquo;re looking for? Reach out and we&rsquo;ll help directly.</p>
      </section>

      <div className="legal-wrap">
        <div className="detail-section">
          <span className="sec-label">01</span>
          <h2 className="sec-title">Booking &amp; Payment</h2>
          <FaqAccordion
            groupId="booking"
            items={[
              {
                q: 'How do I book a villa?',
                a: (
                  <p>
                    Reach out through our <Link href="/contact">contact page</Link>, WhatsApp, or email with your
                    dates and group size, and our team will confirm availability and rates. A reservation is
                    considered confirmed once we&rsquo;ve issued written confirmation and received your deposit —
                    browsing this site doesn&rsquo;t place a hold on a property.
                  </p>
                ),
              },
              {
                q: 'What’s the deposit and payment schedule?',
                a: (
                  <p>
                    A 50% deposit is due at booking to confirm your dates, with the remaining balance due 90 days
                    before arrival. Reservations made within 90 days of arrival require full payment upfront. Full
                    details are on our <Link href="/cancellation-policy">Cancellation Policy</Link> page.
                  </p>
                ),
              },
              {
                q: 'What currency are rates shown in?',
                a: <p>All rates on this site are in U.S. dollars unless stated otherwise.</p>,
              },
              {
                q: 'Is there a security or damage deposit?',
                a: (
                  <p>
                    Yes — a refundable security deposit equal to one night&rsquo;s rental rate, independent of the
                    season you&rsquo;re booking. We&rsquo;ll confirm the exact amount and terms in your written
                    booking confirmation before you pay anything.
                  </p>
                ),
              },
            ]}
          />
        </div>

        <div className="detail-section">
          <span className="sec-label">02</span>
          <h2 className="sec-title">Your Stay</h2>
          <FaqAccordion
            groupId="stay"
            items={[
              {
                q: 'What time is check-in and check-out?',
                a: (
                  <p>
                    Check-in is from 3:00 pm and check-out is by 11:00 am. Early check-in and late check-out can
                    often be arranged on request, subject to availability — just ask when booking.
                  </p>
                ),
              },
              {
                q: 'Is there a minimum number of nights?',
                a: (
                  <p>
                    Minimum stays vary by property and by season — you&rsquo;ll see the exact minimum for your dates
                    on each villa&rsquo;s page when you check rates.
                  </p>
                ),
              },
              {
                q: 'Does the villa come with staff?',
                a: (
                  <p>
                    Most of our villas include some level of staff — housekeeping, a chef, or property management —
                    and the exact team included varies by property. Each villa&rsquo;s page lists exactly who&rsquo;s
                    included.
                  </p>
                ),
              },
              {
                q: 'Can we bring pets?',
                a: (
                  <p>
                    As a rule, our properties don&rsquo;t allow pets, and exceptions are rare. If you&rsquo;re hoping
                    to bring one, contact us before booking — we can check with the property owner on a case-by-case
                    basis, which requires a photo of your pet and the owner&rsquo;s written authorization in advance.
                    We can&rsquo;t guarantee approval, so please don&rsquo;t book assuming a pet will be allowed
                    until we&rsquo;ve confirmed it in writing.
                  </p>
                ),
              },
              {
                q: 'Can we host an event or have extra guests over?',
                a: (
                  <p>
                    The confirmed guest count and maximum occupancy on your reservation need to be respected. If
                    you&rsquo;re hoping to host an event or gathering beyond your booked group, ask us in advance —
                    it requires the property owner&rsquo;s written consent and isn&rsquo;t something we can approve
                    after arrival.
                  </p>
                ),
              },
            ]}
          />
        </div>

        <div className="detail-section">
          <span className="sec-label">03</span>
          <h2 className="sec-title">Beach Clubs &amp; Memberships</h2>
          <FaqAccordion
            groupId="clubs"
            items={[
              {
                q: 'Do I get access to Punta Mita’s beach clubs?',
                a: (
                  <p>
                    Almost every villa in our portfolio carries a Golf (Premier) Membership, which includes access to
                    all five of Punta Mita&rsquo;s Residents&rsquo; Beach Clubs — Pacífico, Sea Breeze, Kupuri, Sufi
                    Ocean Club, and El Surf Club — plus both golf courses and other resort amenities. A small number
                    of properties carry a Sport Membership instead, which includes the beach clubs but not golf. Your
                    villa&rsquo;s page will confirm which one applies.
                  </p>
                ),
              },
              {
                q: 'Is beach club access free for renters?',
                a: (
                  <p>
                    No — as of January 2026, the Punta Mita Resort HOA charges a one-time, per-person, per-stay
                    access fee for vacation rental guests using the beach clubs. It applies per adult and child in
                    your group. We can confirm the current exact fee when you book, since HOA-set fees can change.
                  </p>
                ),
              },
            ]}
          />
        </div>

        <div className="detail-section">
          <span className="sec-label">04</span>
          <h2 className="sec-title">Cancellations &amp; Changes</h2>
          <FaqAccordion
            groupId="cancel"
            items={[
              {
                q: 'What if I need to cancel or change my dates?',
                a: (
                  <p>
                    Our full cancellation windows, refund amounts, and date-change terms are on the{' '}
                    <Link href="/cancellation-policy">Cancellation Policy</Link> page. In short: the earlier you let
                    us know, the more flexibility we can offer.
                  </p>
                ),
              },
              {
                q: 'Should I buy travel insurance?',
                a: (
                  <p>
                    We recommend it. Because cancellation terms tighten as your arrival date gets closer, travel
                    insurance is the best protection against the unexpected — illness, injury, or a sudden change in
                    plans.
                  </p>
                ),
              },
            ]}
          />
        </div>

        <div className="detail-section">
          <span className="sec-label">05</span>
          <h2 className="sec-title">Still Have Questions?</h2>
          <p className="legal-body-text">
            We&rsquo;re happy to help with anything not covered here — reach out and a member of our team will get
            back to you directly.
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
