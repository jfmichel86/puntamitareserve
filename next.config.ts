import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
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
      { source: '/punta-mita', destination: '/destinations/punta-mita', permanent: true },
    ]
  },
}

export default nextConfig
