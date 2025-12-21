"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart4, Users, Calendar, TrendingUp, ArrowLeft, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"
import { getAttendanceStats, getUserById, getAllUsers, getAllAttendance } from "@/lib/firebase/firestore"
import { UserData } from "@/lib/firebase/auth"

function StatsContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [globalStats, setGlobalStats] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      
      if (userId) {
        // Load specific user stats
        const [userData, attendanceData] = await Promise.all([
          getUserById(userId),
          getAttendanceStats(userId)
        ])
        setUser(userData)
        setStats(attendanceData)
      } else {
        // Load global stats
        const [allUsers, allAttendance] = await Promise.all([
          getAllUsers(),
          getAllAttendance()
        ])
        
        // Calculate global statistics
        let totalPresent = 0
        let totalAbsent = 0
        let totalRecords = allAttendance.length
        
        allAttendance.forEach((record: any) => {
          totalPresent += record.present || 0
          totalAbsent += record.absent || 0
        })
        
        setGlobalStats({
          totalUsers: allUsers.length,
          totalRecords,
          totalPresent,
          totalAbsent,
          attendanceRate: totalPresent + totalAbsent > 0 
            ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) 
            : 0
        })
      }
      
      setLoading(false)
    }
    loadData()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Global Statistics View
  if (!userId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Global Statistics
          </h1>
          <p className="text-muted-foreground mt-1">System-wide attendance overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold dark:text-white">{globalStats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Present</p>
                  <p className="text-3xl font-bold text-green-600">{globalStats?.totalPresent || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                  <BarChart4 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Absent</p>
                  <p className="text-3xl font-bold text-red-600">{globalStats?.totalAbsent || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="text-3xl font-bold dark:text-white">{globalStats?.attendanceRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>Select a specific user from the "Manage Users" page to view their detailed attendance report.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <Link href="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Go to User Management
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Individual User Statistics View
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            User Statistics
          </h1>
          <p className="text-muted-foreground mt-1">
            Stats for {user?.displayName || "Unknown User"} ({user?.email || ""})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Days Present</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{stats?.present || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center">
                <BarChart4 className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Days Absent</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{stats?.absent || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Total Days</p>
              <p className="text-4xl font-bold dark:text-white mt-2">{stats?.total || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Recent attendance records for this user</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.history && stats.history.length > 0 ? (
            <div className="space-y-2">
              {stats.history.map((record: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-700">
                  <span className="dark:text-white">{record.date}</span>
                  <span className={`font-medium ${record.status === 'present' ? 'text-green-600' : 'text-red-600'}`}>
                    {record.status === 'present' ? 'Present' : 'Absent'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No attendance history available yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium dark:text-white">{user?.displayName || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium dark:text-white">{user?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teacher ID</p>
              <p className="font-medium dark:text-white">{user?.teacherId || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium dark:text-white">{user?.department || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminStatsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <StatsContent />
    </Suspense>
  )
}
