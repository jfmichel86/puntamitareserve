import type { Metadata } from 'next'
import OwnerForm from '@/components/OwnerForm'

export const metadata: Metadata = {
  title: 'List Your Property',
  description: 'Partner with Mexican Reserve — full property management in Punta Mita, or a marketing and booking partnership in every other destination we serve.',
}

export default function ListYourPropertyPage() {
  return (
    <>
      <div id="pg-header">
        <p className="pg-eyebrow">Property owners</p>
        <h1 className="pg-title">Partner with <em>Mexican Reserve</em></h1>
        <p className="pg-sub">Two ways to work with us, depending on where your property is.</p>
        <span className="pg-deco-mark">Owners · Mexico</span>
      </div>

      <section id="ct-main">
        <aside className="ct-sidebar">
          <div className="ct-concierge">
            <div className="ct-concierge-avatar"><span>MR</span></div>
            <div>
              <p className="ct-concierge-name">Mexican Reserve</p>
              <p className="ct-concierge-role">Property Partnerships</p>
            </div>
          </div>
          <p className="ct-sidebar-body">In Punta Mita, we manage your property fully — marketing, guest care, and housekeeping and maintenance coordination — so it earns without demanding your time. In every other destination we serve, we bring qualified guests directly to your property and handle bookings and guest communication, while you continue to manage day-to-day operations.</p>
          <p className="ct-quick-label">Prefer to reach us directly?</p>
          <a className="ct-quick-link" href="mailto:rentals@mexicanreserve.com">
            <div className="ct-quick-icon">
              <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </div>
            <div>
              <span className="ct-quick-text-label">Send us an email</span>
              <span className="ct-quick-text-val">Tap to compose</span>
            </div>
          </a>
          <a className="ct-quick-link" href="https://wa.me/523313619889" target="_blank" rel="noopener">
            <div className="ct-quick-icon wa">
              <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            </div>
            <div>
              <span className="ct-quick-text-label">WhatsApp</span>
              <span className="ct-quick-text-val">Typically replies in minutes</span>
            </div>
          </a>
        </aside>

        <OwnerForm />
      </section>
    </>
  )
}
