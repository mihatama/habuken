/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify オプションを削除（Next.js 15では非推奨）
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Amplifyデプロイのための設定
  output: "standalone",
  // 動的ルートの静的生成を無効化
  experimental: {
    // 必要に応じて実験的機能を設定
  },
}

module.exports = nextConfig
