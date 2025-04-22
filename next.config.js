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
  // 問題のある実験的機能を削除
  experimental: {
    // optimizeCssを削除（crittersモジュールに依存するため）
    // serverComponentsを削除（静的エクスポートと互換性の問題があるため）
  },
}

module.exports = nextConfig
