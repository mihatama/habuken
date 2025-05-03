"use client"

import { FileText, Clock, AlertTriangle } from "lucide-react"

interface Activity {
  id: string
  type: "report" | "leave" | "other"
  title: string
  date: string
  description: string
}

interface RecentActivitiesPanelProps {
  activities: Activity[]
}

export function RecentActivitiesPanel({ activities }: RecentActivitiesPanelProps) {
  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {activity.type === "report" ? (
                <FileText className="h-4 w-4" />
              ) : activity.type === "leave" ? (
                <Clock className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="font-medium">{activity.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString("ja-JP")}</div>
              <div className="mt-1 text-sm">{activity.description}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4">最近のアクティビティはありません</div>
      )}
    </div>
  )
}
