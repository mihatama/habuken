import React from "react"
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
        <CardTitle className="text-body font-medium">{title}</CardTitle>
        {React.cloneElement(icon as React.ReactElement, {
          className: "h-4 w-4 text-muted-foreground",
        })}
      </CardHeader>
      <CardContent>
        <div className="text-heading-md font-bold">
          {percentage !== null ? `${value} / ${total} (${percentage}%)` : `${value}`}
        </div>
        <div className="flex items-center">
          <p className="text-caption text-muted-foreground">{description}</p>
          {trend !== undefined && trend !== 0 && (
            <div className={`ml-2 flex items-center text-caption ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
              {trend > 0 ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
