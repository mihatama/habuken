"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Check, X, AlertTriangle, Calendar, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sampleProjects, sampleStaff } from "@/data/sample-data"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// 安全巡視日誌のモックデータ
const initialPatrols = [
  {
    id: 1,
    projectId: 1,
    projectName: "羽布ビル新築工事",
    patrolDate: new Date(2025, 3, 15),
    inspectorId: 1,
    inspectorName: "羽布太郎",
    checklistJson: {
      machines: "good",
      protectiveGear: "good",
      waste: "good",
      noise: "good",
      scaffolding: "warning",
      electricity: "good",
      fire: "good",
      signage: "good",
    },
    comment: "足場の一部に手すりの緩みがあります。明日までに修正予定です。",
    photos: ["足場写真1.jpg", "足場写真2.jpg"],
    status: "approved",
    createdAt: new Date(2025, 3, 15, 16, 30),
  },
  {
    id: 2,
    projectId: 2,
    projectName: "羽布マンション改修工事",
    patrolDate: new Date(2025, 3, 16),
    inspectorId: 3,
    inspectorName: "羽布花子",
    checklistJson: {
      machines: "good",
      protectiveGear: "warning",
      waste: "good",
      noise: "good",
      scaffolding: "good",
      electricity: "good",
      fire: "good",
      signage: "warning",
    },
    comment: "一部作業員のヘルメット着用が不十分でした。注意喚起を行いました。安全標識の追加設置も必要です。",
    photos: ["ヘルメット着用状況.jpg", "安全標識設置場所.jpg"],
    status: "approved",
    createdAt: new Date(2025, 3, 16, 17, 15),
  },
  {
    id: 3,
    projectId: 3,
    projectName: "羽布橋梁補修工事",
    patrolDate: new Date(2025, 4, 5),
    inspectorId: 6,
    inspectorName: "羽布五郎",
    checklistJson: {
      machines: "good",
      protectiveGear: "good",
      waste: "warning",
      noise: "good",
      scaffolding: "good",
      electricity: "danger",
      fire: "good",
      signage: "good",
    },
    comment: "仮設電源の配線に問題があり、早急な対応が必要です。廃棄物の分別も徹底してください。",
    photos: ["電源配線.jpg", "廃棄物置き場.jpg"],
    status: "pending",
    createdAt: new Date(2025, 4, 5, 15, 45),
  },
]

// チェックリスト項目の定義
const checklistItems = [
  { id: "machines", label: "機械・設備" },
  { id: "protectiveGear", label: "保護具着用" },
  { id: "waste", label: "廃棄物管理" },
  { id: "noise", label: "騒音・振動" },
  { id: "scaffolding", label: "足場・作業床" },
  { id: "electricity", label: "電気関係" },
  { id: "fire", label: "火災防止" },
  { id: "signage", label: "標識・表示" },
]

