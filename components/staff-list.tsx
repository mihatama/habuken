"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchData, deleteData } from "@/lib/supabase-client"

// スタッフデータの型定義
interface Staff {
  id: string
  full_name: string
  email: string
  phone: string
  position: string
  [key: string]: any
}

export function StaffList() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Supabaseからデータを取得
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)

        // 共通関数を使用してデータを取得
        const { data } = await fetchData<Staff>("staff", {
          order: { column: "full_name", ascending: true },
        })

        setStaff(data || [])
      } catch (error) {
        console.error("スタッフデータ取得エラー:", error)
        toast({
          title: "エラー",
          description: "スタッフデータの取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [toast])

  const filteredStaff = staff.filter(
    (person) =>
      person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteStaff = async (id: string) => {
    try {
      // 共通関数を使用してデータを削除
      await deleteData("staff", id)

      // 成功したら、ローカルの状態を更新
      setStaff(staff.filter((s) => s.id !== id))

      toast({
        title: "削除完了",
        description: "スタッフを削除しました",
      })
    } catch (error) {
      console.error("スタッフ削除エラー:", error)
      toast({
        title: "エラー",
        description: "スタッフの削除に失敗しました",
        variant: "destructive",
      })
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
