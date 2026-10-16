import { client, urlFor } from '@/lib/sanity'
import { COLLECTION_PHOTOS_QUERY } from '@/lib/queries'
import CollectionsGrid from './CollectionsGrid'

type HeroOnly = { _id: string; heroImage?: { asset?: { _ref: string }; hotspot?: { x: number; y: number } } }
type CollectionPhotosResult = { exceptionalValue: HeroOnly[]; familyVillas: HeroOnly[]; oceanfront: HeroOnly[] }

// Sanity's smart-crop (driven by each photo's hotspot) needs a target
// width+height to crop toward — these approximate each tile's real aspect
// ratio (see .collections-grid / .cc:first-child in globals.css).
function urlForItem(p: HeroOnly, width: number, height: number): string {
  // Explicit quality — every other photo on the site requests 85-92%; this
  // was the one spot still relying on Sanity's unspecified default.
  return urlFor(p.heroImage!).width(width).height(height).quality(88).url()
}

/**
 * A property can legitimately belong to more than one collection, and each
 * tile's carousel always starts at its first photo — so without this, two
 * or three tiles can end up leading with the exact same property at once.
 * Reorders each collection's list so its first photo is a property not
 * already used as another (earlier-processed) collection's first photo,
 * when an alternative is available; nothing is dropped, just reordered.
 */
const MAX_SLIDES = 6

function pickOrderedPhotos(items: HeroOnly[], width: number, height: number, usedAsFirst: Set<string>): string[] {
  const valid = items.filter((p) => p.heroImage?.asset?._ref)
  if (valid.length === 0) return []

  const altIdx = valid.findIndex((p) => !usedAsFirst.has(p._id))
  const ordered = altIdx > 0
    ? [valid[altIdx], ...valid.slice(0, altIdx), ...valid.slice(altIdx + 1)]
    : valid

  usedAsFirst.add(ordered[0]._id)
  return ordered.slice(0, MAX_SLIDES).map((p) => urlForItem(p, width, height))
}

export default async function Collections() {
  const data = await client.fetch<CollectionPhotosResult>(COLLECTION_PHOTOS_QUERY)

  // Exceptional Value is the largest, most prominent tile, so it gets first
  // pick; Family Villas and Oceanfront then each avoid whichever property(s)
  // were already claimed as an earlier tile's lead photo.
  const usedAsFirst = new Set<string>()
  const photosByCollection: Record<string, string[]> = {
    'exceptional-value': pickOrderedPhotos(data.exceptionalValue, 1600, 1460, usedAsFirst),
    'family-villas': pickOrderedPhotos(data.familyVillas, 1200, 740, usedAsFirst),
    'oceanfront': pickOrderedPhotos(data.oceanfront, 1200, 740, usedAsFirst),
  }

  return <CollectionsGrid photosByCollection={photosByCollection} />
}
