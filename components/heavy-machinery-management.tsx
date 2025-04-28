"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HeavyMachineryForm } from "./heavy-machinery-form"
import { getHeavyMachineryList } from "@/lib/supabase-utils"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface HeavyMachinery {
  id: string
  name: string
  model: string
  type: string
  serial_number: string
  manufacturer: string
  purchase_date: string
  status: string
  notes: string
}

export function HeavyMachineryManagement() {
  const [machinery, setMachinery] = useState<HeavyMachinery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchMachinery = async () => {
    setLoading(true)
    try {
      const data = await getHeavyMachineryList()
      setMachinery(data)
    } catch (error) {
      console.error("重機データの取得に失敗しました:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMachinery()
  }, [])

  const filteredMachinery = machinery.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            利用可能
          </Badge>
        )
      case "in_use":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            使用中
          </Badge>
        )
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            メンテナンス中
          </Badge>
        )
      case "out_of_service":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            使用不可
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case "excavator":
        return "掘削機"
      case "bulldozer":
        return "ブルドーザー"
      case "crane":
        return "クレーン"
      case "loader":
        return "ローダー"
      case "other":
        return "その他"
      default:
        return type
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>重機一覧</CardTitle>
        <HeavyMachineryForm onSuccess={fetchMachinery} />
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="重機を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <p>読み込み中...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>モデル</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>製造元</TableHead>
                  <TableHead>シリアル番号</TableHead>
                  <TableHead>購入日</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMachinery.length > 0 ? (
                  filteredMachinery.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.model}</TableCell>
                      <TableCell>{getTypeName(m.type)}</TableCell>
                      <TableCell>{m.manufacturer}</TableCell>
                      <TableCell>{m.serial_number}</TableCell>
                      <TableCell>{m.purchase_date}</TableCell>
                      <TableCell>{getStatusBadge(m.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      重機が見つかりません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
