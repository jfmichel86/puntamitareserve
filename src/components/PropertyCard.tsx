'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import {
  Property, startingRate, totalGuests, formatPrice,
  communityLabel, collectionBadge, locationBadge, allPhotos,
} from '@/lib/utils'

interface Props {
  property: Property
  // Set on the villas listing when a specific collection filter (Oceanfront,
  // Family Villas, Exceptional Value) is active, so the badge reflects what
  // was actually searched for rather than an arbitrary tag on the property.
  activeCollection?: string
}

const BED_SVG   = <svg viewBox="0 0 24 24"><path d="M2 7v13M22 7v13M2 16h20M2 10h20M6 10V7.5a2 2 0 014 0V10M14 10V7.5a2 2 0 014 0V10"/></svg>
const BATH_SVG  = <svg viewBox="0 0 24 24"><path d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4zM4 12V6a2 2 0 012-2h2a2 2 0 012 2v1"/></svg>
const GUEST_SVG = <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>

export default function PropertyCard({ property: p, activeCollection }: Props) {
  const rate   = startingRate(p)
  const guests = totalGuests(p)
  const slug   = p.slug
  // This is now the ONE property card used everywhere on the site — homepage,
  // villas listing, and similar properties — showing both badges together.
  const badge = collectionBadge(p, activeCollection)
  const locBadge = locationBadge(p)
  const photos = allPhotos(p)

  const [photoIdx, setPhotoIdx] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const refresh = () => setSaved(localStorage.getItem(`saved-${slug}`) === '1')
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('saved-changed', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('saved-changed', refresh)
    }
  }, [slug])

  const movePhoto = (e: React.MouseEvent, dir: 1 | -1) => {
    e.preventDefault()
    e.stopPropagation()
    setPhotoIdx((i) => (i + dir + photos.length) % photos.length)
  }

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !saved
    setSaved(next)
    if (next) localStorage.setItem(`saved-${slug}`, '1')
    else localStorage.removeItem(`saved-${slug}`)
    window.dispatchEvent(new Event('saved-changed'))
  }

  return (
    <Link href={`/villas/${slug}`} className="prop-card">
      <div className="prop-photo-wrap">
        <div className="prop-photos">
          {photos.length === 0 ? (
            <div className="prop-photo-placeholder" />
          ) : (
            photos.map((ph, i) => (
              <Image
                key={i}
                src={urlFor(ph).width(1300).height(867).quality(90).url()}
                alt={`${p.title} — photo ${i + 1}`}
                fill
                quality={90}
                sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className={`prop-photo${i === photoIdx ? ' car-active' : ''}`}
              />
            ))
          )}
        </div>

        {photos.length > 1 && (
          <>
            <button className="car-arrow car-prev" onClick={(e) => movePhoto(e, -1)} aria-label="Previous photo">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="car-arrow car-next" onClick={(e) => movePhoto(e, 1)} aria-label="Next photo">
              <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
            </button>
            <div className="car-dots">
              {photos.map((_, i) => (
                <span key={i} className={`car-dot${i === photoIdx ? ' car-dot-active' : ''}`} />
              ))}
            </div>
          </>
        )}

        {badge && <span className="prop-badge">{badge}</span>}
        {locBadge && <span className="prop-loc-badge">{locBadge}</span>}

        <button
          className={`card-save-btn${saved ? ' saved' : ''}`}
          onClick={toggleSave}
          aria-label="Add to wishlist"
        >
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>

      <div className="prop-body">
        <div className="prop-type">{communityLabel(p)}</div>
        <div className="prop-name-row">
          <div className="prop-name">{p.title}</div>
          {rate ? (
            <div className="prop-price">From <strong>{formatPrice(rate)}</strong> <span>/ night</span></div>
          ) : null}
        </div>
        <div className="prop-amenities">
          <span className="prop-amenity">{BED_SVG}{p.bedrooms} bedroom{p.bedrooms !== 1 ? 's' : ''}</span>
          {p.bathrooms ? (
            <span className="prop-amenity">{BATH_SVG}{p.bathrooms} bath{p.bathrooms !== 1 ? 's' : ''}</span>
          ) : null}
          <span className="prop-amenity">{GUEST_SVG}{guests} guests</span>
        </div>
      </div>
    </Link>
  )
}
