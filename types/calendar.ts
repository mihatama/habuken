export interface CalendarEvent {
  id: string | number
  title: string
  start: Date
  end: Date
  description?: string
  category?: string
  projectId?: string | number
  staffId?: string | number
  resourceId?: string | number
  machinery_id?: string | number
  project_name?: string
  notes?: string
  [key: string]: any // 追加のプロパティを許可
}

export interface CalendarCategory {
  value: string
  label: string
}

export interface CalendarCustomField {
  name: string
  label: string
  type: "text" | "select" | "date" | "time" | "checkbox"
  options?: Array<{ value: string; label: string }>
  required?: boolean
}

export interface BaseCalendarProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => Promise<CalendarEvent>
  onEventUpdate?: (event: CalendarEvent) => Promise<CalendarEvent>
  onEventDelete?: (eventId: number | string) => Promise<{ success: boolean }>
  isLoading?: boolean
  error?: string | null
  categories?: CalendarCategory[]
  customFields?: CalendarCustomField[]
  onRefresh?: () => void
  timeframe?: "day" | "week" | "month"
}
