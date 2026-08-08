'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'

export type RegionalMapDest = {
  key: 'puntaMita' | 'puntaDeMita' | 'puertoVallarta'
  href: string
  name: string
  suffix?: string
  hook: string
  tags: string[]
  bg: string // CSS background (photo url() or gradient fallback)
  priceRange?: string // e.g. "$700 – $4,200 / night" — see destinationPriceRange() in utils.ts
}

// One map, two states: a wide view of the whole country with a single pin,
// and a "zoomed" view of just the Bahía de Banderas / Puerto Vallarta coast
// where the 3 destinations live. Both states share ONE projection (same
// lon/lat -> svg-unit math for the country outline, the two municipal
// region outlines, and all 3 destination shapes), so "zooming" is just
// scaling + translating one <g> — a real camera push-in, not a swap
// between two different maps. Every coordinate below was projected from
// either real public coastline data (the country outline) or Francisco's
// own Google My Maps traces (the region outlines and the 3 destination
// boundaries). Nothing here is hand-drawn or approximated.
const WIDE_W = 700
// This has to match the map panel's own PADDED CONTENT BOX aspect, not
// just the panel's outer aspect (700 * 9/8 = 787.5, what this used to be).
// .dest-split-map's padding is 4% 4% 4% 0 — all four percentages resolve
// against the panel's WIDTH (a CSS rule that applies to top/bottom padding
// too, not just left/right), and since the horizontal and vertical
// percentages differ (there's no left padding, since the map panel butts
// against the grid's center gutter), the content box ends up a slightly
// different shape than the panel itself: 480/522.5 ≈ 0.9187, vs the
// panel's own 0.8889. That small mismatch was enough for the SVG's
// default "meet" scaling to letterbox the map slightly inside its own
// content box — always symmetric top/bottom on its own, but still wasted
// space. Matching WIDE_H to the true content-box aspect (700 / 0.9187)
// removes that residual letterboxing entirely.
const WIDE_H = 761.98

const COUNTRY_PATH = 'M 461.5,172.7 L 452.6,194.8 L 448.5,212.9 L 446.8,246.7 L 444.6,259.0 L 448.6,272.8 L 455.8,285.0 L 460.4,304.6 L 475.7,323.4 L 481.1,337.7 L 490.1,350.1 L 514.7,356.8 L 524.2,367.4 L 544.4,360.3 L 562.1,357.8 L 579.3,353.3 L 593.9,348.9 L 608.6,338.7 L 614.1,324.0 L 616.0,302.8 L 620.0,295.4 L 635.6,288.8 L 660.0,283.0 L 680.5,283.8 L 694.5,281.7 L 700.0,287.1 L 699.2,299.2 L 686.8,314.2 L 681.3,329.5 L 685.6,333.9 L 682.1,344.8 L 676.3,364.5 L 670.5,358.0 L 665.6,358.4 L 661.3,358.7 L 653.0,374.0 L 648.8,371.0 L 646.0,372.1 L 646.2,375.8 L 624.8,375.6 L 603.3,375.6 L 603.2,389.8 L 592.8,389.9 L 601.4,398.3 L 610.0,404.1 L 612.5,409.6 L 616.3,411.1 L 615.7,419.7 L 586.0,419.7 L 574.9,440.3 L 578.2,445.0 L 575.5,450.9 L 574.9,458.2 L 548.8,431.1 L 536.9,422.9 L 518.1,416.4 L 505.2,418.2 L 486.6,427.7 L 475.0,430.2 L 458.7,423.5 L 441.4,418.7 L 419.8,407.2 L 402.5,403.6 L 376.3,391.9 L 357.0,379.9 L 351.2,373.1 L 338.3,371.6 L 314.6,363.6 L 305.0,352.1 L 280.2,337.8 L 268.6,322.0 L 263.1,309.7 L 270.8,307.2 L 268.5,300.0 L 273.8,293.5 L 273.9,284.8 L 266.1,273.4 L 264.0,263.4 L 256.3,250.7 L 235.9,225.6 L 212.7,206.0 L 201.5,190.2 L 181.7,180.0 L 177.4,173.8 L 180.9,158.2 L 169.2,152.3 L 155.5,140.1 L 149.8,122.5 L 137.4,120.5 L 124.0,107.2 L 113.1,94.9 L 112.1,87.1 L 99.7,68.0 L 91.5,48.7 L 91.9,39.1 L 75.2,29.1 L 67.5,30.2 L 54.3,23.2 L 50.6,33.5 L 54.4,45.5 L 56.7,64.5 L 64.6,74.9 L 81.7,92.2 L 85.5,98.2 L 89.0,100.0 L 92.1,108.6 L 96.2,108.3 L 100.8,124.5 L 107.8,130.9 L 112.7,139.9 L 127.3,152.7 L 134.9,176.1 L 141.8,187.2 L 148.2,199.0 L 149.5,212.3 L 160.6,213.1 L 169.9,224.6 L 178.2,235.8 L 177.7,240.3 L 167.9,249.6 L 163.9,249.5 L 157.8,234.1 L 142.7,219.8 L 126.0,207.6 L 114.2,201.2 L 115.0,182.7 L 111.5,169.1 L 100.5,161.3 L 84.6,150.0 L 81.5,153.3 L 75.7,146.7 L 61.5,140.6 L 47.9,126.0 L 49.5,124.1 L 59.1,125.5 L 67.6,116.1 L 68.5,104.7 L 50.7,86.7 L 37.2,79.8 L 28.6,64.0 L 20.1,47.5 L 9.4,27.3 L 0.0,4.7 L 26.2,2.7 L 55.6,0.0 L 53.4,4.9 L 88.3,17.2 L 140.9,34.9 L 186.9,34.8 L 205.2,34.7 L 205.2,24.3 L 245.2,24.4 L 253.6,33.3 L 265.4,41.3 L 279.2,52.3 L 286.8,65.5 L 292.6,79.4 L 304.5,87.0 L 323.7,94.5 L 338.2,74.6 L 357.1,74.1 L 373.4,84.2 L 385.0,101.4 L 392.9,116.2 L 406.6,130.6 L 411.6,148.2 L 418.1,160.1 L 436.1,167.9 L 452.5,173.4 L 461.5,172.7 Z'

