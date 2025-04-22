/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercelでは静的エクスポート(output: "export")は不要
  // Vercelのサーバーサイドレンダリングを活用

  // 画像の最適化を有効化（Vercelの画像最適化サービスを利用）
  images: {
    domains: ["v0.blob.com"], // 必要に応じてドメインを追加
  },

  // ビルド時のエラーチェックを有効化（本番環境の品質向上）
  eslint: {
    ignoreDuringBuilds: false, // 本番環境では厳格にチェック
  },
  typescript: {
    ignoreBuildErrors: false, // 本番環境では厳格にチェック
  },

  // Vercelの高度な機能を活用するための実験的機能
  experimental: {
    // サーバーコンポーネントを最適化（Vercelで高速化）
    serverComponents: true,
    // 画像最適化の強化
    optimizeImages: true,
    // ページ読み込みの最適化
    optimizeCss: true,
    // ミドルウェアの最適化
    middleware: true,
  },

  // Vercelの分析機能を有効化
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
}

module.exports = nextConfig
