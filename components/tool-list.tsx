"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileEdit, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getToolsData, deleteClientData } from "@/lib/supabase-utils"
import { ToolForm } from "./tool-form"

export function ToolList() {
  const [tools, setTools] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const fetchTools = async () => {
    setLoading(true)
    try {
      const { data } = await getToolsData()
      setTools(data || [])
    } catch (error) {
      console.error("備品データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "備品データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTools()
  }, [])

  const handleDeleteTool = async (id: string) => {
    if (!confirm("この備品を削除してもよろしいですか？")) return

    try {
      await deleteClientData("resources", id)
      toast({
        title: "成功",
        description: "備品を削除しました",
      })
      fetchTools()
    } catch (error) {
      console.error("備品削除エラー:", error)
      toast({
        title: "エラー",
        description: "備品の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const filteredTools = tools.filter(
    (tool) =>
      tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getToolTypeName = (type: string) => {
    switch (type) {
      case "hand_tool":
        return "手工具"
      case "power_tool":
        return "電動工具"
      case "equipment":
        return "機器"
      case "other":
        return "その他"
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
      case "broken":
        return <Badge className="bg-red-500 hover:bg-red-600">故障</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>備品管理</CardTitle>
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
          <ToolForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={fetchTools} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>備品名</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>メーカー/モデル</TableHead>
              <TableHead>シリアル番号</TableHead>
              <TableHead>保管場所</TableHead>
              <TableHead>状態</TableHead>
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
            ) : filteredTools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  備品が見つかりません
                </TableCell>
              </TableRow>
            ) : (
              filteredTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell>{getToolTypeName(tool.resource_type)}</TableCell>
                  <TableCell>
                    {tool.manufacturer} {tool.model}
                  </TableCell>
                  <TableCell>{tool.serial_number}</TableCell>
                  <TableCell>{tool.location}</TableCell>
                  <TableCell>{getStatusBadge(tool.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="icon">
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDeleteTool(tool.id)}
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