// Bahía de Banderas region: 3 points near the end of Francisco's trace were
// a straight ~20km jump instead of following the real boundary — dropped
// here, same fix as before, just re-projected into this shared coordinate
// system. Kept as a subtle backdrop shape once zoomed in (no label — see
// the note by ZOOM_SCALE below for why the labels were dropped).
const BAHIA_REGION = 'M 272.66,295.30 L 272.34,295.77 L 272.05,295.90 L 271.71,296.52 L 271.56,296.51 L 271.47,296.56 L 271.33,296.76 L 271.18,296.78 L 271.06,296.95 L 270.76,297.09 L 270.36,297.95 L 270.31,297.96 L 270.21,298.24 L 269.96,298.58 L 269.82,298.65 L 269.78,298.64 L 269.79,298.61 L 269.76,298.59 L 269.71,298.60 L 269.67,298.58 L 269.68,298.55 L 269.61,298.50 L 269.56,298.56 L 269.46,298.99 L 269.42,299.01 L 269.33,299.14 L 269.26,299.55 L 269.01,299.94 L 269.02,300.00 L 268.70,300.60 L 268.32,300.87 L 268.24,300.87 L 268.20,300.80 L 268.07,300.72 L 268.04,300.63 L 267.98,300.68 L 267.94,300.67 L 267.82,300.74 L 267.57,301.18 L 267.61,301.29 L 267.58,301.39 L 267.60,301.44 L 267.65,301.53 L 267.70,301.55 L 267.77,301.46 L 268.00,301.21 L 268.21,301.17 L 268.48,301.28 L 268.70,301.41 L 268.73,301.46 L 268.76,301.47 L 268.86,301.52 L 268.92,301.60 L 269.01,301.60 L 269.05,301.68 L 269.15,301.59 L 269.21,301.61 L 269.25,301.58 L 269.27,301.57 L 269.33,301.59 L 269.34,301.61 L 269.42,301.67 L 269.46,301.64 L 269.50,301.67 L 269.59,301.68 L 269.77,301.76 L 269.82,301.75 L 269.85,301.76 L 269.88,301.74 L 269.99,301.77 L 270.26,301.92 L 270.53,302.10 L 270.68,302.06 L 270.83,302.11 L 271.04,301.97 L 271.09,301.96 L 271.11,301.87 L 271.28,301.82 L 271.48,301.65 L 271.65,301.40 L 271.99,301.45 L 272.38,301.73 L 272.82,302.27 L 273.38,303.64 L 273.64,303.68 L 273.69,303.64 L 273.69,303.57 L 273.60,303.55 L 273.58,303.45 L 273.74,303.38 L 273.92,303.51 L 274.02,303.47 L 274.02,303.32 L 273.97,303.23 L 274.11,303.10 L 274.10,302.92 L 274.19,302.84 L 274.13,302.55 L 274.09,302.31 L 273.70,301.97 L 273.48,301.79 L 273.24,301.59 L 273.02,301.39 L 272.86,301.24 L 272.91,301.12 L 272.66,295.30 Z'
const PV_REGION = 'M 273.66,303.70 L 273.92,303.85 L 274.24,304.07 L 274.38,304.18 L 274.45,304.45 L 274.52,304.48 L 274.62,304.60 L 274.65,304.96 L 274.64,305.11 L 274.58,305.25 L 274.55,305.27 L 274.51,305.38 L 274.50,305.49 L 274.42,305.64 L 274.35,305.72 L 274.35,305.94 L 274.01,306.55 L 273.38,306.88 L 273.34,307.04 L 272.59,307.52 L 272.42,307.70 L 272.83,308.14 L 273.80,307.37 L 274.74,306.55 L 275.14,305.13 L 275.43,304.76 L 275.71,304.16 L 275.72,303.96 L 274.88,302.92 L 274.43,302.88 L 274.19,302.85 L 274.11,302.93 L 274.12,303.12 L 273.97,303.23 L 274.03,303.33 L 274.02,303.47 L 273.92,303.51 L 273.74,303.38 L 273.58,303.45 L 273.60,303.55 L 273.69,303.57 L 273.69,303.64 L 273.64,303.69 L 273.66,303.70 Z'

