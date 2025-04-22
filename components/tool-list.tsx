"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Users, Briefcase, PenToolIcon as Tool } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { sampleTools, sampleProjects, sampleStaff } from "@/data/sample-data"

export function ToolList() {
  const [tools, setTools] = useState(sampleTools)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentTool, setCurrentTool] = useState<any>(null)
  const [newTool, setNewTool] = useState({
    name: "",
    category: "工具",
    location: "",
    status: "利用可能",
    lastMaintenance: "",
    assignedProjects: [] as number[],
    assignedStaff: [] as number[],
  })

  // 工具のみをフィルタリング
  const filteredTools = tools
    .filter((tool) => tool.category === "工具")
    .filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.location.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const handleAddTool = () => {
    const tool = {
      id: tools.length + 1,
      name: newTool.name,
      category: "工具",
      location: newTool.location,
      status: newTool.status,
      lastMaintenance: newTool.lastMaintenance ? new Date(newTool.lastMaintenance) : null,
      assignedProjects: newTool.assignedProjects,
      assignedStaff: newTool.assignedStaff,
    }

    setTools([...tools, tool])
    setNewTool({
      name: "",
      category: "工具",
      location: "",
      status: "利用可能",
      lastMaintenance: "",
      assignedProjects: [],
      assignedStaff: [],
    })
    setIsAddDialogOpen(false)
  }

  const handleEditTool = () => {
    const updatedTools = tools.map((tool) => (tool.id === currentTool.id ? currentTool : tool))
    setTools(updatedTools)
    setIsEditDialogOpen(false)
  }

  const handleDeleteTool = (id: number) => {
    setTools(tools.filter((tool) => tool.id !== id))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "利用可能":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "利用中":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      case "メンテナンス中":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    return <Tool className="h-4 w-4 mr-2" />
  }

  // ツールに紐づくプロジェクトを取得
  const getToolProjects = (toolId: number) => {
    const tool = tools.find((t) => t.id === toolId)
    if (!tool) return []

    return sampleProjects.filter((project) => tool.assignedProjects.includes(project.id))
  }

  // ツールに紐づくスタッフを取得
  const getToolStaff = (toolId: number) => {
    const tool = tools.find((t) => t.id === toolId)
    if (!tool) return []

    return sampleStaff.filter((staff) => tool.assignedStaff.includes(staff.id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">{/* 切り替えボタンを削除 */}</div>
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
                新規追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>工具の追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">名称</Label>
                  <Input
                    id="name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">保管場所</Label>
                  <Input
                    id="location"
                    value={newTool.location}
                    onChange={(e) => setNewTool({ ...newTool, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">状態</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTool.status}
                    onChange={(e) => setNewTool({ ...newTool, status: e.target.value })}
                  >
                    <option>利用可能</option>
                    <option>利用中</option>
                    <option>メンテナンス中</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastMaintenance">最終メンテナンス日</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={newTool.lastMaintenance}
                    onChange={(e) => setNewTool({ ...newTool, lastMaintenance: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignedProjects">使用案件</Label>
                  <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                    {sampleProjects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`project-${project.id}`}
                          checked={newTool.assignedProjects.includes(project.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTool({
                                ...newTool,
                                assignedProjects: [...newTool.assignedProjects, project.id],
                              })
                            } else {
                              setNewTool({
                                ...newTool,
                                assignedProjects: newTool.assignedProjects.filter((id) => id !== project.id),
                              })
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`project-${project.id}`} className="text-sm">
                          {project.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignedStaff">担当スタッフ</Label>
                  <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                    {sampleStaff.map((staff) => (
                      <div key={staff.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`staff-${staff.id}`}
                          checked={newTool.assignedStaff.includes(staff.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTool({
                                ...newTool,
                                assignedStaff: [...newTool.assignedStaff, staff.id],
                              })
                            } else {
                              setNewTool({
                                ...newTool,
                                assignedStaff: newTool.assignedStaff.filter((id) => id !== staff.id),
                              })
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`staff-${staff.id}`} className="text-sm">
                          {staff.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddTool}>
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>保管場所</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>関連情報</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell>{tool.location}</TableCell>
                <TableCell>{getStatusBadge(tool.status)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1">
                      {getToolProjects(tool.id).map((project) => (
                        <Badge key={project.id} variant="outline" className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {project.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {getToolStaff(tool.id).map((staff) => (
                        <Badge key={staff.id} variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {staff.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Dialog
                      open={isEditDialogOpen && currentTool?.id === tool.id}
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open)
                        if (open) setCurrentTool(tool)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentTool(tool)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>工具の編集</DialogTitle>
                        </DialogHeader>
                        {currentTool && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">名称</Label>
                              <Input
                                id="edit-name"
                                value={currentTool.name}
                                onChange={(e) => setCurrentTool({ ...currentTool, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-location">保管場所</Label>
                              <Input
                                id="edit-location"
                                value={currentTool.location}
                                onChange={(e) => setCurrentTool({ ...currentTool, location: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-status">状態</Label>
                              <select
                                id="edit-status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={currentTool.status}
                                onChange={(e) => setCurrentTool({ ...currentTool, status: e.target.value })}
                              >
                                <option>利用可能</option>
                                <option>利用中</option>
                                <option>メンテナンス中</option>
                              </select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-lastMaintenance">最終メンテナンス日</Label>
                              <Input
                                id="edit-lastMaintenance"
                                type="date"
                                value={
                                  currentTool.lastMaintenance instanceof Date
                                    ? currentTool.lastMaintenance.toISOString().split("T")[0]
                                    : currentTool.lastMaintenance
                                }
                                onChange={(e) =>
                                  setCurrentTool({
                                    ...currentTool,
                                    lastMaintenance: e.target.value ? new Date(e.target.value) : null,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button type="submit" onClick={handleEditTool}>
                            保存
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteTool(tool.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
