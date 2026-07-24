// ─────────────────────────────────────────────────────────────────────────────
// PromotionsPanelInput.jsx
// Renders all 3 promotions side by side in 3 columns.
// Each column has a toggle switch to activate/deactivate.
// When activated, sub-fields expand below with smooth visual transition.
// Expired promotions are highlighted in red with an EXPIRED banner.
// ─────────────────────────────────────────────────────────────────────────────

import { set } from 'sanity'

const PROMOS = [
  {
    key: 'limitedTimePromotion',
    label: 'Limited Time',
    icon: '🏷',
    description: 'Time-sensitive discount with an expiry date',
    fields: [
      {
        name: 'offerType', title: 'Offer Type', type: 'select',
        options: [
          { value: 'percentage', label: 'Percentage discount' },
          { value: 'free-nights', label: 'Free nights' },
        ],
      },
      {
        name: 'percentageOff', title: 'Percentage Off', type: 'number',
        placeholder: '15', min: 1, max: 90,
        showIf: (v) => v.offerType === 'percentage',
      },
      {
        name: 'payNights', title: 'Pay (nights)', type: 'number',
        placeholder: '3', min: 1,
        showIf: (v) => v.offerType === 'free-nights',
      },
      {
        name: 'stayNights', title: 'Stay (nights)', type: 'number',
        placeholder: '4', min: 1,
        showIf: (v) => v.offerType === 'free-nights',
      },
      { name: 'expiryDate', title: 'Expiry Date', placeholder: '', type: 'date' },
      { name: 'note', title: 'Note', placeholder: 'Excludes Christmas week · Blackout dates apply' },
    ],
  },
  {
    key: 'propertyOfTheMonth',
    label: 'Prop. of the Month',
    icon: '🌟',
    description: 'Featured placement as Property of the Month',
    fields: [
      { name: 'month', title: 'Month', type: 'month-select' },
      { name: 'year',  title: 'Year',  type: 'year'         },
    ],
  },
  {
    key: 'lastMinuteDeal',
    label: 'Last Minute Deal',
    icon: '⚡',
    description: 'Short-notice availability at special rate',
    fields: [
      { name: 'availableDates', title: 'Available Dates', placeholder: 'Dec 12–15 or Jan 3–7' },
      // Same offer-type structure as Limited Time Promotion
      {
        name: 'offerType', title: 'Offer Type', type: 'select',
        options: [
          { value: 'percentage', label: 'Percentage discount' },
          { value: 'free-nights', label: 'Free nights' },
        ],
      },
      {
        name: 'percentageOff', title: 'Percentage Off', type: 'number',
        placeholder: '15', min: 1, max: 90,
        showIf: (v) => v.offerType === 'percentage',
      },
      {
        name: 'payNights', title: 'Pay (nights)', type: 'number',
        placeholder: '3', min: 1,
        showIf: (v) => v.offerType === 'free-nights',
      },
      {
        name: 'stayNights', title: 'Stay (nights)', type: 'number',
        placeholder: '4', min: 1,
        showIf: (v) => v.offerType === 'free-nights',
      },
      { name: 'note', title: 'Note', placeholder: '3-night min · Book before Dec 1' },
    ],
  },
]

// Returns true if the date string is in the past
function isExpired(dateStr) {
  if (!dateStr) return false
  const today = new Date().toISOString().slice(0, 10)
  return dateStr < today
}

