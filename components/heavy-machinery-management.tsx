"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-table"
import { OwnershipType, ResourceStatus } from "@/types/enums"

// 重機データの型定義
interface HeavyMachinery {
  id: string
  name: string
  type: string
  model: string
  manufacturer: string
  year: number
  status: ResourceStatus
  ownership: OwnershipType
  last_maintenance: string
  next_maintenance: string
}

// サンプルデータ
const sampleHeavyMachinery: HeavyMachinery[] = [
  {
    id: "1",
    name: "油圧ショベル A",
    type: "油圧ショベル",
    model: "PC200-10",
    manufacturer: "コマツ",
    year: 2018,
    status: ResourceStatus.Available,
    ownership: OwnershipType.OwnedByCompany,
    last_maintenance: "2023-03-15",
    next_maintenance: "2023-09-15",
  },
  {
    id: "2",
    name: "ブルドーザー B",
    type: "ブルドーザー",
    model: "D61PXi-24",
    manufacturer: "コマツ",
    year: 2020,
    status: ResourceStatus.InUse,
    ownership: OwnershipType.Leased,
    last_maintenance: "2023-02-10",
    next_maintenance: "2023-08-10",
  },
  {
    id: "3",
    name: "クレーン C",
    type: "クレーン",
    model: "LTM 1100-4.2",
    manufacturer: "リープヘル",
    year: 2019,
    status: ResourceStatus.UnderMaintenance,
    ownership: OwnershipType.OwnedByCompany,
    last_maintenance: "2023-04-05",
    next_maintenance: "2023-10-05",
  },
]

export function HeavyMachineryManagement() {
  const [heavyMachinery, setHeavyMachinery] = useState<HeavyMachinery[]>(sampleHeavyMachinery)
  const [newMachinery, setNewMachinery] = useState<Partial<HeavyMachinery>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // 検索結果をフィルタリング
  const filteredMachinery = heavyMachinery.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 新しい重機を追加
  const handleAddMachinery = () => {
    if (
      newMachinery.name &&
      newMachinery.type &&
      newMachinery.model &&
      newMachinery.manufacturer &&
      newMachinery.year &&
      newMachinery.status &&
      newMachinery.ownership
    ) {
      const newItem: HeavyMachinery = {
        id: Date.now().toString(),
        name: newMachinery.name,
        type: newMachinery.type,
        model: newMachinery.model,
        manufacturer: newMachinery.manufacturer,
        year: newMachinery.year,
        status: newMachinery.status as ResourceStatus,
        ownership: newMachinery.ownership as OwnershipType,
        last_maintenance: newMachinery.last_maintenance || new Date().toISOString().split("T")[0],
        next_maintenance: newMachinery.next_maintenance || new Date().toISOString().split("T")[0],
      }

      setHeavyMachinery([...heavyMachinery, newItem])
      setNewMachinery({})
      setIsDialogOpen(false)
    }
  }

  // 重機の状態を更新
  const updateMachineryStatus = (id: string, status: ResourceStatus) => {
    setHeavyMachinery(heavyMachinery.map((machine) => (machine.id === id ? { ...machine, status } : machine)))
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-end mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>新規重機登録</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>新規重機登録</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    名称
                  </Label>
                  <Input
                    id="name"
                    value={newMachinery.name || ""}
                    onChange={(e) => setNewMachinery({ ...newMachinery, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    種類
                  </Label>
                  <Input
                    id="type"
                    value={newMachinery.type || ""}
                    onChange={(e) => setNewMachinery({ ...newMachinery, type: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">
                    型式
                  </Label>
                  <Input
                    id="model"
                    value={newMachinery.model || ""}
                    onChange={(e) => setNewMachinery({ ...newMachinery, model: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manufacturer" className="text-right">
                    メーカー
                  </Label>
                  <Input
                    id="manufacturer"
                    value={newMachinery.manufacturer || ""}
                    onChange={(e) => setNewMachinery({ ...newMachinery, manufacturer: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="year" className="text-right">
                    年式
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={newMachinery.year || ""}
                    onChange={(e) => setNewMachinery({ ...newMachinery, year: Number.parseInt(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    状態
                  </Label>
                  <Select
                    onValueChange={(value) => setNewMachinery({ ...newMachinery, status: value as ResourceStatus })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="状態を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ResourceStatus.Available}>利用可能</SelectItem>
                      <SelectItem value={ResourceStatus.InUse}>利用中</SelectItem>
                      <SelectItem value={ResourceStatus.UnderMaintenance}>メンテナンス中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ownership" className="text-right">
                    所有形態
                  </Label>
                  <Select
                    onValueChange={(value) => setNewMachinery({ ...newMachinery, ownership: value as OwnershipType })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="所有形態を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OwnershipType.OwnedByCompany}>自社保有</SelectItem>
                      <SelectItem value={OwnershipType.Leased}>リース</SelectItem>
                      <SelectItem value={OwnershipType.Other}>その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="last_maintenance" className="text-right">
                    前回点検日
                  </Label>
                  <Input
                    id="last_maintenance"
                    type="date"
                    value={newMachinery.last_maintenance || ""}
                    onChange={(e) => setNewMachinery({ ...newMachinery, last_maintenance: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="next_maintenance" className="text-right">
                    次回点検日
                  </Label>
                  <Input
                    id="next_maintenance"
                    type="date"
                    value={newMachinery.next_maintenance || ""}
                    onChange={(e) => setNewMachinery({ ...newMachinery, next_maintenance: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddMachinery}>登録</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>重機一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>種類</TableHead>
                <TableHead>型式</TableHead>
                <TableHead>メーカー</TableHead>
                <TableHead>年式</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>所有形態</TableHead>
                <TableHead>前回点検日</TableHead>
                <TableHead>次回点検日</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachinery.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium">{machine.name}</TableCell>
                  <TableCell>{machine.type}</TableCell>
                  <TableCell>{machine.model}</TableCell>
                  <TableCell>{machine.manufacturer}</TableCell>
                  <TableCell>{machine.year}</TableCell>
                  <TableCell>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                        machine.status === ResourceStatus.Available
                          ? "bg-green-100 text-green-800"
                          : machine.status === ResourceStatus.InUse
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {machine.status}
                    </div>
                  </TableCell>
                  <TableCell>{machine.ownership}</TableCell>
                  <TableCell>{machine.last_maintenance}</TableCell>
                  <TableCell>{machine.next_maintenance}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={machine.status}
                      onValueChange={(value) => updateMachineryStatus(machine.id, value as ResourceStatus)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="状態を変更" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ResourceStatus.Available}>利用可能</SelectItem>
                        <SelectItem value={ResourceStatus.InUse}>利用中</SelectItem>
                        <SelectItem value={ResourceStatus.UnderMaintenance}>メンテナンス中</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
