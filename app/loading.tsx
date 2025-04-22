export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative">
        {/* 外側の回転する円 */}
        <div className="w-16 h-16 border-4 border-primary/30 rounded-full animate-spin"></div>

        {/* 内側の逆回転する円 */}
        <div
          className="absolute top-1 left-1 w-14 h-14 border-4 border-primary/50 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "2s" }}
        ></div>

        {/* 中央の脈動する円 */}
        <div className="absolute top-4 left-4 w-8 h-8 bg-primary/70 rounded-full animate-pulse"></div>
      </div>

      <p className="mt-4 text-lg font-medium text-primary">読み込み中...</p>
      <p className="text-sm text-muted-foreground">少々お待ちください</p>
    </div>
  )
}
