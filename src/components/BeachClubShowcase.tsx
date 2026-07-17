'use client'

import { useState } from 'react'

type ClubItem = {
  title: string
  vibe: string
  tags: string[]
  text: string
}

// Interactive tab selector for the Beach Clubs group on the (redesigned)
// destination page. Replaces the earlier horizontal-scroll gallery: each
// club gets a full panel (photo + personality line + feature tags + real
// copy) instead of a cramped card, and switching is a click/tap on the
// club's name — no scrolling, no arrow buttons.
export default function BeachClubShowcase({ items }: { items: ClubItem[] }) {
  const [active, setActive] = useState(0)
  const club = items[active]

  return (
    <div className="dest-showcase">
      <div className="dest-showcase-tabs" role="tablist" aria-label="Beach clubs">
        {items.map((c, i) => (
          <button
            key={c.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`dest-showcase-tab${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="dest-showcase-panel">
        <div className="dest-showcase-photo">
          <span className="dest-showcase-photo-label">Photo placeholder — {club.title}</span>
        </div>
        <div className="dest-showcase-body">
          <p className="dest-showcase-vibe">{club.vibe}</p>
          <div className="dest-showcase-tags">
            {club.tags.map((t) => (
              <span key={t} className="dest-showcase-tag">{t}</span>
            ))}
          </div>
          <p className="dest-showcase-text">{club.text}</p>
        </div>
      </div>
    </div>
  )
}
