"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/firebase/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LeavesPage() {
  const { user, userData, loading } = useAuth()
  const [leaves, setLeaves] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form State
  const [type, setType] = useState("casual")
  const [reason, setReason] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    async function loadLeaves() {
      if (!user) return
      setIsLoading(true)
      try {
        const { getUserLeaves } = await import("@/lib/firebase/firestore")
        const data = await getUserLeaves(user.uid)
        // sort by newest
        data.sort((a,b) => (b.appliedAt?.seconds || 0) - (a.appliedAt?.seconds || 0))
        setLeaves(data)
      } catch (error) {
        console.error("Error loading leaves", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadLeaves()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userData?.organizationId) return

    setIsSubmitting(true)
    try {
      const { applyForLeave } = await import("@/lib/firebase/firestore")
      const newLeave = {
        userId: user.uid,
        userName: userData.displayName || user.displayName || user.email || "Unknown",
        organizationId: userData.organizationId,
        type: type as any,
        reason,
        startDate,
        endDate
      }
      
      const res = await applyForLeave(newLeave)
      if (res.success) {
        setLeaves([{ ...newLeave, id: res.id, status: "pending", appliedAt: { seconds: Date.now() / 1000 } }, ...leaves])
        setShowForm(false)
        setReason("")
        setStartDate("")
        setEndDate("")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "rejected": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-purple-600 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Leave Management
          </h1>
          <p className="text-muted-foreground mt-1">Apply for and track your leaves of absence.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" /> Apply for Leave
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-8 shadow-premium border-purple-100 dark:border-purple-900">
          <CardHeader>
            <CardTitle>New Leave Request</CardTitle>
            <CardDescription>Submit a new leave application to your admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="half-day">Half Day</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea 
                  placeholder="Please provide a brief reason for your leave..." 
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-premium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-purple-500" />
            Your Leave History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading history...</div>
          ) : leaves.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">You have not submitted any leave requests yet.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium capitalize">{leave.type.replace('-', ' ')}</TableCell>
                      <TableCell>{leave.startDate} to {leave.endDate}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={leave.reason}>{leave.reason}</TableCell>
                      <TableCell>{new Date(leave.appliedAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{getStatusBadge(leave.status)}</TableCell>
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
