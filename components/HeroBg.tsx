'use client'

import { useEffect, useRef, useState } from 'react'

// Slow, ambient auto-crossfade between hero photos — no arrows, no dots,
// nothing for a visitor to operate. It just quietly cycles in the
// background while the headline and search bar stay the focus.
const INTERVAL_MS = 7000

// A photo is either one URL (used on every screen) or a pair: a portrait
// crop sized for phones plus a wide one for larger screens. Phones then
// download a file shaped and sized for their screen instead of a huge
// desktop image they'd mostly crop away.
export type HeroPhoto = string | { desktop: string; mobile: string }

// Speed: only the FIRST photo is in the initial page. It's marked high
// priority so the browser fetches it before anything else. The rest of the
// slideshow is added only once that first photo has finished loading, so
// they don't compete with it for a phone's limited bandwidth (they aren't
// needed until the first crossfade, 7 seconds later, anyway).
export default function HeroBg({ photos }: { photos: HeroPhoto[] }) {
  const [idx, setIdx] = useState(0)
  const [ready, setReady] = useState(false)
  const firstImg = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = firstImg.current
    if (!img || img.complete) { setReady(true); return }
    const done = () => setReady(true)
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
    return () => { img.removeEventListener('load', done); img.removeEventListener('error', done) }
  }, [])

  useEffect(() => {
    if (!ready || photos.length <= 1) return
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), INTERVAL_MS)
    return () => clearInterval(t)
  }, [ready, photos.length])

  if (photos.length === 0) return null

  const shown = ready ? photos : photos.slice(0, 1)

  return (
    // Purely ambient, decorative background — the actual meaningful content
    // (headline, subhead) lives in the sibling .hero-content and already
    // reads fine on its own, so this rotating collage carries no unique
    // information of its own. aria-hidden tells screen readers to skip it
    // entirely, and each image has an empty alt for the same reason.
    <div className="hero-photos" aria-hidden="true">
      {shown.map((p, i) => {
        const desktop = typeof p === 'string' ? p : p.desktop
        const mobile = typeof p === 'string' ? null : p.mobile
        return (
          <div key={desktop} className={`hero-photo${i === idx ? ' is-active' : ''}`}>
            <picture>
              {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
              <img
                ref={i === 0 ? firstImg : undefined}
                src={desktop}
                alt=""
                fetchPriority={i === 0 ? 'high' : 'low'}
                decoding="async"
              />
            </picture>
          </div>
        )
      })}
    </div>
  )
}
