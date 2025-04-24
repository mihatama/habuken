"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { getAllVacations, sampleStaff } from "@/data/sample-data"

export function VacationList() {
  const [vacations, setVacations] = useState(getAllVacations())
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newVacation, setNewVacation] = useState({
    staffId: "",
    date: "",
    type: "有給",
  })

  const filteredVacations = vacations.filter(
    (vacation) =>
      vacation.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vacation.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddVacation = () => {
    if (!newVacation.staffId || !newVacation.date) return

    const staffId = Number.parseInt(newVacation.staffId)
    const staff = sampleStaff.find((s) => s.id === staffId)

    if (!staff) return

    const vacation = {
      staffId,
      staffName: staff.name,
      date: new Date(newVacation.date),
      type: newVacation.type,
    }

    setVacations([...vacations, vacation])
    setNewVacation({
      staffId: "",
      date: "",
      type: "有給",
    })
    setIsAddDialogOpen(false)
  }

  const handleDeleteVacation = (staffId: number, date: Date) => {
    setVacations(vacations.filter((v) => !(v.staffId === staffId && v.date.getTime() === date.getTime())))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>年休一覧</CardTitle>
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
                年休登録
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>年休の登録</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="staff">スタッフ</Label>
                  <select
                    id="staff"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newVacation.staffId}
                    onChange={(e) => setNewVacation({ ...newVacation, staffId: e.target.value })}
                  >
                    <option value="">スタッフを選択</option>
                    {sampleStaff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">日付</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newVacation.date}
                    onChange={(e) => setNewVacation({ ...newVacation, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">種類</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newVacation.type}
                    onChange={(e) => setNewVacation({ ...newVacation, type: e.target.value })}
                  >
                    <option>有給</option>
                    <option>特別休暇</option>
                    <option>欠勤</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddVacation}>
                  登録
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
              <TableHead>スタッフ名</TableHead>
              <TableHead>日付</TableHead>
              <TableHead>種類</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVacations.map((vacation, index) => (
              <TableRow key={`${vacation.staffId}-${vacation.date.getTime()}-${index}`}>
                <TableCell className="font-medium">{vacation.staffName}</TableCell>
                <TableCell>{vacation.date.toLocaleDateString()}</TableCell>
                <TableCell>{vacation.type}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteVacation(vacation.staffId, vacation.date)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
