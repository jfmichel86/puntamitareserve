import type { Metadata } from 'next'
import OwnerForm from '@/components/OwnerForm'

export const metadata: Metadata = {
  title: 'List Your Property',
  description: 'List your vacation rental — or your whole portfolio — with Mexican Reserve. We market your property and bring qualified guests across Mexico, and earn a commission only when a booking happens.',
  alternates: { canonical: 'https://www.mexicanreserve.com/list-your-property' },
}

export default function ListYourPropertyPage() {
  return (
    <>
      <div id="pg-header">
        {/* For owners, house managers and property management agencies who
            want their property (or portfolio) promoted on Mexican Reserve.
            Mexican Reserve does NOT offer property management — it markets
            and books properties for a commission paid only when a rental
            happens (Francisco, 2026-10-18). */}
        <p className="pg-eyebrow">Owners &amp; property managers</p>
        <h1 className="pg-title">List with <em>Mexican Reserve</em></h1>
        <p className="pg-sub">We bring qualified guests to your property. You only pay when a booking happens.</p>
        <span className="pg-deco-mark">Owners · Mexico</span>
      </div>

      <section id="ct-main">
        <aside className="ct-sidebar">
          <div className="ct-concierge">
            <div className="ct-concierge-avatar"><span>MR</span></div>
            <div>
              <p className="ct-concierge-name">Mexican Reserve</p>
              <p className="ct-concierge-role">Owner &amp; Agency Partnerships</p>
            </div>
          </div>
          {/* Condensed 2026-10-21 (page felt crowded): one short paragraph
              plus three scannable points, instead of three paragraphs. */}
          <p className="ct-sidebar-body">We showcase your property, bring you qualified guests and handle the booking — while you, or your property manager, keep running the home.</p>
          <ul className="ct-points">
            <li>No upfront cost — we earn a commission only when a rental is booked</li>
            <li>For homeowners, house managers and property management agencies</li>
            <li>One home or a full portfolio</li>
          </ul>
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
          <a className="ct-quick-link" href="https://wa.me/523224341968" target="_blank" rel="noopener">
            <div className="ct-quick-icon ct-quick-icon--wa">
              <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            </div>
            <div>
              <span className="ct-quick-text-label">WhatsApp</span>
              <span className="ct-quick-text-val">Typically replies in minutes</span>
            </div>
          </a>

          {/* Mexican Reserve itself doesn't manage properties — owners who
              also need someone to RUN their home are pointed to the sister
              company, Beyond Traveling, which does property management in
              Punta Mita only (per beyondtravelingmx.com, 2026-10-21). The
              "?utm_…" tags let Beyond Traveling's analytics show these
              visits came from this page. */}
          <div className="ct-sister">
            <p className="ct-sister-eyebrow">Need your home managed?</p>
            <p className="ct-sister-body">In Punta Mita, our sister company <strong>Beyond Traveling</strong> can take care of it for you.</p>
            <a className="ct-sister-link" href="https://www.beyondtravelingmx.com/?utm_source=mexicanreserve&utm_medium=referral&utm_campaign=list-your-property" target="_blank" rel="noopener">
              Learn more
              <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></svg>
            </a>
          </div>
        </aside>

        <OwnerForm />
      </section>
    </>
  )
}
