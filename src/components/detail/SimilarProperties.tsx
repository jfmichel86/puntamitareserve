import Link from 'next/link'
import { client } from '@/lib/sanity'
import { startingRate, Property } from '@/lib/utils'
import PropertyCard from '@/components/PropertyCard'

export default async function SimilarProperties({ property }: { property: Property }) {
  const destFilter = property.communityPuntaMita
    ? `defined(communityPuntaMita)`
    : property.communityPuntaDeMita
      ? `defined(communityPuntaDeMita)`
      : null

  if (!destFilter) return null

  const bedMin = Math.max(1, (property.bedrooms || 3) - 2)
  const bedMax = (property.bedrooms || 3) + 2
  const minRateVal = startingRate(property) || 2000
  const destDisplayLabel = property.communityPuntaMita ? 'Punta Mita' : 'Punta de Mita'

  // featured desc first so that when there are more than 10 candidates in
  // this bed range, Featured properties (the ones we earn the most
  // commission on) are the ones kept in the pool — not cut off before the
  // JS-side ranking below even sees them.
  const groq = `*[_type == "property" && status == "published" && ${destFilter} && bedrooms >= $bedMin && bedrooms <= $bedMax && _id != $excludeId] | order(featured desc, sortOrder asc, title asc) [0...10]{
    _id, title, "slug": slug.current, bedrooms, bathrooms, maxAdults, childOnlyBeds, collection, propertyType,
    featured, communityPuntaMita, communityPuntaDeMita, viewsAndPool,
    "seasons": seasons[]{ nightlyRate },
    heroImage,
    "mosaicPhotos": mosaicPhotos[]{ asset->{_ref}, hotspot }
  }`

  let all: Property[] = []
  try {
    all = await client.fetch(groq, { bedMin, bedMax, excludeId: property._id })
  } catch {
    return null
  }
  if (!all.length) return null

  // Featured properties are promoted first (commission priority, sitewide
  // rule) — price-closeness only decides order within the same featured
  // tier, so a Featured pick still has to be a genuinely reasonable match,
  // not just whatever is Featured regardless of price.
  const top3 = all
    .map((p) => ({ p, diff: Math.abs((startingRate(p) || 0) - minRateVal) }))
    .sort((a, b) => {
      if (!!a.p.featured !== !!b.p.featured) return a.p.featured ? -1 : 1
      return a.diff - b.diff
    })
    .slice(0, 3)
    .map((x) => x.p)

  if (!top3.length) return null

  return (
    <section className="similar" id="similarSection">
      <div className="similar-hdr reveal">
        <div>
          <div className="s-eye">You may also like</div>
          <h2 className="s-title">Similar {destDisplayLabel} Properties</h2>
        </div>
        <Link href="/villas" className="similar-view-all">
          Browse all villas
          <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </Link>
      </div>
      <div className="similar-grid">
        {top3.map((p) => <PropertyCard key={p._id} property={p} />)}
      </div>
    </section>
  )
}
