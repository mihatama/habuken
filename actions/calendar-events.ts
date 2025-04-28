"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { getServerSupabase } from "@/lib/supabase/client"

// カレンダーイベント一覧を取得
export async function getCalendarEvents(resourceType: string, resourceId?: string) {
  const supabase = getServerSupabase()

  try {
    let query = supabase.from("calendar_events").select("*")

    if (resourceType) {
      query = query.eq("resource_type", resourceType)
    }

    if (resourceId) {
      query = query.eq("resource_id", resourceId)
    }

    const { data, error } = await query.order("start_date", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error("カレンダーイベント取得エラー:", error)
    return { success: false, error: error.message }
  }
}

// カレンダーイベントを作成
export async function createCalendarEvent(eventData: any) {
  const supabase = getServerSupabase()

  try {
    // イベントを追加
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        id: uuidv4(),
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error

    // キャッシュを再検証
    revalidatePath(`/${eventData.resource_type}`)

    return { success: true, data }
  } catch (error: any) {
    console.error("カレンダーイベント作成エラー:", error)
    return { success: false, error: error.message }
  }
}

// カレンダーイベントを更新
export async function updateCalendarEvent(id: string, eventData: any) {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase
      .from("calendar_events")
      .update({
        ...eventData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    // キャッシュを再検証
    revalidatePath(`/${eventData.resource_type}`)

    return { success: true, data }
  } catch (error: any) {
    console.error("カレンダーイベント更新エラー:", error)
    return { success: false, error: error.message }
  }
}

// カレンダーイベントを削除
export async function deleteCalendarEvent(id: string, resourceType: string) {
  const supabase = getServerSupabase()

  try {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id)

    if (error) throw error

    // キャッシュを再検証
    revalidatePath(`/${resourceType}`)

    return { success: true }
  } catch (error: any) {
    console.error("カレンダーイベント削除エラー:", error)
    return { success: false, error: error.message }
  }
}
