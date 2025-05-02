/**
 * 最適なコスト計算のためのユーティリティ関数
 */

/**
 * 使用日数に基づいて最も経済的な料金プランを計算する
 * @param days 使用日数
 * @param dailyRate 日額料金
 * @param weeklyRate 週額料金
 * @param monthlyRate 月額料金
 * @returns 最適な料金プランと合計金額
 */
export function calculateOptimalCost(
  days: number,
  dailyRate: number | null,
  weeklyRate: number | null,
  monthlyRate: number | null,
): {
  totalCost: number
  breakdown: {
    months: number
    weeks: number
    days: number
    monthlyCost: number
    weeklyCost: number
    dailyCost: number
  }
  savings: number
  dailyOnlyCost: number
} {
  // デフォルト値の設定
  const daily = dailyRate || 0
  const weekly = weeklyRate || 0
  const monthly = monthlyRate || 0

  // 日額のみで計算した場合のコスト
  const dailyOnlyCost = daily * days

  // 最適な組み合わせを計算
  let months = 0
  let weeks = 0
  let remainingDays = days
  let totalCost = 0

  // 月額が設定されていて、月額が4週間分の週額より安い場合
  if (monthly > 0 && (weekly === 0 || monthly < weekly * 4)) {
    months = Math.floor(remainingDays / 30)
    remainingDays -= months * 30
    totalCost += months * monthly
  }

  // 週額が設定されていて、週額が7日分の日額より安い場合
  if (weekly > 0 && (daily === 0 || weekly < daily * 7)) {
    weeks = Math.floor(remainingDays / 7)
    remainingDays -= weeks * 7
    totalCost += weeks * weekly
  }

  // 残りの日数を日額で計算
  if (daily > 0) {
    totalCost += remainingDays * daily
  }

  // 節約額を計算
  const savings = dailyOnlyCost - totalCost

  return {
    totalCost,
    breakdown: {
      months,
      weeks,
      days: remainingDays,
      monthlyCost: months * monthly,
      weeklyCost: weeks * weekly,
      dailyCost: remainingDays * daily,
    },
    savings,
    dailyOnlyCost,
  }
}

/**
 * 使用期間に基づいて最も経済的な料金プランを計算する
 * @param startDate 開始日
 * @param endDate 終了日
 * @param dailyRate 日額料金
 * @param weeklyRate 週額料金
 * @param monthlyRate 月額料金
 * @returns 最適な料金プランと合計金額
 */
export function calculateOptimalCostByDates(
  startDate: Date,
  endDate: Date,
  dailyRate: number | null,
  weeklyRate: number | null,
  monthlyRate: number | null,
) {
  // 使用日数を計算（終了日も含む）
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return calculateOptimalCost(days, dailyRate, weeklyRate, monthlyRate)
}
