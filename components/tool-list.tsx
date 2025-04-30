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
import { useAuth } from "@/hooks/use-auth"

export function ToolList() {
  const { toast } = useToast()
  const supabase = getClientSupabase() // シングルトンインスタンスを使用
  const { user } = useAuth() // 認証情報を取得

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
      if (!user) {
        toast({
          title: "認証エラー",
          description: "ログインしてください",
          variant: "destructive",
        })
        return
      }

      if (!newTool.name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)

      // 実際のデータベーススキーマに合わせたデータ構造
      const toolData = {
        name: newTool.name,
        type: "工具",
        status: "available", // デフォルトステータス
        description: `型式: ${newTool.model || "未設定"}, メーカー: ${newTool.manufacturer || "未設定"}, 状態: ${
          newTool.condition
        }, 保管場所: ${newTool.storage_location || "未設定"}, 購入日: ${
          newTool.purchase_date || "未設定"
        }, 最終メンテナンス日: ${newTool.last_maintenance_date || "未設定"}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.id, // ユーザーIDを追加
        project_id: null, // プロジェクトIDがある場合は設定
        organization_id: null, // 組織IDがある場合は設定
      }

      const { data, error } = await supabase.from("resources").insert([toolData]).select()

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
        description: `備品の追加に失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateTool() {
    try {
      if (!user) {
        toast({
          title: "認証エラー",
          description: "ログインしてください",
          variant: "destructive",
        })
        return
      }

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

      // 更新データを準備
      const updateData = {
        name: currentTool.name,
        description: `型式: ${currentTool.model || "未設定"}, メーカー: ${currentTool.manufacturer || "未設定"}, 状態: ${
          currentTool.condition || "good"
        }, 保管場所: ${currentTool.storage_location || "未設定"}, 購入日: ${
          currentTool.purchase_date ? currentTool.purchase_date.split("T")[0] : "未設定"
        }, 最終メンテナンス日: ${
          currentTool.last_maintenance_date ? currentTool.last_maintenance_date.split("T")[0] : "未設定"
        }`,
        updated_at: new Date().toISOString(),
        updated_by: user.id, // 更新者IDを追加
      }

      const { data, error } = await supabase.from("resources").update(updateData).eq("id", currentTool.id).select()

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
        description: `備品の更新に失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteTool(id: string) {
    try {
      if (!user) {
        toast({
          title: "認証エラー",
          description: "ログインしてください",
          variant: "destructive",
        })
        return
      }

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
        description: `備品の削除に失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 説明文から情報を抽出する関数
  const extractInfoFromDescription = (description: string) => {
    const info: any = {
      model: "",
      manufacturer: "",
      condition: "good",
      storage_location: "",
      purchase_date: "",
      last_maintenance_date: "",
    }

    if (!description) return info

    // 型式を抽出
    const modelMatch = description.match(/型式: ([^,]+)/)
    if (modelMatch && modelMatch[1] !== "未設定") info.model = modelMatch[1]

    // メーカーを抽出
    const manufacturerMatch = description.match(/メーカー: ([^,]+)/)
    if (manufacturerMatch && manufacturerMatch[1] !== "未設定") info.manufacturer = manufacturerMatch[1]

    // 状態を抽出
    const conditionMatch = description.match(/状態: ([^,]+)/)
    if (conditionMatch && conditionMatch[1] !== "未設定") info.condition = conditionMatch[1]

    // 保管場所を抽出
    const locationMatch = description.match(/保管場所: ([^,]+)/)
    if (locationMatch && locationMatch[1] !== "未設定") info.storage_location = locationMatch[1]

    // 購入日を抽出
    const purchaseDateMatch = description.match(/購入日: ([^,]+)/)
    if (purchaseDateMatch && purchaseDateMatch[1] !== "未設定") info.purchase_date = purchaseDateMatch[1]

    // 最終メンテナンス日を抽出
    const maintenanceDateMatch = description.match(/最終メンテナンス日: ([^,]+)/)
    if (maintenanceDateMatch && maintenanceDateMatch[1] !== "未設定")
      info.last_maintenance_date = maintenanceDateMatch[1]

    return info
  }

  const filteredTools = tools.filter((t) => {
    const searchLower = searchTerm.toLowerCase()
    const info = extractInfoFromDescription(t.description)
    return (
      t.name?.toLowerCase().includes(searchLower) ||
      info.model?.toLowerCase().includes(searchLower) ||
      info.manufacturer?.toLowerCase().includes(searchLower) ||
      info.storage_location?.toLowerCase().includes(searchLower)
    )
  })

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
    if (!dateString || dateString === "未設定") return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ja-JP")
    } catch (e) {
      return dateString
    }
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
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  setIsAddDialogOpen(true)
                }}
              >
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
                <Button type="button" onClick={() => addTool()} disabled={isLoading}>
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
                filteredTools.map((tool) => {
                  const info = extractInfoFromDescription(tool.description)
                  return (
                    <TableRow key={tool.id}>
                      <TableCell className="font-medium">{tool.name}</TableCell>
                      <TableCell>
                        {info.model ? (
                          <div>
                            <div>{info.model}</div>
                            {info.manufacturer && (
                              <div className="text-sm text-muted-foreground">{info.manufacturer}</div>
                            )}
                          </div>
                        ) : info.manufacturer ? (
                          info.manufacturer
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(info.purchase_date)}</TableCell>
                      <TableCell>{info.storage_location || "-"}</TableCell>
                      <TableCell>{getConditionBadge(info.condition || "unknown")}</TableCell>
                      <TableCell>{formatDate(info.last_maintenance_date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog
                            open={isEditDialogOpen && currentTool?.id === tool.id}
                            onOpenChange={(open) => {
                              setIsEditDialogOpen(open)
                              if (open) {
                                // 説明文から情報を抽出
                                const info = extractInfoFromDescription(tool.description)
                                setCurrentTool({
                                  ...tool,
                                  model: info.model || "",
                                  manufacturer: info.manufacturer || "",
                                  purchase_date: info.purchase_date || "",
                                  storage_location: info.storage_location || "",
                                  condition: info.condition || "good",
                                  last_maintenance_date: info.last_maintenance_date || "",
                                })
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.preventDefault()
                                  // 説明文から情報を抽出
                                  const info = extractInfoFromDescription(tool.description)
                                  setCurrentTool({
                                    ...tool,
                                    model: info.model || "",
                                    manufacturer: info.manufacturer || "",
                                    purchase_date: info.purchase_date || "",
                                    storage_location: info.storage_location || "",
                                    condition: info.condition || "good",
                                    last_maintenance_date: info.last_maintenance_date || "",
                                  })
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
                                        onChange={(e) =>
                                          setCurrentTool({ ...currentTool, manufacturer: e.target.value })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-purchase_date">購入日</Label>
                                    <Input
                                      id="edit-purchase_date"
                                      type="date"
                                      value={
                                        currentTool.purchase_date && currentTool.purchase_date !== "未設定"
                                          ? currentTool.purchase_date.split("T")[0]
                                          : ""
                                      }
                                      onChange={(e) =>
                                        setCurrentTool({ ...currentTool, purchase_date: e.target.value })
                                      }
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
                                      value={currentTool.condition || "good"}
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
                                        currentTool.last_maintenance_date &&
                                        currentTool.last_maintenance_date !== "未設定"
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
                                <Button
                                  variant="outline"
                                  onClick={() => setIsEditDialogOpen(false)}
                                  disabled={isLoading}
                                >
                                  キャンセル
                                </Button>
                                <Button type="button" onClick={() => updateTool()} disabled={isLoading}>
                                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  保存
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteTool(tool.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
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
