import Link from 'next/link'
import Logo from './Logo'
import PyramidMark from './PyramidMark'

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="ft-brand-row">
            <PyramidMark size={54} />
            <Logo size="lg" />
          </div>
          {/* Short italic-serif tagline (Francisco's pick, 2026-10-21) —
              replaced a 6-line paragraph opening "Mexico, reserved for the
              few", which read as ultra-exclusive for a price-comparing
              family audience. */}
          <p className="ft-tagline">Exceptional villas across Mexico, personally chosen.</p>
          <div className="ft-social">
            <a href="https://www.instagram.com/luxuryrentalspuntamita/" target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            {/* Label next to the icon so it reads as a deliberate invitation,
                not a lone placeholder box (Francisco, 2026-10-21). */}
            <a href="https://www.instagram.com/luxuryrentalspuntamita/" target="_blank" rel="noopener" className="ft-social-label">Follow us</a>
          </div>
        </div>
        <div>
          <div className="ft-col-title">Properties</div>
          <ul className="ft-links">
            <li><Link href="/villas">All properties</Link></li>
            <li><Link href="/villas?collection=exceptional-value">Exceptional Value</Link></li>
            <li><Link href="/villas?collection=family-villas">Family Villas</Link></li>
            <li><Link href="/villas?collection=oceanfront">Oceanfront</Link></li>
          </ul>
        </div>
        <div>
          <div className="ft-col-title">Company</div>
          <ul className="ft-links">
            {/* Points at the /experience hub (all four sub-pages), not
                directly at any one of them — same reasoning as the header's
                own "The Experience" dropdown trigger. About Us is its own
                line below since /about is now a real, separate page rather
                than what "The Experience" itself used to mean. */}
            <li><Link href="/experience">The Experience</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/journal">Journal</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            {/* Deliberately plain text, same weight as the other Company
                links — not a button — so it doesn't compete with the
                guest-facing nav for attention (Francisco's call). */}
            <li><Link href="/list-your-property">Own a property?</Link></li>
            {/* Sister company — Mexican Reserve itself doesn't manage
                properties. Opens in a new tab; the small arrow marks it as
                another site (Francisco, 2026-10-21). */}
            <li>
              <a href="https://www.beyondtravelingmx.com/?utm_source=mexicanreserve&utm_medium=referral&utm_campaign=footer" target="_blank" rel="noopener">
                Property <span className="ft-nobreak">management<svg className="ft-ext-icon" viewBox="0 0 24 24" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" /></svg></span>
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="ft-col-title">Destinations</div>
          <ul className="ft-links">
            <li><Link href="/punta-mita" className="ft-nowrap">Punta Mita<span className="nav-dest-suffix"> — Inside the Gates</span></Link></li>
            <li><Link href="/punta-de-mita">Punta de Mita Area</Link></li>
            <li><Link href="/puerto-vallarta">Puerto Vallarta</Link></li>
          </ul>
        </div>
        <div>
          <div className="ft-col-title">Contact</div>
          {/* WhatsApp number removed (the WhatsApp button below does the
              same thing) and the "Email" label dropped — an email address
              needs no label (Francisco, 2026-10-21). */}
          <div className="ft-contact-item">
            <a href="mailto:rentals@mexicanreserve.com" className="ft-contact-val">rentals@mexicanreserve.com</a>
          </div>
          {/* Location moved to the bottom row (next to the copyright, where
              an address conventionally sits) — this column was twice as
              tall as the others. */}
          <p className="ft-cta-txt">Not sure where to start? We&rsquo;re happy to help.</p>
          <a href="https://wa.me/523313619889" className="ft-btn" target="_blank" rel="noopener">WhatsApp us</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="ft-copy">© {new Date().getFullYear()} Mexican Reserve &nbsp;·&nbsp; Punta de Mita, Nayarit, México</span>
        {/* Legal links live down here (moved out of the Company column,
            2026-10-21) — the convention guests expect, and it keeps the
            columns above about the brand, not the fine print. */}
        <nav className="ft-legal" aria-label="Legal">
          <Link href="/terms-and-conditions">Terms and conditions</Link>
          <Link href="/cancellation-policy">Cancellation policy</Link>
          <Link href="/privacy-policy">Privacy policy</Link>
        </nav>
      </div>
    </footer>
  )
}
