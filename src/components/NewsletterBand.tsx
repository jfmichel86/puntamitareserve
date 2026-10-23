import NewsletterForm from './NewsletterForm'

// Its own full-width moment between the page content and the footer — not
// buried in a footer column. Rendered once, sitewide, from layout.tsx.
export default function NewsletterBand() {
  return (
    <section id="newsletter-offer" className="newsletter-band">
      <div className="newsletter-eyebrow">Welcome Offer</div>
      <h2 className="newsletter-headline">10% off your first stay</h2>
      <p className="newsletter-sub">Join our list for first access to new villas, special offers and open dates for holidays and peak weeks, plus 10% off your first stay at select villas (peak weeks excluded).</p>
      <NewsletterForm />
    </section>
  )
}
