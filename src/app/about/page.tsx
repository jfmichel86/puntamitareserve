import type { Metadata } from 'next'
import AboutUs from '@/components/AboutUs'
import PyramidMark from '@/components/PyramidMark'

// This address used to hold the guest-journey story (now at /guest-journey)
// — Francisco's call, 2026-08-31: /about should present the team and the
// company, not the guest-journey narrative.
const TITLE = 'About Us'
const DESCRIPTION = 'Mexican Reserve represents an exceptional collection of private villas, estates, and condos across Mexico — personally vetted and managed by one local team, booked directly with us.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.mexicanreserve.com/about' },
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

export default function AboutPage() {
  return (
    <>
      {/* Francisco's "still boring" feedback (2026-08-31, round 2): once
          Guest Journey, The Experience hub, and The Journal all got real
          photo headers, this page's flat navy band became the one header
          on the site with no photograph in it — that contrast, more than
          the pyramid mark's opacity, was the actual problem. There's no
          real team/office photo yet, so this uses an existing destination
          shot (golf-sunset.jpg — the same "brand mood" language as the
          triptych below, not a specific villa or a guest-facing moment)
          treated in a cooler, moodier navy/gold duotone via CSS filter
          (see .au-header-photo) so it reads as a company statement, not
          another "book your stay" photo. The pyramid mark still sits large
          and faint over it, like a crest. #au-header scopes all of this
          without touching the plain .pg-header every utility page (FAQ,
          Terms, etc.) still uses. */}
      <section className="pg-header" id="au-header">
        <span className="au-header-photo" aria-hidden="true" />
        <span className="au-header-mark" aria-hidden="true"><PyramidMark size={440} /></span>
        <p className="pg-eyebrow">Who We Are</p>
        <h1 className="pg-title">About <em>Mexican Reserve</em></h1>
        <p className="pg-sub">Mexico, reserved for the few — the team and the standard behind every stay.</p>
      </section>

      <AboutUs />
    </>
  )
}
