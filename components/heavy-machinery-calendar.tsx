"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import type { CalendarEvent } from "@/components/enhanced-calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import { CalendarView } from "@/components/calendar-view"
import type { CalendarCustomField } from "@/types/calendar"

export function HeavyMachineryCalendar() {
  const { toast } = useToast()
  const supabase = getClientSupabase()

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [machinery, setMachinery] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTableCreationDialogOpen, setIsTableCreationDialogOpen] = useState(false)
  const [isCreatingTable, setIsCreatingTable] = useState(false)

  useEffect(() => {
    checkTableAndFetchEvents()
  }, [])

  // テーブルの存在確認とイベント取得
  const checkTableAndFetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      // 重機データを取得
      const { data: machineryData, error: machineryError } = await supabase
        .from("heavy_machinery")
        .select("*")
        .order("name", { ascending: true })

      if (machineryError) throw machineryError
      setMachinery(machineryData || [])

      try {
        // 重機予約テーブルの存在確認
        const { error: tableCheckError } = await supabase.from("machinery_reservations").select("count(*)").limit(1)

        // テーブルが存在する場合は予約データを取得
        if (!tableCheckError) {
          await fetchReservations()
        } else {
          // テーブルが存在しない場合
          console.log("重機予約テーブルが存在しません。テーブルを作成します。")
          setError("重機予約テーブルが存在しません。テーブルを作成してください。")
          setIsTableCreationDialogOpen(true)
        }
      } catch (tableError) {
        console.error("テーブル確認エラー:", tableError)
        setError("重機予約テーブルが存在しません。テーブルを作成してください。")
        setIsTableCreationDialogOpen(true)
      }
    } catch (error) {
      console.error("データ取得エラー:", error)
      setError("データの取得に失敗しました")
      toast({
        title: "エラー",
        description: "データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 予約テーブルの作成
  const createReservationsTable = async () => {
    try {
      setIsCreatingTable(true)

      // 直接SQLを実行してテーブルを作成
      const { error: sqlError } = await supabase.rpc("exec_sql", {
        sql_query: `
        CREATE TABLE IF NOT EXISTS machinery_reservations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          machinery_id UUID NOT NULL,
          title TEXT NOT NULL,
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE NOT NULL,
          project_name TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      })

      if (sqlError) {
        // RPCが存在しない場合は別の方法でテーブルを作成
        console.error("テーブル作成エラー (RPC):", sqlError)

        // 代替方法: サーバーサイドAPIを使用してテーブルを作成
        const response = await fetch("/api/create-machinery-table", {
          method: "POST",
        })

        if (!response.ok) {
          throw new Error("APIによるテーブル作成に失敗しました")
        }
      }

      toast({
        title: "成功",
        description: "重機予約テーブルを作成しました",
      })

      setIsTableCreationDialogOpen(false)
      await fetchReservations()
    } catch (error) {
      console.error("テーブル作成エラー:", error)
      toast({
        title: "エラー",
        description: "テーブルの作成に失敗しました。管理者に連絡してください。",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTable(false)
    }
  }

  // 予約データの取得
  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)

      // テーブルの存在確認
      try {
        const { data: reservationsData, error: reservationsError } = await supabase
          .from("machinery_reservations")
          .select("*")
          .order("start_date", { ascending: true })

        if (reservationsError) {
          // テーブルが存在しない場合
          if (reservationsError.message.includes("does not exist")) {
            setError("重機予約テーブルが存在しません。テーブルを作成してください。")
            setIsTableCreationDialogOpen(true)
            return
          }
          throw reservationsError
        }

        // 予約データを取得した後、重機IDのリストを作成
        const machineryIds = [...new Set(reservationsData.map((r) => r.machinery_id))].filter(Boolean)

        // 重機データを別途取得
        let machineryMap = {}
        if (machineryIds.length > 0) {
          const { data: machineryData, error: machineryError } = await supabase
            .from("heavy_machinery")
            .select("id, name, type")
            .in("id", machineryIds)

          if (machineryError) throw machineryError

          // 重機データをマップ形式に変換
          machineryMap = (machineryData || []).reduce((acc, item) => {
            acc[item.id] = item
            return acc
          }, {})
        }

        // 予約データと重機データを結合
        const data = reservationsData.map((reservation) => ({
          ...reservation,
          heavy_machinery: machineryMap[reservation.machinery_id] || { name: "不明", type: "不明" },
        }))

        // イベントデータをカレンダー形式に変換
        const formattedEvents = (data || []).map((reservation) => ({
          id: reservation.id,
          title: `${reservation.title} (${reservation.heavy_machinery?.name || "不明"})`,
          start: new Date(reservation.start_date),
          end: new Date(reservation.end_date),
          machinery_id: reservation.machinery_id,
          project_name: reservation.project_name,
          notes: reservation.notes,
          category: "machinery",
          description: reservation.notes || "",
        }))

        setEvents(formattedEvents)

        // イベントが取得できた場合は成功メッセージを表示
        if (data && data.length > 0) {
          toast({
            title: "データ読み込み完了",
            description: `${data.length}件の重機予約を読み込みました`,
          })
        }
      } catch (error) {
        if (error.message && error.message.includes("does not exist")) {
          setError("重機予約テーブルが存在しません。テーブルを作成してください。")
          setIsTableCreationDialogOpen(true)
          return
        }
        throw error
      }
    } catch (error) {
      console.error("予約データ取得エラー:", error)
      setError("予約データの取得に失敗しました")
      toast({
        title: "エラー",
        description: "予約データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // イベント追加のハンドラ
  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      // 重機IDが選択されていない場合はエラー
      if (!event.machinery_id) {
        toast({
          title: "入力エラー",
          description: "重機を選択してください",
          variant: "destructive",
        })
        throw new Error("重機が選択されていません")
      }

      // 重機の情報を取得
      const selectedMachinery = machinery.find((m) => m.id === event.machinery_id)
      const machineryName = selectedMachinery ? selectedMachinery.name : "不明"

      // タイトルがない場合は重機名をタイトルにする
      const title = event.title || `${machineryName}の予約`

      const { data: insertedData, error: insertError } = await supabase
        .from("machinery_reservations")
        .insert({
          machinery_id: event.machinery_id,
          title: title,
          start_date: event.start.toISOString(),
          end_date: event.end.toISOString(),
          project_name: event.project_name || null,
          notes: event.description || null,
        })
        .select()

      if (insertError) throw insertError

      // 挿入されたデータに重機情報を追加
      const data = insertedData.map((item) => ({
        ...item,
        heavy_machinery: selectedMachinery
          ? { name: selectedMachinery.name, type: selectedMachinery.type }
          : { name: "不明", type: "不明" },
      }))

      // 新しいイベントを追加
      if (data && data[0]) {
        const newEvent = {
          ...event,
          id: data[0].id,
          title: `${title} (${machineryName})`,
        }
        setEvents((prev) => [...prev, newEvent])
        return newEvent
      }

      return { id: Date.now() } as CalendarEvent
    } catch (error) {
      console.error("予約追加エラー:", error)
      toast({
        title: "エラー",
        description: "予約の追加に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  // イベント更新のハンドラ
  const handleEventUpdate = async (event: CalendarEvent) => {
    try {
      // 重機の情報を取得
      const selectedMachinery = machinery.find((m) => m.id === event.machinery_id)
      const machineryName = selectedMachinery ? selectedMachinery.name : "不明"

      // タイトルがない場合は重機名をタイトルにする
      const title = event.title.replace(/ $$.*$$$/, "") || `${machineryName}の予約`

      const { error } = await supabase
        .from("machinery_reservations")
        .update({
          machinery_id: event.machinery_id,
          title: title,
          start_date: event.start.toISOString(),
          end_date: event.end.toISOString(),
          project_name: event.project_name || null,
          notes: event.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id)

      if (error) throw error

      // 更新されたイベントを反映
      const updatedEvent = {
        ...event,
        title: `${title} (${machineryName})`,
      }
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updatedEvent : e)))

      return updatedEvent
    } catch (error) {
      console.error("予約更新エラー:", error)
      toast({
        title: "エラー",
        description: "予約の更新に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  // イベント削除のハンドラ
  const handleEventDelete = async (eventId: string | number) => {
    try {
      const { error } = await supabase.from("machinery_reservations").delete().eq("id", eventId)

      if (error) throw error

      // 削除されたイベントを反映
      setEvents((prev) => prev.filter((e) => e.id !== eventId))

      return { success: true }
    } catch (error) {
      console.error("予約削除エラー:", error)
      toast({
        title: "エラー",
        description: "予約の削除に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  // カレンダーのカスタムフィールド定義
  const customFields: CalendarCustomField[] = [
    {
      name: "machinery_id",
      label: "重機",
      type: "select",
      options: machinery.map((m) => ({ value: m.id, label: `${m.name} (${m.type || "種類なし"})` })),
      required: true,
    },
    {
      name: "project_name",
      label: "プロジェクト名",
      type: "text",
    },
  ]

  // 重機カレンダーのカテゴリ
  const machineryCategories = [
    { value: "machinery", label: "重機" },
    { value: "maintenance", label: "メンテナンス" },
    { value: "repair", label: "修理" },
    { value: "other", label: "その他" },
  ]

  return (
    <>
      {/* テーブル作成ダイアログ */}
      <Dialog open={isTableCreationDialogOpen} onOpenChange={setIsTableCreationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重機予約テーブルの作成</DialogTitle>
          </DialogHeader>
          <div className="py-space-4">
            <p className="mb-space-4 text-body">
              重機予約を管理するためのテーブルが存在しません。カレンダー機能を使用するには、テーブルを作成する必要があります。
            </p>
            <p className="text-caption text-muted-foreground">
              「テーブルを作成」ボタンをクリックすると、必要なテーブルが自動的に作成されます。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTableCreationDialogOpen(false)} disabled={isCreatingTable}>
              キャンセル
            </Button>
            <Button onClick={createReservationsTable} disabled={isCreatingTable}>
              {isCreatingTable ? (
                <Loader2 className="mr-space-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-space-2 h-4 w-4" />
              )}
              テーブルを作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* カレンダー表示 */}
      <CalendarView
        title="重機カレンダー"
        showAddButton={false}
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        isLoading={loading}
        error={error}
        categories={machineryCategories}
        onRefresh={fetchReservations}
        customFields={customFields}
      />
    </>
  )
}
