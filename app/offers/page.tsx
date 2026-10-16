import type { Metadata } from 'next'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTIES_QUERY } from '@/lib/queries'
import { Property, hasAnyActiveDeal, dealValidityText } from '@/lib/utils'
import PropertyCard from '@/components/PropertyCard'

export const revalidate = 60

async function getDealProperties(): Promise<Property[]> {
  const properties: Property[] = await client.fetch(PROPERTIES_QUERY)
  // Filtered here rather than in the GROQ query itself — the active-window
  // logic for a limited-time promotion (expiryDate vs. today) and property-
  // of-the-month (month/year vs. today) needs real Date math that's much
  // simpler to express in TypeScript than to replicate correctly in GROQ,
  // and this list is small enough that filtering after the fetch costs
  // nothing noticeable.
  return properties.filter(hasAnyActiveDeal)
}

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Exclusive Deals'
  const description = 'Villas and condos with a limited-time rate, last-minute availability, or featured as our property of the month — real opportunities, not manufactured urgency.'
  const properties = await getDealProperties()
  const ogImage = properties[0]?.heroImage?.asset?._ref
    ? urlFor(properties[0].heroImage).width(1200).height(630).quality(85).url()
    : 'https://www.mexicanreserve.com/og-image-1.jpg'

  return {
    title,
    description,
    alternates: { canonical: 'https://www.mexicanreserve.com/offers' },
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function OffersPage() {
  const properties = await getDealProperties()

  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Right now</p>
        <h1 className="pg-title">Exclusive <em>Deals</em></h1>
        <p className="pg-sub">Limited-time rates, last-minute availability, and our featured property of the month — updated as they change.</p>
      </section>

      {properties.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing active right now</h2>
          <p>We don&rsquo;t have any limited-time offers at the moment — check back soon, or reach out and we&rsquo;ll let you know when something opens up.</p>
        </div>
      ) : (
        <div className="properties-section">
          <div className="prop-grid">
            {/* Each card's own validity window sits right below it — the
                Terms block further down covers the rules that apply to
                every offer, but only this per-property line can say which
                specific dates that property's own deal actually covers
                (Francisco's request, 2026-09-15). Not part of PropertyCard
                itself, which stays the one shared card used everywhere
                else on the site — this caption is specific to this page. */}
            {properties.map((p) => {
              const validity = dealValidityText(p)
              return (
                <div key={p._id} className="offer-card-wrap">
                  <PropertyCard property={p} />
                  {validity && <p className="offer-card-validity">{validity}</p>}
                </div>
              )
            })}
          </div>

          {/* Previously just one disclaimer line about peak weeks — expanded
              into a proper Terms block per Francisco's request, 2026-09-15.
              Peak-weeks line kept verbatim as the first item. */}
          <div className="offers-terms">
            <span className="sec-label">Offer Terms</span>
            <ul className="rates-note">
              <li>Offers exclude peak weeks, including major holidays (such as Christmas, New Year, and Easter / Semana Santa) and other high-demand periods as determined by us.</li>
              <li>Rates and availability are confirmed at the time of inquiry and subject to change without notice.</li>
              <li>Each property&rsquo;s exact offer window is listed above; dates outside that window are not guaranteed at the promotional rate.</li>
              <li>Offers cannot be combined with other promotions or discounts.</li>
              <li>All stays remain subject to our standard booking terms, including applicable taxes and fees.</li>
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
