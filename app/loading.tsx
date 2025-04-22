export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="relative h-24 w-24">
        {/* 外側の円 */}
        <div className="absolute inset-0 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>

        {/* 内側の円 */}
        <div
          className="absolute inset-2 animate-spin rounded-full border-b-2 border-t-2 border-primary"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>

        {/* 中央のロゴ */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 p-2">
            <div className="h-full w-full animate-pulse rounded-full bg-primary"></div>
          </div>
        </div>
      </div>

      {/* ローディングテキスト */}
      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold text-primary">読み込み中...</h2>
        <p className="mt-2 text-sm text-muted-foreground">少々お待ちください</p>
      </div>
    </div>
  )
}