// Returns days until expiry (negative = already expired, null = no date)
function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date().toISOString().slice(0, 10)
  const diff = new Date(dateStr) - new Date(today)
  return Math.ceil(diff / 86400000)
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({ isOn, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={onToggle}
      style={{
        width: '38px', height: '20px',
        borderRadius: '10px',
        background: isOn ? '#2276fc' : '#d1d5db',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.2s',
        padding: 0,
        outline: 'none',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px',
        left: isOn ? '20px' : '2px',
        width: '16px', height: '16px',
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionsPanelInput({ value = {}, onChange }) {

  const toggleActive = (key) => {
    const current = value[key] || {}
    const nextActive = !current.active
    const next = { ...current, active: nextActive }
    if (!nextActive) {
      PROMOS.find(p => p.key === key)?.fields.forEach(f => delete next[f.name])
    }
    onChange(set({ ...value, [key]: next }))
  }

  const setSubField = (key, fieldName, val) => {
    const current = value[key] || {}
    onChange(set({
      ...value,
      [key]: { ...current, [fieldName]: val || undefined },
    }))
  }

  const activeCount = PROMOS.filter(p => !!(value[p.key]?.active)).length

  // Find the soonest expiry among non-expired active promos
  const soonestExpiry = (() => {
    const expiries = PROMOS
      .filter(p => value[p.key]?.active && value[p.key]?.expiryDate && !isExpired(value[p.key].expiryDate))
      .map(p => daysUntil(value[p.key].expiryDate))
      .filter(d => d !== null && d <= 14)
    return expiries.length ? Math.min(...expiries) : null
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* ── Status bar ── */}
      <div style={{
        padding: '8px 14px',
        background: activeCount > 0 ? '#eff6ff' : '#f9fafb',
        border: `1px solid ${activeCount > 0 ? '#bfdbfe' : '#e5e7eb'}`,
        borderRadius: '7px 7px 0 0',
        borderBottom: 'none',
        fontSize: '12px',
        color: activeCount > 0 ? '#1d4ed8' : '#9ca3af',
        fontWeight: activeCount > 0 ? '600' : '400',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span>
          {activeCount === 0
            ? 'No active promotions — toggle one on to activate it'
            : `${activeCount} active promotion${activeCount > 1 ? 's' : ''}`
          }
        </span>
        {soonestExpiry !== null && (
          <span style={{
            fontSize: '11px', fontWeight: '700',
            color: soonestExpiry <= 3 ? '#b91c1c' : '#92400e',
            background: soonestExpiry <= 3 ? '#fee2e2' : '#fef3c7',
            border: `1px solid ${soonestExpiry <= 3 ? '#fca5a5' : '#fde68a'}`,
            borderRadius: '5px', padding: '2px 8px',
          }}>
            {soonestExpiry <= 3 ? '⚠' : '⏱'}&nbsp;
            {soonestExpiry === 0 ? 'One expires today!' : soonestExpiry === 1 ? 'One expires tomorrow' : `One expires in ${soonestExpiry} days`}
          </span>
        )}
      </div>

      {/* ── Responsive columns — 3 side by side when wide enough, stacked on narrow ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1px',
        background: '#e5e7eb',
        border: '1px solid #e5e7eb',
        borderRadius: '0 0 8px 8px',
        overflow: 'hidden',
      }}>
        {PROMOS.map((promo, i) => {
          const promoVal = value[promo.key] || {}
          const isActive = !!promoVal.active
          const expired  = isActive && promoVal.expiryDate && isExpired(promoVal.expiryDate)

          return (
            <div
              key={promo.key}
              style={{
                background: expired ? '#fff9f9' : isActive ? '#f8fbff' : '#ffffff',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'background 0.2s',
                borderTop: expired ? '3px solid #ef4444' : isActive ? '3px solid #2276fc' : '3px solid transparent',
              }}
            >
              {/* ── Header: icon + label + toggle ── */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>{promo.icon}</span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: expired ? '#b91c1c' : isActive ? '#111' : '#6b7280',
                      lineHeight: '1.2',
                    }}>
                      {promo.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4' }}>
                    {promo.description}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <ToggleSwitch isOn={isActive} onToggle={() => toggleActive(promo.key)} />
                  <span style={{ fontSize: '10px', fontWeight: '700', color: isActive ? '#2276fc' : '#9ca3af' }}>
                    {isActive ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* ── EXPIRED banner ── */}
              {expired && (
                <div style={{
                  padding: '7px 10px',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '5px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  ⚠ EXPIRED — update date or deactivate
                </div>
              )}

              {/* ── Sub-fields — visible only when active ── */}
              {isActive && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {promo.fields
                    // showIf lets a field only appear once an earlier one is
                    // set a certain way (Percentage Off only once "Percentage
                    // discount" is picked, Pay/Stay only once "Free nights" is)
                    .filter(field => !field.showIf || field.showIf(promoVal))
                    .map(field => (
                    <div key={field.name}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '5px',
                      }}>
                        {field.title}
                      </div>

                      {/* ── Generic select dropdown (field.options) ── */}
                      {field.type === 'select' && (
                        <select
                          value={promoVal[field.name] || ''}
                          onChange={e => setSubField(promo.key, field.name, e.target.value || undefined)}
                          style={{
                            width: '100%', padding: '7px 10px', border: '1.5px solid #e5e7eb',
                            borderRadius: '5px', fontSize: '13px', color: promoVal[field.name] ? '#111' : '#9ca3af',
                            outline: 'none', boxSizing: 'border-box', background: 'white', cursor: 'pointer',
                          }}
                        >
                          <option value="">Select…</option>
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {/* ── Generic number input ── */}
                      {field.type === 'number' && (
                        <input
                          type="number"
                          min={field.min}
                          max={field.max}
                          value={promoVal[field.name] || ''}
                          placeholder={field.placeholder || ''}
                          onChange={e => setSubField(promo.key, field.name, e.target.value ? Number(e.target.value) : undefined)}
                          style={{
                            width: '100%', padding: '7px 10px', border: '1.5px solid #e5e7eb',
                            borderRadius: '5px', fontSize: '13px', color: '#111',
                            outline: 'none', boxSizing: 'border-box', background: 'white',
                          }}
                        />
                      )}

                      {/* ── Month select dropdown ── */}
                      {field.type === 'month-select' && (
                        <select
                          value={promoVal[field.name] || ''}
                          onChange={e => setSubField(promo.key, field.name, e.target.value ? Number(e.target.value) : undefined)}
                          style={{
                            width: '100%', padding: '7px 10px', border: '1.5px solid #e5e7eb',
                            borderRadius: '5px', fontSize: '13px', color: promoVal[field.name] ? '#111' : '#9ca3af',
                            outline: 'none', boxSizing: 'border-box', background: 'white', cursor: 'pointer',
                          }}
                        >
                          <option value="">Select month…</option>
                          {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                          ))}
                        </select>
                      )}

                      {/* ── Year number input ── */}
                      {field.type === 'year' && (
                        <input
                          type="number"
                          min={new Date().getFullYear()}
                          max={new Date().getFullYear() + 3}
                          value={promoVal[field.name] || ''}
                          placeholder={String(new Date().getFullYear())}
                          onChange={e => setSubField(promo.key, field.name, e.target.value ? Number(e.target.value) : undefined)}
                          style={{
                            width: '100%', padding: '7px 10px', border: '1.5px solid #e5e7eb',
                            borderRadius: '5px', fontSize: '13px', color: '#111',
                            outline: 'none', boxSizing: 'border-box', background: 'white',
                          }}
                        />
                      )}

                      {/* ── Date input ── */}
                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={promoVal[field.name] || ''}
                          onChange={e => setSubField(promo.key, field.name, e.target.value)}
                          onFocus={e => { e.target.style.borderColor = '#2276fc'; e.target.style.boxShadow = '0 0 0 2px rgba(34,118,252,0.15)' }}
                          onBlur={e  => { e.target.style.borderColor = isExpired(promoVal[field.name]) ? '#fca5a5' : '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                          style={{
                            width: '100%', padding: '7px 10px',
                            border: `1.5px solid ${isExpired(promoVal[field.name]) ? '#fca5a5' : '#e5e7eb'}`,
                            borderRadius: '5px', fontSize: '13px', color: '#111',
                            outline: 'none', boxSizing: 'border-box',
                            background: isExpired(promoVal[field.name]) ? '#fff7f7' : 'white',
                          }}
                        />
                      )}

                      {/* ── Default text input ── */}
                      {!field.type && (
                        <input
                          type="text"
                          value={promoVal[field.name] || ''}
                          placeholder={field.placeholder || ''}
                          onChange={e => setSubField(promo.key, field.name, e.target.value)}
                          onFocus={e => { e.target.style.borderColor = '#2276fc'; e.target.style.boxShadow = '0 0 0 2px rgba(34,118,252,0.15)' }}
                          onBlur={e  => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                          style={{
                            width: '100%', padding: '7px 10px', border: '1.5px solid #e5e7eb',
                            borderRadius: '5px', fontSize: '13px', color: '#111',
                            outline: 'none', boxSizing: 'border-box', background: 'white',
                          }}
                        />
                      )}

                      {field.name === 'expiryDate' && promoVal[field.name] && !isExpired(promoVal[field.name]) && (() => {
                        const days   = daysUntil(promoVal[field.name])
                        if (days === null || days > 30) return null
                        const urgent = days <= 7
                        return (
                          <div style={{
                            marginTop: '5px', fontSize: '11px', fontWeight: '700',
                            color: urgent ? '#b91c1c' : '#92400e',
                            background: urgent ? '#fee2e2' : '#fef3c7',
                            border: `1px solid ${urgent ? '#fca5a5' : '#fde68a'}`,
                            borderRadius: '5px', padding: '4px 8px',
                            display: 'flex', alignItems: 'center', gap: '5px',
                          }}>
                            {urgent ? '⚠' : '⏱'}
                            {days === 0 ? 'Expires today!' : days === 1 ? 'Expires tomorrow' : `${days} days remaining`}
                          </div>
                        )
                      })()}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Live preview — shown when active and at least one field is filled ── */}
              {isActive && !expired && (() => {
                const hasContent = promo.fields.some(f => promoVal[f.name])
                if (!hasContent) return null
                const previewText = (() => {
                  if (promo.key === 'limitedTimePromotion') {
                    let offerText = 'Limited offer'
                    if (promoVal.offerType === 'percentage' && promoVal.percentageOff) {
                      offerText = `${promoVal.percentageOff}% Off`
                    } else if (promoVal.offerType === 'free-nights' && promoVal.payNights && promoVal.stayNights) {
                      offerText = `Pay ${promoVal.payNights}, Stay ${promoVal.stayNights}`
                    }
                    const parts = [offerText]
                    if (promoVal.expiryDate) parts.push(`until ${promoVal.expiryDate}`)
                    return parts.join(' · ')
                  }
                  if (promo.key === 'propertyOfTheMonth') {
                    const parts = ['Property of the Month']
                    if (promoVal.month && promoVal.year) {
                      const monthName = ['January','February','March','April','May','June','July','August','September','October','November','December'][promoVal.month - 1]
                      parts.push(`${monthName} ${promoVal.year}`)
                    }
                    return parts.join(' · ')
                  }
                  if (promo.key === 'lastMinuteDeal') {
                    let offerText = 'Last Minute Deal'
                    if (promoVal.offerType === 'percentage' && promoVal.percentageOff) {
                      offerText = `${promoVal.percentageOff}% Off`
                    } else if (promoVal.offerType === 'free-nights' && promoVal.payNights && promoVal.stayNights) {
                      offerText = `Pay ${promoVal.payNights}, Stay ${promoVal.stayNights}`
                    }
                    const parts = [offerText]
                    if (promoVal.availableDates) parts.push(promoVal.availableDates)
                    return parts.join(' · ')
                  }
                  return ''
                })()
                if (!previewText) return null
                return (
                  <div style={{
                    padding: '8px 10px',
                    background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                  }}>
                    <div style={{ fontSize: '9px', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Preview
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px' }}>{promo.icon}</span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#1d4ed8', lineHeight: '1.3' }}>
                        {previewText}
                      </span>
                    </div>
                  </div>
                )
              })()}

              {/* ── Inactive placeholder ── */}
              {!isActive && (
                <div style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px dashed #e5e7eb',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#d1d5db',
                  fontStyle: 'italic',
                }}>
                  Toggle on to configure
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