const PUNTA_MITA_PATH = 'M 268.01,301.19 L 267.98,301.10 L 268.09,301.07 L 268.12,301.06 L 268.15,301.01 L 268.23,300.98 L 268.26,300.99 L 268.27,301.00 L 268.23,301.15 L 268.34,301.20 L 268.39,301.22 L 268.45,301.27 L 268.53,301.29 L 268.61,301.36 L 268.68,301.40 L 268.71,301.41 L 268.74,301.39 L 268.76,301.38 L 268.76,301.37 L 268.81,301.33 L 268.72,301.27 L 268.61,301.21 L 268.42,301.10 L 268.33,301.04 L 268.38,301.01 L 268.30,300.89 L 268.23,300.88 L 268.18,300.80 L 268.11,300.76 L 268.06,300.73 L 268.04,300.64 L 267.97,300.68 L 267.94,300.68 L 267.86,300.72 L 267.82,300.76 L 267.76,300.91 L 267.58,301.18 L 267.62,301.29 L 267.60,301.40 L 267.67,301.48 L 267.68,301.52 L 267.74,301.52 L 267.78,301.40 L 267.84,301.33 L 268.01,301.19 Z'
// Punta de Mita Area is now a single traced shape (Francisco merged what
// were previously two separate polygons into one on the source map). It
// genuinely surrounds/borders the smaller Punta Mita enclave in real life,
// so their boundaries overlapping in map-space is accurate, not a data
// error — see the paint-order note where these render below.
const PDM_PATH = 'M 269.02,299.98 L 269.01,300.05 L 269.00,300.07 L 268.99,300.10 L 268.97,300.16 L 268.93,300.26 L 268.88,300.33 L 268.88,300.36 L 268.82,300.47 L 268.73,300.59 L 268.58,300.74 L 268.55,300.74 L 268.49,300.79 L 268.42,300.84 L 268.30,300.88 L 268.38,301.00 L 268.34,301.04 L 268.37,301.06 L 268.56,301.18 L 268.81,301.33 L 268.77,301.38 L 268.71,301.41 L 268.75,301.46 L 268.76,301.47 L 268.82,301.50 L 268.86,301.52 L 268.89,301.55 L 268.90,301.58 L 268.94,301.59 L 268.99,301.59 L 269.02,301.62 L 269.04,301.67 L 269.13,301.58 L 269.21,301.60 L 269.22,301.57 L 269.25,301.57 L 269.33,301.59 L 269.33,301.61 L 269.41,301.66 L 269.42,301.67 L 269.43,301.64 L 269.46,301.65 L 269.50,301.67 L 269.57,301.67 L 269.74,301.74 L 269.76,301.76 L 269.80,301.74 L 269.83,301.75 L 269.87,301.73 L 269.96,301.76 L 270.01,301.76 L 270.12,301.82 L 270.51,302.07 L 270.54,302.05 L 270.60,302.04 L 270.63,302.05 L 270.65,302.03 L 270.82,302.09 L 270.98,301.98 L 271.08,301.94 L 271.10,301.88 L 271.08,301.86 L 270.97,301.81 L 270.88,301.88 L 270.81,301.92 L 270.67,301.93 L 270.50,301.87 L 270.19,301.70 L 269.89,301.55 L 269.80,301.57 L 269.69,301.55 L 269.65,301.55 L 269.58,301.53 L 269.44,301.53 L 269.35,301.49 L 269.00,301.43 L 268.36,301.03 L 268.39,301.01 L 269.06,300.56 L 269.26,300.09 L 269.02,299.98 Z'
const PV_DEST_PATH = 'M 274.51,305.47 L 274.43,305.63 L 274.36,305.72 L 274.35,305.94 L 274.13,306.37 L 274.02,306.56 L 273.82,306.68 L 273.61,306.78 L 273.46,306.84 L 273.38,306.87 L 273.34,307.04 L 273.27,307.10 L 272.60,307.52 L 272.70,307.70 L 272.76,307.77 L 272.83,307.70 L 272.75,307.57 L 273.20,307.28 L 273.45,307.09 L 273.47,306.91 L 273.84,306.85 L 274.10,306.62 L 274.32,306.27 L 274.51,305.78 L 274.57,305.63 L 274.65,305.51 L 274.51,305.47 Z'

