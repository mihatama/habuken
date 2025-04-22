"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StaffAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventData?: any
}

// モックデータ
const allStaff = [
  { id: 1, name: "石川遼", skills: ["エル", "A.スコット", "参宮池沙希"] },
  { id: 2, name: "しおこ", skills: ["J.トーマス", "J.ラーム", "J.スピース"] },
  { id: 3, name: "イチロー", skills: ["参宮池沙希", "高橋周士", "DJ"] },
  { id: 4, name: "リッキー", skills: ["R.マキロイ"] },
  { id: 5, name: "目黒太郎", skills: ["A.スコット"] },
  { id: 6, name: "駒方孝市", skills: ["参宮池沙希"] },
  { id: 7, name: "フィル", skills: ["A.スコット"] },
  { id: 8, name: "エル", skills: ["石川遼"] },
  { id: 9, name: "A.スコット", skills: ["石川遼"] },
  { id: 10, name: "参宮池沙希", skills: ["石川遼"] },
]

const allTools = [
  { id: 1, name: "洗浄機B", category: "洗浄機" },
  { id: 2, name: "洗浄機A", category: "洗浄機" },
  { id: 3, name: "3号車", category: "車両" },
  { id: 4, name: "2号車", category: "車両" },
  { id: 5, name: "1号車", category: "車両" },
  { id: 6, name: "会議室B", category: "会議室" },
  { id: 7, name: "会議室A", category: "会議室" },
  { id: 8, name: "運搬①", category: "運搬" },
  { id: 9, name: "運搬②", category: "運搬" },
  { id: 10, name: "運搬③", category: "運搬" },
  { id: 11, name: "レンタルA", category: "レンタル" },
  { id: 12, name: "トラックA", category: "トラック" },
  { id: 13, name: "トラックB", category: "トラック" },
  { id: 14, name: "ホワイトボード", category: "その他" },
  { id: 15, name: "プロジェクター", category: "その他" },
]

export function StaffAssignmentDialog({ open, onOpenChange, eventData }: StaffAssignmentDialogProps) {
  const [selectedStaff, setSelectedStaff] = useState<number[]>([])
  const [selectedTools, setSelectedTools] = useState<number[]>([])
  const [searchStaff, setSearchStaff] = useState("")
  const [searchTools, setSearchTools] = useState("")

  const filteredStaff = allStaff.filter((staff) => staff.name.toLowerCase().includes(searchStaff.toLowerCase()))

  const filteredTools = allTools.filter((tool) => tool.name.toLowerCase().includes(searchTools.toLowerCase()))

  const handleStaffChange = (staffId: number, checked: boolean) => {
    if (checked) {
      setSelectedStaff([...selectedStaff, staffId])
    } else {
      setSelectedStaff(selectedStaff.filter((id) => id !== staffId))
    }
  }

  const handleToolChange = (toolId: number, checked: boolean) => {
    if (checked) {
      setSelectedTools([...selectedTools, toolId])
    } else {
      setSelectedTools(selectedTools.filter((id) => id !== toolId))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>割当</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>スケジュール名</Label>
            <Input defaultValue={eventData?.title || "A店舗3月分"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>開始日時</Label>
              <Input type="datetime-local" defaultValue="2023-03-01T12:00" />
            </div>
            <div className="grid gap-2">
              <Label>終了日時</Label>
              <Input type="datetime-local" defaultValue="2023-03-02T18:00" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>人数</Label>
            <Input type="number" defaultValue="1" min="1" />
          </div>

          <Tabs defaultValue="staff">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="staff">担当するスタッフ</TabsTrigger>
              <TabsTrigger value="tools">全ツール</TabsTrigger>
            </TabsList>
            <TabsContent value="staff" className="border rounded-md p-4">
              <div className="mb-4">
                <Input
                  placeholder="テキスト・数値で検索"
                  value={searchStaff}
                  onChange={(e) => setSearchStaff(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {filteredStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`staff-${staff.id}`}
                        checked={selectedStaff.includes(staff.id)}
                        onCheckedChange={(checked) => handleStaffChange(staff.id, checked as boolean)}
                      />
                      <Label htmlFor={`staff-${staff.id}`} className="flex-1">
                        {staff.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="tools" className="border rounded-md p-4">
              <div className="mb-4">
                <Input
                  placeholder="ツールを絞り込む"
                  value={searchTools}
                  onChange={(e) => setSearchTools(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {filteredTools.map((tool) => (
                    <div key={tool.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tool-${tool.id}`}
                        checked={selectedTools.includes(tool.id)}
                        onCheckedChange={(checked) => handleToolChange(tool.id, checked as boolean)}
                      />
                      <Label htmlFor={`tool-${tool.id}`} className="flex-1">
                        {tool.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>閉じる</Button>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
