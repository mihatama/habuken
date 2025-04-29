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

export function ToolList() {
  const { toast } = useToast()
  const supabase = getClientSupabase() // シングルトンインスタンスを使用

  const [tools, setTools] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentTool, setCurrentTool] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newTool, setNewTool] = useState({
    name: "",
    type: "工具",
    model: "",
    manufacturer: "",
    purchase_date: "",
    storage_location: "",
    condition: "good",
    last_maintenance_date: "",
  })

  useEffect(() => {
    fetchTools()
  }, [])

  async function fetchTools() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("type", "工具")
        .order("name", { ascending: true })

      if (error) {
        throw error
      }

      setTools(data || [])
    } catch (error) {
      console.error("備品の取得に失敗しました:", error)
      toast({
        title: "エラー",
        description: "備品の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function addTool() {
    try {
      if (!newTool.name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase.from("resources").insert([newTool]).select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "備品が正常に追加されました",
      })

      setNewTool({
        name: "",
        type: "工具",
        model: "",
        manufacturer: "",
        purchase_date: "",
        storage_location: "",
        condition: "good",
        last_maintenance_date: "",
      })

      fetchTools()
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("備品の追加に失敗しました:", error)
      toast({
        title: "エラー",
        description: "備品の追加に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateTool() {
    try {
      if (!currentTool || !currentTool.id) {
        throw new Error("備品IDが不明です")
      }

      if (!currentTool.name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase
        .from("resources")
        .update({
          name: currentTool.name,
          model: currentTool.model,
          manufacturer: currentTool.manufacturer,
          purchase_date: currentTool.purchase_date,
          storage_location: currentTool.storage_location,
          condition: currentTool.condition,
          last_maintenance_date: currentTool.last_maintenance_date,
        })
        .eq("id", currentTool.id)
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "備品情報が正常に更新されました",
      })

      fetchTools()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("備品の更新に失敗しました:", error)
      toast({
        title: "エラー",
        description: "備品の更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteTool(id: string) {
    try {
      if (!confirm("この備品を削除してもよろしいですか？")) {
        return
      }

      setIsLoading(true)
      const { error } = await supabase.from("resources").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "備品が正常に削除されました",
      })

      fetchTools()
    } catch (error) {
      console.error("備品の削除に失敗しました:", error)
      toast({
        title: "エラー",
        description: "備品の削除に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTools = tools.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.storage_location?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "excellent":
        return <Badge className="bg-green-500 hover:bg-green-600">優良</Badge>
      case "good":
        return <Badge className="bg-blue-500 hover:bg-blue-600">良好</Badge>
      case "fair":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">普通</Badge>
      case "poor":
        return <Badge className="bg-red-500 hover:bg-red-600">不良</Badge>
      default:
        return <Badge>{condition}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>備品一覧</CardTitle>
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
                新規備品
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規備品の追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="model">型式</Label>
                    <Input
                      id="model"
                      value={newTool.model}
                      onChange={(e) => setNewTool({ ...newTool, model: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="manufacturer">メーカー</Label>
                    <Input
                      id="manufacturer"
                      value={newTool.manufacturer}
                      onChange={(e) => setNewTool({ ...newTool, manufacturer: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purchase_date">購入日</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={newTool.purchase_date}
                    onChange={(e) => setNewTool({ ...newTool, purchase_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="storage_location">保管場所</Label>
                  <Input
                    id="storage_location"
                    value={newTool.storage_location}
                    onChange={(e) => setNewTool({ ...newTool, storage_location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition">状態</Label>
                  <select
                    id="condition"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTool.condition}
                    onChange={(e) => setNewTool({ ...newTool, condition: e.target.value })}
                  >
                    <option value="excellent">優良</option>
                    <option value="good">良好</option>
                    <option value="fair">普通</option>
                    <option value="poor">不良</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_maintenance_date">最終メンテナンス日</Label>
                  <Input
                    id="last_maintenance_date"
                    type="date"
                    value={newTool.last_maintenance_date}
                    onChange={(e) => setNewTool({ ...newTool, last_maintenance_date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={addTool} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && tools.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>型式/メーカー</TableHead>
                <TableHead>購入日</TableHead>
                <TableHead>保管場所</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>最終メンテナンス日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell>
                      {tool.model ? (
                        <div>
                          <div>{tool.model}</div>
                          {tool.manufacturer && (
                            <div className="text-sm text-muted-foreground">{tool.manufacturer}</div>
                          )}
                        </div>
                      ) : tool.manufacturer ? (
                        tool.manufacturer
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(tool.purchase_date)}</TableCell>
                    <TableCell>{tool.storage_location || "-"}</TableCell>
                    <TableCell>{getConditionBadge(tool.condition)}</TableCell>
                    <TableCell>{formatDate(tool.last_maintenance_date)}</TableCell>
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
                              <DialogTitle>備品の編集</DialogTitle>
                            </DialogHeader>
                            {currentTool && (
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">名前</Label>
                                  <Input
                                    id="edit-name"
                                    value={currentTool.name}
                                    onChange={(e) => setCurrentTool({ ...currentTool, name: e.target.value })}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-model">型式</Label>
                                    <Input
                                      id="edit-model"
                                      value={currentTool.model || ""}
                                      onChange={(e) => setCurrentTool({ ...currentTool, model: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-manufacturer">メーカー</Label>
                                    <Input
                                      id="edit-manufacturer"
                                      value={currentTool.manufacturer || ""}
                                      onChange={(e) => setCurrentTool({ ...currentTool, manufacturer: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-purchase_date">購入日</Label>
                                  <Input
                                    id="edit-purchase_date"
                                    type="date"
                                    value={currentTool.purchase_date ? currentTool.purchase_date.split("T")[0] : ""}
                                    onChange={(e) => setCurrentTool({ ...currentTool, purchase_date: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-storage_location">保管場所</Label>
                                  <Input
                                    id="edit-storage_location"
                                    value={currentTool.storage_location || ""}
                                    onChange={(e) =>
                                      setCurrentTool({ ...currentTool, storage_location: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-condition">状態</Label>
                                  <select
                                    id="edit-condition"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={currentTool.condition}
                                    onChange={(e) => setCurrentTool({ ...currentTool, condition: e.target.value })}
                                  >
                                    <option value="excellent">優良</option>
                                    <option value="good">良好</option>
                                    <option value="fair">普通</option>
                                    <option value="poor">不良</option>
                                  </select>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-last_maintenance_date">最終メンテナンス日</Label>
                                  <Input
                                    id="edit-last_maintenance_date"
                                    type="date"
                                    value={
                                      currentTool.last_maintenance_date
                                        ? currentTool.last_maintenance_date.split("T")[0]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setCurrentTool({ ...currentTool, last_maintenance_date: e.target.value })
                                    }
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                                キャンセル
                              </Button>
                              <Button type="submit" onClick={updateTool} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                保存
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="icon" onClick={() => deleteTool(tool.id)} disabled={isLoading}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "検索条件に一致する備品が見つかりません" : "備品がありません"}
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