// Where the pin sits in the wide view (centroid of the two region
// outlines above), and the camera move that brings the destinations into
// frame when it's clicked — both computed from the same projection as
// every path above, so the "zoom" always lands exactly where it should.
// The zoom target is the bounding box of just the 3 destination shapes
// (computed once from the raw path data — see /tmp/calc2.py during
// development), centered on that box's own midpoint so top/bottom and
// left/right margins are mathematically equal. An earlier version also
// folded the on-shape name labels into this box, which nudged the center
// point enough to read as "shifted up" with extra empty space below —
// shapes-only keeps the framing simple and predictably symmetric. The two
// wordier region labels ("Bahía de Banderas", "Puerto Vallarta
// (municipality)") were dropped entirely rather than framed for: one of
// them sits well north of the destination cluster, and forcing it to stay
// in-frame either shrank everything to fit its width or pushed the real
// content off-center. Their information is redundant now anyway; the list
// panel already explains each destination.
const PIN_X = 271.6
const PIN_Y = 301.9
// ZOOM_SCALE is 15% smaller than the original 66.51 (unchanged from the
// last two rounds). TX/TY, though, now center on the bounding box of the
// REGION OUTLINES (BAHIA_REGION + PV_REGION) plus the 3 destination
// shapes — not the destinations alone. The region outline extends
// noticeably further above the destination cluster than below it (its own
// bbox: y 295.3-308.14, vs the destinations' 299.98-307.77) — centering on
// destinations alone left THAT visible content asymmetric even though the
// small colored shapes themselves were dead center, which is exactly what
// was being seen as "cropped at the top." Centering on the full visible
// bbox instead (verified: 15.88 viewBox units on every side) fixes both
// at once.
const ZOOM_SCALE = 56.87
const ZOOM_TX = -15098.45
const ZOOM_TY = -16777.83
// Labels only need to read correctly once zoomed in, at which point the
// camera has already scaled everything up by ZOOM_SCALE — so their
// declared font-size is the on-screen size divided by that scale.
const LABEL_SIZE = 12 / ZOOM_SCALE
// Matches .dest-map-camera's transition in globals.css — connector lines
// are only measured once this push-in has actually finished, otherwise
// they'd be drawn to the shapes' pre-zoom positions and visibly snap once
// the transform settles.
const CAMERA_MS = 1350

// Each destination gets its own identity color — reused for its shape on
// the map, its connector line, and the accent bar on its list card — so a
// visitor can trace "this card -> this line -> this shape" by color alone.
// Chosen to echo each destination's existing photo-fallback gradient
// family (see page.tsx) rather than arbitrary hues.
const DEST_COLORS: Record<RegionalMapDest['key'], string> = {
  puntaMita: '#C8943A',
  puntaDeMita: '#6FA88A',
  puertoVallarta: '#C97B5C',
}

// Explicit bounding-box-center pivots for the hover-grow scale, one per
// destination (in the same local path coordinates as the `d` strings
// above). Two earlier attempts at this — `transform-origin: center` with
// `transform-box: fill-box`, then `transform-box: view-box` with an
// explicit pixel origin — both looked right for the compact Punta Mita
// shape but grew off-center for the two elongated ones (Punta de Mita
// Area, worse on Puerto Vallarta), consistent with a browser computing the
// CSS transform-box pivot from rendered geometry despite the declared
// value, rather than a mistake in these numbers. Both are still used, but
// no longer as a CSS transform-origin — see growTransform() below, which
// builds the whole translate+scale matrix by hand and applies it as the
// SVG element's own `transform` attribute, sidestepping transform-box
// entirely.
const SHAPE_ORIGIN: Record<RegionalMapDest['key'], { x: number; y: number }> = {
  puntaMita: { x: 268.195, y: 301.08 },
  puntaDeMita: { x: 269.7, y: 301.035 },
  puertoVallarta: { x: 273.625, y: 306.62 },
}
// Matches the old CSS `transform: scale(2)` on hover/focus/active.
const HOVER_SCALE = 2

function parsePoints(d: string): [number, number][] {
  const pts: [number, number][] = []
  const re = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(d))) pts.push([parseFloat(m[1]), parseFloat(m[2])])
  if (pts.length > 1) {
    const [fx, fy] = pts[0]
    const [lx, ly] = pts[pts.length - 1]
    if (fx === lx && fy === ly) pts.pop() // drop the repeated closing point
  }
  return pts
}

function pointInPolygon(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay
  const lenSq = dx * dx + dy * dy
  let t = lenSq ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function distToPolygonEdges(px: number, py: number, poly: [number, number][]): number {
  let min = Infinity
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i]
    const [bx, by] = poly[(i + 1) % poly.length]
    min = Math.min(min, distToSegment(px, py, ax, ay, bx, by))
  }
  return min
}

