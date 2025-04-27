import type { EventType } from "../enums"

/**
 * データベース上のカレンダーイベント型
 */
export interface DbCalendarEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  notes: string | null
  project_id: string | null
  staff_id: string | null
  resource_id: string | null
  event_type: EventType
  created_at: string
  updated_at: string
}

/**
 * クライアントサイドで使用するカレンダーイベント型
 */
export interface ClientCalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  projectId?: string
  staffIds?: string[]
  resourceIds?: string[]
  allDay?: boolean
  eventType: EventType
}

/**
 * 新規カレンダーイベント作成時の型
 */
export type NewDbCalendarEvent = Omit<DbCalendarEvent, "id" | "created_at" | "updated_at">

/**
 * カレンダーイベント更新時の型
 */
export type UpdateDbCalendarEvent = Partial<NewDbCalendarEvent>

/**
 * データベースイベントをクライアントイベントに変換する関数
 */
export function dbToClientEvent(dbEvent: DbCalendarEvent): ClientCalendarEvent {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    start: new Date(dbEvent.start_time),
    end: new Date(dbEvent.end_time),
    description: dbEvent.notes || undefined,
    projectId: dbEvent.project_id || undefined,
    staffIds: dbEvent.staff_id ? [dbEvent.staff_id] : undefined,
    resourceIds: dbEvent.resource_id ? [dbEvent.resource_id] : undefined,
    eventType: dbEvent.event_type,
  }
}

/**
 * クライアントイベントをデータベースイベントに変換する関数
 */
export function clientToDbEvent(clientEvent: ClientCalendarEvent): NewDbCalendarEvent {
  return {
    title: clientEvent.title,
    start_time: clientEvent.start.toISOString(),
    end_time: clientEvent.end.toISOString(),
    notes: clientEvent.description || null,
    project_id: clientEvent.projectId || null,
    staff_id: clientEvent.staffIds && clientEvent.staffIds.length > 0 ? clientEvent.staffIds[0] : null,
    resource_id: clientEvent.resourceIds && clientEvent.resourceIds.length > 0 ? clientEvent.resourceIds[0] : null,
    event_type: clientEvent.eventType,
  }
}
