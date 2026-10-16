// Sitewide floating pill, mirroring the WhatsApp button on the opposite
// corner. Just an anchor link to the newsletter band's id — `html { scroll-
// behavior: smooth }` (globals.css) handles the smooth-scroll for free, no
// JS needed.
export default function OfferBadge() {
  return (
    <a href="#newsletter-offer" className="offer-badge" aria-label="10% off your first stay — see welcome offer">
      <svg viewBox="0 0 24 24"><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L3 3v6.59a2 2 0 0 0 .59 1.41l9.59 9.59a2 2 0 0 0 2.82 0l6.59-6.59a2 2 0 0 0 0-2.82z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>
      <span>10% off first stay</span>
    </a>
  )
}
