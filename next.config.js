/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 静的エクスポートの設定
  output: "export",
  // 画像の最適化を無効化（静的エクスポートに必要）
  images: {
    unoptimized: true,
    domains: ["cdzhynlgkenciykfnyxu.supabase.co"],
  },
  // 環境変数の設定
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // トレイリングスラッシュを追加（Amplifyでの互換性向上）
  trailingSlash: true,
  // 静的エクスポートのディレクトリ
  distDir: ".next",
}

module.exports = nextConfig
