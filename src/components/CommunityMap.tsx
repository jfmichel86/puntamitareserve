/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

// Interactive satellite map for the "Explore the Communities" page. Loads
// Leaflet (a mapping library) the same way a plain HTML page would — a
// <script> tag pulled from a public CDN — instead of installing it as an
// npm package. That keeps this feature from touching package.json at all,
// which matters because this project's sandbox can't run a full
// `next build` to double-check a new dependency installs cleanly; a
// CDN-loaded script carries none of that risk. Leaflet ships with no
// TypeScript types of its own (hence the `any`s and the disabled lint
// rule above), since it's being used exactly the way a non-React page
// would use it, not through a typed React wrapper library.
//
// The photo backdrop is Esri's World Imagery satellite layer — free,
// real aerial/satellite photography, no account or API key required.
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type CommunityPin = {
  slug: string
  name: string
  lat: number
  lng: number
  description: string
  location: string
  views: string
  pool: string
  bedrooms: string
  count: number
  photoUrl?: string
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

declare global {
  interface Window {
    L?: any
  }
}

export type BeachClubPin = { slug: string; name: string; lat: number; lng: number }

export default function CommunityMap({
  pins,
  destinationSlug,
  calibrate = false,
  active,
  onActiveChange,
  beachClubs,
}: {
  pins: CommunityPin[]
  destinationSlug: string
  // Debug/setup mode only — reached via ?calibrate=1 on the page URL, not
  // linked from anywhere on the site. Makes every pin draggable and shows
  // a live, copyable list of positions underneath, so Francisco can drag
  // each pin to its real spot on the satellite photo himself instead of
  // me guessing coordinates a third time. Nothing here saves automatically
  // — he drags, copies the list, and sends it back to be pasted into
  // src/data/puntaMitaCommunities.ts.
  calibrate?: boolean
  // Which pin's card is showing — owned by the parent (CommunityExplorer)
  // rather than this component, so clicking a card in the "Every
  // Community" grid below can open the same pin here too, not just
  // hovering/clicking directly on the map.
  active: CommunityPin | null
  onActiveChange: (p: CommunityPin) => void
  // Only used in calibrate mode — the 5 real beach clubs, rendered as
  // draggable navy pins alongside the gold community pins, so Francisco
  // can place them once and I can compute each community's distance to
  // its closest club (for the compare-communities table) from real
  // coordinates instead of a guess.
  beachClubs?: BeachClubPin[]
}) {
  const mapElRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [positions, setPositions] = useState<Record<string, { lat: number; lng: number }>>({})
  const [beachClubPositions, setBeachClubPositions] = useState<Record<string, { lat: number; lng: number }>>({})
  const [copied, setCopied] = useState(false)

  // Load Leaflet's CSS + JS from the CDN once, then create the map.
  useEffect(() => {
    let cancelled = false

    function createMap() {
      if (cancelled || !mapElRef.current || mapRef.current || !window.L) return
      const L = window.L
      const center = pins.length > 0
        ? [pins.reduce((s, p) => s + p.lat, 0) / pins.length, pins.reduce((s, p) => s + p.lng, 0) / pins.length]
        : [20.767, -105.534]
      const map = L.map(mapElRef.current, {
        center,
        zoom: 14,
        scrollWheelZoom: false,
        attributionControl: false,
      })
      L.tileLayer(TILE_URL, { maxZoom: 18 }).addTo(map)
      mapRef.current = map
      setReady(true)
    }

    if (window.L) {
      createMap()
      return
    }

    if (!document.querySelector(`link[data-community-map]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      link.setAttribute('data-community-map', 'true')
      document.head.appendChild(link)
    }

    let script = document.querySelector<HTMLScriptElement>('script[data-community-map]')
    if (!script) {
      script = document.createElement('script')
      script.src = LEAFLET_JS
      script.async = true
      script.setAttribute('data-community-map', 'true')
      document.body.appendChild(script)
    }
    script.addEventListener('load', createMap)
    return () => {
      cancelled = true
      script?.removeEventListener('load', createMap)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Once the map exists, drop a gold pin for every community. In
  // calibrate mode, pins are draggable and permanently labeled (so
  // Francisco can tell them apart while moving them), and dragging one
  // records its new position in state instead of just firing the hover
  // card.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const L = window.L
    const markers = pins.map((p) => {
      const icon = L.divIcon({
        className: 'community-pin',
        html: '<span></span>',
        iconSize: [22, 26],
        iconAnchor: [11, 26],
      })
      const marker = L.marker([p.lat, p.lng], { icon, draggable: calibrate }).addTo(map)
      if (calibrate) {
        marker.bindTooltip(p.name, { permanent: true, direction: 'right', className: 'community-pin-tooltip' })
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          setPositions((prev) => ({ ...prev, [p.slug]: { lat: pos.lat, lng: pos.lng } }))
        })
      } else {
        marker.on('mouseover', () => onActiveChange(p))
        marker.on('click', () => onActiveChange(p))
      }
      return marker
    })
    return () => { markers.forEach((m: any) => map.removeLayer(m)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pins, calibrate])

  // Beach club pins — only added to the map in calibrate mode. Navy,
  // draggable, permanently labeled, same drag-then-copy pattern as the
  // community pins above but tracked in a separate positions state so
  // the two copyable lists stay independent.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !calibrate || !beachClubs) return
    const L = window.L
    const markers = beachClubs.map((b) => {
      const icon = L.divIcon({
        className: 'beach-club-pin',
        html: '<span></span>',
        iconSize: [22, 26],
        iconAnchor: [11, 26],
      })
      const marker = L.marker([b.lat, b.lng], { icon, draggable: true }).addTo(map)
      marker.bindTooltip(b.name, { permanent: true, direction: 'left', className: 'community-pin-tooltip beach-club-tooltip' })
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        setBeachClubPositions((prev) => ({ ...prev, [b.slug]: { lat: pos.lat, lng: pos.lng } }))
      })
      return marker
    })
    return () => { markers.forEach((m: any) => map.removeLayer(m)) }
  }, [ready, calibrate, beachClubs])

  const shown = active || pins[0]

  if (calibrate) {
    const effective = pins.map((p) => ({ ...p, ...(positions[p.slug] || {}) }))
    const codeBlock = effective
      .map((p) => `  { slug: '${p.slug}', lat: ${p.lat.toFixed(4)}, lng: ${p.lng.toFixed(4)} },`)
      .join('\n')
    const beachEffective = (beachClubs || []).map((b) => ({ ...b, ...(beachClubPositions[b.slug] || {}) }))
    const beachCodeBlock = beachEffective
      .map((b) => `  { slug: '${b.slug}', lat: ${b.lat.toFixed(4)}, lng: ${b.lng.toFixed(4)} },`)
      .join('\n')
    const fullCodeBlock = `// Communities\n${codeBlock}\n\n// Beach clubs\n${beachCodeBlock}`
    return (
      <div className="community-map-wrap">
        <div ref={mapElRef} className="community-map" />
        <div className="community-map-calibrate">
          <p className="community-map-calibrate-hint">Drag each gold community pin and each navy beach-club pin to its real spot, then copy the full list below and send it back.</p>
          <pre className="community-map-calibrate-code">{fullCodeBlock}</pre>
          <button
            type="button"
            className="community-map-calibrate-copy"
            onClick={() => { navigator.clipboard.writeText(fullCodeBlock); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          >
            {copied ? 'Copied' : 'Copy list'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="community-map-wrap">
      <div ref={mapElRef} className="community-map" />
      {shown && (
        <div className="community-map-card">
          <div className="community-map-card-photo">
            {shown.photoUrl ? (
              <Image src={shown.photoUrl} alt={shown.name} fill sizes="140px" className="community-map-card-img" />
            ) : (
              <span className="community-map-card-photo-label">Photo placeholder</span>
            )}
          </div>
          <div className="community-map-card-body">
            <p className="community-map-card-name">{shown.name}</p>
            <div className="comm-tags">
              {[shown.location, shown.views, shown.pool, shown.bedrooms].filter(Boolean).map((t) => (
                <span key={t} className="comm-tag">{t}</span>
              ))}
            </div>
            <p className="community-map-card-desc">{shown.description}</p>
            <Link href={`/villas?destination=${destinationSlug}&community=${shown.slug}`} className="community-map-card-link">
              View {shown.count} {shown.count === 1 ? 'villa' : 'villas'}
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
