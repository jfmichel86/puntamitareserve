'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Sitewide, invisible controller for the floating WhatsApp bubble + offer
 * badge (rendered in layout.tsx, styled in globals.css as .wa/.offer-badge).
 * Neither of those components is aware of scroll position or route on its
 * own, so this is where that logic lives — same "return null, just run
 * effects" pattern as ScrollReveal.tsx.
 *
 * Two things toggle body classes that globals.css uses to hide the floats:
 * 1. `footer-in-view` — once the footer scrolls into view it already has
 *    its own WhatsApp/contact info, so the floats become redundant clutter
 *    sitting on top of it.
 * 2. `on-saved-page` — the wishlist page has its own "Inquire about all"
 *    CTA and a WhatsApp icon on every card already, so the sitewide floats
 *    are redundant there too (this was flagged directly: they were
 *    rendering on top of the first wishlist card's photo).
 */
export default function FloatingActionsController() {
  const pathname = usePathname()

  useEffect(() => {
    document.body.classList.toggle('on-saved-page', pathname === '/saved')
  }, [pathname])

  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const obs = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle('footer-in-view', entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(footer)
    return () => {
      obs.disconnect()
      document.body.classList.remove('footer-in-view')
    }
    // Re-observe on route change since the root layout (and this component)
    // never unmounts between client-side navigations, but the <footer>
    // element itself does get replaced.
  }, [pathname])

  return null
}
