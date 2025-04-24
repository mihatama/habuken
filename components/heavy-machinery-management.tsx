"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash2, Truck, Wrench, Calendar, FileText, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 初期データに equipmentType を追加

// Mock data for heavy machinery
const initialMachinery = [
  {
    id: 1,
    name: "バックホウA",
    model: "CAT 320",
    plateNo: "品川480あ1234",
    ownership: "own",
    rentalUnitCost: 0,
    depreciationRate: 10,
    maintenanceStatus: "ok",
    nextInspectionDate: new Date(2025, 5, 15),
    location: "東京倉庫",
    equipmentType: "heavy", // 追加
    attachments: ["整備記録.pdf", "取扱説明書.pdf"],
    usageHistory: [
      {
        projectId: 1,
        projectName: "羽布ビル新築工事",
        startDate: new Date(2025, 3, 1),
        endDate: new Date(2025, 3, 10),
        actualHours: 72,
        costCalculated: 144000,
      },
      {
        projectId: 4,
        projectName: "羽布倉庫建設工事",
        startDate: new Date(2025, 4, 5),
        endDate: new Date(2025, 4, 15),
        actualHours: 80,
        costCalculated: 160000,
      },
    ],
  },
  {
    id: 2,
    name: "ダンプトラックA",
    model: "いすゞ GIGA",
    plateNo: "品川100あ5678",
    ownership: "own",
    rentalUnitCost: 0,
    depreciationRate: 15,
    maintenanceStatus: "due",
    nextInspectionDate: new Date(2025, 3, 25),
    location: "大阪倉庫",
    equipmentType: "vehicle", // 追加
    attachments: ["車検証.pdf", "整備記録.pdf"],
    usageHistory: [
      {
        projectId: 2,
        projectName: "羽布マンション改修工事",
        startDate: new Date(2025, 3, 15),
        endDate: new Date(2025, 3, 30),
        actualHours: 120,
        costCalculated: 240000,
      },
    ],
  },
  {
    id: 3,
    name: "クレーンA",
    model: "KATO NK-500",
    plateNo: "品川480あ9012",
    ownership: "rental",
    rentalUnitCost: 50000,
    depreciationRate: 0,
    maintenanceStatus: "in_service",
    nextInspectionDate: new Date(2025, 4, 10),
    location: "東京倉庫",
    equipmentType: "heavy", // 追加
    attachments: ["レンタル契約書.pdf", "点検記録.pdf"],
    usageHistory: [
      {
        projectId: 1,
        projectName: "羽布ビル新築工事",
        startDate: new Date(2025, 3, 5),
        endDate: new Date(2025, 3, 20),
        actualHours: 120,
        costCalculated: 500000,
      },
      {
        projectId: 3,
        projectName: "羽布橋梁補修工事",
        startDate: new Date(2025, 4, 1),
        endDate: new Date(2025, 4, 10),
        actualHours: 80,
        costCalculated: 333333,
      },
    ],
  },
  {
    id: 4,
    name: "フォークリフトA",
    model: "トヨタ 8FD25",
    plateNo: "品川480あ3456",
    ownership: "own",
    rentalUnitCost: 0,
    depreciationRate: 20,
    maintenanceStatus: "ok",
    nextInspectionDate: new Date(2025, 6, 5),
    location: "大阪倉庫",
    equipmentType: "heavy", // 追加
    attachments: ["整備記録.pdf"],
    usageHistory: [
      {
        projectId: 2,
        projectName: "羽布マンション改修工事",
        startDate: new Date(2025, 3, 15),
        endDate: new Date(2025, 3, 25),
        actualHours: 80,
        costCalculated: 160000,
      },
    ],
  },
  {
    id: 5,
    name: "ブルドーザーA",
    model: "CAT D6",
    plateNo: "品川480あ7890",
    ownership: "rental",
    rentalUnitCost: 40000,
    depreciationRate: 0,
    maintenanceStatus: "ok",
    nextInspectionDate: new Date(2025, 5, 20),
    location: "東京倉庫",
    equipmentType: "heavy", // 追加
    attachments: ["レンタル契約書.pdf", "点検記録.pdf"],
    usageHistory: [
      {
        projectId: 1,
        projectName: "羽布ビル新築工事",
        startDate: new Date(2025, 3, 10),
        endDate: new Date(2025, 3, 30),
        actualHours: 160,
        costCalculated: 533333,
      },
      {
        projectId: 4,
        projectName: "羽布倉庫建設工事",
        startDate: new Date(2025, 5, 1),
        endDate: new Date(2025, 5, 15),
        actualHours: 120,
        costCalculated: 400000,
      },
    ],
  },
]

