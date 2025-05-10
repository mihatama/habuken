"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface UseRealtimeSubscriptionOptions {
  enabled?: boolean
}

export function useRealtimeSubscription(table: string, options: UseRealtimeSubscriptionOptions = {}) {
  const { enabled = true } = options
  const [payload, setPayload] = useState<any>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) {
      console.log("[リアルタイム] サブスクリプション無効")
      return
    }

    console.log("[リアルタイム] サブスクリプション開始:", table)
    const supabase = createClientComponentClient()

    // リアルタイムチャンネルを作成
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          console.log("[リアルタイム] 変更を検出:", payload)
          setPayload(payload)
        },
      )
      .subscribe((status) => {
        console.log("[リアルタイム] サブスクリプション状態:", status)
      })

    setChannel(channel)

    // クリーンアップ
    return () => {
      console.log("[リアルタイム] サブスクリプション終了:", table)
      channel.unsubscribe()
    }
  }, [table, enabled])

  return payload
}
