"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react"
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
  const [isRefreshing, setIsRefreshing] = useState(false)
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // ページロード時に備品一覧を取得
  useEffect(() => {
    fetchTools()
  }, [])

  // 備品一覧を取得する関数
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
        description: `備品の取得に失敗しました: ${error.message || "不明なエラー"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // フォームバリデーション関数
  const validateForm = (data: any) => {
    const errors: Record<string, string> = {}

    if (!data.name || data.name.trim() === "") {
      errors.name = "名前は必須です"
    }

    if (data.purchase_date) {
      const purchaseDate = new Date(data.purchase_date)
      if (isNaN(purchaseDate.getTime()) || purchaseDate > new Date()) {
        errors.purchase_date = "有効な購入日を入力してください"
      }
    }

    if (data.last_maintenance_date) {
      const maintenanceDate = new Date(data.last_maintenance_date)
      if (isNaN(maintenanceDate.getTime()) || maintenanceDate > new Date()) {
        errors.last_maintenance_date = "有効なメンテナンス日を入力してください"
      }
    }

    return errors
  }

  // 備品を追加する関数
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

      // フォームバリデーション
      const errors = validateForm(newTool)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      setFormErrors({})
      setIsLoading(true)

      // 新しいスキーマに合わせたデータ構造
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

      fetchTools() // 備品追加後にリロード
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

  // 備品を更新する関数
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

      // フォームバリデーション
      const errors = validateForm(currentTool)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }

      setFormErrors({})
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
      }

      const { data, error } = await supabase.from("resources").update(updateData).eq("id", currentTool.id).select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "備品情報が正常に更新されました",
      })

      fetchTools() // 備品更新後にリロード
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

  // 備品を削除する関数
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

      fetchTools() // 備品削除後にリロード
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

  // 手動リフレッシュ機能
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchTools()
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

  // 検索条件に一致する備品をフィルタリング
  const filteredTools = tools.filter((t) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const info = extractInfoFromDescription(t.description)

    return (
      t.name?.toLowerCase().includes(searchLower) ||
      info.model?.toLowerCase().includes(searchLower) ||
      info.manufacturer?.toLowerCase().includes(searchLower) ||
      info.storage_location?.toLowerCase().includes(searchLower) ||
      t.status?.toLowerCase().includes(searchLower) ||
      info.condition?.toLowerCase().includes(searchLower)
    )
  })

  // 状態に応じたバッジを表示する関数
  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "excellent":
        return <Badge variant="gold">優良</Badge>
      case "good":
        return <Badge className="bg-blue-500 hover:bg-blue-600">良好</Badge>
      case "fair":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">普通</Badge>
      case "poor":
        return <Badge variant="destructive">不良</Badge>
      default:
        return <Badge>{condition}</Badge>
    }
  }

  // 日付をフォーマットする関数
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
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle>備品一覧</CardTitle>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[250px]"
          />
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} title="リスト更新">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (open) setFormErrors({})
            }}
          >
            <DialogTrigger asChild>
              <Button variant="gold">
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
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
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
                    className={formErrors.purchase_date ? "border-red-500" : ""}
                  />
                  {formErrors.purchase_date && <p className="text-red-500 text-sm">{formErrors.purchase_date}</p>}
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
                    className={formErrors.last_maintenance_date ? "border-red-500" : ""}
                  />
                  {formErrors.last_maintenance_date && (
                    <p className="text-red-500 text-sm">{formErrors.last_maintenance_date}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                  キャンセル
                </Button>
                <Button variant="gold" type="button" onClick={addTool} disabled={isLoading}>
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
                                setFormErrors({})
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
                                  setFormErrors({})
                                }}
                                className="border-gold text-gold hover:bg-gold/10"
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
                                      className={formErrors.name ? "border-red-500" : ""}
                                    />
                                    {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
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
                                      className={formErrors.purchase_date ? "border-red-500" : ""}
                                    />
                                    {formErrors.purchase_date && (
                                      <p className="text-red-500 text-sm">{formErrors.purchase_date}</p>
                                    )}
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
                                      className={formErrors.last_maintenance_date ? "border-red-500" : ""}
                                    />
                                    {formErrors.last_maintenance_date && (
                                      <p className="text-red-500 text-sm">{formErrors.last_maintenance_date}</p>
                                    )}
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
                            className="border-darkgray text-darkgray hover:bg-darkgray/10"
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
