// Minimal Portable Text renderer — mirrors property-detail.html's
// renderPortableText() exactly: handles bold/italic marks and
// h2/h3/blockquote/paragraph block styles, plus inline images (added for
// Journal articles — property fullDescription fields never contain an image
// block, so this is a pure addition with no effect on existing callers).

import Image from 'next/image'
import { urlFor } from './sanity'

type PtSpan = { text?: string; marks?: string[] }
type PtBlock = { _type: string; style?: string; children?: PtSpan[] }
type PtImage = { _type: string; _key?: string; asset?: { _ref: string }; hotspot?: { x: number; y: number } }

function renderSpan(s: PtSpan, i: number) {
  let node: React.ReactNode = s.text || ''
  if (s.marks?.includes('strong')) node = <strong key={i}>{node}</strong>
  if (s.marks?.includes('em')) node = <em key={i}>{node}</em>
  return <span key={i}>{node}</span>
}

export function renderPortableText(blocks: unknown[] | undefined): React.ReactNode {
  if (!blocks?.length) return null
  return (blocks as (PtBlock | PtImage)[]).map((b, bi) => {
    if (b._type === 'image') {
      const img = b as PtImage
      if (!img.asset?._ref) return null
      return (
        <figure key={img._key || bi} className="pt-figure">
          <Image
            src={urlFor(img).width(1400).height(933).quality(88).url()}
            alt=""
            width={1400}
            height={933}
            sizes="(max-width: 760px) 100vw, 720px"
          />
        </figure>
      )
    }
    const block = b as PtBlock
    if (block._type !== 'block') return null
    const children = block.children || []
    if (!children.some((c) => (c.text || '').trim())) return null
    const content = children.map((c, i) => renderSpan(c, i))
    switch (block.style) {
      case 'h2': return <h2 key={bi}>{content}</h2>
      case 'h3': return <h3 key={bi}>{content}</h3>
      case 'blockquote': return <blockquote key={bi}>{content}</blockquote>
      default: return <p key={bi}>{content}</p>
    }
  }).filter(Boolean)
}
