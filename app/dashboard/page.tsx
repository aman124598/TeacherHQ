"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  MapPin,
  AlertCircle,
  Clock,
  Calendar,
  BookOpen,
  BarChart4,
  FileText,
  CheckCheck,
  Star,
  Plus,
} from "lucide-react"
import TodoList from "@/components/todo-list"
import { calculateDistance } from "@/lib/distance-calculator"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/firebase/AuthContext"
import WelcomeTour from "@/components/welcome-tour"

// Dev account email - shows sample data
const DEV_EMAIL = "dev@example.com"

// Key for storing tour completion in localStorage
const TOUR_COMPLETED_KEY = "tourCompleted"

export default function Dashboard() {
  const router = useRouter()
  const { user, userData, organization, loading } = useAuth()
  const [isLocationVerified, setIsLocationVerified] = useState(false)
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [isWithinRange, setIsWithinRange] = useState(false)
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [collegeLocation, setCollegeLocation] = useState({ latitude: 0, longitude: 0 })
  const [showTour, setShowTour] = useState(false)

  // Check if dev account
  const isDevAccount = user?.email === DEV_EMAIL

  // Attendance stats - only show for dev account or fetch real data
  const attendanceStats = isDevAccount 
    ? { present: 15, absent: 3, total: 18, percentage: Math.round((15 / 18) * 100) }
    : { present: 0, absent: 0, total: 0, percentage: 0 }

  // Get display name from Firebase user
  const displayName = userData?.displayName || user?.displayName || "Teacher"

  useEffect(() => {
    setIsMounted(true)

    // Load upcoming events from Firestore
    async function loadUpcomingEvents() {
      if (!user) return
      
      try {
        const { getUserEvents, getTasksForUser } = await import("@/lib/firebase/firestore")
        
        // Load personal events
        const events = await getUserEvents(user.uid)
        const parsedEvents = events.map((event: any) => ({
          ...event,
          date: event.date.seconds ? new Date(event.date.seconds * 1000) : new Date(event.date),
        }))

        // Load admin-assigned tasks
        const tasks = await getTasksForUser(user.uid)
        const parsedTasks = tasks.map((task: any) => ({
          ...task,
          date: task.dueDate?.seconds ? new Date(task.dueDate.seconds * 1000) : (task.dueDate ? new Date(task.dueDate) : new Date()),
          type: task.type || "task"
        }))

        const allEvents = [...parsedEvents, ...parsedTasks]

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = allEvents
          .filter((event: any) => {
            const eventDate = new Date(event.date)
            eventDate.setHours(0, 0, 0, 0)
            return eventDate >= today
          })
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3)

        setUpcomingEvents(upcoming)
      } catch (error) {
        console.error("Error loading events:", error)
      }
    }

    if (user) {
      loadUpcomingEvents()
    }

    // Fetch college location from API
    const fetchCollegeLocation = async () => {
      try {
        const response = await fetch('/api/config/location')
        const data = await response.json()
        if (data.success) {
          setCollegeLocation(data.location)
        }
      } catch (error) {
        console.error('Error fetching college location:', error)
        setCollegeLocation({ latitude: 13.072204074042398, longitude: 77.50754474895987 })
      }
    }

    fetchCollegeLocation()

    // Check if user should see the tour (new users only)
    if (user?.uid) {
      const userTourKey = `${TOUR_COMPLETED_KEY}_${user.uid}`
      const tourCompleted = localStorage.getItem(userTourKey)
      if (!tourCompleted) {
        // New user - show tour
        setShowTour(true)
      }
    }
  }, [isDevAccount, user])

  // Return greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getLocation = () => {
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude

        const { distanceInMeters, isWithinRange } = calculateDistance(
          userLat,
          userLng,
          collegeLocation.latitude,
          collegeLocation.longitude,
        )

        setCurrentLocation({
          latitude: userLat,
          longitude: userLng,
          distance: distanceInMeters,
        })

        setIsWithinRange(isWithinRange)
        setIsLocationVerified(true)
      },
      (error) => {
        setLocationError(error.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  const handleAttendanceSubmit = async () => {
    if (!isLocationVerified || !isWithinRange) {
      setAttendanceStatus("location-error")
      return
    }

    setIsMarkingAttendance(true)
    setAttendanceStatus(null)

    try {
      const response = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid,
          timestamp: new Date().toISOString(),
          location: currentLocation,
          organizationId: userData?.organizationId || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAttendanceMarked(true)
        setAttendanceStatus("success")
      } else {
        setAttendanceStatus("error")
      }
    } catch (error) {
      console.error("Error marking attendance", error)
      setAttendanceStatus("error")
    } finally {
      setIsMarkingAttendance(false)
    }
  }

  // Handle tour completion
  const handleTourComplete = () => {
    if (user?.uid) {
      const userTourKey = `${TOUR_COMPLETED_KEY}_${user.uid}`
      localStorage.setItem(userTourKey, 'true')
    }
    setShowTour(false)
  }

  // Handle tour skip
  const handleTourSkip = () => {
    if (user?.uid) {
      const userTourKey = `${TOUR_COMPLETED_KEY}_${user.uid}`
      localStorage.setItem(userTourKey, 'true')
    }
    setShowTour(false)
  }

  // Get badge color based on event type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
      case "meeting":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "holiday":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
      case "other":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800"
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800"
    }
  }

  if (!isMounted) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Welcome Tour for new users */}
      {showTour && (
        <WelcomeTour 
          userName={displayName}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}

      <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Welcome Card */}
        <Card className="md:col-span-2 hover-card border-l-4 border-l-purple-500 dark:border-l-purple-400 dark:bg-slate-800/50 dark:border-slate-700 shadow-premium backdrop-blur-sm bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-slate-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold text-purple-700 dark:text-white">
              {getGreeting()}, {displayName}!
            </CardTitle>
            <CardDescription className="dark:text-slate-400 text-base">Here's an overview of your day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col p-3 rounded-lg bg-blue-50/50 dark:bg-slate-700/30 hover-lift">
                <span className="text-xs text-muted-foreground flex items-center mb-1">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" /> Date
                </span>
                <span className="font-semibold text-sm">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-purple-50/50 dark:bg-slate-700/30 hover-lift">
                <span className="text-xs text-muted-foreground flex items-center mb-1">
                  <Clock className="h-3.5 w-3.5 mr-1 text-purple-600 dark:text-purple-400" /> Time
                </span>
                <span className="font-semibold text-sm">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-green-50/50 dark:bg-slate-700/30 hover-lift">
                <span className="text-xs text-muted-foreground flex items-center mb-1">
                  <BookOpen className="h-3.5 w-3.5 mr-1 text-green-600 dark:text-green-400" /> Status
                </span>
                <span className="font-semibold text-sm">{attendanceMarked ? "Present" : "Not Marked"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Stats Card */}
        <Card className="hover-card border-l-4 border-l-green-500 dark:bg-slate-800/50 shadow-premium backdrop-blur-sm bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-slate-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-bold">
              <BarChart4 className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Attendance Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceStats.total > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-50/50 dark:bg-slate-700/30">
                  <span className="text-sm font-medium">Present Days</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-lg">{attendanceStats.present}</span>
                </div>
                <Progress value={attendanceStats.percentage} className="h-3 bg-green-100 dark:bg-slate-700" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{attendanceStats.percentage}% Attendance</span>
                  <span className="text-muted-foreground font-medium">
                    {attendanceStats.present}/{attendanceStats.total} Days
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <BarChart4 className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No attendance data yet</p>
                <p className="text-xs text-muted-foreground mt-1">Mark your first attendance below</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Location Verification Card */}
        <Card className="hover-card dark:bg-slate-800/50 shadow-premium backdrop-blur-sm bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center font-bold">
              <MapPin className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
              Location Verification
            </CardTitle>
            <CardDescription className="text-base">Verify your location to mark attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              onClick={getLocation} 
              className="w-full flex items-center justify-center h-11 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700 font-semibold transition-all duration-200 hover-lift"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Verify My Location
            </Button>

            {locationError && (
              <Alert variant="destructive" className="animate-slide-up shadow-md">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            {currentLocation && (
              <Alert
                variant={isWithinRange ? "default" : "destructive"}
                className={isWithinRange ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 shadow-md animate-slide-up" : "shadow-md animate-slide-up"}
              >
                {isWithinRange ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    <AlertDescription className="font-medium">
                      You are within the college premises ({Math.round(currentLocation.distance)}m from center)
                    </AlertDescription>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <AlertDescription className="font-medium">
                      You must be within 700 meters of the college to mark attendance. Current distance:{" "}
                      {Math.round(currentLocation.distance)}m
                    </AlertDescription>
                  </div>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Mark Attendance Card */}
        <Card
          className={`hover-card dark:bg-slate-800/50 shadow-premium backdrop-blur-sm transition-all duration-300 ${
            isWithinRange 
              ? "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20 border-2 border-green-300 dark:border-green-700" 
              : "bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-800/50"
          }`}
        >
          <CardHeader>
            <CardTitle className="font-bold">Mark Your Attendance</CardTitle>
            <CardDescription className="text-base">Record your presence for today</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            <Button
              className={`w-full max-w-xs h-12 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 btn-glow ${
                isWithinRange 
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                  : ""
              }`}
              disabled={!isLocationVerified || !isWithinRange || isMarkingAttendance || attendanceMarked}
              onClick={handleAttendanceSubmit}
            >
              {isMarkingAttendance ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>Processing...</span>
                </div>
              ) : attendanceMarked ? (
                <>
                  <CheckCheck className="mr-2 h-5 w-5" />
                  Attendance Marked
                </>
              ) : (
                "Mark Attendance"
              )}
            </Button>

            <p className="text-sm font-medium mt-4 text-center px-4">
              {!isLocationVerified
                ? "Please verify your location first"
                : !isWithinRange
                  ? "You must be within college premises"
                  : attendanceMarked
                    ? "Your attendance has been recorded for today!"
                    : "Click to record your attendance for today"}
            </p>

            {attendanceStatus === "success" && (
              <Alert className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 shadow-md animate-slide-up">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="font-medium">Attendance marked successfully!</AlertDescription>
              </Alert>
            )}

            {attendanceStatus === "error" && (
              <Alert variant="destructive" className="mt-4 shadow-md animate-slide-up">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-medium">Failed to mark attendance. Please try again.</AlertDescription>
              </Alert>
            )}

            {attendanceStatus === "location-error" && (
              <Alert variant="destructive" className="mt-4 shadow-md animate-slide-up">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-medium">You must be within college premises to mark attendance!</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Events Card */}
        <Card className="hover-card border-l-4 border-l-yellow-500 dark:bg-slate-800/50 shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-bold">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Star className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-purple-600"
                  onClick={() => router.push("/important-dates")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          event.type === "exam"
                            ? "bg-red-500"
                            : event.type === "meeting"
                              ? "bg-blue-500"
                              : event.type === "holiday"
                                ? "bg-green-500"
                                : "bg-purple-500"
                        }`}
                      ></div>
                      <span className="text-sm">{event.title}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-2">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className={`px-1.5 py-0.5 rounded text-xs ${getBadgeColor(event.type)}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-blue-600"
                  onClick={() => router.push("/important-dates")}
                >
                  View All Events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="todo" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="todo" className="flex items-center">
                <CheckCheck className="h-4 w-4 mr-2" />
                My Tasks
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Today's Schedule
              </TabsTrigger>
            </TabsList>
            <TabsContent value="todo" className="mt-4">
              <Card className="dark:bg-slate-800/50">
                <CardHeader>
                  <CardTitle>Todo List</CardTitle>
                  <CardDescription>Manage your tasks for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <TodoList />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="schedule" className="mt-4">
              <Card className="dark:bg-slate-800/50">
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Your classes for today</CardDescription>
                </CardHeader>
                <CardContent>
                  {isDevAccount ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">Time</th>
                            <th className="border p-2 text-left">Subject</th>
                            <th className="border p-2 text-left">Room</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2">8:30 AM - 9:30 AM</td>
                            <td className="border p-2">Computer Science</td>
                            <td className="border p-2">Room 101</td>
                          </tr>
                          <tr>
                            <td className="border p-2">9:30 AM - 10:30 AM</td>
                            <td className="border p-2">Mathematics</td>
                            <td className="border p-2">Room 203</td>
                          </tr>
                          <tr>
                            <td className="border p-2">10:30 AM - 10:50 AM</td>
                            <td className="border p-2 text-muted-foreground italic">Short Break</td>
                            <td className="border p-2">-</td>
                          </tr>
                          <tr>
                            <td className="border p-2">10:50 AM - 11:50 AM</td>
                            <td className="border p-2">Physics</td>
                            <td className="border p-2">Lab 3</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">No classes scheduled for today</p>
                      <p className="text-sm text-muted-foreground mt-1">Your schedule will appear here once added</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.push("/schedule")}>
                    View Full Schedule
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button
          className="h-auto py-6 bg-gradient-blue hover:opacity-90 shadow-md"
          onClick={() => router.push("/statistics")}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg font-medium">View Attendance Statistics</span>
            <span className="text-sm opacity-80 mt-1">Check your attendance records</span>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-6 hover-card border border-yellow-200 dark:border-yellow-700"
          onClick={() => router.push("/important-dates")}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg font-medium flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Important Dates
            </span>
            <span className="text-sm opacity-80 mt-1">Mark and track important events</span>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-6 hover-card border border-blue-200 dark:border-blue-700"
          onClick={() => router.push("/notes")}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Generate Short Notes
            </span>
            <span className="text-sm opacity-80 mt-1">Upload PDFs and get concise notes</span>
          </div>
        </Button>
      </div>
      </div>
    </>
  )
}
