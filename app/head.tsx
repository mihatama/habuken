export default function Head() {
  return (
    <>
      <title>現助 - 建設現場管理システム</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/habuken-logo.png" />
      {/* フォントの読み込み方法を最適化 - プリロードではなく直接スタイルシートとして読み込む */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&display=swap"
        media="print"
        onLoad="this.media='all'"
      />
      {/* 不要なプリロードを削除 - FontLoaderコンポーネントで動的に読み込むため */}
    </>
  )
}
