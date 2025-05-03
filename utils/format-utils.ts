/**
 * 数値を日本円形式でフォーマットする
 * @param value フォーマットする数値
 * @returns フォーマットされた文字列
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * 日付文字列を日本語形式でフォーマットする
 * @param dateString フォーマットする日付文字列
 * @returns フォーマットされた文字列
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

/**
 * 数値をパーセント形式でフォーマットする
 * @param value フォーマットする数値（0-1）
 * @returns フォーマットされた文字列
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value)
}