// True area-weighted centroid (shoelace formula) — the mathematically
// "correct" center of mass for a polygon, and the most visually intuitive
// place for a dot to sit when it lands inside the shape (which it does for
// Punta Mita). For an elongated, concave shape like Punta de Mita Area or
// Puerto Vallarta, though, this point can fall OUTSIDE the polygon
// entirely — verified independently for both (see /tmp/calc5.py).
function shoelaceCentroid(poly: [number, number][]): { x: number; y: number } {
  let area = 0, cx = 0, cy = 0
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i]
    const [x1, y1] = poly[(i + 1) % poly.length]
    const cross = x0 * y1 - x1 * y0
    area += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }
  area *= 0.5
  if (Math.abs(area) < 1e-9) {
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1])
    return { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length }
  }
  return { x: cx / (6 * area), y: cy / (6 * area) }
}

// A coarse grid search for the point furthest from any edge (a simplified
// "pole of inaccessibility") — guaranteed to land inside the polygon, but
// for a shape that's wide at one end and tapers into a long thin tail
// (Punta de Mita Area, Puerto Vallarta), this snaps to the widest
// cross-section rather than the visual middle of the shape's length, which
// reads as "off to one side" rather than centered.
function poleOfInaccessibility(poly: [number, number][]): { x: number; y: number } {
  const xs = poly.map((p) => p[0])
  const ys = poly.map((p) => p[1])
  const xmin = Math.min(...xs), xmax = Math.max(...xs)
  const ymin = Math.min(...ys), ymax = Math.max(...ys)
  const STEPS = 40
  let bestX = (xmin + xmax) / 2, bestY = (ymin + ymax) / 2, bestD = -Infinity
  for (let i = 0; i <= STEPS; i++) {
    const x = xmin + ((xmax - xmin) * i) / STEPS
    for (let j = 0; j <= STEPS; j++) {
      const y = ymin + ((ymax - ymin) * j) / STEPS
      if (!pointInPolygon(x, y, poly)) continue
      const dist = distToPolygonEdges(x, y, poly)
      if (dist > bestD) { bestD = dist; bestX = x; bestY = y }
    }
  }
  let radius = (xmax - xmin) / STEPS
  for (let iter = 0; iter < 6; iter++) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue
        const x = bestX + dx * radius, y = bestY + dy * radius
        if (!pointInPolygon(x, y, poly)) continue
        const dist = distToPolygonEdges(x, y, poly)
        if (dist > bestD) { bestD = dist; bestX = x; bestY = y }
      }
    }
    radius /= 2
  }
  return { x: bestX, y: bestY }
}

// The actual dot position: use the true centroid when it's inside the
// polygon (the most intuitive "center" — this is what Punta Mita gets).
// When it's not (Punta de Mita Area, Puerto Vallarta), walk from the pole
// of inaccessibility toward the centroid in small steps and stop at the
// last point still inside the polygon — the inside point CLOSEST to the
// shape's true center of mass, which sits much further into the visible
// body of the shape than the pole alone (verified via /tmp/calc5.py: the
// pole-only point for Punta de Mita Area landed right at the shape's
// narrow neck near Punta Mita, easy to mistake for "not on the shape";
// walking toward the centroid moves it further down into the shape's
// visible bulk).
function visualCenter(d: string): { x: number; y: number } {
  const poly = parsePoints(d)
  const centroid = shoelaceCentroid(poly)
  if (pointInPolygon(centroid.x, centroid.y, poly)) return centroid
  const pole = poleOfInaccessibility(poly)
  const STEPS = 300
  let best = pole
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS
    const x = pole.x + (centroid.x - pole.x) * t
    const y = pole.y + (centroid.y - pole.y) * t
    if (pointInPolygon(x, y, poly)) best = { x, y }
    else break
  }
  return best
}

const PUNTA_MITA_CENTER = visualCenter(PUNTA_MITA_PATH)
const PDM_CENTER = visualCenter(PDM_PATH)
const PV_DEST_CENTER = visualCenter(PV_DEST_PATH)

type ConnectorLine = { key: string; d: string; x2: number; y2: number; color: string }

