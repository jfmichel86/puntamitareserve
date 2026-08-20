'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// The breadcrumb's middle link — "Results" — on a property detail page.
// When a visitor arrives here from a filtered /villas search, PropertyCard
// stamps that link with ?from=<their filters, url-encoded>; this reads it
// back and rebuilds the exact filtered URL, so clicking "Results" returns
// them to the same filtered list instead of a plain, filter-less /villas.
//
// Kept as its own tiny client component (rather than reading searchParams
// on the page itself) specifically so the property page stays a server
// component and keeps its static rendering — only this one link needs to
// know about the browser's URL.
export default function ResultsLink() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  return <Link href={from ? `/villas?${from}` : '/villas'}>Results</Link>
}
