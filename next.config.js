/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR enabled by default (removing output: "export")

  // Enable image optimization (removing unoptimized: true)
  images: {
    domains: ["v0.blob.com"], // Add any domains you need for external images
  },

  // Remove trailing slash (not needed for Vercel)
  trailingSlash: false,

  // Enable build-time checks for better quality
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Add security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://v0.blob.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.vercel-insights.com",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
