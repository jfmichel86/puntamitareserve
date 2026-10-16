'use client'

import { formatPrice } from '@/lib/utils'

export default function MobileCtaBar({ minRate }: { minRate: number | null }) {
  const scrollToInquiry = () => {
    document.querySelector('.iq-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="mobile-cta-bar">
      <div className="mobile-cta-price">
        <span className="mobile-cta-from">Starting from</span>
        <div className="mobile-cta-amount">
          <strong>{minRate ? formatPrice(minRate) : '—'}</strong>
          <span>/ night</span>
        </div>
      </div>
      <button className="mobile-cta-btn" type="button" onClick={scrollToInquiry}>Check Availability</button>
    </div>
  )
}
