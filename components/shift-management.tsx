"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sampleProjects, sampleStaff } from "@/data/sample-data"

// Mock data for shifts
const initialShifts = [
  {
    id: 1,
    projectId: 1,
    staffId: 1,
    startTime: "08:00",
    endTime: "17:00",
    notes: "基礎工事",
  },
  {
    id: 2,
    projectId: 2,
    staffId: 2,
    startTime: "09:00",
    endTime: "18:00",
    notes: "内装工事",
  },
]

export function ShiftManagement() {
  const [shifts, setShifts] = useState(initialShifts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentShift, setCurrentShift] = useState<any>(null)
  const [newShift, setNewShift] = useState({
    projectId: "",
    staffId: "",
    startTime: "",
    endTime: "",
    notes: "",
  })

  const filteredShifts = shifts.filter(
    (shift) =>
      sampleProjects
        .find((project) => project.id === shift.projectId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      sampleStaff
        .find((staff) => staff.id === shift.staffId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  )

  const handleAddShift = () => {
    const shift = {
      id: shifts.length + 1,
      projectId: Number.parseInt(newShift.projectId),
      staffId: Number.parseInt(newShift.staffId),
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      notes: newShift.notes,
    }

    setShifts([...shifts, shift])
    setNewShift({
      projectId: "",
      staffId: "",
      startTime: "",
      endTime: "",
      notes: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditShift = () => {
    const updatedShifts = shifts.map((shift) => (shift.id === currentShift.id ? currentShift : shift))
    setShifts(updatedShifts)
    setIsEditDialogOpen(false)
  }

  const handleDeleteShift = (id: number) => {
    setShifts(shifts.filter((shift) => shift.id !== id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>シフト管理</CardTitle>
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
                新規シフト
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規シフトの追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="projectId">案件</Label>
                  <Select
                    value={newShift.projectId}
                    onValueChange={(value) => setNewShift({ ...newShift, projectId: value })}
                  >
                    <SelectTrigger id="projectId">
                      <SelectValue placeholder="案件を選択" />
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
                  <Label htmlFor="staffId">スタッフ</Label>
                  <Select
                    value={newShift.staffId}
                    onValueChange={(value) => setNewShift({ ...newShift, staffId: value })}
                  >
                    <SelectTrigger id="staffId">
                      <SelectValue placeholder="スタッフを選択" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">開始時間</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newShift.startTime}
                      onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">終了時間</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newShift.endTime}
                      onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">備考</Label>
                  <Input
                    id="notes"
                    value={newShift.notes}
                    onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddShift}>
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
              <TableHead>案件</TableHead>
              <TableHead>スタッフ</TableHead>
              <TableHead>開始時間</TableHead>
              <TableHead>終了時間</TableHead>
              <TableHead>備考</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>{sampleProjects.find((project) => project.id === shift.projectId)?.name}</TableCell>
                <TableCell>{sampleStaff.find((staff) => staff.id === shift.staffId)?.name}</TableCell>
                <TableCell>{shift.startTime}</TableCell>
                <TableCell>{shift.endTime}</TableCell>
                <TableCell>{shift.notes}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Dialog
                      open={isEditDialogOpen && currentShift?.id === shift.id}
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open)
                        if (open) setCurrentShift(shift)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentShift(shift)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>シフトの編集</DialogTitle>
                        </DialogHeader>
                        {currentShift && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-projectId">案件</Label>
                              <Select
                                value={currentShift.projectId}
                                onValueChange={(value) => setCurrentShift({ ...currentShift, projectId: value })}
                              >
                                <SelectTrigger id="edit-projectId">
                                  <SelectValue placeholder="案件を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sampleProjects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                      {project.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-staffId">スタッフ</Label>
                              <Select
                                value={currentShift.staffId}
                                onValueChange={(value) => setCurrentShift({ ...currentShift, staffId: value })}
                              >
                                <SelectTrigger id="edit-staffId">
                                  <SelectValue placeholder="スタッフを選択" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sampleStaff.map((staff) => (
                                    <SelectItem key={staff.id} value={staff.id}>
                                      {staff.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-startTime">開始時間</Label>
                                <Input
                                  id="edit-startTime"
                                  type="time"
                                  value={currentShift.startTime}
                                  onChange={(e) => setCurrentShift({ ...currentShift, startTime: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-endTime">終了時間</Label>
                                <Input
                                  id="edit-endTime"
                                  type="time"
                                  value={currentShift.endTime}
                                  onChange={(e) => setCurrentShift({ ...currentShift, endTime: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-notes">備考</Label>
                              <Input
                                id="edit-notes"
                                value={currentShift.notes}
                                onChange={(e) => setCurrentShift({ ...currentShift, notes: e.target.value })}
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button type="submit" onClick={handleEditShift}>
                            保存
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteShift(shift.id)}>
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
