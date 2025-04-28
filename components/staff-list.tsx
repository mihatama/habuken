"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"

// スタッフデータの型定義
interface Staff {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  position: string | null
  [key: string]: any
}

// Supabaseクライアントの作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

export function StaffList() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // スタッフデータを取得するクエリ
  const { data: staff = [], isLoading: loading } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      try {
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

  // スタッフを削除するミューテーション
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
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

  const handleDeleteStaff = async (id: string) => {
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
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            スタッフ追加
          </Button>
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
                      <Button variant="outline" size="icon" onClick={() => handleDeleteStaff(person.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
