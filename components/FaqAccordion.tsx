'use client'

import { useState } from 'react'

export interface FaqItem {
  q: string
  a: React.ReactNode
}

// Reuses the exact .policy-* classes already built for the villa detail
// page's Check-In / Cancellation / Rules accordion, so this behaves and
// looks identical — one item open at a time, same chevron rotation.
export default function FaqAccordion({ items, groupId }: { items: FaqItem[]; groupId: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const toggle = (i: number) => setOpen((cur) => (cur === i ? null : i))

  return (
    <>
      {items.map((item, i) => {
        const id = `${groupId}-${i}`
        const isOpen = open === i
        return (
          <div className={`policy-item${isOpen ? ' open' : ''}`} id={id} key={id}>
            <button className="policy-trigger" type="button" aria-expanded={isOpen} onClick={() => toggle(i)}>
              <span className="policy-trigger-name">{item.q}</span>
              <svg className="policy-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <div className="policy-body">
              <div className="policy-content">{item.a}</div>
            </div>
          </div>
        )
      })}
    </>
  )
}
