"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Mail,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  ArrowLeft,
  BarChart4,
  Loader2,
  Shield,
  Phone,
  Briefcase,
} from "lucide-react"
import { useAuth } from "@/lib/firebase/AuthContext"
import { getUserAttendanceHistory, updateUser, getUserActivityLogs, ActivityLog } from "@/lib/firebase/firestore"
import Header from "@/components/header"

interface AttendanceRecord {
  date: string
  timeIn: string
  status: string
  location?: {
    latitude: number
    longitude: number
    distance: number
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, userData, organization, loading, refreshUserData } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [attendanceData, setAttendanceData] = useState<{
    presentDays: number
    absentDays: number
    totalDays: number
    records: AttendanceRecord[]
    lastMarked: any
  } | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Form state for editing
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    department: "",
    teacherId: "",
  })

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || "",
        phone: (userData as any).phone || "",
        department: (userData as any).department || "",
        teacherId: (userData as any).teacherId || "",
      })
    }
  }, [userData])

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return

      setLoadingData(true)
      try {
        const [attendance, logs] = await Promise.all([
          getUserAttendanceHistory(user.uid),
          getUserActivityLogs(user.uid, 10)
        ])

        if (attendance) {
          setAttendanceData(attendance as any)
        }
        setActivityLogs(logs)
      } catch (error) {
        console.error("Error loading profile data:", error)
      }
      setLoadingData(false)
    }

    if (user?.uid) {
      loadData()
    }
  }, [user?.uid])

  const handleSaveProfile = async () => {
    if (!user?.uid) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const result = await updateUser(user.uid, {
        displayName: formData.displayName,
        phone: formData.phone,
        department: formData.department,
        teacherId: formData.teacherId,
      } as any)

      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
        setIsEditing(false)
        await refreshUserData()
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setSaveMessage({ type: 'error', text: 'An error occurred while saving.' })
    }

    setIsSaving(false)
  }

  const calculateAttendancePercentage = () => {
    if (!attendanceData || attendanceData.totalDays === 0) return 0
    return Math.round((attendanceData.presentDays / attendanceData.totalDays) * 100)
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
  }

  const displayName = userData?.displayName || user?.displayName || "User"
  const photoURL = user?.photoURL
  const userInitial = displayName.charAt(0).toUpperCase()
  const attendancePercentage = calculateAttendancePercentage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-white/50 dark:hover:bg-slate-800/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl">
          <div className="h-32 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <CardContent className="relative pt-0 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-800 shadow-xl bg-white dark:bg-slate-700">
                {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-3">
                  <h1 className="text-3xl font-bold dark:text-white">{displayName}</h1>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      {userData?.role === 'admin' ? 'Administrator' : 'Teacher'}
                    </Badge>
                    {userData?.organizationRole === 'admin' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        <Shield className="h-3 w-3 mr-1" />
                        Org Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>
                {organization && (
                  <p className="text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-2">
                    <Building2 className="h-4 w-4" />
                    {organization.name}
                  </p>
                )}
              </div>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={isSaving}
                className={isEditing ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : ""}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isEditing ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Edit3 className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {saveMessage && (
          <Alert
            className={`mb-6 ${saveMessage.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={saveMessage.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
              {saveMessage.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-500" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium dark:text-white mt-1">{displayName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <p className="text-lg font-medium dark:text-white mt-1">{user?.email || "Not set"}</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium dark:text-white mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {(userData as any)?.phone || "Not set"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="teacherId">Teacher ID</Label>
                    {isEditing ? (
                      <Input
                        id="teacherId"
                        value={formData.teacherId}
                        onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                        placeholder="Enter teacher ID"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium dark:text-white mt-1">
                        {(userData as any)?.teacherId || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Enter department"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-lg font-medium dark:text-white mt-1">
                        {(userData as any)?.department || "Not set"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Organization</Label>
                    <p className="text-lg font-medium dark:text-white mt-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {organization?.name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <p className="text-lg font-medium dark:text-white mt-1 capitalize">
                      {userData?.role || "Teacher"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Summary Card */}
            <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-green-500" />
                  Attendance Summary
                </CardTitle>
                <CardDescription>Your attendance overview this period</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <p className="text-sm text-muted-foreground mb-1">Present Days</p>
                      <p className="text-4xl font-bold text-green-600">{attendanceData?.presentDays || 0}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
                      <p className="text-sm text-muted-foreground mb-1">Absent Days</p>
                      <p className="text-4xl font-bold text-red-600">{attendanceData?.absentDays || 0}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                      <p className="text-4xl font-bold text-blue-600">{attendanceData?.totalDays || 0}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                      <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                      <p className="text-4xl font-bold text-purple-600">{attendancePercentage}%</p>
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Attendance Progress</span>
                    <span className="font-medium">{attendancePercentage}%</span>
                  </div>
                  <Progress value={attendancePercentage} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Attendance History
                </CardTitle>
                <CardDescription>Your detailed attendance records with timestamps</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : attendanceData?.records && attendanceData.records.length > 0 ? (
                  <div className="space-y-3">
                    {attendanceData.records
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((record, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${record.status === 'present' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                              {record.status === 'present' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold dark:text-white">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  Check-in: {record.timeIn || "N/A"}
                                </span>
                                {record.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {Math.round(record.location.distance)}m from center
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`mt-2 md:mt-0 ${
                              record.status === 'present'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium dark:text-white">No attendance records yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your attendance history will appear here once you start marking attendance.
                    </p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-600"
                      onClick={() => router.push('/dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="dark:bg-slate-800/50 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your recent actions and activities</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : activityLogs.length > 0 ? (
                  <div className="space-y-4">
                    {activityLogs.map((log, index) => (
                      <div
                        key={log.id || index}
                        className="flex items-start gap-4 p-4 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                          {log.action === 'attendance_marked' ? (
                            <CheckCircle2 className="h-4 w-4 text-purple-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium dark:text-white capitalize">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatTimestamp(log.timestamp)}
                          </p>
                          {log.details && (
                            <div className="mt-2 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                              {log.details.date && <span>Date: {log.details.date}</span>}
                              {log.details.time && <span className="ml-2">Time: {log.details.time}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium dark:text-white">No activity yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your activity log will appear here as you use the system.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
