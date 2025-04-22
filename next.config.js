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
  // 静的エクスポートでは、動的ルートを事前に定義する必要があります
  exportPathMap: async (defaultPathMap) => ({
    "/": { page: "/" },
    "/login": { page: "/login" },
    "/dashboard": { page: "/dashboard" },
    "/projects": { page: "/projects" },
    "/staff": { page: "/staff" },
    "/shifts": { page: "/shifts" },
    "/tools": { page: "/tools" },
    "/leave": { page: "/leave" },
    "/reports": { page: "/reports" },
    "/profile": { page: "/profile" },
    "/settings": { page: "/settings" },
    "/forgot-password": { page: "/forgot-password" },
    "/reset-password": { page: "/reset-password" },
    // 他の静的ページを追加
  }),
}

module.exports = nextConfig
