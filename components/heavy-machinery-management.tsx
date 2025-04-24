"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

type HeavyMachinery = {
  id: string
  name: string
  type: string
  location: string
  last_inspection_date: string | null
  ownership_type: "自社保有" | "リース" | "その他"
  daily_rate: number | null
  weekly_rate: number | null
  monthly_rate: number | null
  created_at: string
  updated_at: string
}

export function HeavyMachineryManagement() {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [machinery, setMachinery] = useState<HeavyMachinery[]>([])
  const [currentMachine, setCurrentMachine] = useState<HeavyMachinery | null>(null)
  const [loading, setLoading] = useState(true)

  const [newMachine, setNewMachine] = useState({
    name: "",
    type: "",
    location: "",
    last_inspection_date: "",
    ownership_type: "自社保有" as const,
    daily_rate: "",
    weekly_rate: "",
    monthly_rate: "",
  })

  const supabase = createClientComponentClient()

  // 重機データの取得
  const fetchMachinery = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("heavy_machinery")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setMachinery(data || [])
    } catch (error) {
      console.error("重機データの取得エラー:", error)
      toast({
        title: "エラー",
        description: "重機データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 初回読み込み時にデータ取得
  useEffect(() => {
    fetchMachinery()
  }, [])

  // 重機の追加
  const handleAddMachine = async () => {
    try {
      const { data, error } = await supabase
        .from("heavy_machinery")
        .insert({
          name: newMachine.name,
          type: newMachine.type,
          location: newMachine.location,
          last_inspection_date: newMachine.last_inspection_date || null,
          ownership_type: newMachine.ownership_type,
          daily_rate: newMachine.daily_rate ? Number.parseFloat(newMachine.daily_rate) : null,
          weekly_rate: newMachine.weekly_rate ? Number.parseFloat(newMachine.weekly_rate) : null,
          monthly_rate: newMachine.monthly_rate ? Number.parseFloat(newMachine.monthly_rate) : null,
        })
        .select()

      if (error) throw error

      toast({
        title: "成功",
        description: "重機を追加しました",
      })

      setOpen(false)
      setNewMachine({
        name: "",
        type: "",
        location: "",
        last_inspection_date: "",
        ownership_type: "自社保有",
        daily_rate: "",
        weekly_rate: "",
        monthly_rate: "",
      })
      fetchMachinery()
    } catch (error) {
      console.error("重機追加エラー:", error)
      toast({
        title: "エラー",
        description: "重機の追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 重機の更新
  const handleUpdateMachine = async () => {
    if (!currentMachine) return

    try {
      const { error } = await supabase
        .from("heavy_machinery")
        .update({
          name: currentMachine.name,
          type: currentMachine.type,
          location: currentMachine.location,
          last_inspection_date: currentMachine.last_inspection_date,
          ownership_type: currentMachine.ownership_type,
          daily_rate: currentMachine.daily_rate,
          weekly_rate: currentMachine.weekly_rate,
          monthly_rate: currentMachine.monthly_rate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentMachine.id)

      if (error) throw error

      toast({
        title: "成功",
        description: "重機情報を更新しました",
      })

      setEditOpen(false)
      setCurrentMachine(null)
      fetchMachinery()
    } catch (error) {
      console.error("重機更新エラー:", error)
      toast({
        title: "エラー",
        description: "重機情報の更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 重機の削除
  const handleDeleteMachine = async (id: string) => {
    if (!confirm("この重機を削除してもよろしいですか？")) return

    try {
      const { error } = await supabase.from("heavy_machinery").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "成功",
        description: "重機を削除しました",
      })

      fetchMachinery()
    } catch (error) {
      console.error("重機削除エラー:", error)
      toast({
        title: "エラー",
        description: "重機の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  // 検索フィルター
  const filteredMachinery = machinery.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="重機を検索..."
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
              重機を追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規重機登録</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">重機名</Label>
                <Input
                  id="name"
                  placeholder="例: バックホウA"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">重機タイプ</Label>
                <Select
                  value={newMachine.type}
                  onValueChange={(value) => setNewMachine({ ...newMachine, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="重機タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="掘削機">掘削機</SelectItem>
                    <SelectItem value="整地機">整地機</SelectItem>
                    <SelectItem value="揚重機">揚重機</SelectItem>
                    <SelectItem value="運搬機">運搬機</SelectItem>
                    <SelectItem value="コンクリート機械">コンクリート機械</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">配置場所</Label>
                <Input
                  id="location"
                  placeholder="例: 東京現場"
                  value={newMachine.location}
                  onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastMaintenance">最終点検日</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={newMachine.last_inspection_date}
                  onChange={(e) => setNewMachine({ ...newMachine, last_inspection_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ownership">所有形態</Label>
                <Select
                  value={newMachine.ownership_type}
                  onValueChange={(value: "自社保有" | "リース" | "その他") =>
                    setNewMachine({ ...newMachine, ownership_type: value })
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
                    value={newMachine.daily_rate}
                    onChange={(e) => setNewMachine({ ...newMachine, daily_rate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weekly_rate">週額料金</Label>
                  <Input
                    id="weekly_rate"
                    type="number"
                    placeholder="0"
                    value={newMachine.weekly_rate}
                    onChange={(e) => setNewMachine({ ...newMachine, weekly_rate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthly_rate">月額料金</Label>
                  <Input
                    id="monthly_rate"
                    type="number"
                    placeholder="0"
                    value={newMachine.monthly_rate}
                    onChange={(e) => setNewMachine({ ...newMachine, monthly_rate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMachine}>登録</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>重機名</TableHead>
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
            ) : filteredMachinery.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              filteredMachinery.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium">{machine.name}</TableCell>
                  <TableCell>{machine.type}</TableCell>
                  <TableCell>{machine.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        machine.ownership_type === "自社保有"
                          ? "default"
                          : machine.ownership_type === "リース"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {machine.ownership_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {machine.daily_rate ? `¥${machine.daily_rate.toLocaleString()}` : "-"} /
                    {machine.weekly_rate ? `¥${machine.weekly_rate.toLocaleString()}` : "-"} /
                    {machine.monthly_rate ? `¥${machine.monthly_rate.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell>
                    {machine.last_inspection_date ? new Date(machine.last_inspection_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editOpen && currentMachine?.id === machine.id}
                        onOpenChange={(open) => {
                          setEditOpen(open)
                          if (!open) setCurrentMachine(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setCurrentMachine(machine)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">編集</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>重機情報の編集</DialogTitle>
                          </DialogHeader>
                          {currentMachine && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">重機名</Label>
                                <Input
                                  id="edit-name"
                                  value={currentMachine.name}
                                  onChange={(e) => setCurrentMachine({ ...currentMachine, name: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-type">重機タイプ</Label>
                                <Select
                                  value={currentMachine.type}
                                  onValueChange={(value) => setCurrentMachine({ ...currentMachine, type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="掘削機">掘削機</SelectItem>
                                    <SelectItem value="整地機">整地機</SelectItem>
                                    <SelectItem value="揚重機">揚重機</SelectItem>
                                    <SelectItem value="運搬機">運搬機</SelectItem>
                                    <SelectItem value="コンクリート機械">コンクリート機械</SelectItem>
                                    <SelectItem value="その他">その他</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-location">配置場所</Label>
                                <Input
                                  id="edit-location"
                                  value={currentMachine.location}
                                  onChange={(e) => setCurrentMachine({ ...currentMachine, location: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-lastMaintenance">最終点検日</Label>
                                <Input
                                  id="edit-lastMaintenance"
                                  type="date"
                                  value={
                                    currentMachine.last_inspection_date
                                      ? new Date(currentMachine.last_inspection_date).toISOString().split("T")[0]
                                      : ""
                                  }
                                  onChange={(e) =>
                                    setCurrentMachine({ ...currentMachine, last_inspection_date: e.target.value })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-ownership">所有形態</Label>
                                <Select
                                  value={currentMachine.ownership_type}
                                  onValueChange={(value: "自社保有" | "リース" | "その他") =>
                                    setCurrentMachine({ ...currentMachine, ownership_type: value })
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
                                    value={currentMachine.daily_rate || ""}
                                    onChange={(e) =>
                                      setCurrentMachine({
                                        ...currentMachine,
                                        daily_rate: e.target.value ? Number.parseFloat(e.target.value) : null,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-weekly_rate">週額料金</Label>
                                  <Input
                                    id="edit-weekly_rate"
                                    type="number"
                                    value={currentMachine.weekly_rate || ""}
                                    onChange={(e) =>
                                      setCurrentMachine({
                                        ...currentMachine,
                                        weekly_rate: e.target.value ? Number.parseFloat(e.target.value) : null,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-monthly_rate">月額料金</Label>
                                  <Input
                                    id="edit-monthly_rate"
                                    type="number"
                                    value={currentMachine.monthly_rate || ""}
                                    onChange={(e) =>
                                      setCurrentMachine({
                                        ...currentMachine,
                                        monthly_rate: e.target.value ? Number.parseFloat(e.target.value) : null,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button onClick={handleUpdateMachine}>保存</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMachine(machine.id)}>
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
