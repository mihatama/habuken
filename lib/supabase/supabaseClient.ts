import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// クライアントコンポーネント用のSupabaseクライアントを取得する関数
export function getClientSupabaseInstance() {
  return createClientComponentClient<Database>()
}

// データ取得用の共通関数
export async function fetchDataFromTable(
  tableName: string,
  options: {
    select?: string
    order?: { column: string; ascending: boolean }
    filters?: Record<string, any>
    limit?: number
    page?: number
  } = {},
) {
  const supabase = getClientSupabaseInstance()
  const { select = "*", order, filters = {}, limit, page } = options

  try {
    let query = supabase.from(tableName).select(select)

    // フィルターを適用
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "string" && value.includes("%")) {
          query = query.ilike(key, value)
        } else {
          query = query.eq(key, value)
        }
      }
    })

    // 並び順を適用
    if (order) {
      query = query.order(order.column, { ascending: order.ascending })
    }

    // ページネーションを適用
    if (limit && page) {
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
    } else if (limit) {
      query = query.limit(limit)
    }

    const { data, error, count } = await query

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error)
      throw error
    }

    return { data, count }
  } catch (error) {
    console.error(`Error in fetchDataFromTable for ${tableName}:`, error)
    throw error
  }
}

// データ挿入用の共通関数
export async function insertDataToTable(tableName: string, data: any) {
  const supabase = getClientSupabaseInstance()

  try {
    const { data: insertedData, error } = await supabase.from(tableName).insert(data).select()

    if (error) {
      console.error(`Error inserting data to ${tableName}:`, error)
      throw error
    }

    return insertedData
  } catch (error) {
    console.error(`Error in insertDataToTable for ${tableName}:`, error)
    throw error
  }
}

// データ更新用の共通関数
export async function updateDataInTable(tableName: string, id: string, data: any) {
  const supabase = getClientSupabaseInstance()

  try {
    const { data: updatedData, error } = await supabase.from(tableName).update(data).eq("id", id).select()

    if (error) {
      console.error(`Error updating data in ${tableName}:`, error)
      throw error
    }

    return updatedData
  } catch (error) {
    console.error(`Error in updateDataInTable for ${tableName}:`, error)
    throw error
  }
}

// データ削除用の共通関数
export async function deleteDataFromTable(tableName: string, id: string) {
  const supabase = getClientSupabaseInstance()

  try {
    const { error } = await supabase.from(tableName).delete().eq("id", id)

    if (error) {
      console.error(`Error deleting data from ${tableName}:`, error)
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error in deleteDataFromTable for ${tableName}:`, error)
    throw error
  }
}
