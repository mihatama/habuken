// 曜日の日本語表記
export const WEEKDAYS_JP = ["日", "月", "火", "水", "木", "金", "土"]

// 日付を「MM/DD（曜）」形式でフォーマット
export function formatDateJP(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = WEEKDAYS_JP[date.getDay()]

  return `${month}/${day}（${weekday}）`
}

// 時刻を「HH:MM」形式でフォーマット
export function formatTimeJP(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")

  return `${hours}:${minutes}`
}

// 日付が同じかどうかをチェック
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// 日本時間に変換
export function toJST(dateString: string): Date {
  const date = new Date(dateString)
  // UTCからJST（UTC+9）に変換
  date.setHours(date.getHours() + 9)
  return date
}