export function SafetyPatrolLog() {
  const [patrols, setPatrols] = useState(initialPatrols)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentPatrol, setCurrentPatrol] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [newPatrol, setNewPatrol] = useState({
    projectId: "",
    inspectorId: "",
    patrolDate: new Date().toISOString().split("T")[0],
    checklistJson: {
      machines: "good",
      protectiveGear: "good",
      waste: "good",
      noise: "good",
      scaffolding: "good",
      electricity: "good",
      fire: "good",
      signage: "good",
    },
    comment: "",
    photos: [] as string[],
  })

  const filteredPatrols = patrols.filter(
    (patrol) =>
      (patrol.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patrol.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patrol.comment.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === "all" ||
        (activeTab === "pending" && patrol.status === "pending") ||
        (activeTab === "approved" && patrol.status === "approved")),
  )

  const handleAddPatrol = () => {
    if (!newPatrol.projectId || !newPatrol.inspectorId) return

    const projectId = Number.parseInt(newPatrol.projectId)
    const inspectorId = Number.parseInt(newPatrol.inspectorId)
    const project = sampleProjects.find((p) => p.id === projectId)
    const inspector = sampleStaff.find((s) => s.id === inspectorId)

    if (!project || !inspector) return

    const patrol = {
      id: patrols.length + 1,
      projectId,
      projectName: project.name,
      patrolDate: new Date(newPatrol.patrolDate),
      inspectorId,
      inspectorName: inspector.name,
      checklistJson: newPatrol.checklistJson,
      comment: newPatrol.comment,
      photos: newPatrol.photos,
      status: "pending",
      createdAt: new Date(),
    }

    setPatrols([...patrols, patrol])
    setNewPatrol({
      projectId: "",
      inspectorId: "",
      patrolDate: new Date().toISOString().split("T")[0],
      checklistJson: {
        machines: "good",
        protectiveGear: "good",
        waste: "good",
        noise: "good",
        scaffolding: "good",
        electricity: "good",
        fire: "good",
        signage: "good",
      },
      comment: "",
      photos: [],
    })
    setIsAddDialogOpen(false)
  }

  const handleApprovePatrol = (patrolId: number) => {
    const updatedPatrols = patrols.map((patrol) =>
      patrol.id === patrolId ? { ...patrol, status: "approved" } : patrol,
    )
    setPatrols(updatedPatrols)
  }

  const handleRejectPatrol = (patrolId: number) => {
    const updatedPatrols = patrols.map((patrol) =>
      patrol.id === patrolId ? { ...patrol, status: "rejected" } : patrol,
    )
    setPatrols(updatedPatrols)
  }

  const getChecklistStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-500 hover:bg-green-600">◎</Badge>
      case "warning":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">△</Badge>
      case "danger":
        return <Badge className="bg-red-500 hover:bg-red-600">×</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">承認待ち</Badge>
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">承認済</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">差戻し</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const countIssues = (patrol: any) => {
    const checklist = patrol.checklistJson
    let warningCount = 0
    let dangerCount = 0

    Object.values(checklist).forEach((status: any) => {
      if (status === "warning") warningCount++
      if (status === "danger") dangerCount++
    })

    return { warningCount, dangerCount }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>安全・環境巡視日誌</CardTitle>
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
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>安全・環境巡視日誌の作成</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="projectId">対象工事</Label>
                    <Select
                      value={newPatrol.projectId}
                      onValueChange={(value) => setNewPatrol({ ...newPatrol, projectId: value })}
                    >
                      <SelectTrigger id="projectId">
                        <SelectValue placeholder="工事を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="inspectorId">巡視者</Label>
                    <Select
                      value={newPatrol.inspectorId}
                      onValueChange={(value) => setNewPatrol({ ...newPatrol, inspectorId: value })}
                    >
                      <SelectTrigger id="inspectorId">
                        <SelectValue placeholder="巡視者を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id.toString()}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patrolDate">巡視日</Label>
                  <Input
                    id="patrolDate"
                    type="date"
                    value={newPatrol.patrolDate}
                    onChange={(e) => setNewPatrol({ ...newPatrol, patrolDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-4">
                  <Label>チェックリスト</Label>
                  <div className="border rounded-md p-4 grid gap-4">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="grid gap-2">
                        <Label htmlFor={item.id}>{item.label}</Label>
                        <RadioGroup
                          id={item.id}
                          value={(newPatrol.checklistJson as any)[item.id]}
                          onValueChange={(value) =>
                            setNewPatrol({
                              ...newPatrol,
                              checklistJson: {
                                ...newPatrol.checklistJson,
                                [item.id]: value,
                              },
                            })
                          }
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="good" id={`${item.id}-good`} />
                            <Label htmlFor={`${item.id}-good`} className="text-green-600">
                              ◎ 良好
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="warning" id={`${item.id}-warning`} />
                            <Label htmlFor={`${item.id}-warning`} className="text-yellow-600">
                              △ 注意
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="danger" id={`${item.id}-danger`} />
                            <Label htmlFor={`${item.id}-danger`} className="text-red-600">
                              × 危険
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comment">コメント</Label>
                  <Textarea
                    id="comment"
                    value={newPatrol.comment}
                    onChange={(e) => setNewPatrol({ ...newPatrol, comment: e.target.value })}
                    placeholder="指摘事項や改善点などを入力してください"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="photos">写真添付</Label>
                  <div className="flex gap-2">
                    <Input
                      id="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const fileNames = Array.from(e.target.files).map((file) => file.name)
                          setNewPatrol({
                            ...newPatrol,
                            photos: [...newPatrol.photos, ...fileNames],
                          })
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newPatrol.photos.map((photo, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {photo}
                        <button
                          type="button"
                          className="ml-1 rounded-full hover:bg-muted p-1"
                          onClick={() =>
                            setNewPatrol({
                              ...newPatrol,
                              photos: newPatrol.photos.filter((_, i) => i !== index),
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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" onClick={handleAddPatrol}>
                  保存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="pending">承認待ち</TabsTrigger>
            <TabsTrigger value="approved">承認済</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>対象工事</TableHead>
                  <TableHead>巡視日</TableHead>
                  <TableHead>巡視者</TableHead>
                  <TableHead>指摘事項</TableHead>
                  <TableHead>コメント</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatrols.map((patrol) => {
                  const { warningCount, dangerCount } = countIssues(patrol)
                  return (
                    <TableRow key={patrol.id}>
                      <TableCell className="font-medium">{patrol.projectName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{patrol.patrolDate.toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{patrol.inspectorName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {dangerCount > 0 && (
                            <Badge className="bg-red-500">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              危険: {dangerCount}
                            </Badge>
                          )}
                          {warningCount > 0 && (
                            <Badge className="bg-yellow-500">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              注意: {warningCount}
                            </Badge>
                          )}
                          {dangerCount === 0 && warningCount === 0 && (
                            <Badge className="bg-green-500">
                              <Check className="h-3 w-3 mr-1" />
                              良好
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{patrol.comment}</TableCell>
                      <TableCell>{getStatusBadge(patrol.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog
                            open={isViewDialogOpen && currentPatrol?.id === patrol.id}
                            onOpenChange={(open) => {
                              setIsViewDialogOpen(open)
                              if (open) setCurrentPatrol(patrol)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setCurrentPatrol(patrol)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                詳細
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>安全・環境巡視日誌詳細</DialogTitle>
                              </DialogHeader>
                              {currentPatrol && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">対象工事</h3>
                                      <p className="font-medium">{currentPatrol.projectName}</p>
                                    </div>
                                    <div className="border rounded-md p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground mb-1">巡視者</h3>
                                      <p className="font-medium">{currentPatrol.inspectorName}</p>
                                    </div>
                                  </div>
                                  <div className="border rounded-md p-4">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">巡視日</h3>
                                    <p className="font-medium">{currentPatrol.patrolDate.toLocaleDateString()}</p>
                                  </div>
                                  <div className="border rounded-md p-4">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">チェックリスト</h3>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                      {checklistItems.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center">
                                          <span>{item.label}</span>
                                          {getChecklistStatusBadge((currentPatrol.checklistJson as any)[item.id])}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="border rounded-md p-4">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">コメント</h3>
                                    <p>{currentPatrol.comment}</p>
                                  </div>
                                  <div className="border rounded-md p-4">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">添付写真</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {currentPatrol.photos.length > 0 ? (
                                        currentPatrol.photos.map((photo: string, index: number) => (
                                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                                            <ImageIcon className="h-3 w-3 mr-1" />
                                            {photo}
                                          </Badge>
                                        ))
                                      ) : (
                                        <p className="text-sm text-muted-foreground">添付写真はありません</p>
                                      )}
                                    </div>
                                  </div>
                                  {currentPatrol.status === "pending" && (
                                    <div className="flex justify-end space-x-2 mt-4">
                                      <Button
                                        variant="outline"
                                        className="bg-red-50 hover:bg-red-100 text-red-600"
                                        onClick={() => {
                                          handleRejectPatrol(currentPatrol.id)
                                          setIsViewDialogOpen(false)
                                        }}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        差戻し
                                      </Button>
                                      <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                          handleApprovePatrol(currentPatrol.id)
                                          setIsViewDialogOpen(false)
                                        }}
                                      >
                                        <Check className="h-4 w-4 mr-2" />
                                        承認
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          {patrol.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-red-50 hover:bg-red-100 text-red-600"
                                onClick={() => handleRejectPatrol(patrol.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-green-50 hover:bg-green-100 text-green-600"
                                onClick={() => handleApprovePatrol(patrol.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredPatrols.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      該当する巡視日誌はありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
