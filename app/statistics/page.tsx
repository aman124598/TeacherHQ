"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart4, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function Statistics() {
  const router = useRouter()
  const [teacher, setTeacher] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Sample attendance data - in a real app, this would come from an API
  const attendanceData = {
    present: 15,
    absent: 3,
    leaveLeft: 12,
    totalWorkingDays: 240,
    totalLeaves: 15,
    monthlyData: [
      { month: "Jan", present: 20, absent: 2 },
      { month: "Feb", present: 18, absent: 4 },
      { month: "Mar", present: 22, absent: 0 },
      { month: "Apr", present: 15, absent: 3 },
    ],
  }

  useEffect(() => {
    setIsMounted(true)
    // Get teacher data from localStorage
    const teacherData = localStorage.getItem("teacherData")
    if (!teacherData) {
      router.push("/")
      return
    }

    setTeacher(JSON.parse(teacherData))
  }, [router])

  if (!isMounted) return null

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-gradient-green rounded-xl mr-4 shadow-lg">
          <BarChart4 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Attendance Statistics
          </h1>
          <p className="text-muted-foreground">Track your attendance performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover-card border-l-4 border-l-blue-500 dark:bg-slate-800/50 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Present Days</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold dark:text-white">{attendanceData.present}</div>
            <Progress
              value={(attendanceData.present / (attendanceData.present + attendanceData.absent)) * 100}
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>

        <Card className="hover-card border-l-4 border-l-red-500 dark:bg-slate-800/50 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Absent Days</span>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold dark:text-white">{attendanceData.absent}</div>
            <Progress
              value={(attendanceData.absent / (attendanceData.present + attendanceData.absent)) * 100}
              className="h-1.5 mt-2 bg-red-100 dark:bg-red-900/30"
            />
          </CardContent>
        </Card>

        <Card className="hover-card border-l-4 border-l-green-500 dark:bg-slate-800/50 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Attendance Rate</span>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold dark:text-white">
              {Math.round((attendanceData.present / (attendanceData.present + attendanceData.absent)) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {attendanceData.present} out of {attendanceData.present + attendanceData.absent} days
            </div>
          </CardContent>
        </Card>

        <Card className="hover-card border-l-4 border-l-purple-500 dark:bg-slate-800/50 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Leaves Left</span>
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold dark:text-white">{attendanceData.leaveLeft}</div>
            <div className="text-sm text-muted-foreground mt-2">Out of {attendanceData.totalLeaves} allowed</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover-card dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Monthly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {attendanceData.monthlyData.map((month, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium dark:text-slate-200">{month.month}</span>
                    <div className="text-sm text-muted-foreground">
                      {month.present} present, {month.absent} absent
                    </div>
                  </div>
                  <div className="flex h-2 mb-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 rounded-l-full"
                      style={{ width: `${(month.present / (month.present + month.absent)) * 100}%` }}
                    />
                    <div
                      className="bg-red-400"
                      style={{ width: `${(month.absent / (month.present + month.absent)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-card dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Monthly Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className={`h-10 rounded-md flex items-center justify-center text-sm font-medium ${
                    i % 7 === 0 || i % 7 === 6
                      ? "bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500" // Weekend
                      : i % 3 === 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400" // Absent
                        : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400" // Present
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 hover-card dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center dark:text-slate-200">
                  <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-2"></span>
                  Present Days
                </span>
                <span className="dark:text-white">{attendanceData.present}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{
                    width: `${(attendanceData.present / (attendanceData.present + attendanceData.absent + attendanceData.leaveLeft)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center dark:text-slate-200">
                  <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-2"></span>
                  Absent Days
                </span>
                <span className="dark:text-white">{attendanceData.absent}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{
                    width: `${(attendanceData.absent / (attendanceData.present + attendanceData.absent + attendanceData.leaveLeft)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center dark:text-slate-200">
                  <span className="w-3 h-3 bg-blue-500 rounded-full inline-block mr-2"></span>
                  Leave Left
                </span>
                <span className="dark:text-white">{attendanceData.leaveLeft}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{
                    width: `${(attendanceData.leaveLeft / (attendanceData.present + attendanceData.absent + attendanceData.leaveLeft)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
