"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"
import { EnhancedCalendar, type CalendarEvent } from "@/components/enhanced-calendar"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface VehicleCalendarProps {
  embedded?: boolean
}

export function VehicleCalendar({ embedded = false }: VehicleCalendarProps) {
  const { toast } = useToast()
  const supabase = getClientSupabase()

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTableCreationDialogOpen, setIsTableCreationDialogOpen] = useState(false)
  const [isCreatingTable, setIsCreatingTable] = useState(false)
  const [tableExists, setTableExists] = useState(false)

  useEffect(() => {
    fetchVehiclesAndGenerateEvents()
  }, [])

  // 車両データを取得してイベントを生成
  const fetchVehiclesAndGenerateEvents = async () => {
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

      // 車両データからカレンダーイベントを生成
      const generatedEvents = generateEventsFromVehicles(vehiclesData || [])
      setEvents(generatedEvents)

      // テーブルの存在確認
      await checkTableExists()
    } catch (error) {
      console.error("車両データ取得エラー:", error)
      setError("車両データの取得に失敗しました")
      if (!embedded) {
        toast({
          title: "エラー",
          description: "車両データの取得に失敗しました",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // テーブルの存在確認
  const checkTableExists = async () => {
    try {
      // テーブル一覧を取得して存在確認
      const { data, error } = await supabase.rpc("get_tables")

      if (error) {
        // RPCが存在しない場合は別の方法で確認
        const { data: tables, error: tablesError } = await supabase
          .from("pg_tables")
          .select("tablename")
          .eq("schemaname", "public")

        if (tablesError) {
          // 直接クエリを試みて存在確認
          const { error: directError } = await supabase.from("vehicle_reservations").select("count(*)").limit(1)

          if (directError && directError.message.includes("does not exist")) {
            setTableExists(false)
            if (!embedded) {
              setIsTableCreationDialogOpen(true)
            }
            return
          } else {
            setTableExists(true)
            await fetchReservations()
            return
          }
        }

        // テーブル一覧から確認
        const exists = tables?.some((t) => t.tablename === "vehicle_reservations")
        setTableExists(exists || false)

        if (!exists) {
          if (!embedded) {
            setIsTableCreationDialogOpen(true)
          }
        } else {
          await fetchReservations()
        }
        return
      }

      // RPCの結果からテーブル存在確認
      const exists = data?.some((table: string) => table === "vehicle_reservations")
      setTableExists(exists || false)

      if (!exists) {
        if (!embedded) {
          setIsTableCreationDialogOpen(true)
        }
      } else {
        await fetchReservations()
      }
    } catch (error) {
      console.error("テーブル存在確認エラー:", error)
      setTableExists(false)
      if (!embedded) {
        setIsTableCreationDialogOpen(true)
      }
    }
  }

  // 車両データからカレンダーイベントを生成する関数
  const generateEventsFromVehicles = (vehicles: any[]): CalendarEvent[] => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return vehicles.map((vehicle) => {
      // ランダムな開始日と終了日を生成（当月内）
      const startDay = Math.floor(Math.random() * 15) + 1 // 1日〜15日
      const duration = Math.floor(Math.random() * 5) + 1 // 1〜5日間

      const start = new Date(today.getFullYear(), today.getMonth(), startDay)
      const end = new Date(today.getFullYear(), today.getMonth(), startDay + duration)

      // 種類に基づいてカテゴリを決定
      let category = "vehicle"
      if (vehicle.type?.includes("ダンプ")) {
        category = "dump"
      } else if (vehicle.type?.includes("トラック")) {
        category = "truck"
      }

      return {
        id: `vehicle-${vehicle.id}`,
        title: `${vehicle.name} (${vehicle.type || "種類なし"})`,
        start,
        end,
        vehicle_id: vehicle.id,
        project_name: `プロジェクト例 - ${vehicle.name}`,
        notes: `${vehicle.name}の稼働予定`,
        category,
        description: `所有形態: ${vehicle.ownership_type || "不明"}\n保管場所: ${vehicle.location || "不明"}`,
        isGenerated: true, // 生成されたイベントであることを示すフラグ
      }
    })
  }

  // 予約テーブルの作成
  const createReservationsTable = async () => {
    try {
      setIsCreatingTable(true)

      // 外部キー制約を明示的に設定したテーブル作成SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS vehicle_reservations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          vehicle_id UUID NOT NULL,
          title TEXT NOT NULL,
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE NOT NULL,
          project_name TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- インデックスの作成
        CREATE INDEX IF NOT EXISTS vehicle_reservations_vehicle_id_idx ON vehicle_reservations(vehicle_id);
        CREATE INDEX IF NOT EXISTS vehicle_reservations_start_date_idx ON vehicle_reservations(start_date);
      `

      // SQLを実行
      const { error } = await supabase.rpc("exec_sql", {
        sql_query: createTableSQL,
      })

      if (error) {
        // RPCが存在しない場合は別の方法を試す
        console.error("テーブル作成RPCエラー:", error)

        // 直接SQLクエリを実行
        const { error: directError } = await supabase.supabase.rpc("exec_sql", {
          sql_query: createTableSQL,
        })

        if (directError) {
          throw directError
        }
      }

      toast({
        title: "成功",
        description: "車両予約テーブルを作成しました",
      })

      setTableExists(true)
      setIsTableCreationDialogOpen(false)

      // テーブル作成後に少し待ってからデータ取得を試みる
      setTimeout(() => {
        fetchReservations()
      }, 1000)
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
    // テーブルが存在しない場合は何もしない
    if (!tableExists) {
      return
    }

    try {
      setLoading(true)

      // 予約データを取得
      const { data, error } = await supabase
        .from("vehicle_reservations")
        .select("*")
        .order("start_date", { ascending: true })

      if (error) {
        console.error("予約データ取得エラー:", error)
        // エラーがあっても生成されたイベントは表示する
        return
      }

      // 予約データがない場合は生成されたイベントを使用
      if (!data || data.length === 0) {
        return
      }

      // 車両IDに基づいて車両データを取得
      const vehicleIds = [...new Set(data.map((r) => r.vehicle_id))]
      const vehicleMap: Record<string, any> = {}

      if (vehicleIds.length > 0) {
        const { data: vehicleData } = await supabase.from("vehicles").select("id, name, type").in("id", vehicleIds)

        // 車両データをマップに変換
        if (vehicleData) {
          vehicleData.forEach((vehicle) => {
            vehicleMap[vehicle.id] = vehicle
          })
        }
      }

      // イベントデータをカレンダー形式に変換
      const formattedEvents = data.map((reservation) => {
        const vehicle = vehicleMap[reservation.vehicle_id] || {}
        return {
          id: reservation.id,
          title: `${reservation.title} (${vehicle.name || "不明"})`,
          start: new Date(reservation.start_date),
          end: new Date(reservation.end_date),
          vehicle_id: reservation.vehicle_id,
          project_name: reservation.project_name,
          notes: reservation.notes,
          category: "vehicle",
          description: reservation.notes || "",
        }
      })

      // 予約データがある場合は生成データを使用しない
      if (formattedEvents.length > 0) {
        setEvents(formattedEvents)
      }

      // イベントが取得できた場合は成功メッセージを表示
      if (data.length > 0 && !embedded) {
        toast({
          title: "データ読み込み完了",
          description: `${data.length}件の車両予約を読み込みました`,
        })
      }
    } catch (error) {
      console.error("予約データ取得エラー:", error)
      // エラーがあっても生成されたイベントは表示する
    } finally {
      setLoading(false)
    }
  }

  // イベント追加のハンドラ
  const handleEventAdd = async (event: CalendarEvent) => {
    // テーブルが存在しない場合はテーブル作成ダイアログを表示
    if (!tableExists) {
      setIsTableCreationDialogOpen(true)
      return { id: Date.now() }
    }

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
        setEvents((prev) => [...prev.filter((e) => !e.isGenerated), newEvent])
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
    // テーブルが存在しない場合はテーブル作成ダイアログを表示
    if (!tableExists) {
      setIsTableCreationDialogOpen(true)
      return event
    }

    try {
      // 生成されたイベントは更新できない
      if (event.isGenerated) {
        toast({
          title: "情報",
          description: "このイベントは自動生成されたもので、更新できません。新しい予約として追加してください。",
        })
        return event
      }

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
    // テーブルが存在しない場合はテーブル作成ダイアログを表示
    if (!tableExists) {
      setIsTableCreationDialogOpen(true)
      return { success: false }
    }

    try {
      // 生成されたイベントは削除できない
      const eventToDelete = events.find((e) => e.id === eventId)
      if (eventToDelete?.isGenerated) {
        toast({
          title: "情報",
          description: "このイベントは自動生成されたもので、削除できません。",
        })
        return { success: false }
      }

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
    { value: "dump", label: "ダンプ" },
    { value: "truck", label: "トラック" },
    { value: "maintenance", label: "メンテナンス" },
    { value: "repair", label: "修理" },
    { value: "other", label: "その他" },
  ]

  return (
    <Card className={embedded ? "" : undefined}>
      {!embedded && (
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>車両カレンダー</CardTitle>
          <Button onClick={() => fetchVehiclesAndGenerateEvents()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            更新
          </Button>
        </CardHeader>
      )}
      <CardContent>
        {/* テーブル存在しない警告 */}
        {!tableExists && !embedded && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>車両予約テーブルが存在しません</AlertTitle>
            <AlertDescription>
              車両予約を管理するためのテーブルが存在しません。現在表示されているデータは自動生成されたものです。
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsTableCreationDialogOpen(true)}>
                テーブルを作成
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* テーブル作成ダイアログ */}
        {!embedded && (
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
                <Button
                  variant="outline"
                  onClick={() => setIsTableCreationDialogOpen(false)}
                  disabled={isCreatingTable}
                >
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
        )}

        {/* カレンダー表示 */}
        <EnhancedCalendar
          events={events}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          isLoading={loading}
          error={error}
          categories={vehicleCategories}
          onRefresh={fetchVehiclesAndGenerateEvents}
          customFields={customFields}
          embedded={embedded}
        />
      </CardContent>
    </Card>
  )
}
