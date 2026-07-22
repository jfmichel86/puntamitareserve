import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <Logo size="lg" />
          <p className="ft-tagline">Mexico, reserved for the few — beginning with an exceptional collection across Punta Mita, Punta de Mita and Puerto Vallarta, with the personal service to make every stay extraordinary.</p>
          <div className="ft-social">
            <a href="https://www.instagram.com/luxuryrentalspuntamita/" target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
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
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/terms-and-conditions">Terms and conditions</Link></li>
            <li><Link href="/cancellation-policy">Cancellation policy</Link></li>
            <li><Link href="/privacy-policy">Privacy policy</Link></li>
          </ul>
        </div>
        <div>
          <div className="ft-col-title">Destinations</div>
          <ul className="ft-links">
            <li><Link href="/destinations/punta-mita">Punta Mita — Inside the Gates</Link></li>
            <li><Link href="/destinations/punta-de-mita">Punta de Mita Area</Link></li>
            <li><Link href="/destinations/puerto-vallarta">Puerto Vallarta</Link></li>
          </ul>
        </div>
        <div>
          <div className="ft-col-title">Contact</div>
          <div className="ft-contact-item">
            <div className="ft-contact-lbl">WhatsApp</div>
            <a href="https://wa.me/523313619889" className="ft-contact-val" target="_blank" rel="noopener">+52 33 1361 9889</a>
          </div>
          <div className="ft-contact-item">
            <div className="ft-contact-lbl">Email</div>
            <a href="mailto:rentals@mexicanreserve.com" className="ft-contact-val">rentals@mexicanreserve.com</a>
          </div>
          <div className="ft-contact-item">
            <div className="ft-contact-lbl">Location</div>
            <span className="ft-contact-val">Punta de Mita, Nayarit, México</span>
          </div>
          <p className="ft-cta-txt">Not sure where to start? We&rsquo;re happy to help you find the right property.</p>
          <a href="https://wa.me/523313619889" className="ft-btn" target="_blank" rel="noopener">WhatsApp us</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="ft-copy">© {new Date().getFullYear()} Mexican Reserve. All rights reserved.</span>
      </div>
    </footer>
  )
}
