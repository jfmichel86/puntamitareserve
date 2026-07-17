import { Suspense } from 'react'
import { client } from '@/lib/sanity'
import { PROPERTIES_QUERY } from '@/lib/queries'
import { Property } from '@/lib/utils'
import VillasClient from './VillasClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Properties in Punta Mita',
  description: 'Browse every luxury vacation rental in Punta Mita — villas, estates and condos. Filter by guests, bedrooms, price and amenities.',
  alternates: { canonical: 'https://www.mexicanreserve.com/villas' },
}

// Revalidate every 60 seconds so Sanity updates appear quickly
export const revalidate = 60

export default async function VillasPage() {
  const properties: Property[] = await client.fetch(PROPERTIES_QUERY)

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
