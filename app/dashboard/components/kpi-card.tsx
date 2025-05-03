import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: number
  total?: number
  icon: React.ReactNode
  description: string
  trend?: number
}

export function KpiCard({ title, value, total, icon, description, trend }: KpiCardProps) {
  const percentage = total ? Math.round((value / total) * 100) : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {percentage !== null ? `${value} / ${total} (${percentage}%)` : `${value}`}
        </div>
        <div className="flex items-center">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend !== undefined && trend !== 0 && (
            <div className={`ml-2 flex items-center text-xs ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
              {trend > 0 ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
