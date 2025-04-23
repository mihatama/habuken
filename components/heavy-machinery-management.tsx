"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, FileText, Edit, Trash2 } from "lucide-react"

export function HeavyMachineryManagement() {
  const [open, setOpen] = useState(false)

  // Sample data for heavy machinery
  const machinery = [
    {
      id: "H001",
      name: "バックホウA",
      type: "掘削機",
      status: "稼働中",
      location: "東京現場",
      lastMaintenance: "2023-10-10",
      nextMaintenance: "2024-01-10",
    },
    {
      id: "H002",
      name: "ブルドーザーB",
      type: "整地機",
      status: "整備中",
      location: "大阪倉庫",
      lastMaintenance: "2023-11-01",
      nextMaintenance: "2024-02-01",
    },
    {
      id: "H003",
      name: "クレーンC",
      type: "揚重機",
      status: "稼働中",
      location: "名古屋現場",
      lastMaintenance: "2023-09-15",
      nextMaintenance: "2023-12-15",
    },
    {
      id: "H004",
      name: "フォークリフトD",
      type: "運搬機",
      status: "予約済",
      location: "福岡倉庫",
      lastMaintenance: "2023-10-25",
      nextMaintenance: "2024-01-25",
    },
    {
      id: "H005",
      name: "コンクリートミキサーE",
      type: "コンクリート機械",
      status: "稼働中",
      location: "札幌現場",
      lastMaintenance: "2023-11-05",
      nextMaintenance: "2024-02-05",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="text" placeholder="重機を検索..." className="flex-1" />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
            <span className="sr-only">検索</span>
          </Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              重機を追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規重機登録</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">重機名</Label>
                <Input id="name" placeholder="例: バックホウA" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">重機タイプ</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="重機タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excavator">掘削機</SelectItem>
                    <SelectItem value="bulldozer">整地機</SelectItem>
                    <SelectItem value="crane">揚重機</SelectItem>
                    <SelectItem value="forklift">運搬機</SelectItem>
                    <SelectItem value="concrete">コンクリート機械</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">配置場所</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="配置場所を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokyo">東京現場</SelectItem>
                    <SelectItem value="osaka">大阪倉庫</SelectItem>
                    <SelectItem value="nagoya">名古屋現場</SelectItem>
                    <SelectItem value="fukuoka">福岡倉庫</SelectItem>
                    <SelectItem value="sapporo">札幌現場</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastMaintenance">最終点検日</Label>
                <Input id="lastMaintenance" type="date" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>登録</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>重機名</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>配置場所</TableHead>
              <TableHead>次回点検日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {machinery.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell>{machine.id}</TableCell>
                <TableCell>{machine.name}</TableCell>
                <TableCell>{machine.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      machine.status === "稼働中" ? "default" : machine.status === "整備中" ? "destructive" : "outline"
                    }
                  >
                    {machine.status}
                  </Badge>
                </TableCell>
                <TableCell>{machine.location}</TableCell>
                <TableCell>{machine.nextMaintenance}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">詳細</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">編集</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
