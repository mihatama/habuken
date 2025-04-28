"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table"
import { type OwnershipType, ResourceStatus } from "@/types/enums"
import { getClientSupabase } from "@/lib/supabase-utils"
import { useToast } from "@/hooks/use-toast"
import { HeavyMachineryForm } from "./heavy-machinery-form"

// 重機データの型定義
interface HeavyMachinery {
  id: string
  name: string
  type: string
  model: string
  manufacturer: string
  year: number
  status: ResourceStatus
  ownership: OwnershipType
  last_maintenance: string
  next_maintenance: string
}

export function HeavyMachineryManagement() {
  const [heavyMachinery, setHeavyMachinery] = useState<HeavyMachinery[]>([])
  const [newMachinery, setNewMachinery] = useState<Partial<HeavyMachinery>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // 重機データを取得
  const fetchHeavyMachinery = async () => {
    setIsLoading(true)
    try {
      const supabase = getClientSupabase()
      const { data, error } = await supabase
        .from("heavy_machinery")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setHeavyMachinery(data || [])
    } catch (error) {
      console.error("重機データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "重機データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    fetchHeavyMachinery()
  }, [])

  // 検索結果をフィルタリング
  const filteredMachinery = heavyMachinery.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 重機の状態を更新
  const updateMachineryStatus = async (id: string, status: ResourceStatus) => {
    try {
      const supabase = getClientSupabase()
      const { error } = await supabase
        .from("heavy_machinery")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      // 状態を更新
      setHeavyMachinery(heavyMachinery.map((machine) => (machine.id === id ? { ...machine, status } : machine)))

      toast({
        title: "成功",
        description: "重機の状態を更新しました",
      })
    } catch (error) {
      console.error("重機状態更新エラー:", error)
      toast({
        title: "エラー",
        description: "重機の状態更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-end mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setIsAddDialogOpen(true)}>新規重機登録</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>重機一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>種類</TableHead>
                <TableHead>型式</TableHead>
                <TableHead>メーカー</TableHead>
                <TableHead>年式</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>所有形態</TableHead>
                <TableHead>前回点検日</TableHead>
                <TableHead>次回点検日</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : filteredMachinery.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredMachinery.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell className="font-medium">{machine.name}</TableCell>
                    <TableCell>{machine.type}</TableCell>
                    <TableCell>{machine.model}</TableCell>
                    <TableCell>{machine.manufacturer}</TableCell>
                    <TableCell>{machine.year}</TableCell>
                    <TableCell>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                          machine.status === ResourceStatus.Available
                            ? "bg-green-100 text-green-800"
                            : machine.status === ResourceStatus.InUse
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {machine.status}
                      </div>
                    </TableCell>
                    <TableCell>{machine.ownership}</TableCell>
                    <TableCell>{machine.last_maintenance || "-"}</TableCell>
                    <TableCell>{machine.next_maintenance || "-"}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={machine.status}
                        onValueChange={(value) => updateMachineryStatus(machine.id, value as ResourceStatus)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="状態を変更" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ResourceStatus.Available}>利用可能</SelectItem>
                          <SelectItem value={ResourceStatus.InUse}>利用中</SelectItem>
                          <SelectItem value={ResourceStatus.UnderMaintenance}>メンテナンス中</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 重機登録フォーム */}
      <HeavyMachineryForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchHeavyMachinery} />
    </div>
  )
}
