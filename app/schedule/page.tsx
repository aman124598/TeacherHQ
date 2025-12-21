"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function Schedule() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDay, setCurrentDay] = useState("")

  useEffect(() => {
    // Set current day
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    setCurrentDay(days[new Date().getDay()])
  }, [])

  useEffect(() => {
    async function fetchSchedule() {
      if (authLoading) return
      
      if (!user) {
        router.push("/")
        return
      }

      try {
        setLoading(true)
        // Dynamically import to separate firebase logic if needed, or just import at top
        const { getTeacherSchedule } = await import("@/lib/firebase/firestore")
        const data = await getTeacherSchedule(user.uid)
        setSchedule(data)
      } catch (err: any) {
        console.error("Error fetching schedule:", err)
        setError("Failed to fetch schedule")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSchedule()
  }, [user, authLoading, router])

  if (authLoading) return <div className="p-8 text-center">Loading authentication...</div>

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-gradient-purple rounded-xl mr-4 shadow-lg">
          <Calendar className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Weekly Schedule
          </h1>
          <p className="text-muted-foreground">View your class timetable</p>
        </div>
      </div>

      <Card className="hover-card dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-b dark:border-slate-700">
          <CardTitle className="flex items-center justify-between">
            <span className="dark:text-white">Class Timetable</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800">
              Today: {currentDay}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : !schedule || !schedule.days ? (
            <div className="p-6">
              <Alert>
                <AlertDescription>No schedule data available. Ask your admin to assign a schedule.</AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 dark:bg-slate-800">
                    <TableHead className="font-medium dark:text-slate-300">Day</TableHead>
                    <TableHead className="dark:text-slate-300">8:30 - 9:30</TableHead>
                    <TableHead className="dark:text-slate-300">9:30 - 10:30</TableHead>
                    <TableHead className="dark:text-slate-300">10:30 - 10:50</TableHead>
                    <TableHead className="dark:text-slate-300">10:50 - 11:50</TableHead>
                    <TableHead className="dark:text-slate-300">11:50 - 12:50</TableHead>
                    <TableHead className="dark:text-slate-300">12:50 - 1:45</TableHead>
                    <TableHead className="dark:text-slate-300">1:45 - 2:40</TableHead>
                    <TableHead className="dark:text-slate-300">2:40 - 3:35</TableHead>
                    <TableHead className="dark:text-slate-300">3:35 - 4:30</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.days.map((daySchedule: any, dayIndex: number) => (
                    <TableRow 
                      key={dayIndex} 
                      className={daySchedule.name === currentDay 
                        ? "bg-blue-50/50 dark:bg-blue-900/20" 
                        : "dark:border-slate-700"
                      }
                    >
                      <TableCell className="font-medium dark:text-slate-200">
                        {daySchedule.name === currentDay ? (
                          <span className="flex items-center">
                            {daySchedule.name}
                            <Badge className="ml-2 bg-blue-500 dark:bg-blue-600">Today</Badge>
                          </span>
                        ) : (
                          daySchedule.name
                        )}
                      </TableCell>
                      {daySchedule.periods.map((subject: string, periodIndex: number) => (
                        <TableCell
                          key={periodIndex}
                          className={`dark:text-slate-300
                            ${periodIndex === 2 || periodIndex === 5 
                              ? "bg-gray-50/50 dark:bg-slate-700/50" 
                              : ""
                            }
                            ${daySchedule.name === currentDay 
                              ? "border-blue-100 dark:border-blue-900/30" 
                              : ""
                            }
                          `}
                        >
                          {periodIndex === 2 ? (
                            <span className="text-muted-foreground italic">Break</span>
                          ) : periodIndex === 5 ? (
                            <span className="text-muted-foreground italic">Lunch</span>
                          ) : (
                            subject || "Free"
                          )}
                        </TableCell>
                      ))}
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
