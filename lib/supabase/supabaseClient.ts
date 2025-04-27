import {
  getClientSupabase,
  fetchData as fetchDataFromSupabase,
  insertData as insertDataToSupabase,
  updateData as updateDataInSupabase,
  deleteData as deleteDataFromSupabase,
} from "../supabase-client"

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
  return fetchDataFromSupabase(tableName, options)
}

export async function insertDataToTable(tableName: string, data: any) {
  const result = await insertDataToSupabase(tableName, data)
  return result
}

export async function updateDataInTable(tableName: string, id: string, data: any) {
  const result = await updateDataInSupabase(tableName, id, data)
  return result
}

export async function deleteDataFromTable(tableName: string, id: string) {
  return deleteDataFromSupabase(tableName, id)
}
