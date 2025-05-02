"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { EnhancedCalendar, type CalendarEvent } from "@/components/enhanced-calendar"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function VehicleCalendar() {
  const { toast } = useToast()
  const supabase = getClientSupabase()

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
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

      // 車両データを取得
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("*")
        .order("name", { ascending: true })

      if (vehiclesError) throw vehiclesError
      setVehicles(vehiclesData || [])

      // 車両予約テーブルの存在確認
      const { error: tableCheckError } = await supabase
        .from("vehicle_reservations")
        .select("count(*)")
        .limit(1)
        .single()

      // テーブルが存在しない場合
      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        setError("車両予約テーブルが存在しません。テーブルを作成してください。")
        setIsTableCreationDialogOpen(true)
        return
      }

      // 予約データを取得
      await fetchReservations()
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

      const { error } = await supabase.rpc("create_vehicle_reservations_table")

      if (error) {
        // RPCが存在しない場合は直接SQLを実行
        const { error: sqlError } = await supabase.supabase.rpc("exec_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS vehicle_reservations (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
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
          throw sqlError
        }
      }

      toast({
        title: "成功",
        description: "車両予約テーブルを作成しました",
      })

      setIsTableCreationDialogOpen(false)
      await fetchReservations()
    } catch (error) {
      console.error("テーブル作成エラー:", error)
      toast({
        title: "エラー",
        description: "テーブルの作成に失敗しました",
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

      const { data, error } = await supabase
        .from("vehicle_reservations")
        .select("*, vehicles(name, type)")
        .order("start_date", { ascending: true })

      if (error) throw error

      // イベントデータをカレンダー形式に変換
      const formattedEvents = (data || []).map((reservation) => ({
        id: reservation.id,
        title: `${reservation.title} (${reservation.vehicles?.name || "不明"})`,
        start: new Date(reservation.start_date),
        end: new Date(reservation.end_date),
        vehicle_id: reservation.vehicle_id,
        project_name: reservation.project_name,
        notes: reservation.notes,
        category: "vehicle",
        description: reservation.notes || "",
      }))

      setEvents(formattedEvents)

      // イベントが取得できた場合は成功メッセージを表示
      if (data && data.length > 0) {
        toast({
          title: "データ読み込み完了",
          description: `${data.length}件の車両予約を読み込みました`,
        })
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
      // 車両IDが選択されていない場合はエラー
      if (!event.vehicle_id) {
        toast({
          title: "入力エラー",
          description: "車両を選択してください",
          variant: "destructive",
        })
        throw new Error("車両が選択されていません")
      }

      // 車両の情報を取得
      const selectedVehicle = vehicles.find((v) => v.id === event.vehicle_id)
      const vehicleName = selectedVehicle ? selectedVehicle.name : "不明"

      // タイトルがない場合は車両名をタイトルにする
      const title = event.title || `${vehicleName}の予約`

      const { data, error } = await supabase
        .from("vehicle_reservations")
        .insert({
          vehicle_id: event.vehicle_id,
          title: title,
          start_date: event.start.toISOString(),
          end_date: event.end.toISOString(),
          project_name: event.project_name || null,
          notes: event.description || null,
        })
        .select()

      if (error) throw error

      // 新しいイベントを追加
      if (data && data[0]) {
        const newEvent = {
          ...event,
          id: data[0].id,
          title: `${title} (${vehicleName})`,
        }
        setEvents((prev) => [...prev, newEvent])
        return newEvent
      }

      return { id: Date.now() }
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
      // 車両の情報を取得
      const selectedVehicle = vehicles.find((v) => v.id === event.vehicle_id)
      const vehicleName = selectedVehicle ? selectedVehicle.name : "不明"

      // タイトルがない場合は車両名をタイトルにする
      const title = event.title.replace(/ $$.*$$/, "") || `${vehicleName}の予約`

      const { error } = await supabase
        .from("vehicle_reservations")
        .update({
          vehicle_id: event.vehicle_id,
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
        title: `${title} (${vehicleName})`,
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
      const { error } = await supabase.from("vehicle_reservations").delete().eq("id", eventId)

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
  const customFields = [
    {
      name: "vehicle_id",
      label: "車両",
      type: "select",
      options: vehicles.map((v) => ({ value: v.id, label: `${v.name} (${v.type || "種類なし"})` })),
      required: true,
    },
    {
      name: "project_name",
      label: "プロジェクト名",
      type: "text",
    },
  ]

  // 車両カレンダーのカテゴリ
  const vehicleCategories = [
    { value: "vehicle", label: "車両" },
    { value: "maintenance", label: "メンテナンス" },
    { value: "repair", label: "修理" },
    { value: "other", label: "その他" },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>車両カレンダー</CardTitle>
        <Button onClick={() => fetchReservations()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          更新
        </Button>
      </CardHeader>
      <CardContent>
        {/* テーブル作成ダイアログ */}
        <Dialog open={isTableCreationDialogOpen} onOpenChange={setIsTableCreationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>車両予約テーブルの作成</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">
                車両予約を管理するためのテーブルが存在しません。カレンダー機能を使用するには、テーブルを作成する必要があります。
              </p>
              <p className="text-sm text-muted-foreground">
                「テーブルを作成」ボタンをクリックすると、必要なテーブルが自動的に作成されます。
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTableCreationDialogOpen(false)} disabled={isCreatingTable}>
                キャンセル
              </Button>
              <Button onClick={createReservationsTable} disabled={isCreatingTable}>
                {isCreatingTable ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                テーブルを作成
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* カレンダー表示 */}
        <EnhancedCalendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          isLoading={loading}
          error={error}
          categories={vehicleCategories}
          onRefresh={fetchReservations}
          customFields={customFields}
        />
      </CardContent>
    </Card>
  )
}
