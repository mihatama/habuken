import { getClientSupabaseInstance } from "@/lib/supabase/supabaseClient"

export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`操作に失敗しました (${attempt + 1}/${maxRetries}): ${lastError.message}`)

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error("不明なエラーが発生しました")
}

// スタッフデータを取得する関数
export async function getStaff() {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()

    // スタッフデータを取得
    const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

    if (error) {
      console.error("スタッフデータ取得エラー:", error)
      throw error
    }

    return data || []
  })
}

// スタッフを削除する関数
export async function deleteStaff(id: string) {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()

    // スタッフを削除
    const { error } = await supabase.from("staff").delete().eq("id", id)

    if (error) {
      console.error("スタッフ削除エラー:", error)
      throw error
    }

    return { success: true }
  })
}

// スタッフを追加する関数
export async function addStaff(staffData: any) {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()

    // スタッフを追加
    const { data, error } = await supabase.from("staff").insert(staffData).select()

    if (error) {
      console.error("スタッフ追加エラー:", error)
      throw error
    }

    return data?.[0] || null
  })
}

// スタッフを更新する関数
export async function updateStaff(id: string, staffData: any) {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()

    // スタッフを更新
    const { data, error } = await supabase.from("staff").update(staffData).eq("id", id).select()

    if (error) {
      console.error("スタッフ更新エラー:", error)
      throw error
    }

    return data?.[0] || null
  })
}

// スタッフの詳細を取得する関数
export async function getStaffById(id: string) {
  return withRetry(async () => {
    const supabase = getClientSupabaseInstance()

    // スタッフの詳細を取得
    const { data, error } = await supabase.from("staff").select("*").eq("id", id).single()

    if (error) {
      console.error("スタッフ詳細取得エラー:", error)
      throw error
    }

    return data
  })
}
