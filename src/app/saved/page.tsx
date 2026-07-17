import { Suspense } from 'react'
import type { Metadata } from 'next'
import { client } from '@/lib/sanity'
import { PROPERTIES_QUERY } from '@/lib/queries'
import { Property } from '@/lib/utils'
import SavedClient from './SavedClient'

export const metadata: Metadata = {
  title: 'Your Wishlist',
  robots: { index: false, follow: false },
}

// Revalidate every 60 seconds, same as the villas listing page
export const revalidate = 60

export default async function SavedPage() {
  const properties: Property[] = await client.fetch(PROPERTIES_QUERY)

  return (
    <Suspense fallback={null}>
      <SavedClient properties={properties} />
    </Suspense>
  )
}