export default function DestinationsRegionalMap({ destinations }: { destinations: RegionalMapDest[] }) {
  const [zoomed, setZoomed] = useState(false)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [lines, setLines] = useState<ConnectorLine[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  // Refs point at the tiny invisible visual-center markers below (not the
  // visible outline paths) — see visualCenter() above for why.
  const centerRefs = useRef<Record<string, SVGCircleElement | null>>({})
  const byKey = Object.fromEntries(destinations.map((d) => [d.key, d]))

  const highlight = (key: string | null) => () => setActiveKey(key)

  // The SVG `transform` attribute (not CSS transform-origin) for a
  // destination's visible shape — identity when it isn't the hovered/
  // focused one, otherwise the explicit "scale by HOVER_SCALE around its
  // own bbox center" matrix: translate(cx(1-k), cy(1-k)) scale(k). Setting
  // this directly avoids transform-box entirely, so there's no browser
  // pivot-computation quirk left to go wrong.
  const growTransform = (key: RegionalMapDest['key']) => {
    if (activeKey !== key) return undefined
    const { x, y } = SHAPE_ORIGIN[key]
    const k = HOVER_SCALE
    return `translate(${x * (1 - k)}, ${y * (1 - k)}) scale(${k})`
  }

  // Draws a thin line from each list card's right edge to the visual
  // center of its shape on the map — measured from real rendered
  // positions (not hardcoded offsets) so it stays correct at any
  // container width. Also centers the card stack in real pixels first
  // (see the .dest-split-list of globals.css for the full history) —
  // `.dest-split-list`/`.dest-split-cards` are found via querySelector on
  // the existing wrapRef rather than dedicated refs, and the margin is
  // applied straight to the DOM rather than through React state,
  // deliberately keeping this component's hook list unchanged from the
  // version that was already known to work, in case a hook-signature
  // change was itself getting lost on hot-reload.
  // `includeLines` defaults to true; the very first call (fired
  // immediately when zoomed becomes true, before the map's 1.3s camera
  // transition has even started moving) passes false. Card centering is
  // safe to run immediately since the cards themselves don't animate, but
  // measuring the destination dots that early captures them mid-transition
  // — the connector dots were rendering way off from their shapes because
  // of exactly this: a screenshot taken quickly after clicking the pin
  // catches that stale, pre-settled measurement. Skipping the line/dot
  // update on the immediate call means nothing renders at the wrong
  // position even for a moment — the first line-worthy measurement is the
  // one at CAMERA_MS, once the transition has actually finished.
  const layoutList = (includeLines = true) => {
    const wrap = wrapRef.current
    if (!wrap) return

    const panel = wrap.querySelector<HTMLElement>('.dest-split-list')
    const cards = wrap.querySelector<HTMLElement>('.dest-split-cards')
    if (panel && cards) {
      const panelRect = panel.getBoundingClientRect()
      const cs = window.getComputedStyle(panel)
      const padTop = parseFloat(cs.paddingTop) || 0
      const padBottom = parseFloat(cs.paddingBottom) || 0
      const contentHeight = panelRect.height - padTop - padBottom
      cards.style.marginTop = '0px'
      const cardsHeight = cards.getBoundingClientRect().height
      cards.style.marginTop = `${Math.max(0, (contentHeight - cardsHeight) / 2)}px`
    }

    if (!includeLines) return

    const wrapRect = wrap.getBoundingClientRect()
    const next: ConnectorLine[] = []
    destinations.forEach((d) => {
      const card = cardRefs.current[d.key]
      const dot = centerRefs.current[d.key]
      if (!card || !dot) return
      const cardRect = card.getBoundingClientRect()
      const dotRect = dot.getBoundingClientRect()
      const x1 = cardRect.right - wrapRect.left
      const y1 = cardRect.top - wrapRect.top + cardRect.height / 2
      const x2 = dotRect.left + dotRect.width / 2 - wrapRect.left
      const y2 = dotRect.top + dotRect.height / 2 - wrapRect.top
      const mx = (x1 + x2) / 2
      next.push({ key: d.key, d: `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`, x2, y2, color: DEST_COLORS[d.key] })
    })
    setLines(next)
  }

  useEffect(() => {
    // Lines are cleared explicitly by zoomOut() below, not here — setting
    // state synchronously inside an effect body (even in an early-return
    // branch) risks a cascading extra render.
    if (!zoomed) return
    const relayout = () => layoutList()
    layoutList(false)
    const t1 = setTimeout(relayout, CAMERA_MS)
    // A second, later re-check — the first live test of this (hooks
    // removed, same math) measured real progress, an ~9px residual gap
    // instead of the ~22px one before, but not a perfect zero. document
    // .fonts.ready is a promise, not a hook, so this doesn't change the
    // component's hook signature the way the earlier attempt did.
    document.fonts?.ready?.then(relayout)
    const t2 = setTimeout(relayout, 3000)
    window.addEventListener('resize', relayout)
    return () => {
      clearTimeout(t1); clearTimeout(t2)
      window.removeEventListener('resize', relayout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed])

  const zoomIn = () => setZoomed(true)
  const zoomOut = () => { setZoomed(false); setActiveKey(null); setLines([]) }

  return (
    <div className="dest-split" ref={wrapRef}>
      <div className="dest-split-list">
        {!zoomed ? (
          <p className="dest-split-prompt">Click the pin to see all three destinations.</p>
        ) : (
          <div className="dest-split-cards">
            {destinations.map((d) => (
              <Link
                key={d.key}
                href={d.href}
                ref={(el) => { cardRefs.current[d.key] = el }}
                className={`dest-split-card${activeKey === d.key ? ' is-active' : ''}`}
                style={{ '--dest-color': DEST_COLORS[d.key] } as CSSProperties}
                onMouseEnter={highlight(d.key)}
                onMouseLeave={highlight(null)}
                onFocus={highlight(d.key)}
                onBlur={highlight(null)}
              >
                <div className="dest-split-card-photo" style={{ background: d.bg, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="dest-split-card-body">
                  <p className="dest-split-card-name">
                    {d.name}{d.suffix && <span className="dest-card-name-suffix"> — {d.suffix}</span>}
                  </p>
                  {d.priceRange && (
                    <div className="dest-split-card-price">
                      <p className="dest-split-card-price-main">{d.priceRange}</p>
                      <p className="dest-split-card-price-note">(Depending on the season)</p>
                    </div>
                  )}
                  <p className="dest-split-card-hook">{d.hook}</p>
                  <div className="dest-split-card-tags">
                    {d.tags.map((tag) => <span key={tag} className="dest-split-card-tag">{tag}</span>)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="dest-split-map">
        <svg viewBox={`0 0 ${WIDE_W} ${WIDE_H}`} className="dest-map-svg">
          <g
            className="dest-map-camera"
            style={{ transform: zoomed ? `translate(${ZOOM_TX}px, ${ZOOM_TY}px) scale(${ZOOM_SCALE})` : 'translate(0px, 0px) scale(1)' }}
          >
            <path d={COUNTRY_PATH} className="dest-map-country" style={{ opacity: zoomed ? 0 : 0.3 }} vectorEffect="non-scaling-stroke" />

            <path d={BAHIA_REGION} className="dest-map-region" style={{ opacity: zoomed ? 1 : 0 }} vectorEffect="non-scaling-stroke" />
            <path d={PV_REGION} className="dest-map-region" style={{ opacity: zoomed ? 1 : 0 }} vectorEffect="non-scaling-stroke" />

            {/* Punta de Mita Area paints BEFORE Punta Mita on purpose —
                the smaller Punta Mita enclave genuinely sits inside/borders
                the broader Punta de Mita Area in real life, so their traced
                boundaries do overlap. Painting the bigger area first means
                Punta Mita's own outline is never covered by PDM's fill,
                reading as "an enclave within the area" instead of two
                shapes fighting for the same pixels. Each destination's
                name label lives INSIDE its own <a> now (not as a separate
                floating <text>), so hovering either the shape or its list
                card scales the label right along with the shape via the
                shared .dest-map-zone:hover/.is-active CSS rule.

                Each zone is now TWO overlapping paths, not one: an
                invisible "hit" copy (pointerEvents:'all', never scales)
                that all the mouseenter/mouseleave handlers live on, and a
                "visible" copy that scales on hover but ignores pointer
                events entirely. Growing the VISIBLE shape used to also be
                the thing the browser hit-tested — for a narrow shape like
                Punta de Mita Area or Puerto Vallarta, scaling around a
                center that isn't under the cursor could shrink the shape
                out from under the mouse mid-hover, firing mouseleave,
                which un-scaled it, which put it back under the mouse,
                which re-fired mouseenter — a flicker loop. A stable,
                never-scaling hit target removes the feedback loop
                entirely. fillRule="evenodd" on both matches the winding
                rule this file's own point-in-polygon math assumes (see
                visualCenter above) — without it, a self-intersecting trace
                (Punta de Mita Area was merged from two separate polygons)
                can render a "hole" under the default nonzero rule that
                doesn't match what the math considers "inside." */}
            <a href={byKey.puntaDeMita.href} className={`dest-map-zone${activeKey === 'puntaDeMita' ? ' is-active' : ''}`} aria-label={`Explore ${byKey.puntaDeMita.name}`}
              tabIndex={zoomed ? 0 : -1} style={{ opacity: zoomed ? 1 : 0, pointerEvents: zoomed ? 'auto' : 'none', '--dest-color': DEST_COLORS.puntaDeMita } as CSSProperties}
              onMouseEnter={highlight('puntaDeMita')} onMouseLeave={highlight(null)}
              onFocus={highlight('puntaDeMita')} onBlur={highlight(null)}>
              <path d={PDM_PATH} fillRule="evenodd" className="dest-map-zone-hit" vectorEffect="non-scaling-stroke" />
              <path d={PDM_PATH} fillRule="evenodd" className="dest-map-zone-visible" vectorEffect="non-scaling-stroke" transform={growTransform('puntaDeMita')} />
              <text x="269.8" y="299.55" textAnchor="middle" fontSize={LABEL_SIZE} className="dest-map-dest-label" style={{ pointerEvents: 'none', transformOrigin: '269.8px 299.55px' }}>Punta de Mita Area</text>
            </a>
            <a href={byKey.puntaMita.href} className={`dest-map-zone${activeKey === 'puntaMita' ? ' is-active' : ''}`} aria-label={`Explore ${byKey.puntaMita.name}`}
              tabIndex={zoomed ? 0 : -1} style={{ opacity: zoomed ? 1 : 0, pointerEvents: zoomed ? 'auto' : 'none', '--dest-color': DEST_COLORS.puntaMita } as CSSProperties}
              onMouseEnter={highlight('puntaMita')} onMouseLeave={highlight(null)}
              onFocus={highlight('puntaMita')} onBlur={highlight(null)}>
              <path d={PUNTA_MITA_PATH} fillRule="evenodd" className="dest-map-zone-hit" vectorEffect="non-scaling-stroke" />
              <path d={PUNTA_MITA_PATH} fillRule="evenodd" className="dest-map-zone-visible" vectorEffect="non-scaling-stroke" transform={growTransform('puntaMita')} />
              <text x="267.6" y="300.25" textAnchor="middle" fontSize={LABEL_SIZE} className="dest-map-dest-label" style={{ pointerEvents: 'none', transformOrigin: '267.6px 300.25px' }}>Punta Mita</text>
            </a>
            <a href={byKey.puertoVallarta.href} className={`dest-map-zone${activeKey === 'puertoVallarta' ? ' is-active' : ''}`} aria-label={`Explore ${byKey.puertoVallarta.name}`}
              tabIndex={zoomed ? 0 : -1} style={{ opacity: zoomed ? 1 : 0, pointerEvents: zoomed ? 'auto' : 'none', '--dest-color': DEST_COLORS.puertoVallarta } as CSSProperties}
              onMouseEnter={highlight('puertoVallarta')} onMouseLeave={highlight(null)}
              onFocus={highlight('puertoVallarta')} onBlur={highlight(null)}>
              <path d={PV_DEST_PATH} fillRule="evenodd" className="dest-map-zone-hit" vectorEffect="non-scaling-stroke" />
              <path d={PV_DEST_PATH} fillRule="evenodd" className="dest-map-zone-visible" vectorEffect="non-scaling-stroke" transform={growTransform('puertoVallarta')} />
              <text x="274.6" y="305.0" textAnchor="middle" fontSize={LABEL_SIZE} className="dest-map-dest-label" style={{ pointerEvents: 'none', transformOrigin: '274.6px 305px' }}>Puerto Vallarta</text>
            </a>

            {/* Invisible markers at each shape's true visual center, purely
                so measureLines() has something reliable to call
                getBoundingClientRect() on. */}
            <circle ref={(el) => { centerRefs.current.puntaMita = el }} cx={PUNTA_MITA_CENTER.x} cy={PUNTA_MITA_CENTER.y} r="0.15" fill="transparent" style={{ pointerEvents: 'none' }} />
            <circle ref={(el) => { centerRefs.current.puntaDeMita = el }} cx={PDM_CENTER.x} cy={PDM_CENTER.y} r="0.15" fill="transparent" style={{ pointerEvents: 'none' }} />
            <circle ref={(el) => { centerRefs.current.puertoVallarta = el }} cx={PV_DEST_CENTER.x} cy={PV_DEST_CENTER.y} r="0.15" fill="transparent" style={{ pointerEvents: 'none' }} />

            <g
              className="dest-map-pin-group"
              style={{ opacity: zoomed ? 0 : 1, pointerEvents: zoomed ? 'none' : 'auto' }}
              tabIndex={zoomed ? -1 : 0}
              role="button"
              aria-label="View the three destinations"
              onClick={zoomIn}
              onKeyDown={(e) => { if (e.key === 'Enter') zoomIn() }}
            >
              <circle className="dest-map-pin-ring" cx={PIN_X} cy={PIN_Y} r="9" fill="#C8943A" />
              <circle cx={PIN_X} cy={PIN_Y} r="5" fill="#C8943A" />
              <circle cx={PIN_X} cy={PIN_Y} r="3" fill="#F3D9A8" />
            </g>
          </g>
        </svg>

        <button
          className={`dest-map-back${zoomed ? ' is-visible' : ''}`}
          onClick={zoomOut}
          tabIndex={zoomed ? 0 : -1}
          aria-hidden={!zoomed}
        >
          ← Mexico view
        </button>
      </div>

      {/* Overlay, not part of either panel — a line has to be drawn in one
          shared coordinate space that spans both the list and the map, so
          it can't live inside .dest-split-list or .dest-split-map alone. */}
      <svg className="dest-split-connectors" aria-hidden="true">
        {lines.map((l) => (
          <g key={l.key} className={activeKey === l.key ? 'is-active' : ''}>
            <path d={l.d} className="dest-split-connector-line" stroke={l.color} />
            <circle cx={l.x2} cy={l.y2} r="3" className="dest-split-connector-dot" fill={l.color} />
          </g>
        ))}
      </svg>
    </div>
  )
}
