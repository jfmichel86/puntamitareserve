import Link from 'next/link'
import { client } from '@/lib/sanity'
import { FEATURED_PROPERTIES_QUERY } from '@/lib/queries'
import { Property } from '@/lib/utils'
import PropertyCard from './PropertyCard'

export default async function Featured() {
  const properties: Property[] = await client.fetch(FEATURED_PROPERTIES_QUERY)

  return (
    <section id="featured">
      <div className="section-row">
        <div className="section-row-left">
          <p className="s-eye">What guests keep coming back for</p>
          <div className="s-div" />
          <h2 className="s-title" style={{ marginBottom: 18 }}>Our guests&rsquo; <em>favorites</em></h2>
          <p className="s-body">A selection of our most sought-after rentals — each recognized by guests for its location, quality, and the experience it delivers.</p>
        </div>
        <Link href="/villas?featured=1" className="view-all">
          View all properties
          <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </Link>
      </div>

      {properties.length > 0 && (
        <div className="properties-grid">
          {properties.map((p) => <PropertyCard key={p._id} property={p} />)}
        </div>
      )}
    </section>
  )
}
