import type { Metadata } from 'next'
import About from '@/components/About'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Meet the local team behind Mexican Reserve — 150+ properties, 15 years of combined local expertise, and concierge services built into every stay.',
}

export default function AboutPage() {
  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Who We Are</p>
        <h1 className="pg-title">The people who know <em>Punta Mita</em></h1>
        <p className="pg-sub">Local expertise, personal relationships, and a level of service that doesn&rsquo;t exist on a booking platform.</p>
      </section>

      <About />
    </>
  )
}
