import type { Metadata } from 'next'
import About from '@/components/About'

const TITLE = 'The Experience'
const DESCRIPTION = 'From the first message to the last night, every detail of your stay is handled by people who know you and know the destination.'
// Overrides the sitewide default og-image-1.jpg (set in layout.tsx) so a
// shared link to this page previews one of its own guest-journey photos
// instead of the generic sitewide image.
const OG_IMAGE = 'https://www.mexicanreserve.com/images/about/og-about.jpg'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
}

export default function AboutPage() {
  return (
    <>
      {/* The hero photo is set as a plain CSS background (see #about-hero
          in globals.css) so the browser doesn't discover it until the
          stylesheet loads. Since it's the first thing every visitor sees,
          this preload hint lets the browser start downloading it right
          away instead of waiting. Next.js hoists <link> tags rendered
          anywhere in the page into the document <head> automatically. */}
      <link rel="preload" as="image" href="/images/about/hero.jpg" />

      <section id="about-hero">
        <p className="pg-eyebrow">The Experience</p>
        <h1 className="pg-title">The people who know every property, <em>personally</em></h1>
        <p className="pg-sub">From the first message to the last night, every detail is handled by people who know you and know the destination.</p>
        <div className="hero-scroll-cue" aria-hidden="true">
          <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </section>

      <About />
    </>
  )
}
