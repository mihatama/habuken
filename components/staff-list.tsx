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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function StaffList() {
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const [staff, setStaff] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newStaff, setNewStaff] = useState({
    full_name: "",
    position: "",
    email: "",
    phone: "",
    hire_date: "",
    status: "active",
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  async function fetchStaff() {
    try {
      setIsLoading(true)
      setError(null)

      console.log("スタッフデータを取得中...")
      const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

      if (error) {
        console.error("スタッフ取得エラー:", error)
        throw error
      }

      console.log("取得したスタッフデータ:", data)
      setStaff(data || [])
    } catch (error: any) {
      console.error("スタッフの取得に失敗しました:", error)
      setError(error.message || "スタッフデータの取得に失敗しました")
      toast({
        title: "エラー",
        description: "スタッフの取得に失敗しました: " + (error.message || "不明なエラー"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function addStaff() {
    try {
      if (!newStaff.full_name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase.from("staff").insert([newStaff]).select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "スタッフが正常に追加されました",
      })

      setNewStaff({
        full_name: "",
        position: "",
        email: "",
        phone: "",
        hire_date: "",
        status: "active",
      })

      fetchStaff()
      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error("スタッフの追加に失敗しました:", error)
      toast({
        title: "エラー",
        description: "スタッフの追加に失敗しました: " + (error.message || "不明なエラー"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStaff() {
    try {
      if (!currentStaff || !currentStaff.id) {
        throw new Error("スタッフIDが不明です")
      }

      if (!currentStaff.full_name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase
        .from("staff")
        .update({
          full_name: currentStaff.full_name,
          position: currentStaff.position,
          email: currentStaff.email,
          phone: currentStaff.phone,
          hire_date: currentStaff.hire_date,
          status: currentStaff.status,
        })
        .eq("id", currentStaff.id)
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "スタッフ情報が正常に更新されました",
      })

      fetchStaff()
      setIsEditDialogOpen(false)
    } catch (error: any) {
      console.error("スタッフの更新に失敗しました:", error)
      toast({
        title: "エラー",
        description: "スタッフの更新に失敗しました: " + (error.message || "不明なエラー"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteStaff(id: string) {
    try {
      if (!confirm("このスタッフを削除してもよろしいですか？")) {
        return
      }

      setIsLoading(true)
      const { error } = await supabase.from("staff").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: "スタッフが正常に削除されました",
      })

      fetchStaff()
    } catch (error: any) {
      console.error("スタッフの削除に失敗しました:", error)
      toast({
        title: "エラー",
        description: "スタッフの削除に失敗しました: " + (error.message || "不明なエラー"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStaff = staff.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">在籍中</Badge>
      case "inactive":
        return <Badge className="bg-gray-500 hover:bg-gray-600">休職中</Badge>
      case "terminated":
        return <Badge className="bg-red-500 hover:bg-red-600">退職</Badge>
      default:
        return <Badge>{status}</Badge>
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
        <CardTitle>スタッフ一覧</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Button variant="outline" size="icon" onClick={fetchStaff} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規スタッフ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規スタッフの追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newStaff.full_name}
                    onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">役職</Label>
                  <Input
                    id="position"
                    value={newStaff.position}
                    onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hire_date">入社日</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={newStaff.hire_date}
                    onChange={(e) => setNewStaff({ ...newStaff, hire_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">ステータス</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newStaff.status}
                    onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                  >
                    <option value="active">在籍中</option>
                    <option value="inactive">休職中</option>
                    <option value="terminated">退職</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={addStaff} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && staff.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchStaff}>
              <RefreshCw className="mr-2 h-4 w-4" />
              再読み込み
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>役職</TableHead>
                <TableHead>連絡先</TableHead>
                <TableHead>入社日</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.full_name}</TableCell>
                    <TableCell>{staff.position || "-"}</TableCell>
                    <TableCell>
                      {staff.email ? (
                        <div>
                          <div>{staff.email}</div>
                          {staff.phone && <div className="text-sm text-muted-foreground">{staff.phone}</div>}
                        </div>
                      ) : staff.phone ? (
                        staff.phone
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(staff.hire_date)}</TableCell>
                    <TableCell>{getStatusBadge(staff.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog
                          open={isEditDialogOpen && currentStaff?.id === staff.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (open) setCurrentStaff(staff)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCurrentStaff(staff)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>スタッフの編集</DialogTitle>
                            </DialogHeader>
                            {currentStaff && (
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">名前</Label>
                                  <Input
                                    id="edit-name"
                                    value={currentStaff.full_name}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, full_name: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-position">役職</Label>
                                  <Input
                                    id="edit-position"
                                    value={currentStaff.position || ""}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, position: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-email">メールアドレス</Label>
                                  <Input
                                    id="edit-email"
                                    type="email"
                                    value={currentStaff.email || ""}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-phone">電話番号</Label>
                                  <Input
                                    id="edit-phone"
                                    value={currentStaff.phone || ""}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-hire_date">入社日</Label>
                                  <Input
                                    id="edit-hire_date"
                                    type="date"
                                    value={currentStaff.hire_date ? currentStaff.hire_date.split("T")[0] : ""}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, hire_date: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-status">ステータス</Label>
                                  <select
                                    id="edit-status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={currentStaff.status}
                                    onChange={(e) => setCurrentStaff({ ...currentStaff, status: e.target.value })}
                                  >
                                    <option value="active">在籍中</option>
                                    <option value="inactive">休職中</option>
                                    <option value="terminated">退職</option>
                                  </select>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                                キャンセル
                              </Button>
                              <Button type="submit" onClick={updateStaff} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                保存
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteStaff(staff.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "検索条件に一致するスタッフが見つかりません" : "スタッフがありません"}
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
