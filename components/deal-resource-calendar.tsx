"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Loader2, AlertCircle, Users, Truck, Car, Package } from "lucide-react"
import { EnhancedCalendar, type CalendarEvent } from "@/components/enhanced-calendar"
import { toast } from "@/components/ui/use-toast"

type ResourceType = "all" | "staff" | "machinery" | "vehicles" | "tools"

export function DealResourceCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resourceType, setResourceType] = useState<ResourceType>("all")
  const [resourceFilter, setResourceFilter] = useState<string>("all")
  const [resources, setResources] = useState<{
    staff: any[]
    machinery: any[]
    vehicles: any[]
    tools: any[]
  }>({
    staff: [],
    machinery: [],
    vehicles: [],
    tools: [],
  })

  useEffect(() => {
    fetchDealsAndResources()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [resourceType, resourceFilter])

  async function fetchDealsAndResources() {
    try {
      setLoading(true)
      const supabase = getClientSupabase()

      // 案件データを取得
      const { data: dealsData, error: dealsError } = await supabase.from("deals").select("*")

      if (dealsError) throw dealsError

      // リソースデータを取得
      const { data: staffData } = await supabase.from("staff").select("*")
      const { data: machineryData } = await supabase.from("heavy_machinery").select("*")
      const { data: vehiclesData } = await supabase.from("vehicles").select("*")
      const { data: toolsData } = await supabase.from("tools").select("*")

      setResources({
        staff: staffData || [],
        machinery: machineryData || [],
        vehicles: vehiclesData || [],
        tools: toolsData || [],
      })

      // 案件のイベントを作成
      const dealEvents: CalendarEvent[] =
        dealsData?.map((deal) => ({
          id: `deal-${deal.id}`,
          title: deal.name,
          start: new Date(deal.start_date),
          end: deal.end_date ? new Date(deal.end_date) : new Date(deal.start_date),
          description: deal.description || "",
          category: "deal",
          dealId: deal.id,
          resourceType: "deal",
        })) || []

      // 各リソースの割り当てイベントを取得
      const resourceEvents = await fetchResourceEvents(supabase, dealsData || [])

      // すべてのイベントを結合
      setEvents([...dealEvents, ...resourceEvents])
    } catch (err: any) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました。")
      toast({
        title: "エラー",
        description: "カレンダーデータの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchResourceEvents(supabase: any, deals: any[]) {
    const resourceEvents: CalendarEvent[] = []

    // スタッフの割り当てイベント
    const { data: staffAssignments } = await supabase
      .from("deal_staff")
      .select("*, staff:staff_id(id, full_name), deal:deal_id(name)")
      .not("start_date", "is", null)

    if (staffAssignments) {
      for (const assignment of staffAssignments) {
        if (assignment.start_date) {
          resourceEvents.push({
            id: `staff-${assignment.id}`,
            title: `${assignment.staff?.full_name} - ${assignment.deal?.name}`,
            start: new Date(assignment.start_date),
            end: assignment.end_date ? new Date(assignment.end_date) : new Date(assignment.start_date),
            description: `スタッフ: ${assignment.staff?.full_name}`,
            category: "staff",
            dealId: assignment.deal_id,
            resourceId: assignment.staff_id,
            resourceType: "staff",
          })
        }
      }
    }

    // 重機の割り当てイベント
    const { data: machineryAssignments } = await supabase
      .from("deal_machinery")
      .select("*, machinery:machinery_id(id, name), deal:deal_id(name)")
      .not("start_date", "is", null)

    if (machineryAssignments) {
      for (const assignment of machineryAssignments) {
        if (assignment.start_date) {
          resourceEvents.push({
            id: `machinery-${assignment.id}`,
            title: `${assignment.machinery?.name} - ${assignment.deal?.name}`,
            start: new Date(assignment.start_date),
            end: assignment.end_date ? new Date(assignment.end_date) : new Date(assignment.start_date),
            description: `重機: ${assignment.machinery?.name}`,
            category: "machinery",
            dealId: assignment.deal_id,
            resourceId: assignment.machinery_id,
            resourceType: "machinery",
          })
        }
      }
    }

    // 車両の割り当てイベント
    const { data: vehicleAssignments } = await supabase
      .from("deal_vehicles")
      .select("*, vehicle:vehicle_id(id, name), deal:deal_id(name)")
      .not("start_date", "is", null)

    if (vehicleAssignments) {
      for (const assignment of vehicleAssignments) {
        if (assignment.start_date) {
          resourceEvents.push({
            id: `vehicle-${assignment.id}`,
            title: `${assignment.vehicle?.name} - ${assignment.deal?.name}`,
            start: new Date(assignment.start_date),
            end: assignment.end_date ? new Date(assignment.end_date) : new Date(assignment.start_date),
            description: `車両: ${assignment.vehicle?.name}`,
            category: "vehicle",
            dealId: assignment.deal_id,
            resourceId: assignment.vehicle_id,
            resourceType: "vehicles",
          })
        }
      }
    }

    // 備品の割り当てイベント
    const { data: toolAssignments } = await supabase
      .from("deal_tools")
      .select("*, tool:tool_id(id, name), deal:deal_id(name)")
      .not("start_date", "is", null)

    if (toolAssignments) {
      for (const assignment of toolAssignments) {
        if (assignment.start_date) {
          resourceEvents.push({
            id: `tool-${assignment.id}`,
            title: `${assignment.tool?.name} - ${assignment.deal?.name}`,
            start: new Date(assignment.start_date),
            end: assignment.end_date ? new Date(assignment.end_date) : new Date(assignment.start_date),
            description: `備品: ${assignment.tool?.name}`,
            category: "tool",
            dealId: assignment.deal_id,
            resourceId: assignment.tool_id,
            resourceType: "tools",
          })
        }
      }
    }

    return resourceEvents
  }

  function filterEvents() {
    if (resourceType === "all" && resourceFilter === "all") {
      fetchDealsAndResources()
      return
    }

    fetchDealsAndResources().then(() => {
      setEvents((prev) => {
        return prev.filter((event) => {
          if (resourceType !== "all" && event.resourceType !== resourceType) {
            return false
          }

          if (resourceFilter !== "all" && event.resourceId !== resourceFilter) {
            return false
          }

          return true
        })
      })
    })
  }

  function getResourceOptions() {
    switch (resourceType) {
      case "staff":
        return resources.staff.map((item) => ({
          value: item.id,
          label: item.full_name,
        }))
      case "machinery":
        return resources.machinery.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      case "vehicles":
        return resources.vehicles.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      case "tools":
        return resources.tools.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      default:
        return []
    }
  }

  const categories = [
    { value: "deal", label: "案件" },
    { value: "staff", label: "スタッフ" },
    { value: "machinery", label: "重機" },
    { value: "vehicle", label: "車両" },
    { value: "tool", label: "備品" },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">データ取得エラー</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => fetchDealsAndResources()} className="mt-4">
            再読み込み
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>リソースカレンダー</CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={resourceType}
            onValueChange={(value) => {
              setResourceType(value as ResourceType)
              setResourceFilter("all")
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="リソースタイプ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="flex items-center gap-2">
                すべてのリソース
              </SelectItem>
              <SelectItem value="staff" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                スタッフ
              </SelectItem>
              <SelectItem value="machinery" className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-500" />
                重機
              </SelectItem>
              <SelectItem value="vehicles" className="flex items-center gap-2">
                <Car className="h-4 w-4 text-green-500" />
                車両
              </SelectItem>
              <SelectItem value="tools" className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-500" />
                備品
              </SelectItem>
            </SelectContent>
          </Select>

          {resourceType !== "all" && (
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="リソース選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {getResourceOptions().map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setResourceType("all")
              setResourceFilter("all")
              fetchDealsAndResources()
            }}
          >
            リセット
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <EnhancedCalendar
          events={events}
          isLoading={loading}
          error={error}
          categories={categories}
          onRefresh={fetchDealsAndResources}
          readOnly={true}
        />
      </CardContent>
    </Card>
  )
}
