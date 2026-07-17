'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const COLLECTIONS = [
  {
    slug: 'exceptional-value',
    href: '/villas?collection=exceptional-value',
    tag: 'Most popular',
    name: 'Exceptional Value',
    desc: 'All the amenities that matter, at a price your group will appreciate.',
    gradients: [
      'linear-gradient(165deg,#1A5270 0%,#133D58 28%,#0C2A3E 55%,#081A28 82%,#040E16 100%)',
      'linear-gradient(148deg,#1C4A64 0%,#112E48 40%,#091E30 70%,#040E1A 100%)',
      'linear-gradient(170deg,#163850 0%,#0E2840 45%,#071A2C 70%,#030C16 100%)',
      'linear-gradient(152deg,#1E4268 0%,#122C50 40%,#0A1E38 70%,#050C1C 100%)',
      'linear-gradient(162deg,#243060 0%,#162248 45%,#0C1432 70%,#060820 100%)',
    ],
  },
  {
    slug: 'family-villas',
    href: '/villas?collection=family-villas',
    tag: 'Ideal for families',
    name: 'Family Villas',
    desc: 'Designed for groups and families.',
    gradients: [
      'linear-gradient(160deg,#1A4832 0%,#113220 30%,#0A2016 60%,#05100B 100%)',
      'linear-gradient(145deg,#1C5038 0%,#0E2E1C 40%,#081C10 70%,#040A08 100%)',
      'linear-gradient(172deg,#163A28 0%,#0E2618 45%,#081614 70%,#040C08 100%)',
      'linear-gradient(150deg,#224A2E 0%,#142C1A 45%,#0C1C10 70%,#060808 100%)',
      'linear-gradient(165deg,#1E4228 0%,#122818 45%,#0A1810 70%,#050A06 100%)',
    ],
  },
  {
    slug: 'oceanfront',
    href: '/villas?collection=oceanfront',
    tag: 'Direct ocean access',
    name: 'Oceanfront',
    desc: 'Unobstructed ocean views from your terrace.',
    gradients: [
      'linear-gradient(155deg,#5A3C18 0%,#3E2810 30%,#251708 60%,#130C04 100%)',
      'linear-gradient(142deg,#5C3814 0%,#3C2408 40%,#221408 70%,#110804 100%)',
      'linear-gradient(168deg,#4E3010 0%,#361E08 45%,#201006 70%,#100804 100%)',
      'linear-gradient(152deg,#624018 0%,#402C0A 45%,#241808 70%,#120C04 100%)',
      'linear-gradient(160deg,#503418 0%,#382008 45%,#201008 70%,#100804 100%)',
    ],
  },
] as const

type Collection = typeof COLLECTIONS[number]

function CollectionCard({ c, photos }: { c: Collection; photos: string[] }) {
  const [idx, setIdx] = useState(0)
  const router = useRouter()

  // Real property photos replace the gradient placeholders entirely once
  // available; the gradients only show for a collection with no tagged
  // properties yet (same fallback behavior as the original static site).
  const usingPhotos = photos.length > 0
  const slides: (string)[] = usingPhotos ? photos : [...c.gradients]

  const move = (e: React.MouseEvent, dir: 1 | -1) => {
    e.preventDefault(); e.stopPropagation()
    setIdx((i) => (i + dir + slides.length) % slides.length)
  }

  return (
    <div className="cc" onClick={() => router.push(c.href)}>
      <div className="cc-carousel">
        <div className="cc-slides" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {slides.map((s, i) => (
            <div
              key={i}
              className="cc-slide"
              style={usingPhotos ? { backgroundImage: `url('${s}')` } : { background: s }}
            />
          ))}
        </div>
        {slides.length > 1 && (
          <>
            <button className="cc-arr cc-prev" onClick={(e) => move(e, -1)}>&#8249;</button>
            <button className="cc-arr cc-next" onClick={(e) => move(e, 1)}>&#8250;</button>
            <div className="cc-dots">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`cc-dot${i === idx ? ' cc-dot-active' : ''}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i) }}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="cc-overlay" />
      <div className="cc-body">
        <span className="cc-tag">{c.tag}</span>
        <div className="cc-name">{c.name}</div>
        <p className="cc-desc">{c.desc}</p>
      </div>
    </div>
  )
}

export default function CollectionsGrid({ photosByCollection }: { photosByCollection: Record<string, string[]> }) {
  return (
    <section id="collections">
      <div className="collections-intro">
        <p className="s-eye">Collections</p>
        <div className="s-div" />
        <h2 className="s-title" style={{ marginBottom: 18 }}>A home for <em>every stay</em></h2>
        <p className="s-body">Whether you&rsquo;re searching for a signature estate, space for the whole family, or waking up to the sound of the Pacific — we have a home for your stay.</p>
      </div>

      <div className="collections-grid">
        {COLLECTIONS.map((c) => (
          <CollectionCard key={c.slug} c={c} photos={photosByCollection[c.slug] || []} />
        ))}
      </div>

      <div className="collections-browse">
        <Link href="/villas" className="collections-browse-btn">
          Browse all properties
          <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </Link>
      </div>
    </section>
  )
}
