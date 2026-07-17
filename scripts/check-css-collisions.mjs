#!/usr/bin/env node
/**
 * Guards against the exact bug class that hit this site more than once:
 * the same CSS class name being defined twice at the top level of
 * globals.css with two different, conflicting sets of styles (e.g.
 * ".view-all" styled one way for the homepage and a different way for
 * the property-detail page — whichever rule comes LAST in the file
 * silently wins everywhere, including on the page it wasn't meant for).
 *
 * This is safe to ignore for rules that are IDENTICAL duplicates (harmless,
 * just redundant) or that only repeat inside @media blocks (that's the
 * normal, intentional way responsive overrides work). It only flags a
 * TRUE collision: the same selector, defined more than once at the top
 * level, with different declarations.
 *
 * Run it with:  npm run lint:css
 * It exits with an error (and a non-zero exit code) if it finds a real
 * collision, so it can also be wired into a pre-deploy check later.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import postcss from 'postcss'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css')
const css = readFileSync(cssPath, 'utf8')

const root = postcss.parse(css)

/** @type {Map<string, {declarations: string, line: number}[]>} */
const bySelector = new Map()

root.walkRules((rule) => {
  const isTopLevel = rule.parent?.type === 'root'
  if (!isTopLevel) return // inside @media — normal responsive override, not a collision risk

  const declarations = rule.nodes
    .map((n) => (n.type === 'decl' ? `${n.prop}:${n.value}` : ''))
    .filter(Boolean)
    .sort()
    .join(';')

  const entry = { declarations, line: rule.source?.start?.line ?? 0 }
  const existing = bySelector.get(rule.selector)
  if (existing) existing.push(entry)
  else bySelector.set(rule.selector, [entry])
})

const collisions = []
for (const [selector, entries] of bySelector) {
  if (entries.length < 2) continue
  const uniqueDeclarationSets = new Set(entries.map((e) => e.declarations))
  if (uniqueDeclarationSets.size > 1) {
    collisions.push({ selector, lines: entries.map((e) => e.line) })
  }
}

if (collisions.length === 0) {
  console.log(`✓ No CSS collisions found (checked ${bySelector.size} top-level selectors in globals.css).`)
  process.exit(0)
}

console.error(`✗ Found ${collisions.length} CSS class name collision${collisions.length === 1 ? '' : 's'} in globals.css:\n`)
for (const c of collisions) {
  console.error(`  .${c.selector.replace(/^\./, '')}  — defined differently on lines ${c.lines.join(' and ')}`)
}
console.error(
  '\nThis means one of these definitions is silently overriding the other everywhere on the site.\n' +
  'Rename one of them to something more specific (e.g. add a page prefix like "detail-" or "similar-")\n' +
  'so each page keeps the styling it actually needs.'
)
process.exit(1)
