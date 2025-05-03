"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/format-utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { calculateOptimalCost } from "@/utils/cost-calculation"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2 } from "lucide-react"

interface CostOptimizationPanelProps {
  costSavings?: number
}

export function CostOptimizationPanel({ costSavings }: CostOptimizationPanelProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [heavyMachineryData, setHeavyMachineryData] = useState<any[]>([])
  const [vehicleData, setVehicleData] = useState<any[]>([])
  const [machineryUsage, setMachineryUsage] = useState<any[]>([])
  const [vehicleUsage, setVehicleUsage] = useState<any[]>([])
  const [costData, setCostData] = useState<any[]>([])
  const [totalSavings, setTotalSavings] = useState(0)
  const [machineryTotalSavings, setMachineryTotalSavings] = useState(0)
  const [vehicleTotalSavings, setVehicleTotalSavings] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setIsLoading(true)
      const supabase = getClientSupabase()

      // 重機データを取得
      const { data: machineryData, error: machineryError } = await supabase
        .from("heavy_machinery")
        .select("*")
        .order("name", { ascending: true })

      if (machineryError) throw machineryError

      // 車両データを取得
      const { data: vehicles, error: vehicleError } = await supabase
        .from("vehicles")
        .select("*")
        .order("name", { ascending: true })

      if (vehicleError) throw vehicleError

      // 重機の使用実績データを取得
      const { data: machineryUsageData, error: machineryUsageError } = await supabase
        .from("deal_machinery")
        .select(`
          id,
          machinery_id,
          deal:deal_id (
            id,
            name,
            start_date,
            end_date
          )
        `)
        .not("deal.start_date", "is", null)
        .not("deal.end_date", "is", null)

      // 車両の使用実績データを取得
      const { data: vehicleUsageData, error: vehicleUsageError } = await supabase
        .from("deal_vehicles")
        .select(`
          id,
          vehicle_id,
          deal:deal_id (
            id,
            name,
            start_date,
            end_date
          )
        `)
        .not("deal.start_date", "is", null)
        .not("deal.end_date", "is", null)

      // データを設定
      setHeavyMachineryData(machineryData || [])
      setVehicleData(vehicles || [])
      setMachineryUsage(machineryUsageData || [])
      setVehicleUsage(vehicleUsageData || [])

      // コスト計算
      calculateCosts(machineryData || [], vehicles || [], machineryUsageData || [], vehicleUsageData || [])
    } catch (error) {
      console.error("データの取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function calculateCosts(machinery: any[], vehicles: any[], machineryUsageData: any[], vehicleUsageData: any[]) {
    // 重機のコスト計算
    let machineryOptimalTotal = 0
    let machineryDailyOnlyTotal = 0
    let machinerySavings = 0

    const machineryResults = machinery.map((machine) => {
      // この重機の使用実績を取得
      const usageItems = machineryUsageData.filter((usage) => usage.machinery_id === machine.id)

      // 使用日数の計算
      let totalDays = 0
      usageItems.forEach((usage) => {
        if (usage.deal?.start_date && usage.deal?.end_date) {
          const days =
            Math.ceil(
              (new Date(usage.deal.end_date).getTime() - new Date(usage.deal.start_date).getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1
          totalDays += days
        }
      })

      // コスト計算
      const dailyOnlyCost = (machine.daily_rate || 0) * totalDays
      const optimalCost = calculateOptimalCost(
        totalDays,
        machine.daily_rate || 0,
        machine.weekly_rate || 0,
        machine.monthly_rate || 0,
      )

      // 合計に加算
      machineryDailyOnlyTotal += dailyOnlyCost
      machineryOptimalTotal += optimalCost.totalCost
      machinerySavings += optimalCost.savings

      return {
        id: machine.id,
        name: machine.name,
        totalDays,
        dailyOnlyCost,
        optimalCost: optimalCost.totalCost,
        savings: optimalCost.savings,
      }
    })

    // 車両のコスト計算
    let vehicleOptimalTotal = 0
    let vehicleDailyOnlyTotal = 0
    let vehicleSavings = 0

    const vehicleResults = vehicles.map((vehicle) => {
      // この車両の使用実績を取得
      const usageItems = vehicleUsageData.filter((usage) => usage.vehicle_id === vehicle.id)

      // 使用日数の計算
      let totalDays = 0
      usageItems.forEach((usage) => {
        if (usage.deal?.start_date && usage.deal?.end_date) {
          const days =
            Math.ceil(
              (new Date(usage.deal.end_date).getTime() - new Date(usage.deal.start_date).getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1
          totalDays += days
        }
      })

      // コスト計算
      const dailyOnlyCost = (vehicle.daily_rate || 0) * totalDays
      const optimalCost = calculateOptimalCost(
        totalDays,
        vehicle.daily_rate || 0,
        vehicle.weekly_rate || 0,
        vehicle.monthly_rate || 0,
      )

      // 合計に加算
      vehicleDailyOnlyTotal += dailyOnlyCost
      vehicleOptimalTotal += optimalCost.totalCost
      vehicleSavings += optimalCost.savings

      return {
        id: vehicle.id,
        name: vehicle.name,
        totalDays,
        dailyOnlyCost,
        optimalCost: optimalCost.totalCost,
        savings: optimalCost.savings,
      }
    })

    // グラフ用データの作成
    const chartData = [
      {
        name: "重機",
        日額のみ: machineryDailyOnlyTotal,
        最適プラン: machineryOptimalTotal,
        節約額: machinerySavings,
      },
      {
        name: "車両",
        日額のみ: vehicleDailyOnlyTotal,
        最適プラン: vehicleOptimalTotal,
        節約額: vehicleSavings,
      },
    ]

    // 状態を更新
    setCostData(chartData)
    setTotalSavings(machinerySavings + vehicleSavings)
    setMachineryTotalSavings(machinerySavings)
    setVehicleTotalSavings(vehicleSavings)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">月間コスト削減可能額: {formatCurrency(totalSavings)}</h3>
          <p className="text-sm text-muted-foreground">リソースの最適な割り当てと利用によるコスト削減効果</p>
        </div>
        <Button>最適化レポートを表示</Button>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={costData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Bar dataKey="日額のみ" fill="#ef4444" />
            <Bar dataKey="最適プラン" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium">重機の最適化</h4>
          <p className="text-sm text-muted-foreground mt-1">日額・週額・月額の最適な組み合わせによる削減</p>
          <div className="mt-2 text-lg font-bold text-green-600">{formatCurrency(machineryTotalSavings)}</div>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium">車両の最適化</h4>
          <p className="text-sm text-muted-foreground mt-1">日額・週額・月額の最適な組み合わせによる削減</p>
          <div className="mt-2 text-lg font-bold text-green-600">{formatCurrency(vehicleTotalSavings)}</div>
        </div>
      </div>
    </div>
  )
}
