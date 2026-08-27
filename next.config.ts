import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      // Free-license stock photography (Unsplash License — free for
      // commercial use, no attribution required) used to fill the Puerto
      // Vallarta destination guide until real, brand-exclusive photography
      // is available. See puerto-vallarta's insideGroups/photoBreak in
      // src/app/[slug]/page.tsx.
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // Next.js only serves image quality values listed here — anything else
    // silently falls back to the closest allowed number (default is just
    // 75). Our photo components request 90/92 for sharper hero, card, and
    // gallery images, so those values must be explicitly allowed.
    qualities: [75, 85, 90, 92],
    // Trimmed from Next's default 8-value list ([640, 750, 828, 1080, 1200,
    // 1920, 2560, 3840]). Every one of those widths that a real visitor's
    // screen triggers becomes its own cached image variant on Vercel's
    // Image Optimization usage — with 150+ properties × 20+ photos each,
    // that adds up fast even on modest traffic. None of our source photos
    // are ever requested larger than 2200px (see Gallery.tsx's main tile),
    // so 2560/3840 could only ever waste a transformation attempt, never
    // serve a genuinely larger image. Five sizes still cleanly covers
    // phone / tablet / laptop / desktop / large-desktop — this does not
    // change photo quality or sharpness, only how finely we slice up the
    // width options in between.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    // Same idea for the handful of small fixed-size images (currently just
    // Gallery.tsx's 168px filmstrip thumbnails). 384 still comfortably
    // covers that thumbnail at 2x retina sharpness.
    imageSizes: [128, 256, 384],
  },
  async redirects() {
    return [
      // Destination guide pages moved from /destinations/<slug> to short,
      // root-level URLs (2026-08-27, Francisco's call). These 301s make sure
      // anyone with the old address bookmarked, and any ranking Google built
      // up on the old URLs, both carry over cleanly to the new ones instead
      // of hitting a dead link.
      { source: '/destinations/punta-mita', destination: '/punta-mita', permanent: true },
      { source: '/destinations/punta-mita/communities', destination: '/punta-mita/communities', permanent: true },
      { source: '/destinations/punta-de-mita', destination: '/punta-de-mita', permanent: true },
      { source: '/destinations/puerto-vallarta', destination: '/puerto-vallarta', permanent: true },
    ]
  },
}

export default nextConfig