export function HeavyMachineryManagement() {
  const [machinery, setMachinery] = useState(initialMachinery)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false)
  const [currentMachine, setCurrentMachine] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("list")
  const [equipmentType, setEquipmentType] = useState("all") // 追加: 表示する機器タイプ（all, heavy, vehicle）
  const [newMachine, setNewMachine] = useState({
    name: "",
    model: "",
    plateNo: "",
    ownership: "own",
    rentalUnitCost: 0,
    depreciationRate: 0,
    maintenanceStatus: "ok",
    nextInspectionDate: "",
    location: "",
    equipmentType: "heavy", // 追加: 機器タイプ（heavy または vehicle）
    attachments: [] as string[],
    usageHistory: [] as any[],
  })

  const filteredMachinery = machinery.filter(
    (machine) =>
      (equipmentType === "all" ||
        (equipmentType === "heavy" && machine.equipmentType === "heavy") ||
        (equipmentType === "vehicle" && machine.equipmentType === "vehicle")) &&
      (machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.plateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddMachine = () => {
    const machine = {
      id: machinery.length + 1,
      name: newMachine.name,
      model: newMachine.model,
      plateNo: newMachine.plateNo,
      ownership: newMachine.ownership,
      rentalUnitCost: newMachine.ownership === "rental" ? Number(newMachine.rentalUnitCost) : 0,
      depreciationRate: newMachine.ownership === "own" ? Number(newMachine.depreciationRate) : 0,
      maintenanceStatus: newMachine.maintenanceStatus,
      nextInspectionDate: newMachine.nextInspectionDate ? new Date(newMachine.nextInspectionDate) : new Date(),
      location: newMachine.location,
      equipmentType: newMachine.equipmentType, // 追加: 機器タイプ
      attachments: newMachine.attachments,
      usageHistory: [],
    }

    setMachinery([...machinery, machine])
    setNewMachine({
      name: "",
      model: "",
      plateNo: "",
      ownership: "own",
      rentalUnitCost: 0,
      depreciationRate: 0,
      maintenanceStatus: "ok",
      nextInspectionDate: "",
      location: "",
      equipmentType: "heavy", // デフォルト値を設定
      attachments: [],
      usageHistory: [],
    })
    setIsAddDialogOpen(false)
  }

  const handleEditMachine = () => {
    const updatedMachinery = machinery.map((machine) => (machine.id === currentMachine.id ? currentMachine : machine))
    setMachinery(updatedMachinery)
    setIsEditDialogOpen(false)
  }

  const handleDeleteMachine = (id: number) => {
    setMachinery(machinery.filter((machine) => machine.id !== id))
  }

  const getMaintenanceStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge className="bg-green-500 hover:bg-green-600">良好</Badge>
      case "due":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">点検予定</Badge>
      case "in_service":
        return <Badge className="bg-red-500 hover:bg-red-600">整備中</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const calculateTotalCost = (machine: any) => {
    if (!machine.usageHistory || machine.usageHistory.length === 0) return 0

    return machine.usageHistory.reduce((total: number, usage: any) => total + usage.costCalculated, 0)
  }

  const calculateTotalHours = (machine: any) => {
    if (!machine.usageHistory || machine.usageHistory.length === 0) return 0

    return machine.usageHistory.reduce((total: number, usage: any) => total + usage.actualHours, 0)
  }

  // 稼働率の計算（稼働時間 / 稼働可能時間）
  const calculateUtilizationRate = (machine: any) => {
    const totalHours = calculateTotalHours(machine)
    // 稼働可能時間を1日8時間、月20日と仮定
    const availableHours = 8 * 20 * 3 // 3ヶ月分
    return Math.min(Math.round((totalHours / availableHours) * 100), 100)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>機材管理</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={equipmentType} onValueChange={setEquipmentType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="タイプを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="heavy">重機</SelectItem>
              <SelectItem value="vehicle">車両</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規登録
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>機材の新規登録</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="equipmentType">機材タイプ</Label>
                    <Select
                      value={newMachine.equipmentType}
                      onValueChange={(value) => setNewMachine({ ...newMachine, equipmentType: value })}
                    >
                      <SelectTrigger id="equipmentType">
                        <SelectValue placeholder="機材タイプを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="heavy">重機</SelectItem>
                        <SelectItem value="vehicle">車両</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">名称</Label>
                    <Input
                      id="name"
                      value={newMachine.name}
                      onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plateNo">ナンバー</Label>
                    <Input
                      id="plateNo"
                      value={newMachine.plateNo}
                      onChange={(e) => setNewMachine({ ...newMachine, plateNo: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">保管場所</Label>
                    <Input
                      id="location"
                      value={newMachine.location}
                      onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ownership">所有区分</Label>
                    <Select
                      value={newMachine.ownership}
                      onValueChange={(value) => setNewMachine({ ...newMachine, ownership: value })}
                    >
                      <SelectTrigger id="ownership">
                        <SelectValue placeholder="所有区分を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="own">自社所有</SelectItem>
                        <SelectItem value="rental">レンタル</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    {newMachine.ownership === "rental" ? (
                      <>
                        <Label htmlFor="rentalUnitCost">レンタル単価（日額）</Label>
                        <Input
                          id="rentalUnitCost"
                          type="number"
                          value={newMachine.rentalUnitCost}
                          onChange={(e) =>
                            setNewMachine({ ...newMachine, rentalUnitCost: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </>
                    ) : (
                      <>
                        <Label htmlFor="depreciationRate">減価償却率（%/年）</Label>
                        <Input
                          id="depreciationRate"
                          type="number"
                          value={newMachine.depreciationRate}
                          onChange={(e) =>
                            setNewMachine({ ...newMachine, depreciationRate: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="maintenanceStatus">整備状況</Label>
                    <Select
                      value={newMachine.maintenanceStatus}
                      onValueChange={(value) => setNewMachine({ ...newMachine, maintenanceStatus: value })}
                    >
                      <SelectTrigger id="maintenanceStatus">
                        <SelectValue placeholder="整備状況を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ok">良好</SelectItem>
                        <SelectItem value="due">点検予定</SelectItem>
                        <SelectItem value="in_service">整備中</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nextInspectionDate">次回点検日</Label>
                    <Input
                      id="nextInspectionDate"
                      type="date"
                      value={newMachine.nextInspectionDate}
                      onChange={(e) => setNewMachine({ ...newMachine, nextInspectionDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="attachments">添付書類</Label>
                  <div className="flex gap-2">
                    <Input
                      id="attachments"
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const fileName = e.target.files[0].name
                          setNewMachine({
                            ...newMachine,
                            attachments: [...newMachine.attachments, fileName],
                          })
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newMachine.attachments.map((file, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <FileText className="h-3 w-3 mr-1" />
                        {file}
                        <button
                          type="button"
                          className="ml-1 rounded-full hover:bg-muted p-1"
                          onClick={() =>
                            setNewMachine({
                              ...newMachine,
                              attachments: newMachine.attachments.filter((_, i) => i !== index),
                            })
                          }
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddMachine}>
                  登録
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="list">一覧表示</TabsTrigger>
            <TabsTrigger value="cost">コスト分析</TabsTrigger>
            <TabsTrigger value="maintenance">整備スケジュール</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイプ</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>型式</TableHead>
                  <TableHead>ナンバー</TableHead>
                  <TableHead>所有区分</TableHead>
                  <TableHead>整備状況</TableHead>
                  <TableHead>次回点検日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMachinery.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell>{machine.equipmentType === "heavy" ? "重機" : "車両"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {machine.equipmentType === "vehicle" ||
                        machine.name.includes("トラック") ||
                        machine.name.includes("ダンプ") ? (
                          <Truck className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Wrench className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div className="font-medium">{machine.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{machine.model}</TableCell>
                    <TableCell>{machine.plateNo}</TableCell>
                    <TableCell>{machine.ownership === "own" ? "自社所有" : "レンタル"}</TableCell>
                    <TableCell>{getMaintenanceStatusBadge(machine.maintenanceStatus)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{machine.nextInspectionDate.toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog
                          open={isUsageDialogOpen && currentMachine?.id === machine.id}
                          onOpenChange={(open) => {
                            setIsUsageDialogOpen(open)
                            if (open) setCurrentMachine(machine)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCurrentMachine(machine)
                                setIsUsageDialogOpen(true)
                              }}
                            >
                              稼働履歴
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>稼働履歴 - {machine.name}</DialogTitle>
                            </DialogHeader>
                            {currentMachine && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="border rounded-md p-4">
                                    <div className="text-sm text-muted-foreground">総稼働時間</div>
                                    <div className="text-2xl font-bold">{calculateTotalHours(currentMachine)}時間</div>
                                  </div>
                                  <div className="border rounded-md p-4">
                                    <div className="text-sm text-muted-foreground">総コスト</div>
                                    <div className="text-2xl font-bold">
                                      {calculateTotalCost(currentMachine).toLocaleString()}円
                                    </div>
                                  </div>
                                  <div className="border rounded-md p-4">
                                    <div className="text-sm text-muted-foreground">稼働率</div>
                                    <div className="text-2xl font-bold">
                                      {calculateUtilizationRate(currentMachine)}%
                                    </div>
                                  </div>
                                </div>

                                <div className="border rounded-md p-4">
                                  <h3 className="text-lg font-medium mb-4">案件別稼働履歴</h3>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>案件名</TableHead>
                                        <TableHead>期間</TableHead>
                                        <TableHead>稼働時間</TableHead>
                                        <TableHead>コスト</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {currentMachine.usageHistory.map((usage: any, index: number) => (
                                        <TableRow key={index}>
                                          <TableCell>{usage.projectName}</TableCell>
                                          <TableCell>
                                            {usage.startDate.toLocaleDateString()} 〜{" "}
                                            {usage.endDate.toLocaleDateString()}
                                          </TableCell>
                                          <TableCell>{usage.actualHours}時間</TableCell>
                                          <TableCell>{usage.costCalculated.toLocaleString()}円</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={isEditDialogOpen && currentMachine?.id === machine.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (open) setCurrentMachine(machine)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCurrentMachine(machine)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>機材の編集</DialogTitle>
                            </DialogHeader>
                            {currentMachine && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-equipmentType">機材タイプ</Label>
                                    <Select
                                      value={currentMachine.equipmentType || "heavy"}
                                      onValueChange={(value) =>
                                        setCurrentMachine({ ...currentMachine, equipmentType: value })
                                      }
                                    >
                                      <SelectTrigger id="edit-equipmentType">
                                        <SelectValue placeholder="機材タイプを選択" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="heavy">重機</SelectItem>
                                        <SelectItem value="vehicle">車両</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-name">名称</Label>
                                    <Input
                                      id="edit-name"
                                      value={currentMachine.name}
                                      onChange={(e) => setCurrentMachine({ ...currentMachine, name: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-plateNo">ナンバー</Label>
                                    <Input
                                      id="edit-plateNo"
                                      value={currentMachine.plateNo}
                                      onChange={(e) =>
                                        setCurrentMachine({ ...currentMachine, plateNo: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-location">保管場所</Label>
                                    <Input
                                      id="edit-location"
                                      value={currentMachine.location}
                                      onChange={(e) =>
                                        setCurrentMachine({ ...currentMachine, location: e.target.value })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-ownership">所有区分</Label>
                                    <Select
                                      value={currentMachine.ownership}
                                      onValueChange={(value) =>
                                        setCurrentMachine({ ...currentMachine, ownership: value })
                                      }
                                    >
                                      <SelectTrigger id="edit-ownership">
                                        <SelectValue placeholder="所有区分を選択" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="own">自社所有</SelectItem>
                                        <SelectItem value="rental">レンタル</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    {currentMachine.ownership === "rental" ? (
                                      <>
                                        <Label htmlFor="edit-rentalUnitCost">レンタル単価（日額）</Label>
                                        <Input
                                          id="edit-rentalUnitCost"
                                          type="number"
                                          value={currentMachine.rentalUnitCost}
                                          onChange={(e) =>
                                            setCurrentMachine({
                                              ...currentMachine,
                                              rentalUnitCost: Number.parseInt(e.target.value) || 0,
                                            })
                                          }
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <Label htmlFor="edit-depreciationRate">減価償却率（%/年）</Label>
                                        <Input
                                          id="edit-depreciationRate"
                                          type="number"
                                          value={currentMachine.depreciationRate}
                                          onChange={(e) =>
                                            setCurrentMachine({
                                              ...currentMachine,
                                              depreciationRate: Number.parseInt(e.target.value) || 0,
                                            })
                                          }
                                        />
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-maintenanceStatus">整備状況</Label>
                                    <Select
                                      value={currentMachine.maintenanceStatus}
                                      onValueChange={(value) =>
                                        setCurrentMachine({ ...currentMachine, maintenanceStatus: value })
                                      }
                                    >
                                      <SelectTrigger id="edit-maintenanceStatus">
                                        <SelectValue placeholder="整備状況を選択" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="ok">良好</SelectItem>
                                        <SelectItem value="due">点検予定</SelectItem>
                                        <SelectItem value="in_service">整備中</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-nextInspectionDate">次回点検日</Label>
                                    <Input
                                      id="edit-nextInspectionDate"
                                      type="date"
                                      value={
                                        currentMachine.nextInspectionDate instanceof Date
                                          ? currentMachine.nextInspectionDate.toISOString().split("T")[0]
                                          : currentMachine.nextInspectionDate
                                      }
                                      onChange={(e) =>
                                        setCurrentMachine({
                                          ...currentMachine,
                                          nextInspectionDate: new Date(e.target.value),
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-attachments">添付書類</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {currentMachine.attachments.map((file: string, index: number) => (
                                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {file}
                                        <button
                                          type="button"
                                          className="ml-1 rounded-full hover:bg-muted p-1"
                                          onClick={() =>
                                            setCurrentMachine({
                                              ...currentMachine,
                                              attachments: currentMachine.attachments.filter((_, i) => i !== index),
                                            })
                                          }
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button type="submit" onClick={handleEditMachine}>
                                保存
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteMachine(machine.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="cost">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {machinery
                        .filter((m) => equipmentType === "all" || m.equipmentType === equipmentType)
                        .reduce((total, machine) => total + calculateTotalCost(machine), 0)
                        .toLocaleString()}
                      円
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {equipmentType === "all" ? "全機材" : equipmentType === "heavy" ? "重機" : "車両"}
                      の総コスト（過去3ヶ月）
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {machinery
                        .filter((m) => equipmentType === "all" || m.equipmentType === equipmentType)
                        .reduce((total, machine) => total + calculateTotalHours(machine), 0)}
                      時間
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {equipmentType === "all" ? "全機材" : equipmentType === "heavy" ? "重機" : "車両"}
                      の総稼働時間（過去3ヶ月）
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {Math.round(
                        machinery
                          .filter((m) => equipmentType === "all" || m.equipmentType === equipmentType)
                          .reduce((total, machine) => total + calculateTotalCost(machine), 0) /
                          Math.max(
                            machinery
                              .filter((m) => equipmentType === "all" || m.equipmentType === equipmentType)
                              .reduce((total, machine) => total + calculateTotalHours(machine), 0),
                            1,
                          ),
                      ).toLocaleString()}
                      円/時
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {equipmentType === "all" ? "全機材" : equipmentType === "heavy" ? "重機" : "車両"}
                      の平均コスト（時間あたり）
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>機材別コスト分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>タイプ</TableHead>
                        <TableHead>名称</TableHead>
                        <TableHead>所有区分</TableHead>
                        <TableHead>稼働時間</TableHead>
                        <TableHead>総コスト</TableHead>
                        <TableHead>時間単価</TableHead>
                        <TableHead>稼働率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {machinery.map((machine) => {
                        const totalHours = calculateTotalHours(machine)
                        const totalCost = calculateTotalCost(machine)
                        const hourlyRate = totalHours > 0 ? Math.round(totalCost / totalHours) : 0
                        const utilizationRate = calculateUtilizationRate(machine)

                        return (
                          <TableRow key={machine.id}>
                            <TableCell>{machine.equipmentType === "heavy" ? "重機" : "車両"}</TableCell>
                            <TableCell className="font-medium">{machine.name}</TableCell>
                            <TableCell>{machine.ownership === "own" ? "自社所有" : "レンタル"}</TableCell>
                            <TableCell>{totalHours}時間</TableCell>
                            <TableCell>{totalCost.toLocaleString()}円</TableCell>
                            <TableCell>{hourlyRate.toLocaleString()}円/時</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-green-600 h-2.5 rounded-full"
                                    style={{ width: `${utilizationRate}%` }}
                                  ></div>
                                </div>
                                <span>{utilizationRate}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="maintenance">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {
                        machinery.filter(
                          (m) =>
                            (equipmentType === "all" || m.equipmentType === equipmentType) &&
                            m.maintenanceStatus === "ok",
                        ).length
                      }
                      台
                    </div>
                    <p className="text-sm text-muted-foreground">良好</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {
                        machinery.filter(
                          (m) =>
                            (equipmentType === "all" || m.equipmentType === equipmentType) &&
                            m.maintenanceStatus === "due",
                        ).length
                      }
                      台
                    </div>
                    <p className="text-sm text-muted-foreground">点検予定</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {
                        machinery.filter(
                          (m) =>
                            (equipmentType === "all" || m.equipmentType === equipmentType) &&
                            m.maintenanceStatus === "in_service",
                        ).length
                      }
                      台
                    </div>
                    <p className="text-sm text-muted-foreground">整備中</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>整備スケジュール</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>タイプ</TableHead>
                        <TableHead>名称</TableHead>
                        <TableHead>型式</TableHead>
                        <TableHead>整備状況</TableHead>
                        <TableHead>次回点検日</TableHead>
                        <TableHead>残り日数</TableHead>
                        <TableHead>アラート</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {machinery
                        .sort((a, b) => a.nextInspectionDate.getTime() - b.nextInspectionDate.getTime())
                        .map((machine) => {
                          const today = new Date()
                          const daysUntilInspection = Math.ceil(
                            (machine.nextInspectionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                          )
                          const isUrgent = daysUntilInspection <= 7
                          const isWarning = daysUntilInspection <= 30 && daysUntilInspection > 7

                          return (
                            <TableRow key={machine.id}>
                              <TableCell>{machine.equipmentType === "heavy" ? "重機" : "車両"}</TableCell>
                              <TableCell className="font-medium">{machine.name}</TableCell>
                              <TableCell>{machine.model}</TableCell>
                              <TableCell>{getMaintenanceStatusBadge(machine.maintenanceStatus)}</TableCell>
                              <TableCell>{machine.nextInspectionDate.toLocaleDateString()}</TableCell>
                              <TableCell>{daysUntilInspection}日</TableCell>
                              <TableCell>
                                {isUrgent && (
                                  <Badge className="bg-red-500">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    緊急
                                  </Badge>
                                )}
                                {isWarning && (
                                  <Badge className="bg-yellow-500">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    注意
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
