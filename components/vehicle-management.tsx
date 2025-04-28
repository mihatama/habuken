"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useVehicles, useUpdateVehicle, useDeleteVehicle, type Vehicle } from "@/hooks/supabase/use-vehicles"
import { VehicleForm } from "./vehicle-form"

export function VehicleManagement() {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null)

  // カスタムフックを使用してデータを取得
  const { data: vehicles = [], isLoading: loading, refetch } = useVehicles({ searchTerm })

  // カスタムフックを使用してCRUD操作を実行
  const updateVehicleMutation = useUpdateVehicle()
  const deleteVehicleMutation = useDeleteVehicle()

  // 車両の更新
  const handleUpdateVehicle = async () => {
    if (!currentVehicle) return

    try {
      await updateVehicleMutation.mutateAsync({
        id: currentVehicle.id,
        data: {
          name: currentVehicle.name,
          type: currentVehicle.type,
          location: currentVehicle.location,
          last_inspection_date: currentVehicle.last_inspection_date,
          ownership_type: currentVehicle.ownership_type,
          daily_rate: currentVehicle.daily_rate,
          weekly_rate: currentVehicle.weekly_rate,
          monthly_rate: currentVehicle.monthly_rate,
        },
      })

      setEditOpen(false)
      setCurrentVehicle(null)
    } catch (error) {
      // エラーはミューテーションのonErrorで処理
    }
  }

  // 車両の削除
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("この車両を削除してもよろしいですか？")) return

    try {
      await deleteVehicleMutation.mutateAsync(id)
    } catch (error) {
      // エラーはミューテーションのonErrorで処理
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="車両を検索..."
            className="flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
            <span className="sr-only">検索</span>
          </Button>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          車両を追加
        </Button>
        <VehicleForm open={open} onOpenChange={setOpen} onSuccess={() => refetch()} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>車両名</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>配置場所</TableHead>
              <TableHead>所有形態</TableHead>
              <TableHead>料金（日/週/月）</TableHead>
              <TableHead>最終点検日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>{vehicle.type}</TableCell>
                  <TableCell>{vehicle.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vehicle.ownership_type === "自社保有"
                          ? "default"
                          : vehicle.ownership_type === "リース"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {vehicle.ownership_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {vehicle.daily_rate ? `¥${vehicle.daily_rate.toLocaleString()}` : "-"} /
                    {vehicle.weekly_rate ? `¥${vehicle.weekly_rate.toLocaleString()}` : "-"} /
                    {vehicle.monthly_rate ? `¥${vehicle.monthly_rate.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>
                    {vehicle.last_inspection_date ? new Date(vehicle.last_inspection_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editOpen && currentVehicle?.id === vehicle.id}
                        onOpenChange={(open) => {
                          setEditOpen(open)
                          if (!open) setCurrentVehicle(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setCurrentVehicle(vehicle)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">編集</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>車両情報の編集</DialogTitle>
                          </DialogHeader>
                          {currentVehicle && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">車両名</Label>
                                <Input
                                  id="edit-name"
                                  value={currentVehicle.name}
                                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, name: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-type">車両タイプ</Label>
                                <Select
                                  value={currentVehicle.type}
                                  onValueChange={(value) => setCurrentVehicle({ ...currentVehicle, type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="バン">バン</SelectItem>
                                    <SelectItem value="SUV">SUV</SelectItem>
                                    <SelectItem value="ミニバン">ミニバン</SelectItem>
                                    <SelectItem value="トラック">トラック</SelectItem>
                                    <SelectItem value="セダン">セダン</SelectItem>
                                    <SelectItem value="その他">その他</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-location">配置場所</Label>
                                <Input
                                  id="edit-location"
                                  value={currentVehicle.location}
                                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, location: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-lastMaintenance">最終点検日</Label>
                                <Input
                                  id="edit-lastMaintenance"
                                  type="date"
                                  value={
                                    currentVehicle.last_inspection_date
                                      ? new Date(currentVehicle.last_inspection_date).toISOString().split("T")[0]
                                      : ""
                                  }
                                  onChange={(e) =>
                                    setCurrentVehicle({ ...currentVehicle, last_inspection_date: e.target.value })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-ownership">所有形態</Label>
                                <Select
                                  value={currentVehicle.ownership_type}
                                  onValueChange={(value: "自社保有" | "リース" | "その他") =>
                                    setCurrentVehicle({ ...currentVehicle, ownership_type: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="自社保有">自社保有</SelectItem>
                                    <SelectItem value="リース">リース</SelectItem>
                                    <SelectItem value="その他">その他</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-daily_rate">日額料金</Label>
                                  <Input
                                    id="edit-daily_rate"
                                    type="number"
                                    value={currentVehicle.daily_rate || ""}
                                    onChange={(e) =>
                                      setCurrentVehicle({
                                        ...currentVehicle,
                                        daily_rate: e.target.value ? Number(e.target.value) : null,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-weekly_rate">週額料金</Label>
                                  <Input
                                    id="edit-weekly_rate"
                                    type="number"
                                    value={currentVehicle.weekly_rate || ""}
                                    onChange={(e) =>
                                      setCurrentVehicle({
                                        ...currentVehicle,
                                        weekly_rate: e.target.value ? Number(e.target.value) : null,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-monthly_rate">月額料金</Label>
                                  <Input
                                    id="edit-monthly_rate"
                                    type="number"
                                    value={currentVehicle.monthly_rate || ""}
                                    onChange={(e) =>
                                      setCurrentVehicle({
                                        ...currentVehicle,
                                        monthly_rate: e.target.value ? Number(e.target.value) : null,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button onClick={handleUpdateVehicle}>保存</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteVehicle(vehicle.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">削除</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
