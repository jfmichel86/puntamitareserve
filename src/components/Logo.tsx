// The single, authoritative "Mexican Reserve" wordmark. Used identically in
// both Nav.tsx and Footer.tsx (and anywhere else the logo needs to appear) —
// never re-typed or re-styled per-placement, so it can't drift out of sync
// the way it did when Nav and Footer each had their own hand-tuned copy.
// Styles live in globals.css under .brand-logo*.
//
// `size="lg"` scales the whole lockup up proportionally (same ratios, same
// styling) for placements with more room to give the wordmark real presence
// — e.g. the footer, as the page's closing brand moment. It is NOT a place
// to re-tune individual proportions per-placement; if the ratios themselves
// ever need to change, change the base .brand-logo* rules so every size
// stays in sync.
export default function Logo({ size = 'default' }: { size?: 'default' | 'lg' }) {
  return (
    <div className={`brand-logo${size === 'lg' ? ' brand-logo--lg' : ''}`}>
      <span className="brand-logo-top">Mexican</span>
      <span className="brand-logo-bottom">Reserve</span>
      <span className="brand-logo-rule" />
    </div>
  )
}
