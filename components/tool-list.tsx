"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/supabaseClient"

export function ToolList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentTool, setCurrentTool] = useState<any>(null)
  const [newTool, setNewTool] = useState({
    name: "",
    type: "工具", // デフォルト値を設定
    resource_type: "工具", // 代替フィールド
    location: "",
    status: "利用可能",
    last_inspection_date: "",
  })

  const [resourceTypeField, setResourceTypeField] = useState<string | null>("type")

  const queryClient = useQueryClient()
  const { toast } = useToast()

  // データ取得用のカスタムフック
  const { data: tools = [], isLoading: loading } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("resources")
          .select("*")
          .eq(resourceTypeField || "type", "工具")
          .order("name", { ascending: true })

        if (error) throw error
        return data || []
      } catch (error: any) {
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

  // 工具追加用のミューテーション
  const addToolMutation = useMutation({
    mutationFn: async (data: any) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase.from("resources").insert(data).select()
      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] })
      toast({
        title: "成功",
        description: "工具が正常に追加されました",
      })
      setIsAddDialogOpen(false)
      setNewTool({
        name: "",
        type: "工具",
        resource_type: "工具",
        location: "",
        status: "利用可能",
        last_inspection_date: "",
      })
    },
    onError: (error: any) => {
      toast({
        title: "エラー",
        description: "工具の追加に失敗しました",
        variant: "destructive",
      })
      console.error("工具追加エラー:", error)
    },
  })

  // 工具更新用のミューテーション
  const updateToolMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase.from("resources").update(data).eq("id", id).select()
      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] })
      toast({
        title: "成功",
        description: "工具が正常に更新されました",
      })
      setIsEditDialogOpen(false)
      setCurrentTool(null)
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
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("resources").delete().eq("id", id)
      if (error) throw error
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
        const supabase = getSupabaseClient()
        const { data: columns } = await supabase.from("resources").select("*").limit(1)

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

  // 工具の追加
  const handleAddTool = async () => {
    try {
      if (!newTool.name) {
        toast({
          title: "入力エラー",
          description: "工具名は必須です",
          variant: "destructive",
        })
        return
      }

      const insertData: any = {
        name: newTool.name,
        location: newTool.location,
        status: newTool.status,
        last_inspection_date: newTool.last_inspection_date || null,
      }

      // 適切なフィールド名を使用
      if (resourceTypeField === "type") {
        insertData.type = "工具"
      } else if (resourceTypeField === "resource_type") {
        insertData.resource_type = "工具"
      }

      await addToolMutation.mutateAsync(insertData)
    } catch (error) {
      console.error("工具追加エラー:", error)
    }
  }

  // 工具の更新
  const handleEditTool = async () => {
    if (!currentTool) return

    try {
      if (!currentTool.name) {
        toast({
          title: "入力エラー",
          description: "工具名は必須です",
          variant: "destructive",
        })
        return
      }

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
    } catch (error) {
      console.error("工具更新エラー:", error)
    }
  }

  // 工具の削除
  const handleDeleteTool = async (id: string) => {
    if (!confirm("この工具を削除してもよろしいですか？")) return

    try {
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

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>工具一覧</CardTitle>
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
                新規追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>工具の追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">名称</Label>
                  <Input
                    id="name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">保管場所</Label>
                  <Input
                    id="location"
                    value={newTool.location}
                    onChange={(e) => setNewTool({ ...newTool, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">状態</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTool.status}
                    onChange={(e) => setNewTool({ ...newTool, status: e.target.value })}
                  >
                    <option>利用可能</option>
                    <option>利用中</option>
                    <option>メンテナンス中</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastMaintenance">最終メンテナンス日</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={newTool.last_inspection_date}
                    onChange={(e) => setNewTool({ ...newTool, last_inspection_date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={handleAddTool} disabled={addToolMutation.isPending}>
                  {addToolMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>保管場所</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>最終メンテナンス日</TableHead>
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
                  <TableCell>{tool.last_inspection_date ? formatDate(tool.last_inspection_date) : "-"}</TableCell>
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
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              キャンセル
                            </Button>
                            <Button type="submit" onClick={handleEditTool} disabled={updateToolMutation.isPending}>
                              {updateToolMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
