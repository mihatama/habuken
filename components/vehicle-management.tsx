"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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
    model: "",
    manufacturer: "",
    year: "",
    license_plate: "",
    ownership_type: "owned",
    location: "",
    status: "available",
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function fetchVehicles() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("vehicles").select("*").order("name", { ascending: true })

      if (error) {
        throw error
      }

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
      const { data, error } = await supabase.from("vehicles").insert([newVehicle]).select()

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
        model: "",
        manufacturer: "",
        year: "",
        license_plate: "",
        ownership_type: "owned",
        location: "",
        status: "available",
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
      const { data, error } = await supabase
        .from("vehicles")
        .update({
          name: currentVehicle.name,
          type: currentVehicle.type,
          model: currentVehicle.model,
          manufacturer: currentVehicle.manufacturer,
          year: currentVehicle.year,
          license_plate: currentVehicle.license_plate,
          ownership_type: currentVehicle.ownership_type,
          location: currentVehicle.location,
          status: currentVehicle.status,
        })
        .eq("id", currentVehicle.id)
        .select()

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
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500 hover:bg-green-600">利用可能</Badge>
      case "in_use":
        return <Badge className="bg-blue-500 hover:bg-blue-600">使用中</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">整備中</Badge>
      case "unavailable":
        return <Badge className="bg-red-500 hover:bg-red-600">利用不可</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getOwnershipBadge = (type: string) => {
    switch (type) {
      case "owned":
        return <Badge variant="outline">自社所有</Badge>
      case "leased":
        return <Badge variant="outline">リース</Badge>
      case "rented":
        return <Badge variant="outline">レンタル</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規車両
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規車両の追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newVehicle.name}
                    onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">種類</Label>
                  <Input
                    id="type"
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="model">型式</Label>
                    <Input
                      id="model"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">年式</Label>
                    <Input
                      id="year"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="manufacturer">メーカー</Label>
                  <Input
                    id="manufacturer"
                    value={newVehicle.manufacturer}
                    onChange={(e) => setNewVehicle({ ...newVehicle, manufacturer: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="license_plate">ナンバープレート</Label>
                  <Input
                    id="license_plate"
                    value={newVehicle.license_plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value })}
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
                    <option value="owned">自社所有</option>
                    <option value="leased">リース</option>
                    <option value="rented">レンタル</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">保管場所</Label>
                  <Input
                    id="location"
                    value={newVehicle.location}
                    onChange={(e) => setNewVehicle({ ...newVehicle, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">ステータス</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newVehicle.status}
                    onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value })}
                  >
                    <option value="available">利用可能</option>
                    <option value="in_use">使用中</option>
                    <option value="maintenance">整備中</option>
                    <option value="unavailable">利用不可</option>
                  </select>
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
                <TableHead>名前</TableHead>
                <TableHead>種類</TableHead>
                <TableHead>型式/メーカー</TableHead>
                <TableHead>ナンバー</TableHead>
                <TableHead>所有形態</TableHead>
                <TableHead>保管場所</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>{vehicle.type || "-"}</TableCell>
                    <TableCell>
                      {vehicle.model ? (
                        <div>
                          <div>{vehicle.model}</div>
                          {vehicle.manufacturer && (
                            <div className="text-sm text-muted-foreground">{vehicle.manufacturer}</div>
                          )}
                          {vehicle.year && <div className="text-sm text-muted-foreground">{vehicle.year}年式</div>}
                        </div>
                      ) : vehicle.manufacturer ? (
                        <div>
                          <div>{vehicle.manufacturer}</div>
                          {vehicle.year && <div className="text-sm text-muted-foreground">{vehicle.year}年式</div>}
                        </div>
                      ) : vehicle.year ? (
                        <div>{vehicle.year}年式</div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{vehicle.license_plate || "-"}</TableCell>
                    <TableCell>{getOwnershipBadge(vehicle.ownership_type)}</TableCell>
                    <TableCell>{vehicle.location || "-"}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog
                          open={isEditDialogOpen && currentVehicle?.id === vehicle.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (open) setCurrentVehicle(vehicle)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCurrentVehicle(vehicle)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>車両の編集</DialogTitle>
                            </DialogHeader>
                            {currentVehicle && (
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">名前</Label>
                                  <Input
                                    id="edit-name"
                                    value={currentVehicle.name}
                                    onChange={(e) => setCurrentVehicle({ ...currentVehicle, name: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-type">種類</Label>
                                  <Input
                                    id="edit-type"
                                    value={currentVehicle.type || ""}
                                    onChange={(e) => setCurrentVehicle({ ...currentVehicle, type: e.target.value })}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-model">型式</Label>
                                    <Input
                                      id="edit-model"
                                      value={currentVehicle.model || ""}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, model: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-year">年式</Label>
                                    <Input
                                      id="edit-year"
                                      value={currentVehicle.year || ""}
                                      onChange={(e) => setCurrentVehicle({ ...currentVehicle, year: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-manufacturer">メーカー</Label>
                                  <Input
                                    id="edit-manufacturer"
                                    value={currentVehicle.manufacturer || ""}
                                    onChange={(e) =>
                                      setCurrentVehicle({ ...currentVehicle, manufacturer: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-license_plate">ナンバープレート</Label>
                                  <Input
                                    id="edit-license_plate"
                                    value={currentVehicle.license_plate || ""}
                                    onChange={(e) =>
                                      setCurrentVehicle({ ...currentVehicle, license_plate: e.target.value })
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
                                    <option value="owned">自社所有</option>
                                    <option value="leased">リース</option>
                                    <option value="rented">レンタル</option>
                                  </select>
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
                                  <Label htmlFor="edit-status">ステータス</Label>
                                  <select
                                    id="edit-status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={currentVehicle.status}
                                    onChange={(e) => setCurrentVehicle({ ...currentVehicle, status: e.target.value })}
                                  >
                                    <option value="available">利用可能</option>
                                    <option value="in_use">使用中</option>
                                    <option value="maintenance">整備中</option>
                                    <option value="unavailable">利用不可</option>
                                  </select>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                                キャンセル
                              </Button>
                              <Button type="submit" onClick={updateVehicle} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                保存
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
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
