/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的エクスポートの設定
  output: "export",
  // 画像の最適化を無効化（静的エクスポートに必要）
  images: {
    unoptimized: true,
  },
  // トレイリングスラッシュを追加（Amplifyでの互換性向上）
  trailingSlash: true,
  // ビルド時のエラーチェックを無効化
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 静的エクスポート用の設定を追加
  experimental: {
    // 静的ページの生成を最適化
    optimizeCss: true,
    // サーバーコンポーネントを静的に生成
    serverComponents: true,
  },
  // 静的エクスポートでは動的なリダイレクトが使えないため削除
}

module.exports = nextConfig
