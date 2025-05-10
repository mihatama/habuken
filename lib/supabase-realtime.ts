import type { RealtimeChannel } from "@supabase/supabase-js"
import { getClientSupabase } from "./supabase-utils"

type SubscriptionCallback = (payload: any) => void
type SubscriptionEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

interface SubscriptionOptions {
  event?: SubscriptionEvent
  filter?: string
}

/**
 * テーブルの変更をリアルタイムで監視するためのサブスクリプションを作成
 * @param tableName 監視するテーブル名
 * @param callback 変更があった時に呼び出されるコールバック関数
 * @param options サブスクリプションオプション
 * @returns サブスクリプションチャンネル
 */
export function subscribeToTable(
  tableName: string,
  callback: SubscriptionCallback,
  options: SubscriptionOptions = {},
): RealtimeChannel {
  const supabase = getClientSupabase()
  const { event = "*", filter } = options

  // チャンネル名をユニークにするために現在時刻を使用
  const channelName = `realtime:${tableName}:${Date.now()}`

  // リアルタイムチャンネルを作成
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event,
        schema: "public",
        table: tableName,
        filter,
      },
      (payload) => {
        console.log(`リアルタイム更新 (${tableName}):`, payload)
        callback(payload)
      },
    )
    .subscribe((status) => {
      console.log(`サブスクリプションステータス (${tableName}):`, status)
    })

  return channel
}

/**
 * リアルタイムサブスクリプションを解除
 * @param channel 解除するチャンネル
 */
export async function unsubscribeFromChannel(channel: RealtimeChannel): Promise<void> {
  const supabase = getClientSupabase()
  await supabase.removeChannel(channel)
}

/**
 * 特定のレコードの変更をリアルタイムで監視
 * @param tableName 監視するテーブル名
 * @param recordId 監視するレコードのID
 * @param callback 変更があった時に呼び出されるコールバック関数
 * @param options サブスクリプションオプション
 * @returns サブスクリプションチャンネル
 */
export function subscribeToRecord(
  tableName: string,
  recordId: string,
  callback: SubscriptionCallback,
  options: Omit<SubscriptionOptions, "filter"> = {},
): RealtimeChannel {
  return subscribeToTable(tableName, callback, {
    ...options,
    filter: `id=eq.${recordId}`,
  })
}
