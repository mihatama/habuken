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

export function HeavyMachineryManagement() {
  const { toast } = useToast()
  const supabase = getClientSupabase() // シングルトンインスタンスを使用

  const [machinery, setMachinery] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentMachinery, setCurrentMachinery] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newMachinery, setNewMachinery] = useState({
    name: "",
    type: "",
    location: "",
    ownership_type: "自社保有",
    last_inspection_date: "",
    daily_rate: "",
    weekly_rate: "",
    monthly_rate: "",
  })

  useEffect(() => {
    fetchMachinery()
  }, [])

  async function fetchMachinery() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("heavy_machinery").select("*").order("name", { ascending: true })

      if (error) {
        throw error
      }

      setMachinery(data || [])
    } catch (error) {
      console.error("重機の取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "重機の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function addMachinery() {
    try {
      if (!newMachinery.name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)

      // 数値フィールドの処理
      const machineryData = {
        ...newMachinery,
        // 空の日付文字列の場合はnullを設定
        last_inspection_date: newMachinery.last_inspection_date || null,
        daily_rate: newMachinery.daily_rate ? Number.parseFloat(newMachinery.daily_rate) : null,
        weekly_rate: newMachinery.weekly_rate ? Number.parseFloat(newMachinery.weekly_rate) : null,
        monthly_rate: newMachinery.monthly_rate ? Number.parseFloat(newMachinery.monthly_rate) : null,
      }

      const { data, error } = await supabase.from("heavy_machinery").insert([machineryData]).select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "重機が正常に追加されました",
      })

      setNewMachinery({
        name: "",
        type: "",
        location: "",
        ownership_type: "自社保有",
        last_inspection_date: "",
        daily_rate: "",
        weekly_rate: "",
        monthly_rate: "",
      })

      fetchMachinery()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("重機の追加に失敗しました:", error)
      toast({
        title: "エラー",
        description: `重機の追加に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateMachinery() {
    try {
      if (!currentMachinery || !currentMachinery.id) {
        throw new Error("重機IDが不明です")
      }

      if (!currentMachinery.name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)

      // 数値フィールドの処理
      const updateData = {
        name: currentMachinery.name,
        type: currentMachinery.type,
        location: currentMachinery.location,
        ownership_type: currentMachinery.ownership_type,
        // 空の日付文字列の場合はnullを設定
        last_inspection_date: currentMachinery.last_inspection_date || null,
        daily_rate: currentMachinery.daily_rate ? Number.parseFloat(String(currentMachinery.daily_rate)) : null,
        weekly_rate: currentMachinery.weekly_rate ? Number.parseFloat(String(currentMachinery.weekly_rate)) : null,
        monthly_rate: currentMachinery.monthly_rate ? Number.parseFloat(String(currentMachinery.monthly_rate)) : null,
      }

      const { data, error } = await supabase
        .from("heavy_machinery")
        .update(updateData)
        .eq("id", currentMachinery.id)
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "重機情報が正常に更新されました",
      })

      fetchMachinery()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("重機の更新に失敗しました:", error)
      toast({
        title: "エラー",
        description: `重機の更新に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteMachinery(id: string) {
    try {
      if (!confirm("この重機を削除してもよろしいですか？")) {
        return
      }

      setIsLoading(true)
      const { error } = await supabase.from("heavy_machinery").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "重機が正常に削除されました",
      })

      fetchMachinery()
    } catch (error) {
      console.error("重機の削除に失敗しました:", error)
      toast({
        title: "エラー",
        description: "重機の削除に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMachinery = machinery.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getOwnershipBadge = (type: string) => {
    switch (type) {
      case "自社保有":
        return <Badge className="bg-green-500 hover:bg-green-600">自社所有</Badge>
      case "リース":
        return <Badge className="bg-blue-500 hover:bg-blue-600">リース</Badge>
      case "その他":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">その他</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>重機一覧</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                新規重機
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規重機の追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newMachinery.name}
                    onChange={(e) => setNewMachinery({ ...newMachinery, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">種類</Label>
                  <Input
                    id="type"
                    value={newMachinery.type}
                    onChange={(e) => setNewMachinery({ ...newMachinery, type: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">保管場所</Label>
                  <Input
                    id="location"
                    value={newMachinery.location}
                    onChange={(e) => setNewMachinery({ ...newMachinery, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ownership_type">所有形態</Label>
                  <select
                    id="ownership_type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newMachinery.ownership_type}
                    onChange={(e) => setNewMachinery({ ...newMachinery, ownership_type: e.target.value })}
                  >
                    <option value="自社保有">自社所有</option>
                    <option value="リース">リース</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_inspection_date">最終点検日</Label>
                  <Input
                    id="last_inspection_date"
                    type="date"
                    value={newMachinery.last_inspection_date}
                    onChange={(e) => setNewMachinery({ ...newMachinery, last_inspection_date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="daily_rate">日額料金</Label>
                    <Input
                      id="daily_rate"
                      type="number"
                      value={newMachinery.daily_rate}
                      onChange={(e) => setNewMachinery({ ...newMachinery, daily_rate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weekly_rate">週額料金</Label>
                    <Input
                      id="weekly_rate"
                      type="number"
                      value={newMachinery.weekly_rate}
                      onChange={(e) => setNewMachinery({ ...newMachinery, weekly_rate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="monthly_rate">月額料金</Label>
                    <Input
                      id="monthly_rate"
                      type="number"
                      value={newMachinery.monthly_rate}
                      onChange={(e) => setNewMachinery({ ...newMachinery, monthly_rate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={addMachinery} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && machinery.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>種類</TableHead>
                <TableHead>保管場所</TableHead>
                <TableHead>所有形態</TableHead>
                <TableHead>最終点検日</TableHead>
                <TableHead>料金（日/週/月）</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachinery.length > 0 ? (
                filteredMachinery.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell className="font-medium">{machine.name}</TableCell>
                    <TableCell>{machine.type || "-"}</TableCell>
                    <TableCell>{machine.location || "-"}</TableCell>
                    <TableCell>{getOwnershipBadge(machine.ownership_type)}</TableCell>
                    <TableCell>
                      {machine.last_inspection_date
                        ? new Date(machine.last_inspection_date).toLocaleDateString("ja-JP")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div>{machine.daily_rate ? `¥${machine.daily_rate.toLocaleString()}/日` : "-"}</div>
                      <div className="text-sm text-muted-foreground">
                        {machine.weekly_rate ? `¥${machine.weekly_rate.toLocaleString()}/週` : "-"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {machine.monthly_rate ? `¥${machine.monthly_rate.toLocaleString()}/月` : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog
                          open={isEditDialogOpen && currentMachinery?.id === machine.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (open) setCurrentMachinery(machine)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCurrentMachinery(machine)
                                setIsEditDialogOpen(true)
                              }}
                              className="border-gold text-gold hover:bg-gold/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>重機の編集</DialogTitle>
                            </DialogHeader>
                            {currentMachinery && (
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">名前</Label>
                                  <Input
                                    id="edit-name"
                                    value={currentMachinery.name}
                                    onChange={(e) => setCurrentMachinery({ ...currentMachinery, name: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-type">種類</Label>
                                  <Input
                                    id="edit-type"
                                    value={currentMachinery.type || ""}
                                    onChange={(e) => setCurrentMachinery({ ...currentMachinery, type: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-location">保管場所</Label>
                                  <Input
                                    id="edit-location"
                                    value={currentMachinery.location || ""}
                                    onChange={(e) =>
                                      setCurrentMachinery({ ...currentMachinery, location: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-ownership_type">所有形態</Label>
                                  <select
                                    id="edit-ownership_type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={currentMachinery.ownership_type}
                                    onChange={(e) =>
                                      setCurrentMachinery({ ...currentMachinery, ownership_type: e.target.value })
                                    }
                                  >
                                    <option value="自社保有">自社所有</option>
                                    <option value="リース">リース</option>
                                    <option value="その他">その他</option>
                                  </select>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-last_inspection_date">最終点検日</Label>
                                  <Input
                                    id="edit-last_inspection_date"
                                    type="date"
                                    value={
                                      currentMachinery.last_inspection_date
                                        ? currentMachinery.last_inspection_date.split("T")[0]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setCurrentMachinery({
                                        ...currentMachinery,
                                        last_inspection_date: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-daily_rate">日額料金</Label>
                                    <Input
                                      id="edit-daily_rate"
                                      type="number"
                                      value={currentMachinery.daily_rate || ""}
                                      onChange={(e) =>
                                        setCurrentMachinery({ ...currentMachinery, daily_rate: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-weekly_rate">週額料金</Label>
                                    <Input
                                      id="edit-weekly_rate"
                                      type="number"
                                      value={currentMachinery.weekly_rate || ""}
                                      onChange={(e) =>
                                        setCurrentMachinery({ ...currentMachinery, weekly_rate: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-monthly_rate">月額料金</Label>
                                    <Input
                                      id="edit-monthly_rate"
                                      type="number"
                                      value={currentMachinery.monthly_rate || ""}
                                      onChange={(e) =>
                                        setCurrentMachinery({ ...currentMachinery, monthly_rate: e.target.value })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                                キャンセル
                              </Button>
                              <Button type="submit" onClick={updateMachinery} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                保存
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteMachinery(machine.id)}
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
                    {searchTerm ? "検索条件に一致する重機が見つかりません" : "重機がありません"}
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
