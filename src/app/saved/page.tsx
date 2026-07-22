import { Suspense } from 'react'
import type { Metadata } from 'next'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTIES_QUERY } from '@/lib/queries'
import { Property } from '@/lib/utils'
import SavedClient from './SavedClient'

// Revalidate every 60 seconds, same as the villas listing page
export const revalidate = 60

async function getProperties(): Promise<Property[]> {
  return client.fetch(PROPERTIES_QUERY)
}

export async function generateMetadata(): Promise<Metadata> {
  // The wishlist itself is personal — saved in each visitor's own browser,
  // never known server-side — so there's no single "your saved villas"
  // photo to show in a link preview. This uses the same featured-villa photo
  // the /villas listing leads with instead (PROPERTIES_QUERY already orders
  // featured properties first), so sharing a wishlist link at least shows a
  // real property photo instead of falling back to the site's small logo
  // mark, which is what was happening with no openGraph image set at all.
  const title = 'Your Wishlist'
  const description = 'Compare your saved Punta Mita villas side by side — rates, amenities, and details in one place.'
  const properties = await getProperties()
  const ogImage = properties[0]?.heroImage?.asset?._ref
    ? urlFor(properties[0].heroImage).width(1200).height(630).quality(85).url()
    : 'https://www.mexicanreserve.com/og-image-1.jpg'

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function SavedPage() {
  const properties: Property[] = await getProperties()

  return (
    <Suspense fallback={null}>
      <SavedClient properties={properties} />
    </Suspense>
  )
}
