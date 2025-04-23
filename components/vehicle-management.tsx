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

export function VehicleManagement() {
  const [open, setOpen] = useState(false)

  // Sample data for vehicles
  const vehicles = [
    {
      id: "V001",
      name: "トヨタ ハイエース",
      type: "バン",
      status: "稼働中",
      location: "東京本社",
      lastMaintenance: "2023-10-15",
      nextMaintenance: "2024-01-15",
    },
    {
      id: "V002",
      name: "日産 NV350キャラバン",
      type: "バン",
      status: "整備中",
      location: "大阪支店",
      lastMaintenance: "2023-11-05",
      nextMaintenance: "2024-02-05",
    },
    {
      id: "V003",
      name: "トヨタ ランドクルーザー",
      type: "SUV",
      status: "稼働中",
      location: "福岡支店",
      lastMaintenance: "2023-09-20",
      nextMaintenance: "2023-12-20",
    },
    {
      id: "V004",
      name: "三菱 デリカD:5",
      type: "ミニバン",
      status: "予約済",
      location: "名古屋支店",
      lastMaintenance: "2023-10-30",
      nextMaintenance: "2024-01-30",
    },
    {
      id: "V005",
      name: "いすゞ エルフ",
      type: "トラック",
      status: "稼働中",
      location: "札幌支店",
      lastMaintenance: "2023-11-10",
      nextMaintenance: "2024-02-10",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="text" placeholder="車両を検索..." className="flex-1" />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
            <span className="sr-only">検索</span>
          </Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              車両を追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規車両登録</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">車両名</Label>
                <Input id="name" placeholder="例: トヨタ ハイエース" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">車両タイプ</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="車両タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="van">バン</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="minivan">ミニバン</SelectItem>
                    <SelectItem value="truck">トラック</SelectItem>
                    <SelectItem value="sedan">セダン</SelectItem>
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
                    <SelectItem value="tokyo">東京本社</SelectItem>
                    <SelectItem value="osaka">大阪支店</SelectItem>
                    <SelectItem value="fukuoka">福岡支店</SelectItem>
                    <SelectItem value="nagoya">名古屋支店</SelectItem>
                    <SelectItem value="sapporo">札幌支店</SelectItem>
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
              <TableHead>車両名</TableHead>
              <TableHead>タイプ</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>配置場所</TableHead>
              <TableHead>次回点検日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.id}</TableCell>
                <TableCell>{vehicle.name}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      vehicle.status === "稼働中" ? "default" : vehicle.status === "整備中" ? "destructive" : "outline"
                    }
                  >
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell>{vehicle.location}</TableCell>
                <TableCell>{vehicle.nextMaintenance}</TableCell>
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
