"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  LayoutGrid,
  LayoutList,
  RefreshCw,
  Calendar,
  Users,
  Truck,
  PenToolIcon as Tool,
  Settings,
  Filter,
  Save,
  PlusCircle,
  Trash2,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
} from "lucide-react"
import { ProjectCalendar } from "@/components/project-calendar"
import { StaffCalendar } from "@/components/staff-calendar"
import { HeavyMachineryCalendar } from "@/components/heavy-machinery-calendar"
import { ToolCalendar } from "@/components/tool-calendar"
import { VehicleCostAnalysis } from "@/components/vehicle-cost-analysis"
import { HeavyMachineryCostAnalysis } from "@/components/heavy-machinery-cost-analysis"

// ドラッグ＆ドロップのためのライブラリ
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// サンプルデータ
const sampleProjectData = [
  { name: "1月", 完了: 4, 進行中: 2, 未着手: 1 },
  { name: "2月", 完了: 3, 進行中: 4, 未着手: 2 },
  { name: "3月", 完了: 5, 進行中: 3, 未着手: 0 },
  { name: "4月", 完了: 6, 進行中: 2, 未着手: 1 },
  { name: "5月", 完了: 4, 進行中: 5, 未着手: 2 },
  { name: "6月", 完了: 7, 進行中: 3, 未着手: 1 },
]

const sampleResourceData = [
  { name: "重機", 稼働率: 75, 予約数: 12 },
  { name: "車両", 稼働率: 60, 予約数: 8 },
  { name: "工具", 稼働率: 45, 予約数: 15 },
]

