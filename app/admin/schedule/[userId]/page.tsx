"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getTeacherSchedule, updateTeacherSchedule } from "@/lib/firebase/firestore"
import { doc, getDoc, getFirestore } from "firebase/firestore" 
import { getFirebaseApp } from "@/lib/firebase/config"
import { UserData } from "@/lib/firebase/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner" // Assuming sonner is installed, otherwise standard alert

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const PERIODS_COUNT = 9
const TIMINGS = ['08:30-09:30', '09:30-10:30', '10:30-10:50 (Break)', '10:50-11:50', '11:50-12:50', '12:50-13:45 (Lunch)', '13:45-14:40', '14:40-15:35', '15:35-16:30']

export default function ScheduleEditor() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [schedule, setSchedule] = useState<any>(null)
  const [activeDay, setActiveDay] = useState("Monday")

  useEffect(() => {
    async function loadData() {
      try {
        const db = getFirestore(getFirebaseApp())
        
        // Fetch User Details
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setUser(userSnap.data() as UserData)
        }

        // Fetch Schedule
        const scheduleData = await getTeacherSchedule(userId)
        
        if (scheduleData && scheduleData.days) {
          setSchedule(scheduleData)
        } else {
          // Initialize empty schedule
          const emptySchedule = {
            userId,
            days: DAYS.map(day => ({
              name: day,
              periods: Array(PERIODS_COUNT).fill("")
            })),
            updatedAt: null
          }
          setSchedule(emptySchedule)
        }
      } catch (error) {
        console.error("Error loading data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [userId])

  const handlePeriodChange = (dayIndex: number, periodIndex: number, value: string) => {
    const newSchedule = { ...schedule }
    newSchedule.days[dayIndex].periods[periodIndex] = value
    setSchedule(newSchedule)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateTeacherSchedule(userId, schedule)
      alert("Schedule updated successfully!") // Replace with toast if available
    } catch (error) {
      console.error("Failed to save", error)
      alert("Failed to save schedule")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Edit Schedule</h1>
            <p className="text-muted-foreground">
              For {user?.displayName || "Unknown User"} ({user?.teacherId || "No ID"})
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Card className="dark:bg-slate-800/50 dark:border-slate-700">
        <CardHeader>
          <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto h-auto p-2 bg-gray-100 dark:bg-slate-900/50">
              {DAYS.map(day => (
                <TabsTrigger key={day} value={day} className="px-4 py-2">
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {schedule && schedule.days.map((dayData: any, dayIndex: number) => (
              <TabsContent key={dayData.name} value={dayData.name} className="mt-6">
                 <div className="grid gap-4">
                   {dayData.periods.map((subject: string, pIndex: number) => {
                     // Check if it's break or lunch index based on previous logic (usually fixed indices)
                     // In API route: 2 is break (10:30-10:50), 5 is lunch (12:50-13:45) if 0-indexed
                     // Let's use best guess or label from TIMINGS constant
                     const timeLabel = TIMINGS[pIndex] || `Period ${pIndex + 1}`
                     const isBreak = pIndex === 2 || pIndex === 5

                     return (
                       <div key={pIndex} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800">
                         <div className="md:col-span-3">
                           <span className="text-sm font-medium text-muted-foreground block mb-1">Time</span>
                           <span className={`font-semibold ${isBreak ? "text-orange-500" : "dark:text-white"}`}>
                             {timeLabel}
                           </span>
                         </div>
                         <div className="md:col-span-9">
                           <Input 
                             value={subject} 
                             onChange={(e) => handlePeriodChange(dayIndex, pIndex, e.target.value)}
                             placeholder={isBreak ? "Break/Lunch (Optional)" : "Enter Subject / Class"}
                             className={`dark:bg-slate-900 ${isBreak ? "border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10" : ""}`}
                           />
                         </div>
                       </div>
                     )
                   })}
                 </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}
