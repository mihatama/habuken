/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Amplifyでの静的エクスポート設定
  output: "export",
  // 環境変数の設定
  env: {
    // 必要な環境変数をここに追加
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // 静的ページのみを生成
  distDir: ".next",
  // exportPathMapを削除 - App Routerでは使用できません
}

module.exports = nextConfig
