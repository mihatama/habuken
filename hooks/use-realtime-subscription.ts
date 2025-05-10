"use client"

import { useEffect, useRef, useState } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { subscribeToTable, unsubscribeFromChannel } from "@/lib/supabase-realtime"

type SubscriptionEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

interface UseRealtimeSubscriptionOptions {
  event?: SubscriptionEvent
  filter?: string
  enabled?: boolean
}

/**
 * リアルタイムサブスクリプションを管理するカスタムフック
 * @param tableName 監視するテーブル名
 * @param options サブスクリプションオプション
 * @returns 最新のペイロードデータ
 */
export function useRealtimeSubscription(tableName: string, options: UseRealtimeSubscriptionOptions = {}) {
  const { event = "*", filter, enabled = true } = options
  const [payload, setPayload] = useState<any>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    // enabledがfalseの場合はサブスクリプションを作成しない
    if (!enabled) return

    // サブスクリプションを作成
    channelRef.current = subscribeToTable(
      tableName,
      (newPayload) => {
        setPayload(newPayload)
      },
      { event, filter },
    )

    // クリーンアップ関数
    return () => {
      if (channelRef.current) {
        unsubscribeFromChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [tableName, event, filter, enabled])

  return payload
}

/**
 * 特定のレコードのリアルタイムサブスクリプションを管理するカスタムフック
 * @param tableName 監視するテーブル名
 * @param recordId 監視するレコードのID
 * @param options サブスクリプションオプション
 * @returns 最新のペイロードデータ
 */
export function useRealtimeRecordSubscription(
  tableName: string,
  recordId: string | null,
  options: Omit<UseRealtimeSubscriptionOptions, "filter"> = {},
) {
  // recordIdがnullの場合はサブスクリプションを無効化
  const enabled = options.enabled !== false && recordId !== null

  return useRealtimeSubscription(tableName, {
    ...options,
    filter: recordId ? `id=eq.${recordId}` : undefined,
    enabled,
  })
}
