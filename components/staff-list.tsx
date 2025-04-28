"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StaffForm } from "./staff-form"
import { getStaffList } from "@/lib/supabase-utils"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface Staff {
  id: string
  full_name: string // Changed from name to full_name to match database column
  position: string
  department: string | null // Make department nullable
  employee_id: string
  contact_number: string
  email: string
  status: string
}

export function StaffList() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const data = await getStaffList()
      setStaff(data)
    } catch (error) {
      console.error("スタッフデータの取得に失敗しました:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const filteredStaff = staff.filter(
    (s) =>
      (s.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.position?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.department?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.employee_id?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            在籍中
          </Badge>
        )
      case "leave":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            休職中
          </Badge>
        )
      case "retired":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            退職
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>スタッフ一覧</CardTitle>
        <StaffForm onSuccess={fetchStaff} />
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="スタッフを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <p>読み込み中...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>従業員ID</TableHead>
                  <TableHead>役職</TableHead>
                  <TableHead>部署</TableHead>
                  <TableHead>連絡先</TableHead>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell>{s.employee_id}</TableCell>
                      <TableCell>{s.position}</TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>{s.contact_number}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{getStatusBadge(s.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      スタッフが見つかりません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
