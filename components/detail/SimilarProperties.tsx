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

  // Bedrooms and price are the two criteria every result must satisfy, no
  // matter what (Francisco's call) — ±1 bedroom (exact preferred) and
  // within 20% of this property's own rate. Property type and community
  // are preferences layered on top, not hard filters: see the grouping
  // and ranking below.
  const targetBeds = property.bedrooms || 3
  const bedMin = Math.max(1, targetBeds - 1)
  const bedMax = targetBeds + 1
  const targetRate = startingRate(property) || 2000
  const destDisplayLabel = property.communityPuntaMita ? 'Punta Mita' : 'Punta de Mita'

  // Cap set high (60) rather than tuned for truncation, since price and
  // type filtering both happen in JS below, after the fetch — a low GROQ
  // cap combined with any particular sort order here would bias which
  // candidates even make it into that JS-side evaluation.
  const groq = `*[_type == "property" && status == "published" && ${destFilter} && bedrooms >= $bedMin && bedrooms <= $bedMax && _id != $excludeId] | order(sortOrder asc, title asc) [0...60]{
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

  const PRICE_BAND = 0.2
  const candidates = all.filter((p) => {
    const rate = startingRate(p)
    return rate !== null && Math.abs(rate - targetRate) <= targetRate * PRICE_BAND
  })
  if (!candidates.length) return null

  // Ranking within whatever pool survives the hard filter above, in
  // priority order: Featured only jumps the queue when it's ALSO an exact
  // bedroom match (price is already guaranteed similar by the 20% band,
  // so that half of "exact bedrooms + similar price" is covered here) —
  // a Featured villa that's only an off-by-one match gets no special
  // treatment and simply competes on its own merits. Then exact bedroom
  // match, then price closeness, then same community as a final tie-break.
  const currentCommunity = property.communityPuntaMita || property.communityPuntaDeMita || ''
  const compare = (a: Property, b: Property) => {
    const aBedExact = a.bedrooms === targetBeds ? 0 : 1
    const bBedExact = b.bedrooms === targetBeds ? 0 : 1
    const aFeaturedBoost = a.featured && aBedExact === 0 ? 0 : 1
    const bFeaturedBoost = b.featured && bBedExact === 0 ? 0 : 1
    if (aFeaturedBoost !== bFeaturedBoost) return aFeaturedBoost - bFeaturedBoost
    if (aBedExact !== bBedExact) return aBedExact - bBedExact
    const aDiff = Math.abs((startingRate(a) || 0) - targetRate)
    const bDiff = Math.abs((startingRate(b) || 0) - targetRate)
    if (aDiff !== bDiff) return aDiff - bDiff
    const aComm = (a.communityPuntaMita || a.communityPuntaDeMita || '') === currentCommunity ? 0 : 1
    const bComm = (b.communityPuntaMita || b.communityPuntaDeMita || '') === currentCommunity ? 0 : 1
    return aComm - bComm
  }

  // Property type is a preference, not a hard filter — fill with
  // same-type matches first (e.g. a house viewed alongside houses, not
  // condos), and only reach into other types if that isn't enough to
  // make 3.
  const sameType = candidates.filter((p) => p.propertyType === property.propertyType).sort(compare)
  const otherType = candidates.filter((p) => p.propertyType !== property.propertyType).sort(compare)
  const top3 = [...sameType, ...otherType].slice(0, 3)

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