const sampleStaffData = [
  { name: "現場作業", value: 45 },
  { name: "事務作業", value: 25 },
  { name: "移動時間", value: 15 },
  { name: "休憩", value: 10 },
  { name: "その他", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

// ウィジェットタイプの定義
type WidgetType =
  | "projectProgress"
  | "resourceUtilization"
  | "staffAllocation"
  | "calendar"
  | "costAnalysis"
  | "recentProjects"

// ウィジェット設定の型定義
interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  size: "small" | "medium" | "large"
  chartType?: "bar" | "line" | "pie"
  dataSource?: string
  timeRange?: string
  visible: boolean
}

// ソータブルウィジェットコンポーネント
function SortableWidget({
  widget,
  onRemove,
  onEdit,
}: {
  widget: WidgetConfig
  onRemove: (id: string) => void
  onEdit: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  }

  // ウィジェットのサイズに基づくクラス
  const sizeClass = {
    small: "col-span-1",
    medium: "col-span-2",
    large: "col-span-3",
  }[widget.size]

  return (
    <div ref={setNodeRef} style={style} className={`${sizeClass} relative`}>
      <Card className="h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between" {...attributes} {...listeners}>
          <CardTitle className="text-md">{widget.title}</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(widget.id)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onRemove(widget.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderWidgetContent(widget)}</CardContent>
      </Card>
    </div>
  )
}

// ウィジェットの内容をレンダリングする関数
function renderWidgetContent(widget: WidgetConfig) {
  switch (widget.type) {
    case "projectProgress":
      return (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            {widget.chartType === "bar" ? (
              <BarChart data={sampleProjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="完了" fill="#4CAF50" />
                <Bar dataKey="進行中" fill="#2196F3" />
                <Bar dataKey="未着手" fill="#FFC107" />
              </BarChart>
            ) : widget.chartType === "line" ? (
              <LineChart data={sampleProjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="完了" stroke="#4CAF50" />
                <Line type="monotone" dataKey="進行中" stroke="#2196F3" />
                <Line type="monotone" dataKey="未着手" stroke="#FFC107" />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>このチャートタイプはサポートされていません</p>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      )

    case "resourceUtilization":
      return (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            {widget.chartType === "bar" ? (
              <BarChart data={sampleResourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="稼働率" fill="#2196F3" />
                <Bar dataKey="予約数" fill="#FF5722" />
              </BarChart>
            ) : widget.chartType === "line" ? (
              <LineChart data={sampleResourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="稼働率" stroke="#2196F3" />
                <Line type="monotone" dataKey="予約数" stroke="#FF5722" />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>このチャートタイプはサポートされていません</p>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      )

    case "staffAllocation":
      return (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            {widget.chartType === "pie" ? (
              <PieChart>
                <Pie
                  data={sampleStaffData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sampleStaffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>このチャートタイプはサポートされていません</p>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      )

    case "calendar":
      return (
        <div className="h-[300px] overflow-auto">
          <ProjectCalendar compact={true} />
        </div>
      )

    case "costAnalysis":
      return (
        <div className="h-[300px] overflow-auto">
          <VehicleCostAnalysis />
        </div>
      )

    case "recentProjects":
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
            <span>東京オフィス改装工事</span>
            <Badge>進行中</Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
            <span>大阪倉庫建設</span>
            <Badge>進行中</Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
            <span>名古屋店舗リノベーション</span>
            <Badge variant="outline">完了</Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
            <span>福岡支店設立</span>
            <Badge variant="secondary">計画中</Badge>
          </div>
        </div>
      )

    default:
      return <div>ウィジェットタイプが不明です</div>
  }
}

// ウィジェット編集モーダル
function WidgetEditModal({
  widget,
  onSave,
  onCancel,
}: {
  widget: WidgetConfig | null
  onSave: (updatedWidget: WidgetConfig) => void
  onCancel: () => void
}) {
  const [editedWidget, setEditedWidget] = useState<WidgetConfig | null>(widget)

  useEffect(() => {
    setEditedWidget(widget)
  }, [widget])

  if (!editedWidget) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">ウィジェット設定</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="widget-title">タイトル</Label>
            <Input
              id="widget-title"
              value={editedWidget.title}
              onChange={(e) => setEditedWidget({ ...editedWidget, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="widget-size">サイズ</Label>
            <Select
              value={editedWidget.size}
              onValueChange={(value) =>
                setEditedWidget({ ...editedWidget, size: value as "small" | "medium" | "large" })
              }
            >
              <SelectTrigger id="widget-size">
                <SelectValue placeholder="サイズを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">小</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="large">大</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(editedWidget.type === "projectProgress" ||
            editedWidget.type === "resourceUtilization" ||
            editedWidget.type === "staffAllocation") && (
            <div>
              <Label htmlFor="widget-chart-type">グラフタイプ</Label>
              <Select
                value={editedWidget.chartType}
                onValueChange={(value) =>
                  setEditedWidget({ ...editedWidget, chartType: value as "bar" | "line" | "pie" })
                }
              >
                <SelectTrigger id="widget-chart-type">
                  <SelectValue placeholder="グラフタイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  {editedWidget.type !== "staffAllocation" && (
                    <>
                      <SelectItem value="bar">棒グラフ</SelectItem>
                      <SelectItem value="line">折れ線グラフ</SelectItem>
                    </>
                  )}
                  {editedWidget.type === "staffAllocation" && <SelectItem value="pie">円グラフ</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="widget-time-range">期間</Label>
            <Select
              value={editedWidget.timeRange}
              onValueChange={(value) => setEditedWidget({ ...editedWidget, timeRange: value })}
            >
              <SelectTrigger id="widget-time-range">
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">今日</SelectItem>
                <SelectItem value="week">今週</SelectItem>
                <SelectItem value="month">今月</SelectItem>
                <SelectItem value="quarter">今四半期</SelectItem>
                <SelectItem value="year">今年</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="widget-visible"
              checked={editedWidget.visible}
              onCheckedChange={(checked) => setEditedWidget({ ...editedWidget, visible: checked })}
            />
            <Label htmlFor="widget-visible">表示する</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={() => onSave(editedWidget)}>保存</Button>
        </div>
      </div>
    </div>
  )
}

// メインのダッシュボードコンポーネント
export default function InteractiveDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    {
      id: "1",
      type: "projectProgress",
      title: "プロジェクト進捗",
      size: "medium",
      chartType: "bar",
      timeRange: "month",
      visible: true,
    },
    {
      id: "2",
      type: "resourceUtilization",
      title: "リソース稼働率",
      size: "medium",
      chartType: "bar",
      timeRange: "month",
      visible: true,
    },
    {
      id: "3",
      type: "staffAllocation",
      title: "スタッフ稼働内訳",
      size: "small",
      chartType: "pie",
      timeRange: "month",
      visible: true,
    },
    { id: "4", type: "recentProjects", title: "最近のプロジェクト", size: "small", timeRange: "month", visible: true },
    { id: "5", type: "calendar", title: "プロジェクトカレンダー", size: "large", timeRange: "month", visible: true },
  ])
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null)
  const [isAddingWidget, setIsAddingWidget] = useState(false)
  const [dashboardSettings, setDashboardSettings] = useState({
    autoRefresh: false,
    refreshInterval: 5, // 分単位
    darkMode: false,
    compactView: false,
  })
  const { toast } = useToast()

  // DnD用のセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // ドラッグ終了時の処理
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // ウィジェットの削除
  const handleRemoveWidget = (id: string) => {
    if (confirm("このウィジェットを削除してもよろしいですか？")) {
      setWidgets(widgets.filter((w) => w.id !== id))
      toast({
        title: "ウィジェットを削除しました",
        description: "ダッシュボードからウィジェットが削除されました",
      })
    }
  }

  // ウィジェットの編集
  const handleEditWidget = (id: string) => {
    const widget = widgets.find((w) => w.id === id)
    if (widget) {
      setEditingWidget({ ...widget })
    }
  }

  // ウィジェット設定の保存
  const handleSaveWidget = (updatedWidget: WidgetConfig) => {
    setWidgets(widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)))
    setEditingWidget(null)
    toast({
      title: "設定を保存しました",
      description: "ウィジェットの設定が更新されました",
    })
  }

  // 新しいウィジェットの追加
  const handleAddWidget = (type: WidgetType) => {
    const newWidget: WidgetConfig = {
      id: Date.now().toString(),
      type,
      title: getDefaultWidgetTitle(type),
      size: "medium",
      chartType: getDefaultChartType(type),
      timeRange: "month",
      visible: true,
    }

    setWidgets([...widgets, newWidget])
    setIsAddingWidget(false)
    toast({
      title: "ウィジェットを追加しました",
      description: "新しいウィジェットがダッシュボードに追加されました",
    })
  }

  // ウィジェットタイプに基づくデフォルトのタイトルを取得
  const getDefaultWidgetTitle = (type: WidgetType): string => {
    switch (type) {
      case "projectProgress":
        return "プロジェクト進捗"
      case "resourceUtilization":
        return "リソース稼働率"
      case "staffAllocation":
        return "スタッフ稼働内訳"
      case "calendar":
        return "プロジェクトカレンダー"
      case "costAnalysis":
        return "コスト分析"
      case "recentProjects":
        return "最近のプロジェクト"
      default:
        return "ウィジェット"
    }
  }

  // ウィジェットタイプに基づくデフォルトのチャートタイプを取得
  const getDefaultChartType = (type: WidgetType): "bar" | "line" | "pie" | undefined => {
    switch (type) {
      case "projectProgress":
        return "bar"
      case "resourceUtilization":
        return "bar"
      case "staffAllocation":
        return "pie"
      default:
        return undefined
    }
  }

  // ダッシュボード設定の保存
  const saveDashboardSettings = () => {
    // ここで設定をローカルストレージやデータベースに保存する処理を実装
    localStorage.setItem("dashboardSettings", JSON.stringify(dashboardSettings))
    localStorage.setItem("dashboardWidgets", JSON.stringify(widgets))

    toast({
      title: "ダッシュボード設定を保存しました",
      description: "カスタマイズした設定が保存されました",
    })
  }

  // 設定の読み込み
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("dashboardSettings")
        const savedWidgets = localStorage.getItem("dashboardWidgets")

        if (savedSettings) {
          setDashboardSettings(JSON.parse(savedSettings))
        }

        if (savedWidgets) {
          setWidgets(JSON.parse(savedWidgets))
        }
      } catch (error) {
        console.error("設定の読み込みに失敗しました:", error)
      }
    }

    loadSettings()
  }, [])

  // 自動更新の設定
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (dashboardSettings.autoRefresh) {
      intervalId = setInterval(
        () => {
          handleRefresh()
        },
        dashboardSettings.refreshInterval * 60 * 1000,
      )
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [dashboardSettings.autoRefresh, dashboardSettings.refreshInterval])

  // データの更新処理
  const handleRefresh = () => {
    setIsRefreshing(true)

    // ここで実際のデータ更新処理を実装
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "データを更新しました",
        description: "最新のデータが読み込まれました",
      })
    }, 1000)
  }

  // 表示するウィジェットのフィルタリング
  const visibleWidgets = widgets.filter((widget) => widget.visible)

  return (
    <DashboardLayout
      title="ダッシュボード"
      description="インタラクティブなダッシュボードでプロジェクト状況を一目で確認"
    >
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="projects">案件</TabsTrigger>
              <TabsTrigger value="resources">リソース</TabsTrigger>
              <TabsTrigger value="calendar">カレンダー</TabsTrigger>
              <TabsTrigger value="settings">設定</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>

              <Button variant="outline" onClick={() => setIsAddingWidget(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                ウィジェット追加
              </Button>

              <Button variant="default" onClick={saveDashboardSettings}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="mt-0">
            {viewMode === "grid" ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={visibleWidgets.map((w) => w.id)}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visibleWidgets.map((widget) => (
                      <SortableWidget
                        key={widget.id}
                        widget={widget}
                        onRemove={handleRemoveWidget}
                        onEdit={handleEditWidget}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="space-y-4">
                {visibleWidgets.map((widget) => (
                  <Card key={widget.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{widget.title}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditWidget(widget.id)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveWidget(widget.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>{renderWidgetContent(widget)}</CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="mt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">案件一覧</h2>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="active">進行中</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                      <SelectItem value="planned">計画中</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    フィルター
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>プロジェクト {i + 1}</CardTitle>
                          <CardDescription>2023年10月1日 - 2023年12月31日</CardDescription>
                        </div>
                        <Badge variant={i % 3 === 0 ? "default" : i % 3 === 1 ? "secondary" : "outline"}>
                          {i % 3 === 0 ? "進行中" : i % 3 === 1 ? "計画中" : "完了"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>進捗状況</span>
                          <span>{30 + i * 10}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${30 + i * 10}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm mt-4">
                          <span>担当者: 山田太郎</span>
                          <span>予算: ¥{(1000000 + i * 500000).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">リソース管理</h2>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="リソースタイプ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="machinery">重機</SelectItem>
                      <SelectItem value="vehicles">車両</SelectItem>
                      <SelectItem value="tools">工具</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>車両コスト分析</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VehicleCostAnalysis />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>重機コスト分析</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HeavyMachineryCostAnalysis />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">カレンダー</h2>
                <div className="flex items-center gap-2">
                  <Select defaultValue="project">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="カレンダータイプ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">案件</SelectItem>
                      <SelectItem value="staff">スタッフ</SelectItem>
                      <SelectItem value="machinery">重機</SelectItem>
                      <SelectItem value="vehicles">車両</SelectItem>
                      <SelectItem value="tools">工具</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Tabs defaultValue="project">
                    <TabsList className="w-full rounded-t-lg rounded-b-none border-b">
                      <TabsTrigger value="project" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        案件
                      </TabsTrigger>
                      <TabsTrigger value="staff" className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        スタッフ
                      </TabsTrigger>
                      <TabsTrigger value="machinery" className="flex items-center">
                        <Truck className="h-4 w-4 mr-2" />
                        重機
                      </TabsTrigger>
                      <TabsTrigger value="tools" className="flex items-center">
                        <Tool className="h-4 w-4 mr-2" />
                        工具
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="project" className="m-0">
                      <div className="p-4">
                        <ProjectCalendar />
                      </div>
                    </TabsContent>
                    <TabsContent value="staff" className="m-0">
                      <div className="p-4">
                        <StaffCalendar />
                      </div>
                    </TabsContent>
                    <TabsContent value="machinery" className="m-0">
                      <div className="p-4">
                        <HeavyMachineryCalendar />
                      </div>
                    </TabsContent>
                    <TabsContent value="tools" className="m-0">
                      <div className="p-4">
                        <ToolCalendar />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>ダッシュボード設定</CardTitle>
                <CardDescription>ダッシュボードの表示設定をカスタマイズできます</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-refresh">自動更新</Label>
                      <Switch
                        id="auto-refresh"
                        checked={dashboardSettings.autoRefresh}
                        onCheckedChange={(checked) =>
                          setDashboardSettings({ ...dashboardSettings, autoRefresh: checked })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      有効にすると、設定した間隔でデータが自動的に更新されます
                    </p>
                  </div>

                  {dashboardSettings.autoRefresh && (
                    <div className="space-y-2">
                      <Label htmlFor="refresh-interval">更新間隔（分）</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="refresh-interval"
                          min={1}
                          max={60}
                          step={1}
                          value={[dashboardSettings.refreshInterval]}
                          onValueChange={(value) =>
                            setDashboardSettings({ ...dashboardSettings, refreshInterval: value[0] })
                          }
                        />
                        <span className="w-12 text-center">{dashboardSettings.refreshInterval}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compact-view">コンパクト表示</Label>
                      <Switch
                        id="compact-view"
                        checked={dashboardSettings.compactView}
                        onCheckedChange={(checked) =>
                          setDashboardSettings({ ...dashboardSettings, compactView: checked })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      有効にすると、ウィジェットがよりコンパクトに表示されます
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">ウィジェット管理</h3>
                    <div className="space-y-2">
                      {widgets.map((widget) => (
                        <div key={widget.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center">
                            <Switch
                              id={`widget-${widget.id}`}
                              checked={widget.visible}
                              onCheckedChange={(checked) => {
                                setWidgets(widgets.map((w) => (w.id === widget.id ? { ...w, visible: checked } : w)))
                              }}
                              className="mr-2"
                            />
                            <Label htmlFor={`widget-${widget.id}`}>{widget.title}</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditWidget(widget.id)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveWidget(widget.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveDashboardSettings}>
                      <Save className="h-4 w-4 mr-2" />
                      設定を保存
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ウィジェット追加モーダル */}
      {isAddingWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">ウィジェットを追加</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAddWidget("projectProgress")}
              >
                <BarChart3 className="h-8 w-8 mb-2" />
                プロジェクト進捗
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAddWidget("resourceUtilization")}
              >
                <LineChartIcon className="h-8 w-8 mb-2" />
                リソース稼働率
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAddWidget("staffAllocation")}
              >
                <PieChartIcon className="h-8 w-8 mb-2" />
                スタッフ稼働内訳
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAddWidget("calendar")}
              >
                <Calendar className="h-8 w-8 mb-2" />
                カレンダー
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAddWidget("costAnalysis")}
              >
                <Truck className="h-8 w-8 mb-2" />
                コスト分析
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAddWidget("recentProjects")}
              >
                <Users className="h-8 w-8 mb-2" />
                最近のプロジェクト
              </Button>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setIsAddingWidget(false)}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ウィジェット編集モーダル */}
      {editingWidget && (
        <WidgetEditModal widget={editingWidget} onSave={handleSaveWidget} onCancel={() => setEditingWidget(null)} />
      )}
    </DashboardLayout>
  )
}
