import type { Metadata } from 'next'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTIES_QUERY } from '@/lib/queries'
import { Property, hasAnyActiveDeal } from '@/lib/utils'
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
            {properties.map((p) => <PropertyCard key={p._id} property={p} />)}
          </div>
        </div>
      )}
    </>
  )
}
