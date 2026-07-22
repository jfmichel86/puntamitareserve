import { Suspense } from 'react'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTIES_QUERY } from '@/lib/queries'
import { Property } from '@/lib/utils'
import VillasClient from './VillasClient'
import type { Metadata } from 'next'

// Revalidate every 60 seconds so Sanity updates appear quickly
export const revalidate = 60

async function getProperties(): Promise<Property[]> {
  return client.fetch(PROPERTIES_QUERY)
}

export async function generateMetadata(): Promise<Metadata> {
  const title = 'All Properties in Punta Mita'
  const description = 'Browse every luxury vacation rental in Punta Mita — villas, estates and condos. Filter by guests, bedrooms, price and amenities.'
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
      {/* Page header */}
      <section className="pg-header">
        <p className="pg-eyebrow">Punta Mita · México</p>
        <h1 className="pg-title">All Properties in <em>Punta Mita</em></h1>
        <p className="pg-sub">Every home we represent, personally curated — reach out and we&rsquo;ll handle the rest.</p>
      </section>

      {properties.length === 0 ? (
        <div className="empty-state">
          <h2>Properties coming soon</h2>
          <p>Our listings are being prepared. Please check back shortly or contact us directly.</p>
        </div>
      ) : (
        <Suspense fallback={null}>
          <VillasClient properties={properties} />
        </Suspense>
      )}
    </>
  )
}
