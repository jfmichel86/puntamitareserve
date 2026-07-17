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
  },
  async redirects() {
    return [
      { source: '/punta-mita', destination: '/destinations/punta-mita', permanent: true },
    ]
  },
}

export default nextConfig
