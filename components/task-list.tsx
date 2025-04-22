"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle, MessageSquare } from "lucide-react"

// Mock data for tasks
const initialTasks = [
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

export function TaskList() {
  const [tasks, setTasks] = useState(initialTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<any>(null)
  const [newComment, setNewComment] = useState("")

  const filteredTasks = tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStatusChange = (taskId: number, newStatus: string) => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    setTasks(updatedTasks)

    if (currentTask && currentTask.id === taskId) {
      setCurrentTask({ ...currentTask, status: newStatus })
    }
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment = {
      author: "John Doe", // In a real app, this would be the current user
      date: new Date(),
      text: newComment,
    }

    const updatedTask = {
      ...currentTask,
      comments: [...currentTask.comments, comment],
    }

    const updatedTasks = tasks.map((task) => (task.id === currentTask.id ? updatedTask : task))

    setTasks(updatedTasks)
    setCurrentTask(updatedTask)
    setNewComment("")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "In Progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "Not Started":
        return <AlertCircle className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-500 hover:bg-red-600">{priority}</Badge>
      case "Medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{priority}</Badge>
      case "Low":
        return <Badge className="bg-green-500 hover:bg-green-600">{priority}</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Tasks</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search tasks..."
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
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                    <span>{task.status}</span>
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
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentTask(task)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          View Details
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
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Project</h3>
                                <p>{currentTask.project}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                                <p>{currentTask.dueDate.toLocaleDateString()}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                                <p>{getPriorityBadge(currentTask.priority)}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(currentTask.status)}
                                  <span>{currentTask.status}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                              <p>{currentTask.description}</p>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">Update Status</h3>
                              <div className="flex space-x-2 mt-2">
                                <Button
                                  variant={currentTask.status === "Not Started" ? "default" : "outline"}
                                  onClick={() => handleStatusChange(currentTask.id, "Not Started")}
                                >
                                  Not Started
                                </Button>
                                <Button
                                  variant={currentTask.status === "In Progress" ? "default" : "outline"}
                                  onClick={() => handleStatusChange(currentTask.id, "In Progress")}
                                >
                                  In Progress
                                </Button>
                                <Button
                                  variant={currentTask.status === "Completed" ? "default" : "outline"}
                                  onClick={() => handleStatusChange(currentTask.id, "Completed")}
                                >
                                  Completed
                                </Button>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center mb-2">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                <h3 className="text-sm font-medium">Comments</h3>
                              </div>
                              <div className="space-y-4 max-h-[200px] overflow-y-auto">
                                {currentTask.comments.length > 0 ? (
                                  currentTask.comments.map((comment: any, index: number) => (
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
                                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                                )}
                              </div>
                              <div className="mt-4 space-y-2">
                                <Label htmlFor="comment">Add Comment</Label>
                                <Textarea
                                  id="comment"
                                  placeholder="Type your comment here..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                />
                                <Button onClick={handleAddComment}>Add Comment</Button>
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
