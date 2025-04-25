import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Staff } from "@/types/supabase"

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

/**
 * スタッフデータを取得する関数
 * @param options 取得オプション（ページネーション、フィルタリングなど）
 * @returns スタッフデータと関連メタデータ
 */
export async function getStaff(
  options: {
    page?: number
    limit?: number
    status?: string
    department?: string
    searchTerm?: string
  } = {},
) {
  const startTime = performance.now()
  const supabase = createClientComponentClient()

  try {
    console.log("スタッフデータを取得中...", options)

    // デフォルト値の設定
    const { page = 1, limit = 10, status, department, searchTerm } = options

    const offset = (page - 1) * limit

    // クエリの構築
    let query = supabase.from("staff").select("*", { count: "exact" })

    // フィルタの適用
    if (status) {
      query = query.eq("status", status)
    }

    if (department) {
      query = query.eq("department", department)
    }

    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    }

    // ページネーションの適用
    const { data, error, count } = await query.order("full_name").range(offset, offset + limit - 1)

    const endTime = performance.now()
    const executionTime = endTime - startTime

    if (error) {
      console.error("スタッフデータの取得に失敗しました:", error)
      throw error
    }

    console.log(`スタッフデータを正常に取得しました (${executionTime.toFixed(2)}ms):`, {
      count,
      page,
      limit,
      data: data?.length,
    })

    return {
      data: data as Staff[],
      metadata: {
        count: count || 0,
        page,
        limit,
        executionTime,
      },
    }
  } catch (error) {
    console.error("スタッフデータの取得中にエラーが発生しました:", error)
    throw error
  }
}

/**
 * スタッフデータを削除する関数
 * @param id 削除するスタッフのID
 * @returns 削除の結果
 */
export async function deleteStaff(id: string) {
  const startTime = performance.now()
  const supabase = createClientComponentClient()

  return withRetry(async () => {
    try {
      console.log(`スタッフデータを削除中... ID: ${id}`)

      const { error } = await supabase.from("staff").delete().eq("id", id)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      if (error) {
        console.error(`スタッフ削除に失敗しました (ID: ${id}):`, error)
        throw error
      }

      console.log(`スタッフを正常に削除しました (ID: ${id}, ${executionTime.toFixed(2)}ms)`)

      return {
        success: true,
        metadata: {
          executionTime,
          id,
        },
      }
    } catch (error) {
      console.error(`スタッフの削除中にエラーが発生しました (ID: ${id}):`, error)
      throw error
    }
  })
}
