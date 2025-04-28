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
import {
  useVehicles,
  useAddVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  type Vehicle,
  type VehicleInput,
} from "@/hooks/supabase/use-vehicles"

export function VehicleManagement() {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null)

  const [newVehicle, setNewVehicle] = useState<Partial<VehicleInput>>({
    name: "",
    type: "",
    location: "",
    last_inspection_date: "",
    ownership_type: "自社保有" as const,
    daily_rate: null,
    weekly_rate: null,
    monthly_rate: null,
  })

  // カスタムフックを使用してデータを取得
  const { data: vehicles = [], isLoading: loading } = useVehicles({ searchTerm })

  // カスタムフックを使用してCRUD操作を実行
  const addVehicleMutation = useAddVehicle()
  const updateVehicleMutation = useUpdateVehicle()
  const deleteVehicleMutation = useDeleteVehicle()

  // 車両の追加
  const handleAddVehicle = async () => {
    try {
      await addVehicleMutation.mutateAsync({
        name: newVehicle.name || "",
        type: newVehicle.type || "",
        location: newVehicle.location || "",
        last_inspection_date: newVehicle.last_inspection_date || null,
        ownership_type: newVehicle.ownership_type || "自社保有",
        daily_rate:
          newVehicle.daily_rate !== null && newVehicle.daily_rate !== undefined ? Number(newVehicle.daily_rate) : null,
        weekly_rate:
          newVehicle.weekly_rate !== null && newVehicle.weekly_rate !== undefined
            ? Number(newVehicle.weekly_rate)
            : null,
        monthly_rate:
          newVehicle.monthly_rate !== null && newVehicle.monthly_rate !== undefined
            ? Number(newVehicle.monthly_rate)
            : null,
      } as VehicleInput)

      setOpen(false)
      setNewVehicle({
        name: "",
        type: "",
        location: "",
        last_inspection_date: "",
        ownership_type: "自社保有",
        daily_rate: null,
        weekly_rate: null,
        monthly_rate: null,
      })
    } catch (error) {
      // エラーはミューテーションのonErrorで処理
    }
  }

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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              車両を追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規車両登録</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">車両名</Label>
                <Input
                  id="name"
                  placeholder="例: トヨタ ハイエース"
                  value={newVehicle.name || ""}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">車両タイプ</Label>
                <Select
                  value={newVehicle.type || ""}
                  onValueChange={(value) => setNewVehicle({ ...newVehicle, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="車両タイプを選択" />
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
                <Label htmlFor="location">配置場所</Label>
                <Input
                  id="location"
                  placeholder="例: 東京本社"
                  value={newVehicle.location || ""}
                  onChange={(e) => setNewVehicle({ ...newVehicle, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastMaintenance">最終点検日</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={newVehicle.last_inspection_date || ""}
                  onChange={(e) => setNewVehicle({ ...newVehicle, last_inspection_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ownership">所有形態</Label>
                <Select
                  value={newVehicle.ownership_type || "自社保有"}
                  onValueChange={(value: "自社保有" | "リース" | "その他") =>
                    setNewVehicle({ ...newVehicle, ownership_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="所有形態を選択" />
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
                  <Label htmlFor="daily_rate">日額料金</Label>
                  <Input
                    id="daily_rate"
                    type="number"
                    placeholder="0"
                    value={newVehicle.daily_rate === null ? "" : newVehicle.daily_rate}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        daily_rate: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weekly_rate">週額料金</Label>
                  <Input
                    id="weekly_rate"
                    type="number"
                    placeholder="0"
                    value={newVehicle.weekly_rate === null ? "" : newVehicle.weekly_rate}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        weekly_rate: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthly_rate">月額料金</Label>
                  <Input
                    id="monthly_rate"
                    type="number"
                    placeholder="0"
                    value={newVehicle.monthly_rate === null ? "" : newVehicle.monthly_rate}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        monthly_rate: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddVehicle}>登録</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
