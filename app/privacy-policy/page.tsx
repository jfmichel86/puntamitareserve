import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Mexican Reserve collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Legal</p>
        <h1 className="pg-title">Privacy <em>Policy</em></h1>
        <p className="pg-sub">How we collect, use, and protect the personal information you share with us.</p>
      </section>

      <div className="legal-wrap">
        <p className="legal-updated">Last updated July 2026</p>

        <p className="legal-intro">
          Mexican Reserve (&ldquo;we,&rdquo; &ldquo;us&rdquo;) respects your privacy. This policy explains
          what personal information we collect through this website, how we use it, and the choices you have. We
          operate from Punta de Mita, Nayarit, México, and handle personal data in accordance with Mexico&rsquo;s
          Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP).
        </p>

        <div className="detail-section">
          <span className="sec-label">01</span>
          <h2 className="sec-title">Information We Collect</h2>
          <p className="legal-body-text">
            We collect the information you choose to give us directly: your name, email address, phone number, and
            any details you share about your travel dates, guest count, budget, or preferences when you submit our
            contact form, request a booking, or subscribe to our newsletter and welcome offer. We do not collect
            payment card information through this website.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">02</span>
          <h2 className="sec-title">How Our Forms Work</h2>
          <p className="legal-body-text">
            Our contact and newsletter forms open your own email application with a message addressed to us — they
            do not submit your information to a database on our server. Your details reach us the same way any
            email would, and are handled by our reservations team the same way we handle any other correspondence.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">03</span>
          <h2 className="sec-title">How We Use Your Information</h2>
          <p className="legal-body-text">
            We use the information you provide to respond to inquiries, prepare quotes, arrange bookings, and, if
            you opt in, send occasional emails about new villas, availability, and offers such as our welcome
            discount. We do not use your information to make automated decisions about you, and we do not sell your
            personal information to third parties.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">04</span>
          <h2 className="sec-title">Email Communications</h2>
          <p className="legal-body-text">
            If you subscribe to our newsletter, we&rsquo;ll only email you about property updates, availability, and
            offers — nothing else, and never more than a few times a month. You can unsubscribe at any time using
            the link in any email we send, or by writing to{' '}
            <a href="mailto:rentals@mexicanreserve.com">rentals@mexicanreserve.com</a>.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">05</span>
          <h2 className="sec-title">Sharing Your Information</h2>
          <p className="legal-body-text">
            We share booking details with the property owner or property manager of the villa you&rsquo;re
            reserving, solely to arrange and confirm your stay. We do not share your information with advertisers or
            data brokers, and we do not sell it to third parties.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">06</span>
          <h2 className="sec-title">Cookies &amp; Analytics</h2>
          <p className="legal-body-text">
            This site does not currently use advertising or tracking cookies. If we introduce analytics or marketing
            tools in the future, we will update this policy to describe what&rsquo;s collected and how to opt out.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">07</span>
          <h2 className="sec-title">Your Rights (ARCO)</h2>
          <p className="legal-body-text">
            Under Mexican data protection law, you have the right to Access, Rectify, Cancel, or Object (&ldquo;ARCO
            rights&rdquo;) to the personal data we hold about you. To exercise any of these rights, contact us at{' '}
            <a href="mailto:rentals@mexicanreserve.com">rentals@mexicanreserve.com</a> and
            we&rsquo;ll respond within a reasonable timeframe.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">08</span>
          <h2 className="sec-title">Changes to This Policy</h2>
          <p className="legal-body-text">
            We may update this policy from time to time as our practices or tools change. The &ldquo;last
            updated&rdquo; date at the top of this page reflects the most recent revision.
          </p>
        </div>

        <div className="detail-section">
          <span className="sec-label">09</span>
          <h2 className="sec-title">Contact Us</h2>
          <p className="legal-body-text">
            Questions about this policy or your personal information? Reach us at{' '}
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
