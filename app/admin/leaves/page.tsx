"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/firebase/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

export default function AdminLeavesPage() {
  const { user, userData, loading } = useAuth()
  const [leaves, setLeaves] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadLeaves = async () => {
    if (!userData?.organizationId || userData?.organizationRole !== "admin") return
    setIsLoading(true)
    try {
      const { getOrganizationLeaves } = await import("@/lib/firebase/firestore")
      const data = await getOrganizationLeaves(userData.organizationId)
      setLeaves(data)
    } catch (error) {
      console.error("Error loading leaves", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && userData) {
      loadLeaves()
    }
  }, [user, userData, loading])

  const handleUpdateStatus = async (leaveId: string, status: "approved" | "rejected") => {
    try {
      const { updateLeaveStatus } = await import("@/lib/firebase/firestore")
      const res = await updateLeaveStatus(leaveId, status)
      if (res.success) {
        setLeaves(leaves.map(l => l.id === leaveId ? { ...l, status } : l))
      }
    } catch (error) {
      console.error("Error updating status", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "rejected": return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      default: return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>

  if (userData?.organizationRole !== "admin") {
    return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Leave Approvals
        </h1>
        <p className="text-muted-foreground mt-1">Review and manage leave requests from your teachers.</p>
      </div>

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-purple-500" />
            Pending & History
          </CardTitle>
          <CardDescription>All leave requests submitted in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading request queue...</div>
          ) : leaves.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No leave requests found.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="w-1/3">Reason</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-semibold">{leave.userName || "Teacher"}</TableCell>
                      <TableCell className="capitalize">{leave.type.replace('-', ' ')}</TableCell>
                      <TableCell className="whitespace-nowrap">{leave.startDate} to {leave.endDate}</TableCell>
                      <TableCell>
                        <p className="line-clamp-2 text-sm text-muted-foreground" title={leave.reason}>{leave.reason}</p>
                      </TableCell>
                      <TableCell>{new Date(leave.appliedAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell className="text-right">
                        {leave.status === "pending" && (
                          <div className="flex justify-end gap-2">
                             <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(leave.id, "approved")}>
                               <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                             </Button>
                             <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(leave.id, "rejected")}>
                               <XCircle className="h-4 w-4 mr-1" /> Reject
                             </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
