/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable static export to avoid prerendering issues
  output: "export",

  // Enable image optimization
  images: {
    unoptimized: true, // Required for 'export'
    domains: ["v0.blob.com"],
  },

  // Remove trailing slash
  trailingSlash: false,

  // Enable build-time checks for better quality
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Add security headers (these won't be applied in static export mode)
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
