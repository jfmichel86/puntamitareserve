'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LAST_SEARCH_STORAGE_KEY } from '@/lib/utils'

// The breadcrumb's middle link — "Results" — on a property detail page.
// When a visitor arrives here by clicking a property card on a filtered
// /villas search, PropertyCard stashes that search's filters in
// sessionStorage (see LAST_SEARCH_STORAGE_KEY) right before the click; this
// reads it back and rebuilds the filtered URL, so clicking "Results" returns
// them to the same filtered list instead of a plain, filter-less /villas.
//
// Deliberately NOT carried as a ?from=... query param on this page's own
// URL (that was the original approach) — Francisco's call, 2026-08-27: it
// made property links long and ugly to share (e.g.
// ?from=collection%3Dexceptional-value). sessionStorage keeps the property
// page's own address short while still making "Results" work.
//
// Kept as its own tiny client component (rather than reading sessionStorage
// on the page itself) specifically so the property page stays a server
// component and keeps its static rendering — only this one link needs to
// know about the browser's storage.
export default function ResultsLink() {
  const [href, setHref] = useState('/villas')

  useEffect(() => {
    const restore = () => {
      try {
        const saved = sessionStorage.getItem(LAST_SEARCH_STORAGE_KEY)
        if (saved) setHref(`/villas?${saved}`)
      } catch {
        // Private-browsing modes can throw on sessionStorage access — falls
        // back to the plain /villas link already set above.
      }
    }
    restore()
  }, [])

  return <Link href={href}>Results</Link>
}
