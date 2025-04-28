"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileEdit, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getVehiclesData, deleteClientData } from "@/lib/supabase-utils"
import { VehicleForm } from "./vehicle-form"

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const { data } = await getVehiclesData()
      setVehicles(data || [])
    } catch (error) {
      console.error("車両データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "車両データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("この車両を削除してもよろしいですか？")) return

    try {
      await deleteClientData("vehicles", id)
      toast({
        title: "成功",
        description: "車両を削除しました",
      })
      fetchVehicles()
    } catch (error) {
      console.error("車両削除エラー:", error)
      toast({
        title: "エラー",
        description: "車両の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getVehicleTypeName = (type: string) => {
    switch (type) {
      case "truck":
        return "トラック"
      case "bus":
        return "バス"
      case "car":
        return "乗用車"
      case "van":
        return "バン"
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500 hover:bg-green-600">利用可能</Badge>
      case "in_use":
        return <Badge className="bg-blue-500 hover:bg-blue-600">使用中</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">メンテナンス中</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>車両管理</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="検索..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規追加
          </Button>
          <VehicleForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchVehicles} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>車両名</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>登録番号</TableHead>
              <TableHead>メーカー/モデル</TableHead>
              <TableHead>年式</TableHead>
              <TableHead>積載量/定員</TableHead>
              <TableHead>状態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  車両が見つかりません
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>{getVehicleTypeName(vehicle.type)}</TableCell>
                  <TableCell>{vehicle.registration_number}</TableCell>
                  <TableCell>
                    {vehicle.manufacturer} {vehicle.model}
                  </TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.capacity}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="icon">
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
