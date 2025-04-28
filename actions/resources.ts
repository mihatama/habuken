"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { getServerSupabase } from "@/lib/supabase/client"

// リソース一覧を取得
export async function getResources(resourceType: string) {
  const supabase = getServerSupabase()

  try {
    // リソース情報を取得
    const { data, error } = await supabase.from(resourceType).select("*").order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error(`${resourceType}取得エラー:`, error)
    return { success: false, error: error.message }
  }
}

// リソースを作成
export async function createResource(resourceType: string, resourceData: any) {
  const supabase = getServerSupabase()

  try {
    // リソースを追加
    const { data, error } = await supabase
      .from(resourceType)
      .insert({
        id: uuidv4(),
        ...resourceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) throw error

    // キャッシュを再検証
    revalidatePath(`/master/${resourceType}`)

    return { success: true, data }
  } catch (error: any) {
    console.error(`${resourceType}作成エラー:`, error)
    return { success: false, error: error.message }
  }
}

// リソースを更新
export async function updateResource(resourceType: string, id: string, resourceData: any) {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase
      .from(resourceType)
      .update({
        ...resourceData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    // キャッシュを再検証
    revalidatePath(`/master/${resourceType}`)

    return { success: true, data }
  } catch (error: any) {
    console.error(`${resourceType}更新エラー:`, error)
    return { success: false, error: error.message }
  }
}

// リソースを削除
export async function deleteResource(resourceType: string, id: string) {
  const supabase = getServerSupabase()

  try {
    const { error } = await supabase.from(resourceType).delete().eq("id", id)

    if (error) throw error

    // キャッシュを再検証
    revalidatePath(`/master/${resourceType}`)

    return { success: true }
  } catch (error: any) {
    console.error(`${resourceType}削除エラー:`, error)
    return { success: false, error: error.message }
  }
}
