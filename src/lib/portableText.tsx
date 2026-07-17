// Minimal Portable Text renderer — mirrors property-detail.html's
// renderPortableText() exactly: handles bold/italic marks and
// h2/h3/blockquote/paragraph block styles, nothing else.

type PtSpan = { text?: string; marks?: string[] }
type PtBlock = { _type: string; style?: string; children?: PtSpan[] }

function renderSpan(s: PtSpan, i: number) {
  let node: React.ReactNode = s.text || ''
  if (s.marks?.includes('strong')) node = <strong key={i}>{node}</strong>
  if (s.marks?.includes('em')) node = <em key={i}>{node}</em>
  return <span key={i}>{node}</span>
}

export function renderPortableText(blocks: unknown[] | undefined): React.ReactNode {
  if (!blocks?.length) return null
  return (blocks as PtBlock[]).map((b, bi) => {
    if (b._type !== 'block') return null
    const children = b.children || []
    if (!children.some((c) => (c.text || '').trim())) return null
    const content = children.map((c, i) => renderSpan(c, i))
    switch (b.style) {
      case 'h2': return <h2 key={bi}>{content}</h2>
      case 'h3': return <h3 key={bi}>{content}</h3>
      case 'blockquote': return <blockquote key={bi}>{content}</blockquote>
      default: return <p key={bi}>{content}</p>
    }
  }).filter(Boolean)
}
