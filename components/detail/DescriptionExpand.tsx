'use client'

import { useEffect, useRef, useState } from 'react'

export default function DescriptionExpand({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = bodyRef.current
      if (el) setOverflows(el.scrollHeight > el.offsetHeight + 8)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <div ref={bodyRef} className={`desc-body${open ? ' open' : ''}`}>
        <div className="sec-body">{children}</div>
      </div>
      {overflows && (
        <button className={`expand-btn${open ? ' open' : ''}`} type="button" onClick={() => setOpen((o) => !o)}>
          {open ? 'Show less' : 'Show more'}
          <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      )}
    </>
  )
}
