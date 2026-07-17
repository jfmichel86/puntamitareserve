'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import type { PhotoRef } from '@/lib/utils'

type Photo = { ph: PhotoRef; tag: string }

// Full-resolution lightbox URL — pulled out so both the visible <Image> and
// the background preloader below request the exact same file (otherwise the
// browser would fetch it twice).
const lbSrc = (p: Photo) => urlFor(p.ph).width(2200).quality(92).url()

export default function Gallery({ photos, mosaicPhotos, isExceptionalValue }: { photos: Photo[]; mosaicPhotos: Photo[]; isExceptionalValue: boolean }) {
  const [lbOpen, setLbOpen] = useState(false)
  const [lbIdx, setLbIdx] = useState(0)
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([])

  const openLb = (idx: number) => { setLbIdx(idx); setLbOpen(true) }
  const closeLb = () => setLbOpen(false)
  const move = (dir: 1 | -1) => setLbIdx((i) => (i + dir + photos.length) % photos.length)

  useEffect(() => {
    document.body.style.overflow = lbOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lbOpen])

  useEffect(() => {
    if (!lbOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLbOpen(false)
      if (e.key === 'ArrowLeft') setLbIdx((i) => (i - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') setLbIdx((i) => (i + 1) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lbOpen, photos.length])

  // Keep the gold-bordered thumbnail scrolled into view as the lightbox
  // photo changes — without this, the strip's scroll position never moves,
  // so a few photos in, the highlighted thumbnail scrolls off to the right
  // and looks like the selection "disappeared."
  useEffect(() => {
    if (!lbOpen) return
    thumbRefs.current[lbIdx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [lbIdx, lbOpen])

  // Warm the browser's cache for the next and previous full-size photos
  // while the current one is on screen, so clicking the arrows feels
  // instant instead of waiting on a fresh download each time.
  useEffect(() => {
    if (!lbOpen || photos.length < 2) return
    const nextP = photos[(lbIdx + 1) % photos.length]
    const prevP = photos[(lbIdx - 1 + photos.length) % photos.length]
    const preload = (p: Photo) => { const img = new window.Image(); img.src = lbSrc(p) }
    preload(nextP)
    preload(prevP)
  }, [lbIdx, lbOpen, photos])

  if (photos.length === 0) return null

  // Mosaic is a curated teaser (hero + up to 3 photos flagged isMosaic) shown
  // in its own order — it must never change what the actual gallery/lightbox
  // shows. Clicking a tile maps back to that same photo's real position in
  // `photos` (matched by Sanity asset id) so the lightbox opens on the right
  // photo and its thumbnail strip/counter always reflect the true, unaltered
  // Photo Manager order — never the mosaic's order.
  const gridCells = mosaicPhotos.slice(0, 4)
  const realIndexOf = (p: Photo) => {
    const idx = photos.findIndex((full) => full.ph.asset?._ref === p.ph.asset?._ref)
    return idx === -1 ? 0 : idx
  }

  return (
    <>
      <div className="gallery">
        <div className="gallery-mosaic">
          {gridCells.map((p, i) => (
            <div
              key={i}
              className={`g-cell${i === 0 ? ' g-main' : ''}`}
              onClick={() => openLb(realIndexOf(p))}
              role="button"
              tabIndex={0}
              aria-label={`View photo ${i + 1}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLb(realIndexOf(p)) }}
            >
              <Image
                // Main tile requests the exact same width as the lightbox
                // (lbSrc) so the "hero" photo is never a lower-resolution
                // copy of the one you see in the full gallery — same file,
                // same quality, just displayed in a differently-shaped box.
                src={urlFor(p.ph).width(i === 0 ? 2200 : 1400).quality(92).url()}
                alt={p.tag || `Photo ${i + 1}`}
                fill
                quality={92}
                // Matches the real CSS math exactly: the mosaic sits inside
                // 64px of padding on each side, and the main tile is 3fr of
                // a 3fr:1fr column split (75%), side tiles are 1fr (25%).
                // Below 720px only the main tile shows in a single column.
                // (Previously the side tiles said "0px" below 900px, which
                // told Next.js to serve a tiny placeholder even though the
                // tile is still visible down to 720px — that was the blur.)
                sizes={i === 0
                  ? '(max-width: 720px) calc(100vw - 48px), calc((100vw - 128px) * 0.75)'
                  : '(max-width: 720px) 0px, calc((100vw - 128px) * 0.25)'}
                style={{ objectFit: 'cover' }}
                className="g-bg"
                priority={i === 0}
              />
              <div className="g-overlay" />
            </div>
          ))}
        </div>
        <span className="gallery-counter">1 / {photos.length}</span>
        <div className="gallery-pills">
          {isExceptionalValue && <span className="gallery-pill featured">Exceptional Value</span>}
        </div>
        <div className="gallery-btns">
          <button className="gallery-action" type="button" onClick={() => openLb(0)}>
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>All {photos.length} photo{photos.length === 1 ? '' : 's'}</span>
          </button>
        </div>
      </div>

      {lbOpen && (
        <div className="lightbox open" role="dialog" aria-modal="true" aria-label="Photo gallery">
          <button className="lb-close" type="button" onClick={closeLb} aria-label="Close">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div className="lb-frame">
            <button className="lb-nav lb-prev" type="button" onClick={() => move(-1)} aria-label="Previous photo">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="lb-img">
              <Image
                src={lbSrc(photos[lbIdx])}
                alt={photos[lbIdx].tag || `Photo ${lbIdx + 1}`}
                fill
                quality={92}
                sizes="(max-width: 1100px) 100vw, 1100px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <button className="lb-nav lb-next" type="button" onClick={() => move(1)} aria-label="Next photo">
              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="lb-count">{lbIdx + 1} / {photos.length}</div>
          <div className="lb-thumbs">
            {photos.map((p, i) => (
              <div
                key={i}
                ref={(el) => { thumbRefs.current[i] = el }}
                className={`lb-thumb${i === lbIdx ? ' active' : ''}`}
                role="button"
                aria-label={p.tag || `Photo ${i + 1}`}
                onClick={() => setLbIdx(i)}
              >
                <div className="lb-thumb-bg">
                  <Image
                    src={urlFor(p.ph).width(360).quality(85).url()}
                    alt={p.tag || `Photo ${i + 1}`}
                    fill
                    quality={85}
                    sizes="168px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
