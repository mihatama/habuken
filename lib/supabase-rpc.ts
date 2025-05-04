import { getClientSupabase, getServerSupabase } from "./supabase-utils"

/**
 * クライアントサイドでRPC関数を呼び出すユーティリティ
 * @param functionName 呼び出すRPC関数名
 * @param params 関数に渡すパラメータ
 * @returns RPC関数の結果
 */
export async function callClientRpc<T = any>(functionName: string, params?: any): Promise<T> {
  try {
    console.log(
      `RPC関数 ${functionName} を呼び出し中...`,
      params ? `パラメータ: ${JSON.stringify(params)}` : "パラメータなし",
    )
    const supabase = getClientSupabase()

    const { data, error } = await supabase.rpc(functionName, params)

    if (error) {
      console.error(`RPC関数 ${functionName} の呼び出しエラー:`, error)
      throw error
    }

    console.log(`RPC関数 ${functionName} の呼び出し成功`)
    return data as T
  } catch (error) {
    console.error(`RPC関数 ${functionName} の呼び出し中に例外が発生:`, error)
    throw error
  }
}

/**
 * サーバーサイドでRPC関数を呼び出すユーティリティ
 * @param functionName 呼び出すRPC関数名
 * @param params 関数に渡すパラメータ
 * @returns RPC関数の結果
 */
export async function callServerRpc<T = any>(functionName: string, params?: any): Promise<T> {
  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase.rpc(functionName, params)

    if (error) {
      console.error(`サーバーRPC関数 ${functionName} の呼び出しエラー:`, error)
      throw error
    }

    return data as T
  } catch (error) {
    console.error(`サーバーRPC関数 ${functionName} の呼び出し中に例外が発生:`, error)
    throw error
  }
}

/**
 * 複数のデータ取得を並列実行するユーティリティ
 * @param fetchFunctions 実行する関数の配列
 * @returns 各関数の結果の配列
 */
export async function fetchDataInParallel<T extends any[]>(fetchFunctions: Array<() => Promise<any>>): Promise<T> {
  try {
    console.log(`${fetchFunctions.length}個のデータ取得を並列実行中...`)
    const startTime = performance.now()

    const results = await Promise.all(
      fetchFunctions.map((fn) =>
        fn().catch((error) => {
          console.error("並列データ取得中にエラーが発生:", error)
          return null
        }),
      ),
    )

    const endTime = performance.now()
    console.log(`並列データ取得完了: ${Math.round(endTime - startTime)}ms`)

    return results as T
  } catch (error) {
    console.error("並列データ取得中に例外が発生:", error)
    throw error
  }
}
