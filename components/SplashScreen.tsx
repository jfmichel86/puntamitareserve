'use client'

import { useLayoutEffect, useState } from 'react'
import PyramidMark from './PyramidMark'

const SESSION_KEY = 'mr-splash-shown'

// A brief branded loading moment — the pyramid mark alone on navy, shown
// once per browser session (not on every internal page click) right as
// the site first loads, then fades away to reveal the real page and its
// wordmark. Uses useLayoutEffect (fires before the browser paints) rather
// than useEffect specifically so the very first thing painted is the
// splash, not a flash of the real page underneath it.
export default function SplashScreen() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
    // This IS the intended use of the effect — reading the one-time,
    // external "has this session already seen the splash" flag and
    // reflecting it into React state — not a computation that belongs in
    // render. The lint rule's cascading-render concern doesn't apply here:
    // this only ever runs once per session (the early return above skips it
    // on every subsequent mount), so there's no render loop to worry about.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    setVisible(true)
    const fadeTimer = setTimeout(() => setVisible(false), 650)
    const removeTimer = setTimeout(() => setMounted(false), 950)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className={`splash-screen${visible ? '' : ' splash-screen--hide'}`}>
      <PyramidMark size={64} />
    </div>
  )
}
