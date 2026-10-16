'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Ports shared.js's initReveal(): fades in .reveal elements as they enter the
 * viewport. Lives in the root layout so it covers every page, not just the
 * homepage — but the root layout never remounts between client-side page
 * navigations, so this re-scans for new .reveal elements whenever the route
 * (pathname) changes, instead of only once on the very first page load.
 */
export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [pathname])

  return null
}
