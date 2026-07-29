'use client'

import { useEffect, useState } from 'react'

// Slow, ambient auto-crossfade between hero photos — no arrows, no dots,
// nothing for a visitor to operate. It just quietly cycles in the
// background while the headline and search bar stay the focus.
const INTERVAL_MS = 7000

export default function HeroBg({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (photos.length <= 1) return
    const t = setInterval(() => setIdx((i) => (i + 1) % photos.length), INTERVAL_MS)
    return () => clearInterval(t)
  }, [photos.length])

  if (photos.length === 0) return null

  return (
    // Purely ambient, decorative background — the actual meaningful content
    // (headline, subhead) lives in the sibling .hero-content and already
    // reads fine on its own, so this rotating collage carries no unique
    // information of its own. aria-hidden tells screen readers to skip it
    // entirely, rather than announcing an unlabeled image with nothing
    // useful to say about it.
    <div className="hero-photos" aria-hidden="true">
      {photos.map((src, i) => (
        <div
          key={src}
          className={`hero-photo${i === idx ? ' is-active' : ''}`}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}
    </div>
  )
}
