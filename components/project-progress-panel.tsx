// getStatusVariant 関数内で、デフォルトのケースを修正します
function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "進行中":
      return "default"
    case "準備中":
      return "secondary"
    case "完了":
      return "outline"
    case "中断":
      return "destructive"
    case "未選択":
      return "outline"
    default:
      return "outline"
  }
}
