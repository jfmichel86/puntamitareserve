import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Collections from '@/components/Collections'
import Featured from '@/components/Featured'
import Destination from '@/components/Destination'
import WhyBookDirect from '@/components/WhyBookDirect'
import Testimonials from '@/components/Testimonials'

export const metadata: Metadata = {
  title: 'Mexican Reserve | Luxury Villa Rentals in Punta Mita, Mexico',
  description: 'Mexican Reserve curates Mexico’s finest luxury rentals, beginning in Punta Mita — private estates, oceanfront villas and condos inside the gates. Book directly with local experts who know every property.',
  alternates: { canonical: 'https://www.mexicanreserve.com/' },
  openGraph: {
    title: 'Mexican Reserve | Luxury Villa Rentals in Punta Mita, Mexico',
    description: 'Mexican Reserve curates Mexico’s finest luxury rentals, beginning in Punta Mita — private estates, oceanfront villas and condos inside the gates. Book directly with local experts who know every property.',
    url: 'https://www.mexicanreserve.com/',
    images: ['https://www.mexicanreserve.com/og-image-1.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mexican Reserve | Luxury Villa Rentals in Punta Mita, Mexico',
    description: 'Mexican Reserve curates Mexico’s finest luxury rentals, beginning in Punta Mita — private estates, oceanfront villas and condos inside the gates. Book directly with local experts.',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Mexican Reserve',
  description: 'Mexican Reserve curates Mexico’s finest luxury rentals, beginning in Punta Mita — private estates, oceanfront villas and condos inside the gates. Book directly with local experts.',
  url: 'https://www.mexicanreserve.com',
  telephone: '+523313619889',
  email: 'rentals@mexicanreserve.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Punta de Mita', addressRegion: 'Nayarit', addressCountry: 'MX' },
  geo: { '@type': 'GeoCoordinates', latitude: '20.7729', longitude: '-105.5395' },
  sameAs: ['https://www.instagram.com/luxuryrentalspuntamita/'],
  priceRange: '$$$',
  // Deliberately no `review` / `aggregateRating` here. Google disqualifies
  // (and can issue a manual action against) LocalBusiness/Organization
  // structured data where the business collected and curated the reviews
  // about itself on its own site — regardless of whether the reviews are
  // genuine. The compliant path is a Google Business Profile, where guests
  // leave reviews directly with Google, not through us. The testimonials
  // still display normally on the page via the <Testimonials /> component
  // below — they're just not marked up as schema.org review data.
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Hero />
      <WhyBookDirect />
      <Destination />
      <Featured />
      <Collections />
      <Testimonials />
    </>
  )
}
