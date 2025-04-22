/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的エクスポートの設定
  output: "export",
  // 静的エクスポートでは動的なリダイレクトが使えないため、
  // 静的なリダイレクトを設定（警告は出るが設定は残しておく）
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ]
  },
  // ビルド時のエラーチェックを無効化
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 画像の最適化を無効化（静的エクスポートに必要）
  images: {
    unoptimized: true,
  },
  // トレイリングスラッシュを追加（Amplifyでの互換性向上）
  trailingSlash: true,
  // 静的エクスポートの設定
  experimental: {
    // Amplifyのデプロイエラー対策
    disableStaticImages: true,
  },
}

module.exports = nextConfig
