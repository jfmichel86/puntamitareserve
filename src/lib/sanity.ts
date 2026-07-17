import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  // useCdn:false means every request goes straight to Sanity's live database
  // instead of through its speed-optimized cache layer. That cache can lag
  // behind real edits for a short while, which — combined with the admin-tool
  // draft/publish gap we just fixed — was very likely stacking two separate
  // delays on top of each other. Turning it off trades a small amount of speed
  // for always-current data, which matters more while we're actively verifying
  // that edits show up correctly.
  useCdn: false,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
