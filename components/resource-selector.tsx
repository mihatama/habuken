"use client"

import { useState, useEffect } from "react"
import { getClientSupabase } from "@/lib/supabase-utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { Search, X, Edit2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface ResourceSelectorProps {
  resourceType: "staff" | "machinery" | "vehicles" | "tools"
  selectedResources: { id: string; startDate: string; endDate: string | null }[]
  onSelectedResourcesChange: (resources: { id: string; startDate: string; endDate: string | null }[]) => void
  startDate: string
  endDate: string | null
}

export function ResourceSelector({
  resourceType,
  selectedResources,
  onSelectedResourcesChange,
  startDate,
  endDate,
}: ResourceSelectorProps) {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<{
    id: string
    startDate: string
    endDate: string | null
  } | null>(null)
  const [tempPeriod, setTempPeriod] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  })

  // リソースデータの取得
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const supabase = getClientSupabase()
        let data: any[] = []
        let error: any = null

        switch (resourceType) {
          case "staff":
            ;({ data, error } = await supabase
              .from("staff")
              .select("id, full_name, position, department, phone, email, status"))
            break
          case "machinery":
            ;({ data, error } = await supabase.from("heavy_machinery").select("*"))
            break
          case "vehicles":
            ;({ data, error } = await supabase.from("vehicles").select("*"))
            break
          case "tools":
            ;({ data, error } = await supabase.from("tools").select("*"))
            break
        }

        if (error) throw error
        setResources(data || [])
      } catch (error) {
        console.error(`${resourceType}データの取得エラー:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [resourceType])

  // リソースの選��状態を変更する関数
  const handleResourceChange = (resourceId: string, checked: boolean) => {
    if (checked) {
      onSelectedResourcesChange([
        ...selectedResources,
        { id: resourceId, startDate: startDate || "", endDate: endDate },
      ])
    } else {
      onSelectedResourcesChange(selectedResources.filter((resource) => resource.id !== resourceId))
    }
  }

  // リソースが選択されているかチェック
  const isResourceSelected = (resourceId: string) => {
    return selectedResources.some((resource) => resource.id === resourceId)
  }

  // 期間編集ダイアログを開く
  const openPeriodDialog = (resource: { id: string; startDate: string; endDate: string | null }) => {
    setEditingResource(resource)
    setTempPeriod({
      startDate: resource.startDate || startDate || "",
      endDate: resource.endDate || endDate || "",
    })
    setPeriodDialogOpen(true)
  }

  // 期間を保存
  const savePeriod = () => {
    if (!editingResource) return

    onSelectedResourcesChange(
      selectedResources.map((resource) =>
        resource.id === editingResource.id
          ? { ...resource, startDate: tempPeriod.startDate, endDate: tempPeriod.endDate || null }
          : resource,
      ),
    )

    setPeriodDialogOpen(false)
  }

  // 検索条件に一致するリソースをフィルタリング
  const filteredResources = resources.filter((resource) => {
    const searchFields = getSearchFields(resource, resourceType)
    return searchFields.some((field) => field && field.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  // リソースタイプに応じた検索対象フィールドを取得
  function getSearchFields(resource: any, type: string): string[] {
    switch (type) {
      case "staff":
        return [resource.full_name, resource.position, resource.department]
      case "machinery":
        return [resource.name, resource.type, resource.model]
      case "vehicles":
        return [resource.name, resource.type, resource.license_plate]
      case "tools":
        return [resource.name, resource.type, resource.storage_location]
      default:
        return []
    }
  }

  // リソースタイプに応じたテーブルヘッダーを取得
  function getTableHeaders(type: string): string[] {
    switch (type) {
      case "staff":
        return ["名前", "役職", "部署", "連絡先"]
      case "machinery":
        return ["名前", "種類", "モデル", "状態"]
      case "vehicles":
        return ["名前", "種類", "ナンバー", "状態"]
      case "tools":
        return ["名前", "種類", "保管場所", "状態"]
      default:
        return []
    }
  }

  // リソースタイプに応じたテーブルセルの値を取得
  function getResourceCells(resource: any, type: string): string[] {
    switch (type) {
      case "staff":
        return [resource.full_name || "-", resource.position || "-", resource.department || "-", resource.phone || "-"]
      case "machinery":
        return [resource.name || "-", resource.type || "-", resource.model || "-", resource.status || "-"]
      case "vehicles":
        return [resource.name || "-", resource.type || "-", resource.license_plate || "-", resource.status || "-"]
      case "tools":
        return [resource.name || "-", resource.type || "-", resource.storage_location || "-", resource.condition || "-"]
      default:
        return []
    }
  }

  // リソースタイプに応じたリソース名を取得
  function getResourceName(resource: any, type: string): string {
    switch (type) {
      case "staff":
        return resource.full_name || "名称なし"
      case "machinery":
      case "vehicles":
      case "tools":
        return resource.name || "名称なし"
      default:
        return "名称なし"
    }
  }

  // 日付をフォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`${getResourceTypeName(resourceType)}を検索`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* 選択済みリソース表示 */}
      {selectedResources.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">選択済み{getResourceTypeName(resourceType)}</h4>
          <div className="space-y-2">
            {selectedResources.map((resource) => {
              const resourceInfo = resources.find((r) => r.id === resource.id)
              return (
                <div key={resource.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="py-1">
                      {resourceInfo ? getResourceName(resourceInfo, resourceType) : resource.id}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(resource.startDate)} 〜 {formatDate(resource.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openPeriodDialog(resource)}
                      className="h-8 px-2"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      期間編集
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResourceChange(resource.id, false)}
                      className="h-8 px-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                      削除
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* リソース一覧 */}
      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              {getTableHeaders(resourceType).map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={getTableHeaders(resourceType).length + 1} className="text-center py-4">
                  データを読み込み中...
                </TableCell>
              </TableRow>
            ) : filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <TableRow key={resource.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={isResourceSelected(resource.id)}
                      onCheckedChange={(checked) => handleResourceChange(resource.id, checked as boolean)}
                    />
                  </TableCell>
                  {getResourceCells(resource, resourceType).map((cell, index) => (
                    <TableCell key={index} className={index === 0 ? "font-medium" : ""}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={getTableHeaders(resourceType).length + 1}
                  className="text-center py-4 text-muted-foreground"
                >
                  検索条件に一致する{getResourceTypeName(resourceType)}が見つかりません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* 期間編集ダイアログ */}
      <Dialog open={periodDialogOpen} onOpenChange={setPeriodDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>使用期間の編集</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period-start" className="text-right">
                開始日
              </Label>
              <Input
                id="period-start"
                type="date"
                value={tempPeriod.startDate}
                onChange={(e) => setTempPeriod({ ...tempPeriod, startDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period-end" className="text-right">
                終了日
              </Label>
              <Input
                id="period-end"
                type="date"
                value={tempPeriod.endDate || ""}
                onChange={(e) => setTempPeriod({ ...tempPeriod, endDate: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPeriodDialogOpen(false)}>
              キャンセル
            </Button>
            <Button type="button" onClick={savePeriod}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// リソースタイプに応じた表示名を取得
function getResourceTypeName(type: string): string {
  switch (type) {
    case "staff":
      return "スタッフ"
    case "machinery":
      return "重機"
    case "vehicles":
      return "車両"
    case "tools":
      return "備品"
    default:
      return "リソース"
  }
}
