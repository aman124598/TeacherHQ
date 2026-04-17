"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/firebase/AuthContext"
import { getBranches, createBranch, updateBranch, Branch } from "@/lib/firebase/organizations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { MapPin, Plus, Building2, Pencil, Trash2, Loader2, Search } from "lucide-react"

export default function BranchManagementPage() {
  const { organization } = useAuth()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    radius: "700" // default radius
  })

  const loadBranches = async () => {
    if (!organization?.id) return
    setLoading(true)
    const data = await getBranches(organization.id)
    setBranches(data)
    setLoading(false)
  }

  useEffect(() => {
    loadBranches()
  }, [organization?.id])

  const handleAddBranch = async () => {
    if (!organization?.id || !formData.name) return
    setSaving(true)
    const branchData = {
      ...formData,
      location: {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      },
      locationRadius: parseInt(formData.radius)
    }
    const result = await createBranch(organization.id, branchData as any)
    if (result.success) {
      setBranches([...branches, result.branch!])
      setIsAddDialogOpen(false)
      setFormData({ name: "", address: "", latitude: "", longitude: "", radius: "700" })
    }
    setSaving(false)
  }

  const handleUpdateBranch = async () => {
    if (!organization?.id || !editingBranch) return
    setSaving(true)
    const branchData = {
      ...formData,
      location: {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      },
      locationRadius: parseInt(formData.radius)
    }
    const result = await updateBranch(organization.id, editingBranch.id, branchData as any)
    if (result.success) {
      setBranches(branches.map(b => b.id === editingBranch.id ? { ...b, ...branchData } : b))
      setEditingBranch(null)
      setFormData({ name: "", address: "", latitude: "", longitude: "", radius: "700" })
    }
    setSaving(false)
  }

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Campus Branches
          </h1>
          <p className="text-muted-foreground mt-1">Manage multiple school or college campuses</p>
        </div>
        <Button
          onClick={() => {
            setFormData({ name: "", address: "", latitude: "", longitude: "", radius: "700" })
            setIsAddDialogOpen(true)
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Branch
        </Button>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search branches..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-muted-foreground">Loading branches...</p>
        </div>
      ) : filteredBranches.length === 0 ? (
        <Card className="border-dashed py-20 flex flex-col items-center justify-center text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold">No Branches Found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Start by adding your first campus branch to manage teachers and students by location.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="hover-card shadow-premium group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-2">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingBranch(branch)
                        setFormData({
                          name: branch.name,
                          address: branch.address || "",
                          latitude: branch.location?.latitude.toString() || "",
                          longitude: branch.location?.longitude.toString() || "",
                          radius: branch.locationRadius?.toString() || "700"
                        })
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{branch.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {branch.address || "No address provided"}
                </CardDescription>
                {branch.location && (
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5">
                      Lat: {branch.location.latitude.toFixed(4)}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5">
                      Lng: {branch.location.longitude.toFixed(4)}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-muted-foreground">Branch ID</span>
                  <span className="font-mono text-xs">{branch.id}</span>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button variant="outline" className="w-full text-xs" asChild>
                  <a href={`/admin/departments?branchId=${branch.id}`}>
                    Manage Departments
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || !!editingBranch}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setEditingBranch(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
            <DialogDescription>
              Enter the campus or school branch details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                placeholder="e.g. Main Campus, North Branch"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="13.0722"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="77.5075"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="radius">Geofence Radius (meters)</Label>
              <Input
                id="radius"
                type="number"
                placeholder="700"
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              setEditingBranch(null)
            }}>Cancel</Button>
            <Button
              onClick={editingBranch ? handleUpdateBranch : handleAddBranch}
              disabled={saving || !formData.name}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingBranch ? "Save Changes" : "Create Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
