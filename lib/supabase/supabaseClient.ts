// 絶対パスのインポートを修正
// @/lib/supabase/index から直接インポートするのではなく
// @/lib/supabase/operations から必要な関数をインポート

import { getClientSupabase, fetchData, insertData, updateData, deleteData } from "@/lib/supabase/operations"

// 後方互換性のために既存の関数名を維持
export function getClientSupabaseInstance() {
  return getClientSupabase()
}

// 既存の関数を新しい実装にマッピング
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
  return fetchData(tableName, options)
}

export async function insertDataToTable(tableName: string, data: any) {
  return insertData(tableName, data)
}

export async function updateDataInTable(tableName: string, id: string, data: any) {
  return updateData(tableName, id, data)
}

export async function deleteDataFromTable(tableName: string, id: string) {
  return deleteData(tableName, id)
}
