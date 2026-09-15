import { client, urlFor } from '@/lib/sanity'
import { HERO_PHOTOS_QUERY, HERO_PHOTOS_FALLBACK_QUERY } from '@/lib/queries'
import HeroBg from './HeroBg'

// The Experience hub's header — Francisco's call, 2026-08-31: a page that
// exists to point at four other pages (Guest Journey, Concierge, The
// Journal, About Us) shouldn't look like a flat utility header (FAQ, Terms,
// etc.). It should feel like the Destinations page: a real photo moment.
// Reuses the exact same rotating-crossfade mechanism and curated
// "homepageHero" photo set as the homepage hero (Hero.tsx) — same
// query/fallback pair, so this never needs its own Sanity curation step —
// but without SearchBar and at a more modest height, closer to
// /guest-journey's own #gj-hero recipe than the full-viewport homepage one.
type HeroPhotoDoc = { heroImage?: { asset?: { _ref: string }; hotspot?: { x: number; y: number } } }

async function getHeroPhotos(): Promise<string[]> {
  const docs = await client.fetch<HeroPhotoDoc[]>(HERO_PHOTOS_QUERY)
  const sourceDocs = docs.length > 0 ? docs : await client.fetch<HeroPhotoDoc[]>(HERO_PHOTOS_FALLBACK_QUERY)
  return sourceDocs
    .filter((d) => d.heroImage?.asset?._ref)
    .map((d) => urlFor(d.heroImage!).width(2400).height(1500).quality(92).url())
}

export default async function ExperienceHero() {
  const photos = await getHeroPhotos()

  return (
    <section id="experience-hero">
      <HeroBg photos={photos} />
      <p className="pg-eyebrow">The Experience</p>
      <h1 className="pg-title">Everything <em>behind the stay</em></h1>
      <p className="pg-sub">How we work, what we can arrange, and who&rsquo;s actually behind it.</p>
    </section>
  )
}
