"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle, MessageSquare } from "lucide-react"

// 型定義
interface Comment {
  author: string
  date: Date
  text: string
}

interface Task {
  id: number
  name: string
  project: string
  dueDate: Date
  status: string
  priority: string
  description: string
  comments: Comment[]
}

// モックデータ
const initialTasks: Task[] = [
  {
    id: 1,
    name: "Site Survey",
    project: "Project Alpha",
    dueDate: new Date(2025, 3, 20),
    status: "Completed",
    priority: "High",
    description: "Complete initial site survey and document findings.",
    comments: [
      {
        author: "John Doe",
        date: new Date(2025, 3, 15),
        text: "Survey completed. Report attached in project files.",
      },
    ],
  },
  {
    id: 2,
    name: "Material Procurement",
    project: "Project Beta",
    dueDate: new Date(2025, 3, 25),
    status: "In Progress",
    priority: "Medium",
    description: "Order and confirm delivery of required materials.",
    comments: [
      {
        author: "Jane Smith",
        date: new Date(2025, 3, 10),
        text: "Orders placed with supplier. Awaiting confirmation.",
      },
    ],
  },
  {
    id: 3,
    name: "Safety Inspection",
    project: "Project Alpha",
    dueDate: new Date(2025, 4, 5),
    status: "Not Started",
    priority: "High",
    description: "Conduct safety inspection before construction begins.",
    comments: [],
  },
  {
    id: 4,
    name: "Client Meeting",
    project: "Project Gamma",
    dueDate: new Date(2025, 3, 18),
    status: "In Progress",
    priority: "High",
    description: "Prepare presentation and meet with client to discuss progress.",
    comments: [
      {
        author: "Project Manager",
        date: new Date(2025, 3, 12),
        text: "Presentation draft completed. Please review before meeting.",
      },
    ],
  },
]

// ステータスアイコンのマッピング
const STATUS_ICONS = {
  Completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  "In Progress": <Clock className="h-5 w-5 text-blue-500" />,
  "Not Started": <AlertCircle className="h-5 w-5 text-gray-500" />,
}

// STATUS_ICONS の定義の近くに以下を追加
const STATUS_TEXT = {
  Completed: "完了",
  "In Progress": "進行中",
  "Not Started": "未着手",
}

// 優先度バッジのマッピング
const PRIORITY_BADGES = {
  High: { className: "bg-red-500 hover:bg-red-600" },
  Medium: { className: "bg-yellow-500 hover:bg-yellow-600" },
  Low: { className: "bg-green-500 hover:bg-green-600" },
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [newComment, setNewComment] = useState("")

  // フィルタリングされたタスクリストをメモ化
  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [tasks, searchTerm])

  // ステータス変更ハンドラ
  const handleStatusChange = useCallback((taskId: number, newStatus: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))

    setCurrentTask((prev) => {
      if (prev && prev.id === taskId) {
        return { ...prev, status: newStatus }
      }
      return prev
    })
  }, [])

  // コメント追加ハンドラ
  const handleAddComment = useCallback(() => {
    if (!newComment.trim() || !currentTask) return

    const comment: Comment = {
      author: "John Doe", // 実際のアプリでは現在のユーザー
      date: new Date(),
      text: newComment,
    }

    const updatedTask = {
      ...currentTask,
      comments: [...currentTask.comments, comment],
    }

    setTasks((prev) => prev.map((task) => (task.id === currentTask.id ? updatedTask : task)))
    setCurrentTask(updatedTask)
    setNewComment("")
  }, [newComment, currentTask])

  // ステータスアイコンを取得する関数
  const getStatusIcon = useCallback((status: string) => {
    return STATUS_ICONS[status as keyof typeof STATUS_ICONS] || null
  }, [])

  // 優先度バッジを取得する関数
  const getPriorityBadge = useCallback((priority: string) => {
    const badgeConfig = PRIORITY_BADGES[priority as keyof typeof PRIORITY_BADGES] || {}
    return <Badge className={badgeConfig.className || ""}>{priority}</Badge>
  }, [])

  // タスク詳細を表示する関数
  const viewTaskDetails = useCallback((task: Task) => {
    setCurrentTask(task)
    setIsViewDialogOpen(true)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>私のタスク一覧</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="タスクを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タスク名</TableHead>
              <TableHead>プロジェクト</TableHead>
              <TableHead>期限日</TableHead>
              <TableHead>優先度</TableHead>
              <TableHead>状態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>{task.project}</TableCell>
                <TableCell>{task.dueDate.toLocaleDateString()}</TableCell>
                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <span>{STATUS_TEXT[task.status] || task.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Dialog
                      open={isViewDialogOpen && currentTask?.id === task.id}
                      onOpenChange={(open) => {
                        setIsViewDialogOpen(open)
                        if (open) setCurrentTask(task)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => viewTaskDetails(task)}>
                          詳細を見る
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{task.name}</DialogTitle>
                        </DialogHeader>
                        {currentTask && (
                          <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">プロジェクト</h3>
                                <p>{currentTask.project}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">期限日</h3>
                                <p>{currentTask.dueDate.toLocaleDateString()}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">優先度</h3>
                                <p>{getPriorityBadge(currentTask.priority)}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">状態</h3>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(currentTask.status)}
                                  <span>{STATUS_TEXT[currentTask.status] || currentTask.status}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">説明</h3>
                              <p>{currentTask.description}</p>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">状態を更新</h3>
                              <div className="flex space-x-2 mt-2">
                                <Button
                                  variant={currentTask.status === "Not Started" ? "default" : "outline"}
                                  onClick={() => handleStatusChange(currentTask.id, "Not Started")}
                                >
                                  未着手
                                </Button>
                                <Button
                                  variant={currentTask.status === "In Progress" ? "default" : "outline"}
                                  onClick={() => handleStatusChange(currentTask.id, "In Progress")}
                                >
                                  進行中
                                </Button>
                                <Button
                                  variant={currentTask.status === "Completed" ? "default" : "outline"}
                                  onClick={() => handleStatusChange(currentTask.id, "Completed")}
                                >
                                  完了
                                </Button>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center mb-2">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                <h3 className="text-sm font-medium">コメント</h3>
                              </div>
                              <div className="space-y-4 max-h-[200px] overflow-y-auto">
                                {currentTask.comments.length > 0 ? (
                                  currentTask.comments.map((comment, index) => (
                                    <div key={index} className="p-3 bg-muted rounded-md">
                                      <div className="flex justify-between mb-1">
                                        <span className="font-medium">{comment.author}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {comment.date.toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-sm">{comment.text}</p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">まだコメントはありません。</p>
                                )}
                              </div>
                              <div className="mt-4 space-y-2">
                                <Label htmlFor="comment">コメントを追加</Label>
                                <Textarea
                                  id="comment"
                                  placeholder="ここにコメントを入力してください..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                />
                                <Button onClick={handleAddComment}>コメントを追加</Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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
