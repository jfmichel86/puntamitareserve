// ─────────────────────────────────────────────────────────────────────────────
// BulkPromotionsTool.jsx
// Admin tool for managing promotions across all properties.
//
// Features:
//  • Table of all properties with their current promotion status
//  • Click a row or checkbox to select it — click again to deselect
//  • "Select All" checkbox in header
//  • Bulk action bar appears when any property is selected:
//      Apply / Remove promotions for the entire selection at once
//  • Filter by location and promotion status
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'

// ─── Icon ─────────────────────────────────────────────────────────────────────

export function BulkPromotionsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      width="1em" height="1em">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}

// ─── Deduplication ───────────────────────────────────────────────────────────
// Sanity returns both "drafts.xxx" and "xxx" for the same property.
// Prefer draft over published — drafts hold the latest edits since liveEdit was removed.
function dedup(items) {
  const map = {}
  for (const item of items) {
    const baseId = item._id.startsWith('drafts.') ? item._id.slice(7) : item._id
    if (!map[baseId] || item._id.startsWith('drafts.')) map[baseId] = item
  }
  return Object.values(map)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function monthLabel(m, y) {
  if (!m || !y) return null
  return `${MONTHS[m - 1]} ${y}`
}

function isExpired(dateStr) {
  if (!dateStr) return false
  return dateStr < new Date().toISOString().slice(0, 10)
}

// Builds the discount label from the shared percentage/free-nights
// structure, mirroring src/lib/utils.ts's offerLabel — this tool is a
// separate app from the Next.js site, so the logic is duplicated here
// rather than shared via an import. Used by both Limited Time Promotion
// and Last Minute Deal, which share this exact same offer-type structure.
function offerLabel(offer, fallback) {
  if (!offer) return fallback
  if (offer.offerType === 'percentage' && offer.percentageOff) return `${offer.percentageOff}% Off`
  if (offer.offerType === 'free-nights' && offer.payNights && offer.stayNights) return `Pay ${offer.payNights}, Stay ${offer.stayNights}`
  return fallback
}
const ltdLabel = (ltd) => offerLabel(ltd, 'Limited-Time Offer')
const lmdLabel = (lmd) => offerLabel(lmd, 'Last-Minute Deal')

// ─── Filter Pill ──────────────────────────────────────────────────────────────

function Pill({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '5px 13px', fontSize: '12px', fontWeight: active ? '700' : '500',
      border: `1.5px solid ${active ? '#2276fc' : '#e5e7eb'}`,
      borderRadius: '20px',
      background: active ? '#eff6ff' : 'white',
      color: active ? '#1d4ed8' : '#6b7280',
      cursor: 'pointer', transition: 'all 0.12s',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  )
}

// ─── Promo Badge ──────────────────────────────────────────────────────────────

function PromoBadge({ label, type, expired }) {
  const colors = {
    limited:    { bg: '#fef3c7', border: '#fde68a', text: '#92400e' },
    potm:       { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
    lastminute: { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1' },
    expired:    { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c' },
  }
  const c = expired ? colors.expired : colors[type]
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '20px',
      fontSize: '11px', fontWeight: '700',
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>
      {expired ? '⚠ EXPIRED' : label}
    </span>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'white', borderRadius: '14px',
        padding: '28px 32px', width: '480px', maxWidth: '90vw',
        maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#111', lineHeight: 1.3, flex: 1, paddingRight: '12px' }}>{title}</div>
            <button type="button" onClick={onClose} style={{
              background: '#f3f4f6', border: 'none', width: '28px', height: '28px',
              borderRadius: '50%', fontSize: '16px', color: '#6b7280', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>×</button>
          </div>
          {subtitle && <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>{subtitle}</div>}
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Promo Form ───────────────────────────────────────────────────────────────

function PromoForm({ type, initial = {}, onSave, onCancel, saving }) {
  const [data, setData] = useState(initial)
  const upd = (k, v) => setData(d => ({ ...d, [k]: v }))

  const isValid = () => {
    if (type === 'limitedTimePromotion') {
      if (!data.expiryDate) return false
      if (data.offerType === 'percentage') return !!data.percentageOff
      if (data.offerType === 'free-nights') return !!data.payNights && !!data.stayNights
      return false
    }
    if (type === 'propertyOfTheMonth')  return !!data.month && !!data.year
    if (type === 'lastMinuteDeal') {
      if (!data.availableDates?.trim()) return false
      if (data.offerType === 'percentage') return !!data.percentageOff
      if (data.offerType === 'free-nights') return !!data.payNights && !!data.stayNights
      return false
    }
    return false
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb',
    borderRadius: '8px', fontSize: '13px', color: '#111',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  }
  const Label = ({ children }) => (
    <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
      {children}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {type === 'limitedTimePromotion' && (
        <>
          <div>
            <Label>Offer Type *</Label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[['percentage', 'Percentage discount'], ['free-nights', 'Free nights']].map(([val, lbl]) => (
                <button key={val} type="button"
                  onClick={() => upd('offerType', val)}
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: '8px',
                    border: `1.5px solid ${data.offerType === val ? '#2276fc' : '#e5e7eb'}`,
                    background: data.offerType === val ? '#eff6ff' : 'white',
                    color: data.offerType === val ? '#1d4ed8' : '#6b7280',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.12s',
                  }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {data.offerType === 'percentage' && (
            <div>
              <Label>Percentage Off *</Label>
              <input type="number" min="1" max="90" value={data.percentageOff || ''} placeholder="e.g. 15"
                onChange={e => upd('percentageOff', e.target.value ? Number(e.target.value) : undefined)}
                onFocus={e => e.target.style.borderColor = '#2276fc'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                style={inputStyle} />
            </div>
          )}

          {data.offerType === 'free-nights' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <Label>Pay (nights) *</Label>
                <input type="number" min="1" value={data.payNights || ''} placeholder="e.g. 3"
                  onChange={e => upd('payNights', e.target.value ? Number(e.target.value) : undefined)}
                  onFocus={e => e.target.style.borderColor = '#2276fc'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  style={inputStyle} />
              </div>
              <div>
                <Label>Stay (nights) *</Label>
                <input type="number" min="1" value={data.stayNights || ''} placeholder="e.g. 4"
                  onChange={e => upd('stayNights', e.target.value ? Number(e.target.value) : undefined)}
                  onFocus={e => e.target.style.borderColor = '#2276fc'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  style={inputStyle} />
              </div>
            </div>
          )}

          <div>
            <Label>Expiry Date *</Label>
            <input type="date" value={data.expiryDate || ''}
              onChange={e => upd('expiryDate', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#2276fc'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              style={inputStyle} />
            {data.expiryDate && isExpired(data.expiryDate) && (
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#b91c1c', fontWeight: '600' }}>⚠ This date is in the past</div>
            )}
          </div>

          <div>
            <Label>Note (optional)</Label>
            <input type="text" value={data.note || ''} placeholder="e.g. Excludes Christmas week · Blackout dates apply"
              onChange={e => upd('note', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#2276fc'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              style={inputStyle} />
          </div>
        </>
      )}

      {type === 'propertyOfTheMonth' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <Label>Month *</Label>
            <select value={data.month || ''} onChange={e => upd('month', Number(e.target.value))}
              onFocus={e => e.target.style.borderColor = '#2276fc'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select month…</option>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <Label>Year *</Label>
            <input type="number" min={new Date().getFullYear()} max={new Date().getFullYear() + 3}
              value={data.year || ''} placeholder={String(new Date().getFullYear())}
              onChange={e => upd('year', e.target.value ? Number(e.target.value) : '')}
              onFocus={e => e.target.style.borderColor = '#2276fc'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              style={inputStyle} />
          </div>
        </div>
      )}

      {type === 'lastMinuteDeal' && (
        <>
          <div>
            <Label>Available Dates *</Label>
            <input type="text" value={data.availableDates || ''} placeholder="e.g. Dec 12–15 or Jan 3–7"
              onChange={e => upd('availableDates', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#2276fc'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              style={inputStyle} />
          </div>

          <div>
            <Label>Offer Type *</Label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[['percentage', 'Percentage discount'], ['free-nights', 'Free nights']].map(([val, lbl]) => (
                <button key={val} type="button"
                  onClick={() => upd('offerType', val)}
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: '8px',
                    border: `1.5px solid ${data.offerType === val ? '#2276fc' : '#e5e7eb'}`,
                    background: data.offerType === val ? '#eff6ff' : 'white',
                    color: data.offerType === val ? '#1d4ed8' : '#6b7280',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.12s',
                  }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {data.offerType === 'percentage' && (
            <div>
              <Label>Percentage Off *</Label>
              <input type="number" min="1" max="90" value={data.percentageOff || ''} placeholder="e.g. 15"
                onChange={e => upd('percentageOff', e.target.value ? Number(e.target.value) : undefined)}
                onFocus={e => e.target.style.borderColor = '#2276fc'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                style={inputStyle} />
            </div>
          )}

          {data.offerType === 'free-nights' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <Label>Pay (nights) *</Label>
                <input type="number" min="1" value={data.payNights || ''} placeholder="e.g. 3"
                  onChange={e => upd('payNights', e.target.value ? Number(e.target.value) : undefined)}
                  onFocus={e => e.target.style.borderColor = '#2276fc'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  style={inputStyle} />
              </div>
              <div>
                <Label>Stay (nights) *</Label>
                <input type="number" min="1" value={data.stayNights || ''} placeholder="e.g. 4"
                  onChange={e => upd('stayNights', e.target.value ? Number(e.target.value) : undefined)}
                  onFocus={e => e.target.style.borderColor = '#2276fc'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  style={inputStyle} />
              </div>
            </div>
          )}

          <div>
            <Label>Note (optional)</Label>
            <input type="text" value={data.note || ''} placeholder="e.g. 3-night min · Book before Dec 1"
              onChange={e => upd('note', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#2276fc'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              style={inputStyle} />
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px', borderTop: '1px solid #f3f4f6' }}>
        <button type="button" onClick={onCancel} disabled={saving} style={{
          padding: '9px 20px', border: '1.5px solid #e5e7eb', borderRadius: '8px',
          background: 'white', color: '#6b7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
        }}>Cancel</button>
        <button type="button" disabled={!isValid() || saving} onClick={() => onSave({ active: true, ...data })}
          style={{
            padding: '9px 20px', border: 'none', borderRadius: '8px',
            background: isValid() && !saving ? '#2276fc' : '#e5e7eb',
            color: isValid() && !saving ? 'white' : '#9ca3af',
            fontSize: '13px', fontWeight: '700',
            cursor: isValid() && !saving ? 'pointer' : 'not-allowed',
          }}>
          {saving ? 'Saving…' : 'Apply Promotion'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Tool ────────────────────────────────────────────────────────────────

export function BulkPromotionsTool() {
  const client = useClient({ apiVersion: '2024-01-01' })

  const [properties,  setProperties]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [selected,    setSelected]    = useState(new Set())
  const [filterLoc,      setFilterLoc]      = useState('all')
  const [filterFeatured, setFilterFeatured] = useState('all')
  const [filterPromo,    setFilterPromo]    = useState('all')
  const [search,      setSearch]      = useState('')
  const [modal,       setModal]       = useState(null)
  const [feedback,    setFeedback]    = useState(null)

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const data = await client.fetch(`
        *[_type == "property"] | order(title asc) {
          _id, title, status, locationLabel, bedrooms, featured, promotions
        }
      `)
      setProperties(dedup(data || []))
    } catch (err) {
      setFeedback({ kind: 'error', message: 'Failed to load: ' + err.message })
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => { fetchProperties() }, [fetchProperties])

  useEffect(() => {
    if (!feedback) return
    const id = setTimeout(() => setFeedback(null), 5000)
    return () => clearTimeout(id)
  }, [feedback])

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = properties.filter(p => {
    if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterLoc !== 'all' && p.locationLabel !== filterLoc) return false
    if (filterFeatured === 'featured' && !p.featured) return false
    if (filterFeatured === 'not-featured' && p.featured) return false
    const promos = p.promotions
    if (filterPromo === 'none')       return !promos?.limitedTimePromotion?.active && !promos?.propertyOfTheMonth?.active && !promos?.lastMinuteDeal?.active
    if (filterPromo === 'any')        return promos?.limitedTimePromotion?.active || promos?.propertyOfTheMonth?.active || promos?.lastMinuteDeal?.active
    if (filterPromo === 'limited')    return !!promos?.limitedTimePromotion?.active
    if (filterPromo === 'potm')       return !!promos?.propertyOfTheMonth?.active
    if (filterPromo === 'lastminute') return !!promos?.lastMinuteDeal?.active
    if (filterPromo === 'expired')    return promos?.limitedTimePromotion?.active && isExpired(promos.limitedTimePromotion.expiryDate)
    return true
  })

  // ── Selection ──────────────────────────────────────────────────────────────

  const toggleOne = (id, e) => {
    e?.stopPropagation()
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p._id))
  const someSelected = filtered.some(p => selected.has(p._id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(s => { const n = new Set(s); filtered.forEach(p => n.delete(p._id)); return n })
    } else {
      setSelected(s => { const n = new Set(s); filtered.forEach(p => n.add(p._id)); return n })
    }
  }

  // ── Apply / Remove ─────────────────────────────────────────────────────────

  const applyPromo = async (promoType, promoData, ids) => {
    setSaving(true)
    try {
      await Promise.all(ids.map(id =>
        client.patch(id).setIfMissing({ promotions: {} }).set({ [`promotions.${promoType}`]: promoData }).commit()
      ))
      await fetchProperties()
      setFeedback({ kind: 'success', message: `✓ Promotion applied to ${ids.length} propert${ids.length === 1 ? 'y' : 'ies'}` })
      setModal(null)
    } catch (err) {
      setFeedback({ kind: 'error', message: 'Error: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  const removePromo = async (promoType, ids) => {
    setSaving(true)
    try {
      await Promise.all(ids.map(id =>
        client.patch(id).unset([`promotions.${promoType}`]).commit()
      ))
      await fetchProperties()
      setFeedback({ kind: 'success', message: `✓ Promotion removed from ${ids.length} propert${ids.length === 1 ? 'y' : 'ies'}` })
      setModal(null)
    } catch (err) {
      setFeedback({ kind: 'error', message: 'Error: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  const selIds    = [...selected]
  const selCount  = selIds.length
  const hasSelect = selCount > 0

  const PROMO_TYPES = [
    { key: 'limitedTimePromotion', icon: '🏷', label: 'Limited Time' },
    { key: 'propertyOfTheMonth',   icon: '🌟', label: 'Prop. of Month' },
    { key: 'lastMinuteDeal',       icon: '⚡', label: 'Last Minute' },
  ]

  const promoTypeLabel = (key) => PROMO_TYPES.find(t => t.key === key)?.label || key

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: '#111' }}>Promotions Manager</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
            {properties.length} properties · {properties.filter(p => p.promotions?.limitedTimePromotion?.active || p.promotions?.propertyOfTheMonth?.active || p.promotions?.lastMinuteDeal?.active).length} with active promotions
          </p>
        </div>
        <button type="button" onClick={fetchProperties} disabled={loading} style={{
          padding: '8px 16px', background: 'white', border: '1.5px solid #e5e7eb',
          borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#374151',
          cursor: loading ? 'default' : 'pointer',
        }}>
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* ── Toast ── */}
      {feedback && (
        <div style={{
          padding: '11px 16px', borderRadius: '9px', marginBottom: '16px', fontSize: '13px', fontWeight: '600',
          background: feedback.kind === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1.5px solid ${feedback.kind === 'success' ? '#86efac' : '#fca5a5'}`,
          color: feedback.kind === 'success' ? '#15803d' : '#b91c1c',
        }}>
          {feedback.message}
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '2px' }}>Destination</span>
        <Pill label="All"             active={filterLoc === 'all'}                onClick={() => setFilterLoc('all')} />
        <Pill label="Punta Mita"      active={filterLoc === 'punta-mita'}         onClick={() => setFilterLoc('punta-mita')} />
        <Pill label="Punta de Mita"   active={filterLoc === 'punta-de-mita-area'} onClick={() => setFilterLoc('punta-de-mita-area')} />
        <Pill label="Puerto Vallarta" active={filterLoc === 'puerto-vallarta'}    onClick={() => setFilterLoc('puerto-vallarta')} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '2px' }}>Featured</span>
        <Pill label="All"             active={filterFeatured === 'all'}          onClick={() => setFilterFeatured('all')} />
        <Pill label="⭐ Featured"      active={filterFeatured === 'featured'}     onClick={() => setFilterFeatured('featured')} />
        <Pill label="Not Featured"    active={filterFeatured === 'not-featured'} onClick={() => setFilterFeatured('not-featured')} />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '2px' }}>Promotions</span>
        <Pill label="All"            active={filterPromo === 'all'}        onClick={() => setFilterPromo('all')} />
        <Pill label="Has Any"        active={filterPromo === 'any'}        onClick={() => setFilterPromo('any')} />
        <Pill label="None"           active={filterPromo === 'none'}       onClick={() => setFilterPromo('none')} />
        <Pill label="🏷 Limited"     active={filterPromo === 'limited'}    onClick={() => setFilterPromo('limited')} />
        <Pill label="🌟 Prop/Month"  active={filterPromo === 'potm'}       onClick={() => setFilterPromo('potm')} />
        <Pill label="⚡ Last Minute" active={filterPromo === 'lastminute'} onClick={() => setFilterPromo('lastminute')} />
        <Pill label="⚠ Expired"     active={filterPromo === 'expired'}    onClick={() => setFilterPromo('expired')} />
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom: '14px', position: 'relative', maxWidth: '340px' }}>
        <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px', pointerEvents: 'none' }}>🔍</span>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by property name…"
          style={{
            width: '100%', padding: '8px 10px 8px 32px', border: '1.5px solid #e5e7eb',
            borderRadius: '9px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#2276fc'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      {/* ── Bulk Action Bar — appears when something is selected ── */}
      {hasSelect && (
        <div style={{
          padding: '14px 18px', marginBottom: '14px',
          background: '#1d2433', border: '1px solid #374151',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginRight: '4px' }}>
            {selCount} {selCount === 1 ? 'property' : 'properties'} selected
          </span>

          <span style={{ color: '#4b5563', fontSize: '16px' }}>|</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Apply:</span>

          {PROMO_TYPES.map(pt => (
            <button key={pt.key} type="button"
              onClick={() => setModal({ action: 'apply', type: pt.key, ids: selIds })}
              style={{
                padding: '7px 14px', border: 'none', borderRadius: '7px',
                background: '#2276fc', color: 'white',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}>
              {pt.icon} {pt.label}
            </button>
          ))}

          <span style={{ color: '#4b5563', fontSize: '16px' }}>|</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Remove:</span>

          {PROMO_TYPES.map(pt => (
            <button key={pt.key} type="button"
              onClick={() => setModal({ action: 'remove', type: pt.key, ids: selIds })}
              style={{
                padding: '7px 14px', border: '1px solid #7f1d1d', borderRadius: '7px',
                background: '#450a0a', color: '#fca5a5',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              }}>
              {pt.icon} {pt.label}
            </button>
          ))}

          <button type="button" onClick={() => setSelected(new Set())} style={{
            marginLeft: 'auto', padding: '7px 14px', border: '1px solid #374151',
            borderRadius: '7px', background: 'transparent', color: '#9ca3af',
            fontSize: '12px', cursor: 'pointer',
          }}>
            ✕ Clear selection
          </button>
        </div>
      )}

      {/* ── Helper hint when nothing selected ── */}
      {!hasSelect && !loading && filtered.length > 0 && (
        <div style={{
          padding: '11px 16px', marginBottom: '14px',
          background: '#f9fafb', border: '1.5px dashed #e5e7eb', borderRadius: '9px',
          fontSize: '13px', color: '#9ca3af',
        }}>
          ☑ Select one or more properties below, then use the action bar to add, edit or remove promotions in bulk
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontSize: '14px' }}>Loading properties…</div>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '11px 14px', width: '40px' }}>
                  <input type="checkbox" checked={allSelected} ref={el => { if (el) el.indeterminate = !allSelected && someSelected }}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#2276fc' }} />
                </th>
                {['Property', 'Destination', '🏷 Limited Time', '🌟 Prop. of Month', '⚡ Last Minute'].map(h => (
                  <th key={h} style={{
                    padding: '11px 14px', textAlign: 'left',
                    fontSize: '11px', fontWeight: '700', color: '#6b7280',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                    No properties match the current filters
                  </td>
                </tr>
              )}
              {filtered.map((prop, i) => {
                const isSelected = selected.has(prop._id)
                const ltd  = prop.promotions?.limitedTimePromotion
                const potm = prop.promotions?.propertyOfTheMonth
                const lmd  = prop.promotions?.lastMinuteDeal

                const locationShort = {
                  'punta-mita':         'Punta Mita',
                  'punta-de-mita-area': 'Punta de Mita',
                  'puerto-vallarta':    'Puerto Vallarta',
                }[prop.locationLabel] || '—'

                return (
                  <tr key={prop._id}
                    onClick={() => toggleOne(prop._id)}
                    style={{
                      background: isSelected ? '#eff6ff' : i % 2 === 0 ? 'white' : '#fafafa',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      outline: isSelected ? '2px solid #2276fc' : 'none',
                      outlineOffset: '-2px',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f5f7ff' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa' }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(prop._id)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#2276fc' }} />
                    </td>

                    {/* Title */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: '600', color: '#111' }}>
                        {prop.featured && <span title="Featured" style={{ marginRight: '5px' }}>⭐</span>}
                        {prop.title || 'Untitled'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {prop.bedrooms ? `${prop.bedrooms} BR · ` : ''}
                        {prop.status === 'published' ? '✅ Published' : prop.status === 'draft' ? '🔒 Draft' : '📦 Archived'}
                      </div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '11px 14px', color: '#6b7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {locationShort}
                    </td>

                    {/* Limited Time */}
                    <td style={{ padding: '11px 14px' }}>
                      {ltd?.active ? (
                        <div>
                          <PromoBadge type="limited" label="🏷 Active" expired={isExpired(ltd.expiryDate)} />
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>{ltdLabel(ltd)}</div>
                          {ltd.expiryDate && <div style={{ fontSize: '10px', color: isExpired(ltd.expiryDate) ? '#b91c1c' : '#9ca3af', marginTop: '1px' }}>Until {ltd.expiryDate}</div>}
                        </div>
                      ) : <span style={{ color: '#d1d5db', fontSize: '13px' }}>—</span>}
                    </td>

                    {/* Prop of Month */}
                    <td style={{ padding: '11px 14px' }}>
                      {potm?.active ? (
                        <div>
                          <PromoBadge type="potm" label="🌟 Active" />
                          {(potm.month && potm.year) && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>{monthLabel(potm.month, potm.year)}</div>}
                        </div>
                      ) : <span style={{ color: '#d1d5db', fontSize: '13px' }}>—</span>}
                    </td>

                    {/* Last Minute */}
                    <td style={{ padding: '11px 14px' }}>
                      {lmd?.active ? (
                        <div>
                          <PromoBadge type="lastminute" label="⚡ Active" />
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>{lmdLabel(lmd)}</div>
                          {lmd.availableDates && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>{lmd.availableDates}</div>}
                        </div>
                      ) : <span style={{ color: '#d1d5db', fontSize: '13px' }}>—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Table footer */}
          <div style={{ padding: '10px 14px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', fontSize: '12px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
            <span>Showing {filtered.length} of {properties.length} properties</span>
            {hasSelect && <span style={{ color: '#2276fc', fontWeight: '600' }}>{selCount} selected</span>}
          </div>
        </div>
      )}

      {/* ── Apply Modal ── */}
      {modal?.action === 'apply' && (
        <Modal
          title={`Apply ${PROMO_TYPES.find(t => t.key === modal.type)?.icon} ${promoTypeLabel(modal.type)}`}
          subtitle={`Will be applied to ${modal.ids.length} ${modal.ids.length === 1 ? 'property' : 'properties'}`}
          onClose={() => !saving && setModal(null)}
        >
          <PromoForm
            type={modal.type}
            initial={modal.ids.length === 1
              ? (properties.find(p => p._id === modal.ids[0])?.promotions?.[modal.type] || {})
              : {}
            }
            onSave={(data) => applyPromo(modal.type, data, modal.ids)}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}

      {/* ── Remove Confirm Modal ── */}
      {modal?.action === 'remove' && (
        <Modal
          title={`Remove ${PROMO_TYPES.find(t => t.key === modal.type)?.icon} ${promoTypeLabel(modal.type)}`}
          subtitle={`From ${modal.ids.length} ${modal.ids.length === 1 ? 'property' : 'properties'}`}
          onClose={() => !saving && setModal(null)}
        >
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
            This will deactivate the <strong>{promoTypeLabel(modal.type)}</strong> promotion for {modal.ids.length === 1 ? 'the selected property' : `all ${modal.ids.length} selected properties`}.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
            <button type="button" onClick={() => setModal(null)} disabled={saving} style={{
              padding: '9px 20px', border: '1.5px solid #e5e7eb', borderRadius: '8px',
              background: 'white', color: '#6b7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}>Cancel</button>
            <button type="button" disabled={saving} onClick={() => removePromo(modal.type, modal.ids)}
              style={{
                padding: '9px 20px', border: 'none', borderRadius: '8px',
                background: saving ? '#e5e7eb' : '#dc2626',
                color: saving ? '#9ca3af' : 'white',
                fontSize: '13px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
              }}>
              {saving ? 'Removing…' : `Remove from ${modal.ids.length === 1 ? 'property' : `${modal.ids.length} properties`}`}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
