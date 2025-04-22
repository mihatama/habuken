"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Phone, Mail, Tag } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// モックデータ
const initialStaff = [
  {
    id: 1,
    name: "石川遼",
    position: "現場監督",
    email: "ishikawa@example.com",
    phone: "090-1234-5678",
    skills: ["電気工事", "配管工事", "その他工事"],
    area: "東京",
  },
  {
    id: 2,
    name: "エル",
    position: "作業員",
    email: "eru@example.com",
    phone: "090-2345-6789",
    skills: ["電気工事", "配管工事"],
    area: "東京",
  },
  {
    id: 3,
    name: "A.スコット",
    position: "作業員",
    email: "scott@example.com",
    phone: "090-3456-7890",
    skills: ["電気工事"],
    area: "大阪",
  },
  {
    id: 4,
    name: "参宮池沙希",
    position: "事務",
    email: "saki@example.com",
    phone: "090-4567-8901",
    skills: ["事務作業"],
    area: "東京",
  },
]

export function StaffList() {
  const [staff, setStaff] = useState(initialStaff)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<any>(null)
  const [newStaff, setNewStaff] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    skills: [] as string[],
    area: "",
  })
  const [newSkill, setNewSkill] = useState("")

  const filteredStaff = staff.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddStaff = () => {
    const staffMember = {
      id: staff.length + 1,
      ...newStaff,
    }

    setStaff([...staff, staffMember])
    setNewStaff({
      name: "",
      position: "",
      email: "",
      phone: "",
      skills: [],
      area: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditStaff = () => {
    const updatedStaff = staff.map((person) => (person.id === currentStaff.id ? currentStaff : person))
    setStaff(updatedStaff)
    setIsEditDialogOpen(false)
  }

  const handleDeleteStaff = (id: number) => {
    setStaff(staff.filter((person) => person.id !== id))
  }

  const addSkillToNew = () => {
    if (newSkill && !newStaff.skills.includes(newSkill)) {
      setNewStaff({
        ...newStaff,
        skills: [...newStaff.skills, newSkill],
      })
      setNewSkill("")
    }
  }

  const addSkillToCurrent = () => {
    if (newSkill && currentStaff && !currentStaff.skills.includes(newSkill)) {
      setCurrentStaff({
        ...currentStaff,
        skills: [...currentStaff.skills, newSkill],
      })
      setNewSkill("")
    }
  }

  const removeSkillFromNew = (skill: string) => {
    setNewStaff({
      ...newStaff,
      skills: newStaff.skills.filter((s) => s !== skill),
    })
  }

  const removeSkillFromCurrent = (skill: string) => {
    if (currentStaff) {
      setCurrentStaff({
        ...currentStaff,
        skills: currentStaff.skills.filter((s: string) => s !== skill),
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>スタッフ一覧</CardTitle>
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
                新規スタッフ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規スタッフの追加</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">氏名</Label>
                  <Input
                    id="name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">役職</Label>
                  <Input
                    id="position"
                    value={newStaff.position}
                    onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="area">担当エリア</Label>
                  <Input
                    id="area"
                    value={newStaff.area}
                    onChange={(e) => setNewStaff({ ...newStaff, area: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">スキル・資格</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="スキルを入力"
                    />
                    <Button type="button" onClick={addSkillToNew}>
                      追加
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newStaff.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          className="ml-1 rounded-full hover:bg-muted p-1"
                          onClick={() => removeSkillFromNew(skill)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddStaff}>
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
              <TableHead>氏名</TableHead>
              <TableHead>役職</TableHead>
              <TableHead>スキル・資格</TableHead>
              <TableHead>担当エリア</TableHead>
              <TableHead>連絡先</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((person) => (
              <TableRow key={person.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{person.name}</div>
                  </div>
                </TableCell>
                <TableCell>{person.position}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {person.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{person.area}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{person.email}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{person.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Dialog
                      open={isEditDialogOpen && currentStaff?.id === person.id}
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open)
                        if (open) setCurrentStaff(person)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentStaff(person)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>スタッフの編集</DialogTitle>
                        </DialogHeader>
                        {currentStaff && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">氏名</Label>
                              <Input
                                id="edit-name"
                                value={currentStaff.name}
                                onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-position">役職</Label>
                              <Input
                                id="edit-position"
                                value={currentStaff.position}
                                onChange={(e) => setCurrentStaff({ ...currentStaff, position: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-email">メールアドレス</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={currentStaff.email}
                                onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-phone">電話番号</Label>
                              <Input
                                id="edit-phone"
                                value={currentStaff.phone}
                                onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-area">担当エリア</Label>
                              <Input
                                id="edit-area"
                                value={currentStaff.area}
                                onChange={(e) => setCurrentStaff({ ...currentStaff, area: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-skills">スキル・資格</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="edit-skills"
                                  value={newSkill}
                                  onChange={(e) => setNewSkill(e.target.value)}
                                  placeholder="スキルを入力"
                                />
                                <Button type="button" onClick={addSkillToCurrent}>
                                  追加
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {currentStaff.skills.map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                                    {skill}
                                    <button
                                      type="button"
                                      className="ml-1 rounded-full hover:bg-muted p-1"
                                      onClick={() => removeSkillFromCurrent(skill)}
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
                          <Button type="submit" onClick={handleEditStaff}>
                            保存
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteStaff(person.id)}>
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
