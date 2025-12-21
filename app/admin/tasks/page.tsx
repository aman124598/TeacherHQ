"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createTask, getAllTasks, updateTask, deleteTask, getAllTeachers, TaskData } from "@/lib/firebase/firestore"
import { UserData } from "@/lib/firebase/auth"
import { CheckSquare, Plus, Calendar as CalendarIcon, Trash2, Pencil, Loader2, RefreshCw, Bell, Clock, CheckCircle2 } from "lucide-react"

export default function AdminTasksPage() {
  const [loading, setLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [teachers, setTeachers] = useState<UserData[]>([])
  const [editingTask, setEditingTask] = useState<TaskData | null>(null)
  const [deletingTask, setDeletingTask] = useState<TaskData | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [task, setTask] = useState({
    title: "",
    description: "",
    type: "task",
    assignedTo: "all",
    dueDate: ""
  })

  const loadData = async () => {
    setTasksLoading(true)
    const [allTasks, allTeachers] = await Promise.all([
      getAllTasks(),
      getAllTeachers()
    ])
    setTasks(allTasks)
    setTeachers(allTeachers)
    setTasksLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await createTask({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        type: task.type as any,
        status: 'pending'
      })
      setTask({ title: "", description: "", type: "task", assignedTo: "all", dueDate: "" })
      await loadData() // Refresh list
    } catch (error) {
      console.error(error)
      alert("Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (t: TaskData) => {
    setEditingTask(t)
  }

  const handleSaveEdit = async () => {
    if (!editingTask?.id) return
    setSaving(true)
    
    const result = await updateTask(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      type: editingTask.type,
      assignedTo: editingTask.assignedTo,
      status: editingTask.status
    })
    
    if (result.success) {
      setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t))
      setEditingTask(null)
    } else {
      alert("Failed to update task")
    }
    
    setSaving(false)
  }

  const handleStatusToggle = async (t: TaskData) => {
    if (!t.id) return
    const newStatus = t.status === 'pending' ? 'completed' : 'pending'
    
    const result = await updateTask(t.id, { status: newStatus })
    
    if (result.success) {
      setTasks(tasks.map(task => 
        task.id === t.id ? { ...task, status: newStatus } : task
      ))
    }
  }

  const handleDeleteClick = (t: TaskData) => {
    setDeletingTask(t)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTask?.id) return
    setSaving(true)
    
    const result = await deleteTask(deletingTask.id)
    
    if (result.success) {
      setTasks(tasks.filter(t => t.id !== deletingTask.id))
      setDeletingTask(null)
    } else {
      alert("Failed to delete task")
    }
    
    setSaving(false)
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'task': return 'bg-blue-500'
      case 'notice': return 'bg-yellow-500'
      case 'event': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Task Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage tasks, notices, and events for teachers</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadData}
          disabled={tasksLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${tasksLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Task */}
        <Card className="dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Task
            </CardTitle>
            <CardDescription>Send a new task or announcement to teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input 
                  placeholder="e.g., Submit Monthly Report" 
                  value={task.title}
                  onChange={(e) => setTask({...task, title: e.target.value})}
                  required
                  className="dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={task.type} 
                    onValueChange={(val) => setTask({...task, type: val})}
                  >
                    <SelectTrigger className="dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="notice">Notice</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                   <Label>Assign To</Label>
                   <Select 
                     value={task.assignedTo} 
                     onValueChange={(val) => setTask({...task, assignedTo: val})}
                   >
                     <SelectTrigger className="dark:bg-slate-900">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">All Teachers</SelectItem>
                       {teachers.map(t => (
                         <SelectItem key={t.uid} value={t.uid}>
                           {t.displayName || t.email}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Details about the task..."
                  value={task.description}
                  onChange={(e) => setTask({...task, description: e.target.value})}
                  className="h-24 dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date (Optional)</Label>
                <Input 
                  type="date" 
                  value={task.dueDate}
                  onChange={(e) => setTask({...task, dueDate: e.target.value})}
                  className="dark:bg-slate-900"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card className="dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              All Tasks
            </CardTitle>
            <CardDescription>Manage existing tasks and notices</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="w-full rounded-none border-b dark:border-slate-700">
                <TabsTrigger value="pending" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending ({pendingTasks.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completed ({completedTasks.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="p-4 max-h-[400px] overflow-y-auto">
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  </div>
                ) : pendingTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending tasks</p>
                ) : (
                  <div className="space-y-3">
                    {pendingTasks.map(t => (
                      <div key={t.id} className="p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 group hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getTypeColor(t.type)}>{t.type}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {t.assignedTo === 'all' ? 'All Teachers' : 'Specific User'}
                              </span>
                            </div>
                            <h4 className="font-medium dark:text-white truncate">{t.title}</h4>
                            {t.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleStatusToggle(t)}
                              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEditClick(t)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteClick(t)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="p-4 max-h-[400px] overflow-y-auto">
                {completedTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No completed tasks</p>
                ) : (
                  <div className="space-y-3">
                    {completedTasks.map(t => (
                      <div key={t.id} className="p-3 rounded-lg border dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 opacity-75 group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-green-600 border-green-300">Completed</Badge>
                            </div>
                            <h4 className="font-medium dark:text-white truncate line-through">{t.title}</h4>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleStatusToggle(t)}
                              className="h-8 w-8 p-0 text-yellow-600"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteClick(t)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-md dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task information. Changes will sync to Firebase.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  className="dark:bg-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={editingTask.type} 
                    onValueChange={(val) => setEditingTask({...editingTask, type: val as any})}
                  >
                    <SelectTrigger className="dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="notice">Notice</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editingTask.status} 
                    onValueChange={(val) => setEditingTask({...editingTask, status: val as any})}
                  >
                    <SelectTrigger className="dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={saving}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <DialogContent className="sm:max-w-md dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "<strong>{deletingTask?.title}</strong>"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingTask(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete} 
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
