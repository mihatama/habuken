// Supabaseデバッグヘルパー
import { createClient } from "@supabase/supabase-js"

// テーブル構造を確認するための関数
export async function checkTableStructure(tableName: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("環境変数が設定されていません")
      return { error: "環境変数が設定されていません" }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // テーブル情報を取得するクエリ
    // 注: これはPostgreSQLの情報スキーマを使用しています
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", tableName)

    if (error) {
      console.error(`テーブル構造の取得エラー: ${error.message}`)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error("テーブル構造確認中のエラー:", error)
    return { error: error instanceof Error ? error.message : "不明なエラー" }
  }
}

// RLSポリシーを確認するための関数
export async function checkRLSPolicies(tableName: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("環境変数が設定されていません")
      return { error: "環境変数が設定されていません" }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // RLSポリシーを取得するクエリ
    // 注: これはPostgreSQLのpg_policyテーブルを使用しています
    const { data, error } = await supabase.rpc("get_policies_for_table", { table_name: tableName })

    if (error) {
      console.error(`RLSポリシーの取得エラー: ${error.message}`)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error("RLSポリシー確認中のエラー:", error)
    return { error: error instanceof Error ? error.message : "不明なエラー" }
  }
}

// テーブルのレコード数を確認する関数
export async function checkTableRecordCount(tableName: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("環境変数が設定されていません")
      return { error: "環境変数が設定されていません" }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // レコード数を取得するクエリ
    const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

    if (error) {
      console.error(`レコード数の取得エラー: ${error.message}`)
      return { error: error.message }
    }

    return { count }
  } catch (error) {
    console.error("レコード数確認中のエラー:", error)
    return { error: error instanceof Error ? error.message : "不明なエラー" }
  }
}
