"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Trash2, Loader2, UserPlus, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/supabaseClient"

// スタッフデータの型定義
interface Staff {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  position: string | null
  [key: string]: any
}

export function StaffList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null)
  const [newStaff, setNewStaff] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // スタッフデータを取得するクエリ
  const { data: staff = [], isLoading: loading } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.from("staff").select("*").order("full_name", { ascending: true })

        if (error) {
          toast({
            title: "エラー",
            description: "スタッフデータの取得に失敗しました",
            variant: "destructive",
          })
          throw error
        }

        return data || []
      } catch (error) {
        console.error("スタッフ取得エラー:", error)
        return []
      }
    },
  })

  // スタッフを追加するミューテーション
  const addStaffMutation = useMutation({
    mutationFn: async (data: Omit<Staff, "id">) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase.from("staff").insert(data).select()
      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast({
        title: "成功",
        description: "スタッフが追加されました",
      })
      setIsAddDialogOpen(false)
      setNewStaff({
        full_name: "",
        email: "",
        phone: "",
        position: "",
      })
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "スタッフの追加に失敗しました",
        variant: "destructive",
      })
      console.error("スタッフ追加エラー:", error)
    },
  })

  // スタッフを更新するミューテーション
  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Staff> }) => {
      const supabase = getSupabaseClient()
      const { data: result, error } = await supabase.from("staff").update(data).eq("id", id).select()
      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast({
        title: "成功",
        description: "スタッフ情報が更新されました",
      })
      setIsEditDialogOpen(false)
      setCurrentStaff(null)
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "スタッフ情報の更新に失敗しました",
        variant: "destructive",
      })
      console.error("スタッフ更新エラー:", error)
    },
  })

  // スタッフを削除するミューテーション
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("staff").delete().eq("id", id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast({
        title: "成功",
        description: "スタッフが削除されました",
      })
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "スタッフの削除に失敗しました",
        variant: "destructive",
      })
    },
  })

  const filteredStaff = staff.filter(
    (person) =>
      person.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddStaff = async () => {
    try {
      if (!newStaff.full_name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      await addStaffMutation.mutateAsync(newStaff)
    } catch (error) {
      console.error("スタッフ追加エラー:", error)
    }
  }

  const handleEditStaff = async () => {
    try {
      if (!currentStaff) return

      if (!currentStaff.full_name) {
        toast({
          title: "入力エラー",
          description: "名前は必須です",
          variant: "destructive",
        })
        return
      }

      await updateStaffMutation.mutateAsync({
        id: currentStaff.id,
        data: {
          full_name: currentStaff.full_name,
          email: currentStaff.email,
          phone: currentStaff.phone,
          position: currentStaff.position,
        },
      })
    } catch (error) {
      console.error("スタッフ更新エラー:", error)
    }
  }

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("このスタッフを削除してもよろしいですか？")) return

    try {
      await deleteStaffMutation.mutateAsync(id)
    } catch (error) {
      console.error("スタッフ削除エラー:", error)
    }
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                スタッフ追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>スタッフの追加</DialogTitle>
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
                    value={newStaff.position || ""}
                    onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email || ""}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    value={newStaff.phone || ""}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={handleAddStaff} disabled={addStaffMutation.isPending}>
                  {addStaffMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>役職</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.full_name}</TableCell>
                    <TableCell>{person.position || "-"}</TableCell>
                    <TableCell>{person.email || "-"}</TableCell>
                    <TableCell>{person.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog
                          open={isEditDialogOpen && currentStaff?.id === person.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (open) setCurrentStaff(person)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCurrentStaff(person)
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
                                  <Label htmlFor="edit-name">
                                    名前 <span className="text-red-500">*</span>
                                  </Label>
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
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                キャンセル
                              </Button>
                              <Button type="submit" onClick={handleEditStaff} disabled={updateStaffMutation.isPending}>
                                {updateStaffMutation.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                保存
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteStaff(person.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    {searchTerm ? "該当するスタッフはいません" : "スタッフデータがありません"}
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
