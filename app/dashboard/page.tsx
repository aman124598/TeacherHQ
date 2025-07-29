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
} from "lucide-react"
import TodoList from "@/components/todo-list"
import { calculateDistance } from "@/lib/distance-calculator"
import { Progress } from "@/components/ui/progress"

const COLLEGE_LOCATION = {
  latitude: 13.072204074042398,
  longitude: 77.50754474895987,
}

export default function Dashboard() {
  const router = useRouter()
  const [teacher, setTeacher] = useState<any>(null)
  const [isLocationVerified, setIsLocationVerified] = useState(false)
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [isWithinRange, setIsWithinRange] = useState(false)
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])

  // Sample attendance stats
  const attendanceStats = {
    present: 15,
    absent: 3,
    total: 18,
    percentage: Math.round((15 / 18) * 100),
  }

  useEffect(() => {
    setIsMounted(true)
    
    // Ensure we're on the client side
    if (typeof window === 'undefined') return
    
    // Get teacher data from localStorage
    const teacherData = localStorage.getItem("teacherData")
    if (!teacherData) {
      // Clear authentication cookie if no teacher data
      document.cookie = "teacher_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      router.push("/")
      return
    }

    setTeacher(JSON.parse(teacherData))

    // Load upcoming events
    const savedDates = localStorage.getItem("importantDates")
    if (savedDates) {
      const parsedDates = JSON.parse(savedDates).map((date: any) => ({
        ...date,
        date: new Date(date.date),
      }))

      // Filter for upcoming events (today and future)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcoming = parsedDates
        .filter((event: any) => {
          const eventDate = new Date(event.date)
          eventDate.setHours(0, 0, 0, 0)
          return eventDate >= today
        })
        .sort((a: any, b: any) => a.date - b.date)
        .slice(0, 3) // Get only the next 3 events

      setUpcomingEvents(upcoming)
    }
  }, [router])

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

        // Calculate distance from college
        const { distanceInMeters, isWithinRange } = calculateDistance(
          userLat,
          userLng,
          COLLEGE_LOCATION.latitude,
          COLLEGE_LOCATION.longitude,
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
          userId: teacher?.Id,
          timestamp: new Date().toISOString(),
          location: currentLocation,
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

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Welcome Card */}
        <Card className="md:col-span-2 hover-card border-l-4 border-l-blue-500 dark:border-l-blue-400 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl dark:text-white">Welcome back, {teacher?.Name || "Teacher"}!</CardTitle>
            <CardDescription className="dark:text-slate-400">Here's an overview of your day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Date
                </span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> Time
                </span>
                <span className="font-medium">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" /> Classes Today
                </span>
                <span className="font-medium">4 Classes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Stats Card */}
        <Card className="hover-card border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <BarChart4 className="h-5 w-5 mr-2 text-green-600" />
              Attendance Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Present Days</span>
                <span className="font-medium text-green-600">{attendanceStats.present}</span>
              </div>
              <Progress value={attendanceStats.percentage} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{attendanceStats.percentage}% Attendance</span>
                <span className="text-muted-foreground">
                  {attendanceStats.present}/{attendanceStats.total} Days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Location Verification Card */}
        <Card className="hover-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Location Verification
            </CardTitle>
            <CardDescription>Verify your location to mark attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={getLocation} className="w-full flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-2" />
              Verify My Location
            </Button>

            {locationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            {currentLocation && (
              <Alert
                variant={isWithinRange ? "default" : "destructive"}
                className={isWithinRange ? "bg-green-50 text-green-800 border-green-200" : ""}
              >
                {isWithinRange ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <AlertDescription>
                      You are within the college premises ({Math.round(currentLocation.distance)}m from center)
                    </AlertDescription>
                  </div>
                ) : (
                  <div>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You must be within 500 meters of the college to mark attendance. Current distance:{" "}
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
          className={`hover-card ${isWithinRange ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200" : ""}`}
        >
          <CardHeader>
            <CardTitle>Mark Your Attendance</CardTitle>
            <CardDescription>Record your presence for today</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            <Button
              className={`w-full max-w-xs ${isWithinRange ? "bg-green-600 hover:bg-green-700" : ""}`}
              disabled={!isLocationVerified || !isWithinRange || isMarkingAttendance || attendanceMarked}
              onClick={handleAttendanceSubmit}
            >
              {isMarkingAttendance ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : attendanceMarked ? (
                <>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Attendance Marked
                </>
              ) : (
                "Mark Attendance"
              )}
            </Button>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              {!isLocationVerified
                ? "Please verify your location first"
                : !isWithinRange
                  ? "You must be within college premises"
                  : attendanceMarked
                    ? "Your attendance has been recorded for today!"
                    : "Click to record your attendance for today"}
            </p>

            {attendanceStatus === "success" && (
              <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>Attendance marked successfully!</AlertDescription>
              </Alert>
            )}

            {attendanceStatus === "error" && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to mark attendance. Please try again.</AlertDescription>
              </Alert>
            )}

            {attendanceStatus === "location-error" && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>You must be within college premises to mark attendance!</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Events Card */}
        <Card className="hover-card border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No upcoming events</p>
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
              <Card>
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
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Your classes for today</CardDescription>
                </CardHeader>
                <CardContent>
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
                        {/* This would be populated from the API */}
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
          className="h-auto py-6 hover-card border border-yellow-200"
          onClick={() => router.push("/important-dates")}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg font-medium flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Important Dates
              <Badge className="ml-2 bg-yellow-500 hover:bg-yellow-600">New</Badge>
            </span>
            <span className="text-sm opacity-80 mt-1">Mark and track important events</span>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-6 hover-card border border-blue-200"
          onClick={() => router.push("/notes")}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Generate Short Notes
              <Badge className="ml-2 bg-green-500 hover:bg-green-600">New</Badge>
            </span>
            <span className="text-sm opacity-80 mt-1">Upload PDFs and get concise notes</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
