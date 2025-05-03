"use client"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/format-utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CostOptimizationPanelProps {
  costSavings: number
}

export function CostOptimizationPanel({ costSavings }: CostOptimizationPanelProps) {
  // サンプルデータ
  const data = [
    { name: "重機", 現在のコスト: 500000, 最適化後: 450000 },
    { name: "車両", 現在のコスト: 300000, 最適化後: 270000 },
    { name: "工具", 現在のコスト: 200000, 最適化後: 180000 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">月間コスト削減可能額: {formatCurrency(costSavings)}</h3>
          <p className="text-sm text-muted-foreground">リソースの最適な割り当てと利用によるコスト削減効果</p>
        </div>
        <Button>最適化レポートを表示</Button>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
            <Bar dataKey="現在のコスト" fill="#ef4444" />
            <Bar dataKey="最適化後" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium">重機の最適化</h4>
          <p className="text-sm text-muted-foreground mt-1">日額レンタルから週額レンタルへの切り替えによる削減</p>
          <div className="mt-2 text-lg font-bold text-green-600">{formatCurrency(50000)}</div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium">車両の最適化</h4>
          <p className="text-sm text-muted-foreground mt-1">使用頻度の低い車両の共有化による削減</p>
          <div className="mt-2 text-lg font-bold text-green-600">{formatCurrency(30000)}</div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium">工具の最適化</h4>
          <p className="text-sm text-muted-foreground mt-1">工具の効率的な割り当てによる削減</p>
          <div className="mt-2 text-lg font-bold text-green-600">{formatCurrency(20000)}</div>
        </div>
      </div>
    </div>
  )
}
