"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ResourceUtilizationChartProps {
  data: Array<{
    name: string
    稼働中: number
    利用可能: number
  }>
}

export function ResourceUtilizationChart({ data }: ResourceUtilizationChartProps) {
  return (
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
          <Tooltip />
          <Legend />
          <Bar dataKey="稼働中" fill="#4f46e5" />
          <Bar dataKey="利用可能" fill="#94a3b8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
