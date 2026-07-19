import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Collections from '@/components/Collections'
import Featured from '@/components/Featured'
import Destination from '@/components/Destination'
import Testimonials from '@/components/Testimonials'

export const metadata: Metadata = {
  title: 'Luxury Vacation Rentals in Punta Mita | Private Estates, Villas & Condos',
  description: 'Luxury vacation rentals in Punta Mita — private estates, oceanfront villas and condos inside the gates. Book directly with local experts who know every property.',
  alternates: { canonical: 'https://www.mexicanreserve.com/' },
  openGraph: {
    title: 'Luxury Vacation Rentals in Punta Mita | Private Estates, Villas & Condos',
    description: 'Luxury vacation rentals in Punta Mita — private estates, oceanfront villas and condos inside the gates. Book directly with local experts who know every property.',
    url: 'https://www.mexicanreserve.com/',
    images: ['https://www.mexicanreserve.com/og-image-1.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Vacation Rentals in Punta Mita | Private Estates, Villas & Condos',
    description: 'Luxury vacation rentals in Punta Mita — private estates, oceanfront villas and condos inside the gates. Book directly with local experts.',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Mexican Reserve',
  description: 'Luxury vacation rentals in Punta Mita — private estates, oceanfront villas and condos inside the gates. Book directly with local experts.',
  url: 'https://www.mexicanreserve.com',
  telephone: '+523313619889',
  email: 'rentals@mexicanreserve.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Punta de Mita', addressRegion: 'Nayarit', addressCountry: 'MX' },
  geo: { '@type': 'GeoCoordinates', latitude: '20.7729', longitude: '-105.5395' },
  sameAs: ['https://www.instagram.com/luxuryrentalspuntamita/'],
  priceRange: '$$$',
  review: [
    { '@type': 'Review', author: { '@type': 'Person', name: 'Joe N.' }, reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' }, reviewBody: "Pictures of the villa don't begin to do it justice — beautiful, clean, and well-appointed." },
    { '@type': 'Review', author: { '@type': 'Person', name: 'Kelsey M.' }, reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' }, reviewBody: 'The house was spotless, beautifully updated, and it felt like our own luxury resort.' },
    { '@type': 'Review', author: { '@type': 'Person', name: 'Joe F.' }, reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' }, reviewBody: 'An incredible stay! The property is new and gorgeous and so wonderfully planned.' },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Hero />
      <Collections />
      <Featured />
      <Destination />
      <Testimonials />
    </>
  )
}
