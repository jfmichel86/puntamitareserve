import { client, urlFor } from '@/lib/sanity'
import { HERO_PHOTOS_QUERY } from '@/lib/queries'
import SearchBar from './SearchBar'
import HeroBg from './HeroBg'

type HeroPhotoDoc = { heroImage?: { asset?: { _ref: string }; hotspot?: { x: number; y: number } } }

export default async function Hero() {
  const docs = await client.fetch<HeroPhotoDoc[]>(HERO_PHOTOS_QUERY)
  const photos = docs
    .filter((d) => d.heroImage?.asset?._ref)
    .map((d) => urlFor(d.heroImage!).width(2400).height(1500).quality(92).url())

  return (
    <section id="hero">
      <HeroBg photos={photos} />
      <div className="hero-bg" />
      <div className="hero-horizon" />

      <div className="hero-content">
        <p className="hero-eyebrow">Mexico, Reserved for the Few</p>
        <h1 className="hero-headline">
          Private luxury rentals<br />in <em>Mexico</em>
        </h1>
        <p className="hero-sub">
          Beachfront estates, villas and condos — an exceptional collection, currently featuring Punta Mita.
        </p>

        <SearchBar />

        <p className="hero-trust">150+ properties · Local experts</p>
      </div>

      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}
