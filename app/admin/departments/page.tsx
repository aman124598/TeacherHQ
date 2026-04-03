"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/AuthContext"
import { getBranches, getDepartmentsOnBranch, createDepartment, updateDepartment, Department, Branch } from "@/lib/firebase/organizations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Layers, Plus, Pencil, Trash2, Loader2, ArrowLeft, Search, GraduationCap } from "lucide-react"
import Link from "next/link"

function DepartmentManagementContent() {
  const { organization } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>(searchParams.get("branchId") || "")
  const [branches, setBranches] = useState<Branch[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    name: ""
  })

  // Load branches first
  useEffect(() => {
    async function loadInitialData() {
      if (!organization?.id) return
      setLoading(true)
      const branchData = await getBranches(organization.id)
      setBranches(branchData)
      
      if (!selectedBranchId && branchData.length > 0) {
        setSelectedBranchId(branchData[0].id)
      }
      setLoading(false)
    }
    loadInitialData()
  }, [organization?.id])

  // Load departments when branch changes
  useEffect(() => {
    async function loadDepts() {
      if (!organization?.id || !selectedBranchId) return
      setLoading(true)
      const deptData = await getDepartmentsOnBranch(organization.id, selectedBranchId)
      setDepartments(deptData)
      setLoading(false)
    }
    loadDepts()
  }, [organization?.id, selectedBranchId])

  const handleCreateDept = async () => {
    if (!organization?.id || !selectedBranchId || !formData.name) return
    setSaving(true)
    const result = await createDepartment(organization.id, selectedBranchId, formData)
    if (result.success) {
      setDepartments([...departments, result.department!])
      setIsAddDialogOpen(false)
      setFormData({ name: "" })
    }
    setSaving(false)
  }

  const handleUpdateDept = async () => {
    if (!organization?.id || !selectedBranchId || !editingDept) return
    setSaving(true)
    const result = await updateDepartment(organization.id, selectedBranchId, editingDept.id, formData)
    if (result.success) {
      setDepartments(departments.map(d => d.id === editingDept.id ? { ...d, name: formData.name } : d))
      setEditingDept(null)
      setFormData({ name: "" })
    }
    setSaving(false)
  }

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentBranchName = branches.find(b => b.id === selectedBranchId)?.name || "Select Branch"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Departments
            </h1>
            <p className="text-muted-foreground mt-1">Manage academic departments in {currentBranchName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger className="w-48 bg-white dark:bg-slate-800">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
                onClick={() => {
                  setFormData({ name: "" })
                  setIsAddDialogOpen(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                disabled={!selectedBranchId}
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Department
            </Button>
        </div>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search departments..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading departments...</p>
        </div>
      ) : filteredDepts.length === 0 ? (
        <Card className="border-dashed py-20 flex flex-col items-center justify-center text-center">
            <Layers className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold">No Departments Found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {selectedBranchId 
                ? "This branch doesn't have any departments yet. Create one to organize your staff." 
                : "Please select a branch first to view or create departments."}
            </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => (
            <Card key={dept.id} className="hover-card shadow-premium group">
              <CardHeader className="pb-3 border-b border-gray-50 dark:border-slate-700 mb-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingDept(dept)
                        setFormData({ name: dept.name })
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl mt-3">{dept.name}</CardTitle>
                <CardDescription>
                  {currentBranchName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">HOD Assigned</span>
                        <span className="font-semibold text-blue-600">{dept.hodName || "Not Assigned"}</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full text-xs" asChild>
                    <Link href={`/admin/users?deptId=${dept.id}`}>
                        View Teachers
                    </Link>
                 </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={isAddDialogOpen || !!editingDept} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setEditingDept(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDept ? "Edit Department" : "New Department"}</DialogTitle>
            <DialogDescription>
              Create a department like CSE, Mathematics, or Admissions within {currentBranchName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                placeholder="e.g. Computer Science & Engineering"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              setEditingDept(null)
            }}>Cancel</Button>
            <Button 
              onClick={editingDept ? handleUpdateDept : handleCreateDept}
              disabled={saving || !formData.name}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingDept ? "Save Changes" : "Create Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DepartmentManagementPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    }>
        <DepartmentManagementContent />
    </Suspense>
  )
}
