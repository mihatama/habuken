"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { sampleProjects } from "@/data/sample-data"

export function ProjectList() {
  const [projects, setProjects] = useState(sampleProjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "未着手",
    client: "",
    location: "",
    assignedStaff: [] as number[],
    assignedTools: [] as number[],
  })

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProject = () => {
    const project = {
      id: projects.length + 1,
      name: newProject.name,
      description: newProject.description,
      startDate: new Date(newProject.startDate),
      endDate: new Date(newProject.endDate),
      status: newProject.status,
      client: newProject.client,
      location: newProject.location,
      assignedStaff: newProject.assignedStaff,
      assignedTools: newProject.assignedTools,
    }

    setProjects([...projects, project])
    setNewProject({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "未着手",
      client: "",
      location: "",
      assignedStaff: [],
      assignedTools: [],
    })
    setIsAddDialogOpen(false)
  }

  const handleEditProject = () => {
    const updatedProjects = projects.map((project) => (project.id === currentProject.id ? currentProject : project))
    setProjects(updatedProjects)
    setIsEditDialogOpen(false)
  }

  const handleDeleteProject = (id: number) => {
    setProjects(projects.filter((project) => project.id !== id))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "未着手":
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
      case "計画中":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      case "進行中":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "完了":
        return <Badge className="bg-purple-500 hover:bg-purple-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>案件一覧</CardTitle>
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
                新規案件
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規案件の追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">案件名</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client">クライアント</Label>
                  <Input
                    id="client"
                    value={newProject.client}
                    onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">開始日</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">終了日</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">ステータス</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  >
                    <option>未着手</option>
                    <option>計画中</option>
                    <option>進行中</option>
                    <option>完了</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddProject}>
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
              <TableHead>案件名</TableHead>
              <TableHead>クライアント</TableHead>
              <TableHead>期間</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.client}</TableCell>
                <TableCell>
                  {project.startDate.toLocaleDateString()} 〜 {project.endDate.toLocaleDateString()}
                </TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Dialog
                      open={isEditDialogOpen && currentProject?.id === project.id}
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open)
                        if (open) setCurrentProject(project)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentProject(project)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>案件の編集</DialogTitle>
                        </DialogHeader>
                        {currentProject && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">案件名</Label>
                              <Input
                                id="edit-name"
                                value={currentProject.name}
                                onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-client">クライアント</Label>
                              <Input
                                id="edit-client"
                                value={currentProject.client}
                                onChange={(e) => setCurrentProject({ ...currentProject, client: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-description">説明</Label>
                              <Textarea
                                id="edit-description"
                                value={currentProject.description}
                                onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-startDate">開始日</Label>
                                <Input
                                  id="edit-startDate"
                                  type="date"
                                  value={
                                    currentProject.startDate instanceof Date
                                      ? currentProject.startDate.toISOString().split("T")[0]
                                      : currentProject.startDate
                                  }
                                  onChange={(e) =>
                                    setCurrentProject({
                                      ...currentProject,
                                      startDate: new Date(e.target.value),
                                    })
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-endDate">終了日</Label>
                                <Input
                                  id="edit-endDate"
                                  type="date"
                                  value={
                                    currentProject.endDate instanceof Date
                                      ? currentProject.endDate.toISOString().split("T")[0]
                                      : currentProject.endDate
                                  }
                                  onChange={(e) =>
                                    setCurrentProject({
                                      ...currentProject,
                                      endDate: new Date(e.target.value),
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-status">ステータス</Label>
                              <select
                                id="edit-status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={currentProject.status}
                                onChange={(e) => setCurrentProject({ ...currentProject, status: e.target.value })}
                              >
                                <option>未着手</option>
                                <option>計画中</option>
                                <option>進行中</option>
                                <option>完了</option>
                              </select>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button type="submit" onClick={handleEditProject}>
                            保存
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteProject(project.id)}>
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
