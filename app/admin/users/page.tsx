"use client"

import { useEffect, useState } from "react"
import { getAllUsers, updateUser, deleteUser } from "@/lib/firebase/firestore"
import { UserData } from "@/lib/firebase/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Search, Calendar, BarChart2, Pencil, Trash2, Loader2, RefreshCw, UserPlus } from "lucide-react"
import Link from "next/link"

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    displayName: "",
    email: "",
    role: "",
    teacherId: "",
    department: ""
  })

  const loadUsers = async () => {
    setLoading(true)
    const allUsers = await getAllUsers()
    setUsers(allUsers)
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.teacherId && String(user.teacherId).includes(searchTerm))
  )

  const handleEditClick = (user: UserData) => {
    setEditingUser(user)
    setEditForm({
      displayName: user.displayName || "",
      email: user.email || "",
      role: user.role || "teacher",
      teacherId: user.teacherId || "",
      department: user.department || ""
    })
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setSaving(true)
    
    const result = await updateUser(editingUser.uid, editForm)
    
    if (result.success) {
      // Update local state
      setUsers(users.map(u => 
        u.uid === editingUser.uid ? { ...u, ...editForm } : u
      ))
      setEditingUser(null)
    } else {
      alert("Failed to update user")
    }
    
    setSaving(false)
  }

  const handleDeleteClick = (user: UserData) => {
    setDeletingUser(user)
  }

  const handleConfirmDelete = async () => {
    if (!deletingUser) return
    setSaving(true)
    
    const result = await deleteUser(deletingUser.uid)
    
    if (result.success) {
      setUsers(users.filter(u => u.uid !== deletingUser.uid))
      setDeletingUser(null)
    } else {
      alert("Failed to delete user")
    }
    
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Manage Users
          </h1>
          <p className="text-muted-foreground mt-1">View and manage teacher schedules and information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={loadUsers}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-8 bg-white dark:bg-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800">
                <TableHead>User Info</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Teacher ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.uid} className="group hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <TableCell>
                      <div>
                        <div className="font-medium dark:text-white">{user.displayName || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? "default" : "secondary"} className={user.role === 'admin' ? "bg-purple-500" : ""}>
                        {user.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm dark:text-gray-300">
                      {user.teacherId || "-"}
                    </TableCell>
                    <TableCell className="dark:text-gray-300">
                      {user.department || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditClick(user)}
                          className="h-8 border-purple-200 hover:bg-purple-50 hover:text-purple-600 dark:border-purple-900 dark:hover:bg-purple-900/30"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button asChild size="sm" variant="outline" className="h-8 border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-900 dark:hover:bg-blue-900/30">
                          <Link href={`/admin/schedule/${user.uid}`}>
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="h-8 border-green-200 hover:bg-green-50 hover:text-green-600 dark:border-green-900 dark:hover:bg-green-900/30">
                          <Link href={`/admin/stats?userId=${user.uid}`}>
                            <BarChart2 className="h-4 w-4 mr-1" />
                            Stats
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteClick(user)}
                          className="h-8 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-md dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Changes will sync to Firebase.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={editForm.displayName}
                onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                className="dark:bg-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="dark:bg-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editForm.role} onValueChange={(val) => setEditForm({...editForm, role: val})}>
                  <SelectTrigger className="dark:bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teacher ID</Label>
                <Input
                  value={editForm.teacherId}
                  onChange={(e) => setEditForm({...editForm, teacherId: e.target.value})}
                  className="dark:bg-slate-900"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={editForm.department}
                onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                className="dark:bg-slate-900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent className="sm:max-w-md dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingUser?.displayName}</strong>? 
              This will also remove their schedule and attendance data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete} 
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
