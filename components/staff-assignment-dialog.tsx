"use client"

import { useState, useEffect } from "react"
import { Briefcase, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { createMultipleAssignmentEvent, updateCalendarEvent, deleteCalendarEvent } from "@/actions/calendar-events"
import { getClientSupabaseInstance } from "@/lib/supabase/supabaseClient"

interface StaffAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventData: any | null
  onEventAdd?: (event: any) => void
  onEventUpdate?: (event: any) => void
  onEventDelete?: (eventId: string) => void
  projects?: any[]
  staff?: any[]
  resources?: any[]
}

export function StaffAssignmentDialog({
  open,
  onOpenChange,
  eventData,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  projects = [],
  staff = [],
  resources = [],
}: StaffAssignmentDialogProps) {
  console.log("StaffAssignmentDialog: レンダリング", { open, eventData })

  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [description, setDescription] = useState("")
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [isNewEvent, setIsNewEvent] = useState(true)
  const [activeTab, setActiveTab] = useState("staff")
  const [isLoading, setIsLoading] = useState(false)
  const [searchStaff, setSearchStaff] = useState("")
  const [searchResources, setSearchResources] = useState("")
  const [dataLoading, setDataLoading] = useState(false)
  const [staffData, setStaffData] = useState<any[]>([])
  const [resourceData, setResourceData] = useState<any[]>([])
  const [heavyMachineryData, setHeavyMachineryData] = useState<any[]>([])
  const [vehicleData, setVehicleData] = useState<any[]>([])
  const [toolData, setToolData] = useState<any[]>([])
  const [selectedHeavyMachinery, setSelectedHeavyMachinery] = useState<string[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [searchHeavyMachinery, setSearchHeavyMachinery] = useState("")
  const [searchVehicles, setSearchVehicles] = useState("")
  const [searchTools, setSearchTools] = useState("")

  // Reset form when dialog opens/closes or eventData changes
  useEffect(() => {
    if (open && eventData) {
      // Editing existing event
      setIsNewEvent(false)
      setTitle(eventData.title || "")

      const start = eventData.start ? new Date(eventData.start) : new Date()
      const end = eventData.end ? new Date(eventData.end) : new Date()

      setStartDate(formatDateForInput(start))
      setStartTime(formatTimeForInput(start))
      setEndDate(formatDateForInput(end))
      setEndTime(formatTimeForInput(end))

      setDescription(eventData.description || eventData.notes || "")
      setSelectedProject(eventData.project_id || eventData.projectId || "")

      // Handle staff selection
      if (eventData.staff_id) {
        setSelectedStaff([eventData.staff_id])
      } else if (eventData.staffIds) {
        setSelectedStaff(eventData.staffIds)
      } else {
        setSelectedStaff([])
      }

      // Handle resource selection
      if (eventData.resource_id) {
        setSelectedResources([eventData.resource_id])
      } else if (eventData.toolIds) {
        setSelectedResources(eventData.toolIds)
      } else {
        setSelectedResources([])
      }

      // Handle heavy machinery selection
      if (eventData.heavy_machinery_id) {
        setSelectedHeavyMachinery([eventData.heavy_machinery_id])
      } else if (eventData.heavyMachineryIds) {
        setSelectedHeavyMachinery(eventData.heavyMachineryIds)
      } else {
        setSelectedHeavyMachinery([])
      }

      // Handle vehicle selection
      if (eventData.vehicle_id) {
        setSelectedVehicles([eventData.vehicle_id])
      } else if (eventData.vehicleIds) {
        setSelectedVehicles(eventData.vehicleIds)
      } else {
        setSelectedVehicles([])
      }

      // Handle tool selection
      if (eventData.tool_id) {
        setSelectedTools([eventData.tool_id])
      } else if (eventData.toolIds) {
        setSelectedTools(eventData.toolIds)
      } else {
        setSelectedTools([])
      }
    } else if (open) {
      // Creating new event from selected slot
      setIsNewEvent(true)
      setTitle("")

      const start = eventData?.start ? new Date(eventData.start) : new Date()
      const end = eventData?.end ? new Date(eventData.end) : new Date()

      // Set default times to 8:00-17:00 if no specific time was selected
      if (!eventData?.start) {
        start.setHours(8, 0, 0, 0)
        end.setHours(17, 0, 0, 0)
      } else {
        // If a specific time was selected, keep that time but ensure end time is at least 1 hour later
        if (end.getTime() - start.getTime() < 3600000) {
          end.setTime(start.getTime() + 3600000)
        }
      }

      setStartDate(formatDateForInput(start))
      setStartTime(formatTimeForInput(start))
      setEndDate(formatDateForInput(end))
      setEndTime(formatTimeForInput(end))

      setDescription("")
      setSelectedProject("")
      setSelectedStaff([])
      setSelectedResources([])
      setSelectedHeavyMachinery([])
      setSelectedVehicles([])
      setSelectedTools([])
    }
  }, [open, eventData])

  // Load staff and resources data if not provided
  useEffect(() => {
    const loadData = async () => {
      if (open) {
        setDataLoading(true)
        console.log("データ取得開始 - ダイアログが開かれました", { open })
        try {
          const supabase = getClientSupabaseInstance()

          console.log("Supabaseインスタンス取得完了", { supabase })
          console.log("スタッフデータ取得開始")

          // Always load fresh staff data
          const { data: staffData, error: staffError } = await supabase
            .from("staff")
            .select("*")
            .order("full_name", { ascending: true })

          console.log("スタッフデータ取得結果:", { staffData, staffError })

          if (staffError) throw new Error(`スタッフ取得エラー: ${staffError.message}`)
          if (staffData && staffData.length > 0) {
            console.log("スタッフデータをステートにセット:", staffData)
            setStaffData(staffData)
          }

          // Always load fresh resource data
          const { data: resourceData, error: resourceError } = await supabase
            .from("resources")
            .select("*")
            .order("name", { ascending: true })

          if (resourceError) throw new Error(`リソース取得エラー: ${resourceError.message}`)
          if (resourceData && resourceData.length > 0) {
            setResourceData(resourceData)
          }

          // Load heavy machinery data
          const { data: heavyData, error: heavyError } = await supabase
            .from("heavy_machinery")
            .select("*")
            .order("name", { ascending: true })

          if (heavyError) throw new Error(`重機取得エラー: ${heavyError.message}`)
          if (heavyData && heavyData.length > 0) {
            setHeavyMachineryData(heavyData)
          }

          // Load vehicle data
          const { data: vehicleData, error: vehicleError } = await supabase
            .from("vehicles")
            .select("*")
            .order("name", { ascending: true })

          if (vehicleError) throw new Error(`車両取得エラー: ${vehicleError.message}`)
          if (vehicleData && vehicleData.length > 0) {
            setVehicleData(vehicleData)
          }

          // Load tool data
          const { data: toolData, error: toolError } = await supabase
            .from("tools")
            .select("*")
            .order("name", { ascending: true })

          if (toolError) throw new Error(`備品取得エラー: ${toolError.message}`)
          if (toolData && toolData.length > 0) {
            setToolData(toolData)
          }
        } catch (error) {
          console.error("データ読み込みエラー:", error)
          toast({
            title: "データ読み込みエラー",
            description: error instanceof Error ? error.message : "データの読み込みに失敗しました",
            variant: "destructive",
          })
        } finally {
          setDataLoading(false)
        }
      }
    }

    loadData()
  }, [open, toast])

  // useEffectを追加してopenの変更を監視
  useEffect(() => {
    console.log("StaffAssignmentDialog: open状態が変更されました", { open })
  }, [open])

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  // Format time for input field (HH:MM)
  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5)
  }

  // Filter staff based on search
  const filteredStaff = dataLoading
    ? []
    : (staffData.length > 0 ? staffData : staff).filter(
        (s) =>
          s.name?.toLowerCase().includes(searchStaff.toLowerCase()) ||
          s.full_name?.toLowerCase().includes(searchStaff.toLowerCase()),
      )

  console.log("フィルタリング後のスタッフデータ:", {
    dataLoading,
    staffDataLength: staffData.length,
    propsStaffLength: staff?.length || 0,
    filteredStaffLength: filteredStaff.length,
    searchTerm: searchStaff,
    filteredStaff,
  })

  // Filter resources based on search
  const filteredResources = dataLoading
    ? []
    : (resourceData.length > 0 ? resourceData : resources).filter((r) =>
        r.name?.toLowerCase().includes(searchResources.toLowerCase()),
      )

  // Filter heavy machinery based on search
  const filteredHeavyMachinery = dataLoading
    ? []
    : heavyMachineryData.filter(
        (h) =>
          h.name?.toLowerCase().includes(searchHeavyMachinery.toLowerCase()) ||
          h.type?.toLowerCase().includes(searchHeavyMachinery.toLowerCase()),
      )

  // Filter vehicles based on search
  const filteredVehicles = dataLoading
    ? []
    : vehicleData.filter(
        (v) =>
          v.name?.toLowerCase().includes(searchVehicles.toLowerCase()) ||
          v.type?.toLowerCase().includes(searchVehicles.toLowerCase()),
      )

  // Filter tools based on search
  const filteredTools = dataLoading
    ? []
    : toolData.filter(
        (t) =>
          t.name?.toLowerCase().includes(searchTools.toLowerCase()) ||
          t.storage_location?.toLowerCase().includes(searchTools.toLowerCase()),
      )

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true)

      // Create start and end dates from the form inputs
      const start = new Date(`${startDate}T${startTime}`)
      const end = new Date(`${endDate}T${endTime}`)

      // Determine event type based on selections
      let eventType: "project" | "staff" | "tool" | "general" = "general"
      if (selectedProject) eventType = "project"
      if (selectedStaff.length > 0) eventType = "staff"
      if (selectedResources.length > 0) eventType = "tool"

      if (isNewEvent) {
        // Create new event
        const result = await createMultipleAssignmentEvent({
          title,
          start_time: start,
          end_time: end,
          notes: description,
          project_id: selectedProject || undefined,
          staff_ids: selectedStaff.length > 0 ? selectedStaff : undefined,
          resource_ids: selectedResources.length > 0 ? selectedResources : undefined,
          heavy_machinery_ids: selectedHeavyMachinery.length > 0 ? selectedHeavyMachinery : undefined,
          vehicle_ids: selectedVehicles.length > 0 ? selectedVehicles : undefined,
          tool_ids: selectedTools.length > 0 ? selectedTools : undefined,
          event_type: eventType,
        })

        if (!result.success) {
          throw new Error(result.error || "イベントの作成に失敗しました")
        }

        toast({
          title: "イベントを作成しました",
          description: "カレンダーに新しいイベントが追加されました",
        })

        if (onEventAdd) {
          onEventAdd({
            id: result.id,
            title,
            start,
            end,
            description,
            project_id: selectedProject,
            staff_ids: selectedStaff,
            resource_ids: selectedResources,
          })
        }
      } else {
        // Update existing event
        const result = await updateCalendarEvent(eventData.id, {
          title,
          start_time: start,
          end_time: end,
          notes: description,
          project_id: selectedProject || null,
          staff_id: selectedStaff[0] || null,
          resource_id: selectedResources[0] || null,
          event_type: eventType,
        })

        if (!result.success) {
          throw new Error(result.error || "イベントの更新に失敗しました")
        }

        toast({
          title: "イベントを更新しました",
          description: "カレンダーのイベントが更新されました",
        })

        if (onEventUpdate) {
          onEventUpdate({
            ...eventData,
            title,
            start,
            end,
            description,
            project_id: selectedProject,
            staff_id: selectedStaff[0],
            resource_id: selectedResources[0],
          })
        }
      }

      onOpenChange(false)
    } catch (error) {
      console.error("イベント保存エラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle event deletion
  const handleDelete = async () => {
    try {
      setIsLoading(true)

      if (!isNewEvent && eventData?.id) {
        const result = await deleteCalendarEvent(eventData.id)

        if (!result.success) {
          throw new Error(result.error || "イベントの削除に失敗しました")
        }

        toast({
          title: "イベントを削除しました",
          description: "カレンダーからイベントが削除されました",
        })

        if (onEventDelete) {
          onEventDelete(eventData.id)
        }
      }

      onOpenChange(false)
    } catch (error) {
      console.error("イベント削除エラー:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle staff selection
  const handleStaffChange = (staffId: string, checked: boolean) => {
    setSelectedStaff((prev) => {
      if (checked) {
        return [...prev, staffId]
      } else {
        return prev.filter((id) => id !== staffId)
      }
    })
  }

  // Handle resource selection
  const handleResourceChange = (resourceId: string, checked: boolean) => {
    setSelectedResources((prev) => {
      if (checked) {
        return [...prev, resourceId]
      } else {
        return prev.filter((id) => id !== resourceId)
      }
    })
  }

  // Handle heavy machinery selection
  const handleHeavyMachineryChange = (id: string, checked: boolean) => {
    setSelectedHeavyMachinery((prev) => {
      if (checked) {
        return [...prev, id]
      } else {
        return prev.filter((itemId) => itemId !== id)
      }
    })
  }

  // Handle vehicle selection
  const handleVehicleChange = (id: string, checked: boolean) => {
    setSelectedVehicles((prev) => {
      if (checked) {
        return [...prev, id]
      } else {
        return prev.filter((itemId) => itemId !== id)
      }
    })
  }

  // Handle tool selection
  const handleToolChange = (id: string, checked: boolean) => {
    setSelectedTools((prev) => {
      if (checked) {
        return [...prev, id]
      } else {
        return prev.filter((itemId) => itemId !== id)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isNewEvent ? "新規予定作成" : "予定の編集"}</DialogTitle>
          <DialogDescription>
            {isNewEvent
              ? "カレンダーに新しい予定を追加します。必要な情報を入力してください。"
              : "既存の予定を編集します。変更したい情報を更新してください。"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              タイトル
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="予定のタイトルを入力"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              案件
            </Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="案件を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-project">案件なし</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              開始日時
            </Label>
            <div className="col-span-3 flex gap-2">
              <div className="flex-1">
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex-1">
                <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              終了日時
            </Label>
            <div className="col-span-3 flex gap-2">
              <div className="flex-1">
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex-1">
                <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="staff">スタッフ</TabsTrigger>
              <TabsTrigger value="resources">資材</TabsTrigger>
              <TabsTrigger value="heavy">重機</TabsTrigger>
              <TabsTrigger value="vehicles">車両</TabsTrigger>
              <TabsTrigger value="tools">備品</TabsTrigger>
            </TabsList>
            <TabsContent value="staff" className="border rounded-md p-4">
              {console.log("スタッフタブレンダリング", {
                dataLoading,
                filteredStaff,
                selectedStaff,
              })}
              <div className="mb-4">
                <Input
                  placeholder="スタッフを検索"
                  value={searchStaff}
                  onChange={(e) => setSearchStaff(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[200px]">
                {dataLoading ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span>スタッフデータを読み込み中...</span>
                  </div>
                ) : (
                  <>
                    {filteredStaff.length > 0 ? (
                      <div className="space-y-2">
                        {filteredStaff.map((s) => (
                          <div key={s.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`staff-${s.id}`}
                              checked={selectedStaff.includes(s.id)}
                              onCheckedChange={(checked) => handleStaffChange(s.id, checked as boolean)}
                            />
                            <Label htmlFor={`staff-${s.id}`} className="flex-1">
                              {s.full_name || s.name} {s.position && `(${s.position})`}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        検索条件に一致するスタッフが見つかりません
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="resources" className="border rounded-md p-4">
              <div className="mb-4">
                <Input
                  placeholder="機材を検索"
                  value={searchResources}
                  onChange={(e) => setSearchResources(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[200px]">
                {dataLoading ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span>機材データを読み込み中...</span>
                  </div>
                ) : (
                  <>
                    {filteredResources.length > 0 ? (
                      <div className="space-y-2">
                        {filteredResources.map((r) => (
                          <div key={r.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`resource-${r.id}`}
                              checked={selectedResources.includes(r.id)}
                              onCheckedChange={(checked) => handleResourceChange(r.id, checked as boolean)}
                            />
                            <Label htmlFor={`resource-${r.id}`} className="flex-1">
                              {r.name} {r.type && `(${r.type})`}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        検索条件に一致する機材が見つかりません
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="heavy" className="border rounded-md p-4">
              <div className="mb-4">
                <Input
                  placeholder="重機を検索"
                  value={searchHeavyMachinery}
                  onChange={(e) => setSearchHeavyMachinery(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[200px]">
                {dataLoading ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span>重機データを読み込み中...</span>
                  </div>
                ) : (
                  <>
                    {filteredHeavyMachinery.length > 0 ? (
                      <div className="space-y-2">
                        {filteredHeavyMachinery.map((h) => (
                          <div key={h.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`heavy-${h.id}`}
                              checked={selectedHeavyMachinery.includes(h.id)}
                              onCheckedChange={(checked) => handleHeavyMachineryChange(h.id, checked as boolean)}
                            />
                            <Label htmlFor={`heavy-${h.id}`} className="flex-1">
                              {h.name} {h.type && `(${h.type})`}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        検索条件に一致する重機が見つかりません
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="vehicles" className="border rounded-md p-4">
              <div className="mb-4">
                <Input
                  placeholder="車両を検索"
                  value={searchVehicles}
                  onChange={(e) => setSearchVehicles(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[200px]">
                {dataLoading ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span>車両データを読み込み中...</span>
                  </div>
                ) : (
                  <>
                    {filteredVehicles.length > 0 ? (
                      <div className="space-y-2">
                        {filteredVehicles.map((v) => (
                          <div key={v.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`vehicle-${v.id}`}
                              checked={selectedVehicles.includes(v.id)}
                              onCheckedChange={(checked) => handleVehicleChange(v.id, checked as boolean)}
                            />
                            <Label htmlFor={`vehicle-${v.id}`} className="flex-1">
                              {v.name} {v.type && `(${v.type})`}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        検索条件に一致する車両が見つかりません
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="tools" className="border rounded-md p-4">
              <div className="mb-4">
                <Input placeholder="備品を検索" value={searchTools} onChange={(e) => setSearchTools(e.target.value)} />
              </div>
              <ScrollArea className="h-[200px]">
                {dataLoading ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <span>備品データを読み込み中...</span>
                  </div>
                ) : (
                  <>
                    {filteredTools.length > 0 ? (
                      <div className="space-y-2">
                        {filteredTools.map((t) => (
                          <div key={t.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tool-${t.id}`}
                              checked={selectedTools.includes(t.id)}
                              onCheckedChange={(checked) => handleToolChange(t.id, checked as boolean)}
                            />
                            <Label htmlFor={`tool-${t.id}`} className="flex-1">
                              {t.name} {t.storage_location && `(${t.storage_location})`}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        検索条件に一致する備品が見つかりません
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              詳細
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="予定の詳細を入力"
            />
          </div>
        </div>
        <DialogFooter>
          {!isNewEvent && (
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="mr-auto">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              削除
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
