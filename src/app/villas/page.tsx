import { Suspense } from 'react'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTIES_QUERY } from '@/lib/queries'
import { Property, DEST_LABELS } from '@/lib/utils'
import VillasClient from './VillasClient'
import type { Metadata } from 'next'

// Revalidate every 60 seconds so Sanity updates appear quickly
export const revalidate = 60

async function getProperties(): Promise<Property[]> {
  return client.fetch(PROPERTIES_QUERY)
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>
}): Promise<Metadata> {
  const { destination } = await searchParams
  const destLabel = destination && DEST_LABELS[destination] ? DEST_LABELS[destination] : null
  const title = `All Properties in ${destLabel ?? 'Punta Mita'}`
  const description = destLabel
    ? `Browse every luxury vacation rental in ${destLabel} — villas, estates and condos. Filter by guests, bedrooms, price and amenities.`
    : 'Browse every luxury vacation rental we represent — villas, estates and condos across Punta Mita, Punta de Mita and Puerto Vallarta. Filter by guests, bedrooms, price and amenities.'
  // PROPERTIES_QUERY orders featured villas first, so this is the same
  // photo the grid itself leads with — a real property instead of the
  // sitewide default logo/brand image.
  const properties = await getProperties()
  // Falls back to the sitewide default photo (set in layout.tsx) rather than
  // no image at all, on the unlikely chance the listing is temporarily empty.
  const ogImage = properties[0]?.heroImage?.asset?._ref
    ? urlFor(properties[0].heroImage).width(1200).height(630).quality(85).url()
    : 'https://www.mexicanreserve.com/og-image-1.jpg'

  return {
    title,
    description,
    alternates: { canonical: 'https://www.mexicanreserve.com/villas' },
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function VillasPage() {
  const properties: Property[] = await getProperties()

  return (
    <>
      {properties.length === 0 ? (
        <>
          {/* Page header — static fallback for the (unlikely) empty-listing
              case. The normal case renders its own header inside
              VillasClient instead (see the note there), so it can stay in
              sync with whichever destination the visitor has filtered to
              instead of always saying "Punta Mita". */}
          <section className="pg-header">
            <p className="pg-eyebrow">All Destinations · México</p>
            <h1 className="pg-title">All Properties in <em>México</em></h1>
            <p className="pg-sub">Every home we represent, personally curated — reach out and we&rsquo;ll handle the rest.</p>
          </section>
          <div className="empty-state">
            <h2>Properties coming soon</h2>
            <p>Our listings are being prepared. Please check back shortly or contact us directly.</p>
          </div>
        </>
      ) : (
        <Suspense fallback={null}>
          <VillasClient properties={properties} />
        </Suspense>
      )}
    </>
  )
}
