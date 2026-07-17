import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Inquire',
  description: "Tell us what you're looking for — we'll find the right property in Punta Mita and take care of the rest.",
}

export default function ContactPage() {
  return (
    <>
      <div id="pg-header">
        <p className="pg-eyebrow">Get in touch</p>
        <h1 className="pg-title">Let&rsquo;s plan<br /><em>your stay</em></h1>
        <p className="pg-sub">Tell us what you&rsquo;re looking for — we&rsquo;ll find the right property and take care of the rest.</p>
        <span className="pg-deco-mark">Punta Mita · Mexico</span>
      </div>

      <section id="ct-main">
        <aside className="ct-sidebar">
          <div className="ct-concierge">
            <div className="ct-concierge-avatar"><span>LR</span></div>
            <div>
              <p className="ct-concierge-name">Luxury Rentals</p>
              <p className="ct-concierge-role">Your dedicated rental agent</p>
            </div>
          </div>
          <p className="ct-sidebar-body">Every inquiry goes directly to our rental team. We&rsquo;ll match you with the right property, handle every detail, and make sure your stay exceeds every expectation.</p>
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

        <ContactForm />
      </section>
    </>
  )
}
