// The compact "Mexico" symbol — a step-pyramid, kept deliberately separate
// from the Logo wordmark (see Logo.tsx). It's used small and scoped to a
// few specific spots where a favicon-style icon makes sense (the browser
// tab via icon.svg, the SplashScreen, and paired next to the wordmark in
// the footer) — never merged into the main logo itself.
//
// No background square here (unlike icon.svg, the favicon file) — this
// version is transparent and meant to sit directly on an already-navy
// background (footer, splash screen), so the navy "cutout" shapes below
// blend correctly wherever it's placed.
export default function PyramidMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="85" rx="32" ry="3" fill="#000000" opacity="0.18" />
      <rect x="22" y="72" width="56" height="10" fill="#DBA84E" />
      <rect x="28" y="62" width="44" height="10" fill="#DBA84E" />
      <rect x="34" y="53" width="32" height="9" fill="#DBA84E" />
      <rect x="42" y="41" width="16" height="12" fill="#DBA84E" />
      <rect x="40.5" y="38.5" width="19" height="2.5" fill="#DBA84E" />
      <polygon points="47,41 53,41 58,82 42,82" fill="#1E3A50" />
      <line x1="43.5" y1="53" x2="56.5" y2="53" stroke="#DBA84E" strokeWidth="1.2" />
      <line x1="42.5" y1="62" x2="57.5" y2="62" stroke="#DBA84E" strokeWidth="1.2" />
      <line x1="41" y1="72" x2="59" y2="72" stroke="#DBA84E" strokeWidth="1.2" />
    </svg>
  )
}
