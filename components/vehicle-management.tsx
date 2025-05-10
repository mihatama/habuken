"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getClientSupabase } from "@/lib/supabase-utils"

export function VehicleManagement() {
  const { toast } = useToast()
  const supabase = getClientSupabase() // シングルトンインスタンスを使用

  const [vehicles, setVehicles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    type: "",
    location: "",
    last_inspection_date: new Date().toISOString().split("T")[0],
    ownership_type: "自社保有",
    daily_rate: "",
    weekly_rate: "",
    monthly_rate: "",
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function fetchVehicles() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      console.log("取得した車両データ:", data)
      setVehicles(data || [])
    } catch (error) {
      console.error("車両の取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "車両の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function addVehicle() {
    try {
      if (!newVehicle.name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)

      // 数値フィールドの変換
      const vehicleData = {
        ...newVehicle,
        daily_rate: newVehicle.daily_rate ? Number.parseFloat(newVehicle.daily_rate) : null,
        weekly_rate: newVehicle.weekly_rate ? Number.parseFloat(newVehicle.weekly_rate) : null,
        monthly_rate: newVehicle.monthly_rate ? Number.parseFloat(newVehicle.monthly_rate) : null,
      }

      const { data, error } = await supabase.from("vehicles").insert([vehicleData]).select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "車両が正常に追加されました",
      })

      setNewVehicle({
        name: "",
        type: "",
        location: "",
        last_inspection_date: new Date().toISOString().split("T")[0],
        ownership_type: "自社保有",
        daily_rate: "",
        weekly_rate: "",
        monthly_rate: "",
      })

      fetchVehicles()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("車両の追加に失敗しました:", error)
      toast({
        title: "エラー",
        description: "車両の追加に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateVehicle() {
    try {
      if (!currentVehicle || !currentVehicle.id) {
        throw new Error("車両IDが不明です")
      }

      if (!currentVehicle.name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)

      // 数値フィールドの変換
      const vehicleData = {
        name: currentVehicle.name,
        type: currentVehicle.type,
        location: currentVehicle.location,
        last_inspection_date: currentVehicle.last_inspection_date,
        ownership_type: currentVehicle.ownership_type,
        daily_rate: currentVehicle.daily_rate ? Number.parseFloat(currentVehicle.daily_rate) : null,
        weekly_rate: currentVehicle.weekly_rate ? Number.parseFloat(currentVehicle.weekly_rate) : null,
        monthly_rate: currentVehicle.monthly_rate ? Number.parseFloat(currentVehicle.monthly_rate) : null,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("vehicles").update(vehicleData).eq("id", currentVehicle.id).select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "車両情報が正常に更新されました",
      })

      fetchVehicles()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("車両の更新に失敗しました:", error)
      toast({
        title: "エラー",
        description: "車両の更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteVehicle(id: string) {
    try {
      if (!confirm("この車両を削除してもよろしいですか？")) {
        return
      }

      setIsLoading(true)
      const { error } = await supabase.from("vehicles").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "車両が正常に削除されました",
      })

      fetchVehicles()
    } catch (error) {
      console.error("車両の削除に失敗しました:", error)
      toast({
        title: "エラー",
        description: "車両の削除に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownership_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getOwnershipBadge = (type: string) => {
    switch (type) {
      case "自社保有":
        return <Badge className="bg-green-500 hover:bg-green-600">自社保有</Badge>
      case "リース":
        return <Badge className="bg-blue-500 hover:bg-blue-600">リース</Badge>
      case "その他":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">その他</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>車両一覧</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規車両
          </Button>

          {isAddDialogOpen && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>新規車両の追加</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      車両名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={newVehicle.name}
                      onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                      placeholder="例: 4tダンプ1号車"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">車両タイプ</Label>
                    <Input
                      id="type"
                      value={newVehicle.type}
                      onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                      placeholder="例: トラック、ダンプ、バックホー"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">保管場所</Label>
                    <Input
                      id="location"
                      value={newVehicle.location}
                      onChange={(e) => setNewVehicle({ ...newVehicle, location: e.target.value })}
                      placeholder="例: 東京倉庫、横浜工場"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_inspection_date">最終点検日</Label>
                    <Input
                      id="last_inspection_date"
                      type="date"
                      value={newVehicle.last_inspection_date}
                      onChange={(e) => setNewVehicle({ ...newVehicle, last_inspection_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ownership_type">所有形態</Label>
                    <select
                      id="ownership_type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newVehicle.ownership_type}
                      onChange={(e) => setNewVehicle({ ...newVehicle, ownership_type: e.target.value })}
                    >
                      <option value="自社保有">自社保有</option>
                      <option value="リース">リース</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="daily_rate">日額（円）</Label>
                      <Input
                        id="daily_rate"
                        type="number"
                        value={newVehicle.daily_rate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, daily_rate: e.target.value })}
                        placeholder="例: 10000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="weekly_rate">週額（円）</Label>
                      <Input
                        id="weekly_rate"
                        type="number"
                        value={newVehicle.weekly_rate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, weekly_rate: e.target.value })}
                        placeholder="例: 50000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="monthly_rate">月額（円）</Label>
                      <Input
                        id="monthly_rate"
                        type="number"
                        value={newVehicle.monthly_rate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, monthly_rate: e.target.value })}
                        placeholder="例: 200000"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                    キャンセル
                  </Button>
                  <Button type="submit" onClick={addVehicle} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    追加
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && vehicles.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>車両名</TableHead>
                <TableHead>種類</TableHead>
                <TableHead>保管場所</TableHead>
                <TableHead>最終点検日</TableHead>
                <TableHead>所有形態</TableHead>
                <TableHead>料金（日/週/月）</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>{vehicle.type || "-"}</TableCell>
                    <TableCell>{vehicle.location || "-"}</TableCell>
                    <TableCell>{formatDate(vehicle.last_inspection_date)}</TableCell>
                    <TableCell>{getOwnershipBadge(vehicle.ownership_type)}</TableCell>
                    <TableCell>
                      <div>{vehicle.daily_rate ? `¥${vehicle.daily_rate.toLocaleString()}/日` : "-"}</div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.weekly_rate ? `¥${vehicle.weekly_rate.toLocaleString()}/週` : "-"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.monthly_rate ? `¥${vehicle.monthly_rate.toLocaleString()}/月` : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentVehicle(vehicle)
                            setIsEditDialogOpen(true)
                          }}
                          className="border-gold text-gold hover:bg-gold/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isEditDialogOpen && currentVehicle && currentVehicle.id === vehicle.id && (
                          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>車両の編集</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">車両名</Label>
                                  <Input
                                    id="edit-name"
                                    value={currentVehicle.name}
                                    onChange={(e) => setCurrentVehicle({ ...currentVehicle, name: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-type">車両タイプ</Label>
                                  <Input
                                    id="edit-type"
                                    value={currentVehicle.type || ""}
                                    onChange={(e) => setCurrentVehicle({ ...currentVehicle, type: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-location">保管場所</Label>
                                  <Input
                                    id="edit-location"
                                    value={currentVehicle.location || ""}
                                    onChange={(e) => setCurrentVehicle({ ...currentVehicle, location: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-last_inspection_date">最終点検日</Label>
                                  <Input
                                    id="edit-last_inspection_date"
                                    type="date"
                                    value={currentVehicle.last_inspection_date?.split("T")[0] || ""}
                                    onChange={(e) =>
                                      setCurrentVehicle({ ...currentVehicle, last_inspection_date: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-ownership_type">所有形態</Label>
                                  <select
                                    id="edit-ownership_type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={currentVehicle.ownership_type}
                                    onChange={(e) =>
                                      setCurrentVehicle({ ...currentVehicle, ownership_type: e.target.value })
                                    }
                                  >
                                    <option value="自社保有">自社保有</option>
                                    <option value="リース">リース</option>
                                    <option value="その他">その他</option>
                                  </select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-daily_rate">日額（円）</Label>
                                    <Input
                                      id="edit-daily_rate"
                                      type="number"
                                      value={currentVehicle.daily_rate || ""}
                                      onChange={(e) =>
                                        setCurrentVehicle({ ...currentVehicle, daily_rate: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-weekly_rate">週額（円）</Label>
                                    <Input
                                      id="edit-weekly_rate"
                                      type="number"
                                      value={currentVehicle.weekly_rate || ""}
                                      onChange={(e) =>
                                        setCurrentVehicle({ ...currentVehicle, weekly_rate: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-monthly_rate">月額（円）</Label>
                                    <Input
                                      id="edit-monthly_rate"
                                      type="number"
                                      value={currentVehicle.monthly_rate || ""}
                                      onChange={(e) =>
                                        setCurrentVehicle({ ...currentVehicle, monthly_rate: e.target.value })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsEditDialogOpen(false)}
                                  disabled={isLoading}
                                >
                                  キャンセル
                                </Button>
                                <Button type="submit" onClick={updateVehicle} disabled={isLoading}>
                                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  保存
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteVehicle(vehicle.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "検索条件に一致する車両が見つかりません" : "車両がありません"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
