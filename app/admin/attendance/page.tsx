"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Calendar,
  Users,
  TrendingUp,
  Filter,
  Download,
  Loader2,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { getAllUsers, getAllAttendance } from "@/lib/firebase/firestore"
import { UserData } from "@/lib/firebase/auth"

interface AttendanceRecord {
  id: string
  userId: string
  organizationId?: string
  presentDays: number
  absentDays: number
  totalDays: number
  lastMarked?: any
  records: {
    date: string
    timeIn: string
    status: string
    timestamp?: any
    location?: {
      latitude: number
      longitude: number
      distance: number
    }
  }[]
}

export default function AdminAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [refreshing, setRefreshing] = useState(false)

  // Flatten all attendance records for display
  const [flattenedRecords, setFlattenedRecords] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersData, attendanceData] = await Promise.all([
        getAllUsers(),
        getAllAttendance()
      ])

      setUsers(usersData)
      setAttendance(attendanceData as any)

      // Flatten records for table display
      const flattened: any[] = []
      ;(attendanceData as AttendanceRecord[]).forEach((att) => {
        const user = usersData.find(u => u.uid === att.id)
        if (att.records && Array.isArray(att.records)) {
          att.records.forEach((record: any) => {
            flattened.push({
              ...record,
              userId: att.id,
              userName: user?.displayName || 'Unknown',
              userEmail: user?.email || '',
              userPhoto: (user as any)?.photoURL || null,
            })
          })
        }
      })

      // Sort by date descending
      flattened.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB.getTime() - dateA.getTime()
      })

      setFlattenedRecords(flattened)
    } catch (error) {
      console.error("Error loading data:", error)
    }
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const getFilteredRecords = () => {
    return flattenedRecords.filter(record => {
      // Search filter
      const matchesSearch = 
        record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.userEmail.toLowerCase().includes(searchTerm.toLowerCase())

      // Date filter
      let matchesDate = true
      if (dateFilter !== "all") {
        const recordDate = new Date(record.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (dateFilter === "today") {
          matchesDate = recordDate.toDateString() === today.toDateString()
        } else if (dateFilter === "week") {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          matchesDate = recordDate >= weekAgo
        } else if (dateFilter === "month") {
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          matchesDate = recordDate >= monthAgo
        }
      }

      // Status filter
      let matchesStatus = true
      if (statusFilter !== "all") {
        matchesStatus = record.status === statusFilter
      }

      return matchesSearch && matchesDate && matchesStatus
    })
  }

  const filteredRecords = getFilteredRecords()

  // Calculate stats
  const todayRecords = flattenedRecords.filter(r => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(r.date).toDateString() === today.toDateString()
  })

  const stats = {
    totalRecords: flattenedRecords.length,
    todayCount: todayRecords.length,
    presentToday: todayRecords.filter(r => r.status === 'present').length,
    uniqueUsers: new Set(flattenedRecords.map(r => r.userId)).size,
  }

  const formatTime = (timeIn: string | undefined, timestamp: any) => {
    if (timeIn) return timeIn
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    return "N/A"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Attendance Records
          </h1>
          <p className="text-muted-foreground mt-1">View and manage all teacher attendance with timestamps</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="w-fit"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold dark:text-white">{stats.totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Check-ins</p>
                <p className="text-2xl font-bold text-green-600">{stats.todayCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-purple-600">{stats.presentToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-orange-600">{stats.uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="dark:bg-slate-800/50 border-0 shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Attendance Log
          </CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {flattenedRecords.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium dark:text-white">No attendance records found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Attendance records will appear here once teachers start marking their attendance.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead>Teacher</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.slice(0, 50).map((record, index) => (
                    <TableRow key={`${record.userId}-${record.date}-${index}`} className="border-slate-200 dark:border-slate-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {record.userPhoto && <img src={record.userPhoto} alt={record.userName} />}
                            <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              {record.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium dark:text-white">{record.userName}</p>
                            <p className="text-xs text-muted-foreground">{record.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium dark:text-white">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm dark:text-white">
                            {formatTime(record.timeIn, record.timestamp)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.location ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">
                              {Math.round(record.location.distance)}m away
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            record.status === 'present'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }
                        >
                          {record.status === 'present' ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/stats?userId=${record.userId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredRecords.length > 50 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Showing first 50 records. Use filters to narrow down results.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
