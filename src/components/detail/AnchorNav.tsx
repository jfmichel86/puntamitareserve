'use client'

import { useEffect, useState } from 'react'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'staff', label: 'Staff' },
  { id: 'rates', label: 'Rates' },
  { id: 'location', label: 'Destination' },
]

export default function AnchorNav() {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState('overview')

  useEffect(() => {
    const onScroll = () => {
      const show = window.scrollY > 380
      setVisible(show)
      document.body.classList.toggle('an-visible', show)

      let current = 'overview'
      SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 170) current = id
      })
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.body.classList.remove('an-visible')
    }
  }, [])

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`anchor-nav${visible ? ' visible' : ''}`} role="navigation" aria-label="Page sections">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`an-link${active === s.id ? ' active' : ''}`}
          onClick={(e) => scrollTo(e, s.id)}
        >
          {s.label}
        </a>
      ))}
    </div>
  )
}
