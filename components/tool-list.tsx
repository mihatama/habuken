"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { fetchClientData, updateClientData, deleteClientData, getClientSupabase } from "@/lib/supabase-utils"
import { ToolForm } from "./tool-form"

export function ToolList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentTool, setCurrentTool] = useState<any>(null)
  const [resourceTypeField, setResourceTypeField] = useState<string | null>("type")

  const queryClient = useQueryClient()

  // データ取得用のカスタムフック
  const {
    data: tools = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      try {
        const { data } = await fetchClientData("resources", {
          filters: { [resourceTypeField || "type"]: "工具" },
          order: { column: "name", ascending: true },
        })
        return data || []
      } catch (error) {
        toast({
          title: "エラー",
          description: "工具データの取得に失敗しました",
          variant: "destructive",
        })
        console.error("工具データ取得エラー:", error)
        return []
      }
    },
  })

  // 工具更新用のミューテーション
  const updateToolMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = await updateClientData("resources", id, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] })
      toast({
        title: "成功",
        description: "工具が正常に更新されました",
      })
    },
    onError: (error: any) => {
      toast({
        title: "エラー",
        description: "工具の更新に失敗しました",
        variant: "destructive",
      })
      console.error("工具更新エラー:", error)
    },
  })

  // 工具削除用のミューテーション
  const deleteToolMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteClientData("resources", id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] })
      toast({
        title: "成功",
        description: "工具が正常に削除されました",
      })
    },
    onError: (error: any) => {
      toast({
        title: "エラー",
        description: "工具の削除に失敗しました",
        variant: "destructive",
      })
      console.error("工具削除エラー:", error)
    },
  })

  // リソーステーブルのスキーマを確認
  useEffect(() => {
    async function checkResourceSchema() {
      try {
        const { data: columns } = await fetchClientData("resources", { limit: 1 })

        // 使用するフィールド名を特定
        if (columns && columns.length > 0) {
          if ("type" in columns[0]) {
            setResourceTypeField("type")
          } else if ("resource_type" in columns[0]) {
            setResourceTypeField("resource_type")
          }
        }
      } catch (error) {
        console.error("スキーマ確認エラー:", error)
      }
    }

    checkResourceSchema()
  }, [])

  // 検索フィルター
  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool.location && tool.location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // 工具の更新
  const handleEditTool = async () => {
    if (!currentTool) return

    try {
      const updateData: any = {
        name: currentTool.name,
        location: currentTool.location,
        status: currentTool.status,
        last_inspection_date: currentTool.last_inspection_date,
        updated_at: new Date().toISOString(),
      }

      await updateToolMutation.mutateAsync({
        id: currentTool.id,
        data: updateData,
      })

      setIsEditDialogOpen(false)
      setCurrentTool(null)
    } catch (error) {
      console.error("工具更新エラー:", error)
    }
  }

  // 工具の削除
  const handleDeleteTool = async (id: string) => {
    if (!confirm("この工具を削除してもよろしいですか？")) return

    try {
      // 関連データを先に削除
      const supabase = getClientSupabase()
      await supabase.from("resource_project").delete().eq("resource_id", id)
      await supabase.from("resource_staff").delete().eq("resource_id", id)

      // 工具を削除
      await deleteToolMutation.mutateAsync(id)
    } catch (error) {
      console.error("工具削除エラー:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "利用可能":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "利用中":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      case "メンテナンス中":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4"></div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規追加
          </Button>
          <ToolForm open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={() => refetch()} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>保管場所</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>関連情報</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : filteredTools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  データがありません
                </TableCell>
              </TableRow>
            ) : (
              filteredTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell>{tool.location || "-"}</TableCell>
                  <TableCell>{getStatusBadge(tool.status || "利用可能")}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">{/* プロジェクト情報は必要に応じて非同期で取得 */}</div>
                      <div className="flex flex-wrap gap-1">{/* スタッフ情報は必要に応じて非同期で取得 */}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Dialog
                        open={isEditDialogOpen && currentTool?.id === tool.id}
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open)
                          if (open) setCurrentTool(tool)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setCurrentTool(tool)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>工具の編集</DialogTitle>
                          </DialogHeader>
                          {currentTool && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">名称</Label>
                                <Input
                                  id="edit-name"
                                  value={currentTool.name}
                                  onChange={(e) => setCurrentTool({ ...currentTool, name: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-location">保管場所</Label>
                                <Input
                                  id="edit-location"
                                  value={currentTool.location || ""}
                                  onChange={(e) => setCurrentTool({ ...currentTool, location: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-status">状態</Label>
                                <select
                                  id="edit-status"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  value={currentTool.status || "利用可能"}
                                  onChange={(e) => setCurrentTool({ ...currentTool, status: e.target.value })}
                                >
                                  <option>利用可能</option>
                                  <option>利用中</option>
                                  <option>メンテナンス中</option>
                                </select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-lastMaintenance">最終メンテナンス日</Label>
                                <Input
                                  id="edit-lastMaintenance"
                                  type="date"
                                  value={
                                    currentTool.last_inspection_date
                                      ? new Date(currentTool.last_inspection_date).toISOString().split("T")[0]
                                      : ""
                                  }
                                  onChange={(e) =>
                                    setCurrentTool({
                                      ...currentTool,
                                      last_inspection_date: e.target.value ? e.target.value : null,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button type="submit" onClick={handleEditTool}>
                              保存
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteTool(tool.id)}>
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
