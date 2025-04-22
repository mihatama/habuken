"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Truck, Wrench, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// 型定義
interface Resource {
  id: number
  name: string
  type: string
  status: string
  location: string
  nextMaintenance: Date
}

// モックデータ
const initialResources: Resource[] = [
  {
    id: 1,
    name: "Excavator #1",
    type: "Heavy Equipment",
    status: "Available",
    location: "Main Warehouse",
    nextMaintenance: new Date(2025, 5, 15),
  },
  {
    id: 2,
    name: "Truck #1",
    type: "Vehicle",
    status: "In Use",
    location: "Project Alpha Site",
    nextMaintenance: new Date(2025, 4, 20),
  },
  {
    id: 3,
    name: "Cement Mixer",
    type: "Heavy Equipment",
    status: "Maintenance",
    location: "Repair Shop",
    nextMaintenance: new Date(2025, 3, 30),
  },
  {
    id: 4,
    name: "Survey Equipment",
    type: "Tools",
    status: "Available",
    location: "Tool Shed",
    nextMaintenance: new Date(2025, 6, 10),
  },
]

// ステータスバッジのマッピング
const STATUS_BADGES = {
  Available: { className: "bg-green-500 hover:bg-green-600" },
  "In Use": { className: "bg-blue-500 hover:bg-blue-600" },
  Maintenance: { className: "bg-yellow-500 hover:bg-yellow-600" },
}

export function ResourceList() {
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentResource, setCurrentResource] = useState<Resource | null>(null)
  const [newResource, setNewResource] = useState({
    name: "",
    type: "",
    status: "Available",
    location: "",
    nextMaintenance: "",
  })

  // フィルタリングされたリソースリストをメモ化
  const filteredResources = useMemo(() => {
    return resources.filter(
      (resource) =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [resources, searchTerm])

  // リソース追加ハンドラ
  const handleAddResource = useCallback(() => {
    if (newResource.name.trim() === "") return

    const resource: Resource = {
      id: resources.length + 1,
      name: newResource.name,
      type: newResource.type,
      status: newResource.status,
      location: newResource.location,
      nextMaintenance: new Date(newResource.nextMaintenance),
    }

    setResources((prev) => [...prev, resource])
    setNewResource({
      name: "",
      type: "",
      status: "Available",
      location: "",
      nextMaintenance: "",
    })
    setIsAddDialogOpen(false)
  }, [newResource, resources])

  // リソース編集ハンドラ
  const handleEditResource = useCallback(() => {
    if (!currentResource) return

    setResources((prev) => prev.map((resource) => (resource.id === currentResource.id ? currentResource : resource)))
    setIsEditDialogOpen(false)
  }, [currentResource])

  // リソース削除ハンドラ
  const handleDeleteResource = useCallback((id: number) => {
    setResources((prev) => prev.filter((resource) => resource.id !== id))
  }, [])

  // ステータスバッジを取得する関数
  const getStatusBadge = useCallback((status: string) => {
    const badgeConfig = STATUS_BADGES[status as keyof typeof STATUS_BADGES] || {}
    return <Badge className={badgeConfig.className || ""}>{status}</Badge>
  }, [])

  // 新しいリソースのフィールド更新ハンドラ
  const handleNewResourceChange = useCallback((field: string, value: string) => {
    setNewResource((prev) => ({ ...prev, [field]: value }))
  }, [])

  // 現在のリソースのフィールド更新ハンドラ
  const handleCurrentResourceChange = useCallback(
    (field: string, value: string | Date) => {
      if (!currentResource) return
      setCurrentResource((prev) => (prev ? { ...prev, [field]: value } : null))
    },
    [currentResource],
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resources & Equipment</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-base">
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Resource Name</Label>
                  <Input
                    id="name"
                    value={newResource.name}
                    onChange={(e) => handleNewResourceChange("name", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={newResource.type}
                    onChange={(e) => handleNewResourceChange("type", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newResource.status}
                    onChange={(e) => handleNewResourceChange("status", e.target.value)}
                  >
                    <option>Available</option>
                    <option>In Use</option>
                    <option>Maintenance</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newResource.location}
                    onChange={(e) => handleNewResourceChange("location", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nextMaintenance">Next Maintenance Date</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={newResource.nextMaintenance}
                    onChange={(e) => handleNewResourceChange("nextMaintenance", e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddResource}>
                  Add Resource
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Next Maintenance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {resource.type === "Vehicle" ? (
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="font-medium">{resource.name}</div>
                  </div>
                </TableCell>
                <TableCell>{resource.type}</TableCell>
                <TableCell>{getStatusBadge(resource.status)}</TableCell>
                <TableCell>{resource.location}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{resource.nextMaintenance.toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Dialog
                      open={isEditDialogOpen && currentResource?.id === resource.id}
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open)
                        if (open) setCurrentResource(resource)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentResource(resource)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Resource</DialogTitle>
                        </DialogHeader>
                        {currentResource && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">Resource Name</Label>
                              <Input
                                id="edit-name"
                                value={currentResource.name}
                                onChange={(e) => handleCurrentResourceChange("name", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-type">Type</Label>
                              <Input
                                id="edit-type"
                                value={currentResource.type}
                                onChange={(e) => handleCurrentResourceChange("type", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-status">Status</Label>
                              <select
                                id="edit-status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={currentResource.status}
                                onChange={(e) => handleCurrentResourceChange("status", e.target.value)}
                              >
                                <option>Available</option>
                                <option>In Use</option>
                                <option>Maintenance</option>
                              </select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-location">Location</Label>
                              <Input
                                id="edit-location"
                                value={currentResource.location}
                                onChange={(e) => handleCurrentResourceChange("location", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-nextMaintenance">Next Maintenance Date</Label>
                              <Input
                                id="edit-nextMaintenance"
                                type="date"
                                value={
                                  currentResource.nextMaintenance instanceof Date
                                    ? currentResource.nextMaintenance.toISOString().split("T")[0]
                                    : currentResource.nextMaintenance.toString()
                                }
                                onChange={(e) =>
                                  handleCurrentResourceChange("nextMaintenance", new Date(e.target.value))
                                }
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button type="submit" onClick={handleEditResource}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteResource(resource.id)}>
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
