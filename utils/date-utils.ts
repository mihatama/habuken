import { format } from "date-fns"
import { ja } from "date-fns/locale"

// 曜日を取得する関数
export const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString)
  return format(date, "EEEE", { locale: ja })
}

// 令和年を取得する関数
export const getReiwaYear = (dateString: string): number => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  // 令和は2019年5月1日から
  return year - 2018
}

// 日付をフォーマットする関数
export const formatDate = (dateString: string, formatString = "yyyy年MM月dd日"): string => {
  const date = new Date(dateString)
  return format(date, formatString, { locale: ja })
}

// 日本の元号を取得する関数
export const getJapaneseEra = (dateString: string): { era: string; year: number } => {
  const date = new Date(dateString)
  const year = date.getFullYear()

  if (year >= 2019) {
    return { era: "令和", year: year - 2018 }
  } else if (year >= 1989) {
    return { era: "平成", year: year - 1988 }
  } else if (year >= 1926) {
    return { era: "昭和", year: year - 1925 }
  } else if (year >= 1912) {
    return { era: "大正", year: year - 1911 }
  } else {
    return { era: "明治", year: year - 1867 }
  }
}

// 日付の範囲を取得する関数
export const getDateRange = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates: string[] = []

  const current = new Date(start)
  while (current <= end) {
    dates.push(format(current, "yyyy-MM-dd"))
    current.setDate(current.getDate() + 1)
  }

  return dates
}
