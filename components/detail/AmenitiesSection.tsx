'use client'

import { useState } from 'react'

type AmenityItem = { key: string; label: string }
type AmenityCategory = { label: string; icon: React.ReactNode; items: AmenityItem[] }

export default function AmenitiesSection({
  categories,
  highlights,
  totalCount,
}: {
  categories: AmenityCategory[]
  highlights: AmenityItem[]
  totalCount: number
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {highlights.length > 0 && (
        <div className="am-highlight-grid">
          {highlights.map((h) => (
            <div className="am-highlight-item" key={h.key}>
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              <span className="am-highlight-label">{h.label}</span>
            </div>
          ))}
        </div>
      )}

      <button className={`expand-btn${expanded ? ' open' : ''}`} type="button" onClick={() => setExpanded((o) => !o)}>
        {expanded ? 'Show fewer amenities' : `View all ${totalCount} amenities`}
        <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {expanded && (
        <div className="am-full-list">
          {categories.map((cat) => (
            <div className="amenity-category" key={cat.label}>
              <div className="amenity-cat-title">{cat.icon}{cat.label}</div>
              <div className="amenity-list">
                {cat.items.map((item) => (
                  <div className="am-item" key={item.key}>
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
