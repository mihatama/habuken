import type { Project, Staff, Resource } from "./supabase"

export type CalendarViewType = "project" | "staff" | "tool"
export type TimeframeType = "month" | "week" | "day"

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  project_id?: string
  staff_id?: string
  resource_id?: string
  event_type: "project" | "staff" | "tool" | "general"
  color?: string
  allDay?: boolean

  // 関連データ
  project?: Project
  staff?: Staff
  resource?: Resource
}

export interface CalendarProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  onEventDrop?: (event: CalendarEvent, start: Date, end: Date) => void
  timeframe?: TimeframeType
  viewType?: CalendarViewType
  initialDate?: Date
  loading?: boolean
}
