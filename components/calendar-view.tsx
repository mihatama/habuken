"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"
import { getCalendarEvents } from "@/actions/calendar-events"
import { Briefcase, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { EnhancedCalendar } from "@/components/enhanced-calendar"
import type { BaseCalendarProps, CalendarEvent, CalendarCategory } from "@/types/calendar"

// Supabaseクライアントの作成 - メモ化
const getSupabaseClient = (() => {
  let client: ReturnType<typeof createClient> | null = null

  return () => {
    if (client) return client

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase環境変数が設定されていません")
    }

    client = createClient(supabaseUrl, supabaseAnonKey)
    return client
  }
})()

// ページサイズの定数
const PAGE_SIZE = 100

export interface CalendarViewProps extends BaseCalendarProps {
  title?: string
  showAddButton?: boolean
  addButtonText?: string
  onAddButtonClick?: () => void
}

export function CalendarView({
  title = "カレンダー",
  showAddButton = true,
  addButtonText = "案件登録",
  onAddButtonClick,
  events: initialEvents,
  onEventAdd: externalEventAdd,
  onEventUpdate: externalEventUpdate,
  onEventDelete: externalEventDelete,
  isLoading: externalLoading,
  error: externalError,
  categories: externalCategories,
  customFields,
  onRefresh: externalRefresh,
  timeframe = "month",
}: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents || [])
  const [projects, setProjects] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(externalLoading || true)
  const [error, setError] = useState<string | null>(externalError || null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // メモ化されたカレンダーカテゴリ
  const mainCategories = useMemo<CalendarCategory[]>(
    () =>
      externalCategories || [
        { value: "project", label: "案件" },
        { value: "staff", label: "スタッフ" },
        { value: "tool", label: "備品" },
        { value: "vehicle", label: "車両" },
        { value: "meeting", label: "会議" },
        { value: "holiday", label: "休日" },
        { value: "general", label: "一般" },
      ],
    [externalCategories],
  )

  // 日付範囲の計算 - メモ化
  const dateRange = useMemo(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { firstDay, lastDay }
  }, [])

  // ページング対応のイベント取得
  const fetchEvents = useCallback(
    async (page = 1, append = false) => {
      // 外部からイベントが提供されている場合はスキップ
      if (initialEvents) {
        setEvents(initialEvents)
        setIsLoading(false)
        return
      }

      if (page === 1) {
        setIsLoading(true)
      }
      setError(null)

      try {
        // getCalendarEvents関数を使用してイベントを取得
        const { firstDay, lastDay } = dateRange

        const result = await getCalendarEvents({
          startDate: firstDay.toISOString(),
          endDate: lastDay.toISOString(),
          // ページングパラメータを追加
          page,
          pageSize: PAGE_SIZE,
        })

        if (!result.success) {
          throw new Error(result.error || "イベントの取得に失敗しました")
        }

        // 日付文字列をDateオブジェクトに変換
        const formattedEvents = result.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          description: event.notes,
          category: event.event_type,
          project_id: event.project_id,
          staff_id: event.staff_id,
          resource_id: event.resource_id,
        }))

        // 結果が PAGE_SIZE より少なければ、もうデータがないと判断
        setHasMore(formattedEvents.length === PAGE_SIZE)

        if (append) {
          setEvents((prev) => [...prev, ...formattedEvents])
        } else {
          setEvents(formattedEvents)
        }

        // プロジェクトとスタッフのデータを取得
        if (page === 1) {
          await fetchProjectsAndStaff()
        }
      } catch (error) {
        console.error("イベント取得エラー:", error)
        setError(error instanceof Error ? error.message : "イベントの取得に失敗しました")
        toast({
          title: "エラー",
          description: "カレンダーイベントの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [dateRange, toast, initialEvents],
  )

  // プロジェクトとスタッフのデータ取得 - メモ化
  const fetchProjectsAndStaff = useCallback(async () => {
    try {
      const supabase = getSupabaseClient()

      // プロジェクトデータを取得
      const { data: projectsData, error: projectsError } = await supabase.from("projects").select("id, name").limit(100) // 取得数を制限

      if (projectsError) throw new Error(`プロジェクトデータ取得エラー: ${projectsError.message}`)
      setProjects(projectsData || [])

      // スタッフデータを取得
      const { data: staffData, error: staffError } = await supabase.from("staff").select("id, full_name").limit(100) // 取得数を制限

      if (staffError) throw new Error(`スタッフデータ取得エラー: ${staffError.message}`)
      setStaff(staffData || [])
    } catch (error) {
      console.error("データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "プロジェクトとスタッフのデータ取得に失敗しました",
        variant: "destructive",
      })
    }
  }, [toast])

  // 初回ロード時にデータを取得
  useEffect(() => {
    fetchEvents(1, false)
  }, [fetchEvents])

  // 追加データの読み込み
  const loadMoreEvents = useCallback(() => {
    if (!hasMore || isLoading) return
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchEvents(nextPage, true)
  }, [currentPage, fetchEvents, hasMore, isLoading])

  // スクロール検出のための交差オブザーバー
  useEffect(() => {
    if (!hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreEvents()
        }
      },
      { threshold: 0.5 },
    )

    const loadMoreTrigger = document.getElementById("load-more-trigger")
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger)
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger)
      }
    }
  }, [hasMore, isLoading, loadMoreEvents])

  // イベント追加のハンドラ - メモ化
  const handleEventAdd = useCallback(
    async (event: CalendarEvent) => {
      // 外部ハンドラがある場合はそれを使用
      if (externalEventAdd) {
        return externalEventAdd(event)
      }

      try {
        const supabase = getSupabaseClient()

        // Supabaseに保存するデータ形式に変換
        const eventData = {
          title: event.title,
          start_time: event.start.toISOString(),
          end_time: event.end.toISOString(),
          event_type: event.category || "general",
          notes: event.description || null,
          project_id: event.project_id === "none" ? null : event.project_id,
          staff_id: event.staff_id === "none" ? null : event.staff_id,
        }

        const { data, error } = await supabase.from("shifts").insert(eventData).select()

        if (error) throw error

        // 新しいイベントを追加
        if (data && data[0]) {
          const addedEvent = {
            ...event,
            id: data[0].id,
          }
          setEvents((prev) => [...prev, addedEvent])
          return addedEvent
        }

        return { id: Date.now() } as CalendarEvent
      } catch (error) {
        console.error("イベント追加エラー:", error)
        toast({
          title: "エラー",
          description: "イベントの追加に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    [externalEventAdd, toast],
  )

  // イベント更新のハンドラ - メモ化
  const handleEventUpdate = useCallback(
    async (event: CalendarEvent) => {
      // 外部ハンドラがある場合はそれを使用
      if (externalEventUpdate) {
        return externalEventUpdate(event)
      }

      try {
        const supabase = getSupabaseClient()

        const { error } = await supabase
          .from("shifts")
          .update({
            title: event.title,
            start_time: event.start.toISOString(),
            end_time: event.end.toISOString(),
            event_type: event.category || "general",
            notes: event.description || null,
            project_id: event.project_id === "none" ? null : event.project_id,
            staff_id: event.staff_id === "none" ? null : event.staff_id,
          })
          .eq("id", event.id)

        if (error) throw error

        // 更新されたイベントを反映
        setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))

        return event
      } catch (error) {
        console.error("イベント更新エラー:", error)
        toast({
          title: "エラー",
          description: "イベントの更新に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    [externalEventUpdate, toast],
  )

  // イベント削除のハンドラ - メモ化
  const handleEventDelete = useCallback(
    async (eventId: string | number) => {
      // 外部ハンドラがある場合はそれを使用
      if (externalEventDelete) {
        return externalEventDelete(eventId)
      }

      try {
        const supabase = getSupabaseClient()

        const { error } = await supabase.from("shifts").delete().eq("id", eventId)

        if (error) throw error

        // 削除されたイベントを反映
        setEvents((prev) => prev.filter((e) => e.id !== eventId))

        return { success: true }
      } catch (error) {
        console.error("イベント削除エラー:", error)
        toast({
          title: "エラー",
          description: "イベントの削除に失敗しました",
          variant: "destructive",
        })
        throw error
      }
    },
    [externalEventDelete, toast],
  )

  // 案件登録ページへ遷移 - メモ化
  const navigateToDealRegistration = useCallback(() => {
    if (onAddButtonClick) {
      onAddButtonClick()
    } else {
      router.push("/deals/register")
    }
  }, [router, onAddButtonClick])

  // リフレッシュハンドラ - メモ化
  const handleRefresh = useCallback(() => {
    if (externalRefresh) {
      externalRefresh()
    } else {
      setCurrentPage(1)
      fetchEvents(1, false)
    }
  }, [fetchEvents, externalRefresh])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-heading-md">{title}</CardTitle>
        {showAddButton && (
          <Button onClick={navigateToDealRegistration} className="flex items-center gap-space-2">
            <Briefcase className="h-4 w-4" />
            {addButtonText}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-space-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-space-4" />
            <p className="text-body text-muted-foreground">カレンダーデータを読み込み中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-space-8 text-destructive">
            <p className="text-body">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-space-4">
              再読み込み
            </Button>
          </div>
        ) : (
          <>
            <EnhancedCalendar
              events={events}
              onEventAdd={handleEventAdd}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
              isLoading={isLoading}
              error={error}
              categories={mainCategories}
              customFields={customFields}
              onRefresh={handleRefresh}
              timeframe={timeframe}
            />
            {/* 無限スクロールのトリガー要素 */}
            {hasMore && <div id="load-more-trigger" className="h-10 w-full" />}
          </>
        )}
      </CardContent>
    </Card>
  )
}
